// import React, { useState } from "react";
// import ErrorMessage from '../../Helpers/ErrorMessage'

// const DellInterface = ({
//   data,
//   loading,
//   showModal,
//   closeModal,
//   timeRange,
//   setTimeRange,
// }) => {
//   const [searchTerm, setSearchTerm] = useState("");

//   // Show only first 10 records initially
//   const limitedData = data.slice(0, 10);

//   // Filter across all fields
//   const filteredData = data.filter((item) =>
//     Object.values(item)
//       .join(" ")
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase())
//   );

 
//   const handleCloseModal = () => {
//     closeModal();
//     setSearchTerm("");
//   };

//   return (
//     <div className="pl-4 mr-0">
//       <table className="min-w-full bg-white border border-gray-200">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="py-2 px-4 border">Time</th>
//             <th className="py-2 px-4 border">Interface Name</th>
//             <th className="py-2 px-4 border">Status</th>
//             <th className="py-2 px-4 border">Addr</th>
//           </tr>
//         </thead>
//         <tbody>
//           {limitedData.map((entry, index) => (
//             <tr key={index} className="text-center border-t">
//               <td className="py-2 px-4 border">{entry["_time"]}</td>
//               <td className="py-2 px-4 border">{entry["name"]}</td>
//               <td className="py-2 px-4 border">{entry["_field"]}</td>
//               <td className="py-2 px-4 border">{entry["_value"]}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//      {filteredData.length === 0 &&
//      <ErrorMessage/>
//      }

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white w-full max-w-4xl p-6 rounded-lg shadow-lg relative overflow-auto max-h-[90vh]">
//             <div
//               className="w-full mb-4"
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <h2 className="text-xl font-bold">Interface Entries</h2>
//               <div
//                 style={{ display: "flex", alignItems: "center", gap: "10px" }}
//               >
//                 <select
//                   onChange={(e)=> setTimeRange(e.target.value)}
//                   value={timeRange}
//                   className="border rounded px-2 py-1"
//                 >
//                   <option value="5m">Last 5 minutes</option>
//                   <option value="10m">Last 10 minutes</option>
//                   <option value="15m">Last 15 minutes</option>
//                   <option value="30m">Last 30 minutes</option>
//                   <option value="1h">Last 1 hour</option>
//                 </select>
//                 <button
//                   onClick={handleCloseModal}
//                   className="text-gray-500 hover:text-black text-lg font-bold"
//                 >
//                   ×
//                 </button>
//               </div>
//             </div>
//             <input
//               type="text"
//               placeholder="Search across all fields..."
//               className="w-full mb-4 px-3 py-2 border rounded"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />

//             {/* Filtered Data Table */}
//             <div className="overflow-y-auto max-h-[60vh] border border-gray-200 rounded">
//               {loading ? (
//                 <div style={{ textAlign: "center", padding: "1rem" }}>
//                   <div className="spinner" />
//                   <p>Loading data...</p>
//                 </div>
//               ) : (
//                 <table className="min-w-full bg-white border border-gray-200">
//                   <thead className="bg-gray-100">
//                     <tr>
//                       <th className="py-2 px-4 border">Interface Name</th>
//                       <th className="py-2 px-4 border">Status</th>
//                       <th className="py-2 px-4 border">Address</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredData.length > 0 ? (
//                       filteredData.map((item, idx) => (
//                         <tr key={idx} className="text-center border-t">
//                           <td className="py-2 px-4 border">{item["name"]}</td>
//                           <td className="py-2 px-4 border">{item["_field"]}</td>
//                           <td className="py-2 px-4 border">{item["_value"]}</td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td
//                           colSpan="4"
//                           className="py-4 text-center text-gray-500"
//                         >
//                           <ErrorMessage/>
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DellInterface;

import React, { useState, useMemo } from "react";

// Enhanced Status Badge Component
const StatusBadge = ({ status, type = "interface" }) => {
  const getStatusStyles = () => {
    const normalizedStatus = status?.toLowerCase();
    
    switch (normalizedStatus) {
      case "up":
        return "bg-green-100 text-green-800 border-green-200";
      case "down":
        return "bg-red-100 text-red-800 border-red-200";
      case "admin-status":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "testing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "unknown":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "dormant":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = () => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "up":
        return "🟢";
      case "down":
        return "🔴";
      case "testing":
        return "🟡";
      case "unknown":
        return "⚪";
      case "dormant":
        return "🟣";
      default:
        return "🔵";
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyles()}`}>
      <span className="mr-2">{getStatusIcon()}</span>
      {status?.toUpperCase() || "UNKNOWN"}
    </span>
  );
};

// Interface Type Badge
const InterfaceTypeBadge = ({ interfaceName }) => {
  const getInterfaceType = (name) => {
    if (!name) return { type: "Unknown", color: "gray" };
    
    const lowerName = name.toLowerCase();
    if (lowerName.includes("ethernet")) return { type: "Ethernet", color: "blue" };
    if (lowerName.includes("loopback")) return { type: "Loopback", color: "green" };
    if (lowerName.includes("vlan")) return { type: "VLAN", color: "purple" };
    if (lowerName.includes("tunnel")) return { type: "Tunnel", color: "orange" };
    if (lowerName.includes("port")) return { type: "Port", color: "indigo" };
    
    return { type: "Other", color: "gray" };
  };

  const { type, color } = getInterfaceType(interfaceName);

  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${colorClasses[color]}`}>
      {type}
    </span>
  );
};

// Enhanced Search and Filter Component
const SearchAndFilter = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, interfaceTypes }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Interfaces
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by interface name, status, or value..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">All Statuses</option>
            <option value="up">Up</option>
            <option value="down">Down</option>
            <option value="testing">Testing</option>
            <option value="unknown">Unknown</option>
            <option value="dormant">Dormant</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Stats Summary Component
const InterfaceStats = ({ data }) => {
  const stats = useMemo(() => {
    const statusCounts = data.reduce((acc, item) => {
      const status = item._value?.toLowerCase() || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const total = data.length;
    const upCount = statusCounts.up || 0;
    const downCount = statusCounts.down || 0;
    const healthPercentage = total > 0 ? Math.round((upCount / total) * 100) : 0;

    return {
      total,
      up: upCount,
      down: downCount,
      testing: statusCounts.testing || 0,
      unknown: statusCounts.unknown || 0,
      dormant: statusCounts.dormant || 0,
      healthPercentage
    };
  }, [data]);

  const getHealthColor = (percentage) => {
    if (percentage >= 90) return "text-green-600 bg-green-100";
    if (percentage >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        <div className="text-sm text-gray-600">Total</div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <div className="text-2xl font-bold text-green-600">{stats.up}</div>
        <div className="text-sm text-gray-600">Up</div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <div className="text-2xl font-bold text-red-600">{stats.down}</div>
        <div className="text-sm text-gray-600">Down</div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <div className="text-2xl font-bold text-yellow-600">{stats.testing}</div>
        <div className="text-sm text-gray-600">Testing</div>
      </div>
      <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
        <div className="text-2xl font-bold text-gray-600">{stats.unknown}</div>
        <div className="text-sm text-gray-600">Unknown</div>
      </div>
      <div className={`p-4 rounded-lg border border-gray-200 text-center ${getHealthColor(stats.healthPercentage)}`}>
        <div className="text-2xl font-bold">{stats.healthPercentage}%</div>
        <div className="text-sm">Health</div>
      </div>
    </div>
  );
};

const DellInterface = ({
  data,
  loading,
  showModal,
  closeModal,
  timeRange,
  setTimeRange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("_time");
  const [sortOrder, setSortOrder] = useState("desc");

  // Show only first 8 records initially (better for UI)
  const limitedData = data.slice(0, 8);

  // Enhanced filtering and sorting
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        Object.values(item)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((item) =>
        item._value?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Sort data
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === "_time") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [data, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleCloseModal = () => {
    closeModal();
    setSearchTerm("");
    setStatusFilter("");
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) {
      return <span className="text-gray-400 opacity-0 group-hover:opacity-100 ml-1">↕</span>;
    }
    return (
      <span className="ml-1 text-blue-600">
        {sortOrder === "asc" ? "↑" : "↓"}
      </span>
    );
  };



  return (
    <div className="w-full">
      {/* Enhanced main table container */}
      <div className="bg-white shadow-lg border border-gray-200 overflow-hidden">
        {/* Table Header Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Network Interfaces</h3>
              <p className="text-sm text-gray-600">Real-time interface status monitoring</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {limitedData.length} of {data.length} shown
              </span>
              {limitedData.length < data.length && (
                <button
                  onClick={() => {/* This would typically open the modal */}}
                  className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  View All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced table */}
        <div 
        //className="overflow-x-auto"
        className="overflow-y-auto scrollbar-hide rounded-lg border border-gray-200 shadow-sm"
        >
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => handleSort("_time")}
                >
                  Timestamp <SortIcon column="_time" />
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                  onClick={() => handleSort("name")}
                >
                  Interface <SortIcon column="name" />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Field
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {limitedData.length > 0 ? (
                limitedData.map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(entry["_time"]).toLocaleString("en-US", {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {entry["name"] || "Unknown Interface"}
                        </span>
                        <span className="text-xs text-gray-500">
                          ID: {entry["name"]?.split('/').pop() || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <InterfaceTypeBadge interfaceName={entry["name"]} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={entry["_value"]} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <code className="w-48 px-2 py-1 bg-gray-100 rounded text-xs" style={{width:"250px"}}>
                        {entry["_field"]}
                      </code>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="text-gray-400 text-4xl mb-2">🔌</div>
                      <p className="text-gray-500 font-medium">No interface data found</p>
                      <p className="text-gray-400 text-sm">Check your network configuration</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-7xl rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
            {/* Enhanced Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Network Interface Management</h2>
                  <p className="text-blue-100">Complete interface status overview</p>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    onChange={(e) => setTimeRange(e.target.value)}
                    value={timeRange}
                    className="bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="5m">Last 5 minutes</option>
                    <option value="10m">Last 10 minutes</option>
                    <option value="15m">Last 15 minutes</option>
                    <option value="30m">Last 30 minutes</option>
                    <option value="1h">Last 1 hour</option>
                  </select>
                  <button
                    onClick={handleCloseModal}
                    className="text-white hover:text-red-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            {/* Statistics Dashboard */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <InterfaceStats data={processedData} />
            </div>

            {/* Search and Filter Controls */}
            <div className="p-6 border-b border-gray-200">
              <SearchAndFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />
            </div>

            {/* Enhanced Modal Table */}
            <div className="flex-1 overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  <p className="text-gray-600">Loading interface data...</p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group"
                        onClick={() => handleSort("_time")}
                      >
                        Timestamp <SortIcon column="_time" />
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors group"
                        onClick={() => handleSort("name")}
                      >
                        Interface Details <SortIcon column="name" />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Type & Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Field Info
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processedData.length > 0 ? (
                      processedData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {new Date(item["_time"]).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(item["_time"]).toLocaleTimeString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-900">
                                {item["name"] || "Unknown Interface"}
                              </span>
                              <span className="text-xs text-gray-500">
                                Port: {item["name"]?.split('/').pop() || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <InterfaceTypeBadge interfaceName={item["name"]} />
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={item["_value"]} />
                          </td>
                          <td className="px-6 py-4">
                            <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-700">
                              {item["_field"]}
                            </code>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="text-gray-400 text-5xl mb-4">🔍</div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No interfaces found</h3>
                            <p className="text-gray-500 text-center max-w-md">
                              No interfaces match your current search and filter criteria. Try adjusting your filters or search terms.
                            </p>
                            <button
                              onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("");
                              }}
                              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Clear Filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer with Summary */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>
                  Showing {processedData.length} of {data.length} interfaces
                </span>
                <span>
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DellInterface;