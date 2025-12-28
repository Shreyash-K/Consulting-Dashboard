import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Inquiry } from '../types';

interface Props {
  data: Inquiry[];
}

const RecentActivityChart: React.FC<Props> = ({ data }) => {
  // Process data to group by date (last 7 days)
  const chartData = React.useMemo(() => {
    const days = 7;
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const count = data.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate.toDateString() === date.toDateString();
      }).length;

      result.push({ name: dateStr, inquiries: count });
    }
    return result;
  }, [data]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorInquiries" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
          />
          <Area type="monotone" dataKey="inquiries" stroke="#3b82f6" fillOpacity={1} fill="url(#colorInquiries)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RecentActivityChart;