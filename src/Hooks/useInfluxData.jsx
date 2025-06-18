import React, { useState, useEffect, useMemo } from "react";
import { InfluxDB } from "@influxdata/influxdb-client";
// import TelemetryJSON from "../Helpers/telemetry.json";

const token =
  "5waQ14YcyWWitL-F13MNRD9o5Vi4aV4yORO4FNEymILg8b3J34lI-QeshCckTrBT4hRYo0CdhrUUNfamm_cDzw==";
const org = "Cntrs";
const bucket = "dell_device";
const url = "http://172.27.1.75:8086";

const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

export const useInfluxData = (timeRange = "7d", measurementTypes = []) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
  }, [JSON.stringify(measurementTypes)]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const fluxQuery = `
          // Query for dell_arp_entry
          arp_entries = from(bucket: "${bucket}")
            |> range(start: -${timeRange})
            |> filter(fn: (r) => r._measurement == "dell_arp_entry")
            |> group(columns: ["addr", "intf-name"])
            |> last()

          // Query for dell_interface
          interface_status = from(bucket: "${bucket}")
            |> range(start: -${timeRange})
            |> filter(fn: (r) => r._measurement == "dell_interface")
            |> filter(fn: (r) => r._field == "admin_status")  
            |> group(columns: ["interface"])
            |> last()
            
          //   // Query for dell_routing_table
          routing_table_entries = from(bucket: "${bucket}")
            |> range(start: -${timeRange})
            |> filter(fn: (r) => r._measurement == "dell_routing_table")
            |> filter(fn: (r) => r._field == "last-updated")  
            |> group(columns: ["source-protocol"])
            |> last()  
           
            // Query for all other measurements
          other_measurements = from(bucket: "${bucket}")
            |> range(start: -${timeRange})
            |> filter(fn: (r) => contains(value: r._measurement, set: ${JSON.stringify(
              measurements.filter(
                (m) =>
                  m !== "dell_arp_entry" &&
                  m !== "dell_interface" &&
                  m !== "dell_routing_table"
              )
            )}))
          
          // Combine both results
          union(tables: [arp_entries, interface_status, routing_table_entries, other_measurements])
        `;

        const rows = [];
        await queryApi.queryRows(fluxQuery, {
          next(row, tableMeta) {
            const o = tableMeta.toObject(row);
            rows.push(o);
          },
          error(error) {
            setError(error);
            console.error("QUERY FAILED", {
              message: error.message,
              stack: error.stack,
              name: error.name,
            });
          },
          complete() {
            console.log("success_rows", rows);

            setData(rows);
            setIsLoading(false);
          },
        });
      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange, measurements]);


  return {
    data,
    isLoading,
    error,
  };
};
