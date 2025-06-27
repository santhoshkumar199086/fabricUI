import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Network,
  Server,
  Zap,
  BarChart3,
  Settings,
  RefreshCw,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NodeProfileJson from "../../Helpers/nodeProfile.json";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NetworkTopologyApp = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [topologyData, setTopologyData] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [nodes, setNodes] = useState({});
  const [connections, setConnections] = useState([]);
  const [selectedLayout, setSelectedLayout] = useState("auto");
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredConnection, setHoveredConnection] = useState(null);
  const [layoutApplied, setLayoutApplied] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [stats, setStats] = useState({
    nodes: 0,
    connections: 0,
    spine: 0,
    leaf: 0,
  });
  const topologyRef = useRef(null);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [nodeProfile, setNodeProfile] = useState(false);

  const startTelemetry = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`/api/telemetry/start/Telemetry-Topology`);
      if (response && response.status === 200) {
        fetchTopologyData();
        toast.success("Telemetry started successfully!");
        setNodeProfile(true);
      }
    } catch (error) {
      console.error("Error fetching telemetry:", error);
      toast.error("Failed to start telemetry!");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopologyData = async () => {
    try {
      // const response = await axios.get(
      //   `/api/fabric/v1.0.0/ConnectionMatrix/Multi-Vendor-Fabric-Spec-01`
      // );
      const response = await axios.get(
        `/api/fabric/v1.0.0/ConnectionMatrix/Telemetry-Topology`
      );
      const data = response.data;
      const matrixApi = data.response.resource.matrix;

      setTopologyData(matrixApi);
      setIsSuccess(true);
      setShowTelemetry(true);
    } catch (error) {
      console.error("Error fetching topology data:", error);
    }
  };

  // Update container dimensions when topology ref changes
  useEffect(() => {
    const updateDimensions = () => {
      if (topologyRef.current) {
        const { clientWidth, clientHeight } = topologyRef.current;
        setContainerDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, [topologyData]);

  const rawData = `${topologyData}`;

  // Helper function to get node styling based on type
  const getNodeStyling = (nodeType) => {
    switch (nodeType) {
      case "superspine":
        return "bg-gradient-to-r from-purple-600 to-blue-600";
      case "spine":
        return "bg-gradient-to-r from-blue-500 to-purple-500";
      case "leaf":
        return "bg-gradient-to-r from-green-500 to-teal-500";
      case "server":
        return "bg-gradient-to-r from-orange-500 to-red-500";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };

  // Multivendor
  const parseData = useCallback(() => {
    const lines = rawData.split("\n").filter((line) => line.trim() !== "");
    const parsedNodes = {};
    const parsedConnections = [];
    const uniqueConnections = new Map();

    // Helper function to determine node type
    const getNodeType = (deviceName) => {
      if (deviceName.includes("superspine")) return "superspine";
      if (deviceName.includes("spine") && !deviceName.includes("superspine"))
        return "spine";
      if (deviceName.includes("leaf")) return "leaf";
      if (deviceName.includes("generic-node")) return "server";
      return "unknown";
    };

    console.log(`Parsing ${lines.length} lines of topology data`);

    lines.forEach((line, index) => {
      // More flexible regex pattern
      const match = line.match(/^(.+?)\s+(\S+)\s+<--->\s+(.+?)\s+(\S+)$/);

      if (match) {
        const [fullMatch, dev1Raw, port1, dev2Raw, port2] = match;
        const dev1 = dev1Raw.trim();
        const dev2 = dev2Raw.trim();

        // Add nodes
        if (!parsedNodes[dev1]) {
          parsedNodes[dev1] = {
            name: dev1,
            type: getNodeType(dev1),
            position: { x: 0, y: 0 },
            connections: [],
          };
        }
        if (!parsedNodes[dev2]) {
          parsedNodes[dev2] = {
            name: dev2,
            type: getNodeType(dev2),
            position: { x: 0, y: 0 },
            connections: [],
          };
        }

        // Create connection key (alphabetical order for consistency)
        const sortedDevices = [dev1, dev2].sort();
        const connectionKey = `${sortedDevices[0]} <--> ${sortedDevices[1]}`;

        if (!uniqueConnections.has(connectionKey)) {
          const connection = {
            id: `conn_${parsedConnections.length}`,
            from: dev1,
            to: dev2,
            fromPort: port1,
            toPort: port2,
          };

          parsedConnections.push(connection);
          uniqueConnections.set(connectionKey, connection);

          // Add to node connections
          if (!parsedNodes[dev1].connections.includes(dev2)) {
            parsedNodes[dev1].connections.push(dev2);
          }
          if (!parsedNodes[dev2].connections.includes(dev1)) {
            parsedNodes[dev2].connections.push(dev1);
          }
        }
      } else {
        console.warn(`Failed to parse line ${index + 1}: ${line}`);
      }
    });

    console.log(
      `Parsed ${Object.keys(parsedNodes).length} nodes and ${
        parsedConnections.length
      } connections`
    );

    // Log connections involving leaf and server nodes for debugging
    const leafServerConnections = parsedConnections.filter(
      (conn) =>
        (parsedNodes[conn.from]?.type === "leaf" &&
          parsedNodes[conn.to]?.type === "server") ||
        (parsedNodes[conn.from]?.type === "server" &&
          parsedNodes[conn.to]?.type === "leaf")
    );
    console.log(
      `Found ${leafServerConnections.length} leaf-server connections:`,
      leafServerConnections
    );

    setNodes(parsedNodes);
    setConnections(parsedConnections);

    // Update stats
    const superspineCount = Object.values(parsedNodes).filter(
      (n) => n.type === "superspine"
    ).length;
    const spineCount = Object.values(parsedNodes).filter(
      (n) => n.type === "spine"
    ).length;
    const leafCount = Object.values(parsedNodes).filter(
      (n) => n.type === "leaf"
    ).length;
    const serverCount = Object.values(parsedNodes).filter(
      (n) => n.type === "server"
    ).length;

    const finalStats = {
      nodes: Object.keys(parsedNodes).length,
      connections: parsedConnections.length,
      superspine: superspineCount,
      spine: spineCount,
      leaf: leafCount,
      servers: serverCount,
    };

    setStats(finalStats);
    setLayoutApplied(false); // Reset layout applied flag
  }, [rawData]);

  const applyLayout = useCallback(
    (layoutType) => {
      if (
        !containerDimensions.width ||
        !containerDimensions.height ||
        Object.keys(nodes).length === 0
      ) {
        console.log("Cannot apply layout: missing dimensions or nodes");
        return;
      }

      const { width, height } = containerDimensions;

      setNodes((currentNodes) => {
        const superspineNodes = Object.values(currentNodes).filter(
          (n) => n.type === "superspine"
        );
        const spineNodes = Object.values(currentNodes).filter(
          (n) => n.type === "spine"
        );
        const leafNodes = Object.values(currentNodes).filter(
          (n) => n.type === "leaf"
        );
        const serverNodes = Object.values(currentNodes).filter(
          (n) => n.type === "server"
        );

        const updatedNodes = { ...currentNodes };

        switch (layoutType) {
          case "auto":
          case "hierarchical":
            // Calculate better spacing based on container height
            const layerHeight = Math.max(120, height / 5); // Ensure minimum spacing

            // Superspine layer (top)
            superspineNodes.forEach((node, i) => {
              const x = Math.max(
                60,
                (width / (superspineNodes.length + 1)) * (i + 1) - 60
              );
              const y = 30;
              updatedNodes[node.name].position = { x, y };
            });

            // Spine layer
            spineNodes.forEach((node, i) => {
              const x = Math.max(
                60,
                (width / (spineNodes.length + 1)) * (i + 1) - 60
              );
              const y = layerHeight;
              updatedNodes[node.name].position = { x, y };
            });

            // Leaf layer
            leafNodes.forEach((node, i) => {
              const x = Math.max(
                60,
                (width / (leafNodes.length + 1)) * (i + 1) - 60
              );
              const y = layerHeight * 2;
              updatedNodes[node.name].position = { x, y };
            });

            // Server layer
            serverNodes.forEach((node, i) => {
              const x = Math.max(
                60,
                (width / (serverNodes.length + 1)) * (i + 1) - 60
              );
              const y = Math.min(layerHeight * 3.5, height - 80);
              updatedNodes[node.name].position = { x, y };
            });
            break;

          case "circular":
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(width, height) / 3;
            const allNodes = Object.values(currentNodes);

            allNodes.forEach((node, i) => {
              const angle = (2 * Math.PI * i) / allNodes.length;
              const x = centerX + radius * Math.cos(angle) - 60;
              const y = centerY + radius * Math.sin(angle) - 20;
              updatedNodes[node.name].position = {
                x: Math.max(0, x),
                y: Math.max(0, y),
              };
            });
            break;
        }

        console.log(
          `Applied ${layoutType} layout to ${
            Object.keys(updatedNodes).length
          } nodes`
        );
        return updatedNodes;
      });

      setLayoutApplied(true);
    },
    [containerDimensions, nodes]
  );

  const handleMouseDown = (e, nodeName) => {
    e.preventDefault();
    setIsDragging(true);
    setDragNode(nodeName);

    const rect = e.target.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !dragNode || !topologyRef.current) return;

      const container = topologyRef.current;
      const containerRect = container.getBoundingClientRect();

      const x = e.clientX - containerRect.left - dragOffset.x;
      const y = e.clientY - containerRect.top - dragOffset.y;

      const maxX = container.clientWidth - 120;
      const maxY = container.clientHeight - 40;

      const clampedX = Math.max(0, Math.min(maxX, x));
      const clampedY = Math.max(0, Math.min(maxY, y));

      setNodes((prev) => ({
        ...prev,
        [dragNode]: {
          ...prev[dragNode],
          position: { x: clampedX, y: clampedY },
        },
      }));
    },
    [isDragging, dragNode, dragOffset]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragNode(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Parse data when topology data changes
  useEffect(() => {
    if (topologyData) {
      parseData();
    }
  }, [topologyData, parseData]);

  // Apply layout when nodes are available and container dimensions are set
  useEffect(() => {
    if (
      Object.keys(nodes).length > 0 &&
      containerDimensions.width > 0 &&
      !layoutApplied
    ) {
      // Use a longer timeout to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        applyLayout(selectedLayout);
      }, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [nodes, containerDimensions, selectedLayout, layoutApplied, applyLayout]);

  // Apply layout when layout type changes
  useEffect(() => {
    if (Object.keys(nodes).length > 0 && containerDimensions.width > 0) {
      applyLayout(selectedLayout);
    }
  }, [selectedLayout]);

  const topologySpine = async (val) => {
    try {
      const response = await axios.get(`/api/telemetry/device/${val}`);
      navigate('/telemetry', { state: response.data, fromButtonClick: true });
    } catch (error) {
      console.error("Error fetching telemetry:", error);
    }
  };

  const renderConnection = (connection) => {
    const fromNode = nodes[connection.from];
    const toNode = nodes[connection.to];

    if (!fromNode || !toNode) {
      console.warn(
        `Missing nodes for connection ${connection.id}: ${connection.from} -> ${connection.to}`
      );
      return null;
    }

    // Ensure both nodes have valid positions
    if (
      !fromNode.position ||
      !toNode.position ||
      (fromNode.position.x === 0 &&
        fromNode.position.y === 0 &&
        toNode.position.x === 0 &&
        toNode.position.y === 0)
    ) {
      console.warn(`Invalid positions for connection ${connection.id}`);
      return null;
    }

    const fromX = fromNode.position.x + 60; // Center of node
    const fromY = fromNode.position.y + 20;
    const toX = toNode.position.x + 60;
    const toY = toNode.position.y + 20;

    // Debug logging for leaf-server connections
    if (
      (fromNode.type === "leaf" && toNode.type === "server") ||
      (fromNode.type === "server" && toNode.type === "leaf")
    ) {
      console.log(`Rendering ${fromNode.type}-${toNode.type} connection:`, {
        from: { name: fromNode.name, x: fromX, y: fromY },
        to: { name: toNode.name, x: toX, y: toY },
      });
    }

    return (
      <g key={connection.id}>
        <line
          x1={fromX}
          y1={fromY}
          x2={toX}
          y2={toY}
          stroke="url(#connectionGradient)"
          strokeWidth={hoveredConnection === connection.id ? "4" : "3"}
          className="connection-line"
          onMouseEnter={() => setHoveredConnection(connection.id)}
          onMouseLeave={() => setHoveredConnection(null)}
        />
        {hoveredConnection === connection.id && (
          <text
            x={(fromX + toX) / 2}
            y={(fromY + toY) / 2 - 10}
            textAnchor="middle"
            className="fill-white text-xs font-medium"
          >
            {connection.fromPort} ↔ {connection.toPort}
          </text>
        )}
      </g>
    );
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className={`glass-effect rounded-xl p-4`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-300">{value}</div>
          <div className="text-sm text-gray-300">{title}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white p-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Network className="w-10 h-10 text-blue-400 animate-pulse-slow" />
            <h1 className="text-4xl font-bold gradient-text">
              Spine-Leaf Mesh Topology
            </h1>
          </div>
          <p className="text-xl text-gray-300">
            Interactive datacenter fabric visualization
          </p>
        </div>

        <div className="glass-effect rounded-2xl p-1 mb-0">
          <div className="flex flex-wrap justify-center gap-4">
            {!isSuccess && (
              <button
                onClick={fetchTopologyData}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-semibold bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25"
              >
                {isLoading ? "Loading..." : "Generate Topology"}
              </button>
            )}
          </div>

          {/* <div className="flex flex-wrap justify-center gap-4">
            {showTelemetry && (
              <button
                onClick={startTelemetry}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-semibold bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25"
              >
                Start Telemetry
              </button>
            )}
          </div> */}

          <div className="flex flex-wrap justify-center gap-4">
            {showTelemetry && (
              <button
                onClick={startTelemetry}
                disabled={isLoading || nodeProfile}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-semibold bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25 ${
                  isLoading || nodeProfile
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                {isLoading ? "Starting..." : "Start Telemetry"}
              </button>
            )}
          </div>
        </div>

        {topologyData && (
          <>
            {/* Controls */}
            <div className="glass-effect rounded-2xl p-6 mb-8">
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { id: "auto", label: "Auto Layout", icon: Zap },
                  {
                    id: "hierarchical",
                    label: "Hierarchical",
                    icon: BarChart3,
                  },
                  { id: "circular", label: "Circular", icon: RefreshCw },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedLayout(id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-semibold ${
                      selectedLayout === id
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25"
                        : "glass-effect hover:bg-white/20"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Debug Info - Remove in production */}
            {/* <div className="glass-effect rounded-2xl p-4 mb-4 text-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>Nodes: {Object.keys(nodes).length}</div>
                <div>Connections: {connections.length}</div>
                <div>Container: {containerDimensions.width}x{containerDimensions.height}</div>
                <div>Layout Applied: {layoutApplied ? 'Yes' : 'No'}</div>
              </div>
            </div> */}

            {/* Topology Visualization */}
            <div className="glass-effect rounded-2xl p-6 mb-8">
              <div
                ref={topologyRef}
                className="relative w-full h-[500px] md:h-[700px] bg-black/20 rounded-xl border-2 border-white/20 overflow-hidden"
              >
                {/* SVG for connections */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ zIndex: 1 }}
                >
                  <defs>
                    <linearGradient
                      id="connectionGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#ffecd2" />
                      <stop offset="100%" stopColor="#fcb69f" />
                    </linearGradient>
                  </defs>
                  {/* Only render connections if layout has been applied and nodes have valid positions */}
                  {layoutApplied && connections.map(renderConnection)}
                </svg>

                {/* Nodes */}
                {Object.values(nodes).map((node) => (
                  <div
                    key={node.name}
                    className={`absolute draggable-node ${getNodeStyling(
                      node.type
                    )} rounded-xl p-3 min-w-[120px] text-center font-semibold text-sm shadow-lg border-2 border-white/30 hover:shadow-xl hover:shadow-white/20`}
                    style={{
                      left: `${node.position.x}px`,
                      top: `${node.position.y}px`,
                      zIndex: dragNode === node.name ? 200 : 10,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, node.name)}
                  >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Server className="w-4 h-4" />
                      <span className="text-xs font-medium opacity-75">
                        {node.type.toUpperCase()}
                      </span>
                    </div>
                    {/* <div
                      className="text-xs font-bold cursor-pointer hover:text-yellow-300"
                      onClick={() => topologySpine(node.name)}
                      disabled={nodeProfile}
                    >
                      {node.name}
                    </div> */}

                    {/* <div
                      className={`text-xs font-bold cursor-pointer hover:text-yellow-300 ${
                        !nodeProfile ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={
                        nodeProfile ? () => topologySpine(node.name) : undefined
                      }
                    >
                      {node.name}
                    </div> */}
                    {/* <button
                      className="text-xs font-bold hover:text-yellow-300 focus:outline-none"
                      onClick={() => topologySpine(node.name)}
                      disabled={!nodeProfile}
                    >
                      {node.name}
                    </button> */}
                    <button
                      className={`text-xs font-bold focus:outline-none ${
                        nodeProfile
                          ? "text-current hover:text-yellow-300 cursor-pointer"
                          : "text-gray-400 cursor-not-allowed"
                      }`}
                      onClick={() => topologySpine(node.name)}
                      disabled={!nodeProfile}
                    >
                      {node.name}
                    </button>
                  </div>
                ))}
              </div>

              {/* Updated Legend */}
              <div className="flex flex-wrap justify-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-white/30 bg-gradient-to-r from-purple-600 to-blue-600"></div>
                  <span className="text-sm">Superspine Layer</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-white/30 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <span className="text-sm">Spine Layer</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-white/30 bg-gradient-to-r from-green-500 to-teal-500"></div>
                  <span className="text-sm">Leaf Layer</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-white/30 bg-gradient-to-r from-orange-500 to-red-500"></div>
                  <span className="text-sm">Servers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-gradient-to-r from-yellow-200 to-orange-300 rounded"></div>
                  <span className="text-sm">Connections</span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatCard
                icon={Network}
                title="Total Nodes"
                value={stats.nodes}
                color="bg-blue-500"
              />
              <StatCard
                icon={Zap}
                title="Connections"
                value={stats.connections}
                color="bg-green-500"
              />
              <StatCard
                icon={Server}
                title="Spine Switches"
                value={stats.spine}
                color="bg-purple-500"
              />
              <StatCard
                icon={Settings}
                title="Leaf Switches"
                value={stats.leaf}
                color="bg-pink-500"
              />
              <StatCard
                icon={Server}
                title="Servers"
                value={stats.servers}
                color="bg-orange-500"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NetworkTopologyApp;