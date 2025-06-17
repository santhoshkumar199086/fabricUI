import React, { useState } from 'react';
import { Settings, Network, Layers, Eye, Edit2, Save, X, Plus, Globe, Trash2, Server, Download } from 'lucide-react';
import axios from 'axios';
const SITE_API_URL = import.meta.env.VITE_API_URL;

const FabricConfigApp = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [showIPModal, setShowIPModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [ipPools, setIpPools] = useState([]);
  const [newPool, setNewPool] = useState({ name: '', prefix: '' });
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [nodeTypes, setNodeTypes] = useState([]);
  const [newNode, setNewNode] = useState({
    role: '',
    asn: '',
    allowedSKUs: '',
    nodeProfile: ''
  });
  const [isCreatingFabric, setIsCreatingFabric] = useState(false);
  
  // Store ASN values by role
  const [asnByRole, setAsnByRole] = useState({});
  
  const [fabricData, setFabricData] = useState({
    name: "BloreDellTopology",
    site: "Bangalore"
  });

  // Default specifications templates for node roles - Updated to match provided JSON exactly
  const defaultNodeSpecs = {
    "SUPERSPINE": {
      "role": "SUPERSPINE",
      "asn": 64500,
      "allowedSKUs": ["Force10-S6000"],
      "nodeProfile": "SUPERSPINE",
      "interfaceRoutingSpec": {
        "spine-rs": {
          "importRoute": {
            "name": "SPINE_IMPORT",
            "terms": [
              {
                "type": "accept-on-match",
                "name": "ACCEPT_ALL"
              }
            ]
          },
          "exportRoute": {
            "name": "SPINE_EXPORT",
            "terms": [
              {
                "type": "accept-on-match",
                "name": "ADVERTISE_ALL"
              }
            ]
          },
          "peerGroup": {
            "allowASIn": 1,
            "name": "SUPERSPINE_TO_SPINE"
          }
        }
      },
      "interfaceSpec": {
        "loopback": {
          "ipAllocationSpec": {
            "pool": "SUPERSPINE_LOOPBACK",
            "IPv4": true
          },
          "redistributeLoopback": {
            "scope": "GLOBAL"
          }
        },
        "transit": {
          "SUPERSPINE_TO_SPINE": {
            "role": "SUPERSPINE_TO_SPINE",
            "count": 2,
            "connectsFrom": {
              "nodeRole": "SPINE",
              "interfaceRole": "SPINE_TO_SUPERSPINE"
            },
            "unnumbered": true,
            "routingSpec": "spine-rs"
          }
        }
      }
    },
    "SPINE": {
      "allowedSKUs": ["Force10-S6000"],
      "asn": 64600,
      "interfaceRoutingSpec": {
        "super-spine-rs": {
          "importRoute": {
            "name": "SUPERSPINE_IMPORT",
            "terms": [
              {
                "type": "accept-on-match",
                "name": "ACCEPT_ALL"
              }
            ]
          },
          "exportRoute": {
            "name": "SUPERSPINE_EXPORT",
            "terms": [
              {
                "type": "accept-on-match",
                "name": "ADVERTISE_ALL"
              }
            ]
          },
          "peerGroup": {
            "allowASIn": 1,
            "name": "SPINE_TO_SUPERSPINE"
          }
        },
        "leaf-rs": {
          "exportRoute": {
            "name": "LEAF_EXPORT",
            "terms": [
              {
                "name": "ADVERTISE_ALL",
                "type": "accept-on-match"
              }
            ]
          },
          "importRoute": {
            "name": "LEAF_IMPORT",
            "terms": [
              {
                "name": "ACCEPT_ALL",
                "type": "accept-on-match"
              }
            ]
          },
          "peerGroup": {
            "allowASIn": 1,
            "name": "LEAF_TO_SPINE"
          }
        }
      },
      "interfaceSpec": {
        "loopback": {
          "ipAllocationSpec": {
            "IPv4": true,
            "pool": "SPINE_LOOPBACK"
          },
          "redistributeLoopback": {
            "scope": "GLOBAL"
          }
        },
        "transit": {
          "SPINE_TO_SUPERSPINE": {
            "role": "SPINE_TO_SUPERSPINE",
            "count": 1,
            "connectsTo": {
              "nodeRole": "SUPERSPINE",
              "interfaceRole": "SUPERSPINE_TO_SPINE",
              "linkCount": 1,
              "nodeStep": 1
            },
            "unnumbered": true,
            "routingSpec": "super-spine-rs"
          },
          "SPINE_TO_RACK1": {
            "connectsFrom": {
              "interfaceRole": "LEAF_TO_SPINE",
              "nodeRole": "RACK1-LEAF"
            },
            "count": 2,
            "role": "SPINE_TO_RACK1",
            "routingSpec": "leaf-rs",
            "unnumbered": true
          },
          "SPINE_TO_RACK2": {
            "connectsFrom": {
              "interfaceRole": "LEAF_TO_SPINE",
              "nodeRole": "RACK2-LEAF"
            },
            "count": 2,
            "role": "SPINE_TO_RACK2",
            "routingSpec": "leaf-rs",
            "unnumbered": true
          }
        }
      },
      "nodeProfile": "SPINE",
      "role": "SPINE"
    },
    "RACK1-LEAF": {
      "allowedSKUs": ["Force10-S6000"],
      "asn": 64700,
      "interfaceRoutingSpec": {
        "spine-rs": {
          "exportRoute": {
            "name": "SPINE_EXPORT",
            "terms": [
              {
                "name": "ADVERTISE_ALL",
                "type": "accept-on-match"
              }
            ]
          },
          "importRoute": {
            "name": "SPINE_IMPORT",
            "terms": [
              {
                "firstOfConditionList": [
                  {
                    "matchIPPrefix": {
                      "matchAllocationPools": [
                        "RACK1_LOOPBACK"
                      ]
                    }
                  }
                ],
                "name": "ACCEPT_ALL",
                "type": "accept-on-match"
              }
            ]
          },
          "peerGroup": {
            "allowASIn": 1,
            "name": "SPINE_TO_RACK1"
          }
        }
      },
      "interfaceSpec": {
        "loopback": {
          "ipAllocationSpec": {
            "IPv4": true,
            "pool": "RACK1_LOOPBACK"
          },
          "redistributeLoopback": {
            "scope": "GLOBAL"
          }
        },
        "transit": {
          "LEAF_TO_SPINE": {
            "connectsTo": {
              "interfaceRole": "SPINE_TO_RACK1",
              "linkCount": 1,
              "nodeRole": "SPINE",
              "nodeStep": 1
            },
            "count": 2,
            "role": "LEAF_TO_SPINE",
            "routingSpec": "spine-rs",
            "unnumbered": true
          }
        }
      },
      "leaf": true,
      "leafCount": 2,
      "nodeProfile": "LEAF",
      "role": "RACK1-LEAF"
    },
    "RACK2-LEAF": {
      "allowedSKUs": ["Force10-S6000"],
      "asn": 64700,
      "interfaceRoutingSpec": {
        "leaf-rs": {
          "exportRoute": {
            "name": "LEAF_EXPORT",
            "terms": [
              {
                "name": "ADVERTISE_ALL",
                "type": "accept-on-match"
              }
            ]
          },
          "importRoute": {
            "name": "LEAF_IMPORT",
            "terms": [
              {
                "name": "ACCEPT_ALL",
                "type": "accept-on-match"
              }
            ]
          },
          "peerGroup": {
            "allowASIn": 1,
            "name": "LEAF_TO_SPINE"
          }
        },
        "spine-rs": {
          "exportRoute": {
            "name": "SPINE_EXPORT",
            "terms": [
              {
                "name": "ADVERTISE_ALL",
                "type": "accept-on-match"
              }
            ]
          },
          "importRoute": {
            "name": "SPINE_IMPORT",
            "terms": [
              {
                "firstOfConditionList": [
                  {
                    "matchIPPrefix": {
                      "matchAllocationPools": [
                        "RACK2_LOOPBACK"
                      ]
                    }
                  }
                ],
                "name": "ACCEPT_ALL",
                "type": "accept-on-match"
              }
            ]
          },
          "peerGroup": {
            "allowASIn": 1,
            "name": "SPINE_TO_RACK2"
          }
        }
      },
      "interfaceSpec": {
        "loopback": {
          "ipAllocationSpec": {
            "IPv4": true,
            "pool": "RACK2_LOOPBACK"
          },
          "redistributeLoopback": {
            "scope": "GLOBAL"
          }
        },
        "transit": {
          "LEAF_TO_GENERIC_NODE": {
            "connectsFrom": {
              "interfaceRole": "GENERIC_NODE_TO_LEAF",
              "nodeRole": "GENERIC-NODE"
            },
            "count": 2,
            "role": "LEAF_TO_GENERIC_NODE",
            "routingSpec": "leaf-rs",
            "unnumbered": true
          },
          "LEAF_TO_SPINE": {
            "connectsTo": {
              "interfaceRole": "SPINE_TO_RACK2",
              "linkCount": 1,
              "nodeRole": "SPINE",
              "nodeStep": 1
            },
            "count": 2,
            "role": "LEAF_TO_SPINE",
            "routingSpec": "spine-rs",
            "unnumbered": true
          }
        }
      },
      "leaf": false,
      "leafCount": 2,
      "nodeProfile": "LEAF",
      "role": "RACK2-LEAF"
    },
    "GENERIC-NODE": {
      "allowedSKUs": ["Force10-S6000"],
      "interfaceRoutingSpec": {
        "leaf-rs": {
          "exportRoute": {
            "name": "LEAF_EXPORT",
            "terms": [
              {
                "name": "ADVERTISE_ALL",
                "type": "accept-on-match"
              }
            ]
          },
          "importRoute": {
            "name": "LEAF_IMPORT",
            "terms": [
              {
                "firstOfConditionList": [
                  {
                    "matchIPPrefix": {
                      "matchAllocationPools": [
                        "GENERIC_NODE_LOOPBACK"
                      ]
                    }
                  }
                ],
                "name": "ACCEPT_ALL",
                "type": "accept-on-match"
              }
            ]
          },
          "peerGroup": {
            "allowASIn": 1,
            "name": "LEAF_TO_GENERIC_NODE"
          }
        }
      },
      "interfaceSpec": {
        "loopback": {
          "ipAllocationSpec": {
            "IPv4": true,
            "pool": "GENERIC_NODE_LOOPBACK"
          },
          "redistributeLoopback": {
            "scope": "GLOBAL"
          }
        },
        "transit": {
          "GENERIC_NODE_TO_LEAF": {
            "connectsTo": {
              "interfaceRole": "LEAF_TO_GENERIC_NODE",
              "linkCount": 1,
              "nodeRole": "RACK2-LEAF",
              "nodeStep": 1
            },
            "count": 2,
            "role": "GENERIC_NODE_TO_LEAF",
            "routingSpec": "leaf-rs",
            "unnumbered": true
          }
        }
      },
      "leaf": true,
      "leafCount": 2,
      "nodeProfile": "GENERIC-NODE",
      "role": "GENERIC-NODE"
    }
  };

  const siteOptions = [
    { value: 'Bangalore', label: 'Bangalore' },
    { value: 'Chennai', label: 'Chennai' },
    { value: 'Mumbai', label: 'Mumbai' },
    { value: 'Coimbatore', label: 'Coimbatore' },
    { value: 'Hyderabad', label: 'Hyderabad' }
  ];

  const nodeRoleOptions = [
    { value: 'SUPERSPINE', label: 'SUPERSPINE' },
    { value: 'SPINE', label: 'SPINE' },
    { value: 'RACK1-LEAF', label: 'RACK1-LEAF' },
    { value: 'RACK2-LEAF', label: 'RACK2-LEAF' },
    { value: 'GENERIC-NODE', label: 'GENERIC-NODE' }
  ];

  const nodeProfileOptions = [
    { value: 'SUPERSPINE', label: 'SUPERSPINE' },
    { value: 'SPINE', label: 'SPINE' },
    { value: 'LEAF', label: 'LEAF' },
    { value: 'GENERIC-NODE', label: 'GENERIC-NODE' }
  ];

  const tabs = [
    { id: 'basic', name: 'Basic Configuration', icon: Settings },
    { id: 'ip', name: 'IP Specifications', icon: Network },
    { id: 'nodes', name: 'Node Specifications', icon: Layers },
    { id: 'preview', name: 'Preview', icon: Eye }
  ];

  const handleNameChange = (e) => {
    setFabricData(prev => ({ ...prev, name: e.target.value }));
  };

  const handleSiteChange = (e) => {
    setFabricData(prev => ({ ...prev, site: e.target.value }));
  };

  const handlePoolNameChange = (e) => {
    const value = e.target.value.toUpperCase();
    setNewPool(prev => ({ ...prev, name: value }));
  };

  const handleCreateIPPool = () => {
    if (newPool.name && newPool.prefix) {
      const poolData = {
        name: newPool.name,
        v4: {
          prefixes: [newPool.prefix]
        }
      };
      setIpPools(prev => [...prev, poolData]);
      setNewPool({ name: '', prefix: '' });
      setShowIPModal(false);
    }
  };

  const handleDeleteIPPool = (index) => {
    setIpPools(prev => prev.filter((_, i) => i !== index));
  };

  const handleModalClose = () => {
    setShowIPModal(false);
    setNewPool({ name: '', prefix: '' });
  };

  // Handle node role change and update ASN
  const handleNodeRoleChange = (e) => {
    const selectedRole = e.target.value;
    setNewNode(prev => ({
      ...prev,
      role: selectedRole,
      asn: selectedRole === 'GENERIC-NODE' ? '' : (asnByRole[selectedRole] || ''),
      nodeProfile: selectedRole === 'GENERIC-NODE' ? 'GENERIC-NODE' : 
                   (selectedRole === 'RACK1-LEAF' || selectedRole === 'RACK2-LEAF') ? 'LEAF' : selectedRole
    }));
  };

  // Handle ASN change and update for all roles
  const handleASNChange = (e) => {
    const asnValue = e.target.value;
    setNewNode(prev => ({ ...prev, asn: asnValue }));
    
    // Update ASN for all non-GENERIC-NODE roles
    if (newNode.role && newNode.role !== 'GENERIC-NODE') {
      const updatedAsnByRole = { ...asnByRole };
      ['SUPERSPINE', 'SPINE', 'RACK1-LEAF', 'RACK2-LEAF'].forEach(role => {
        updatedAsnByRole[role] = asnValue;
      });
      setAsnByRole(updatedAsnByRole);
    }
  };

  const getNodeBaseSpec = (nodeRole) => {
    // Return the complete specification from defaultNodeSpecs for the selected role
    if (defaultNodeSpecs[nodeRole]) {
      return {
        interfaceRoutingSpec: defaultNodeSpecs[nodeRole].interfaceRoutingSpec,
        interfaceSpec: defaultNodeSpecs[nodeRole].interfaceSpec,
        ...(defaultNodeSpecs[nodeRole].leaf !== undefined && { leaf: defaultNodeSpecs[nodeRole].leaf }),
        ...(defaultNodeSpecs[nodeRole].leafCount !== undefined && { leafCount: defaultNodeSpecs[nodeRole].leafCount })
      };
    }
    
    return {};
  };

  const handleCreateNodeType = () => {
    if (newNode.role && newNode.allowedSKUs && newNode.nodeProfile && 
        (newNode.role === 'GENERIC-NODE' || newNode.asn)) {
      const baseSpec = getNodeBaseSpec(newNode.role);
      
      // Parse the allowedSKUs input - split by comma and trim whitespace
      const allowedSKUsArray = newNode.allowedSKUs
        .split(',')
        .map(sku => sku.trim())
        .filter(sku => sku.length > 0);
      
      const nodeData = {
        allowedSKUs: allowedSKUsArray,
        role: newNode.role,
        nodeProfile: newNode.nodeProfile,
        ...baseSpec
      };

      // Only add ASN if not GENERIC-NODE
      if (newNode.role !== 'GENERIC-NODE') {
        nodeData.asn = parseInt(newNode.asn);
      }
      
      setNodeTypes(prev => [...prev, nodeData]);
      setNewNode({ role: '', asn: '', allowedSKUs: '', nodeProfile: '' });
      setShowNodeModal(false);
    }
  };

  const handleDeleteNodeType = (index) => {
    setNodeTypes(prev => prev.filter((_, i) => i !== index));
  };

  const handleNodeModalClose = () => {
    setShowNodeModal(false);
    setNewNode({ role: '', asn: '', allowedSKUs: '', nodeProfile: '' });
  };

  const removeEmptyValues = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(removeEmptyValues).filter(v => v !== null && v !== undefined);
    } else if (obj !== null && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj)
          .map(([k, v]) => [k, removeEmptyValues(v)])
          .filter(([_, v]) => v !== null && v !== undefined && v !== '' && 
                  !(Array.isArray(v) && v.length === 0) && 
                  !(typeof v === 'object' && Object.keys(v).length === 0))
      );
    }
    return obj;
  };

  const generatePreviewJSON = () => {
    const previewData = {
      name: fabricData.name,
      site: fabricData.site
    };

    // Build IP Specifications - only from user created pools
    if (ipPools.length > 0) {
      const ipSpec = {};
      ipPools.forEach(pool => {
        ipSpec[pool.name] = {
          name: pool.name,
          v4: {
            prefixes: pool.v4.prefixes
          }
        };
      });
      previewData.ipSpec = ipSpec;
    }

    // Build Node Specifications - only from user created nodes
    if (nodeTypes.length > 0) {
      const nodeSpec = {};
      nodeTypes.forEach((node) => {
        const nodeKey = node.role;
        nodeSpec[nodeKey] = {
          allowedSKUs: node.allowedSKUs,
          ...(node.asn && { asn: node.asn }),
          ...(node.interfaceRoutingSpec && { interfaceRoutingSpec: node.interfaceRoutingSpec }),
          ...(node.interfaceSpec && { interfaceSpec: node.interfaceSpec }),
          ...(node.leaf !== undefined && { leaf: node.leaf }),
          ...(node.leafCount !== undefined && { leafCount: node.leafCount }),
          nodeProfile: node.nodeProfile,
          role: node.role
        };
      });
      previewData.nodeSpec = nodeSpec;
    }

    return removeEmptyValues(previewData);
  };

  const handleExportJSON = () => {
    const jsonData = generatePreviewJSON();
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fabricData.name}_config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setNotification({
      type: 'success',
      message: 'JSON configuration exported successfully!'
    });
    
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleCreateFabric = async () => {
    setIsCreatingFabric(true);
    
    try {
      const payload = generatePreviewJSON();
      
      const response = await axios.post('/api/fabric/v1.0.0/FabricSpec', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      setNotification({
        type: 'success',
        message: 'Fabric created successfully!'
      });
      
    } catch (error) {
      console.error('Error creating fabric:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to create fabric. Please try again.';
      
      setNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsCreatingFabric(false);
      
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  const renderBasicConfiguration = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fabric Name
            </label>
            <input
              type="text"
              value={fabricData.name}
              onChange={handleNameChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter fabric name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Location
            </label>
            <select
              value={fabricData.site}
              onChange={handleSiteChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {siteOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIPSpecifications = () => {
    if (ipPools.length === 0) {
      return (
        <div className="min-h-96 flex flex-col items-center justify-center text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <Network className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No IP Pools Configured</h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              Get started by creating your first IP allocation pool for the fabric topology.
            </p>
          </div>
          <button
            onClick={() => setShowIPModal(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create First IP Pool
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">IP Allocation Pools</h3>
          <button
            onClick={() => setShowIPModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add IP Pool
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="space-y-4">
            {ipPools.map((pool, index) => (
              <div key={`user-${index}`} className="border border-gray-200 rounded-lg p-4 group hover:border-gray-300 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900">{pool.name}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Globe className="h-3 w-3 mr-1" />
                      IPv4
                    </span>
                    <button
                      onClick={() => handleDeleteIPPool(index)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <code className="text-sm text-gray-700 font-mono">
                    {pool.v4.prefixes.join(', ')}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderNodeSpecifications = () => {
    if (nodeTypes.length === 0) {
      return (
        <div className="min-h-96 flex flex-col items-center justify-center text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-4">
              <Server className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Node Types Configured</h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              Get started by creating your first node type for the fabric topology.
            </p>
          </div>
          <button
            onClick={() => setShowNodeModal(true)}
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create First Node Type
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Node Specifications</h3>
          <button
            onClick={() => setShowNodeModal(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Node Type
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="space-y-6">
            {nodeTypes.map((node, index) => (
              <div key={`user-${index}`} className="border border-gray-200 rounded-lg p-4 group hover:border-gray-300 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{node.role}</h4>
                    {node.asn && <p className="text-sm text-gray-500">ASN: {node.asn}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {node.nodeProfile}
                    </span>
                    <button
                      onClick={() => handleDeleteNodeType(index)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Allowed SKUs:</span>
                    <div className="mt-1">
                      {node.allowedSKUs.map((sku, skuIndex) => (
                        <span key={skuIndex} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1">
                          {sku}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Node Profile:</span>
                    <span className="ml-2 text-gray-600">{node.nodeProfile}</span>
                  </div>
                </div>
                {node.interfaceRoutingSpec && (
                  <div className="mt-3 text-xs">
                    <span className="font-medium text-gray-700">Interface Routing Specs:</span>
                    <span className="ml-2 text-gray-600">{Object.keys(node.interfaceRoutingSpec).join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    const previewData = generatePreviewJSON();

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Configuration Preview</h3>
          <div className="flex space-x-3">
            <button
              onClick={handleCreateFabric}
              disabled={isCreatingFabric}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isCreatingFabric ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Fabric
                </>
              )}
            </button>
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="font-medium text-blue-900">Fabric Name</div>
                <div className="text-blue-700">{fabricData.name}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="font-medium text-purple-900">Site Location</div>
                <div className="text-purple-700">{siteOptions.find(s => s.value === fabricData.site)?.label}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="font-medium text-green-900">IP Pools</div>
                <div className="text-green-700">{ipPools.length} Total</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="font-medium text-orange-900">Node Types</div>
                <div className="text-orange-700">{nodeTypes.length} Total</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96">
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(previewData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return renderBasicConfiguration();
      case 'ip':
        return renderIPSpecifications();
      case 'nodes':
        return renderNodeSpecifications();
      case 'preview':
        return renderPreview();
      default:
        return renderBasicConfiguration();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fabric Configuration Manager</h1>
          <p className="mt-2 text-gray-600">Manage your network fabric topology and configuration</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${
              notification.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}>
              {notification.type === 'success' ? (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className={`ml-4 inline-flex text-sm ${
                notification.type === 'success' 
                  ? 'text-green-500 hover:text-green-600' 
                  : 'text-red-500 hover:text-red-600'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* IP Pool Modal */}
      {showIPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create IP Pool</h3>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pool Name (UPPERCASE ONLY)
                </label>
                <input
                  type="text"
                  value={newPool.name}
                  onChange={handlePoolNameChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  placeholder="Enter pool name (e.g., SPINE_LOOPBACK)"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IP Prefix
                </label>
                <input
                  type="text"
                  value={newPool.prefix}
                  onChange={(e) => setNewPool(prev => ({ ...prev, prefix: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter IP prefix (e.g., 10.0.1.0/24)"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateIPPool}
                disabled={!newPool.name || !newPool.prefix}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Create Pool
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Node Type Modal */}
      {showNodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create Node Type</h3>
              <button
                onClick={handleNodeModalClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Node Role
                </label>
                <select
                  value={newNode.role}
                  onChange={handleNodeRoleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select node role</option>
                  {nodeRoleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Only show ASN field if role is not GENERIC-NODE */}
              {newNode.role && newNode.role !== 'GENERIC-NODE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ASN
                  </label>
                  <input
                    type="number"
                    value={newNode.asn}
                    onChange={handleASNChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter ASN (e.g., 64500)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This ASN will be applied to all non-GENERIC-NODE roles
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed SKU
                </label>
                <input
                  type="text"
                  value={newNode.allowedSKUs}
                  onChange={(e) => setNewNode(prev => ({ ...prev, allowedSKUs: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter SKU"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter multiple SKUs separated by commas
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Node Profile
                </label>
                <select
                  value={newNode.nodeProfile}
                  onChange={(e) => setNewNode(prev => ({ ...prev, nodeProfile: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select node profile</option>
                  {nodeProfileOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleNodeModalClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNodeType}
                disabled={!newNode.role || !newNode.allowedSKUs || !newNode.nodeProfile || 
                         (newNode.role !== 'GENERIC-NODE' && !newNode.asn)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Create Node Type
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FabricConfigApp;