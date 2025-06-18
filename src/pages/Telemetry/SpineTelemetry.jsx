import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Network,
  Server,
  Zap,
  BarChart3,
  Settings,
  RefreshCw,
} from "lucide-react";
import axios from 'axios';

const NetworkTopologyApp = () => {
  const [nodes, setNodes] = useState({});
  const [connections, setConnections] = useState([]);
  const [selectedLayout, setSelectedLayout] = useState("auto");
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredConnection, setHoveredConnection] = useState(null);
  const [stats, setStats] = useState({
    nodes: 0,
    connections: 0,
    spine: 0,
    leaf: 0,
  });
  const topologyRef = useRef(null);
  const rawData = `blore-leaf-002 Ethernet1/1/2 <---> blore-spine-001 Ethernet1/1/2
    blore-leaf-002 Ethernet1/1/3 <---> blore-spine-002 Ethernet1/1/2
    blore-spine-001 Ethernet1/1/1 <---> blore-leaf-001 Ethernet1/1/2
    blore-spine-001 Ethernet1/1/2 <---> blore-leaf-002 Ethernet1/1/2
    blore-spine-001 Ethernet1/1/3 <---> blore-leaf-003 Ethernet1/1/2
    blore-spine-001 Ethernet1/1/4 <---> blore-leaf-004 Ethernet1/1/2
    blore-leaf-004 Ethernet1/1/2 <---> blore-spine-001 Ethernet1/1/4
    blore-leaf-004 Ethernet1/1/3 <---> blore-spine-002 Ethernet1/1/4
    blore-spine-002 Ethernet1/1/1 <---> blore-leaf-001 Ethernet1/1/3
    blore-spine-002 Ethernet1/1/2 <---> blore-leaf-002 Ethernet1/1/3
    blore-spine-002 Ethernet1/1/3 <---> blore-leaf-003 Ethernet1/1/3
    blore-spine-002 Ethernet1/1/4 <---> blore-leaf-004 Ethernet1/1/3
    blore-leaf-001 Ethernet1/1/2 <---> blore-spine-001 Ethernet1/1/1
    blore-leaf-001 Ethernet1/1/3 <---> blore-spine-002 Ethernet1/1/1
    blore-leaf-003 Ethernet1/1/2 <---> blore-spine-001 Ethernet1/1/3
    blore-leaf-003 Ethernet1/1/3 <---> blore-spine-002 Ethernet1/1/3`;

     /*const rawData = `demo-1-red-leaf-002 Ethernet1/1/2 <---> demo-1-spine-002 Ethernet1/1/4
demo-1-spine-002 Ethernet1/1/2 <---> demo-1-blue-leaf-002 Ethernet1/1/2
demo-1-spine-002 Ethernet1/1/4 <---> demo-1-red-leaf-002 Ethernet1/1/2
demo-1-spine-002 Ethernet1/1/1 <---> demo-1-superspine-001 Ethernet4
demo-1-spine-002 demo-1-spine-002-SPINE_TO_SUPERSPINE-1 <---> demo-1-superspine-002 Ethernet4
demo-1-spine-001 Ethernet1/1/2 <---> demo-1-blue-leaf-001 Ethernet1/1/2
demo-1-spine-001 Ethernet1/1/4 <---> demo-1-red-leaf-001 Ethernet1/1/2
demo-1-spine-001 Ethernet1/1/1 <---> demo-1-superspine-001 Ethernet0
demo-1-spine-001 demo-1-spine-001-SPINE_TO_SUPERSPINE-1 <---> demo-1-superspine-002 Ethernet0
demo-1-superspine-002 Ethernet0 <---> demo-1-spine-001 demo-1-spine-001-SPINE_TO_SUPERSPINE-1
demo-1-superspine-002 Ethernet4 <---> demo-1-spine-002 demo-1-spine-002-SPINE_TO_SUPERSPINE-1
demo-1-blue-leaf-001 Ethernet1/1/2 <---> demo-1-spine-001 Ethernet1/1/2
demo-1-superspine-001 Ethernet0 <---> demo-1-spine-001 Ethernet1/1/1
demo-1-superspine-001 Ethernet4 <---> demo-1-spine-002 Ethernet1/1/1
demo-1-blue-leaf-002 Ethernet1/1/2 <---> demo-1-spine-002 Ethernet1/1/2
demo-1-red-leaf-001 Ethernet1/1/2 <---> demo-1-spine-001 Ethernet1/1/4`;*/

  const parseData = useCallback(() => {
    const lines = rawData.split("\n");
    const parsedNodes = {};
    const parsedConnections = [];
    const uniqueConnections = new Set();

    lines.forEach((line) => {
      const match = line.match(/(.+?)\s+(\S+)\s+<--->\s+(.+?)\s+(\S+)/);
      if (match) {
        const [, dev1, port1, dev2, port2] = match;

        // Add nodes
        if (!parsedNodes[dev1]) {
          parsedNodes[dev1] = {
            name: dev1,
            type: dev1.includes("spine") ? "spine" : "leaf",
            position: { x: 0, y: 0 },
            connections: [],
          };
        }
        if (!parsedNodes[dev2]) {
          parsedNodes[dev2] = {
            name: dev2,
            type: dev2.includes("spine") ? "spine" : "leaf",
            position: { x: 0, y: 0 },
            connections: [],
          };
        }

        // Add unique connections
        const connKey1 = `${dev1}-${dev2}`;
        const connKey2 = `${dev2}-${dev1}`;
        if (
          !uniqueConnections.has(connKey1) &&
          !uniqueConnections.has(connKey2)
        ) {
          parsedConnections.push({
            id: connKey1,
            from: dev1,
            to: dev2,
            fromPort: port1,
            toPort: port2,
          });
          uniqueConnections.add(connKey1);

          parsedNodes[dev1].connections.push(dev2);
          parsedNodes[dev2].connections.push(dev1);
        }
      }
    });
    setNodes(parsedNodes);
    setConnections(parsedConnections);

    // Update stats
    const spineCount = Object.values(parsedNodes).filter(
      (n) => n.type === "spine"
    ).length;
    const leafCount = Object.values(parsedNodes).filter(
      (n) => n.type === "leaf"
    ).length;
    setStats({
      nodes: Object.keys(parsedNodes).length,
      connections: parsedConnections.length,
      spine: spineCount,
      leaf: leafCount,
    });
  }, [rawData]);

  const applyLayout = useCallback((layoutType) => {
    if (!topologyRef.current) return;

    const container = topologyRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    setNodes((currentNodes) => {
      // Check if nodes exist
      if (Object.keys(currentNodes).length === 0) return currentNodes;

      const spineNodes = Object.values(currentNodes).filter(
        (n) => n.type === "spine"
      );
      const leafNodes = Object.values(currentNodes).filter(
        (n) => n.type === "leaf"
      );
      const updatedNodes = { ...currentNodes };

      switch (layoutType) {
        case "auto":
        case "hierarchical":
          spineNodes.forEach((node, i) => {
            const x = (width / (spineNodes.length + 1)) * (i + 1) - 60;
            updatedNodes[node.name].position = { x, y: 80 };
          });

          leafNodes.forEach((node, i) => {
            const x = (width / (leafNodes.length + 1)) * (i + 1) - 60;
            updatedNodes[node.name].position = {
              x,
              y: layoutType === "auto" ? 400 : 450,
            };
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
            updatedNodes[node.name].position = { x, y };
          });
          break;
      }

      return updatedNodes;
    });
  }, []);

  const handleMouseDown = (e, nodeName) => {
    e.preventDefault();
    setIsDragging(true);
    setDragNode(nodeName);

    const rect = e.target.getBoundingClientRect();
    const containerRect = topologyRef.current.getBoundingClientRect();

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

  // Parse data on mount
  useEffect(() => {
    parseData();
  }, [parseData]);

  // Apply initial layout when nodes are loaded
  useEffect(() => {
    if (Object.keys(nodes).length > 0 && topologyRef.current) {
      // Small delay to ensure container dimensions are available
      setTimeout(() => {
        applyLayout(selectedLayout);
      }, 0);
    }
  }, [nodes, applyLayout]); // Remove selectedLayout from deps to avoid re-applying on every layout change

  // Apply layout when selectedLayout changes (for button clicks)
  useEffect(() => {
    if (Object.keys(nodes).length > 0 && topologyRef.current) {
      applyLayout(selectedLayout);
    }
  }, [selectedLayout, applyLayout]);

  const topologySpine = (val) =>{
    

    axios
      .get(`http://172.27.1.75:8080/device/${val}`)
      .then((response) => {
        console.log("response", response.data); // Handle the response data
      })
      .catch((error) => {
        console.error(error); // Handle errors
      });

  }

  const renderConnection = (connection) => {
    const fromNode = nodes[connection.from];
    const toNode = nodes[connection.to];

    if (!fromNode || !toNode) return null;

    const fromX = fromNode.position.x + 60;
    const fromY = fromNode.position.y + 20;
    const toX = toNode.position.x + 60;
    const toY = toNode.position.y + 20;

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

        {/* Controls */}
        <div className="glass-effect rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { id: "auto", label: "Auto Layout", icon: Zap },
              { id: "hierarchical", label: "Hierarchical", icon: BarChart3 },
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

        {/* Topology Visualization */}
        <div className="glass-effect rounded-2xl p-6 mb-8">
          <div
            ref={topologyRef}
            className="relative w-full h-96 md:h-[600px] bg-black/20 rounded-xl border-2 border-white/20 overflow-hidden"
          >
            {/* SVG for connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
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
              {connections.map(renderConnection)}
            </svg>

            {/* Nodes */}
            {Object.values(nodes).map((node) => (
              <div
                key={node.name}
                className={`absolute draggable-node ${
                  node.type === "spine" ? "node-spine" : "node-leaf"
                } rounded-xl p-3 min-w-[120px] text-center font-semibold text-sm shadow-lg border-2 border-white/30 hover:shadow-xl hover:shadow-white/20`}
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
                <div className="text-xs font-bold" onClick={()=> topologySpine(node.name)}>{node.name}</div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 node-spine rounded border border-white/30"></div>
              <span className="text-sm">Spine Layer (Core)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 node-leaf rounded border border-white/30"></div>
              <span className="text-sm">Leaf Layer (Access)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-gradient-to-r from-yellow-200 to-orange-300 rounded"></div>
              <span className="text-sm">Full Mesh Links</span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </div>
      </div>
    </div>
  );
};

export default NetworkTopologyApp;