import React from 'react';
import { Line } from "@ant-design/charts";

type PercentageDataPoint = {
  date: string;
  percentage: number;
};

type Props = {
  title: string;
  data: PercentageDataPoint[];
  yLabel?: string;
  color?: string;
};

const PercentageLineChart: React.FC<Props> = ({ title, data, yLabel = 'Percentage (%)', color }) => {
  const config = {
    data,
    xField: (d: PercentageDataPoint) => new Date(d.date),
    yField: 'percentage',
    lineStyle: {
      lineWidth: 2,
      stroke: color,
    },
    tooltip: {
      channel: 'y',
      valueFormatter: (val: number) => `${val}%`,
    },
    axis: {
      y: { title: yLabel },
      x: { title: 'Date' }
    },
    smooth: true,
    title: {
      visible: true,
      text: title,
    },
  };

  return <Line {...config} />;
};

export default PercentageLineChart;