// import React, { useState } from "react";
// import ErrorMessage from "../../Helpers/ErrorMessage";

// const DellRouting = ({
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
//             <th className="py-2 px-4 border">Destination prefix</th>
//             <th className="py-2 px-4 border">Next HOP</th>
//             <th className="py-2 px-4 border">Source Protocol</th>
//           </tr>
//         </thead>
//         <tbody>
//           {limitedData.map((entry, index) => (
//             <tr key={index} className="text-center border-t">
//               <td className="py-2 px-4 border">{entry["_time"]}</td>
//               <td className="py-2 px-4 border">
//                 {entry["destination-prefix"]}
//               </td>
//               <td className="py-2 px-4 border">{entry["_value"]}</td>
//               <td className="py-2 px-4 border">{entry["source-protocol"]}</td>
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
//               <h2 className="text-xl font-bold">Dell Router Entries</h2>
//               <div
//                 style={{ display: "flex", alignItems: "center", gap: "10px" }}
//               >
//                 <select
//                   onChange={(e)=>setTimeRange(e.target.value)}
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
//                       <th className="py-2 px-4 border">Destination prefix</th>
//                       <th className="py-2 px-4 border">Next HOP</th>
//                       <th className="py-2 px-4 border">Source Protocol</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredData.length > 0 ? (
//                       filteredData.map((item, idx) => (
//                         <tr key={idx} className="text-center border-t">
//                           <td className="py-2 px-4 border">{item["_time"]}</td>
//                           <td className="py-2 px-4 border">
//                             {item["destination-prefix"]}
//                           </td>
//                           <td className="py-2 px-4 border">{item["_value"]}</td>
//                           <td className="py-2 px-4 border">
//                             {item["source-protocol"]}
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td
//                           colSpan="4"
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

// export default DellRouting;

import React, { useState } from "react";
import ErrorMessage from "../../Helpers/ErrorMessage";

const DellRouting = ({
  data,
  loading,
  showModal,
  closeModal,
  timeRange,
  setTimeRange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Show only first 10 records initially
  const limitedData = data.slice(0, 10);

  // Filter across all fields
  const filteredData = data.filter((item) =>
    Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleCloseModal = () => {
    closeModal();
    setSearchTerm("");
  };

  return (
    <div className="p-0">
      {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"> */}
      <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination prefix</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next HOP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source Protocol</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {limitedData.map((entry, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry["_time"]}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {entry["destination-prefix"]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry["_value"]}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry["source-protocol"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && <ErrorMessage />}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-6xl rounded-lg shadow-xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Dell Router Entries</h2>
              <div className="flex items-center space-x-3">
                <select
                  onChange={(e) => setTimeRange(e.target.value)}
                  value={timeRange}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="5m">Last 5 minutes</option>
                  <option value="10m">Last 10 minutes</option>
                  <option value="15m">Last 15 minutes</option>
                  <option value="30m">Last 30 minutes</option>
                  <option value="1h">Last 1 hour</option>
                </select>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b">
              <input
                type="text"
                placeholder="Search across all fields..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-gray-600">Loading data...</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination prefix</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next HOP</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source Protocol</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.length > 0 ? (
                        filteredData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item["_time"]}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item["destination-prefix"]}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item["_value"]}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item["source-protocol"]}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center">
                            <ErrorMessage />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DellRouting;