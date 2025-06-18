import React, { useState } from "react";
import ErrorMessage from "../../Helpers/ErrorMessage";

const DellMac = ({
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
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border">Vlan</th>
            <th className="py-2 px-4 border">MAC Address</th>
            <th className="py-2 px-4 border">Type</th>
            <th className="py-2 px-4 border">Interface</th>
          </tr>
        </thead>
        <tbody>
          {limitedData.map((entry, index) => (
            <tr key={index} className="text-center border-t">
              <td className="py-2 px-4 border">{entry["vlan"]}</td>
              <td className="py-2 px-4 border">{entry["mac-addr"]}</td>
              <td className="py-2 px-4 border">{entry["entry-type"]}</td>
              <td className="py-2 px-4 border">{entry["if-name"]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredData.length === 0 && <ErrorMessage />}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-4xl p-6 rounded-lg shadow-lg relative overflow-auto max-h-[90vh]">
            <div
              className="w-full mb-4"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2 className="text-xl font-bold">Mac Entries</h2>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <select
                  onChange={(e)=>setTimeRange(e.target.value)}
                  value={timeRange}
                  className="border rounded px-2 py-1"
                >
                  <option value="5m">Last 5 minutes</option>
                  <option value="10m">Last 10 minutes</option>
                  <option value="15m">Last 15 minutes</option>
                  <option value="30m">Last 30 minutes</option>
                  <option value="1h">Last 1 hour</option>
                </select>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-black text-lg font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <input
              type="text"
              placeholder="Search across all fields..."
              className="w-full mb-4 px-3 py-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Scrollable Table with Sticky Header */}
            <div className="overflow-y-auto max-h-[60vh] border border-gray-200 rounded">
              {loading ? (
                <div style={{ textAlign: "center", padding: "1rem" }}>
                  <div className="spinner" />
                  <p>Loading data...</p>
                </div>
              ) : (
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="py-2 px-4 border">Vlan</th>
                      <th className="py-2 px-4 border">MAC Address</th>
                      <th className="py-2 px-4 border">Type</th>
                      <th className="py-2 px-4 border">Interface</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((item, idx) => (
                        <tr key={idx} className="text-center border-t">
                          <td className="py-2 px-4 border">{item["vlan"]}</td>
                          <td className="py-2 px-4 border">
                            {item["mac-addr"]}
                          </td>
                          <td className="py-2 px-4 border">
                            {item["entry-type"]}
                          </td>
                          <td className="py-2 px-4 border">
                            {item["if-name"]}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-4 text-center text-gray-500"
                        >
                          <ErrorMessage />
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

export default DellMac;