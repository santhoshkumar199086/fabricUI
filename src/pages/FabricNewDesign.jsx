import React, { useState, useMemo } from 'react';
import { Plus, Minus, Network, Download, Eye, Settings, Cpu, Cable, ArrowRight, Trash2 } from 'lucide-react';

const IntentBasedNetworkDesigner = () => {
  const [activeTab, setActiveTab] = useState('intent');
  const [networkIntent, setNetworkIntent] = useState({
    fabricInfo: {
      fabricName: 'DC-Fabric-01',
      site: 'Bengaluru'
    },
    topology: 'spine-leaf',
    spineCount: 2,
    leafCount: 4,
    superspineEnabled: false,
    racks: [
      { name: 'RACK1', leafCount: 2, hasGenericNodes: false },
      { name: 'RACK2', leafCount: 2, hasGenericNodes: true }
    ],
    commonASN: 64512,
    linkConfig: {
      spineToLeaf: 2,
      leafToSpine: 2,
      spineToSuperspine: 1
    },
    deviceConfig: {
      spine: 'Force10-S6000',
      superspine: 'Force10-S6000',
      leaf: 'Force10-S6000',
      genericNode: 'Force10-S4810'
    },
    ipPools: {
      SUPERSPINE_LOOPBACK: '10.0.0.0/24',
      SPINE_LOOPBACK: '10.0.1.0/24',
      RACK1_LOOPBACK: '10.0.2.0/24',
      RACK2_LOOPBACK: '10.0.3.0/24',
      GENERIC_NODE_LOOPBACK: '10.0.4.0/24'
    },
    interfaceMapping: {
      leaf: {
        LEAF_TO_SPINE: ['Ethernet1/1/2', 'Ethernet1/1/3'],
        LEAF_TO_GENERIC_NODE: ['Ethernet1/1/4', 'Ethernet1/1/5']
      },
      spine: {
        SPINE_TO_SUPERSPINE: ['Ethernet1/1/1'],
        SPINE_TO_RACK1: ['Ethernet1/1/2', 'Ethernet1/1/3'],
        SPINE_TO_RACK2: ['Ethernet1/1/4', 'Ethernet1/1/5']
      },
      superspine: {
        SUPERSPINE_TO_SPINE: ['Ethernet1/1/1', 'Ethernet1/1/2']
      }
    }
  });

  const [generatedConfig, setGeneratedConfig] = useState(null);

  // Function to generate nodeSpec based on intent
  const generateNodeSpec = () => {
    const ipSpec = {};
    const nodeSpec = {};

    // Generate IP pools based on enabled nodes
    if (networkIntent.superspineEnabled) {
      ipSpec.SUPERSPINE_LOOPBACK = {
        name: "SUPERSPINE_LOOPBACK",
        v4: {
          prefixes: [networkIntent.ipPools.SUPERSPINE_LOOPBACK]
        }
      };
    }

    ipSpec.SPINE_LOOPBACK = {
      name: "SPINE_LOOPBACK",
      v4: {
        prefixes: [networkIntent.ipPools.SPINE_LOOPBACK]
      }
    };

    // Generate rack-specific IP pools
    networkIntent.racks.forEach(rack => {
      ipSpec[`${rack.name}_LOOPBACK`] = {
        name: `${rack.name}_LOOPBACK`,
        v4: {
          prefixes: [networkIntent.ipPools[`${rack.name}_LOOPBACK`]]
        }
      };
    });

    // Add generic node IP pool if any rack has generic nodes
    if (networkIntent.racks.some(r => r.hasGenericNodes)) {
      ipSpec.GENERIC_NODE_LOOPBACK = {
        name: "GENERIC_NODE_LOOPBACK",
        v4: {
          prefixes: [networkIntent.ipPools.GENERIC_NODE_LOOPBACK]
        }
      };
    }
    
    // Generate rack leaf nodes
    networkIntent.racks.forEach(rack => {
      const rackName = `${rack.name}-LEAF`;
      nodeSpec[rackName] = {
        allowedSKUs: [networkIntent.deviceConfig.leaf],
        asn: networkIntent.commonASN,
        interfaceRoutingSpec: {
          "spine-rs": {
            exportRoute: {
              name: "SPINE_EXPORT",
              terms: [{ name: "ADVERTISE_ALL", type: "accept-on-match" }]
            },
            importRoute: {
              name: "SPINE_IMPORT",
              terms: [{
                firstOfConditionList: [{
                  matchIPPrefix: { matchAllocationPools: [`${rack.name}_LOOPBACK`] }
                }],
                name: "ACCEPT_ALL",
                type: "accept-on-match"
              }]
            },
            peerGroup: { allowASIn: 1, name: `SPINE_TO_${rack.name}` }
          }
        },
        interfaceSpec: {
          loopback: {
            ipAllocationSpec: { IPv4: true, pool: `${rack.name}_LOOPBACK` },
            redistributeLoopback: { scope: "GLOBAL" }
          },
          transit: {
            LEAF_TO_SPINE: {
              connectsTo: {
                interfaceRole: `SPINE_TO_${rack.name}`,
                linkCount: 1,
                nodeRole: "SPINE",
                nodeStep: 1
              },
              count: networkIntent.linkConfig.leafToSpine,
              role: "LEAF_TO_SPINE",
              routingSpec: "spine-rs",
              unnumbered: true
            }
          }
        },
        leaf: rack.name === 'RACK1',
        leafCount: rack.leafCount,
        nodeProfile: "LEAF",
        role: rackName
      };

      // Add generic node connection if enabled
      if (rack.hasGenericNodes) {
        nodeSpec[rackName].interfaceRoutingSpec["leaf-rs"] = {
          exportRoute: {
            name: "LEAF_EXPORT",
            terms: [{ name: "ADVERTISE_ALL", type: "accept-on-match" }]
          },
          importRoute: {
            name: "LEAF_IMPORT",
            terms: [{ name: "ACCEPT_ALL", type: "accept-on-match" }]
          },
          peerGroup: { allowASIn: 1, name: "LEAF_TO_SPINE" }
        };

        nodeSpec[rackName].interfaceSpec.transit.LEAF_TO_GENERIC_NODE = {
          connectsFrom: {
            interfaceRole: "GENERIC_NODE_TO_LEAF",
            nodeRole: "GENERIC-NODE"
          },
          count: 2,
          role: "LEAF_TO_GENERIC_NODE",
          routingSpec: "leaf-rs",
          unnumbered: true
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
            terms: [{ name: "ADVERTISE_ALL", type: "accept-on-match" }]
          },
          importRoute: {
            name: "LEAF_IMPORT",
            terms: [{ name: "ACCEPT_ALL", type: "accept-on-match" }]
          },
          peerGroup: { allowASIn: 1, name: "LEAF_TO_SPINE" }
        }
      },
      interfaceSpec: {
        loopback: {
          ipAllocationSpec: { IPv4: true, pool: "SPINE_LOOPBACK" },
          redistributeLoopback: { scope: "GLOBAL" }
        },
        transit: {}
      },
      nodeProfile: "SPINE",
      role: "SPINE"
    };

    // Add superspine configuration if enabled
    if (networkIntent.superspineEnabled) {
      nodeSpec.SPINE.interfaceRoutingSpec["super-spine-rs"] = {
        importRoute: {
          name: "SUPERSPINE_IMPORT",
          terms: [{ type: "accept-on-match", name: "ACCEPT_ALL" }]
        },
        exportRoute: {
          name: "SUPERSPINE_EXPORT",
          terms: [{ type: "accept-on-match", name: "ADVERTISE_ALL" }]
        },
        peerGroup: { allowASIn: 1, name: "SPINE_TO_SUPERSPINE" }
      };

      nodeSpec.SPINE.interfaceSpec.transit.SPINE_TO_SUPERSPINE = {
        role: "SPINE_TO_SUPERSPINE",
        count: networkIntent.linkConfig.spineToSuperspine,
        connectsTo: {
          nodeRole: "SUPERSPINE",
          interfaceRole: "SUPERSPINE_TO_SPINE",
          linkCount: 1,
          nodeStep: 1
        },
        unnumbered: true,
        routingSpec: "super-spine-rs"
      };

      // Generate superspine node
      nodeSpec.SUPERSPINE = {
        role: "SUPERSPINE",
        asn: networkIntent.commonASN,
        allowedSKUs: [networkIntent.deviceConfig.superspine],
        nodeProfile: "SUPERSPINE",
        interfaceRoutingSpec: {
          "spine-rs": {
            importRoute: {
              name: "SPINE_IMPORT",
              terms: [{ type: "accept-on-match", name: "ACCEPT_ALL" }]
            },
            exportRoute: {
              name: "SPINE_EXPORT",
              terms: [{ type: "accept-on-match", name: "ADVERTISE_ALL" }]
            },
            peerGroup: { allowASIn: 1, name: "SUPERSPINE_TO_SPINE" }
          }
        },
        interfaceSpec: {
          loopback: {
            ipAllocationSpec: { pool: "SUPERSPINE_LOOPBACK", IPv4: true },
            redistributeLoopback: { scope: "GLOBAL" }
          },
          transit: {
            SUPERSPINE_TO_SPINE: {
              role: "SUPERSPINE_TO_SPINE",
              count: networkIntent.spineCount,
              connectsFrom: {
                nodeRole: "SPINE",
                interfaceRole: "SPINE_TO_SUPERSPINE"
              },
              unnumbered: true,
              routingSpec: "spine-rs"
            }
          }
        }
      };
    }

    // Add rack connections to spine
    networkIntent.racks.forEach(rack => {
      nodeSpec.SPINE.interfaceSpec.transit[`SPINE_TO_${rack.name}`] = {
        connectsFrom: {
          interfaceRole: "LEAF_TO_SPINE",
          nodeRole: `${rack.name}-LEAF`
        },
        count: networkIntent.linkConfig.spineToLeaf,
        role: `SPINE_TO_${rack.name}`,
        routingSpec: "leaf-rs",
        unnumbered: true
      };
    });

    // Add generic node if any rack has generic nodes
    if (networkIntent.racks.some(r => r.hasGenericNodes)) {
      nodeSpec["GENERIC-NODE"] = {
        role: "GENERIC-NODE",
        asn: networkIntent.commonASN,
        allowedSKUs: [networkIntent.deviceConfig.genericNode],
        nodeProfile: "GENERIC",
        interfaceSpec: {
          loopback: {
            ipAllocationSpec: { pool: "GENERIC_NODE_LOOPBACK", IPv4: true },
            redistributeLoopback: { scope: "GLOBAL" }
          },
          transit: {
            GENERIC_NODE_TO_LEAF: {
              role: "GENERIC_NODE_TO_LEAF",
              count: 2,
              connectsTo: {
                nodeRole: "RACK2-LEAF", // Connect to rack with generic nodes
                interfaceRole: "LEAF_TO_GENERIC_NODE",
                linkCount: 1,
                nodeStep: 1
              },
              unnumbered: true
            }
          }
        }
      };
    }

    return {
      name: networkIntent.fabricInfo.fabricName,
      site: networkIntent.fabricInfo.site,
      ipSpec,
      nodeSpec
    };
  };

  // Function to generate profiles based on intent
  const generateProfiles = () => {
    const baseBreakout = {};
    // Static interface speed
    const interfaceSpeed = '1x40G';
    for (let i = 1; i <= 28; i++) {
      baseBreakout[`Ethernet1/1/${i}`] = interfaceSpeed;
    }

    // Static interface defaults
    const interfaceDefaults = {
      mtu: 9100,
      fec: 'none'
    };

    const profiles = {
      LEAF: {
        breakout: baseBreakout,
        panelMap: {
          LEAF_TO_SPINE: {}
        },
        interfaceDefaults
      },
      SPINE: {
        breakout: baseBreakout,
        panelMap: {},
        interfaceDefaults
      }
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
      networkIntent.interfaceMapping.spine.SPINE_TO_SUPERSPINE.forEach((intf, index) => {
        if (index < networkIntent.linkConfig.spineToSuperspine) {
          profiles.SPINE.panelMap.SPINE_TO_SUPERSPINE[index.toString()] = intf;
        }
      });
    }

    // Add rack-specific mappings to spine
    networkIntent.racks.forEach(rack => {
      const rackKey = `SPINE_TO_${rack.name}`;
      profiles.SPINE.panelMap[rackKey] = {};
      
      const interfaceList = networkIntent.interfaceMapping.spine[rackKey] || 
                           networkIntent.interfaceMapping.spine.SPINE_TO_RACK1; // fallback
      
      interfaceList.forEach((intf, index) => {
        if (index < networkIntent.linkConfig.spineToLeaf) {
          profiles.SPINE.panelMap[rackKey][index.toString()] = intf;
        }
      });
    });

    // Add generic node mapping to leaf if needed
    const hasGenericNodes = networkIntent.racks.some(r => r.hasGenericNodes);
    if (hasGenericNodes) {
      profiles.LEAF.panelMap.LEAF_TO_GENERIC_NODE = {};
      networkIntent.interfaceMapping.leaf.LEAF_TO_GENERIC_NODE.forEach((intf, index) => {
        profiles.LEAF.panelMap.LEAF_TO_GENERIC_NODE[index.toString()] = intf;
      });

      // Add generic node profile
      profiles.GENERIC = {
        breakout: baseBreakout,
        panelMap: {
          GENERIC_NODE_TO_LEAF: {
            "0": "Ethernet1/1/1",
            "1": "Ethernet1/1/2"
          }
        },
        interfaceDefaults
      };
    }

    // Add superspine profile if enabled
    if (networkIntent.superspineEnabled) {
      profiles.SUPERSPINE = {
        breakout: baseBreakout,
        panelMap: {
          SUPERSPINE_TO_SPINE: {}
        },
        interfaceDefaults
      };

      networkIntent.interfaceMapping.superspine.SUPERSPINE_TO_SPINE.forEach((intf, index) => {
        if (index < networkIntent.spineCount) {
          profiles.SUPERSPINE.panelMap.SUPERSPINE_TO_SPINE[index.toString()] = intf;
        }
      });
    }

    return profiles;
  };

  const handleGenerateConfig = () => {
    const config = generateNodeSpec();
    const profiles = generateProfiles();
    setGeneratedConfig({ ...config, profiles });
    setActiveTab('preview');
  };

  const addRack = () => {
    const newRackName = `RACK${networkIntent.racks.length + 1}`;
    const newIpPool = `10.0.${networkIntent.racks.length + 2}.0/24`;
    
    setNetworkIntent(prev => ({
      ...prev,
      racks: [...prev.racks, { 
        name: newRackName, 
        leafCount: 2, 
        hasGenericNodes: false 
      }],
      ipPools: {
        ...prev.ipPools,
        [`${newRackName}_LOOPBACK`]: newIpPool
      },
      interfaceMapping: {
        ...prev.interfaceMapping,
        spine: {
          ...prev.interfaceMapping.spine,
          [`SPINE_TO_${newRackName}`]: [`Ethernet1/1/${Object.keys(prev.interfaceMapping.spine).length + 2}`, `Ethernet1/1/${Object.keys(prev.interfaceMapping.spine).length + 3}`]
        }
      }
    }));
  };

  const removeRack = (index) => {
    const rackToRemove = networkIntent.racks[index];
    setNetworkIntent(prev => {
      const newIpPools = {...prev.ipPools};
      delete newIpPools[`${rackToRemove.name}_LOOPBACK`];
      
      const newSpineMapping = {...prev.interfaceMapping.spine};
      delete newSpineMapping[`SPINE_TO_${rackToRemove.name}`];
      
      return {
        ...prev,
        racks: prev.racks.filter((_, i) => i !== index),
        ipPools: newIpPools,
        interfaceMapping: {
          ...prev.interfaceMapping,
          spine: newSpineMapping
        }
      };
    });
  };

  const updateRack = (index, field, value) => {
    setNetworkIntent(prev => ({
      ...prev,
      racks: prev.racks.map((rack, i) => 
        i === index ? { ...rack, [field]: value } : rack
      )
    }));
  };

  const updateInterfaceMapping = (nodeType, connectionType, interfaceIndex, value) => {
    setNetworkIntent(prev => ({
      ...prev,
      interfaceMapping: {
        ...prev.interfaceMapping,
        [nodeType]: {
          ...prev.interfaceMapping[nodeType],
          [connectionType]: prev.interfaceMapping[nodeType][connectionType].map((intf, idx) => 
            idx === interfaceIndex ? value : intf
          )
        }
      }
    }));
  };

  const addInterfaceToMapping = (nodeType, connectionType) => {
    const newInterface = `Ethernet1/1/${Math.max(...Array.from({length: 28}, (_, i) => i + 1))}`;
    setNetworkIntent(prev => ({
      ...prev,
      interfaceMapping: {
        ...prev.interfaceMapping,
        [nodeType]: {
          ...prev.interfaceMapping[nodeType],
          [connectionType]: [...prev.interfaceMapping[nodeType][connectionType], newInterface]
        }
      }
    }));
  };

  const removeInterfaceFromMapping = (nodeType, connectionType, interfaceIndex) => {
    setNetworkIntent(prev => ({
      ...prev,
      interfaceMapping: {
        ...prev.interfaceMapping,
        [nodeType]: {
          ...prev.interfaceMapping[nodeType],
          [connectionType]: prev.interfaceMapping[nodeType][connectionType].filter((_, idx) => idx !== interfaceIndex)
        }
      }
    }));
  };

  const generateInterfaceOptions = () => {
    const options = [];
    for (let i = 1; i <= 28; i++) {
      options.push(`Ethernet1/1/${i}`);
    }
    return options;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <Network className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Intent-Based Network Designer</h1>
          </div>
          <p className="text-green-100">Design your network using simple intentions - we'll generate the configuration</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-100 border-b">
          <div className="flex">
            {[
              { id: 'intent', label: 'Network Intent', icon: Settings },
              { id: 'preview', label: 'Generated Config', icon: Eye },
              { id: 'export', label: 'Export', icon: Download }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-white text-green-600 border-b-2 border-green-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'intent' && (
            <div className="space-y-8">
              {/* Fabric Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-blue-900 flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Fabric Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-blue-800">Fabric Name</label>
                    <input
                      type="text"
                      value={networkIntent.fabricInfo.fabricName}
                      onChange={(e) => setNetworkIntent(prev => ({
                        ...prev,
                        fabricInfo: {...prev.fabricInfo, fabricName: e.target.value}
                      }))}
                      placeholder="Enter fabric name (e.g., DC-Fabric-01)"
                      className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-blue-800">Site Location</label>
                    <select 
                      value={networkIntent.fabricInfo.site}
                      onChange={(e) => setNetworkIntent(prev => ({
                        ...prev,
                        fabricInfo: {...prev.fabricInfo, site: e.target.value}
                      }))}
                      className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Chennai">Chennai</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Current Configuration:</strong> {networkIntent.fabricInfo.fabricName} located in {networkIntent.fabricInfo.site}
                  </p>
                </div>
              </div>

              {/* Topology Configuration */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Network Topology</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Topology Type</label>
                    <select 
                      value={networkIntent.topology}
                      onChange={(e) => setNetworkIntent(prev => ({...prev, topology: e.target.value}))}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="spine-leaf">Spine-Leaf</option>
                      <option value="three-tier">Three-Tier (with Superspine)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Spine Count</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={networkIntent.spineCount}
                      onChange={(e) => setNetworkIntent(prev => ({...prev, spineCount: parseInt(e.target.value)}))}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Spine Device SKU</label>
                    <select
                      value={networkIntent.deviceConfig.spine}
                      onChange={(e) => setNetworkIntent(prev => ({
                        ...prev,
                        deviceConfig: {...prev.deviceConfig, spine: e.target.value}
                      }))}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="Force10-S6000">Force10-S6000</option>
                      <option value="Force10-S4810">Force10-S4810</option>
                      <option value="Force10-S3048">Force10-S3048</option>
                      <option value="Arista-7050SX-64">Arista-7050SX-64</option>
                      <option value="Arista-7260CX3-64">Arista-7260CX3-64</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={networkIntent.superspineEnabled}
                        onChange={(e) => setNetworkIntent(prev => ({...prev, superspineEnabled: e.target.checked}))}
                        className="mr-2"
                      />
                      Enable Superspine Layer
                    </label>
                  </div>

                  {networkIntent.superspineEnabled && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Superspine Device SKU</label>
                      <select
                        value={networkIntent.deviceConfig.superspine}
                        onChange={(e) => setNetworkIntent(prev => ({
                          ...prev,
                          deviceConfig: {...prev.deviceConfig, superspine: e.target.value}
                        }))}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="Force10-S6000">Force10-S6000</option>
                        <option value="Force10-S4810">Force10-S4810</option>
                        <option value="Force10-S3048">Force10-S3048</option>
                        <option value="Arista-7050SX-64">Arista-7050SX-64</option>
                        <option value="Arista-7260CX3-64">Arista-7260CX3-64</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Rack Configuration */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Rack Configuration</h3>
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
                          <label className="block text-sm font-medium mb-1">Rack Name</label>
                          <input
                            type="text"
                            value={rack.name}
                            onChange={(e) => updateRack(index, 'name', e.target.value)}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Leaf Count</label>
                          <input
                            type="number"
                            min="1"
                            max="8"
                            value={rack.leafCount}
                            onChange={(e) => updateRack(index, 'leafCount', parseInt(e.target.value))}
                            className="w-full p-2 border rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Leaf Device SKU</label>
                          <select
                            value={networkIntent.deviceConfig.leaf}
                            onChange={(e) => setNetworkIntent(prev => ({
                              ...prev,
                              deviceConfig: {...prev.deviceConfig, leaf: e.target.value}
                            }))}
                            className="w-full p-2 border rounded"
                          >
                            <option value="Force10-S6000">Force10-S6000</option>
                            <option value="Force10-S4810">Force10-S4810</option>
                            <option value="Force10-S3048">Force10-S3048</option>
                            <option value="Arista-7050SX-64">Arista-7050SX-64</option>
                            <option value="Arista-7260CX3-64">Arista-7260CX3-64</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={rack.hasGenericNodes}
                              onChange={(e) => updateRack(index, 'hasGenericNodes', e.target.checked)}
                              className="mr-2"
                            />
                            Connect Generic Nodes
                          </label>
                        </div>
                      </div>

                      {rack.hasGenericNodes && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Generic Node Device SKU</label>
                              <select
                                value={networkIntent.deviceConfig.genericNode}
                                onChange={(e) => setNetworkIntent(prev => ({
                                  ...prev,
                                  deviceConfig: {...prev.deviceConfig, genericNode: e.target.value}
                                }))}
                                className="w-full p-2 border rounded"
                              >
                                <option value="Force10-S4810">Force10-S4810</option>
                                <option value="Force10-S3048">Force10-S3048</option>
                                <option value="Force10-S6000">Force10-S6000</option>
                                <option value="Arista-7050SX-64">Arista-7050SX-64</option>
                                <option value="Arista-7260CX3-64">Arista-7260CX3-64</option>
                              </select>
                            </div>
                            <div className="flex items-center">
                              <p className="text-sm text-gray-600">Generic nodes will connect to this rack's leaf switches</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Common ASN Configuration */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Network Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Common ASN (All Nodes)</label>
                    <input
                      type="number"
                      value={networkIntent.commonASN}
                      onChange={(e) => setNetworkIntent(prev => ({
                        ...prev, 
                        commonASN: parseInt(e.target.value)
                      }))}
                      className="w-full p-2 border rounded-lg"
                      placeholder="e.g., 64512"
                    />
                    <p className="text-xs text-gray-500 mt-1">All nodes will use this ASN for BGP</p>
                  </div>
                  <div className="flex items-center">
                    <div className="p-3 bg-yellow-50 rounded-lg w-full">
                      <p className="text-sm text-yellow-700">
                        <strong>Static Settings:</strong> MTU: 9100, FEC: none, Interface Speed: 1x40G
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* IP Pool Configuration */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">IP Pool Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {networkIntent.superspineEnabled && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Superspine Loopback Pool</label>
                      <input
                        type="text"
                        value={networkIntent.ipPools.SUPERSPINE_LOOPBACK}
                        onChange={(e) => setNetworkIntent(prev => ({
                          ...prev,
                          ipPools: {...prev.ipPools, SUPERSPINE_LOOPBACK: e.target.value}
                        }))}
                        placeholder="10.0.0.0/24"
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Spine Loopback Pool</label>
                    <input
                      type="text"
                      value={networkIntent.ipPools.SPINE_LOOPBACK}
                      onChange={(e) => setNetworkIntent(prev => ({
                        ...prev,
                        ipPools: {...prev.ipPools, SPINE_LOOPBACK: e.target.value}
                      }))}
                      placeholder="10.0.1.0/24"
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  {networkIntent.racks.map(rack => (
                    <div key={rack.name}>
                      <label className="block text-sm font-medium mb-2">{rack.name} Loopback Pool</label>
                      <input
                        type="text"
                        value={networkIntent.ipPools[`${rack.name}_LOOPBACK`] || ''}
                        onChange={(e) => setNetworkIntent(prev => ({
                          ...prev,
                          ipPools: {...prev.ipPools, [`${rack.name}_LOOPBACK`]: e.target.value}
                        }))}
                        placeholder={`10.0.${networkIntent.racks.indexOf(rack) + 2}.0/24`}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  ))}

                  {networkIntent.racks.some(r => r.hasGenericNodes) && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Generic Node Loopback Pool</label>
                      <input
                        type="text"
                        value={networkIntent.ipPools.GENERIC_NODE_LOOPBACK}
                        onChange={(e) => setNetworkIntent(prev => ({
                          ...prev,
                          ipPools: {...prev.ipPools, GENERIC_NODE_LOOPBACK: e.target.value}
                        }))}
                        placeholder="10.0.4.0/24"
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  )}
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    <strong>Note:</strong> IP pools are only shown for enabled nodes. Add racks or enable features to see more pools.
                  </p>
                </div>
              </div>

              {/* Link Configuration */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Link Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Spine to Leaf Links</label>
                    <input
                      type="number"
                      min="1"
                      max="4"
                      value={networkIntent.linkConfig.spineToLeaf}
                      onChange={(e) => setNetworkIntent(prev => ({
                        ...prev, 
                        linkConfig: {...prev.linkConfig, spineToLeaf: parseInt(e.target.value)}
                      }))}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Leaf to Spine Links</label>
                    <input
                      type="number"
                      min="1"
                      max="4"
                      value={networkIntent.linkConfig.leafToSpine}
                      onChange={(e) => setNetworkIntent(prev => ({
                        ...prev, 
                        linkConfig: {...prev.linkConfig, leafToSpine: parseInt(e.target.value)}
                      }))}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>

                  {networkIntent.superspineEnabled && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Spine to Superspine Links</label>
                      <input
                        type="number"
                        min="1"
                        max="4"
                        value={networkIntent.linkConfig.spineToSuperspine}
                        onChange={(e) => setNetworkIntent(prev => ({
                          ...prev, 
                          linkConfig: {...prev.linkConfig, spineToSuperspine: parseInt(e.target.value)}
                        }))}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Interface Configuration */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Interface Mapping</h3>
                
                {/* Leaf Interface Mapping */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Leaf Node Interfaces</h4>
                  
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded border">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-medium">Leaf to Spine Connections</h5>
                        <button
                          onClick={() => addInterfaceToMapping('leaf', 'LEAF_TO_SPINE')}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {networkIntent.interfaceMapping.leaf.LEAF_TO_SPINE.map((intf, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <select
                              value={intf}
                              onChange={(e) => updateInterfaceMapping('leaf', 'LEAF_TO_SPINE', index, e.target.value)}
                              className="flex-1 p-2 border rounded text-sm"
                            >
                              {generateInterfaceOptions().map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                            {networkIntent.interfaceMapping.leaf.LEAF_TO_SPINE.length > 1 && (
                              <button
                                onClick={() => removeInterfaceFromMapping('leaf', 'LEAF_TO_SPINE', index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded border">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-medium">Leaf to Generic Node Connections</h5>
                        <button
                          onClick={() => addInterfaceToMapping('leaf', 'LEAF_TO_GENERIC_NODE')}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {networkIntent.interfaceMapping.leaf.LEAF_TO_GENERIC_NODE.map((intf, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <select
                              value={intf}
                              onChange={(e) => updateInterfaceMapping('leaf', 'LEAF_TO_GENERIC_NODE', index, e.target.value)}
                              className="flex-1 p-2 border rounded text-sm"
                            >
                              {generateInterfaceOptions().map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                            {networkIntent.interfaceMapping.leaf.LEAF_TO_GENERIC_NODE.length > 1 && (
                              <button
                                onClick={() => removeInterfaceFromMapping('leaf', 'LEAF_TO_GENERIC_NODE', index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spine Interface Mapping */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Spine Node Interfaces</h4>
                  
                  <div className="space-y-4">
                    {networkIntent.superspineEnabled && (
                      <div className="bg-white p-4 rounded border">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-medium">Spine to Superspine Connections</h5>
                          <button
                            onClick={() => addInterfaceToMapping('spine', 'SPINE_TO_SUPERSPINE')}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {networkIntent.interfaceMapping.spine.SPINE_TO_SUPERSPINE.map((intf, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <select
                                value={intf}
                                onChange={(e) => updateInterfaceMapping('spine', 'SPINE_TO_SUPERSPINE', index, e.target.value)}
                                className="flex-1 p-2 border rounded text-sm"
                              >
                                {generateInterfaceOptions().map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                              {networkIntent.interfaceMapping.spine.SPINE_TO_SUPERSPINE.length > 1 && (
                                <button
                                  onClick={() => removeInterfaceFromMapping('spine', 'SPINE_TO_SUPERSPINE', index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {networkIntent.racks.map(rack => (
                      <div key={rack.name} className="bg-white p-4 rounded border">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-medium">Spine to {rack.name} Connections</h5>
                          <button
                            onClick={() => addInterfaceToMapping('spine', `SPINE_TO_${rack.name}`)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {(networkIntent.interfaceMapping.spine[`SPINE_TO_${rack.name}`] || networkIntent.interfaceMapping.spine.SPINE_TO_RACK1).map((intf, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <select
                                value={intf}
                                onChange={(e) => updateInterfaceMapping('spine', `SPINE_TO_${rack.name}`, index, e.target.value)}
                                className="flex-1 p-2 border rounded text-sm"
                              >
                                {generateInterfaceOptions().map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                              {(networkIntent.interfaceMapping.spine[`SPINE_TO_${rack.name}`] || networkIntent.interfaceMapping.spine.SPINE_TO_RACK1).length > 1 && (
                                <button
                                  onClick={() => removeInterfaceFromMapping('spine', `SPINE_TO_${rack.name}`, index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Superspine Interface Mapping */}
                {networkIntent.superspineEnabled && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Superspine Node Interfaces</h4>
                    
                    <div className="bg-white p-4 rounded border">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-medium">Superspine to Spine Connections</h5>
                        <button
                          onClick={() => addInterfaceToMapping('superspine', 'SUPERSPINE_TO_SPINE')}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {networkIntent.interfaceMapping.superspine.SUPERSPINE_TO_SPINE.map((intf, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <select
                              value={intf}
                              onChange={(e) => updateInterfaceMapping('superspine', 'SUPERSPINE_TO_SPINE', index, e.target.value)}
                              className="flex-1 p-2 border rounded text-sm"
                            >
                              {generateInterfaceOptions().map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                            {networkIntent.interfaceMapping.superspine.SUPERSPINE_TO_SPINE.length > 1 && (
                              <button
                                onClick={() => removeInterfaceFromMapping('superspine', 'SUPERSPINE_TO_SPINE', index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <button
                  onClick={handleGenerateConfig}
                  className="px-8 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Generate Network Configuration
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-6">
              {generatedConfig ? (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Generated Configuration</h3>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <h4 className="text-lg font-medium mb-3">Network Configuration Structure</h4>
                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono">
                        <pre>{JSON.stringify({
                          name: generatedConfig.name,
                          site: generatedConfig.site,
                          ipSpec: generatedConfig.ipSpec,
                          nodeSpec: generatedConfig.nodeSpec
                        }, null, 2)}</pre>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-3">Profiles Configuration</h4>
                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono">
                        <pre>{JSON.stringify(generatedConfig.profiles, null, 2)}</pre>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-blue-900 mb-2">Configuration Info</h5>
                      <div className="text-sm text-blue-700">
                        <div>Fabric: {generatedConfig.name}</div>
                        <div>Site: {generatedConfig.site}</div>
                        <div>IP Pools: {Object.keys(generatedConfig.ipSpec).length}</div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-green-900 mb-2">Node Specifications</h5>
                      <div className="text-sm text-green-700">
                        <div>Total Nodes: {Object.keys(generatedConfig.nodeSpec).length}</div>
                        <div>Rack Nodes: {Object.keys(generatedConfig.nodeSpec).filter(k => k.includes('RACK')).length}</div>
                        <div>Infrastructure: {Object.keys(generatedConfig.nodeSpec).filter(k => !k.includes('RACK')).length}</div>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-purple-900 mb-2">Profiles</h5>
                      <div className="text-sm text-purple-700">
                        <div>Total Profiles: {Object.keys(generatedConfig.profiles).length}</div>
                        <div>Interface Speed: 1x40G</div>
                        <div>MTU: 9100</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Network className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Generate a configuration from the Intent tab to see the preview</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-6">
              {generatedConfig ? (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Export Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => {
                        const configData = {
                          name: generatedConfig.name,
                          site: generatedConfig.site,
                          ipSpec: generatedConfig.ipSpec,
                          nodeSpec: generatedConfig.nodeSpec
                        };
                        const blob = new Blob([JSON.stringify(configData, null, 2)], 
                          { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${networkIntent.fabricInfo.fabricName}_${networkIntent.fabricInfo.site}_config.json`;
                        a.click();
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Download className="w-5 h-5" />
                      Download Full Configuration
                    </button>
                    
                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(generatedConfig.profiles, null, 2)], 
                          { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${networkIntent.fabricInfo.fabricName}_${networkIntent.fabricInfo.site}_profiles.json`;
                        a.click();
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <Download className="w-5 h-5" />
                      Download Profiles JSON
                    </button>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Configuration Summary</h4>
                    <div className="text-sm space-y-1">
                      <div>• <strong>Fabric Name:</strong> {networkIntent.fabricInfo.fabricName}</div>
                      <div>• <strong>Site Location:</strong> {networkIntent.fabricInfo.site}</div>
                      <div>• <strong>Topology:</strong> {networkIntent.superspineEnabled ? 'Three-Tier' : 'Spine-Leaf'}</div>
                      <div>• <strong>Common ASN:</strong> {networkIntent.commonASN}</div>
                      <div>• <strong>Spine Count:</strong> {networkIntent.spineCount}</div>
                      <div>• <strong>Rack Count:</strong> {networkIntent.racks.length}</div>
                      <div>• <strong>Total Leaf Nodes:</strong> {networkIntent.racks.reduce((sum, rack) => sum + rack.leafCount, 0)}</div>
                      <div>• <strong>Spine SKU:</strong> {networkIntent.deviceConfig.spine}</div>
                      <div>• <strong>Leaf SKU:</strong> {networkIntent.deviceConfig.leaf}</div>
                      {networkIntent.superspineEnabled && <div>• <strong>Superspine SKU:</strong> {networkIntent.deviceConfig.superspine}</div>}
                      {networkIntent.racks.some(r => r.hasGenericNodes) && <div>• <strong>Generic Node SKU:</strong> {networkIntent.deviceConfig.genericNode}</div>}
                      <div>• <strong>Interface Speed:</strong> 1x40G</div>
                      <div>• <strong>MTU:</strong> 9100</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Download className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Generate a configuration first to enable export options</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntentBasedNetworkDesigner;