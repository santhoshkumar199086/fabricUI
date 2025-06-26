import React, { useState } from "react";
import SiteTab from "./SiteTab";
import DeviceProfileTab from "./DeviceProfileTab";
import FabricDesignTab from "./FabricDesignTab";

const FabricConfigTabs = () => {
  const [activeTab, setActiveTab] = useState("site");
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    site: {
      siteName: "",
      createdSites: [],
    },
    deviceSKUs: {},
    fabricDesign: {
      designName: "",
      topology: "spine-leaf",
      spineCount: 2,
      leafCount: 4,
      vlanRange: "",
    },
  });

  const tabs = [
    { id: "site", label: "Site", icon: "🏢" },
    { id: "deviceProfile", label: "Device Profile", icon: "📱" },
    { id: "fabricDesign", label: "Fabric Design", icon: "🔧" },
  ];

  const handleInputChange = (tab, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [field]: value,
      },
    }));
  };

  const handleCreateSite = () => {
    if (formData.site.siteName.trim()) {
      setFormData((prev) => ({
        ...prev,
        site: {
          ...prev.site,
          createdSites: [...prev.site.createdSites, prev.site.siteName.trim()],
          siteName: "",
        },
      }));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleRemoveSite = (siteToRemove) => {
    setFormData((prev) => ({
      ...prev,
      site: {
        ...prev.site,
        createdSites: prev.site.createdSites.filter(
          (site) => site !== siteToRemove
        ),
      },
    }));
  };

  const handleSubmit = (tabType) => {
    console.log(`${tabType} Form Data:`, formData[tabType]);
    console.log("Complete JSON:", JSON.stringify(formData, null, 2));

    const notifications = {
      site: `Site configuration saved! ${formData.site.createdSites.length} sites configured.`,
      deviceProfile: `Device profile "${
        formData.deviceProfile?.profileName || "Unnamed"
      }" saved!`,
      fabricDesign: `Fabric design "${
        formData.fabricDesign.designName || "Unnamed"
      }" saved!`,
    };

    alert(notifications[tabType]);
  };

  const renderTabContent = () => {
    const commonProps = {
      formData,
      handleInputChange,
      handleSubmit,
    };

    switch (activeTab) {
      case "site":
        return (
          <SiteTab
            {...commonProps}
            handleCreateSite={handleCreateSite}
            handleRemoveSite={handleRemoveSite}
            showSuccess={showSuccess}
            setShowSuccess={setShowSuccess}
          />
        );
      case "deviceProfile":
        return <DeviceProfileTab {...commonProps} />;
      case "fabricDesign":
        return <FabricDesignTab {...commonProps} />;
      default:
        return (
          <SiteTab
            {...commonProps}
            handleCreateSite={handleCreateSite}
            handleRemoveSite={handleRemoveSite}
            showSuccess={showSuccess}
            setShowSuccess={setShowSuccess}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏗️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fabric NMS</h1>
              <p className="text-gray-600">
                Design, Configure, Manage, and Validate the Internet-based
                fabric network architecture
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-center font-medium transition-all relative ${
                    activeTab === tab.id
                      ? "text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default FabricConfigTabs;
