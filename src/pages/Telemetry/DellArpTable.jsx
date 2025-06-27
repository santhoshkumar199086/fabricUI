import React, { useMemo, useState } from "react";
import ErrorMessage from "../../Helpers/ErrorMessage";

// const DellArpTable = ({
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
//     <div className="pl-4">
//       <table className="min-w-full bg-white border border-gray-200">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="py-2 px-4 border">Time</th>
//             <th className="py-2 px-4 border">IP Address</th>
//             <th className="py-2 px-4 border">Interface</th>
//             <th className="py-2 px-4 border">MAC Address</th>
//             <th className="py-2 px-4 border">State</th>
//           </tr>
//         </thead>
//         <tbody>
//           {limitedData.map((entry, index) => (
//             <tr key={index} className="text-center border-t">
//               <td className="py-2 px-4 border">{entry["_time"]}</td>
//               <td className="py-2 px-4 border">{entry["addr"]}</td>
//               <td className="py-2 px-4 border">{entry["intf-name"]}</td>
//               <td className="py-2 px-4 border">
//                 {entry["link-layer-address"]}
//               </td>
//               <td className="py-2 px-4 border">{entry["state"]}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {filteredData.length === 0 && <ErrorMessage />}

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
//               <h2 className="text-xl font-bold">ARP Entries</h2>
//               <div
//                 style={{ display: "flex", alignItems: "center", gap: "10px" }}
//               >
//                 <select
//                   onChange={(e) => setTimeRange(e.target.value)}
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

//             {/* Scrollable Table with Sticky Header */}
//             <div className="overflow-y-auto max-h-[60vh] border border-gray-200 rounded">
//               {loading ? (
//                 <div style={{ textAlign: "center", padding: "1rem" }}>
//                   <div className="spinner" />
//                   <p>Loading data...</p>
//                 </div>
//               ) : (
//                 <table className="min-w-full bg-white">
//                   <thead className="bg-gray-100 sticky top-0 z-10">
//                     <tr>
//                       <th className="py-2 px-4 border">Time</th>
//                       <th className="py-2 px-4 border">IP Address</th>
//                       <th className="py-2 px-4 border">Interface</th>
//                       <th className="py-2 px-4 border">MAC Address</th>
//                       <th className="py-2 px-4 border">State</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredData.length > 0 ? (
//                       filteredData.map((item, idx) => (
//                         <tr key={idx} className="text-center border-t">
//                           <td className="py-2 px-4 border">{item["_time"]}</td>
//                           <td className="py-2 px-4 border">{item["addr"]}</td>
//                           <td className="py-2 px-4 border">
//                             {item["intf-name"]}
//                           </td>
//                           <td className="py-2 px-4 border">
//                             {item["link-layer-address"]}
//                           </td>
//                           <td className="py-2 px-4 border">{item["state"]}</td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td
//                           colSpan="5"
//                           className="py-4 text-center text-gray-500"
//                         >
//                           <ErrorMessage />
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

// export default DellArpTable;

// Enhanced Status Badge Component
const StatusBadge = ({ status, type = "default" }) => {
  const getStatusColor = () => {
    if (type === "interface") {
      return status === "up" 
        ? "bg-green-100 text-green-800 border-green-200" 
        : "bg-red-100 text-red-800 border-red-200";
    }
    return status === "dynamic" 
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
      <div className={`w-2 h-2 rounded-full mr-2 ${
        status === "up" || status === "dynamic" ? "bg-current" : "bg-current opacity-60"
      }`}></div>
      {/* {status.toUpperCase()} */}
    </span>
  );
};

// Enhanced MAC Address Display
const MacAddress = ({ mac }) => (
  <code className="px-2 py-1 bg-gray-100 rounded-md text-xs font-mono text-gray-800">
    {mac}
  </code>
);

// Enhanced IP Address Display
const IpAddress = ({ ip }) => (
  <span className="px-2 py-1 bg-blue-50 text-sm font-mono text-blue-800">
    {ip}
  </span>
);

const DellArpTable = ({
  data,
  loading,
  showModal,
  closeModal,
  timeRange,
  setTimeRange,
}) => {
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("_time");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Show only first 10 records initially
  const limitedData = data.slice(0, 10);

  // Enhanced filtering and sorting
  const processedData = useMemo(() => {
    let filtered = data;
    
    if (searchTerm) {
      filtered = data.filter((item) =>
        Object.values(item)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
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
  }, [data, searchTerm, sortBy, sortOrder]);

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
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return null;
    return (
      <span className="ml-1">
        {sortOrder === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div className="w-full">
      {/* Enhanced table for limited view */}
      <div 
      //className="overflow-hidden rounded-lg border border-gray-200 shadow-sm" style={{border:"1px solid green"}}
      className="overflow-y-auto scrollbar-hide rounded-lg border border-gray-200 shadow-sm"
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort("_time")}
              >
                Time Stamp<SortIcon column="_time" />
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort("addr")}
              >
                IP Address <SortIcon column="addr" />
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => handleSort("intf-name")}
              >
                Interface <SortIcon column="intf-name" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                MAC Address
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                State
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {limitedData.map((entry, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(entry["_time"]).toLocaleString("en-US", {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="px-4 py-3 text-sm">
                  <IpAddress ip={entry["host_ip"]} />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {entry["intf-name"]}
                </td>
                <td className="px-4 py-3 text-sm">
                  <MacAddress mac={entry["host"]} />
                </td>
                <td className="px-4 py-3 text-sm">
                  <StatusBadge status={entry["_value"]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {limitedData.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📭</div>
            <p className="text-gray-500 font-medium">No ARP entries found</p>
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">ARP Entries</h2>
                  <p className="text-blue-100">Address Resolution Protocol Table</p>
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

            {/* Search and Stats */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    {processedData.length} total entries
                  </span>
                  <span className="text-sm text-gray-600">
                    Showing all ARP table entries
                  </span>
                </div>
              </div>
              
              <input
                type="text"
                placeholder="Search across all fields (IP, MAC, interface, state)..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Enhanced Table */}
            <div className="flex-1 overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  <p className="text-gray-600">Loading data...</p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleSort("_time")}
                      >
                        Timestamp <SortIcon column="_time" />
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleSort("addr")}
                      >
                        IP Address <SortIcon column="addr" />
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleSort("intf-name")}
                      >
                        Interface <SortIcon column="intf-name" />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        MAC Address
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        State
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processedData.length > 0 ? (
                      processedData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(item["_time"]).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <IpAddress ip={item["addr"]} />
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {item["intf-name"]}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <MacAddress mac={item["link-layer-address"]} />
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <StatusBadge status={item["state"]} />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="text-gray-400 text-4xl mb-2">🔍</div>
                          <p className="text-gray-500 font-medium">No entries match your search</p>
                          <p className="text-gray-400 text-sm">Try adjusting your search terms</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DellArpTable;