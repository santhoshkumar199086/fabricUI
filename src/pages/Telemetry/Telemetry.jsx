import React, { useState, useEffect } from "react";
import { useInfluxData } from "../../Hooks/useInfluxData";
import DellArpTable from "../Telemetry/DellArpTable";
import DellInterface from "../Telemetry/DellInterface";
import DellMemory from "../Telemetry/DellMemory";
import DellCpuBar from "../../pages/Telemetry/DellCpuBar";
import DellCpuWaveChart from "../../pages/Telemetry/DellCpuWaveChart";
import DellMac from "../../pages/Telemetry/DellMac";
import DellRouting from "../../pages/Telemetry/DellRouting";
import filterImg from "../../assets/icons/filter.svg";
import refreshBtn from "../../assets/icons/refresh_btn.svg";

const TelemetryChart = () => {
  const [timeRange, setTimeRange] = useState("1h");
  const [activeFilter, setActiveFilter] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [shouldFetchData, setShouldFetchData] = useState(false);
  const measurementTypes = activeFilter ? [activeFilter] : [];

  const { data: influxData, isLoading } = useInfluxData(
    timeRange,
    measurementTypes
  );

  const uniqueHostnames = [
    ...new Set(
      influxData
        .filter((item) => item._measurement === "dell_hostname")
        .map((item) => item._value)
    ),
  ];

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);

    const filterMap = {
      arp: "dell_arp_entry",
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

  const handleFilterClick = (type) => {
    setModalType(type);
    setShowModal(true);
    setShouldFetchData(false);
  };

  // Handle time range change from child components
  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
    setShouldFetchData(true);
  };

  const handleRefresh = () => {
    console.log("Refresh is clicked");
  };

  const dellRouting = influxData
    .filter((item) => item._measurement === "dell_routing_table")
    .map((item) => {
      const updatedItem = { ...item };

      // Convert _value if field is 'last-updated'
      if (item._field === "last-updated") {
        const microseconds = item._value;
        const seconds = microseconds / 1_000_000;

        if (seconds < 60) {
          updatedItem._value = `${seconds.toFixed(2)} seconds`;
        } else if (seconds < 3600) {
          updatedItem._value = `${(seconds / 60).toFixed(2)} minutes`;
        } else {
          updatedItem._value = `${(seconds / 3600).toFixed(2)} hours`;
        }
      }

      // Format _time to "YYYY-MM-DD hh:mm:ss AM/PM"
      if (item._time) {
        const date = new Date(item._time);
        const options = {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: "UTC",
        };

        const formattedTime = new Intl.DateTimeFormat("en-US", options).format(
          date
        );
        // Convert MM/DD/YYYY, hh:mm:ss AM/PM to YYYY-MM-DD hh:mm:ss AM/PM
        const [mm, dd, yyyy] = formattedTime.split(",")[0].split("/");
        const timePart = formattedTime.split(",")[1].trim();
        updatedItem._time = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(
          2,
          "0"
        )} ${timePart}`;
      }

      return updatedItem;
    });

  const dellCpuData = influxData.filter(
    (item) => item._measurement === "dell_cpu"
  );

  const dellArpData = influxData
    .filter((item) => item._measurement === "dell_arp_entry")
    .map((item) => {
      const updatedItem = { ...item };

      // Convert _value if field is 'age-time'
      if (item._field === "age-time") {
        const microseconds = item._value;
        const seconds = microseconds / 1_000_000;

        if (seconds < 60) {
          updatedItem._value = `${seconds.toFixed(2)} seconds`;
        } else if (seconds < 3600) {
          updatedItem._value = `${(seconds / 60).toFixed(2)} minutes`;
        } else {
          updatedItem._value = `${(seconds / 3600).toFixed(2)} hours`;
        }
      }

      // Format _time to "YYYY-MM-DD hh:mm:ss AM/PM"
      if (item._time) {
        const date = new Date(item._time);
        const options = {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: "UTC",
        };

        const formattedTime = new Intl.DateTimeFormat("en-US", options).format(
          date
        );
        // Convert MM/DD/YYYY, hh:mm:ss AM/PM to YYYY-MM-DD hh:mm:ss AM/PM
        const [mm, dd, yyyy] = formattedTime.split(",")[0].split("/");
        const timePart = formattedTime.split(",")[1].trim();
        updatedItem._time = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(
          2,
          "0"
        )} ${timePart}`;
      }

      return updatedItem;
    });

  const dellMemData = influxData.filter(
    (item) => item._measurement === "dell_mem"
  );

  const dellMacData = influxData.filter(
    (item) => item._measurement === "dell_mac_table"
  );

  const dellInterface = influxData
    .filter((item) => item._measurement === "dell_interface_status")
    .map((item) => {
      const updatedItem = { ...item };

      if (item._field === "_time") {
        const microseconds = item._value;
        const seconds = microseconds / 1_000_000;

        if (seconds < 60) {
          updatedItem._value = `${seconds.toFixed(2)} seconds`;
        } else if (seconds < 3600) {
          updatedItem._value = `${(seconds / 60).toFixed(2)} minutes`;
        } else {
          updatedItem._value = `${(seconds / 3600).toFixed(2)} hours`;
        }
      }

      if (item._time) {
        const date = new Date(item._time);
        const options = {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: "UTC",
        };

        const formattedTime = new Intl.DateTimeFormat("en-US", options).format(
          date
        );
        const [mm, dd, yyyy] = formattedTime.split(",")[0].split("/");
        const timePart = formattedTime.split(",")[1].trim();
        updatedItem._time = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(
          2,
          "0"
        )} ${timePart}`;
      }

      return updatedItem;
    });


  useEffect(() => {
    if (shouldFetchData) {
      setShouldFetchData(false);
    }
  }, [shouldFetchData, timeRange]);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 p-4 overflow-auto">
        <div style={{display:"flex", justifyContent:"space-between"}}>
        <h1 className="text-2xl font-semibold mb-4 text-blue-600">
          Device: {uniqueHostnames[0] ?? ""}
        </h1>

        <button onClick={() => handleRefresh()}>
          <img src={refreshBtn} alt="refresh" className="w-4 h-4" />
        </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b-0">{/* Header content if any */}</div>
          <div className="flex flex-col md:flex-row">
            {" "}
            {/* Changed to row on medium screens and up */}
            <div className="w-full md:w-full p-0 mt-5">
              {" "}
              {/* 50% width on medium screens */}
              <div className="pl-6">
                <DellCpuWaveChart data={dellCpuData} />
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 p-0 mt-5">
              <div className="p-6">
                <DellCpuBar data={dellCpuData} />
              </div>
            </div>

            <div className="w-full md:w-1/2 p-0 mt-5">
              <div className="p-6">
                <DellMemory data={dellMemData} />
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 p-0 ml-5">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div className="text-[14px] font-extrabold opacity-100 m-[15px] font-['Helvetica','Arial','sans-serif'] apexcharts-title-text">
                  Arp
                </div>
                <button onClick={() => handleFilterClick("arp")}>
                  <img src={filterImg} alt="Filter" className="w-4 h-4" />
                </button>
              </div>

              <DellArpTable
                data={dellArpData}
                loading={isLoading}
                showModal={showModal && modalType === "arp"}
                closeModal={closeModal}
                timeRange={timeRange}
                setTimeRange={handleTimeRangeChange}
              />
            </div>

            <div className="w-full md:w-1/2 p-0 ml-5 mr-10">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div className="text-[14px] font-extrabold opacity-100 m-[15px] font-['Helvetica','Arial','sans-serif'] apexcharts-title-text">
                  Interface
                </div>
                <button onClick={() => handleFilterClick("interface")}>
                  <img src={filterImg} alt="Filter" className="w-4 h-4" />
                </button>
              </div>

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

          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 p-0 ml-3">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div className="text-[14px] font-extrabold opacity-100 m-[15px] font-['Helvetica','Arial','sans-serif'] apexcharts-title-text">
                  Mac
                </div>
                <button onClick={() => handleFilterClick("dellMac")}>
                  <img src={filterImg} alt="Filter" className="w-4 h-4" />
                </button>
              </div>

              <DellMac
                data={dellMacData}
                loading={isLoading}
                showModal={showModal && modalType === "dellMac"}
                closeModal={closeModal}
                timeRange={timeRange}
                setTimeRange={handleTimeRangeChange}
              />
            </div>

            <div className="w-full md:w-1/2 p-0 ml-3 mr-10">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div className="text-[14px] font-extrabold opacity-100 m-[15px] font-['Helvetica','Arial','sans-serif'] apexcharts-title-text">
                  Routing
                </div>
                <button onClick={() => handleFilterClick("dellRouting")}>
                  <img src={filterImg} alt="Filter" className="w-4 h-4" />
                </button>
              </div>

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
    </div>
  );
};

export default TelemetryChart;
