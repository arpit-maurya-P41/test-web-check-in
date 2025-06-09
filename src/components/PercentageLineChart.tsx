import React from 'react';
import { Line } from "@ant-design/charts";
import { LineChartProps, PercentageDataPoint } from '@/type/PropTypes';

const PercentageLineChart: React.FC<LineChartProps> = ({ title, data, yLabel = 'Percentage (%)', color }) => {
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