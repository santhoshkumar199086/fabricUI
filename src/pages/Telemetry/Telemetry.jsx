import React, { useState, useEffect, useMemo } from "react";
import { useInfluxData } from "../../Hooks/useInfluxData";
import DellArpTable from "../Telemetry/DellArpTable";
import DellInterface from "../Telemetry/DellInterface";
import DellMemory from "../Telemetry/DellMemory";
import DellCpuBar from "../../pages/Telemetry/DellCpuBar";
import DellCpuWaveChart from "../../pages/Telemetry/DellCpuWaveChart";
import DellMac from "../../pages/Telemetry/DellMac";
import DellRouting from "../../pages/Telemetry/DellRouting";
import { useLocation } from "react-router-dom";

// Enhanced Icons (you can replace with your actual icons)
const FilterIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
    />
  </svg>
);

const RefreshIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

// Enhanced Status Badge Component
const StatusBadge = ({ status, online = true }) => (
  <div className="flex items-center space-x-2">
    <div
      className={`w-3 h-3 rounded-full ${
        online ? "bg-green-400 animate-pulse" : "bg-red-400"
      }`}
    ></div>
    <span
      className={`text-sm font-medium ${
        online ? "text-green-700" : "text-red-700"
      }`}
    >
      {status}
    </span>
  </div>
);

