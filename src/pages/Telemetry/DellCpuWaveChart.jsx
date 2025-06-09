import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";

const DellCpuWaveChart = ({data}) => {
  // const data = useInfluxData();
  // const [influxData, setInfluxData] = useState([]);

  // useEffect(() => {
  //   setInfluxData(data);
  // }, [data]);

  const dellCpu = data.filter((item) => item._measurement === "dell_cpu");
  

  const groupByField = dellCpu.reduce((acc, point) => {
    if (!acc[point._field]) {
      acc[point._field] = [];
    }
    acc[point._field].push(point);
    return acc;
  }, {});

  //  const lineSeries = [
  //   {
  //     name: "cpu-util-1min",
  //     data: groupByField["cpu-util-1min"]?.map((item) => ({
  //       x: new Date(item._time).toLocaleTimeString(),
  //       y: item._value,
  //     })),
  //   },
  // ];

  // const lineOptions = {
  //   chart: {
  //     type: "line",
  //     height: 350,
  //     zoom: { enabled: true },
  //   },
  //   title: {
  //     text: "CPU Utilization Over Time",
  //     align: "left",
  //   },
  //   stroke: {
  //     curve: "smooth",
  //     width: 1.5,
  //   },
  //   dataLabels: {
  //     enabled: false,
  //     // formatter: (val) => `${val.toFixed(2)}%`
  //     formatter: (val) => val,
  //   },
  //   xaxis: {
  //     type: "category",
  //     title: { text: "Time" },
  //   },
  //   yaxis: {
  //     title: { text: "CPU Util (%)" },
  //     labels: {
  //       // formatter: (val) => `${val.toFixed(2)}%`
  //       formatter: (val) => val,
  //     },
  //   },
  //   tooltip: {
  //     x: { format: "HH:mm:ss" },
  //     y: {
  //       // formatter: (val) => `${val.toFixed(2)}%`
  //       formatter: (val) => val,
  //     },
  //   },
  // };

  const lineSeries = [
  {
    name: "cpu-util-1min",
    data: groupByField["cpu-util-1min"]?.map((item) => ({
      x: new Date(item._time).toLocaleTimeString(),
      y: item._value,
    })),
  },
];

const lineOptions = {
  chart: {
    type: "line", // Keep as 'line' for wave-like appearance
    height: 350,
    zoom: { enabled: true },
  },
  title: {
    text: "CPU Utilization Over Time",
    align: "left",
  },
  stroke: {
    curve: "smooth", // Smooth creates the wave shape
    width: 3,
  },
  fill: {
    type: "gradient", // Gradient fill for wave effect
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.3,
      stops: [0, 90, 100],
    },
  },
  dataLabels: {
    enabled: false,
    formatter: (val) => val,
  },
  xaxis: {
    type: "category",
    title: { text: "Time" },
  },
  yaxis: {
    title: { text: "CPU Util (%)" },
    labels: {
      formatter: (val) => val,
    },
  },
  tooltip: {
    x: { format: "HH:mm:ss" },
    y: {
      formatter: (val) => val,
    },
  },
};


  return (
    <Chart options={lineOptions} series={lineSeries} type="line" height={350} />
  );
};

export default DellCpuWaveChart;