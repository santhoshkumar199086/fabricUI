import React, { useState } from "react";
import { Monitor, Network, Cpu, Settings, Share2 } from "lucide-react";
import { deviceProfiles } from "./data";

const DeviceProfileTab = ({ formdata }) => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const formatSpeed = (speed) => {
    if (speed >= 1000) {
      return `${speed / 1000}G`;
    }
    return `${speed}M`;
  };

  const getInterfaceInfo = (interfaceData) => {
    const firstBreakoutMode = Object.values(
      interfaceData.supportedBreakoutModes
    )[0];
    if (firstBreakoutMode && firstBreakoutMode.length > 0) {
      return {
        speed: firstBreakoutMode[0].speed || 1000,
      };
    }
    return { speed: 1000 };
  };

  return (
    <div className="min-h-scree p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Monitor className="text-blue-600" />
          Network Device Profiles
        </h1>

        {/* Device Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {Object.entries(deviceProfiles).map(([key, device]) => (
            <div
              key={key}
              onClick={() => {
                setSelectedDevice(key);
                setSelectedProfile(null);
              }}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedDevice === key
                  ? "border-blue-500 bg-blue-50 shadow-lg"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <Network
                  className={`h-8 w-8 ${
                    selectedDevice === key ? "text-blue-600" : "text-gray-600"
                  }`}
                />
                <h2 className="text-base font-semibold text-gray-900 capitalize">
                  {device.name.replace("-", " ")}
                </h2>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  <span className="text-xs">{device.platform}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 bg-gray-400 rounded-full"></span>
                  <span className="capitalize">{device.vendor}</span>
                </div>
                <div className="text-xs text-gray-500 mt-3">
                  {Object.keys(device.interfaces).length} interfaces available
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Device Details */}
        {selectedDevice && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 capitalize mb-3">
                {deviceProfiles[selectedDevice].name.replace("-", " ")} Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-semibold text-gray-700 mb-1 text-sm">
                    Name
                  </h4>
                  <p className="text-gray-900 capitalize text-sm">
                    {deviceProfiles[selectedDevice].name}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-semibold text-gray-700 mb-1 text-sm">
                    Platform
                  </h4>
                  <p className="text-gray-900 text-xs break-all">
                    {deviceProfiles[selectedDevice].platform}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="font-semibold text-gray-700 mb-1 text-sm">
                    Vendor
                  </h4>
                  <p className="text-gray-900 capitalize text-sm">
                    {deviceProfiles[selectedDevice].vendor}
                  </p>
                </div>
              </div>

              {/* Device Profiles */}
              {deviceProfiles[selectedDevice].profiles && (
                <div className="mt-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-600" />
                    Available Profiles
                  </h4>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.keys(deviceProfiles[selectedDevice].profiles).map(
                      (profileName) => (
                        <button
                          key={profileName}
                          onClick={() => setSelectedProfile(profileName)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            selectedProfile === profileName
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {profileName}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Details */}
            {selectedProfile && (
              <div className="p-6 border-b border-gray-200 bg-blue-50">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  {selectedProfile} Profile Configuration
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Panel Map */}
                  <div className="bg-white p-4 rounded-lg shadow border border-blue-100">
                    <h5 className="font-medium text-blue-800 mb-3">
                      Panel Map
                    </h5>
                    <div className="space-y-3">
                      {Object.entries(
                        deviceProfiles[selectedDevice].profiles[selectedProfile]
                          .panelMap
                      ).map(([mapName, ports]) => (
                        <div
                          key={mapName}
                          className="border-b border-gray-100 pb-2"
                        >
                          <div className="font-medium text-gray-700 mb-1">
                            {mapName}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(ports).map(
                              ([portIndex, interfaceName]) => (
                                <div
                                  key={portIndex}
                                  className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
                                >
                                  <span className="text-gray-600">
                                    Port {portIndex}:
                                  </span>
                                  <span className="font-mono text-xs bg-blue-100 px-2 py-1 rounded">
                                    {interfaceName}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interface Defaults */}
                  <div className="bg-white p-4 rounded-lg shadow border border-blue-100">
                    <h5 className="font-medium text-blue-800 mb-3">
                      Interface Defaults
                    </h5>
                    <div className="space-y-2">
                      {Object.entries(
                        deviceProfiles[selectedDevice].profiles[selectedProfile]
                          .interfaceDefaults
                      ).map(([setting, value]) => (
                        <div
                          key={setting}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded"
                        >
                          <span className="text-gray-700 capitalize">
                            {setting}:
                          </span>
                          <span className="font-medium text-blue-700">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Interfaces */}
            <div className="p-6">
              <h4 className="text-base font-semibold text-gray-900 mb-4">
                Interfaces (
                {Object.keys(deviceProfiles[selectedDevice].interfaces).length})
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {Object.entries(deviceProfiles[selectedDevice].interfaces).map(
                  ([interfaceName, interfaceData]) => {
                    const info = getInterfaceInfo(interfaceData);
                    return (
                      <div
                        key={interfaceName}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-medium text-gray-900 text-xs truncate">
                          {interfaceName}
                        </span>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded ml-2 flex-shrink-0">
                          {formatSpeed(info.speed)}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Interface Details Summary */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-2">
                  Interface Summary
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">
                      Total Interfaces:
                    </span>
                    <p className="text-blue-900 font-semibold">
                      {
                        Object.keys(deviceProfiles[selectedDevice].interfaces)
                          .length
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">
                      Device Type:
                    </span>
                    <p className="text-blue-900 font-semibold capitalize">
                      {deviceProfiles[selectedDevice].vendor}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Platform:</span>
                    <p className="text-blue-900 font-semibold text-xs">
                      {deviceProfiles[selectedDevice].platform.split("-")[0]}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">
                      Config Ready:
                    </span>
                    <p className="text-green-600 font-semibold">✓ Yes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!selectedDevice && (
          <div className="text-center py-12">
            <Network className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Select a device profile above to view its details
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceProfileTab;
