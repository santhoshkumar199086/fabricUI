import React, { useState, useEffect } from "react";

export const TimeRangeDropdown = ({ onTimeChange }) => {
  const options = [
    { label: "5 minutes", value: "5m" },
    { label: "10 minutes", value: "10m" },
    { label: "15 minutes", value: "15m" },
    { label: "30 minutes", value: "30m" },
    { label: "1 hour", value: "1h" },
  ];

  return (
    <select onChange={(e) => onTimeChange(e.target.value)}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};