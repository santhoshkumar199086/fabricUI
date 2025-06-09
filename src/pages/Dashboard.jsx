import React, { useState, useEffect } from 'react';
import { ChevronDown, Download, Plus, X } from 'lucide-react';

const SKUManagementApp = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showProfileForm, setShowProfileForm] = useState(false);
  
  // Initial data from JSON
  const initialData = {
    "name": "Force10-S6000",
    "vendor": "virtual",
    "platform": "x86_dell_s5224f_vm",
    "interfaces": {
      "Ethernet1/1/1": {"sonicIndex": 0, "lanes": [25,26,27,28], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/1", "alias": "fortyGigE0/1", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/2": {"sonicIndex": 1, "lanes": [29,30,31,32], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/2", "alias": "fortyGigE0/4", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/3": {"sonicIndex": 2, "lanes": [33,34,35,36], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/3", "alias": "fortyGigE0/8", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/4": {"sonicIndex": 3, "lanes": [37,38,39,40], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/4", "alias": "fortyGigE0/12", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/5": {"sonicIndex": 4, "lanes": [45,46,47,48], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/5", "alias": "fortyGigE0/16", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/6": {"sonicIndex": 5, "lanes": [41,42,43,44], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/6", "alias": "fortyGigE0/20", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/7": {"sonicIndex": 6, "lanes": [1,2,3,4], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/7", "alias": "fortyGigE0/24", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/8": {"sonicIndex": 7, "lanes": [5,6,7,8], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/8", "alias": "fortyGigE0/28", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/9": {"sonicIndex": 8, "lanes": [13,14,15,16], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/9", "alias": "fortyGigE0/9", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/10": {"sonicIndex": 9, "lanes": [9,10,11,12], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/10", "alias": "fortyGigE0/10", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/11": {"sonicIndex": 10, "lanes": [17,18,19,20], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/11", "alias": "fortyGigE0/11", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/12": {"sonicIndex": 11, "lanes": [21,22,23,24], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/12", "alias": "fortyGigE0/12", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/13": {"sonicIndex": 12, "lanes": [53,54,55,56], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/13", "alias": "fortyGigE0/13", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/14": {"sonicIndex": 13, "lanes": [49,50,51,52], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/14", "alias": "fortyGigE0/14", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/15": {"sonicIndex": 14, "lanes": [57,58,59,60], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/15", "alias": "fortyGigE0/15", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/16": {"sonicIndex": 15, "lanes": [61,62,63,64], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/16", "alias": "fortyGigE0/16", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/17": {"sonicIndex": 16, "lanes": [69,70,71,72], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/17", "alias": "fortyGigE0/17", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/18": {"sonicIndex": 17, "lanes": [65,66,67,68], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/18", "alias": "fortyGigE0/18", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/19": {"sonicIndex": 18, "lanes": [73,74,75,76], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/19", "alias": "fortyGigE0/19", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/20": {"sonicIndex": 19, "lanes": [77,78,79,80], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/20", "alias": "fortyGigE0/20", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/21": {"sonicIndex": 20, "lanes": [109,110,111,112], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/21", "alias": "fortyGigE0/21", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/22": {"sonicIndex": 21, "lanes": [105,106,107,108], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/22", "alias": "fortyGigE0/22", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/23": {"sonicIndex": 22, "lanes": [113,114,115,116], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/23", "alias": "fortyGigE0/23", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/24": {"sonicIndex": 23, "lanes": [117,118,119,120], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/24", "alias": "fortyGigE0/24", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/25": {"sonicIndex": 24, "lanes": [125,126,127,128], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/25", "alias": "fortyGigE0/25", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/26": {"sonicIndex": 25, "lanes": [121,122,123,124], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/26", "alias": "fortyGigE0/26", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/27": {"sonicIndex": 26, "lanes": [81,82,83,84], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/27", "alias": "fortyGigE0/27", "speed": 1000, "laneCount": 1}]}},
      "Ethernet1/1/28": {"sonicIndex": 27, "lanes": [85,86,87,88], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/28", "alias": "fortyGigE0/28", "speed": 1000, "laneCount": 1}]}}
    },
    "profiles": {
      "SPINE": {
        "breakout": "1x40G",
        "interfaceDefaults": {"mtu": 9100, "fec": "none"}
      },
      "LEAF": {
        "breakout": "1x40G", 
        "interfaceDefaults": {"mtu": 9100, "fec": "none"}
      }
    }
  };

  // State management
  const [skuData, setSkuData] = useState({
    name: initialData.name,
    vendor: initialData.vendor,
    platform: initialData.platform
  });

  const [interfaceData, setInterfaceData] = useState({
    interfaceName: '',
    sonicIndex: '',
    lanes: [],
    speed: ''
  });

  const [profileData, setProfileData] = useState({
    profileName: '',
    connectionType: '',
    mtu: 9100,
    fec: 'none',
    breakout: '1x40G',
    panelMapType: '',
    panelIndexes: [],
    interfaces: []
  });

  const [finalData, setFinalData] = useState({
    name: initialData.name,
    vendor: initialData.vendor,
    platform: initialData.platform,
    interfaces: initialData.interfaces,
    profiles: {}
  });

  const tabs = ['SKU Information', 'Interface', 'Profile', 'Preview'];

  const interfaceNames = Object.keys(initialData.interfaces);
  const sonicIndexes = Object.values(initialData.interfaces).map(i => i.sonicIndex);
  const allLanes = [...new Set(Object.values(initialData.interfaces).flatMap(i => i.lanes))];
  
  const profileTypes = ['Superspine', 'Spine', 'Leaf', 'Generic Node'];
  const connectionMap = {
    'Superspine': ['Spine'],
    'Spine': ['Superspine', 'Leaf'],
    'Leaf': ['Spine', 'Generic Node'],
    'Generic Node': ['Leaf']
  };

  const MultiSelectDropdown = ({ options, selected, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOption = (option) => {
      if (selected.includes(option)) {
        onChange(selected.filter(item => item !== option));
      } else {
        onChange([...selected, option]);
      }
    };

    return (
      <div className="relative">
        <div 
          className="w-full p-2 border rounded-md cursor-pointer flex justify-between items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-sm">
            {selected.length > 0 ? `${selected.length} selected` : placeholder}
          </span>
          <ChevronDown className="w-4 h-4" />
        </div>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {options.map(option => (
              <div key={option} className="p-2 hover:bg-gray-100 flex items-center">
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="mr-2"
                />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

   const handleProfileSubmit = () => {
    const newPanelMapEntry = {
      [`${profileData.profileName}_TO_${profileData.connectionType}`]: Object.fromEntries(
        profileData.panelIndexes.map((idx, i) => [idx.toString(), profileData.interfaces[i] || ''])
      )
    };

    const newBreakoutEntries = Object.fromEntries(
      profileData.interfaces.map(intf => [intf, profileData.breakout])
    );

    // Check if profile already exists
    const existingProfile = finalData.profiles[profileData.profileName];
    
    const updatedProfile = {
      breakout: {
        ...(existingProfile?.breakout || {}),
        ...newBreakoutEntries
      },
      panelMap: {
        ...(existingProfile?.panelMap || {}),
        ...newPanelMapEntry
      },
      interfaceDefaults: {
        mtu: profileData.mtu,
        fec: profileData.fec
      }
    };

    // Remove null/empty values
    const cleanProfile = JSON.parse(JSON.stringify(updatedProfile, (key, value) => {
      if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        return undefined;
      }
      return value;
    }));

    setFinalData(prev => ({
      ...prev,
      profiles: {
        ...prev.profiles,
        [profileData.profileName]: cleanProfile
      }
    }));

    // Clear editable form fields only
    setProfileData(prev => ({
      ...prev,
      profileName: '',
      connectionType: '',
      panelMapType: '',
      panelIndexes: [],
      interfaces: []
    }));
  };

  const exportJSON = () => {
    const cleanData = JSON.parse(JSON.stringify(finalData, (key, value) => {
      if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        return undefined;
      }
      return value;
    }));
    
    const dataStr = JSON.stringify(cleanData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sku-configuration.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    setFinalData(prev => ({
      ...prev,
      name: skuData.name,
      vendor: skuData.vendor,
      platform: skuData.platform
    }));
  }, [skuData]);

  const renderTab = () => {
    switch (activeTab) {
      case 0: // SKU Information
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SKU Name</label>
              <input
                type="text"
                value={skuData.name}
                onChange={(e) => setSkuData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
              <input
                type="text"
                value={skuData.vendor}
                onChange={(e) => setSkuData(prev => ({ ...prev, vendor: e.target.value }))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <input
                type="text"
                value={skuData.platform}
                onChange={(e) => setSkuData(prev => ({ ...prev, platform: e.target.value }))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 1: // Interface
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interface Name</label>
              <select
                value={interfaceData.interfaceName}
                onChange={(e) => {
                  const selectedInterface = e.target.value;
                  const interfaceInfo = initialData.interfaces[selectedInterface];
                  setInterfaceData(prev => ({
                    ...prev,
                    interfaceName: selectedInterface,
                    sonicIndex: interfaceInfo?.sonicIndex.toString() || '',
                    lanes: interfaceInfo?.lanes || [],
                    speed: interfaceInfo?.supportedBreakoutModes['1x40G']?.[0]?.speed?.toString() || ''
                  }));
                }}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Interface</option>
                {interfaceNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sonic Index</label>
              <select
                value={interfaceData.sonicIndex}
                onChange={(e) => setInterfaceData(prev => ({ ...prev, sonicIndex: e.target.value }))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Sonic Index</option>
                {sonicIndexes.map(index => (
                  <option key={index} value={index}>{index}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lanes</label>
              <input
                type="text"
                value={interfaceData.lanes.length > 0 ? `[${interfaceData.lanes.join(',')}]` : ''}
                disabled
                className="w-full p-2 border rounded-md bg-gray-100"
                placeholder="Select an interface to see lanes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Speed (Mbps)</label>
              <input
                type="number"
                value={interfaceData.speed}
                onChange={(e) => setInterfaceData(prev => ({ ...prev, speed: e.target.value }))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 2: // Profile
        return (
          <div className="space-y-6">
            {!showProfileForm ? (
              <div className="flex justify-center">
                <button
                  onClick={() => setShowProfileForm(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Profile Configuration
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Name</label>
                  <select
                    value={profileData.profileName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, profileName: e.target.value, connectionType: '' }))}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Profile</option>
                    {profileTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {profileData.profileName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Connection Type</label>
                    <div className="space-y-2">
                      {connectionMap[profileData.profileName]?.map(connection => (
                        <label key={connection} className="flex items-center">
                          <input
                            type="radio"
                            name="connectionType"
                            value={connection}
                            checked={profileData.connectionType === connection}
                            onChange={(e) => setProfileData(prev => ({ ...prev, connectionType: e.target.value }))}
                            className="mr-2"
                          />
                          {connection}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">MTU</label>
                  <input
                    type="number"
                    value={profileData.mtu}
                    onChange={(e) => setProfileData(prev => ({ ...prev, mtu: parseInt(e.target.value) }))}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">FEC</label>
                  <input
                    type="text"
                    value={profileData.fec}
                    onChange={(e) => setProfileData(prev => ({ ...prev, fec: e.target.value }))}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Breakout</label>
                  <input
                    type="text"
                    value={profileData.breakout}
                    onChange={(e) => setProfileData(prev => ({ ...prev, breakout: e.target.value }))}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Panel Map Type</label>
                  <input
                    type="text"
                    value={`${profileData.profileName}_TO_${profileData.connectionType}`}
                    disabled
                    className="w-full p-2 border rounded-md bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Panel Indexes</label>
                  <MultiSelectDropdown
                    options={Array.from({length: 29}, (_, i) => i.toString())}
                    selected={profileData.panelIndexes}
                    onChange={(selected) => setProfileData(prev => ({ ...prev, panelIndexes: selected }))}
                    placeholder="Select panel indexes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interfaces</label>
                  <MultiSelectDropdown
                    options={interfaceNames}
                    selected={profileData.interfaces}
                    onChange={(selected) => setProfileData(prev => ({ ...prev, interfaces: selected }))}
                    placeholder="Select interfaces"
                  />
                </div>

                <button
                  onClick={handleProfileSubmit}
                  className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Create Profile
                </button>
              </div>
            )}
          </div>
        );

      case 3: // Preview
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Configuration Preview</h3>
              <button
                onClick={exportJSON}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </button>
            </div>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 text-sm">
              {JSON.stringify(finalData, (key, value) => {
                if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
                  return undefined;
                }
                return value;
              }, 2)}
            </pre>
          </div>
        );

      default:
        return null;
    }
  };

  return (

    <div className="max-w-6xl mx-auto p-6 bg-white">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">SKU Management System</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`py-2 px-4 font-medium text-sm ${
              activeTab === index
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {renderTab()}
      </div>
    </div>
  );
};

export default SKUManagementApp;