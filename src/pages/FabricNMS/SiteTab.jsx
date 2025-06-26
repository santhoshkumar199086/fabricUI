import React, { useEffect, useState } from "react";
import axios from "axios";

const SiteTab = ({
  formData,
  handleInputChange,
  handleCreateSite,
  handleRemoveSite,
  handleSubmit,
  showSuccess,
  setShowSuccess,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllSites();
  }, []);

  const fetchAllSites = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/get-api/fabric/v1.0.0/site/getAll", {
        timeout: 10000,
      });

      if (response.status === 200) {
        console.log("Sites fetched successfully:", response.data);

        const siteNames = response.data.map((site) => site.name);

        handleInputChange("site", "createdSites", siteNames);

        console.log("Updated createdSites:", siteNames);
      }
    } catch (error) {
      console.error("Error fetching sites:", error);

      if (error.response) {
        setApiError(
          `Error fetching sites: ${error.response.status} - ${
            error.response.data?.message || "Unknown error"
          }`
        );
      } else if (error.request) {
        setApiError(
          "Network Error: Unable to connect to server. Please check your connection."
        );
      } else {
        setApiError(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSiteWithAPI = async () => {
    console.log("Creating site with API...");
    if (!formData.site.siteName.trim()) {
      alert("Please enter a site name");
      return;
    }

    setIsCreating(true);
    setApiError(null);

    try {
      const payload = {
        name: formData.site.siteName.trim(),
      };

      const response = await axios.post("/api/fabric/v1.0.0/Site", payload, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      if (response.status === 200 || response.status === 201) {
        console.log("Site created successfully:", response.data);

        handleCreateSite();

        setTimeout(() => {
          fetchAllSites();

          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        }, 1000);
      }
    } catch (error) {
      console.error("Error creating site:", error);

      if (error.response) {
        setApiError(
          `Server Error: ${error.response.status} - ${
            error.response.data?.message || "Unknown error"
          }`
        );
      } else if (error.request) {
        setApiError(
          "Network Error: Unable to connect to server. Please check your connection."
        );
      } else {
        setApiError(`Error: ${error.message}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 pt-8">
      {/* <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Location</h2>
        <p className="text-indigo-100">
          Add a new Location (Site) to your Data Center
        </p>
      </div> */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Name
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={formData.site.siteName}
                onChange={(e) =>
                  handleInputChange("site", "siteName", e.target.value)
                }
                placeholder="e.g., chennai, mumbai, bangalore"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                disabled={isCreating}
              />
              <button
                onClick={handleCreateSiteWithAPI}
                disabled={isCreating || !formData.site.siteName.trim()}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isCreating || !formData.site.siteName.trim()
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {isCreating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  "Create Site"
                )}
              </button>
            </div>
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-red-700 font-medium text-sm">
                  {apiError}
                </span>
                <button
                  onClick={() => setApiError(null)}
                  className="ml-2 text-red-600 hover:text-red-800 text-sm underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {showSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-green-700 font-medium">
                Site created successfully!
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Created Sites ({formData.site.createdSites.length})
          </h3>
          <button
            onClick={fetchAllSites}
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600">Loading sites...</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {formData.site.createdSites.length > 0 ? (
              formData.site.createdSites.map((site, index) => (
                <div className="">
                  <div
                    key={index}
                    className="flex  items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="font-medium text-gray-900">{site}</span>
                    <button
                      onClick={() => {
                        handleRemoveSite(site);
                      }}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No sites found. Create a new site to get started.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteTab;
