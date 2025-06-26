import React, { useState } from "react";
import {
  Plus,
  Minus,
  Network,
  Download,
  Eye,
  Settings,
  Trash2,
  Copy,
  RefreshCw,
  FileText,
  Info,
} from "lucide-react";
import { deviceProfiles } from "./data";

const IntentBasedNetworkDesigner = ({ formData }) => {
  const [activePreviewTab, setActivePreviewTab] = useState("device");
  const [expandedSections, setExpandedSections] = useState({
    fabricInfo: true,
    topology: false,
    racks: false,
    network: false,
    ipPools: false,
    links: false,
    interfaces: false,
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const toggleSection = (sectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const deviceSKUs = deviceProfiles;

  const [networkIntent, setNetworkIntent] = useState({
    fabricInfo: {
      fabricName: "DC-Fabric-01",
      site: "Bengaluru",
    },
    topology: "spine-leaf",
    spineCount: 2,
    leafCount: 4,
    superspineEnabled: false,
    racks: [
      {
        name: "RACK1",
        leafCount: 2,
        hasGenericNodes: false,
        genericNodeCount: 0,
        genericNodeConnections: 2,
      },
      {
        name: "RACK2",
        leafCount: 2,
        hasGenericNodes: true,
        genericNodeCount: 4,
        genericNodeConnections: 2,
      },
    ],
    commonASN: 64512,
    linkConfig: {
      spineToLeaf: 2,
      leafToSpine: 2,
      spineToSuperspine: 1,
    },
    deviceConfig: {
      spine: "Force10-S6000",
      superspine: "Force10-S6000",
      leaf: "Force10-S6000",
      genericNode: "Force10-S4810",
    },
    ipPools: {
      SUPERSPINE_LOOPBACK: "10.0.0.0/24",
      SPINE_LOOPBACK: "10.0.1.0/24",
      RACK1_LOOPBACK: "10.0.2.0/24",
      RACK2_LOOPBACK: "10.0.3.0/24",
      GENERIC_NODE_LOOPBACK: "10.0.4.0/24",
    },
    interfaceMapping: {
      leaf: {
        LEAF_TO_SPINE: ["Ethernet1/1/1", "Ethernet1/1/2"],
        LEAF_TO_GENERIC_NODE: [
          "Ethernet1/1/3",
          "Ethernet1/1/4",
          "Ethernet1/1/5",
          "Ethernet1/1/6",
          "Ethernet1/1/7",
          "Ethernet1/1/8",
          "Ethernet1/1/9",
          "Ethernet1/1/10",
        ],
      },
      spine: {
        SPINE_TO_SUPERSPINE: ["Ethernet1/1/1"],
        SPINE_TO_RACK1: ["Ethernet1/1/2", "Ethernet1/1/3"],
        SPINE_TO_RACK2: ["Ethernet1/1/4", "Ethernet1/1/5"],
      },
      superspine: {
        SUPERSPINE_TO_SPINE: ["Ethernet1/1/1", "Ethernet1/1/2"],
      },
    },
  });

  const [generatedConfig, setGeneratedConfig] = useState(null);
  const wizardSteps = [
    {
      id: "fabric",
      title: "Fabric Information",
      description: "Basic network fabric details",
      icon: Network,
      required: true,
    },

    {
      id: "racks",
      title: "Rack Configuration",
      description: "Configure rack and leaf nodes",
      icon: Plus,
      required: true,
    },
    {
      id: "topology",
      title: "Network Topology",
      description: "Define your network structure",
      icon: Settings,
      required: true,
    },
    {
      id: "network",
      title: "Network Configuration",
      description: "ASN and IP pool configuration",
      icon: Settings,
      required: true,
    },
    {
      id: "links",
      title: "Link Configuration",
      description: "Configure inter-node connections",
      icon: Network,
      required: true,
    },
    {
      id: "interfaces",
      title: "Interface Mapping",
      description: "Map physical interfaces",
      icon: Settings,
      required: false,
    },
    {
      id: "preview",
      title: "Preview & Export",
      description: "Review and download configuration",
      icon: Eye,
      required: false,
    },
  ];
  const generateNodeSpec = () => {
    const ipSpec = {};
    const nodeSpec = {};

    // Determine if there are generic nodes in the topology
    const hasGenericNodes = networkIntent.racks.some((r) => r.hasGenericNodes);

    // Generate IP pools based on enabled nodes
    if (networkIntent.superspineEnabled) {
      ipSpec.SUPERSPINE_LOOPBACK = {
        name: "SUPERSPINE_LOOPBACK",
        v4: {
          prefixes: [networkIntent.ipPools.SUPERSPINE_LOOPBACK],
        },
      };
    }

    ipSpec.SPINE_LOOPBACK = {
      name: "SPINE_LOOPBACK",
      v4: {
        prefixes: [networkIntent.ipPools.SPINE_LOOPBACK],
      },
    };

    // Generate rack-specific IP pools
    networkIntent.racks.forEach((rack) => {
      ipSpec[`${rack.name}_LOOPBACK`] = {
        name: `${rack.name}_LOOPBACK`,
        v4: {
          prefixes: [networkIntent.ipPools[`${rack.name}_LOOPBACK`]],
        },
      };
    });

    // Add generic node IP pool if any rack has generic nodes
    if (hasGenericNodes) {
      ipSpec.GENERIC_NODE_LOOPBACK = {
        name: "GENERIC_NODE_LOOPBACK",
        v4: {
          prefixes: [networkIntent.ipPools.GENERIC_NODE_LOOPBACK],
        },
      };
    }

    // Generate rack leaf nodes
    networkIntent.racks.forEach((rack) => {
      const rackName = `${rack.name}-LEAF`;
      nodeSpec[rackName] = {
        allowedSKUs: [networkIntent.deviceConfig.leaf],
        asn: networkIntent.commonASN,
        interfaceRoutingSpec: {
          "spine-rs": {
            exportRoute: {
              name: "SPINE_EXPORT",
              terms: [{ name: "ADVERTISE_ALL", type: "accept-on-match" }],
            },
            importRoute: {
              name: "SPINE_IMPORT",
              terms: [
                {
                  firstOfConditionList: [
                    {
                      matchIPPrefix: {
                        matchAllocationPools: [`${rack.name}_LOOPBACK`],
                      },
                    },
                  ],
                  name: "ACCEPT_ALL",
                  type: "accept-on-match",
                },
              ],
            },
            peerGroup: { allowASIn: 1, name: `SPINE_TO_${rack.name}` },
          },
        },
        interfaceSpec: {
          loopback: {
            ipAllocationSpec: { IPv4: true, pool: `${rack.name}_LOOPBACK` },
            redistributeLoopback: { scope: "GLOBAL" },
          },
          transit: {
            LEAF_TO_SPINE: {
              connectsTo: {
                interfaceRole: `SPINE_TO_${rack.name}`,
                linkCount: 1,
                nodeRole: "SPINE",
                nodeStep: 1,
              },
              count: networkIntent.linkConfig.leafToSpine,
              role: "LEAF_TO_SPINE",
              routingSpec: "spine-rs",
              unnumbered: true,
            },
          },
        },
        // CRITICAL: leaf parameter logic based on topology hierarchy
        leaf: !hasGenericNodes, // true if no generic nodes exist (leaf is lowest), false if generic nodes exist
        leafCount: rack.leafCount,
        nodeProfile: "LEAF",
        role: rackName,
      };

      // Add generic node connection if enabled
      if (rack.hasGenericNodes) {
        nodeSpec[rackName].interfaceRoutingSpec["leaf-rs"] = {
          exportRoute: {
            name: "LEAF_EXPORT",
            terms: [{ name: "ADVERTISE_ALL", type: "accept-on-match" }],
          },
          importRoute: {
            name: "LEAF_IMPORT",
            terms: [{ name: "ACCEPT_ALL", type: "accept-on-match" }],
          },
          peerGroup: { allowASIn: 1, name: "LEAF_TO_SPINE" },
        };

        nodeSpec[rackName].interfaceSpec.transit.LEAF_TO_GENERIC_NODE = {
          connectsFrom: {
            interfaceRole: "GENERIC_NODE_TO_LEAF",
            nodeRole: "GENERIC-NODE",
          },
          count: 2,
          role: "LEAF_TO_GENERIC_NODE",
          routingSpec: "leaf-rs",
          unnumbered: true,
        };
      }
    });

    // Generate spine nodes
    nodeSpec.SPINE = {
      allowedSKUs: [networkIntent.deviceConfig.spine],
      asn: networkIntent.commonASN,
      interfaceRoutingSpec: {
        "leaf-rs": {
          exportRoute: {
            name: "LEAF_EXPORT",
            terms: [{ name: "ADVERTISE_ALL", type: "accept-on-match" }],
          },
          importRoute: {
            name: "LEAF_IMPORT",
            terms: [{ name: "ACCEPT_ALL", type: "accept-on-match" }],
          },
          peerGroup: { allowASIn: 1, name: "LEAF_TO_SPINE" },
        },
      },
      interfaceSpec: {
        loopback: {
          ipAllocationSpec: { IPv4: true, pool: "SPINE_LOOPBACK" },
          redistributeLoopback: { scope: "GLOBAL" },
        },
        transit: {},
      },
      // SPINE is never the lowest tier, so always false
      leaf: false,
      nodeProfile: "SPINE",
      role: "SPINE",
    };

    // Add superspine configuration if enabled
    if (networkIntent.superspineEnabled) {
      nodeSpec.SPINE.interfaceRoutingSpec["super-spine-rs"] = {
        importRoute: {
          name: "SUPERSPINE_IMPORT",
          terms: [{ type: "accept-on-match", name: "ACCEPT_ALL" }],
        },
        exportRoute: {
          name: "SUPERSPINE_EXPORT",
          terms: [{ type: "accept-on-match", name: "ADVERTISE_ALL" }],
        },
        peerGroup: { allowASIn: 1, name: "SPINE_TO_SUPERSPINE" },
      };

      nodeSpec.SPINE.interfaceSpec.transit.SPINE_TO_SUPERSPINE = {
        role: "SPINE_TO_SUPERSPINE",
        count: networkIntent.linkConfig.spineToSuperspine,
        connectsTo: {
          nodeRole: "SUPERSPINE",
          interfaceRole: "SUPERSPINE_TO_SPINE",
          linkCount: 1,
          nodeStep: 1,
        },
        unnumbered: true,
        routingSpec: "super-spine-rs",
      };

      // Generate superspine node
      nodeSpec.SUPERSPINE = {
        role: "SUPERSPINE",
        asn: networkIntent.commonASN,
        allowedSKUs: [networkIntent.deviceConfig.superspine],
        nodeProfile: "SUPERSPINE",
        // SUPERSPINE is never the lowest tier, so always false
        leaf: false,
        interfaceRoutingSpec: {
          "spine-rs": {
            importRoute: {
              name: "SPINE_IMPORT",
              terms: [{ type: "accept-on-match", name: "ACCEPT_ALL" }],
            },
            exportRoute: {
              name: "SPINE_EXPORT",
              terms: [{ type: "accept-on-match", name: "ADVERTISE_ALL" }],
            },
            peerGroup: { allowASIn: 1, name: "SUPERSPINE_TO_SPINE" },
          },
        },
        interfaceSpec: {
          loopback: {
            ipAllocationSpec: { pool: "SUPERSPINE_LOOPBACK", IPv4: true },
            redistributeLoopback: { scope: "GLOBAL" },
          },
          transit: {
            SUPERSPINE_TO_SPINE: {
              role: "SUPERSPINE_TO_SPINE",
              count: networkIntent.spineCount,
              connectsFrom: {
                nodeRole: "SPINE",
                interfaceRole: "SPINE_TO_SUPERSPINE",
              },
              unnumbered: true,
              routingSpec: "spine-rs",
            },
          },
        },
      };
    }

    // Add rack connections to spine
    networkIntent.racks.forEach((rack) => {
      nodeSpec.SPINE.interfaceSpec.transit[`SPINE_TO_${rack.name}`] = {
        connectsFrom: {
          interfaceRole: "LEAF_TO_SPINE",
          nodeRole: `${rack.name}-LEAF`,
        },
        count: networkIntent.linkConfig.spineToLeaf,
        role: `SPINE_TO_${rack.name}`,
        routingSpec: "leaf-rs",
        unnumbered: true,
      };
    });

    // Add generic node if any rack has generic nodes
    if (hasGenericNodes) {
      nodeSpec["GENERIC-NODE"] = {
        role: "GENERIC-NODE",
        asn: networkIntent.commonASN,
        allowedSKUs: [networkIntent.deviceConfig.genericNode],
        nodeProfile: "GENERIC",
        // CRITICAL: Generic nodes are the lowest tier when they exist, so leaf = true
        leaf: true,
        interfaceSpec: {
          loopback: {
            ipAllocationSpec: { pool: "GENERIC_NODE_LOOPBACK", IPv4: true },
            redistributeLoopback: { scope: "GLOBAL" },
          },
          transit: {
            GENERIC_NODE_TO_LEAF: {
              role: "GENERIC_NODE_TO_LEAF",
              count: 2,
              connectsTo: {
                nodeRole: "RACK2-LEAF",
                interfaceRole: "LEAF_TO_GENERIC_NODE",
                linkCount: 1,
                nodeStep: 1,
              },
              unnumbered: true,
            },
          },
        },
      };
    }

    return {
      name: networkIntent.fabricInfo.fabricName,
      site: networkIntent.fabricInfo.site,
      ipSpec,
      nodeSpec,
    };
  };

  // Function to generate profiles based on intent
  const generateProfiles = () => {
    // Generate breakout configuration based on actual device capabilities
    const generateBreakoutForDevice = (deviceSku) => {
      const deviceSpec = getDeviceSpec(deviceSku);
      if (!deviceSpec) {
        // Fallback for unknown devices
        const baseBreakout = {};
        for (let i = 1; i <= 28; i++) {
          baseBreakout[`Ethernet1/1/${i}`] = "1x40G";
        }
        return baseBreakout;
      }

      const breakout = {};
      Object.entries(deviceSpec.interfaces).forEach(
        ([interfaceName, interfaceSpec]) => {
          // Use the first supported breakout mode
          const supportedModes = Object.keys(
            interfaceSpec.supportedBreakoutModes
          );
          if (supportedModes.length > 0) {
            breakout[interfaceName] = supportedModes[0];
          }
        }
      );

      return breakout;
    };

    // Generate interface defaults based on device capabilities
    const generateInterfaceDefaults = (deviceSku) => {
      const deviceSpec = getDeviceSpec(deviceSku);
      const interfaceSpeed = getInterfaceSpeed(deviceSku);

      return {
        mtu: 9100,
        fec:
          interfaceSpeed.includes("40G") || interfaceSpeed.includes("25G")
            ? "none"
            : "auto",
        speed: interfaceSpeed,
      };
    };

    // Initialize profiles for each node type
    const profiles = {
      LEAF: {
        breakout: generateBreakoutForDevice(networkIntent.deviceConfig.leaf),
        panelMap: {
          LEAF_TO_SPINE: {},
        },
        interfaceDefaults: generateInterfaceDefaults(
          networkIntent.deviceConfig.leaf
        ),
        interfaceDetails: {}, // Specific interface overrides
      },
      SPINE: {
        breakout: generateBreakoutForDevice(networkIntent.deviceConfig.spine),
        panelMap: {},
        interfaceDefaults: generateInterfaceDefaults(
          networkIntent.deviceConfig.spine
        ),
        interfaceDetails: {},
      },
    };

    // Map LEAF_TO_SPINE interfaces
    networkIntent.interfaceMapping.leaf.LEAF_TO_SPINE.forEach((intf, index) => {
      if (index < networkIntent.linkConfig.leafToSpine) {
        profiles.LEAF.panelMap.LEAF_TO_SPINE[index.toString()] = intf;
      }
    });

    // Add superspine configuration if enabled
    if (networkIntent.superspineEnabled) {
      profiles.SPINE.panelMap.SPINE_TO_SUPERSPINE = {};
      networkIntent.interfaceMapping.spine.SPINE_TO_SUPERSPINE.forEach(
        (intf, index) => {
          if (index < networkIntent.linkConfig.spineToSuperspine) {
            profiles.SPINE.panelMap.SPINE_TO_SUPERSPINE[index.toString()] =
              intf;
          }
        }
      );
    }

    // Add rack-specific mappings to spine
    networkIntent.racks.forEach((rack) => {
      const rackKey = `SPINE_TO_${rack.name}`;
      profiles.SPINE.panelMap[rackKey] = {};

      const interfaceList =
        networkIntent.interfaceMapping.spine[rackKey] ||
        networkIntent.interfaceMapping.spine.SPINE_TO_RACK1;

      interfaceList.forEach((intf, index) => {
        if (index < networkIntent.linkConfig.spineToLeaf) {
          profiles.SPINE.panelMap[rackKey][index.toString()] = intf;
        }
      });
    });

    // Add superspine profile if enabled
    if (networkIntent.superspineEnabled) {
      profiles.SUPERSPINE = {
        breakout: generateBreakoutForDevice(
          networkIntent.deviceConfig.superspine
        ),
        panelMap: {
          SUPERSPINE_TO_SPINE: {},
        },
        interfaceDefaults: generateInterfaceDefaults(
          networkIntent.deviceConfig.superspine
        ),
        interfaceDetails: {},
      };

      // Map superspine to spine interfaces
      networkIntent.interfaceMapping.superspine.SUPERSPINE_TO_SPINE.forEach(
        (intf, index) => {
          if (
            index < networkIntent.spineCount &&
            validateInterface(intf, networkIntent.deviceConfig.superspine)
          ) {
            profiles.SUPERSPINE.panelMap.SUPERSPINE_TO_SPINE[index.toString()] =
              intf;
          }
        }
      );
    }

    // Add generic node profile if needed
    const hasGenericNodes = networkIntent.racks.some((r) => r.hasGenericNodes);
    if (hasGenericNodes) {
      profiles.LEAF.panelMap.LEAF_TO_GENERIC_NODE = {};
      networkIntent.interfaceMapping.leaf.LEAF_TO_GENERIC_NODE.forEach(
        (intf, index) => {
          if (validateInterface(intf, networkIntent.deviceConfig.leaf)) {
            profiles.LEAF.panelMap.LEAF_TO_GENERIC_NODE[index.toString()] =
              intf;
          }
        }
      );

      profiles.GENERIC = {
        breakout: generateBreakoutForDevice(
          networkIntent.deviceConfig.genericNode
        ),
        panelMap: {
          GENERIC_NODE_TO_LEAF: {},
        },
        interfaceDefaults: generateInterfaceDefaults(
          networkIntent.deviceConfig.genericNode
        ),
        interfaceDetails: {
          // Example of interface-specific overrides for generic nodes
        },
      };

      // Set standard interfaces for generic nodes based on device type
      const genericDeviceSpec = getDeviceSpec(
        networkIntent.deviceConfig.genericNode
      );
      if (genericDeviceSpec) {
        const availableInterfaces = Object.keys(
          genericDeviceSpec.interfaces
        ).slice(0, 2);
        availableInterfaces.forEach((intf, index) => {
          profiles.GENERIC.panelMap.GENERIC_NODE_TO_LEAF[index.toString()] =
            intf;
        });
      } else {
        // Fallback
        profiles.GENERIC.panelMap.GENERIC_NODE_TO_LEAF = {
          0: "Ethernet1/1/1",
          1: "Ethernet1/1/2",
        };
      }
    }

    return profiles;
  };

  // Function to validate fabric cohesion
  const validateFabricCohesion = (nodeSpec) => {
    try {
      const nodeRoles = Object.keys(nodeSpec);
      const connections = {};

      // Build connection graph
      nodeRoles.forEach((role) => {
        connections[role] = new Set();
        const transitSpecs = nodeSpec[role].interfaceSpec?.transit || {};

        Object.values(transitSpecs).forEach((spec) => {
          if (spec.connectsTo?.nodeRole) {
            connections[role].add(spec.connectsTo.nodeRole);
          }
          if (spec.connectsFrom?.nodeRole) {
            connections[role].add(spec.connectsFrom.nodeRole);
          }
        });
      });

      // Check if all nodes are reachable from each other
      const isConnected = (start, end, visited = new Set()) => {
        if (start === end) return true;
        if (visited.has(start)) return false;

        visited.add(start);
        for (const neighbor of connections[start] || []) {
          if (isConnected(neighbor, end, visited)) return true;
        }
        return false;
      };

      const issues = [];
      for (let i = 0; i < nodeRoles.length; i++) {
        for (let j = i + 1; j < nodeRoles.length; j++) {
          const roleA = nodeRoles[i];
          const roleB = nodeRoles[j];
          if (!isConnected(roleA, roleB) && !isConnected(roleB, roleA)) {
            issues.push(`${roleA} and ${roleB} are not connected`);
          }
        }
      }

      return {
        isValid: issues.length === 0,
        issues,
      };
    } catch (error) {
      console.error("Error in validateFabricCohesion:", error);
      return {
        isValid: false,
        issues: ["Validation error: " + error.message],
      };
    }
  };

  // Function to validate fabric cohesion
  const handleGenerateConfig = () => {
    try {
      console.log("Starting configuration generation...");

      const config = generateNodeSpec();
      console.log("Generated nodeSpec:", config);

      const profiles = generateProfiles();
      console.log("Generated profiles:", profiles);

      // Validate fabric cohesion
      const validation = validateFabricCohesion(config.nodeSpec);
      console.log("Validation result:", validation);

      setGeneratedConfig({
        ...config,
        profiles,
        validation,
      });

      setActiveTab("preview");
      console.log("Configuration generation completed successfully");
    } catch (error) {
      console.error("Error generating configuration:", error);
      alert("Error generating configuration: " + error.message);
    }
  };

  const addRack = () => {
    const newRackName = `RACK${networkIntent.racks.length + 1}`;
    const newIpPool = `10.0.${networkIntent.racks.length + 2}.0/24`;

    setNetworkIntent((prev) => ({
      ...prev,
      racks: [
        ...prev.racks,
        {
          name: newRackName,
          leafCount: 2,
          hasGenericNodes: false,
          genericNodeCount: 0,
          genericNodeConnections: 2,
        },
      ],
      ipPools: {
        ...prev.ipPools,
        [`${newRackName}_LOOPBACK`]: newIpPool,
      },
      interfaceMapping: {
        ...prev.interfaceMapping,
        spine: {
          ...prev.interfaceMapping.spine,
          [`SPINE_TO_${newRackName}`]: [
            `Ethernet1/1/${
              Object.keys(prev.interfaceMapping.spine).length + 2
            }`,
            `Ethernet1/1/${
              Object.keys(prev.interfaceMapping.spine).length + 3
            }`,
          ],
        },
      },
    }));
  };

  const removeRack = (index) => {
    const rackToRemove = networkIntent.racks[index];
    setNetworkIntent((prev) => {
      const newIpPools = { ...prev.ipPools };
      delete newIpPools[`${rackToRemove.name}_LOOPBACK`];

      const newSpineMapping = { ...prev.interfaceMapping.spine };
      delete newSpineMapping[`SPINE_TO_${rackToRemove.name}`];

      return {
        ...prev,
        racks: prev.racks.filter((_, i) => i !== index),
        ipPools: newIpPools,
        interfaceMapping: {
          ...prev.interfaceMapping,
          spine: newSpineMapping,
        },
      };
    });
  };

  const updateRack = (index, field, value) => {
    setNetworkIntent((prev) => ({
      ...prev,
      racks: prev.racks.map((rack, i) =>
        i === index ? { ...rack, [field]: value } : rack
      ),
    }));
  };

  const updateInterfaceMapping = (
    nodeType,
    connectionType,
    interfaceIndex,
    value
  ) => {
    setNetworkIntent((prev) => ({
      ...prev,
      interfaceMapping: {
        ...prev.interfaceMapping,
        [nodeType]: {
          ...prev.interfaceMapping[nodeType],
          [connectionType]: prev.interfaceMapping[nodeType][connectionType].map(
            (intf, idx) => (idx === interfaceIndex ? value : intf)
          ),
        },
      },
    }));
  };

  const addInterfaceToMapping = (nodeType, connectionType) => {
    const newInterface = `Ethernet1/1/${Math.max(
      ...Array.from({ length: 28 }, (_, i) => i + 1)
    )}`;
    setNetworkIntent((prev) => ({
      ...prev,
      interfaceMapping: {
        ...prev.interfaceMapping,
        [nodeType]: {
          ...prev.interfaceMapping[nodeType],
          [connectionType]: [
            ...prev.interfaceMapping[nodeType][connectionType],
            newInterface,
          ],
        },
      },
    }));
  };

  const removeInterfaceFromMapping = (
    nodeType,
    connectionType,
    interfaceIndex
  ) => {
    setNetworkIntent((prev) => ({
      ...prev,
      interfaceMapping: {
        ...prev.interfaceMapping,
        [nodeType]: {
          ...prev.interfaceMapping[nodeType],
          [connectionType]: prev.interfaceMapping[nodeType][
            connectionType
          ].filter((_, idx) => idx !== interfaceIndex),
        },
      },
    }));
  };

  const generateInterfaceOptions = (deviceSku = null) => {
    const sku = deviceSku || networkIntent.deviceConfig.leaf; // Default to leaf device
    const deviceSpec = deviceSKUs[sku];

    if (!deviceSpec) {
      // Fallback to generic naming if SKU not found
      return Array.from({ length: 28 }, (_, i) => `Ethernet1/1/${i + 1}`);
    }

    return Object.keys(deviceSpec.interfaces).sort((a, b) => {
      // Sort interfaces numerically where possible
      const aMatch = a.match(/(\d+)$/);
      const bMatch = b.match(/(\d+)$/);
      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      }
      return a.localeCompare(b);
    });
  };

  // Get device specifications for a given SKU
  const getDeviceSpec = (sku) => {
    return deviceSKUs[sku] || null;
  };

  // Get supported breakout modes for a device
  const getSupportedBreakoutModes = (sku) => {
    const deviceSpec = getDeviceSpec(sku);
    if (!deviceSpec || !deviceSpec.interfaces) return {};

    const firstInterface = Object.values(deviceSpec.interfaces)[0];
    return firstInterface?.supportedBreakoutModes || { "1x40G": [] };
  };

  // Get interface speed from device spec
  const getInterfaceSpeed = (sku) => {
    const breakoutModes = getSupportedBreakoutModes(sku);
    const firstMode = Object.values(breakoutModes)[0];
    if (firstMode && firstMode[0]) {
      return `${firstMode[0].speed / 1000}G`; // Convert Mbps to Gbps
    }
    return "40G"; // fallback
  };

  // Validate interface exists on device
  const validateInterface = (interfaceName, sku) => {
    const deviceSpec = getDeviceSpec(sku);
    return deviceSpec ? interfaceName in deviceSpec.interfaces : true;
  };

  const validateStep = (stepId) => {
    switch (stepId) {
      case "fabric":
        return (
          networkIntent.fabricInfo.fabricName.trim() !== "" &&
          networkIntent.fabricInfo.site.trim() !== ""
        );
      case "topology":
        return networkIntent.spineCount > 0;
      case "racks":
        return (
          networkIntent.racks.length > 0 &&
          networkIntent.racks.every(
            (rack) => rack.name.trim() !== "" && rack.leafCount > 0
          )
        );
      case "network":
        return (
          networkIntent.commonASN > 0 &&
          Object.values(networkIntent.ipPools).every(
            (pool) => pool.trim() !== ""
          )
        );
      case "links":
        return (
          networkIntent.linkConfig.spineToLeaf > 0 &&
          networkIntent.linkConfig.leafToSpine > 0
        );
      case "interfaces":
        // Validate interface mappings exist and are valid
        const leafToSpineValid =
          networkIntent.interfaceMapping.leaf.LEAF_TO_SPINE.length >=
          networkIntent.linkConfig.leafToSpine;
        const spineInterfacesValid =
          Object.keys(networkIntent.interfaceMapping.spine).length > 0;
        return leafToSpineValid && spineInterfacesValid;
      default:
        return false;
    }
  };
  const handleStepComplete = (stepId) => {
    if (validateStep(stepId) && !completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const goToNextStep = () => {
    const currentStepId = wizardSteps[currentStep].id;
    if (validateStep(currentStepId)) {
      handleStepComplete(currentStepId);

      // Special handling for interface mapping step
      if (currentStepId === "interfaces") {
        // Mark interfaces as completed before moving to preview
        if (!completedSteps.includes("interfaces")) {
          setCompletedSteps((prev) => [...prev, "interfaces"]);
        }
      }

      if (currentStep < wizardSteps.length - 1) {
        setCurrentStep(currentStep + 1);
        // Auto-generate config when reaching preview step
        if (wizardSteps[currentStep + 1].id === "preview") {
          setTimeout(() => {
            generateJSON();
          }, 100);
        }
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  // Add these functions before your return statement
  const generateJSON = () => {
    try {
      console.log(
        "Generating fresh configuration from current network intent..."
      );

      // Generate fresh data based on current network intent
      const nodeSpecData = generateNodeSpec();
      const profiles = generateProfiles();

      console.log("Current Network Intent:", networkIntent);
      console.log("Generated Node Spec:", nodeSpecData);
      console.log("Generated Profiles:", profiles);

      const config = {
        fabric_info: {
          fabric_name: networkIntent.fabricInfo.fabricName,
          site: networkIntent.fabricInfo.site,
          template: networkIntent.superspineEnabled
            ? "l3ls_evpn_vxlan_3stage"
            : "l3ls_evpn_vxlan",
          asn: networkIntent.commonASN,
          bgp_peer_groups: {
            mlag_peer: {
              password: "secure_password_123",
            },
          },
        },
        device_profiles: profiles,
        node_spec: nodeSpecData.nodeSpec,
        ip_spec: nodeSpecData.ipSpec,
        generation_timestamp: new Date().toISOString(),
        generated_from_intent: true,
      };

      setGeneratedConfig(config);
      console.log("Configuration generated successfully:", config);
    } catch (error) {
      console.error("Error generating configuration:", error);
      alert("Error generating configuration: " + error.message);
    }
  };
  const downloadJSON = () => {
    if (!generatedConfig) return;

    const dataStr = JSON.stringify(generatedConfig, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${networkIntent.fabricInfo.fabricName}_complete_config.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const downloadDeviceProfiles = () => {
    try {
      // Generate fresh profiles based on current network intent
      const deviceProfiles = generateProfiles();
      const dataStr = JSON.stringify(deviceProfiles, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `${networkIntent.fabricInfo.fabricName}_device_profiles.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      console.log("Device profiles downloaded:", deviceProfiles);
    } catch (error) {
      console.error("Error downloading device profiles:", error);
      alert("Error downloading device profiles: " + error.message);
    }
  };

  const downloadNodeSpec = () => {
    try {
      // Generate fresh node spec based on current network intent
      const nodeSpecData = generateNodeSpec();
      const nodeSpec = nodeSpecData.nodeSpec;
      const dataStr = JSON.stringify(nodeSpec, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `${networkIntent.fabricInfo.fabricName}_node_spec.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();

      console.log("Node specifications downloaded:", nodeSpec);
    } catch (error) {
      console.error("Error downloading node specifications:", error);
      alert("Error downloading node specifications: " + error.message);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedConfig) return;

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(generatedConfig, null, 2)
      );
      alert("Configuration copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Failed to copy to clipboard");
    }
  };

  const copyDeviceProfilesToClipboard = async () => {
    if (!generatedConfig) return;

    try {
      const deviceProfiles =
        generatedConfig.device_profiles || generateProfiles();
      await navigator.clipboard.writeText(
        JSON.stringify(deviceProfiles, null, 2)
      );
      alert("Device profiles copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Failed to copy to clipboard");
    }
  };

  const copyNodeSpecToClipboard = async () => {
    if (!generatedConfig) return;

    try {
      const nodeSpec = generatedConfig.node_spec || generateNodeSpec().nodeSpec;
      await navigator.clipboard.writeText(JSON.stringify(nodeSpec, null, 2));
      alert("Node specification copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("Failed to copy to clipboard");
    }
  };

  const handleCompleteWizard = () => {
    const currentStepId = wizardSteps[currentStep].id;

    // If we're on interface mapping step, mark it as completed
    if (currentStepId === "interfaces" && validateStep(currentStepId)) {
      handleStepComplete(currentStepId);
    }

    // Only proceed to preview if interface mapping is completed
    if (
      completedSteps.includes("interfaces") ||
      (currentStepId === "interfaces" && validateStep(currentStepId))
    ) {
      if (currentStep < wizardSteps.length - 1) {
        setCurrentStep(currentStep + 1);
        // Auto-generate config when reaching preview step
        if (wizardSteps[currentStep + 1].id === "preview") {
          setTimeout(() => {
            generateJSON();
          }, 100);
        }
      }
    }
  };

  return (
    <div className="max-w-9xl mx-auto min-h-screen">
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Header */}
        {/* <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <Network className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Intent-Based Network Designer</h1>
          </div>
          <p className="text-green-100">Design your network using simple intentions - we'll generate the configuration</p>
        </div> */}
        {/* Navigation - Wizard + Export */}
        {/* Wizard Navigation */}
        <div className=" border-b">
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between mb-8">
              {/* <h2 className="text-lg font-semibold text-gray-800">
                FABRIC CREATION
              </h2> */}
              <div className="flex items-center gap-4">
                {/* <div className="text-sm text-gray-600">
                  Step {currentStep + 1} of {wizardSteps.length}
                </div> */}

                {(() => {
                  const allRequiredCompleted = wizardSteps
                    .filter((step) => step.required)
                    .every((step) => completedSteps.includes(step.id));
                  const currentStepValid = validateStep(
                    wizardSteps[currentStep].id
                  );
                  const isLastStep = currentStep === wizardSteps.length - 1;

                  if (
                    currentStep === wizardSteps.length - 2 &&
                    currentStepValid &&
                    allRequiredCompleted
                  ) {
                    return (
                      <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-100 to-purple-100 border border-purple-300 rounded-full">
                        <span className="text-purple-700 font-medium text-sm">
                          🎉 Ready for Preview!
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            <div className="flex items-center justify-center w-full mb-6">
              {wizardSteps.map((step, index) => {
                const isActive = currentStep === index;
                const showAsCompleted =
                  completedSteps.includes(step.id) && index < currentStep;
                const IconComponent = step.icon;

                return (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => goToStep(index)}
                      className={`flex items-center justify-center w-14 h-14 rounded-full ${
                        showAsCompleted
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {showAsCompleted ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5 13L9 17L19 7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <IconComponent size={18} />
                      )}
                    </button>

                    {index < wizardSteps.length - 1 && (
                      <div
                        className={`w-36 h-1 ${
                          index < currentStep &&
                          completedSteps.includes(step.id)
                            ? "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      ></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="text-center mb-6">
              <h3 className="text-md font-medium text-gray-700">
                {wizardSteps[currentStep].title}
              </h3>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              {React.createElement(wizardSteps[currentStep].icon, {
                className: "w-6 h-6 text-blue-600",
              })}
              <h3 className="text-2xl font-semibold text-gray-900">
                {wizardSteps[currentStep].title}
              </h3>
            </div>
            <p className="text-gray-600">
              {wizardSteps[currentStep].description}
            </p>

            {currentStep < wizardSteps.length - 1 && (
              <div className="mt-3">
                {validateStep(wizardSteps[currentStep].id) ? (
                  <div className="flex items-center gap-2 text-green-600 text-sm"></div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-600 text-sm">
                    <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                    Please complete required fields
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mb-8">
            {currentStep === 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-blue-800">
                      Fabric Name
                    </label>
                    <input
                      type="text"
                      value={networkIntent.fabricInfo.fabricName}
                      onChange={(e) =>
                        setNetworkIntent((prev) => ({
                          ...prev,
                          fabricInfo: {
                            ...prev.fabricInfo,
                            fabricName: e.target.value,
                          },
                        }))
                      }
                      placeholder="Enter fabric name (e.g., DC-Fabric-01)"
                      className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-blue-800">
                      Site Location
                    </label>
                    <select
                      value={networkIntent.fabricInfo.site}
                      onChange={(e) =>
                        setNetworkIntent((prev) => ({
                          ...prev,
                          fabricInfo: {
                            ...prev.fabricInfo,
                            site: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a site</option>
                      {formData.site.createdSites &&
                      formData.site.createdSites.length > 0 ? (
                        formData.site.createdSites.map((site, index) => (
                          <option key={index} value={site}>
                            {site}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Bengaluru">Bengaluru</option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="Chennai">Chennai</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Current Configuration:</strong>{" "}
                    {networkIntent.fabricInfo.fabricName} located in{" "}
                    {networkIntent.fabricInfo.site}
                  </p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Topology Type
                    </label>
                    <select
                      value={networkIntent.topology}
                      onChange={(e) =>
                        setNetworkIntent((prev) => ({
                          ...prev,
                          topology: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="spine-leaf">Spine-Leaf</option>
                      <option value="three-tier">
                        Three-Tier (with Superspine)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Spine Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={networkIntent.spineCount}
                      onChange={(e) =>
                        setNetworkIntent((prev) => ({
                          ...prev,
                          spineCount: parseInt(e.target.value),
                        }))
                      }
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Spine Device SKU
                    </label>
                    <select
                      value={networkIntent.deviceConfig.spine}
                      onChange={(e) =>
                        setNetworkIntent((prev) => ({
                          ...prev,
                          deviceConfig: {
                            ...prev.deviceConfig,
                            spine: e.target.value,
                          },
                        }))
                      }
                      className="w-full p-2 border rounded-lg"
                    >
                      {Object.entries(deviceSKUs).map(([sku, spec]) => (
                        <option key={sku} value={sku}>
                          {sku} ({spec.vendor} - {getInterfaceSpeed(sku)} ×{" "}
                          {Object.keys(spec.interfaces).length} ports)
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Platform:{" "}
                      {getDeviceSpec(networkIntent.deviceConfig.spine)
                        ?.platform || "Unknown"}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={networkIntent.superspineEnabled}
                        onChange={(e) =>
                          setNetworkIntent((prev) => ({
                            ...prev,
                            superspineEnabled: e.target.checked,
                          }))
                        }
                        className="mr-2"
                      />
                      Enable Superspine Layer
                    </label>
                  </div>

                  {networkIntent.superspineEnabled && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Superspine Device SKU
                      </label>
                      <select
                        value={networkIntent.deviceConfig.superspine}
                        onChange={(e) =>
                          setNetworkIntent((prev) => ({
                            ...prev,
                            deviceConfig: {
                              ...prev.deviceConfig,
                              superspine: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="Force10-S6000">Force10-S6000</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-lg font-medium">
                      Configure Your Racks
                    </h4>
                    <p className="text-sm text-gray-600">
                      Add and configure rack nodes and their leaf switches
                    </p>
                  </div>
                  <button
                    onClick={addRack}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Rack
                  </button>
                </div>

                <div className="space-y-4">
                  {networkIntent.racks.map((rack, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">{rack.name}</h4>
                        {networkIntent.racks.length > 1 && (
                          <button
                            onClick={() => removeRack(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Rack Name
                          </label>
                          <input
                            type="text"
                            value={rack.name}
                            onChange={(e) =>
                              updateRack(index, "name", e.target.value)
                            }
                            className="w-full p-2 border rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Leaf Count
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="8"
                            value={rack.leafCount}
                            onChange={(e) =>
                              updateRack(
                                index,
                                "leafCount",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full p-2 border rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Leaf Device SKU
                          </label>
                          <select
                            value={networkIntent.deviceConfig.leaf}
                            onChange={(e) =>
                              setNetworkIntent((prev) => ({
                                ...prev,
                                deviceConfig: {
                                  ...prev.deviceConfig,
                                  leaf: e.target.value,
                                },
                              }))
                            }
                            className="w-full p-2 border rounded"
                          >
                            {Object.entries(deviceSKUs).map(([sku, spec]) => (
                              <option key={sku} value={sku}>
                                {sku} ({spec.vendor} - {getInterfaceSpeed(sku)}{" "}
                                × {Object.keys(spec.interfaces).length})
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            {getDeviceSpec(networkIntent.deviceConfig.leaf)
                              ?.interfaceNaming || "Standard naming"}
                          </p>
                        </div>

                        <div className="flex items-center">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={rack.hasGenericNodes}
                              onChange={(e) =>
                                updateRack(
                                  index,
                                  "hasGenericNodes",
                                  e.target.checked
                                )
                              }
                              className="mr-2"
                            />
                            Connect Generic Nodes
                          </label>
                        </div>
                      </div>

                      {rack.hasGenericNodes && (
                        <div className="mt-3 pt-3 border-t">
                          <h5 className="font-medium text-gray-800 mb-3">
                            Generic Node Configuration
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Generic Node Device SKU
                              </label>
                              <select
                                value={networkIntent.deviceConfig.genericNode}
                                onChange={(e) =>
                                  setNetworkIntent((prev) => ({
                                    ...prev,
                                    deviceConfig: {
                                      ...prev.deviceConfig,
                                      genericNode: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full p-2 border rounded"
                              >
                                {Object.entries(deviceSKUs).map(
                                  ([sku, spec]) => (
                                    <option key={sku} value={sku}>
                                      {sku} ({spec.vendor} -{" "}
                                      {getInterfaceSpeed(sku)} ×{" "}
                                      {Object.keys(spec.interfaces).length})
                                    </option>
                                  )
                                )}
                              </select>
                              <p className="text-xs text-gray-500 mt-1">
                                {getDeviceSpec(
                                  networkIntent.deviceConfig.genericNode
                                )?.interfaceNaming || "Standard naming"}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Number of Generic Nodes
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="16"
                                value={rack.genericNodeCount}
                                onChange={(e) =>
                                  updateRack(
                                    index,
                                    "genericNodeCount",
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-full p-2 border rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Connections per Generic Node
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="4"
                                value={rack.genericNodeConnections}
                                onChange={(e) =>
                                  updateRack(
                                    index,
                                    "genericNodeConnections",
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-full p-2 border rounded"
                              />
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                            <p className="text-sm text-yellow-800">
                              <strong>Connection Summary:</strong>{" "}
                              {rack.genericNodeCount} generic nodes, each with{" "}
                              {rack.genericNodeConnections} connections to{" "}
                              {rack.name} leaf switches
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Common ASN Configuration */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4">
                    BGP Configuration
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Common ASN (All Nodes)
                      </label>
                      <input
                        type="number"
                        value={networkIntent.commonASN}
                        onChange={(e) =>
                          setNetworkIntent((prev) => ({
                            ...prev,
                            commonASN: parseInt(e.target.value),
                          }))
                        }
                        className="w-full p-2 border rounded-lg"
                        placeholder="e.g., 64512"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        All nodes will use this ASN for BGP
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="p-3 bg-yellow-50 rounded-lg w-full">
                        <p className="text-sm text-yellow-700">
                          <strong>Static Settings:</strong> MTU: 9100, FEC:
                          none, Interface Speed: 1x40G
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* IP Pool Configuration */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4">
                    IP Pool Configuration
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {networkIntent.superspineEnabled && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Superspine Loopback Pool
                        </label>
                        <input
                          type="text"
                          value={networkIntent.ipPools.SUPERSPINE_LOOPBACK}
                          onChange={(e) =>
                            setNetworkIntent((prev) => ({
                              ...prev,
                              ipPools: {
                                ...prev.ipPools,
                                SUPERSPINE_LOOPBACK: e.target.value,
                              },
                            }))
                          }
                          placeholder="10.0.0.0/24"
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Spine Loopback Pool
                      </label>
                      <input
                        type="text"
                        value={networkIntent.ipPools.SPINE_LOOPBACK}
                        onChange={(e) =>
                          setNetworkIntent((prev) => ({
                            ...prev,
                            ipPools: {
                              ...prev.ipPools,
                              SPINE_LOOPBACK: e.target.value,
                            },
                          }))
                        }
                        placeholder="10.0.1.0/24"
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>

                    {networkIntent.racks.map((rack) => (
                      <div key={rack.name}>
                        <label className="block text-sm font-medium mb-2">
                          {rack.name} Loopback Pool
                        </label>
                        <input
                          type="text"
                          value={
                            networkIntent.ipPools[`${rack.name}_LOOPBACK`] || ""
                          }
                          onChange={(e) =>
                            setNetworkIntent((prev) => ({
                              ...prev,
                              ipPools: {
                                ...prev.ipPools,
                                [`${rack.name}_LOOPBACK`]: e.target.value,
                              },
                            }))
                          }
                          placeholder={`10.0.${
                            networkIntent.racks.indexOf(rack) + 2
                          }.0/24`}
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                    ))}

                    {networkIntent.racks.some((r) => r.hasGenericNodes) && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Generic Node Loopback Pool
                        </label>
                        <input
                          type="text"
                          value={networkIntent.ipPools.GENERIC_NODE_LOOPBACK}
                          onChange={(e) =>
                            setNetworkIntent((prev) => ({
                              ...prev,
                              ipPools: {
                                ...prev.ipPools,
                                GENERIC_NODE_LOOPBACK: e.target.value,
                              },
                            }))
                          }
                          placeholder="10.0.4.0/24"
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>Note:</strong> IP pools are only shown for enabled
                      nodes. Add racks or enable features to see more pools.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">
                  Inter-Node Link Configuration
                </h4>
                <p className="text-sm text-gray-600 mb-6">
                  Configure the number of links between different node types in
                  your network topology.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <h5 className="font-medium mb-3 text-blue-700">
                      Spine ↔ Leaf Links
                    </h5>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Spine to Leaf Links
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="4"
                          value={networkIntent.linkConfig.spineToLeaf}
                          onChange={(e) =>
                            setNetworkIntent((prev) => ({
                              ...prev,
                              linkConfig: {
                                ...prev.linkConfig,
                                spineToLeaf: parseInt(e.target.value),
                              },
                            }))
                          }
                          className="w-full p-2 border rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Links from each spine to each leaf
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Leaf to Spine Links
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="4"
                          value={networkIntent.linkConfig.leafToSpine}
                          onChange={(e) =>
                            setNetworkIntent((prev) => ({
                              ...prev,
                              linkConfig: {
                                ...prev.linkConfig,
                                leafToSpine: parseInt(e.target.value),
                              },
                            }))
                          }
                          className="w-full p-2 border rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Links from each leaf to each spine
                        </p>
                      </div>
                    </div>
                  </div>

                  {networkIntent.superspineEnabled && (
                    <div className="bg-white p-4 rounded-lg border">
                      <h5 className="font-medium mb-3 text-purple-700">
                        Spine ↔ Superspine Links
                      </h5>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Spine to Superspine Links
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="4"
                          value={networkIntent.linkConfig.spineToSuperspine}
                          onChange={(e) =>
                            setNetworkIntent((prev) => ({
                              ...prev,
                              linkConfig: {
                                ...prev.linkConfig,
                                spineToSuperspine: parseInt(e.target.value),
                              },
                            }))
                          }
                          className="w-full p-2 border rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Links from each spine to superspine
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-white p-4 rounded-lg border">
                    <h5 className="font-medium mb-3 text-green-700">
                      Link Summary
                    </h5>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Total Spine-Leaf Links:</span>
                        <span className="font-medium">
                          {networkIntent.spineCount *
                            networkIntent.racks.length *
                            networkIntent.linkConfig.spineToLeaf *
                            2}
                        </span>
                      </div>
                      {networkIntent.superspineEnabled && (
                        <div className="flex justify-between">
                          <span>Spine-Superspine Links:</span>
                          <span className="font-medium">
                            {networkIntent.spineCount *
                              networkIntent.linkConfig.spineToSuperspine *
                              2}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Generic Node Links:</span>
                        <span className="font-medium">
                          {networkIntent.racks
                            .filter((r) => r.hasGenericNodes)
                            .reduce(
                              (sum, r) =>
                                sum +
                                r.genericNodeCount * r.genericNodeConnections,
                              0
                            )}
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between font-semibold">
                          <span>Total Network Links:</span>
                          <span>
                            {networkIntent.spineCount *
                              networkIntent.racks.length *
                              networkIntent.linkConfig.spineToLeaf *
                              2 +
                              (networkIntent.superspineEnabled
                                ? networkIntent.spineCount *
                                  networkIntent.linkConfig.spineToSuperspine *
                                  2
                                : 0) +
                              networkIntent.racks
                                .filter((r) => r.hasGenericNodes)
                                .reduce(
                                  (sum, r) =>
                                    sum +
                                    r.genericNodeCount *
                                      r.genericNodeConnections,
                                  0
                                )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h6 className="font-medium text-blue-900 mb-2">
                    Link Configuration Guidelines
                  </h6>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • More links provide higher bandwidth and redundancy
                    </li>
                    <li>
                      • Ensure your devices have sufficient interfaces for the
                      configured links
                    </li>
                    <li>
                      • Consider ECMP (Equal Cost Multi-Path) benefits with
                      multiple links
                    </li>
                    <li>
                      • Each link will be configured as an unnumbered interface
                      for BGP
                    </li>
                  </ul>
                </div>
              </div>
            )}
            {currentStep === 5 && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="mb-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm text-blue-800">
                    Configure which physical interfaces are used for each
                    connection type. This step is optional but recommended for
                    production deployments.
                  </p>
                </div>

                {/* Leaf Interfaces */}
                <div className="mb-8">
                  <h4 className="font-medium mb-4 text-lg">
                    Leaf Node Interface Assignment
                  </h4>

                  <div className="bg-white p-4 rounded border mb-4">
                    <h5 className="font-medium mb-3">
                      Leaf to Spine Connections
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {networkIntent.interfaceMapping.leaf.LEAF_TO_SPINE.map(
                        (intf, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-sm w-16 text-gray-600">
                              Link {index + 1}:
                            </span>
                            <select
                              value={intf}
                              onChange={(e) =>
                                updateInterfaceMapping(
                                  "leaf",
                                  "LEAF_TO_SPINE",
                                  index,
                                  e.target.value
                                )
                              }
                              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            >
                              {generateInterfaceOptions(
                                networkIntent.deviceConfig.leaf
                              ).map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {networkIntent.racks.some((r) => r.hasGenericNodes) && (
                    <div className="bg-white p-4 rounded border">
                      <h5 className="font-medium mb-3">
                        Leaf to Generic Node Connections
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {networkIntent.interfaceMapping.leaf.LEAF_TO_GENERIC_NODE.slice(
                          0,
                          8
                        ).map((intf, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-sm w-16 text-gray-600">
                              Port {index + 1}:
                            </span>
                            <select
                              value={intf}
                              onChange={(e) =>
                                updateInterfaceMapping(
                                  "leaf",
                                  "LEAF_TO_GENERIC_NODE",
                                  index,
                                  e.target.value
                                )
                              }
                              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            >
                              {generateInterfaceOptions(
                                networkIntent.deviceConfig.leaf
                              ).map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Spine Interfaces */}
                <div className="mb-8">
                  <h4 className="font-medium mb-4 text-lg">
                    Spine Node Interface Assignment
                  </h4>

                  {networkIntent.superspineEnabled && (
                    <div className="bg-white p-4 rounded border mb-4">
                      <h5 className="font-medium mb-3">
                        Spine to Superspine Connections
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {networkIntent.interfaceMapping.spine.SPINE_TO_SUPERSPINE.map(
                          (intf, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <span className="text-sm w-16 text-gray-600">
                                Link {index + 1}:
                              </span>
                              <select
                                value={intf}
                                onChange={(e) =>
                                  updateInterfaceMapping(
                                    "spine",
                                    "SPINE_TO_SUPERSPINE",
                                    index,
                                    e.target.value
                                  )
                                }
                                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                              >
                                {generateInterfaceOptions(
                                  networkIntent.deviceConfig.spine
                                ).map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {networkIntent.racks.map((rack) => (
                    <div
                      key={rack.name}
                      className="bg-white p-4 rounded border mb-4"
                    >
                      <h5 className="font-medium mb-3">
                        Spine to {rack.name} Connections
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(
                          networkIntent.interfaceMapping.spine[
                            `SPINE_TO_${rack.name}`
                          ] ||
                          networkIntent.interfaceMapping.spine.SPINE_TO_RACK1
                        ).map((intf, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-sm w-16 text-gray-600">
                              Link {index + 1}:
                            </span>
                            <select
                              value={intf}
                              onChange={(e) =>
                                updateInterfaceMapping(
                                  "spine",
                                  `SPINE_TO_${rack.name}`,
                                  index,
                                  e.target.value
                                )
                              }
                              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                            >
                              {generateInterfaceOptions(
                                networkIntent.deviceConfig.spine
                              ).map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Superspine Interfaces */}
                {networkIntent.superspineEnabled && (
                  <div className="mb-8">
                    <h4 className="font-medium mb-4 text-lg">
                      Superspine Node Interface Assignment
                    </h4>
                    <div className="bg-white p-4 rounded border">
                      <h5 className="font-medium mb-3">
                        Superspine to Spine Connections
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {networkIntent.interfaceMapping.superspine.SUPERSPINE_TO_SPINE.map(
                          (intf, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <span className="text-sm w-16 text-gray-600">
                                Spine {index + 1}:
                              </span>
                              <select
                                value={intf}
                                onChange={(e) =>
                                  updateInterfaceMapping(
                                    "superspine",
                                    "SUPERSPINE_TO_SPINE",
                                    index,
                                    e.target.value
                                  )
                                }
                                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                              >
                                {generateInterfaceOptions(
                                  networkIntent.deviceConfig.superspine
                                ).map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Generic Node Info */}
                {networkIntent.racks.some((r) => r.hasGenericNodes) && (
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-medium mb-3">
                      Generic Node Interface Assignment
                    </h4>
                    <div className="text-sm text-gray-700">
                      <p className="mb-2">
                        Generic nodes automatically use their first two
                        interfaces to connect to leaf switches:
                      </p>
                      {networkIntent.racks
                        .filter((r) => r.hasGenericNodes)
                        .map((rack) => (
                          <div key={rack.name} className="mb-1">
                            <strong>{rack.name}:</strong>{" "}
                            {rack.genericNodeCount} nodes × 2 connections each
                            (Ethernet1/1/1, Ethernet1/1/2)
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <h6 className="font-medium text-yellow-900 mb-2">
                    Interface Mapping Notes
                  </h6>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>
                      • Interface assignments are applied to device profiles
                      during configuration generation
                    </li>
                    <li>
                      • Ensure selected interfaces exist on your chosen device
                      SKUs
                    </li>
                    <li>
                      • Avoid interface conflicts - each interface should be
                      used only once per device
                    </li>
                    <li>
                      • Default assignments work for most deployments if you
                      prefer to skip this step
                    </li>
                  </ul>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h6 className="font-medium text-blue-900 mb-1">
                        Interface Mapping Status
                      </h6>
                      <p className="text-sm text-blue-700">
                        {validateStep("interfaces")
                          ? "✅ Interface mapping is configured and ready for preview"
                          : "⚠️ Complete the interface mapping to proceed to preview"}
                      </p>
                    </div>
                    {validateStep("interfaces") && (
                      <button
                        onClick={handleCompleteWizard}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                      >
                        Complete & Preview
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Add the new Preview step */}
            {/* Add the new Preview step */}
            {currentStep === 6 && (
              <div className="space-y-6">
                {/* Only show if we came from completing interface mapping */}
                {completedSteps.includes("interfaces") ||
                validateStep("interfaces") ? (
                  <>
                    {/* Auto-generate message */}
                    {!generatedConfig && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-blue-700">
                          <Settings className="w-5 h-5 animate-spin" />
                          <span className="font-medium">
                            Generating configuration...
                          </span>
                        </div>
                      </div>
                    )}

                    {generatedConfig && (
                      <div className="space-y-6">
                        {/* Configuration Preview Tabs */}
                        <div className="bg-white rounded-xl border">
                          <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              <Eye className="w-5 h-5 text-gray-600" />
                              Configuration Preview & Download
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Review and download your generated device profiles
                              and node specifications
                            </p>
                          </div>

                          {/* Preview Tabs */}
                          <div className="flex border-b border-gray-200">
                            {[
                              {
                                id: "device",
                                label: "Device Profiles",
                                icon: Settings,
                              },
                              {
                                id: "nodes",
                                label: "Node Specifications",
                                icon: Network,
                              },
                            ].map(({ id, label, icon: Icon }) => (
                              <button
                                key={id}
                                onClick={() => setActivePreviewTab(id)}
                                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                                  activePreviewTab === id
                                    ? "bg-gray-50 text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                                {label}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (id === "device") {
                                      downloadDeviceProfiles();
                                    } else {
                                      downloadNodeSpec();
                                    }
                                  }}
                                  className="ml-2 p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                                  title={`Download ${label} JSON`}
                                >
                                  <Download className="w-3 h-3" />
                                </button>
                              </button>
                            ))}
                          </div>

                          <div className="p-6">
                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
                              <pre>
                                {activePreviewTab === "device" &&
                                  JSON.stringify(
                                    generatedConfig.device_profiles ||
                                      generateProfiles(),
                                    null,
                                    2
                                  )}
                                {activePreviewTab === "nodes" &&
                                  JSON.stringify(
                                    generatedConfig.node_spec ||
                                      generateNodeSpec().nodeSpec,
                                    null,
                                    2
                                  )}
                              </pre>
                            </div>

                            {/* Download Button for Active Tab */}
                            <div className="mt-4 flex justify-center">
                              <button
                                onClick={() => {
                                  if (activePreviewTab === "device") {
                                    downloadDeviceProfiles();
                                  } else {
                                    downloadNodeSpec();
                                  }
                                }}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                                  activePreviewTab === "device"
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-purple-600 text-white hover:bg-purple-700"
                                }`}
                              >
                                <Download className="w-4 h-4" />
                                Download{" "}
                                {activePreviewTab === "device"
                                  ? "Device Profiles"
                                  : "Node Specifications"}{" "}
                                JSON
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Success Message */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-green-800">
                            <span className="text-green-600">✅</span>
                            <span className="font-medium">
                              Configuration Generated Successfully!
                            </span>
                          </div>
                          <p className="text-green-700 text-sm mt-1">
                            Your network configuration is ready. Use the tabs
                            above to review and download the specific
                            configuration files you need.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <div className="flex items-center justify-center gap-2 text-yellow-700 mb-4">
                      <Settings className="w-6 h-6" />
                      <span className="font-medium text-lg">
                        Complete Interface Mapping First
                      </span>
                    </div>
                    <p className="text-yellow-800 mb-4">
                      You need to complete the Interface Mapping step before you
                      can preview and download configurations.
                    </p>
                    <button
                      onClick={() => setCurrentStep(5)}
                      className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all"
                    >
                      Go Back to Interface Mapping
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons - Update this section */}
          {currentStep < wizardSteps.length - 1 && (
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                onClick={goToPreviousStep}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  currentStep === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Minus className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  {completedSteps.length} of{" "}
                  {wizardSteps.filter((step) => step.required).length} required
                  steps completed
                </div>

                {currentStep === 5 ? (
                  <button
                    onClick={handleCompleteWizard}
                    disabled={!validateStep(wizardSteps[currentStep].id)}
                    className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all ${
                      !validateStep(wizardSteps[currentStep].id)
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-purple-600 text-white hover:from-green-700 hover:to-purple-700 shadow-lg"
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Go to Preview
                  </button>
                ) : (
                  <button
                    onClick={goToNextStep}
                    disabled={!validateStep(wizardSteps[currentStep].id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      !validateStep(wizardSteps[currentStep].id)
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700"
                    }`}
                  >
                    Next
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntentBasedNetworkDesigner;
