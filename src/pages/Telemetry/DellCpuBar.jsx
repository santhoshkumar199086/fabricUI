import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { useInfluxData } from "../../Hooks/useInfluxData";


const DellCpuBar = ({data}) => {
  // const data = useInfluxData();
  // const [influxdata, setInfluxData] = useState([]);

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

  const allowedFields = ["mem-threshold-hi", "mem-threshold-lo"];

  const barSeries = Object.keys(groupByField)
   .filter((field) => allowedFields.includes(field))
   .map((field) => ({
    name: field,
    data: groupByField[field].map((point) => ({
      x: new Date(point._time),
      y: point._value,
    })),
  }));

  const barOptions = {
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
      text: "CPU Metrics Over Time",
      align: "left",
    },
    stroke: {
      curve: "smooth",
      width: .2,
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
    <Chart options={barOptions} series={barSeries} type="bar" height={350} />
  );
};

export default DellCpuBar;
