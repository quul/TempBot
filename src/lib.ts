import "dotenv/config";

type Metric =
  | { resultType: "vector"; result: VectorValue[] }
  | { resultType: "matrix"; result: MatrixValue[] };
type MetricMeta = {
  __name__: string;
  id: string;
  instance: string;
  job: string;
  room: string;
  type: string;
  name: string;
  node: string;
  unit: string;
};
type VectorValue = {
  metric: MetricMeta;
  value: [number, string | number]; // Timestamp and value
};
type MatrixValue = {
  metric: MetricMeta;
  values: [number, string | number][]; // Timestamp and value
};

type VectorResult = {
  [room: string]: {
    [type: string]: [number, string | number];
  };
}

export type MatrixResult = {
  [room: string]: {
    [type: string]: [number, string | number][];
  };
}

async function getMetric(
  metricName: string,
  time?: string
): Promise<Metric | null> {
  const prometheusUrl = new URL(
    "/api/v1/query",
    process.env.PROMETHEUS_BASE_DOMAIN
  ).toString();
  const params = new URLSearchParams({ query: metricName });
  if (time) params.append("time", time);
  const url = `${prometheusUrl}?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "success" && data.data.result.length > 0) {
      return data.data as Metric;
    } else {
      console.warn(`No data found for metric: ${metricName}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching metric ${metricName}:`, error);
    return null;
  }
}

export const getLatestTemperature = async () => {
  const metricName = "esphome_sensor_value";
  const metric = await getMetric(metricName);
  if (!metric) return null;
  if (metric.resultType === "matrix") return null;
  const result = metric.result.reduce(
    (acc, item) => {
      const room = item.metric.room;
      const type = item.metric.type;
      if (!room || !type) return acc;
      const value = item.value;
      if (!acc[room]) acc[room] = {};
      if (!acc[room][type]) acc[room][type] = value;
      return acc;
    },
    {} as VectorResult
  );
  return result;
};

async function getRangeMetric(
  startTime?: number,
  endTime?: number,
  timePeriod?: string,
  step?: string
): Promise<Metric | null> {
  if ((!startTime || !endTime) && timePeriod) {
    // Time period will be like: 1h, 3m, 5s, etc.
    const time = timePeriod.match(/^(\d+)([a-z]+)$/);
    const periodMap = new Map([
      ["s", 1],
      ["m", 60],
      ["h", 3600],
      ["d", 86400],
      ["y", 31536000],
    ]);
    startTime =
      Math.floor(new Date().getTime() / 1000) -
      parseInt(time![1]) * periodMap.get(time![2])!;
    endTime = Math.floor(new Date().getTime() / 1000);
  }
  const prometheusUrl = new URL(
    "/api/v1/query_range",
    process.env.PROMETHEUS_BASE_DOMAIN
  ).toString();
  const params = new URLSearchParams({
    query: "esphome_sensor_value",
    start: startTime!.toString(),
    end: endTime!.toString(),
    step: step || "5m",
  });
  const url = `${prometheusUrl}?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "success" && data.data.result.length > 0) {
      return data.data;
    } else {
      console.warn("No range data found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching range metric:", error);
    return null;
  }
}

export async function getTemperatureLastDay() {
  const startTime = Math.floor(new Date().getTime() / 1000) - 86400;
  const endTime = Math.floor(new Date().getTime() / 1000);
  const metric = await getRangeMetric(startTime, endTime);
  if (metric?.resultType === "vector") return null;
  const result = metric?.result.reduce(
    (acc, item) => {
      const type = item.metric.type;
      const room = item.metric.room;
      if (!room || !type) return acc;
      const values = item.values;
      if (!acc[room]) acc[room] = {};
      if (!acc[room][type]) acc[room][type] = values;
      return acc;
    },
    {} as MatrixResult
  );
  return result;
}
