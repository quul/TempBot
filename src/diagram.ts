import * as echarts from "echarts";
import { createCanvas } from "canvas";
import type { MatrixResult } from "./lib";

export enum ChartType {
  Temperature = "temperature",
  Humidity = "humidity",
}

export const generateDiagram = async (data: MatrixResult, type: ChartType) => {
  const title = type === ChartType.Temperature ? "Temperature" : "Humidity";
  const canvas = createCanvas(1920, 1080);
  const chart = echarts.init(canvas as unknown as HTMLElement);

  let series: echarts.SeriesOption[] = [];
  const rooms = Object.keys(data);
  for (const room of rooms) {
    series.push({
      name: room,
      type: "line",
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      data: data[room][type].map((item) => [
        item[0] * 1000,
        typeof item[1] === "string" ? parseFloat(item[1]) : item[1],
      ]),
    });
  }

  const options: echarts.EChartsOption = {
    backgroundColor: '#f4f4f4',
    title: {
      text: title,
      textStyle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#333'
      },
      left: 'center',
      top: 20
    },
    tooltip: {
      trigger: "axis",
      textStyle: { fontSize: 16 },
      axisPointer: {
        type: 'cross',
        label: { backgroundColor: '#6a7985' }
      }
    },
    legend: {
      data: rooms,
      top: 70,
      textStyle: { fontSize: 16 }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: { title: 'Save' }
      },
      right: 20,
      top: 20
    },
    xAxis: {
      type: "time",
      splitLine: { show: false },
      axisLabel: {
        fontSize: 16,
        formatter: (value: number) => {
          const date = new Date(value);
          return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
      }
    },
    yAxis: {
      type: "value",
      name: type === ChartType.Temperature ? "Temperature (°C)" : "Humidity (%)",
      nameTextStyle: { fontSize: 18, padding: [0, 0, 0, 50] },
      axisLabel: { fontSize: 16 },
      splitLine: { lineStyle: { type: 'dashed' } }
    },
    series,
    color: ['#ff7f50', '#87cefa', '#da70d6', '#32cd32', '#6495ed', '#ff69b4', '#ba55d3', '#cd5c5c', '#ffa500', '#40e0d0'],
    animation: true
  };

  chart.setOption(options);
  const buffer = canvas.toBuffer("image/png");
  return buffer;
};
