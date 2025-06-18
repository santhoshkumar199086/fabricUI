//Static JSON data for testing purposes
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { InfluxDB } from "@influxdata/influxdb-client";
import TelemetryJSON from "../Helpers/telemetry.json";

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
          "dell_arp_entry",
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
      if (measurements.includes("dell_arp_entry")) {
        queries.push(`
          arp_entries = from(bucket: "${bucket}")
            |> range(start: -${timeRange})
            |> filter(fn: (r) => r._measurement == "dell_arp_entry")
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
        (m) => !["dell_arp_entry", "dell_interface_status", "dell_routing_table"].includes(m)
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
        if (measurements.includes("dell_arp_entry")) tableNames.push("arp_entries");
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
    const arpData = processedData.byMeasurement['dell_arp_entry'] || [];
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

      // In production, you would use:
      // const fluxQuery = buildFluxQuery();
      // const rows = [];
      // await queryApi.queryRows(fluxQuery, { ... });

      // Process the data
      const processed = processData(staticData);
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

// +++++++++++++++++ Multiple IP

// import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
// import { InfluxDB } from "@influxdata/influxdb-client";

// const token = import.meta.env.VITE_TOKEN;
// const org = import.meta.env.VITE_ORG;
// const bucket = import.meta.env.VITE_BUCKET;
// const url = import.meta.env.VITE_URL;



// // const token = "wQC9fbPnLWH69MwVGSWv0vWzpwjskuRPCU1CLXcnF3H5GltAbpWpMyL0buKS6fd-zXF0gODw0CE_676hOBmyYg==";
// // const org = "Cntrls";
// // const bucket = "dell_device";
// // const url = "http://172.27.1.75:8086";

// export const useInfluxData = (options = {}) => {
//   // Enhanced options with defaults
//   const {
//     timeRange = "1h",
//     measurementTypes = [],
//     autoRefresh = false,
//     refreshInterval = 30000,
//     filters = {},
//     enableRealTime = false,
//   } = typeof options === "string" ? { timeRange: options } : options;

//   // State management
//   const [data, setData] = useState([]);
//   const [processedData, setProcessedData] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [lastUpdate, setLastUpdate] = useState(null);
//   const [connectionStatus, setConnectionStatus] = useState("disconnected");
//   const [stats, setStats] = useState({});

//   // Use ref to track if initial fetch has happened
//   const initialFetchDone = useRef(false);
//   const lastFetchParams = useRef("");
//   const abortControllerRef = useRef(null);

//   // Initialize queryApi with error handling
//   const queryApi = useMemo(() => {
//     try {
//       console.log("Initializing InfluxDB client with:", { url, org, bucket });
//       return new InfluxDB({ url, token }).getQueryApi(org);
//     } catch (err) {
//       console.error("Failed to initialize InfluxDB client:", err);
//       setError(err);
//       return null;
//     }
//   }, []);

//   // Memoized measurements list
//   const measurements = useMemo(() => {
//     return measurementTypes.length > 0
//       ? measurementTypes
//       : [
//           "dell_arp",
//           "dell_cpu",
//           "dell_interface_status",
//           "dell_hostname",
//           "dell_mem",
//           "dell_mac_table",
//           "dell_routing_table",
//         ];
//   }, [JSON.stringify(measurementTypes)]);

//   // Build Flux Query
//   const buildFluxQuery = useCallback(() => {
//     try {
//       const queries = [];
//       console.log("Building Flux query for measurements:", measurements);

//       // ARP entries query
//       if (measurements.includes("dell_arp")) {
//         queries.push(`
//           arp_entries = from(bucket: "${bucket}")
//             |> range(start: -${timeRange})
//             |> filter(fn: (r) => r._measurement == "dell_arp")
//             |> group(columns: ["addr", "intf-name"])
//             |> last()
//         `);
//       }

//       // Interface status query
//       if (measurements.includes("dell_interface_status")) {
//         queries.push(`
//           interface_status = from(bucket: "${bucket}")
//             |> range(start: -${timeRange})
//             |> filter(fn: (r) => r._measurement == "dell_interface_status")
//             |> filter(fn: (r) => r._field == "admin-status")  
//             |> group(columns: ["name"])
//             |> last()
//         `);
//       }

//       // Routing table query
//       if (measurements.includes("dell_routing_table")) {
//         queries.push(`
//           routing_table_entries = from(bucket: "${bucket}")
//             |> range(start: -${timeRange})
//             |> filter(fn: (r) => r._measurement == "dell_routing_table")
//             |> filter(fn: (r) => r._field == "last-updated")  
//             |> group(columns: ["source-protocol"])
//             |> last()
//         `);
//       }

//       // Other measurements
//       const otherMeasurements = measurements.filter(
//         (m) => !["dell_arp", "dell_interface_status", "dell_routing_table"].includes(m)
//       );

//       if (otherMeasurements.length > 0) {
//         let otherQuery = `
//           other_measurements = from(bucket: "${bucket}")
//             |> range(start: -${timeRange})
//             |> filter(fn: (r) => contains(value: r._measurement, set: ${JSON.stringify(otherMeasurements)}))
//         `;

//         // Add custom filters
//         Object.entries(filters).forEach(([key, value]) => {
//           otherQuery += `
//             |> filter(fn: (r) => r.${key} == "${value}")`;
//         });

//         queries.push(otherQuery);
//       }

//       // Combine all queries
//       if (queries.length > 0) {
//         const tableNames = [];
//         if (measurements.includes("dell_arp")) tableNames.push("arp_entries");
//         if (measurements.includes("dell_interface_status")) tableNames.push("interface_status");
//         if (measurements.includes("dell_routing_table")) tableNames.push("routing_table_entries");
//         if (otherMeasurements.length > 0) tableNames.push("other_measurements");

//         const finalQuery = `
//           ${queries.join("\n")}
          
//           union(tables: [${tableNames.join(", ")}])
//         `;

//         console.log("Generated Flux query:", finalQuery);
//         return finalQuery;
//       }

//       return "";
//     } catch (err) {
//       console.error("Error building Flux query:", err);
//       return "";
//     }
//   }, [timeRange, measurements, JSON.stringify(filters)]);

//   // Enhanced data processing
//   const processData = useCallback((rawData) => {
//     console.log("Processing raw data:", rawData.length, "records");
    
//     const processed = {
//       byMeasurement: {},
//       byField: {},
//       byTime: {},
//       latest: {},
//       stats: {
//         totalRecords: rawData.length,
//         measurements: new Set(),
//         timeRange: {
//           start: null,
//           end: null,
//         },
//       },
//     };

//     rawData.forEach((row) => {
//       const measurement = row._measurement;
//       const field = row._field;
//       const time = new Date(row._time);

//       // Group by measurement
//       if (!processed.byMeasurement[measurement]) {
//         processed.byMeasurement[measurement] = [];
//       }
//       processed.byMeasurement[measurement].push(row);

//       // Group by field
//       if (!processed.byField[field]) {
//         processed.byField[field] = [];
//       }
//       processed.byField[field].push(row);

//       // Track time range
//       if (!processed.stats.timeRange.start || time < processed.stats.timeRange.start) {
//         processed.stats.timeRange.start = time;
//       }
//       if (!processed.stats.timeRange.end || time > processed.stats.timeRange.end) {
//         processed.stats.timeRange.end = time;
//       }

//       // Track measurements
//       processed.stats.measurements.add(measurement);

//       // Keep latest value for each measurement/field combination
//       const key = `${measurement}.${field}`;
//       if (!processed.latest[key] || time > new Date(processed.latest[key]._time)) {
//         processed.latest[key] = row;
//       }
//     });

//     // Convert Set to Array for measurements
//     processed.stats.measurements = Array.from(processed.stats.measurements);

//     console.log("Data processed successfully:", {
//       measurements: processed.stats.measurements,
//       totalRecords: processed.stats.totalRecords,
//       timeRange: processed.stats.timeRange
//     });

//     return processed;
//   }, []);

//   // Calculate statistics
//   const calculateStats = useCallback((processedData) => {
//     const stats = {
//       cpu: { current: 0, avg: 0, max: 0, trend: 0 },
//       memory: { current: 0, avg: 0, max: 0, trend: 0 },
//       interfaces: { total: 0, active: 0, inactive: 0, healthPercent: 0 },
//       arp: { total: 0, dynamic: 0, static: 0 },
//       network: { totalTraffic: 0, activeConnections: 0 },
//     };

//     // CPU Statistics
//     const cpuData = processedData.byMeasurement["dell_cpu"] || [];
//     const cpuUtil = cpuData.filter((item) => item._field === "cpu-util-1min");
//     if (cpuUtil.length > 0) {
//       const values = cpuUtil.map((item) => item._value / 100);
//       stats.cpu.current = values[values.length - 1] || 0;
//       stats.cpu.avg = values.reduce((a, b) => a + b, 0) / values.length;
//       stats.cpu.max = Math.max(...values);

//       if (values.length > 1) {
//         stats.cpu.trend = ((values[values.length - 1] - values[values.length - 2]) / values[values.length - 2]) * 100;
//       }
//     }

//     // Memory Statistics
//     const memData = processedData.byMeasurement["dell_mem"] || [];
//     const memUsage = memData.filter((item) => item._field === "mem-usage");
//     if (memUsage.length > 0) {
//       const values = memUsage.map((item) => item._value / 1024);
//       stats.memory.current = values[values.length - 1] || 0;
//       stats.memory.avg = values.reduce((a, b) => a + b, 0) / values.length;
//       stats.memory.max = Math.max(...values);

//       if (values.length > 1) {
//         stats.memory.trend = ((values[values.length - 1] - values[values.length - 2]) / values[values.length - 2]) * 100;
//       }
//     }

//     // Interface Statistics
//     const interfaceData = processedData.byMeasurement["dell_interface_status"] || [];
//     stats.interfaces.total = interfaceData.length;
//     stats.interfaces.active = interfaceData.filter((item) => item._value === "up").length;
//     stats.interfaces.inactive = stats.interfaces.total - stats.interfaces.active;
//     stats.interfaces.healthPercent = stats.interfaces.total > 0 ? (stats.interfaces.active / stats.interfaces.total) * 100 : 0;

//     // ARP Statistics
//     const arpData = processedData.byMeasurement["dell_arp"] || [];
//     stats.arp.total = arpData.length;
//     stats.arp.dynamic = arpData.filter((item) => item.state === "dynamic").length;
//     stats.arp.static = stats.arp.total - stats.arp.dynamic;

//     return stats;
//   }, []);

//   // Main fetch function - REAL API ONLY
//   const fetchData = useCallback(async () => {
//     if (measurements.length === 0) {
//       console.warn("No measurements specified, skipping fetch");
//       return;
//     }

//     if (!queryApi) {
//       console.error("QueryApi not initialized");
//       setError(new Error("InfluxDB client not initialized"));
//       setConnectionStatus("error");
//       return;
//     }

//     // Create a unique key for this fetch to prevent duplicate calls
//     const fetchKey = `${timeRange}-${JSON.stringify(measurements)}-${JSON.stringify(filters)}`;
    
//     // If we're already fetching the same data, skip
//     if (lastFetchParams.current === fetchKey && isLoading) {
//       console.log("Skipping duplicate fetch request");
//       return;
//     }

//     // Cancel any existing request
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }

//     lastFetchParams.current = fetchKey;
//     setIsLoading(true);
//     setError(null);
//     setConnectionStatus("connecting");

//     console.log("Starting InfluxDB query with parameters:", {
//       timeRange,
//       measurements,
//       filters
//     });

//     try {
//       const fluxQuery = buildFluxQuery();

//       if (!fluxQuery.trim()) {
//         console.warn("Empty Flux query generated");
//         setIsLoading(false);
//         setConnectionStatus("disconnected");
//         return;
//       }

//       const rows = [];
//       let queryError = null;

//       // Execute the query
//       await new Promise((resolve, reject) => {
//         console.log("Executing Flux query...");
        
//         queryApi.queryRows(fluxQuery, {
//           next(row, tableMeta) {
//             try {
//               const record = tableMeta.toObject(row);
//               rows.push(record);
//             } catch (err) {
//               console.error("Error processing row:", err);
//             }
//           },
//           error(err) {
//             console.error("InfluxDB query error:", err);
//             queryError = err;
//             reject(err);
//           },
//           complete() {
//             console.log("Query completed successfully, rows received:", rows.length);
//             resolve(rows);
//           },
//         });
//       });

//       if (queryError) {
//         throw queryError;
//       }

//       // Process the data
//       const processed = processData(rows);
//       const calculatedStats = calculateStats(processed);

//       // Update state
//       setData(rows);
//       setProcessedData(processed);
//       setStats(calculatedStats);
//       setLastUpdate(new Date());
//       setConnectionStatus(rows.length > 0 ? "connected" : "connected-no-data");

//       console.log("Data fetch completed successfully:", {
//         totalRecords: rows.length,
//         measurements: processed.stats?.measurements || [],
//         timeRange: processed.stats?.timeRange
//       });

//     } catch (err) {
//       console.error("InfluxDB query failed:", err);
//       setError(err);
//       setConnectionStatus("error");
      
//       // Provide more specific error information
//       if (err.message.includes("unauthorized")) {
//         setError(new Error("InfluxDB authentication failed. Please check your token."));
//       } else if (err.message.includes("not found")) {
//         setError(new Error(`InfluxDB bucket '${bucket}' not found. Please check your configuration.`));
//       } else if (err.message.includes("connection")) {
//         setError(new Error(`Cannot connect to InfluxDB at ${url}. Please check the URL and network connectivity.`));
//       }
//     } finally {
//       setIsLoading(false);
//       abortControllerRef.current = null;
//     }
//   }, [timeRange, measurements, JSON.stringify(filters), queryApi, buildFluxQuery, processData, calculateStats]);

//   // Initial fetch effect
//   useEffect(() => {
//     if (!initialFetchDone.current) {
//       initialFetchDone.current = true;
//       console.log("Performing initial data fetch");
//       fetchData();
//     }
//   }, [fetchData]);

//   // Auto-refresh effect
//   useEffect(() => {
//     if (!autoRefresh) return;

//     console.log(`Setting up auto-refresh with interval: ${refreshInterval}ms`);
//     const interval = setInterval(() => {
//       console.log("Auto-refresh triggered");
//       fetchData();
//     }, refreshInterval);

//     return () => {
//       console.log("Cleaning up auto-refresh interval");
//       clearInterval(interval);
//     };
//   }, [autoRefresh, refreshInterval, fetchData]);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//     };
//   }, []);

//   // Manual refresh function
//   const refresh = useCallback(() => {
//     console.log("Manual refresh triggered");
//     lastFetchParams.current = ""; // Reset to force new fetch
//     fetchData();
//   }, [fetchData]);

//   // Utility functions
//   const getDataByMeasurement = useCallback(
//     (measurement) => {
//       return processedData.byMeasurement?.[measurement] || [];
//     },
//     [processedData]
//   );

//   const getLatestValue = useCallback(
//     (measurement, field) => {
//       const key = `${measurement}.${field}`;
//       return processedData.latest?.[key]?._value;
//     },
//     [processedData]
//   );

//   const getFieldData = useCallback(
//     (field) => {
//       return processedData.byField?.[field] || [];
//     },
//     [processedData]
//   );

//   const isOnline = connectionStatus === "connected";
//   const hasError = connectionStatus === "error";

//   return {
//     // Core data
//     data,
//     processedData,
//     isLoading,
//     error,
//     lastUpdate,

//     // Connection status
//     connectionStatus,
//     isOnline,
//     hasError,

//     // Statistics
//     stats,

//     // Utility functions
//     refresh,
//     getDataByMeasurement,
//     getLatestValue,
//     getFieldData,

//     // Metadata
//     measurements: processedData.stats?.measurements || [],
//     totalRecords: processedData.stats?.totalRecords || 0,
//     timeRange: processedData.stats?.timeRange || { start: null, end: null },

//     // Debug information
//     debugInfo: {
//       lastFetchParams: lastFetchParams.current,
//       connectionStatus,
//       queryApi: !!queryApi,
//       measurements
//     }
//   };
// };