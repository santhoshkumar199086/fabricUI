import React, { useState, useEffect } from 'react';
import { ChevronDown, Download, Plus, X, Settings, Monitor, Eye, Database, Network, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
const SITE_API_URL = import.meta.env.VITE_API_URL;

// JSON data with empty profiles (removed default values)
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
    "Ethernet1/1/16": {"sonicIndex": 15, "lanes": [61,62,63,64], "supportedBreakoutModes": {"1x40G": [{"port": "Ethernet1/1/60", "alias": "fortyGigE0/16", "speed": 1000, "laneCount": 1}]}},
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
    // Empty profiles - will be populated based on user selection
  }
};

// Profile templates with default breakout values for each profile type
const profileTemplates = {
  "SUPERSPINE": {
    "breakout": {
      "Ethernet1/1/1": "1x40G", "Ethernet1/1/2": "1x40G", "Ethernet1/1/3": "1x40G", "Ethernet1/1/4": "1x40G",
      "Ethernet1/1/5": "1x40G", "Ethernet1/1/6": "1x40G", "Ethernet1/1/7": "1x40G", "Ethernet1/1/8": "1x40G",
      "Ethernet1/1/9": "1x40G", "Ethernet1/1/10": "1x40G", "Ethernet1/1/11": "1x40G", "Ethernet1/1/12": "1x40G",
      "Ethernet1/1/13": "1x40G", "Ethernet1/1/14": "1x40G", "Ethernet1/1/15": "1x40G", "Ethernet1/1/16": "1x40G",
      "Ethernet1/1/17": "1x40G", "Ethernet1/1/18": "1x40G", "Ethernet1/1/19": "1x40G", "Ethernet1/1/20": "1x40G",
      "Ethernet1/1/21": "1x40G", "Ethernet1/1/22": "1x40G", "Ethernet1/1/23": "1x40G", "Ethernet1/1/24": "1x40G",
      "Ethernet1/1/25": "1x40G", "Ethernet1/1/26": "1x40G", "Ethernet1/1/27": "1x40G", "Ethernet1/1/28": "1x40G"
    },
    "panelMap": {},
    "interfaceDefaults": {"mtu": 9100, "fec": "none"}
  },
  "SPINE": {
    "breakout": {
      "Ethernet1/1/1": "1x40G", "Ethernet1/1/2": "1x40G", "Ethernet1/1/3": "1x40G", "Ethernet1/1/4": "1x40G",
      "Ethernet1/1/5": "1x40G", "Ethernet1/1/6": "1x40G", "Ethernet1/1/7": "1x40G", "Ethernet1/1/8": "1x40G",
      "Ethernet1/1/9": "1x40G", "Ethernet1/1/10": "1x40G", "Ethernet1/1/11": "1x40G", "Ethernet1/1/12": "1x40G",
      "Ethernet1/1/13": "1x40G", "Ethernet1/1/14": "1x40G", "Ethernet1/1/15": "1x40G", "Ethernet1/1/16": "1x40G",
      "Ethernet1/1/17": "1x40G", "Ethernet1/1/18": "1x40G", "Ethernet1/1/19": "1x40G", "Ethernet1/1/20": "1x40G",
      "Ethernet1/1/21": "1x40G", "Ethernet1/1/22": "1x40G", "Ethernet1/1/23": "1x40G", "Ethernet1/1/24": "1x40G",
      "Ethernet1/1/25": "1x40G", "Ethernet1/1/26": "1x40G", "Ethernet1/1/27": "1x40G", "Ethernet1/1/28": "1x40G"
    },
    "panelMap": {},
    "interfaceDefaults": {"mtu": 9100, "fec": "none"}
  },
  "LEAF": {
    "breakout": {
      "Ethernet1/1/1": "1x40G", "Ethernet1/1/2": "1x40G", "Ethernet1/1/3": "1x40G", "Ethernet1/1/4": "1x40G",
      "Ethernet1/1/5": "1x40G", "Ethernet1/1/6": "1x40G", "Ethernet1/1/7": "1x40G", "Ethernet1/1/8": "1x40G",
      "Ethernet1/1/9": "1x40G", "Ethernet1/1/10": "1x40G", "Ethernet1/1/11": "1x40G", "Ethernet1/1/12": "1x40G",
      "Ethernet1/1/13": "1x40G", "Ethernet1/1/14": "1x40G", "Ethernet1/1/15": "1x40G", "Ethernet1/1/16": "1x40G",
      "Ethernet1/1/17": "1x40G", "Ethernet1/1/18": "1x40G", "Ethernet1/1/19": "1x40G", "Ethernet1/1/20": "1x40G",
      "Ethernet1/1/21": "1x40G", "Ethernet1/1/22": "1x40G", "Ethernet1/1/23": "1x40G", "Ethernet1/1/24": "1x40G",
      "Ethernet1/1/25": "1x40G", "Ethernet1/1/26": "1x40G", "Ethernet1/1/27": "1x40G", "Ethernet1/1/28": "1x40G"
    },
    "panelMap": {},
    "interfaceDefaults": {"mtu": 9100, "fec": "none"}
  },
  "GENERIC-NODE": {
    "breakout": {
      "Ethernet1/1/1": "1x40G", "Ethernet1/1/2": "1x40G", "Ethernet1/1/3": "1x40G", "Ethernet1/1/4": "1x40G",
      "Ethernet1/1/5": "1x40G", "Ethernet1/1/6": "1x40G", "Ethernet1/1/7": "1x40G", "Ethernet1/1/8": "1x40G",
      "Ethernet1/1/9": "1x40G", "Ethernet1/1/10": "1x40G", "Ethernet1/1/11": "1x40G", "Ethernet1/1/12": "1x40G",
      "Ethernet1/1/13": "1x40G", "Ethernet1/1/14": "1x40G", "Ethernet1/1/15": "1x40G", "Ethernet1/1/16": "1x40G",
      "Ethernet1/1/17": "1x40G", "Ethernet1/1/18": "1x40G", "Ethernet1/1/19": "1x40G", "Ethernet1/1/20": "1x40G",
      "Ethernet1/1/21": "1x40G", "Ethernet1/1/22": "1x40G", "Ethernet1/1/23": "1x40G", "Ethernet1/1/24": "1x40G",
      "Ethernet1/1/25": "1x40G", "Ethernet1/1/26": "1x40G", "Ethernet1/1/27": "1x40G", "Ethernet1/1/28": "1x40G"
    },
    "panelMap": {},
    "interfaceDefaults": {"mtu": 9100, "fec": "none"}
  }
};

