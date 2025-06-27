//Static JSON data for testing purposes
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { InfluxDB } from "@influxdata/influxdb-client";
import TelemetryJSON from "../Helpers/telemetry.json";
import NodeProfileJson from "../Helpers/nodeProfile.json";

const token = "5waQ14YcyWWitL-F13MNRD9o5Vi4aV4yORO4FNEymILg8b3J34lI-QeshCckTrBT4hRYo0CdhrUUNfamm_cDzw==";
const org = "Cntrs";
const bucket = "dell_device";
const url = "http://172.27.1.75:8086";

const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

export const useInfluxData = (options = {}) => {
  // Enhanced options with defaults
  const {
    timeRange = "1h",
    measurementTypes = [],
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    filters = {},
    enableRealTime = false
  } = typeof options === 'string' ? { timeRange: options } : options;

  // State management
  const [data, setData] = useState([]);
  const [processedData, setProcessedData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [stats, setStats] = useState({});

  // Memoized measurements list
  const measurements = useMemo(() => {
    return measurementTypes.length > 0
      ? measurementTypes
      : [
          "dell_arp",
          "dell_cpu",
          "dell_interface_status",
          "dell_hostname",
          "dell_mem",
          "dell_mac_table",
          "dell_routing_table",
        ];
  }, [measurementTypes]);

  // Build Flux Query
  const buildFluxQuery = useCallback(() => {
    try {
      const queries = [];

      // ARP entries query
      if (measurements.includes("dell_arp")) {
        queries.push(`
          arp_entries = from(bucket: "${bucket}")
            |> range(start: -${timeRange})
            |> filter(fn: (r) => r._measurement == "dell_arp")
            |> group(columns: ["addr", "intf-name"])
            |> last()
        `);
      }

      // Interface status query
      if (measurements.includes("dell_interface_status")) {
        queries.push(`
          interface_status = from(bucket: "${bucket}")
            |> range(start: -${timeRange})
            |> filter(fn: (r) => r._measurement == "dell_interface_status")
            |> filter(fn: (r) => r._field == "admin-status")
            |> group(columns: ["name"])
            |> last()
        `);
      }

      // Routing table query
      if (measurements.includes("dell_routing_table")) {
        queries.push(`
          routing_table_entries = from(bucket: "${bucket}")
            |> range(start: -${timeRange})
            |> filter(fn: (r) => r._measurement == "dell_routing_table")
            |> filter(fn: (r) => r._field == "last-updated")
            |> group(columns: ["source-protocol"])
            |> last()
        `);
      }

      // Other measurements
      const otherMeasurements = measurements.filter(
        (m) => !["dell_arp", "dell_interface_status", "dell_routing_table"].includes(m)
      );

      if (otherMeasurements.length > 0) {
        let otherQuery = `
          other_measurements = from(bucket: "${bucket}")
            |> range(start: -${timeRange})
            |> filter(fn: (r) => contains(value: r._measurement, set: ${JSON.stringify(otherMeasurements)}))
        `;

        // Add custom filters
        Object.entries(filters).forEach(([key, value]) => {
          otherQuery += `
            |> filter(fn: (r) => r.${key} == "${value}")`;
        });

        queries.push(otherQuery);
      }

      // Combine all queries
      if (queries.length > 0) {
        const tableNames = [];
        if (measurements.includes("dell_arp")) tableNames.push("arp_entries");
        if (measurements.includes("dell_interface_status")) tableNames.push("interface_status");
        if (measurements.includes("dell_routing_table")) tableNames.push("routing_table_entries");
        if (otherMeasurements.length > 0) tableNames.push("other_measurements");

        return `
          ${queries.join('\n')}

          union(tables: [${tableNames.join(', ')}])
        `;
      }

      return '';
    } catch (err) {
      console.error('Error building Flux query:', err);
      return '';
    }
  }, [timeRange, measurements, filters]);

  // Enhanced data processing
  const processData = useCallback((rawData) => {
    const processed = {
      byMeasurement: {},
      byField: {},
      byTime: {},
      latest: {},
      stats: {
        totalRecords: rawData.length,
        measurements: new Set(),
        timeRange: {
          start: null,
          end: null
        }
      }
    };

    rawData.forEach(row => {
      const measurement = row._measurement;
      const field = row._field;
      const time = new Date(row._time);

      // Group by measurement
      if (!processed.byMeasurement[measurement]) {
        processed.byMeasurement[measurement] = [];
      }
      processed.byMeasurement[measurement].push(row);

      // Group by field
      if (!processed.byField[field]) {
        processed.byField[field] = [];
      }
      processed.byField[field].push(row);

      // Track time range
      if (!processed.stats.timeRange.start || time < processed.stats.timeRange.start) {
        processed.stats.timeRange.start = time;
      }
      if (!processed.stats.timeRange.end || time > processed.stats.timeRange.end) {
        processed.stats.timeRange.end = time;
      }

      // Track measurements
      processed.stats.measurements.add(measurement);

      // Keep latest value for each measurement/field combination
      const key = `${measurement}.${field}`;
      if (!processed.latest[key] || time > new Date(processed.latest[key]._time)) {
        processed.latest[key] = row;
      }
    });

    // Convert Set to Array for measurements
    processed.stats.measurements = Array.from(processed.stats.measurements);

    return processed;
  }, []);

  // Calculate statistics
  const calculateStats = useCallback((processedData) => {
    const stats = {
      cpu: {
        current: 0,
        avg: 0,
        max: 0,
        trend: 0
      },
      memory: {
        current: 0,
        avg: 0,
        max: 0,
        trend: 0
      },
      interfaces: {
        total: 0,
        active: 0,
        inactive: 0,
        healthPercent: 0
      },
      arp: {
        total: 0,
        dynamic: 0,
        static: 0
      },
      network: {
        totalTraffic: 0,
        activeConnections: 0
      }
    };

    // CPU Statistics
    const cpuData = processedData.byMeasurement['dell_cpu'] || [];
    const cpuUtil = cpuData.filter(item => item._field === 'cpu-util-1min');
    if (cpuUtil.length > 0) {
      const values = cpuUtil.map(item => item._value / 100); // Convert to percentage
      stats.cpu.current = values[values.length - 1] || 0;
      stats.cpu.avg = values.reduce((a, b) => a + b, 0) / values.length;
      stats.cpu.max = Math.max(...values);

      // Calculate trend (last vs previous)
      if (values.length > 1) {
        stats.cpu.trend = ((values[values.length - 1] - values[values.length - 2]) / values[values.length - 2]) * 100;
      }
    }

    // Memory Statistics
    const memData = processedData.byMeasurement['dell_mem'] || [];
    const memUsage = memData.filter(item => item._field === 'mem-usage');
    if (memUsage.length > 0) {
      const values = memUsage.map(item => item._value / 1024); // Convert to GB
      stats.memory.current = values[values.length - 1] || 0;
      stats.memory.avg = values.reduce((a, b) => a + b, 0) / values.length;
      stats.memory.max = Math.max(...values);

      if (values.length > 1) {
        stats.memory.trend = ((values[values.length - 1] - values[values.length - 2]) / values[values.length - 2]) * 100;
      }
    }

    // Interface Statistics
    const interfaceData = processedData.byMeasurement['dell_interface_status'] || [];
    stats.interfaces.total = interfaceData.length;
    stats.interfaces.active = interfaceData.filter(item => item._value === 'up').length;
    stats.interfaces.inactive = stats.interfaces.total - stats.interfaces.active;
    stats.interfaces.healthPercent = stats.interfaces.total > 0
      ? (stats.interfaces.active / stats.interfaces.total) * 100
      : 0;

    // ARP Statistics
    const arpData = processedData.byMeasurement['dell_arp'] || [];
    stats.arp.total = arpData.length;
    stats.arp.dynamic = arpData.filter(item => item.state === 'dynamic').length;
    stats.arp.static = stats.arp.total - stats.arp.dynamic;

    return stats;
  }, []);

  // Main fetch function
  const fetchData = useCallback(async (currentMeasurements) => {
    if (currentMeasurements.length === 0) return;

    setIsLoading(true);
    setError(null);
    setConnectionStatus('connecting');

    try {
      // For development, use static data
      const staticData = TelemetryJSON || [];
      //const staticData = NodeProfileJson || [];

      // In production, you would use:
      // const fluxQuery = buildFluxQuery();
      // const rows = [];
      // await queryApi.queryRows(fluxQuery, { ... });

      // Process the data
      const processed = processData(staticData);
      console.log("Processed data:", processed);
      const calculatedStats = calculateStats(processed);

      setData(staticData);
      setProcessedData(processed);
      setStats(calculatedStats);
      setLastUpdate(new Date());
      setConnectionStatus('connected');
      setIsLoading(false);

      console.log('Data fetched successfully:', {
        records: staticData.length,
        measurements: processed.stats.measurements,
        timeRange: processed.stats.timeRange
      });

    } catch (err) {
      console.error("Query failed:", err);
      setError(err);
      setConnectionStatus('error');
      setIsLoading(false);
    }
  // }, [measurements, buildFluxQuery, processData, calculateStats]);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData(measurements);
  }, [fetchData]);

   // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData(measurements);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData, measurements]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Utility functions
  const getDataByMeasurement = useCallback((measurement) => {
    return processedData.byMeasurement?.[measurement] || [];
  }, [processedData]);

  const getLatestValue = useCallback((measurement, field) => {
    const key = `${measurement}.${field}`;
    return processedData.latest?.[key]?._value;
  }, [processedData]);

  const getFieldData = useCallback((field) => {
    return processedData.byField?.[field] || [];
  }, [processedData]);

  const isOnline = connectionStatus === 'connected';
  const hasError = connectionStatus === 'error';

  return {
    // Core data
    data,
    processedData,
    isLoading,
    error,
    lastUpdate,

    // Connection status
    connectionStatus,
    isOnline,
    hasError,

    // Statistics
    stats,

    // Utility functions
    refresh,
    getDataByMeasurement,
    getLatestValue,
    getFieldData,

    // Metadata
    measurements: processedData.stats?.measurements || [],
    totalRecords: processedData.stats?.totalRecords || 0,
    timeRange: processedData.stats?.timeRange || { start: null, end: null }
  };
};