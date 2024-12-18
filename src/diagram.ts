import * as echarts from "echarts";
import { createCanvas } from "canvas";
import type { MatrixResult } from "./lib";

export enum ChartType {
  Temperature = "temperature",
  Humidity = "humidity",
}

export const generateDiagram = async (data: MatrixResult, type: ChartType) => {
  const title = type === ChartType.Temperature ? "温度" : "湿度";
  const canvas = createCanvas(1920, 1080);
  // It is required to do this since @types/echarts is not updated, ref: https://github.com/apache/echarts/issues/16976
  const chart = echarts.init(canvas as unknown as HTMLElement);

  let series: {
    name: string;
    type: "line";
    data: [number, number][];
  }[] = [];
  const rooms = Object.keys(data);
  for (const room of rooms) {
    switch (type) {
      case ChartType.Temperature: {
        series.push({
          name: `${room}`,
          type: "line",
          data: data[room].temperature.map((item) => [
            item[0] * 1000,
            typeof item[1] === "string" ? parseFloat(item[1]) : item[1],
          ]),
        });
        break;
      }
      case ChartType.Humidity: {
        series.push({
          name: `${room}`,
          type: "line",
          data: data[room].humidity.map((item) => [
            item[0] * 1000,
            typeof item[1] === "string" ? parseFloat(item[1]) : item[1],
          ]),
        });
        break;
      }
    }
  }
  const options = {
    title: {
      text: title,
      textStyle: {
        fontSize: 30,
      }
    },
    tooltip: {
      trigger: "axis",
      textStyle: {
        fontSize: 20,
      }
    },
    legend: {
      // data: ["Temperature", "Humidity"],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    toolbox: {
    },
    xAxis: {
      type: "time",
      splitLine: {
        show: false,
      },
      axisLabel: {
        fontSize: 20,
      },
    },
    yAxis:
      type === ChartType.Temperature
        ? {
            type: "value",
            name: "Temperature (°C)",
            axisLabel: {
              fontSize: 20,
            },
          }
        : {
            type: "value",
            name: "Humidity (%)",
            axisLabel: {
              fontSize: 20,
            },
          },
    series,
  } satisfies echarts.EChartsOption;

  chart.setOption(options);
  const buffer = canvas.toBuffer("image/png");
  return buffer;
};
