// import React, { useState, useEffect } from "react";
// import Chart from "react-apexcharts";
// import { useInfluxData } from "../../Hooks/useInfluxData";

// const DellCpuBar = ({data}) => {
//   const dellCpu = data.filter((item) => item._measurement === "dell_cpu");
//   const groupByField = dellCpu.reduce((acc, point) => {
//     if (!acc[point._field]) {
//       acc[point._field] = [];
//     }
//     acc[point._field].push(point);
//     return acc;
//   }, {});

//   const allowedFields = ["mem-threshold-hi", "mem-threshold-lo"];

//   const barSeries = Object.keys(groupByField)
//    .filter((field) => allowedFields.includes(field))
//    .map((field) => ({
//     name: field,
//     data: groupByField[field].map((point) => ({
//       x: new Date(point._time),
//       y: point._value,
//     })),
//   }));

//   const barOptions = {
//     chart: {
//       type: "bar",
//       zoom: { enabled: false },
//     },
//     xaxis: {
//       type: "datetime",
//     },
//     yaxis: {
//       title: { text: "Usage (%)" },
//     },
//     title: {
//       text: "CPU Metrics Over Time",
//       align: "left",
//     },
//     stroke: {
//       curve: "smooth",
//       width: .2,
//     },
//     tooltip: {
//       x: { format: "HH:mm:ss" },
//       y: {
//         formatter: (val) => `${val}`,
//       },
//     },
//     dataLabels:{
//       enabled:false //disable data labels here
//     }
//   };

//   return (
//     <Chart options={barOptions} series={barSeries} type="bar" height={350} />
//   );
// };

// export default DellCpuBar;

import React, { useState, useEffect, useMemo } from "react";
import Chart from "react-apexcharts";

