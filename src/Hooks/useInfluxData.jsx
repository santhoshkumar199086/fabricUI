import React, { useState, useEffect, useMemo } from "react";
import { InfluxDB } from "@influxdata/influxdb-client";

const token =
  "_eVdp7GofG3Nu0yV1OR3m4zk3AV29MomQ2swIXM6HIpbuNE7Sy9asB8sbk1SCoawmxzPa_4TqVEStMdWdokFYw==";
const org = "Cntrs";
const bucket = "dell_device";
const url = "http://172.27.1.75:8086";

const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

export const useInfluxData = (timeRange = "24h", measurementTypes = []) => {
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
  }, [JSON.stringify(measurementTypes)]); // Deep comparison

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // const fluxQuery = `
        //   from(bucket: "${bucket}")
        //     |> range(start: -${timeRange})
        //     |> filter(fn: (r) => contains(value: r._measurement, set: ${JSON.stringify(measurements)}))
        // `;

        //  const fluxQuery = `
        //   from(bucket: "dell_device")
        //   |> range(start: -7d)
        //   |> filter(fn: (r) => r._measurement == "dell_arp_entry")
        //   |> group(columns: ["addr", "intf-name"])
        //   |> last()
        // `;

        const fluxQuery = `
          // Query for dell_arp_entry with special processing
          arp_entries = from(bucket: "${bucket}")
            |> range(start: -${timeRange})
            |> filter(fn: (r) => r._measurement == "dell_arp_entry")
            |> group(columns: ["addr", "intf-name"])
            |> last()

          // // Query for dell_interface with special processing
          // interface_status = from(bucket: "${bucket}")
          //   |> range(start: -${timeRange})
          //   |> filter(fn: (r) => r._measurement == "dell_interface")
          //   |> filter(fn: (r) => r._field == "admin_status")  
          //   |> group(columns: ["interface"])
          //   |> last()  
           
            // Query for all other measurements
          other_measurements = from(bucket: "${bucket}")
            |> range(start: -${timeRange})
            |> filter(fn: (r) => contains(value: r._measurement, set: ${JSON.stringify(
              measurements.filter(
                (m) => m !== "dell_arp_entry" && m !== "dell_interface"
              )
            )}))
          
          // Combine both results
          union(tables: [arp_entries, other_measurements])
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

  // Return the data as an object with data property
  return {
    data, // The actual data array
    isLoading, // Loading state
    error, // Error state
  };
};
