// import React, { useState, useEffect } from "react";
// import Chart from "react-apexcharts";

// const DellCpuWaveChart = ({ data }) => {
//   const dellCpu = data.filter((item) => item._measurement === "dell_cpu");

//   const groupByField = dellCpu.reduce((acc, point) => {
//     if (!acc[point._field]) {
//       acc[point._field] = [];
//     }
//     acc[point._field].push(point);
//     return acc;
//   }, {});

//   const lineSeries = [
//     {
//       name: "cpu-util-1min",
//       data: groupByField["cpu-util-1min"]?.map((item) => ({
//         x: new Date(item._time).toLocaleTimeString(),
//         y: item._value,
//       })),
//     },
//   ];

//   const lineOptions = {
//     chart: {
//       type: "line", // Keep as 'line' for wave-like appearance
//       height: 350,
//       zoom: { enabled: true },
//     },
//     title: {
//       text: "CPU Utilization Over Time",
//       align: "left",
//     },
//     stroke: {
//       curve: "smooth", // Smooth creates the wave shape
//       width: 3,
//     },
//     fill: {
//       type: "gradient", // Gradient fill for wave effect
//       gradient: {
//         shadeIntensity: 1,
//         opacityFrom: 0.7,
//         opacityTo: 0.3,
//         stops: [0, 90, 100],
//       },
//     },
//     dataLabels: {
//       enabled: false,
//       formatter: (val) => val,
//     },
//     xaxis: {
//       type: "category",
//       title: { text: "Time" },
//     },
//     yaxis: {
//       title: { text: "CPU Util (%)" },
//       labels: {
//         formatter: (val) => val,
//       },
//     },
//     tooltip: {
//       x: { format: "HH:mm:ss" },
//       y: {
//         formatter: (val) => val,
//       },
//     },
//   };

//   return (
//     <Chart options={lineOptions} series={lineSeries} type="line" height={350} />
//   );
// };

// export default DellCpuWaveChart;

import React, { useMemo } from "react";
import Chart from "react-apexcharts";