const DellCpuBar = ({ data }) => {
  const [selectedFields, setSelectedFields] = useState([
    "cpu-util-1min",
    "mem-threshold-hi",
    "mem-threshold-lo",
  ]);
  const [chartType, setChartType] = useState("bar");
  const [timeGrouping, setTimeGrouping] = useState("none");

  // Process and filter CPU data
  const { chartData, stats, availableFields } = useMemo(() => {
    const dellCpu = data.filter((item) => item._measurement === "dell_cpu");

    // Group data by field
    const groupByField = dellCpu.reduce((acc, point) => {
      if (!acc[point._field]) {
        acc[point._field] = [];
      }
      acc[point._field].push(point);
      return acc;
    }, {});

    // Get all available fields from the data
    const fields = Object.keys(groupByField);

    // Use CPU utilization as primary field if available, otherwise use allowed fields
    const primaryFields = fields.includes("cpu-util-1min")
      ? ["cpu-util-1min", "mem-threshold-hi", "mem-threshold-lo"]
      : ["mem-threshold-hi", "mem-threshold-lo"];

    // Calculate statistics
    const statistics = {};
    Object.keys(groupByField).forEach((field) => {
      const values = groupByField[field].map((point) => point._value);
      statistics[field] = {
        current: values[values.length - 1] || 0,
        avg: values.reduce((a, b) => a + b, 0) / values.length || 0,
        max: Math.max(...values) || 0,
        min: Math.min(...values) || 0,
        count: values.length,
      };
    });

    // Create chart series
    const series = Object.keys(groupByField)
      .filter((field) => selectedFields.includes(field))
      .map((field) => {
        const points = groupByField[field]
          .map((point) => ({
            x: new Date(point._time),
            y:
              field === "cpu-util-1min"
                ? (point._value / 100).toFixed(2)
                : point._value,
          }))
          .sort((a, b) => a.x - b.x);

        return {
          name: field
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          data: points,
          color: getFieldColor(field),
        };
      });

    return {
      chartData: series,
      stats: statistics,
      availableFields: fields,
    };
  }, [data, selectedFields]);

  // Color mapping for different fields
  function getFieldColor(field) {
    const colorMap = {
      "cpu-util-1min": "#3B82F6", // Blue
      "mem-threshold-hi": "#EF4444", // Red
      "mem-threshold-lo": "#F59E0B", // Orange
      "cpu-threshold-hi": "#8B5CF6", // Purple
      "cpu-threshold-lo": "#10B981", // Green
    };
    return colorMap[field] || "#6B7280";
  }

  // Enhanced chart options
  const chartOptions = {
    chart: {
      type: chartType,
      height: 400,
      zoom: { enabled: true },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
      background: "transparent",
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "70%",
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "last",
        dataLabels: {
          position: "top",
        },
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        format: "HH:mm",
        style: {
          colors: "#6B7280",
          fontSize: "12px",
          fontWeight: 500,
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Values",
        style: {
          color: "#374151",
          fontSize: "14px",
          fontWeight: 600,
        },
      },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
        formatter: (val) => {
          if (selectedFields.includes("cpu-util-1min") && val <= 1) {
            return `${(val * 100).toFixed(1)}%`;
          }
          return `${val}`;
        },
      },
    },
    title: {
      text: "CPU Performance Metrics",
      align: "left",
      style: {
        fontSize: "20px",
        fontWeight: "bold",
        color: "#111827",
      },
      offsetY: 20,
    },
    subtitle: {
      text: `Displaying ${chartData.length} metric${
        chartData.length !== 1 ? "s" : ""
      } over time`,
      align: "left",
      style: {
        fontSize: "14px",
        color: "#6B7280",
      },
      offsetY: 50,
    },
    stroke: {
      show: chartType === "line",
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: chartType === "bar" ? "gradient" : "solid",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: undefined,
        inverseColors: false,
        opacityFrom: 0.8,
        opacityTo: 0.6,
        stops: [0, 100],
      },
    },
    tooltip: {
      theme: "light",
      shared: true,
      intersect: false,
      x: {
        format: "dd MMM yyyy HH:mm:ss",
      },
      y: {
        formatter: (val, { seriesIndex, dataPointIndex, w }) => {
          const seriesName = w.config.series[seriesIndex].name;
          if (seriesName.includes("Cpu Util")) {
            return `${(val * 100).toFixed(2)}%`;
          }
          return `${val}`;
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "13px",
      fontWeight: 500,
      offsetY: -5,
    },
    grid: {
      borderColor: "#F3F4F6",
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    colors: chartData.map((series) => series.color),
  };

  // Field selection handler
  const handleFieldToggle = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  return (
    <div className="w-full">
      {/* Enhanced Header with Controls */}
      <div className="bg-white rounded-t-2xl border border-gray-200 border-b-0 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Performance Analytics
            </h3>
            <p className="text-sm text-gray-600">
              Monitor CPU utilization and threshold metrics in real-time
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Chart Type Selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">View:</label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="area">Area Chart</option>
              </select>
            </div>
          </div>
        </div>

        {/* Field Selection */}
        <div className="mt-6">
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Select Metrics to Display:
          </label>
          <div className="flex flex-wrap gap-1">
            {availableFields.map((field) => (
              <button
                key={field}
                onClick={() => handleFieldToggle(field)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedFields.includes(field)
                    ? "bg-blue-100 text-blue-700 border-2 border-blue-200"
                    : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                }`}
              >
                {field
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                {selectedFields.includes(field) && (
                  <span className="ml-2 text-blue-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Statistics Summary */}
        {Object.keys(stats).length > 0 && (
          // <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="mt-6">
            <div className="flex flex-wrap gap-4">
              {selectedFields.slice(0, 4).map((field) => {
                const stat = stats[field];
                if (!stat) return null;

                return (
                  <div key={field} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="relative group">
                        <h4 className="text-sm font-semibold text-gray-700 truncate max-w-[120px]">
                          {field
                            .replace(/-/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </h4>
                        <span className="absolute z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 bottom-full mb-1 whitespace-nowrap">
                          {field
                            .replace(/-/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 ml-2"
                        style={{ backgroundColor: getFieldColor(field) }}
                      ></div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Current:</span>
                        <span className="font-semibold">
                          {field === "cpu-util-1min"
                            ? `${(stat.current / 100).toFixed(1)}%`
                            : stat.current.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Average:</span>
                        <span className="font-medium">
                          {field === "cpu-util-1min"
                            ? `${(stat.avg / 100).toFixed(1)}%`
                            : stat.avg.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Max:</span>
                        <span className="font-medium">
                          {field === "cpu-util-1min"
                            ? `${(stat.max / 100).toFixed(1)}%`
                            : stat.max.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="bg-white rounded-b-2xl border border-gray-200 border-t-0 p-6">
        {chartData.length > 0 ? (
          <Chart
            options={chartOptions}
            series={chartData}
            type={chartType}
            height={400}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 text-5xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Data Available
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              No CPU metrics found for the selected fields. Please check your
              data source or select different metrics.
            </p>
            <button
              onClick={() => setSelectedFields(availableFields)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Select All Available Fields
            </button>
          </div>
        )}
      </div>

      {/* Data Quality Indicator */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>
          {chartData.reduce((total, series) => total + series.data.length, 0)}{" "}
          data points displayed
        </span>
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

export default DellCpuBar;