// Enhanced Metric Card Component
const MetricCard = ({
  title,
  value,
  unit,
  icon,
  color = "blue",
  subtitle,
  trend,
}) => {
  const colorMap = {
    blue: {
      bg: "from-blue-50 to-blue-100",
      border: "border-blue-200",
      text: "text-blue-600",
      accent: "bg-blue-500",
    },
    green: {
      bg: "from-green-50 to-green-100",
      border: "border-green-200",
      text: "text-green-600",
      accent: "bg-green-500",
    },
    orange: {
      bg: "from-orange-50 to-orange-100",
      border: "border-orange-200",
      text: "text-orange-600",
      accent: "bg-orange-500",
    },
    purple: {
      bg: "from-purple-50 to-purple-100",
      border: "border-purple-200",
      text: "text-purple-600",
      accent: "bg-purple-500",
    },
    red: {
      bg: "from-red-50 to-red-100",
      border: "border-red-200",
      text: "text-red-600",
      accent: "bg-red-500",
    },
  };

  const colors = colorMap[color];

  return (
    <div
      className={`bg-gradient-to-br ${colors.bg} ${colors.border} border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 transform`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div
              className={`${colors.accent} p-2 rounded-lg text-white text-lg`}
            >
              {icon}
            </div>
            <div>
              <p
                className={`text-sm font-bold ${colors.text} uppercase tracking-wide`}
              >
                {title}
              </p>
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {unit && (
              <span className="text-lg text-gray-600 font-medium">{unit}</span>
            )}
          </div>
          {trend !== undefined && (
            <div
              className={`text-sm mt-2 flex items-center ${
                trend >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              <span className="mr-1">{trend >= 0 ? "↗️" : "↘️"}</span>
              {Math.abs(trend)}% from last update
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Section Header Component
const SectionHeader = ({ title, onFilter, onRefresh, subtitle, count }) => (
  <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="flex items-center space-x-3">
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      {count !== undefined && (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold w-32 text-center">
          {count} entries
        </span>
      )}
      {subtitle && <span className="text-sm text-gray-500">({subtitle})</span>}
    </div>
    <div className="flex items-center space-x-2">
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          title="Refresh data"
        >
          <RefreshIcon />
        </button>
      )}
      {onFilter && (
        <button
          onClick={onFilter}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          title="Filter data"
        >
          <FilterIcon />
        </button>
      )}
    </div>
  </div>
);

// Main Enhanced Telemetry Dashboard
const EnhancedTelemetryDashboard = () => {
  const location = useLocation();
  const telemetryData = location.state;
  console.log("Telemetry Data:", telemetryData);

  const hostName = telemetryData?.data.filter(
    (item) => item._measurement === "dell_hostname"
  );

  

  const [timeRange, setTimeRange] = useState("1h");
  const [activeFilter, setActiveFilter] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [shouldFetchData, setShouldFetchData] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const measurementTypes = activeFilter ? [activeFilter] : [];

  const { data: influxData, isLoading } = useInfluxData(
    timeRange,
    measurementTypes
  );

  // console.log("Fetched InfluxDB data:", influxData);

  //    const cpuData = telemetryData.data.filter(item =>
  //     item.tags._measurement === "dell_arp" ||
  //     item.measurement === "dell_arp"
  // );
  //   console.log("cpuData", cpuData);

  // Calculate enhanced statistics
  const stats = useMemo(() => {
    const cpuData = telemetryData?.data.filter(
      (item) => item._measurement === "dell_cpu"
    );
    const memData = telemetryData?.data.filter(
      (item) => item._measurement === "dell_mem"
    );
    const arpData = telemetryData?.data.filter(
      (item) => item._measurement === "dell_arp"
    );
    const interfaceData = telemetryData?.data.filter(
      (item) => item._measurement === "dell_interface"
    );

    const latestCpu =
      cpuData?.length > 0
        ? (cpuData[cpuData.length - 1]._value / 100).toFixed(1)
        : 0;
    const latestMem =
      memData?.length > 0
        ? (memData[memData.length - 1]._value / 1024).toFixed(1)
        : 0;
    const activeInterfaces = interfaceData.filter(
      (item) => item._value === "up"
    ).length;
    const totalInterfaces = interfaceData.length;

    return {
      cpu: latestCpu,
      memory: latestMem,
      arpEntries: arpData.length,
      activeInterfaces,
      totalInterfaces,
      interfaceHealth:
        totalInterfaces > 0
          ? ((activeInterfaces / totalInterfaces) * 100).toFixed(0)
          : 0,
    };
  }, [telemetryData?.data]);

  const uniqueHostnames = useMemo(
    () => [
      ...new Set(
        telemetryData.data
          .filter((item) => item._measurement === "dell_hostname")
          .map((item) => item.hostname)
      ),
    ],
    [telemetryData.data]
  );


  const handleFilterClick = (type) => {
    setModalType(type);
    setShowModal(true);
    setShouldFetchData(false);

    const filterMap = {
      arp: "dell_arp",
      interface: "dell_interface_status",
      dellMac: "dell_mac_table",
      dellRouting: "dell_routing_table",
    };
    setActiveFilter(filterMap[type] || null);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setActiveFilter(null);
  };

  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
    setShouldFetchData(true);
  };

  const handleRefresh = () => {
    setShouldFetchData(true);
    console.log("Refreshing data...");
  };

  // Data processing functions (keeping your existing logic)
  const formatTime = (timeStr) => {
    const date = new Date(timeStr);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  };

  const formatMicroseconds = (microseconds) => {
    const seconds = microseconds / 1_000_000;
    if (seconds < 60) return `${seconds.toFixed(2)} seconds`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(2)} minutes`;
    return `${(seconds / 3600).toFixed(2)} hours`;
  };

  // Process data with your existing logic
  const dellCpuData = telemetryData.data.filter(
    (item) => item._measurement === "dell_cpu"
  );



  const dellMemData = telemetryData.data.filter(
    (item) => item._measurement === "dell_mem"
  );

  const dellArpData = telemetryData.data
    .filter((item) => item._measurement === "dell_arp")
    .map((item) => ({
      ...item,
      _time: formatTime(item._time),
      _value:
        item._field === "age-time"
          ? formatMicroseconds(item._value)
          : item._value,
    }));

  


  const dellInterface = telemetryData.data
    .filter((item) => item._measurement === "dell_interface")
    .map((item) => ({
      ...item,
      _time: formatTime(item._time),
      _value:
        item._field === "_time" ? formatMicroseconds(item._value) : item._value,
    }));

  const dellMacData = telemetryData.data.filter(
    (item) => item._measurement === "dell_mac_table"
  );

  const dellRouting = telemetryData.data
    .filter((item) => item._measurement === "routing_table")
    .map((item) => ({
      ...item,
      _time: formatTime(item._time),
      _value:
        item._field === "last-updated"
          ? formatMicroseconds(item._value)
          : item._value,
    }));

  useEffect(() => {
    if (shouldFetchData) {
      setShouldFetchData(false);
    }
  }, [shouldFetchData, timeRange]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-xl shadow-lg">
                <span className="text-white text-3xl">🖥️</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Dell Network Monitor
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-blue-600 font-bold">
                    Device: {uniqueHostnames[0] || "Unknown Device"}
                    {/* Device: {hostName[0]?._value || "Unknown Device"} */}
                  </p>
                  <StatusBadge status="Online" online={isOnline} />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              >
                {/* <option value="15m">Last 15 minutes</option>
                <option value="30m">Last 30 minutes</option>
                <option value="1h">Last 1 hour</option>
                <option value="6h">Last 6 hours</option>
                <option value="1d">Last 24 hours</option> */}

                <option value="superspine">Super Spine</option>
                <option value="spine">Spine</option>
                <option value="leaf">Leaf</option>
              </select>

              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm"
              >
                <RefreshIcon />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="CPU Usage"
            value={stats.cpu}
            unit="%"
            icon="🖥️"
            color="blue"
            subtitle="System processor load"
          />
          <MetricCard
            title="Memory"
            value={stats.memory}
            unit="GB"
            icon="💾"
            color="green"
            subtitle="RAM consumption"
          />
          {/* <MetricCard
            title="Interfaces"
            value={`${stats.activeInterfaces}/${stats.totalInterfaces}`}
            icon="🔗"
            color="purple"
            subtitle={`${stats.interfaceHealth}% healthy`}
          /> */}
          {/* <MetricCard
            title="ARP Entries"
            value={stats.arpEntries}
            icon="📡"
            color="orange"
            subtitle="Network mappings"
          /> */}
        </div>

        {/* Performance Charts Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">
              Performance Metrics
            </h2>
            <p className="text-gray-600">
              Real-time system performance monitoring
            </p>
          </div>

          <div className="p-6">
            {/* CPU Wave Chart - Full Width */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                CPU Utilization Trends
              </h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <DellCpuWaveChart data={dellCpuData} />
              </div>
            </div>

            {/* CPU Bar & Memory Charts - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  CPU Metrics
                </h3>
                <div className="bg-gray-50 rounded-xl p-0">
                  <DellCpuBar data={dellCpuData} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Memory Usage
                </h3>
                <div className="bg-gray-50 rounded-xl p-0">
                  <DellMemory data={dellMemData} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Network Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* ARP Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <SectionHeader
              title="ARP Table"
              subtitle="Address Resolution Protocol"
              count={dellArpData.length}
              onFilter={() => handleFilterClick("arp")}
              onRefresh={handleRefresh}
            />
            <div className="px-0 pb-0">
              <DellArpTable
                data={dellArpData}
                loading={isLoading}
                showModal={showModal && modalType === "arp"}
                closeModal={closeModal}
                timeRange={timeRange}
                setTimeRange={handleTimeRangeChange}
              />
            </div>
          </div>

          {/* Interface Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <SectionHeader
              title="Interface Status"
              subtitle="Network interface monitoring"
              count={dellInterface.length}
              onFilter={() => handleFilterClick("interface")}
              onRefresh={handleRefresh}
            />
            <div className="px-0 pb-0">
              <DellInterface
                data={dellInterface}
                loading={isLoading}
                showModal={showModal && modalType === "interface"}
                closeModal={closeModal}
                timeRange={timeRange}
                setTimeRange={handleTimeRangeChange}
              />
            </div>
          </div>
        </div>

        {/* Additional Network Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* MAC Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <SectionHeader
              title="MAC Address Table"
              subtitle="Layer 2 forwarding database"
              count={dellMacData.length}
              onFilter={() => handleFilterClick("dellMac")}
              onRefresh={handleRefresh}
            />
            <div className="px-0 pb-0">
              <DellMac
                data={dellMacData}
                loading={isLoading}
                showModal={showModal && modalType === "dellMac"}
                closeModal={closeModal}
                timeRange={timeRange}
                setTimeRange={handleTimeRangeChange}
              />
            </div>
          </div>

          {/* Routing Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <SectionHeader
              title="Routing Table"
              subtitle="Layer 3 routing information"
              count={dellRouting.length}
              onFilter={() => handleFilterClick("dellRouting")}
              onRefresh={handleRefresh}
            />
            <div className="px-0 pb-0">
              <DellRouting
                data={dellRouting}
                loading={isLoading}
                showModal={showModal && modalType === "dellRouting"}
                closeModal={closeModal}
                timeRange={timeRange}
                setTimeRange={handleTimeRangeChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-lg font-semibold text-gray-700">
                Loading telemetry data...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTelemetryDashboard;