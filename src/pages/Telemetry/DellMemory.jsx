import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";

const DellMemory = ({data}) => {
  const dellMemory = data.filter(
    (item) => item._measurement === "dell_mem"
  );

  const groupByMemoryField = dellMemory.reduce((acc, point) => {
    if (!acc[point._field]) {
      acc[point._field] = [];
    }
    acc[point._field].push(point);
    return acc;
  }, {});

  const memorySeries = Object.keys(groupByMemoryField).map((field) => ({
    name: field,
    data: groupByMemoryField[field].map((point) => ({
      x: new Date(point._time),
      y: point._value,
    })),
  }));

  const memoryOptions = {
    chart: {
      type: "bar",
      zoom: { enabled: false },
    },
    xaxis: {
      type: "datetime",
    },
    yaxis: {
      title: { text: "Usage (%)" },
    },
    title: {
      text: "Memory Metrics Over Time",
      align: "left",
    },
    stroke: {
      curve: "smooth",
      width: .1,
    },
    tooltip: {
      x: { format: "HH:mm:ss" },
      y: {
        formatter: (val) => `${val}`,
      },
    },
    dataLabels:{
      enabled:false //disable data labels here
    }
  };

  return (
    <Chart options={memoryOptions} series={memorySeries} type="bar" height={350} />
  );
};

export default DellMemory;