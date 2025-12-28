import React from 'react';
import { StatMetric } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  metric: StatMetric;
}

const StatCard: React.FC<Props> = ({ metric }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{metric.label}</p>
          <h3 className="text-2xl font-bold text-slate-900">{metric.value}</h3>
        </div>
        <div className={`p-2 rounded-lg bg-blue-50 text-accent`}>
          {metric.icon}
        </div>
      </div>
      
      {metric.change && (
        <div className="mt-4 flex items-center text-sm">
          {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500 mr-1" />}
          {metric.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500 mr-1" />}
          {metric.trend === 'neutral' && <Minus className="w-4 h-4 text-slate-400 mr-1" />}
          
          <span className={`font-medium ${
            metric.trend === 'up' ? 'text-green-600' : 
            metric.trend === 'down' ? 'text-red-600' : 'text-slate-500'
          }`}>
            {metric.change}
          </span>
          <span className="text-slate-400 ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;