// import React, { useState, useEffect } from "react";
// import Chart from "react-apexcharts";

// const DellMemory = ({data}) => {
//   const dellMemory = data.filter(
//     (item) => item._measurement === "dell_mem"
//   );

//   const groupByMemoryField = dellMemory.reduce((acc, point) => {
//     if (!acc[point._field]) {
//       acc[point._field] = [];
//     }
//     acc[point._field].push(point);
//     return acc;
//   }, {});

//   const memorySeries = Object.keys(groupByMemoryField).map((field) => ({
//     name: field,
//     data: groupByMemoryField[field].map((point) => ({
//       x: new Date(point._time),
//       y: point._value,
//     })),
//   }));

//   const memoryOptions = {
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
//       text: "Memory Metrics Over Time",
//       align: "left",
//     },
//     stroke: {
//       curve: "smooth",
//       width: .1,
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
//     <Chart options={memoryOptions} series={memorySeries} type="bar" height={350} />
//   );
// };

// export default DellMemory;

import React, { useState, useEffect, useMemo } from "react";
import Chart from "react-apexcharts";

const DellMemory = ({ data }) => {
  const [selectedFields, setSelectedFields] = useState(["mem-usage"]);
  const [chartType, setChartType] = useState("bar");
  const [displayUnit, setDisplayUnit] = useState("GB"); // GB, MB, or raw
  const [showThresholds, setShowThresholds] = useState(true);

  // Process and filter Memory data
  const { chartData, stats, availableFields, memoryHealth } = useMemo(() => {
    const dellMemory = data.filter((item) => item._measurement === "dell_mem");

    // Group data by field
    const groupByMemoryField = dellMemory.reduce((acc, point) => {
      if (!acc[point._field]) {
        acc[point._field] = [];
      }
      acc[point._field].push(point);
      return acc;
    }, {});

    // Get all available fields from the data
    const fields = Object.keys(groupByMemoryField);

    // Auto-select memory usage field if available
    const defaultFields = fields.includes("mem-usage")
      ? ["mem-usage"]
      : fields.slice(0, 3); // Take first 3 fields if mem-usage not found

    // Calculate statistics and health
    const statistics = {};
    let healthScore = 100;

    Object.keys(groupByMemoryField).forEach((field) => {
      const values = groupByMemoryField[field].map((point) => {
        // Convert values based on unit selection
        let convertedValue = point._value;
        if (
          field === "mem-usage" ||
          field.includes("memory") ||
          field.includes("mem")
        ) {
          if (displayUnit === "GB") {
            convertedValue = point._value / (1024 * 1024 * 1024);
          } else if (displayUnit === "MB") {
            convertedValue = point._value / (1024 * 1024);
          }
        }
        return convertedValue;
      });

      statistics[field] = {
        current: values[values.length - 1] || 0,
        avg: values.reduce((a, b) => a + b, 0) / values.length || 0,
        max: Math.max(...values) || 0,
        min: Math.min(...values) || 0,
        count: values.length,
        trend:
          values.length > 1
            ? ((values[values.length - 1] - values[values.length - 2]) /
                values[values.length - 2]) *
              100
            : 0,
      };

      // Calculate health score based on memory usage
      if (field === "mem-usage" && values.length > 0) {
        const currentUsage = values[values.length - 1];
        const maxMemory = Math.max(...values);
        const usagePercent = (currentUsage / maxMemory) * 100;

        if (usagePercent > 90) healthScore = 25;
        else if (usagePercent > 80) healthScore = 50;
        else if (usagePercent > 70) healthScore = 75;
        else healthScore = 100;
      }
    });

    // Create chart series
    const series = Object.keys(groupByMemoryField)
      .filter((field) => selectedFields.includes(field))
      .map((field) => {
        const points = groupByMemoryField[field]
          .map((point) => {
            let value = point._value;
            // Convert memory values based on selected unit
            if (
              field === "mem-usage" ||
              field.includes("memory") ||
              field.includes("mem")
            ) {
              if (displayUnit === "GB") {
                value = (point._value / (1024 * 1024 * 1024)).toFixed(2);
              } else if (displayUnit === "MB") {
                value = (point._value / (1024 * 1024)).toFixed(2);
              }
            }

            return {
              x: new Date(point._time),
              y: parseFloat(value),
            };
          })
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
      memoryHealth: healthScore,
    };
  }, [data, selectedFields, displayUnit]);

  // Color mapping for different memory fields
  function getFieldColor(field) {
    const colorMap = {
      "mem-usage": "#10B981", // Green
      "mem-total": "#3B82F6", // Blue
      "mem-free": "#06B6D4", // Cyan
      "mem-available": "#8B5CF6", // Purple
      "mem-cached": "#F59E0B", // Orange
      "mem-buffers": "#EF4444", // Red
      "memory-usage": "#10B981", // Green (alternative naming)
      "memory-total": "#3B82F6", // Blue (alternative naming)
    };
    return colorMap[field] || "#6B7280";
  }

  // Get memory health color
  function getHealthColor(score) {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    if (score >= 40) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
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
        text: `Memory Usage (${displayUnit})`,
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
          return `${val} ${displayUnit}`;
        },
      },
    },
    title: {
      text: "Memory Performance Analytics",
      align: "left",
      style: {
        fontSize: "20px",
        fontWeight: "bold",
        color: "#111827",
      },
      offsetY: 20,
    },
    subtitle: {
      text: `Displaying ${chartData.length} memory metric${
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
          return `${val} ${displayUnit}`;
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
    annotations: showThresholds
      ? {
          yaxis: [
            {
              y:
                displayUnit === "GB"
                  ? 8
                  : displayUnit === "MB"
                  ? 8192
                  : 8589934592,
              borderColor: "#F59E0B",
              borderWidth: 2,
              label: {
                borderColor: "#F59E0B",
                style: {
                  color: "#fff",
                  background: "#F59E0B",
                },
                text: `Warning (8 ${displayUnit})`,
              },
            },
            {
              y:
                displayUnit === "GB"
                  ? 12
                  : displayUnit === "MB"
                  ? 12288
                  : 12884901888,
              borderColor: "#EF4444",
              borderWidth: 2,
              label: {
                borderColor: "#EF4444",
                style: {
                  color: "#fff",
                  background: "#EF4444",
                },
                text: `Critical (12 ${displayUnit})`,
              },
            },
          ],
        }
      : {},
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
          <div className="flex items-start space-x-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Memory Performance Analytics
              </h3>
              <p className="text-sm text-gray-600">
                Monitor memory usage, availability, and performance metrics
              </p>
            </div>
            {/* Memory Health Indicator */}
            <div className={`w-40 px-4 py-2 rounded-lg flex items-center space-x-2 ${getHealthColor(memoryHealth)}`}>
              <div className="w-2 h-2 rounded-full bg-current"></div>
              <span className="text-sm font-semibold">
                Health: {memoryHealth}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            {/* Chart Type Selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">View:</label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="area">Area Chart</option>
              </select>
            </div>

            {/* Unit Selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Unit:</label>
              <select
                value={displayUnit}
                onChange={(e) => setDisplayUnit(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="GB">Gigabytes (GB)</option>
                <option value="MB">Megabytes (MB)</option>
                <option value="raw">Raw Bytes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Field Selection */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              Select Memory Metrics to Display:
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showThresholds}
                onChange={(e) => setShowThresholds(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-600">Show Thresholds</span>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableFields.map((field) => (
              <button
                key={field}
                onClick={() => handleFieldToggle(field)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedFields.includes(field)
                    ? "bg-green-100 text-green-700 border-2 border-green-200"
                    : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                }`}
              >
                {field
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                {selectedFields.includes(field) && (
                  <span className="ml-2 text-green-500">✓</span>
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
                <div key={field} className="bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-700">
                      {field
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 ml-2"
                        style={{ backgroundColor: getFieldColor(field) }}
                      ></div>
                      {stat.trend !== 0 && (
                        <span
                          className={`text-xs ${
                            stat.trend > 0 ? "text-red-500" : "text-green-500"
                          }`}
                        >
                          {stat.trend > 0 ? "↗" : "↘"}{" "}
                          {Math.abs(stat.trend).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Current:</span>
                      <span className="font-semibold">
                        {stat.current.toFixed(2)} {displayUnit}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Average:</span>
                      <span className="font-medium">
                        {stat.avg.toFixed(2)} {displayUnit}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Peak:</span>
                      <span className="font-medium">
                        {stat.max.toFixed(2)} {displayUnit}
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
            <div className="text-gray-400 text-5xl mb-4">💾</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Memory Data Available
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              No memory metrics found for the selected fields. Please check your
              data source or select different metrics.
            </p>
            <button
              onClick={() => setSelectedFields(availableFields)}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Select All Available Fields
            </button>
          </div>
        )}
      </div>

      {/* Data Quality and System Info */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          <span>
            {chartData.reduce((total, series) => total + series.data.length, 0)}{" "}
            data points
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
          <span>Memory Health: {memoryHealth}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
          <span>Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default DellMemory;