const SKUManagementApp = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isCreatingSKU, setIsCreatingSKU] = useState(false);

  // Track user selections separately from default JSON data
  const [userSelections, setUserSelections] = useState({});

  const interfaceNames = Object.keys(initialData.interfaces);
  const totalInterfaces = interfaceNames.length; // 28 interfaces
  const defaultPanelIndexes = Array.from({length: totalInterfaces}, (_, i) => i.toString()); // 0 to 27

  // Helper function to get interface status (available, disabled, or selected)
  const getInterfaceStatus = (interfaceName) => {
    if (!profileData.profileName) return { disabled: false, reason: '' };
    
    const profileKey = profileData.profileName.toUpperCase();
    
    // Check if interface was previously selected by user for this profile (not default JSON)
    const userSelectedForProfile = userSelections[profileKey] || [];
    const isPreviouslySelectedByUser = userSelectedForProfile.includes(interfaceName);
    
    return {
      disabled: isPreviouslySelectedByUser,
      reason: isPreviouslySelectedByUser ? 'Already selected for this profile previously' : ''
    };
  };

  const profileTypes = ['SUPERSPINE', 'SPINE', 'LEAF', 'GENERIC-NODE'];
  const connectionMap = {
    'SUPERSPINE': { from: 'SUPERSPINE', to: ['SPINE'], isDropdown: false },
    'SPINE': { from: 'SPINE', to: ['SUPERSPINE', 'RACK1', 'RACK2'], isDropdown: true },
    'LEAF': { from: 'LEAF', to: ['SPINE', 'GENERIC_NODE'], isDropdown: true },
    'GENERIC-NODE': { from: 'GENERIC_NODE', to: ['LEAF'], isDropdown: false }
  };

  // State management
  const [skuData, setSkuData] = useState({
    name: initialData.name,
    vendor: initialData.vendor,
    platform: initialData.platform
  });

  const [profileData, setProfileData] = useState({
    profileName: '',
    connectionFrom: '',
    connectionTo: '',
    mtu: 9100,
    fec: 'none',
    breakout: '1x40G',
    panelMapType: '',
    panelIndexes: defaultPanelIndexes, // Default to all panel indexes
    interfaces: []
  });

  const [finalData, setFinalData] = useState({
    name: initialData.name,
    vendor: initialData.vendor,
    platform: initialData.platform,
    interfaces: initialData.interfaces,
    profiles: initialData.profiles // Start with empty profiles
  });

  // Updated tabs
  const tabs = [
    { name: 'SKU Information', icon: Database },
    { name: 'Profile', icon: Settings },
    { name: 'Preview', icon: Eye }
  ];

  const MultiSelectDropdown = ({ options, selected, onChange, placeholder, getItemStatus }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOption = (option) => {
      const status = getItemStatus ? getItemStatus(option) : { disabled: false };
      if (status.disabled) return; // Don't allow selection of disabled items
      
      if (selected.includes(option)) {
        onChange(selected.filter(item => item !== option));
      } else {
        onChange([...selected, option]);
      }
    };

    return (
      <div className="relative">
        <div 
          className="w-full p-3 border border-gray-300 rounded-lg cursor-pointer flex justify-between items-center bg-white hover:border-blue-400 transition-colors shadow-sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-sm text-gray-700">
            {selected.length > 0 ? `${selected.length} selected` : placeholder}
          </span>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
        {isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {options.map(option => {
              const status = getItemStatus ? getItemStatus(option) : { disabled: false, reason: '' };
              return (
                <div 
                  key={option} 
                  className={`p-3 flex items-center border-b border-gray-100 last:border-b-0 ${
                    status.disabled 
                      ? 'bg-gray-50 cursor-not-allowed opacity-60' 
                      : 'hover:bg-gray-50 cursor-pointer'
                  }`}
                  onClick={() => toggleOption(option)}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    disabled={status.disabled}
                    onChange={() => toggleOption(option)}
                    className={`mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                      status.disabled ? 'cursor-not-allowed' : ''
                    }`}
                  />
                  <div className="flex-1">
                    <span className={`text-sm ${status.disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                      {option}
                    </span>
                    {status.disabled && status.reason && (
                      <div className="text-xs text-gray-400 mt-1">{status.reason}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const handleProfileSubmit = () => {
    // Validation
    if (!profileData.profileName) {
      setNotification({
        type: 'error',
        message: 'Please select a profile name.'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (!profileData.connectionTo) {
      setNotification({
        type: 'error',
        message: 'Please select a connection to value.'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (profileData.interfaces.length === 0) {
      setNotification({
        type: 'error',
        message: 'Please select at least one physical port.'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Convert profile name to uppercase to match existing profiles
    const profileKey = profileData.profileName.toUpperCase();
    
    // Get existing profile or create new one from template with default breakouts
    const existingProfile = finalData.profiles[profileKey] || {
      ...profileTemplates[profileKey]
    };

    // Create new panel map key using connection from/to
    const newPanelMapKey = `${profileData.connectionFrom}_TO_${profileData.connectionTo}`;
    
    // Create new panel map entry with user selected interfaces
    let newPanelMapEntry = {};
    let panelMapAdded = false;
    if (profileData.interfaces.length > 0) {
      // Create panel map entry using sequential panel indexes starting from 0
      const panelMapForKey = {};
      profileData.interfaces.forEach((intf, index) => {
        panelMapForKey[index.toString()] = intf;
      });
      
      newPanelMapEntry = {
        [newPanelMapKey]: panelMapForKey
      };
      panelMapAdded = true;
    }

    // Update interface defaults only if user provided different values from defaults
    let interfaceDefaultsUpdated = false;
    const newInterfaceDefaults = { ...existingProfile.interfaceDefaults };
    if (profileData.mtu !== 9100 && profileData.mtu !== existingProfile.interfaceDefaults.mtu) {
      newInterfaceDefaults.mtu = profileData.mtu;
      interfaceDefaultsUpdated = true;
    }
    if (profileData.fec !== 'none' && profileData.fec !== existingProfile.interfaceDefaults.fec) {
      newInterfaceDefaults.fec = profileData.fec;
      interfaceDefaultsUpdated = true;
    }

    // Create breakout entries for selected interfaces (keep defaults, add user-selected)
    const newBreakoutEntries = {};
    profileData.interfaces.forEach(intf => {
      newBreakoutEntries[intf] = profileData.breakout;
    });

    // Merge with existing profile (preserve existing data, add new data)
    const updatedProfile = {
      breakout: {
        ...existingProfile.breakout, // This includes all default breakouts from template
        ...newBreakoutEntries        // This adds/overwrites with user selections
      },
      panelMap: {
        ...existingProfile.panelMap,
        ...newPanelMapEntry
      },
      interfaceDefaults: newInterfaceDefaults
    };

    // Track user selections for future validation
    setUserSelections(prev => ({
      ...prev,
      [profileKey]: [...(prev[profileKey] || []), ...profileData.interfaces]
    }));

    // Update finalData
    setFinalData(prev => ({
      ...prev,
      profiles: {
        ...prev.profiles,
        [profileKey]: updatedProfile
      }
    }));

    // Create success message
    const changes = [];
    if (profileData.interfaces.length > 0) changes.push(`${profileData.interfaces.length} physical port(s) added`);
    if (panelMapAdded) changes.push('new panel mapping added');
    if (interfaceDefaultsUpdated) changes.push('interface defaults updated');
    
    const message = changes.length > 0 
      ? `Profile "${profileData.profileName}" updated successfully: ${changes.join(', ')}.`
      : `Profile "${profileData.profileName}" configuration applied successfully.`;

    setNotification({
      type: 'success',
      message: message
    });

    setTimeout(() => setNotification(null), 3000);

    // Reset form to default values for next creation
    setProfileData({
      profileName: '',
      connectionFrom: '',
      connectionTo: '',
      mtu: 9100,
      fec: 'none',
      breakout: '1x40G',
      panelMapType: '',
      panelIndexes: defaultPanelIndexes,
      interfaces: []
    });
  };

  const createSKU = async () => {
    setIsCreatingSKU(true);
    
    try {
      // Create clean payload data - only include profiles that have been configured
      const configuredProfiles = {};
      Object.keys(finalData.profiles).forEach(profileKey => {
        const profile = finalData.profiles[profileKey];
        // Include profile if it exists (since we now populate with defaults)
        if (profile && (Object.keys(profile.breakout || {}).length > 0 || Object.keys(profile.panelMap || {}).length > 0)) {
          configuredProfiles[profileKey] = profile;
        }
      });

      const payload = {
        name: finalData.name,
        vendor: finalData.vendor,
        platform: finalData.platform,
        interfaces: finalData.interfaces,
        profiles: configuredProfiles
      };

      // Clean the data to remove null/undefined/empty values
      const cleanPayload = JSON.parse(JSON.stringify(payload, (key, value) => {
        if (value === null || value === undefined || value === '') {
          return undefined;
        }
        return value;
      }));

      const response = await axios.post('/api/fabric/v1.0.0/SKU/', cleanPayload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Show success notification
      setNotification({
        type: 'success',
        message: `SKU "${finalData.name}" created successfully via API!`
      });

      setTimeout(() => setNotification(null), 5000);

    } catch (error) {
      console.error('Error creating SKU:', error);
      
      // Show error notification
      let errorMessage = 'Failed to create SKU. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `Failed to create SKU: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'Failed to create SKU: No response from server. Please check your network connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = `Failed to create SKU: ${error.message}`;
      }

      setNotification({
        type: 'error',
        message: errorMessage
      });

      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsCreatingSKU(false);
    }
  };

  const exportJSON = () => {
    // Create clean export data - only include configured profiles
    const configuredProfiles = {};
    Object.keys(finalData.profiles).forEach(profileKey => {
      const profile = finalData.profiles[profileKey];
      // Include profile if it exists (since we now populate with defaults)
      if (profile && (Object.keys(profile.breakout || {}).length > 0 || Object.keys(profile.panelMap || {}).length > 0)) {
        configuredProfiles[profileKey] = profile;
      }
    });

    const exportData = {
      name: finalData.name,
      vendor: finalData.vendor,
      platform: finalData.platform,
      interfaces: finalData.interfaces,
      profiles: configuredProfiles
    };

    // Clean the data
    const cleanData = JSON.parse(JSON.stringify(exportData, (key, value) => {
      if (value === null || value === undefined || value === '') {
        return undefined;
      }
      return value;
    }));
    
    const dataStr = JSON.stringify(cleanData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${finalData.name || 'sku'}-configuration.json`;
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <Database className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">SKU Information</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Monitor className="w-4 h-4 inline mr-2" />
                  SKU Name
                </label>
                <input
                  type="text"
                  value={skuData.name}
                  onChange={(e) => setSkuData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  placeholder="Enter SKU name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Network className="w-4 h-4 inline mr-2" />
                  Vendor
                </label>
                <input
                  type="text"
                  value={skuData.vendor}
                  onChange={(e) => setSkuData(prev => ({ ...prev, vendor: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  placeholder="Enter vendor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Settings className="w-4 h-4 inline mr-2" />
                  Platform
                </label>
                <input
                  type="text"
                  value={skuData.platform}
                  onChange={(e) => setSkuData(prev => ({ ...prev, platform: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  placeholder="Enter platform identifier"
                />
              </div>
            </div>
          </div>
        );

      case 1: // Profile
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <Settings className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">Profile Configuration</h2>
            </div>

            {!showProfileForm && Object.keys(finalData.profiles).length > 0 ? (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-800">Configured Profiles</h3>
                  <button
                    onClick={() => setShowProfileForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add/Modify Profile
                  </button>
                </div>
                <div className="space-y-3">
                  {Object.keys(finalData.profiles).map((profileName) => {
                    const profile = finalData.profiles[profileName];
                    const breakoutCount = Object.keys(profile.breakout || {}).length;
                    const panelMapCount = Object.keys(profile.panelMap || {}).length;
                    
                    // Show all profiles that exist (since they now have default breakouts)
                    return (
                      <div key={profileName} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <h4 className="font-medium text-gray-800">{profileName}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          MTU: {profile?.interfaceDefaults?.mtu || 'N/A'} | 
                          FEC: {profile?.interfaceDefaults?.fec || 'N/A'} |
                          Physical Ports: {breakoutCount} |
                          Panel Maps: {panelMapCount}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Show the "Add Profile" button if no profiles are configured yet */}
            {!showProfileForm && Object.keys(finalData.profiles).length === 0 && (
              <div className="text-center py-8">
                <button
                  onClick={() => setShowProfileForm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Add First Profile
                </button>
                <p className="text-gray-500 text-sm mt-3">No profiles configured yet. Click to add your first profile.</p>
              </div>
            )}

            {/* Profile modification form */}
            {showProfileForm && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-800">Add/Modify Profile Configuration</h3>
                  <button
                    onClick={() => setShowProfileForm(false)}
                    className="flex items-center gap-2 px-3 py-1 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Close
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Profile Name</label>
                  <select
                    value={profileData.profileName}
                    onChange={(e) => {
                      const selectedProfile = e.target.value;
                      const connections = connectionMap[selectedProfile];
                      if (connections) {
                        setProfileData(prev => ({ 
                          ...prev, 
                          profileName: selectedProfile,
                          connectionFrom: connections.from,
                          connectionTo: connections.isDropdown ? '' : connections.to[0],
                          panelIndexes: defaultPanelIndexes, // Reset to default panel indexes
                          interfaces: [] // Reset interfaces when profile changes
                        }));
                      } else {
                        setProfileData(prev => ({ 
                          ...prev, 
                          profileName: selectedProfile,
                          connectionFrom: '',
                          connectionTo: '',
                          panelIndexes: defaultPanelIndexes,
                          interfaces: []
                        }));
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  >
                    <option value="">Select Profile Type</option>
                    {profileTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {profileData.profileName && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Connection From</label>
                      <input
                        type="text"
                        value={profileData.connectionFrom}
                        disabled
                        className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                        placeholder="Auto-filled based on profile"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Connection To</label>
                      {connectionMap[profileData.profileName]?.isDropdown ? (
                        <select
                          value={profileData.connectionTo}
                          onChange={(e) => setProfileData(prev => ({ ...prev, connectionTo: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                        >
                          <option value="">Select Connection To</option>
                          {connectionMap[profileData.profileName].to.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={profileData.connectionTo}
                          disabled
                          className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                          placeholder="Auto-filled based on profile"
                        />
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">MTU</label>
                    <input
                      type="number"
                      value={profileData.mtu}
                      onChange={(e) => setProfileData(prev => ({ ...prev, mtu: parseInt(e.target.value) }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">FEC</label>
                    <input
                      type="text"
                      value={profileData.fec}
                      onChange={(e) => setProfileData(prev => ({ ...prev, fec: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Breakout</label>
                  <input
                    type="text"
                    value={profileData.breakout}
                    onChange={(e) => setProfileData(prev => ({ ...prev, breakout: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Panel Map Type (Auto-generated)</label>
                  <input
                    type="text"
                    value={`${profileData.connectionFrom}_TO_${profileData.connectionTo}`}
                    disabled
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Physical Ports</label>
                  <MultiSelectDropdown
                    options={interfaceNames}
                    selected={profileData.interfaces}
                    onChange={(selected) => setProfileData(prev => ({ ...prev, interfaces: selected }))}
                    placeholder="Select Physical Ports"
                    getItemStatus={getInterfaceStatus}
                  />
                  {profileData.profileName && (
                    <p className="text-xs text-gray-500 mt-1">
                      Grayed out physical ports are already selected for this profile previously.
                    </p>
                  )}
                </div>

                <button
                  onClick={handleProfileSubmit}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                >
                  Update Profile Configuration
                </button>
              </div>
            )}

            {!showProfileForm && Object.keys(finalData.profiles).filter(profileName => {
              const profile = finalData.profiles[profileName];
              const breakoutCount = Object.keys(profile.breakout || {}).length;
              const panelMapCount = Object.keys(profile.panelMap || {}).length;
              return breakoutCount > 0 || panelMapCount > 0;
            }).length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">Click "Add/Modify Profile" to add more profiles or modify existing ones</p>
              </div>
            )}
          </div>
        );

      case 2: // Preview
        const configuredProfiles = {};
        Object.keys(finalData.profiles).forEach(profileKey => {
          const profile = finalData.profiles[profileKey];
          // Include profile if it exists (since we now populate with defaults)
          if (profile && (Object.keys(profile.breakout || {}).length > 0 || Object.keys(profile.panelMap || {}).length > 0)) {
            configuredProfiles[profileKey] = profile;
          }
        });

        const previewData = {
          name: finalData.name,
          vendor: finalData.vendor,
          platform: finalData.platform,
          interfaces: finalData.interfaces,
          profiles: configuredProfiles
        };

        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Eye className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800">Configuration Preview</h2>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={createSKU}
                  disabled={isCreatingSKU || Object.keys(configuredProfiles).length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {isCreatingSKU ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create SKU
                    </>
                  )}
                </button>
                <button
                  onClick={exportJSON}
                  disabled={Object.keys(configuredProfiles).length === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                </button>
              </div>
            </div>
            
            {Object.keys(configuredProfiles).length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Profiles Configured</h3>
                <p className="text-gray-500">Please go to the Profile tab to configure at least one profile before creating the SKU.</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <pre className="p-6 overflow-auto max-h-96 text-sm text-gray-800 font-mono">
                  {JSON.stringify(previewData, (key, value) => {
                    if (value === null || value === undefined || value === '') {
                      return undefined;
                    }
                    return value;
                  }, 2)}
                </pre>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className={`font-medium ${
            notification.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {notification.message}
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SKU Management System</h1>
          <p className="text-gray-600">Configure and manage SKU profiles with network interface settings</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab, index) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`flex items-center gap-3 py-4 px-6 font-medium text-sm transition-colors ${
                    activeTab === index
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {renderTab()}
        </div>
      </div>
    </div>
  );
};

export default SKUManagementApp;