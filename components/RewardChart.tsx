
import React from 'react';
import { RewardDataPoint } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface RewardChartProps {
    data: RewardDataPoint[];
}

const RewardChart: React.FC<RewardChartProps> = ({ data }) => {
    const { t } = useLanguage();
    const width = 300;
    const height = 100;
    const padding = 10;

    if (data.length < 2) {
        return (
            <div className="h-[120px] flex items-center justify-center text-gray-500 text-sm">
                {t('chart.waiting')}
            </div>
        );
    }

    const maxReward = Math.max(...data.map(d => d.avgReward), 0);
    const minReward = Math.min(...data.map(d => d.avgReward), -1);
    const rewardRange = maxReward - minReward;

    const maxSteps = data[data.length - 1].step;
    const minSteps = data[0].step;
    const stepRange = maxSteps - minSteps;

    const getX = (step: number) => {
        if(stepRange === 0) return padding;
        return ((step - minSteps) / stepRange) * (width - padding * 2) + padding;
    };

    const getY = (reward: number) => {
        if (rewardRange === 0) return height / 2;
        return height - (((reward - minReward) / rewardRange) * (height - padding * 2) + padding);
    };

    const pathData = data.map(d => `${getX(d.step).toFixed(2)},${getY(d.avgReward).toFixed(2)}`).join(' L ');
    
    return (
        <div className="w-full h-[120px] flex items-center justify-center">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                <text x={padding} y={padding} dy="0.3em" className="text-xs fill-current text-gray-400">{t('chart.avg_reward')}</text>
                
                {/* Zero line */}
                <line 
                    x1={padding} y1={getY(0)} 
                    x2={width - padding} y2={getY(0)} 
                    className="stroke-gray-600" strokeWidth="0.5" strokeDasharray="2" />

                {/* Path */}
                <path d={`M ${pathData}`} className="stroke-cyan-400 fill-none" strokeWidth="1.5" />

                {/* Last point circle */}
                <circle cx={getX(data[data.length - 1].step)} cy={getY(data[data.length - 1].avgReward)} r="2" className="fill-cyan-400" />
            </svg>
        </div>
    );
};

export default RewardChart;
