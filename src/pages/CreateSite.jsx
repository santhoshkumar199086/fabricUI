import React, { useState } from "react";
import { Download, Globe, Settings, CheckCircle, AlertCircle} from "lucide-react";
import axios from "axios";
const SITE_API_URL = import.meta.env.VITE_API_URL;

const SiteConfigurationApp = () => {
  const [siteName, setSiteName] = useState("");
  const [globalNetworkScope, setGlobalNetworkScope] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreate = async () => {
    if (!siteName.trim() || !globalNetworkScope.trim()) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    setIsLoading(true);

    const payload = {
      name: siteName.trim(),
      parameters: {
        networkScopes: {
          GLOBAL: globalNetworkScope.trim(),
        },
      },
    };

    try {
      const response = await axios.post(
        `/api/fabric/v1.0.0/Site`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      showNotification("Site configuration created successfully!");
      // Optionally reset form fields here
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      showNotification(
        `Failed to create site configuration: ${message}`,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportJSON = () => {
    const data = {
      name: siteName.trim(),
      parameters: {
        networkScopes: {
          GLOBAL: globalNetworkScope.trim(),
        },
      },
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `site-config-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification("Configuration exported successfully!");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full mr-3 shadow-lg">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">
              Site Configuration
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Configure your network site settings
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8">
            {/* Form Fields */}
            <div className="space-y-6">
              {/* Site Name Field */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="Enter site name"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100"
                  />
                </div>
              </div>

              {/* Global Network Scope Field */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Global Network Scope Value{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={globalNetworkScope}
                    onChange={(e) => setGlobalNetworkScope(e.target.value)}
                    placeholder="Enter global network scope value"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={handleCreate}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Create Site
                  </>
                )}
              </button>

              <button
                onClick={handleExportJSON}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                Export JSON
              </button>
            </div>

            {/* Form Validation Info */}
            <div className="mt-6 text-sm text-gray-500 text-center">
              <span className="text-red-500">*</span> Required fields
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 max-w-md p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
              notification.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteConfigurationApp;