// Enhanced CPU Wave Chart
const DellCpuWaveChart = ({ data }) => {
  const chartData = useMemo(() => {
    const dellCpu = data.filter((item) => item._measurement === "dell_cpu");
    const groupByField = dellCpu.reduce((acc, point) => {
      if (!acc[point._field]) {
        acc[point._field] = [];
      }
      acc[point._field].push(point);
      return acc;
    }, {});

    return [
      {
        name: "CPU Utilization",
        data: groupByField["cpu-util-1min"]?.map((item) => ({
          x: new Date(item._time).getTime(),
          y: (item._value / 100).toFixed(2), // Convert to percentage
        })).sort((a, b) => a.x - b.x) || [],
      },
    ];
  }, [data]);

  const options = {
    chart: {
      type: "area",
      height: 350,
      zoom: { enabled: true },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      background: 'transparent'
    },
    title: {
      text: "CPU Utilization Over Time",
      align: "left",
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1F2937'
      }
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ['#3B82F6']
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
        gradientToColors: ['#60A5FA'],
        inverseColors: false,
        opacityFrom: 0.8,
        opacityTo: 0.1,
        stops: [0, 50, 100]
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: "datetime",
      title: { 
        text: "Time",
        style: {
          fontSize: '14px',
          fontWeight: 600,
          color: '#374151'
        }
      },
      labels: {
        format: 'HH:mm',
        style: {
          colors: '#6B7280',
          fontSize: '12px'
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      title: { 
        text: "CPU Utilization (%)",
        style: {
          fontSize: '14px',
          fontWeight: 600,
          color: '#374151'
        }
      },
      labels: {
        formatter: (val) => `${val}%`,
        style: {
          colors: '#6B7280',
          fontSize: '12px'
        }
      },
      min: 0,
      max: 100
    },
    tooltip: {
      theme: 'light',
      x: { format: "dd MMM yyyy HH:mm" },
      y: {
        formatter: (val) => `${val}%`,
      },
    },
    grid: {
      borderColor: '#F3F4F6',
      strokeDashArray: 3
    },
    annotations: {
      yaxis: [
        {
          y: 80,
          borderColor: '#EF4444',
          borderWidth: 2,
          label: {
            borderColor: '#EF4444',
            style: {
              color: '#fff',
              background: '#EF4444'
            },
            text: 'Critical (80%)'
          }
        },
        {
          y: 60,
          borderColor: '#F59E0B',
          borderWidth: 2,
          label: {
            borderColor: '#F59E0B',
            style: {
              color: '#fff',
              background: '#F59E0B'
            },
            text: 'Warning (60%)'
          }
        }
      ]
    }
  };

  return (
    <Chart options={options} series={chartData} type="area" height={350} />
  );
};

// Enhanced CPU Bar Chart
export const EnhancedDellCpuBar = ({ data }) => {
  const chartData = useMemo(() => {
    const dellCpu = data.filter((item) => item._measurement === "dell_cpu");
    const groupByField = dellCpu.reduce((acc, point) => {
      if (!acc[point._field]) {
        acc[point._field] = [];
      }
      acc[point._field].push(point);
      return acc;
    }, {});

    const allowedFields = ["cpu-util-1min"];

    return Object.keys(groupByField)
      .filter((field) => allowedFields.includes(field))
      .map((field) => ({
        name: field.replace("-", " ").toUpperCase(),
        data: groupByField[field].map((point) => ({
          x: new Date(point._time).getTime(),
          y: (point._value / 100).toFixed(2),
        })).sort((a, b) => a.x - b.x),
      }));
  }, [data]);

  const options = {
    chart: {
      type: "bar",
      height: 350,
      zoom: { enabled: false },
      toolbar: {
        show: true
      },
      background: 'transparent'
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '60%',
        colors: {
          ranges: [
            { from: 0, to: 50, color: '#10B981' },
            { from: 51, to: 75, color: '#F59E0B' },
            { from: 76, to: 100, color: '#EF4444' }
          ]
        }
      }
    },
    xaxis: {
      type: "datetime",
      labels: {
        format: 'HH:mm',
        style: {
          colors: '#6B7280',
          fontSize: '12px'
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      title: { 
        text: "CPU Usage (%)",
        style: {
          fontSize: '14px',
          fontWeight: 600,
          color: '#374151'
        }
      },
      labels: {
        formatter: (val) => `${val}%`,
        style: {
          colors: '#6B7280',
          fontSize: '12px'
        }
      },
      min: 0,
      max: 100
    },
    title: {
      text: "CPU Performance Metrics",
      align: "left",
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1F2937'
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    tooltip: {
      theme: 'light',
      x: { format: "dd MMM yyyy HH:mm" },
      y: {
        formatter: (val) => `${val}%`,
      },
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      borderColor: '#F3F4F6',
      strokeDashArray: 3
    },
    colors: ['#3B82F6']
  };

  return (
    <Chart options={options} series={chartData} type="bar" height={350} />
  );
};

// Enhanced Memory Chart
export const EnhancedDellMemory = ({ data }) => {
  const chartData = useMemo(() => {
    const dellMemory = data.filter((item) => item._measurement === "dell_mem");
    const groupByMemoryField = dellMemory.reduce((acc, point) => {
      if (!acc[point._field]) {
        acc[point._field] = [];
      }
      acc[point._field].push(point);
      return acc;
    }, {});

    return Object.keys(groupByMemoryField).map((field) => ({
      name: field.replace("-", " ").toUpperCase(),
      data: groupByMemoryField[field].map((point) => ({
        x: new Date(point._time).getTime(),
        y: (point._value / 1024).toFixed(2), // Convert to GB
      })).sort((a, b) => a.x - b.x),
    }));
  }, [data]);

  const options = {
    chart: {
      type: "line",
      height: 350,
      zoom: { enabled: true },
      toolbar: {
        show: true
      },
      background: 'transparent'
    },
    stroke: {
      curve: "smooth",
      width: 4,
      colors: ['#10B981', '#8B5CF6']
    },
    xaxis: {
      type: "datetime",
      labels: {
        format: 'HH:mm',
        style: {
          colors: '#6B7280',
          fontSize: '12px'
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      title: { 
        text: "Memory Usage (GB)",
        style: {
          fontSize: '14px',
          fontWeight: 600,
          color: '#374151'
        }
      },
      labels: {
        formatter: (val) => `${val} GB`,
        style: {
          colors: '#6B7280',
          fontSize: '12px'
        }
      }
    },
    title: {
      text: "Memory Usage Trends",
      align: "left",
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1F2937'
      }
    },
    markers: {
      size: 0,
      hover: {
        size: 8
      }
    },
    tooltip: {
      theme: 'light',
      x: { format: "dd MMM yyyy HH:mm" },
      y: {
        formatter: (val) => `${val} GB`,
      },
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      borderColor: '#F3F4F6',
      strokeDashArray: 3
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right'
    }
  };

  return (
    <Chart options={options} series={chartData} type="line" height={350} />
  );
};


export default DellCpuWaveChart