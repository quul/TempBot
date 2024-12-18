import "dotenv/config";

type Metric = {
  resultType: "vector";
  result: SensorValue[];
};
type SensorValue = {
  metric: {
    __name__: string;
    id: string;
    instance: string;
    job: string;
    name: string;
    node: string;
    unit: string;
  };
  value: [number, string | number]; // Timestamp and value
};
async function getLatestMetric(metricName: string): Promise<Metric | null> {
  const prometheusUrl = new URL("/api/v1/query", process.env.PROMETHEUS_BASE_DOMAIN).toString();

  try {
    const response = await fetch(
      `${prometheusUrl}?query=${encodeURIComponent(metricName)}`
    );
    const data = await response.json();

    if (data.status === "success" && data.data.result.length > 0) {
      return data.data;
    } else {
      console.warn(`No data found for metric: ${metricName}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching metric ${metricName}:`, error);
    return null;
  }
}

export const getTemperature = async () => {
  const metricName = "esphome_sensor_value";
  const metric = await getLatestMetric(metricName);
  const result = metric?.result.reduce(
    (acc, item) => {
      const id = item.metric.id;
      const value = parseFloat(item.value[1] as string);
      acc[id] = value;
      return acc;
    },
    { timestamp: metric?.result[0].value[0] } as Record<string, number>
  );
  if (result) {
    return result;
  } else {
    return null;
  }
};
