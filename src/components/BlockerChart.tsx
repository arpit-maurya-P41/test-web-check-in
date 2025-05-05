import { Line } from "@ant-design/charts";

type BlockedUsersCount = {
    date: string;
    blocked: number;
};

const BlockerChart: React.FC<{ blockedUsersCount: BlockedUsersCount[] }> = ({blockedUsersCount}) => {
    
    const config = {
        data: blockedUsersCount,
        xField: (d: any) => new Date(d.date),
        yField: 'blocked',
        style: {
            lineWidth: 2,
        },
        tooltip: { channel: 'y', valueFormatter: (val: number) => `${val}%` },
        axis: {
            y: { title: '↑ Blocked Users (%)' },
            x: { title: 'Date' }
          }
      };
    return (
        <Line {...config} />
    )
}


export default BlockerChart;