import React, { useState } from 'react';

const PalCFabricManager = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('site');
  
  // Site form state
  const [siteName, setSiteName] = useState('');
  const [siteStatus, setSiteStatus] = useState({ message: '', type: '', visible: false });
  const [siteLoading, setSiteLoading] = useState(false);
  const [createdSites, setCreatedSites] = useState(['blore', 'mumbai']); // Track created sites with some sample data
  const [showSiteModal, setShowSiteModal] = useState(false);

  // Device form state
  const [deviceForm, setDeviceForm] = useState({
    deviceName: '',
    vendor: '',
    platform: ''
  });
  
  const [interfaces, setInterfaces] = useState([]);
  const [interfaceCounter, setInterfaceCounter] = useState(0);
  const [deviceStatus, setDeviceStatus] = useState({ message: '', type: '', visible: false });
  const [deviceLoading, setDeviceLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copyText, setCopyText] = useState('Copy JSON');
  const [createdDeviceProfiles, setCreatedDeviceProfiles] = useState([
    // Sample device profiles to show the list
    {
      id: 1,
      name: "Dell-S6000",
      vendor: "Dell EMC",
      platform: "x86_dell_s6000",
      interfaces: {
        "Ethernet1/1/1": { lanes: [25], sonicIndex: 0, supportedBreakoutModes: {} },
        "Ethernet1/1/2": { lanes: [29], sonicIndex: 1, supportedBreakoutModes: {} }
      },
      createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
      id: 2,
      name: "Arista-7050",
      vendor: "Arista",
      platform: "x86_arista_7050",
      interfaces: {
        "Ethernet1": { lanes: [25], sonicIndex: 0, supportedBreakoutModes: {} }
      },
      createdAt: "2024-01-01T00:00:00.000Z"
    }
  ]); // Store created device profiles with sample data
  
  // Bulk interface creation state
  const [bulkInterface, setBulkInterface] = useState({
    baseName: '',
    startIndex: 1,
    count: 1,
    speed: ''
  });

  // Fabric Design state
  const [fabricForm, setFabricForm] = useState({
    fabricName: '',
    site: ''
  });
  const [fabricStatus, setFabricStatus] = useState({ message: '', type: '', visible: false });
  const [fabricLoading, setFabricLoading] = useState(false);
  const [showFabricModal, setShowFabricModal] = useState(false);

  // Configuration
  const API_HOST = 'localhost:8080';

  // Helper function to show status
  const showStatus = (message, type, isDevice = false) => {
    const setStatus = isDevice ? setDeviceStatus : setSiteStatus;
    setStatus({ message, type, visible: true });
    
    if (type !== 'loading') {
      setTimeout(() => {
        setStatus(prev => ({ ...prev, visible: false }));
      }, type === 'success' ? 4000 : 5000);
    }
  };

  // Site form handlers
  const handleSiteSubmit = async () => {
    if (!siteName.trim()) {
      showStatus('Please enter a site name', 'error');
      return;
    }

    try {
      setSiteLoading(true);
      showStatus('Creating site...', 'loading');
      
      const apiUrl = `http://${API_HOST}/api/fabric/v1.0.0/Site`;
      const payload = { name: siteName.toLowerCase() };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Uncomment for real API call:
      // const response = await fetch(apiUrl, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });
      
      // if (!response.ok) {
      //   throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      // }
      
      showStatus(`Site "${siteName}" created successfully!`, 'success');
      
      // Add the created site to the list for fabric design
      const newSite = siteName.toLowerCase();
      if (!createdSites.includes(newSite)) {
        setCreatedSites(prev => [...prev, newSite]);
      }
      
      setSiteName('');
      
    } catch (error) {
      console.error('Error creating site:', error);
      let errorMessage = 'Failed to create site. ';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage += 'Please check API connection.';
      } else {
        errorMessage += error.message;
      }
      
      showStatus(errorMessage, 'error');
    } finally {
      setSiteLoading(false);
    }
  };

  // Device form handlers
  const handleDeviceFormChange = (field, value) => {
    setDeviceForm(prev => ({ ...prev, [field]: value }));
  };

  const addInterface = () => {
    const newInterface = {
      id: interfaceCounter + 1,
      name: '',
      speed: ''
    };
    setInterfaces(prev => [...prev, newInterface]);
    setInterfaceCounter(prev => prev + 1);
  };

  const addBulkInterfaces = () => {
    if (!bulkInterface.baseName || !bulkInterface.speed || bulkInterface.count < 1) {
      showStatus('Please fill in all bulk interface fields', 'error', true);
      return;
    }

    const newInterfaces = [];
    for (let i = 0; i < bulkInterface.count; i++) {
      const interfaceIndex = bulkInterface.startIndex + i;
      const newInterface = {
        id: interfaceCounter + i + 1,
        name: `${bulkInterface.baseName}${interfaceIndex}`,
        speed: bulkInterface.speed
      };
      newInterfaces.push(newInterface);
    }

    setInterfaces(prev => [...prev, ...newInterfaces]);
    setInterfaceCounter(prev => prev + bulkInterface.count);
    
    // Reset bulk form
    setBulkInterface({
      baseName: '',
      startIndex: 1,
      count: 1,
      speed: ''
    });

    showStatus(`Added ${bulkInterface.count} interfaces successfully!`, 'success', true);
  };

  const handleBulkInterfaceChange = (field, value) => {
    setBulkInterface(prev => ({ ...prev, [field]: value }));
  };

  const deleteDeviceProfile = (profileId) => {
    const profileToDelete = createdDeviceProfiles.find(profile => profile.id === profileId);
    setCreatedDeviceProfiles(prev => prev.filter(profile => profile.id !== profileId));
    showStatus(`Device profile "${profileToDelete?.name}" deleted successfully!`, 'success', true);
  };

  // Fabric Design handlers
  const handleFabricFormChange = (field, value) => {
    setFabricForm(prev => ({ ...prev, [field]: value }));
  };

  const collectFabricData = () => {
    return {
      name: fabricForm.fabricName,
      site: fabricForm.site
    };
  };

  const handleFabricSubmit = async () => {
    try {
      setFabricLoading(true);
      
      // Show loading status using fabric status
      setFabricStatus({ message: 'Creating fabric design...', type: 'loading', visible: true });
      
      const fabricData = collectFabricData();
      
      // Validate required fields
      if (!fabricData.name || !fabricData.site) {
        setFabricStatus({ message: 'Please fill in required fields (Fabric Name, Site)', type: 'error', visible: true });
        setTimeout(() => setFabricStatus(prev => ({ ...prev, visible: false })), 5000);
        return;
      }
      
      // Make API call to create fabric design
      const apiUrl = 'http://172.27.1.132:8080/api/fabric/v1.0.0/Fabric';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fabricData)
      });
      
      if (response.ok) {
        const responseData = await response.json();
        setFabricStatus({ message: `Fabric design "${fabricData.name}" created successfully!`, type: 'success', visible: true });
        setTimeout(() => setFabricStatus(prev => ({ ...prev, visible: false })), 4000);
        console.log('Fabric Design Created:', responseData);
        
        // Reset form after successful creation
        setFabricForm({
          fabricName: '',
          site: ''
        });
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('Error creating fabric design:', error);
      let errorMessage = 'Failed to create fabric design. ';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage += 'Please check API connection.';
      } else {
        errorMessage += error.message;
      }
      
      setFabricStatus({ message: errorMessage, type: 'error', visible: true });
      setTimeout(() => setFabricStatus(prev => ({ ...prev, visible: false })), 5000);
    } finally {
      setFabricLoading(false);
    }
  };

  const previewFabricJson = () => {
    setShowFabricModal(true);
  };

  const copyFabricJsonToClipboard = () => {
    const fabricData = collectFabricData();
    const jsonText = JSON.stringify(fabricData, null, 2);
    navigator.clipboard.writeText(jsonText).then(() => {
      const originalText = copyText;
      setCopyText('Copied!');
      setTimeout(() => setCopyText(originalText), 2000);
    });
  };

  const removeInterface = (id) => {
    setInterfaces(prev => prev.filter(iface => iface.id !== id));
  };

  const updateInterface = (id, field, value) => {
    setInterfaces(prev => prev.map(iface => 
      iface.id === id ? { ...iface, [field]: value } : iface
    ));
  };

  const collectDeviceFormData = () => {
    const deviceData = {
      name: deviceForm.deviceName,
      vendor: deviceForm.vendor,
      platform: deviceForm.platform,
      interfaces: {}
    };

    interfaces.forEach((iface, index) => {
      if (iface.name && iface.speed) {
        const sonicIndex = index;
        const laneNumber = 25 + (index * 4);
        
        // Convert speed to Mbps
        const speedMap = {
          '1G': 1000,
          '10G': 10000,
          '25G': 25000,
          '40G': 40000,
          '100G': 100000
        };
        const speedMbps = speedMap[iface.speed] || 1000;
        
        const aliasIndex = index + 1;

        deviceData.interfaces[iface.name] = {
          lanes: [laneNumber],
          sonicIndex: sonicIndex,
          supportedBreakoutModes: {
            [`1x${iface.speed}`]: [{
              alias: `fortyGigE0/${aliasIndex}`,
              laneCount: 1,
              port: iface.name,
              speed: speedMbps
            }]
          }
        };
      }
    });

    return deviceData;
  };

  const previewDeviceJson = () => {
    setShowModal(true);
  };

  const copyJsonToClipboard = () => {
    const deviceData = collectDeviceFormData();
    const jsonText = JSON.stringify(deviceData, null, 2);
    navigator.clipboard.writeText(jsonText).then(() => {
      const originalText = copyText;
      setCopyText('Copied!');
      setTimeout(() => setCopyText(originalText), 2000);
    });
  };

  const handleDeviceSubmit = async () => {
    try {
      setDeviceLoading(true);
      showStatus('Creating device profile...', 'loading', true);
      
      const deviceData = collectDeviceFormData();
      
      // Validate required fields
      if (!deviceData.name || !deviceData.vendor || !deviceData.platform) {
        showStatus('Please fill in all required fields (Device Name, Vendor, Platform)', 'error', true);
        return;
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store device profile locally instead of API call
      const newDeviceProfile = {
        id: Date.now(), // Simple ID generation
        ...deviceData,
        createdAt: new Date().toISOString()
      };
      
      setCreatedDeviceProfiles(prev => [...prev, newDeviceProfile]);
      
      // API call is commented out for local storage
      // const apiUrl = 'http://172.27.1.132:8080/api/fabric/v1.0.0/SKU';
      // const response = await fetch(apiUrl, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(deviceData)
      // });
      // 
      // if (response.ok) {
      //   const responseData = await response.json();
      //   showStatus(`Device profile "${deviceData.name}" created successfully!`, 'success', true);
      //   console.log('Device Profile Created:', responseData);
      // } else {
      //   const errorText = await response.text();
      //   throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
      // }
      
      showStatus(`Device profile "${deviceData.name}" created successfully!`, 'success', true);
      console.log('Device Profile Created Locally:', newDeviceProfile);
      
      // Reset form after successful creation
      setDeviceForm({
        deviceName: '',
        vendor: '',
        platform: ''
      });
      setInterfaces([]);
      setInterfaceCounter(0);
      setBulkInterface({
        baseName: '',
        startIndex: 1,
        count: 1,
        speed: ''
      });
      
    } catch (error) {
      console.error('Error creating device profile:', error);
      let errorMessage = 'Failed to create device profile. ';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage += 'Please check API connection.';
      } else {
        errorMessage += error.message;
      }
      
      showStatus(errorMessage, 'error', true);
    } finally {
      setDeviceLoading(false);
    }
  };

  const handleSiteNameChange = (value) => {
    // Only allow alphanumeric characters, hyphens, and underscores
    const sanitized = value.replace(/[^a-zA-Z0-9\-_]/g, '');
    setSiteName(sanitized);
  };

  const deleteSite = (siteToDelete) => {
    setCreatedSites(prev => prev.filter(site => site !== siteToDelete));
    showStatus(`Site "${siteToDelete}" deleted successfully!`, 'success');
  };

  const previewSiteJson = () => {
    setShowSiteModal(true);
  };

  const collectSiteData = () => {
    return {
      name: siteName.toLowerCase()
    };
  };

  const copySiteJsonToClipboard = () => {
    const siteData = collectSiteData();
    const jsonText = JSON.stringify(siteData, null, 2);
    navigator.clipboard.writeText(jsonText).then(() => {
      const originalText = copyText;
      setCopyText('Copied!');
      setTimeout(() => setCopyText(originalText), 2000);
    });
  };

  const StatusComponent = ({ status, loading }) => (
    <div className={`status ${status.type} ${status.visible ? 'visible' : ''}`}>
      {status.type === 'loading' && <span className="spinner"></span>}
      {status.message}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      {/* Main Header */}
      <div className="max-w-6xl mx-auto mb-8 text-center p-5">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          🌐 PalC Fabric Manager
        </h1>
        <p className="text-gray-600 text-lg opacity-80">
          Intent-Based Network Management Platform
        </p>
      </div>

      {/* Tabs Container */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Tabs Header */}
        <div className="flex bg-gray-50 border-b border-gray-200">
          <button
            className={`flex-1 p-4 text-lg font-medium transition-all duration-200 relative ${
              activeTab === 'site'
                ? 'text-indigo-600 bg-white border-b-3 border-indigo-600'
                : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
            onClick={() => setActiveTab('site')}
          >
            Site
          </button>
          <button
            className={`flex-1 p-4 text-lg font-medium transition-all duration-200 relative ${
              activeTab === 'device'
                ? 'text-indigo-600 bg-white border-b-3 border-indigo-600'
                : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
            onClick={() => setActiveTab('device')}
          >
            Device Profile
          </button>
          <button
            className={`flex-1 p-4 text-lg font-medium transition-all duration-200 relative ${
              activeTab === 'fabric'
                ? 'text-indigo-600 bg-white border-b-3 border-indigo-600'
                : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
            onClick={() => setActiveTab('fabric')}
          >
            Fabric Design
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {/* Site Tab */}
          {activeTab === 'site' && (
            <div className="p-8">
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4">
                  <h3 className="text-xl font-semibold mb-1">Location</h3>
                  <p className="text-sm opacity-90">Add a new Location (Site) to your Data Center</p>
                </div>
                
                <div className="p-5 bg-white">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label htmlFor="siteName" className="block mb-2 text-gray-700 font-medium text-sm">
                        Site Name
                      </label>
                      <input
                        type="text"
                        id="siteName"
                        value={siteName}
                        onChange={(e) => handleSiteNameChange(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSiteSubmit()}
                        placeholder="e.g., chennai, mumbai, bangalore"
                        className="w-full p-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={handleSiteSubmit}
                      disabled={siteLoading}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none rounded-lg font-semibold cursor-pointer transition-all hover:transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none min-w-32"
                    >
                      Create Site
                    </button>
                    <button
                      type="button"
                      onClick={previewSiteJson}
                      disabled={!siteName.trim()}
                      className="px-6 py-3 bg-gray-600 text-white border-none rounded-lg font-semibold cursor-pointer transition-all hover:bg-gray-700 hover:transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      Preview JSON
                    </button>
                  </div>
                  
                  <StatusComponent status={siteStatus} loading={siteLoading} />
                </div>
              </div>

              {/* Created Sites List */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-800">Created Sites ({createdSites.length})</h3>
                </div>
                
                <div className="p-4">
                  {createdSites.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <p>No sites created yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {createdSites.map((site, index) => (
                        <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded border">
                          <span className="text-gray-800">{site}</span>
                          <button
                            onClick={() => deleteSite(site)}
                            className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            title={`Remove ${site}`}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

      {/* Site JSON Preview Modal */}
      {showSiteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowSiteModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-4/5 max-w-2xl max-h-4/5 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5 flex justify-between items-center">
              <h4 className="text-xl font-semibold">Site JSON Preview</h4>
              <button
                onClick={() => setShowSiteModal(false)}
                className="text-2xl font-bold cursor-pointer hover:opacity-70"
              >
                ×
              </button>
            </div>
            <div className="p-5 max-h-96 overflow-y-auto">
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border border-gray-200 whitespace-pre-wrap">
                {JSON.stringify(collectSiteData(), null, 2)}
              </pre>
            </div>
            <div className="p-5 border-t border-gray-200 text-right">
              <button
                onClick={copySiteJsonToClipboard}
                className="px-5 py-2 bg-green-600 text-white border-none rounded cursor-pointer font-medium hover:bg-green-700"
              >
                {copyText}
              </button>
            </div>
          </div>
        </div>
      )}
                </div>
              </div>
            </div>
          )}

          {/* Device Tab */}
          {activeTab === 'device' && (
            <div className="p-8">
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4">
                  <h3 className="text-xl font-semibold mb-1">Device Profile Configuration</h3>
                  <p className="text-sm opacity-90">Configure network device specifications and interfaces</p>
                </div>
                
                <div className="p-5 bg-white">
                  <div>
                    {/* Basic Information */}
                    <div className="mb-6 p-5 bg-white rounded-lg border border-gray-200">
                      <h4 className="text-gray-700 text-lg font-semibold mb-4 pb-2 border-b-2 border-indigo-600">
                        Device Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block mb-2 text-gray-700 font-medium text-sm">Device Name</label>
                          <input
                            type="text"
                            value={deviceForm.deviceName}
                            onChange={(e) => handleDeviceFormChange('deviceName', e.target.value)}
                            placeholder="e.g., Force10-S6000"
                            className="w-full p-3 border-2 border-gray-200 rounded-lg transition-all focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                        <div>
                          <label className="block mb-2 text-gray-700 font-medium text-sm">Vendor</label>
                          <input
                            type="text"
                            value={deviceForm.vendor}
                            onChange={(e) => handleDeviceFormChange('vendor', e.target.value)}
                            placeholder="e.g., Dell EMC"
                            className="w-full p-3 border-2 border-gray-200 rounded-lg transition-all focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                        <div>
                          <label className="block mb-2 text-gray-700 font-medium text-sm">Platform</label>
                          <input
                            type="text"
                            value={deviceForm.platform}
                            onChange={(e) => handleDeviceFormChange('platform', e.target.value)}
                            placeholder="e.g., x86_dell_s5224f_vm"
                            className="w-full p-3 border-2 border-gray-200 rounded-lg transition-all focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Interface Configuration */}
                    <div className="mb-6 p-5 bg-white rounded-lg border border-gray-200">
                      <h4 className="text-gray-700 text-lg font-semibold mb-4 pb-2 border-b-2 border-indigo-600">
                        Interface Configuration
                      </h4>
                      
                      {/* Bulk Interface Creation */}
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="text-blue-800 font-semibold mb-3">Bulk Interface Creation</h5>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                          <div>
                            <label className="block mb-1 text-blue-700 text-sm font-medium">Base Name</label>
                            <input
                              type="text"
                              value={bulkInterface.baseName}
                              onChange={(e) => handleBulkInterfaceChange('baseName', e.target.value)}
                              placeholder="e.g., Ethernet1/1/"
                              className="w-full p-2 border border-blue-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-blue-700 text-sm font-medium">Start Index</label>
                            <input
                              type="number"
                              value={bulkInterface.startIndex}
                              onChange={(e) => handleBulkInterfaceChange('startIndex', parseInt(e.target.value) || 1)}
                              min="1"
                              className="w-full p-2 border border-blue-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-blue-700 text-sm font-medium">Count</label>
                            <input
                              type="number"
                              value={bulkInterface.count}
                              onChange={(e) => handleBulkInterfaceChange('count', parseInt(e.target.value) || 1)}
                              min="1"
                              max="48"
                              className="w-full p-2 border border-blue-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-blue-700 text-sm font-medium">Speed</label>
                            <select
                              value={bulkInterface.speed}
                              onChange={(e) => handleBulkInterfaceChange('speed', e.target.value)}
                              className="w-full p-2 border border-blue-300 rounded text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                            >
                              <option value="">Select Speed</option>
                              <option value="1G">1G</option>
                              <option value="10G">10G</option>
                              <option value="25G">25G</option>
                              <option value="40G">40G</option>
                              <option value="100G">100G</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={addBulkInterfaces}
                            className="px-4 py-2 bg-blue-600 text-white border-none rounded-md font-medium cursor-pointer transition-all hover:bg-blue-700 hover:transform hover:-translate-y-0.5 text-sm"
                          >
                            Create Series
                          </button>
                        </div>
                        
                        {/* Preview of what will be created */}
                        {bulkInterface.baseName && bulkInterface.count > 0 && (
                          <div className="mt-3 p-2 bg-blue-100 rounded text-sm">
                            <span className="text-blue-700 font-medium">Preview: </span>
                            <span className="text-blue-600">
                              {Array.from({ length: Math.min(bulkInterface.count, 3) }, (_, i) => 
                                `${bulkInterface.baseName}${bulkInterface.startIndex + i}`
                              ).join(', ')}
                              {bulkInterface.count > 3 && ` ... (+${bulkInterface.count - 3} more)`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Individual Interface Controls */}
                      <div className="flex justify-between items-center mb-4 p-4 bg-indigo-50 rounded-lg">
                        <div className="flex gap-3 items-center">
                          <button
                            type="button"
                            onClick={addInterface}
                            className="px-5 py-2 bg-green-600 text-white border-none rounded-md font-medium cursor-pointer transition-all hover:bg-green-700 hover:transform hover:-translate-y-0.5"
                          >
                            Add Single Interface
                          </button>
                          {interfaces.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setInterfaces([])}
                              className="px-4 py-2 bg-red-600 text-white border-none rounded-md font-medium cursor-pointer transition-all hover:bg-red-700 text-sm"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                        <div className="font-semibold text-indigo-600">
                          Total Interfaces: <span>{interfaces.length}</span>
                        </div>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto space-y-3">
                        {interfaces.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <p className="text-lg">No interfaces configured</p>
                            <p className="text-sm">Use bulk creation or add individual interfaces above</p>
                          </div>
                        ) : (
                          interfaces.map((iface, index) => (
                            <div key={iface.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative">
                              <div className="flex justify-between items-center mb-3">
                                <span className="font-semibold text-gray-700">
                                  Interface {index + 1} {iface.name && `(${iface.name})`}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeInterface(iface.id)}
                                  className="bg-red-600 text-white border-none rounded px-3 py-1 text-sm cursor-pointer hover:bg-red-700"
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block mb-1 text-gray-700 text-sm">Interface Name</label>
                                  <input
                                    type="text"
                                    value={iface.name}
                                    onChange={(e) => updateInterface(iface.id, 'name', e.target.value)}
                                    placeholder="e.g., Ethernet1/1/1"
                                    className="w-full p-2 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block mb-1 text-gray-700 text-sm">Speed</label>
                                  <select
                                    value={iface.speed}
                                    onChange={(e) => updateInterface(iface.id, 'speed', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                                  >
                                    <option value="">Select Speed</option>
                                    <option value="1G">1G</option>
                                    <option value="10G">10G</option>
                                    <option value="25G">25G</option>
                                    <option value="40G">40G</option>
                                    <option value="100G">100G</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 justify-end mt-5 p-5 bg-white rounded-lg">
                      <button
                        onClick={handleDeviceSubmit}
                        disabled={deviceLoading}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none rounded-lg font-semibold cursor-pointer transition-all hover:transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        Create Device Profile
                      </button>
                      <button
                        type="button"
                        onClick={previewDeviceJson}
                        className="px-6 py-3 bg-gray-600 text-white border-none rounded-lg font-semibold cursor-pointer transition-all hover:bg-gray-700 hover:transform hover:-translate-y-0.5"
                      >
                        Preview JSON
                      </button>
                    </div>
                  </div>
                  
                  <StatusComponent status={deviceStatus} loading={deviceLoading} />
                </div>
              </div>
            </div>
          )}

          {/* Fabric Design Tab */}
          {activeTab === 'fabric' && (
            <div className="p-8">
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4">
                  <h3 className="text-xl font-semibold mb-1">Fabric Design Configuration</h3>
                  <p className="text-sm opacity-90">Create and configure network fabric</p>
                </div>
                
                <div className="p-5 bg-white">
                  <div>
                    {/* Fabric Configuration */}
                    <div className="mb-6 p-5 bg-white rounded-lg border border-gray-200">
                      <h4 className="text-gray-700 text-lg font-semibold mb-4 pb-2 border-b-2 border-indigo-600">
                        Fabric Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block mb-2 text-gray-700 font-medium text-sm">Fabric Name</label>
                          <input
                            type="text"
                            value={fabricForm.fabricName}
                            onChange={(e) => handleFabricFormChange('fabricName', e.target.value)}
                            placeholder="e.g., BloreDellTopology"
                            className="w-full p-3 border-2 border-gray-200 rounded-lg transition-all focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                        <div>
                          <label className="block mb-2 text-gray-700 font-medium text-sm">Site</label>
                          <select
                            value={fabricForm.site}
                            onChange={(e) => handleFabricFormChange('site', e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg transition-all focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white"
                          >
                            <option value="">Select Site</option>
                            {createdSites.map((site, index) => (
                              <option key={index} value={site}>
                                {site}
                              </option>
                            ))}
                          </select>
                          {createdSites.length === 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                              No sites available. Create a site in the Site tab first.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 justify-end mt-5 p-5 bg-white rounded-lg">
                      <button
                        onClick={handleFabricSubmit}
                        disabled={fabricLoading || !fabricForm.fabricName || !fabricForm.site}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none rounded-lg font-semibold cursor-pointer transition-all hover:transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        Create Fabric Design
                      </button>
                      <button
                        type="button"
                        onClick={previewFabricJson}
                        disabled={!fabricForm.fabricName || !fabricForm.site}
                        className="px-6 py-3 bg-gray-600 text-white border-none rounded-lg font-semibold cursor-pointer transition-all hover:bg-gray-700 hover:transform hover:-translate-y-0.5 disabled:opacity-50"
                      >
                        Preview JSON
                      </button>
                    </div>
                  </div>
                  
                  <StatusComponent status={fabricStatus} loading={fabricLoading} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fabric JSON Preview Modal */}
      {showFabricModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowFabricModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-4/5 max-w-4xl max-h-4/5 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5 flex justify-between items-center">
              <h4 className="text-xl font-semibold">Fabric Design JSON Preview</h4>
              <button
                onClick={() => setShowFabricModal(false)}
                className="text-2xl font-bold cursor-pointer hover:opacity-70"
              >
                ×
              </button>
            </div>
            <div className="p-5 max-h-96 overflow-y-auto">
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border border-gray-200 whitespace-pre-wrap">
                {JSON.stringify(collectFabricData(), null, 2)}
              </pre>
            </div>
            <div className="p-5 border-t border-gray-200 text-right">
              <button
                onClick={copyFabricJsonToClipboard}
                className="px-5 py-2 bg-green-600 text-white border-none rounded cursor-pointer font-medium hover:bg-green-700"
              >
                {copyText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Preview Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-4/5 max-w-4xl max-h-4/5 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5 flex justify-between items-center">
              <h4 className="text-xl font-semibold">Device Profile JSON Preview</h4>
              <button
                onClick={() => setShowModal(false)}
                className="text-2xl font-bold cursor-pointer hover:opacity-70"
              >
                ×
              </button>
            </div>
            <div className="p-5 max-h-96 overflow-y-auto">
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border border-gray-200 whitespace-pre-wrap">
                {JSON.stringify(collectDeviceFormData(), null, 2)}
              </pre>
            </div>
            <div className="p-5 border-t border-gray-200 text-right">
              <button
                onClick={copyJsonToClipboard}
                className="px-5 py-2 bg-green-600 text-white border-none rounded cursor-pointer font-medium hover:bg-green-700"
              >
                {copyText}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .status {
          margin-top: 15px;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
          font-size: 0.9rem;
          font-weight: 500;
          display: none;
        }

        .status.visible {
          display: block;
        }

        .status.success {
          background: rgba(76, 175, 80, 0.1);
          color: #4caf50;
          border: 1px solid rgba(76, 175, 80, 0.3);
        }

        .status.error {
          background: rgba(244, 67, 54, 0.1);
          color: #f44336;
          border: 1px solid rgba(244, 67, 54, 0.3);
        }

        .status.loading {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          border: 1px solid rgba(102, 126, 234, 0.3);
        }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PalCFabricManager;