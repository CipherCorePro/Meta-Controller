import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface TrainingMonitorProps {
    history: {epoch: number, validationLoss: number}[];
    currentLr: number;
}

const TrainingMonitor: React.FC<TrainingMonitorProps> = ({ history, currentLr }) => {
    const { t } = useLanguage();
    const width = 800;
    const height = 400;
    const padding = 50;

    const data = history;

    if (data.length < 2) {
        return (
            <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 p-4 rounded-lg shadow-lg aspect-video flex items-center justify-center">
                <p className="text-gray-500">{t('chart.waiting')}</p>
            </div>
        );
    }

    const maxLoss = Math.max(...data.map(d => d.validationLoss));
    const minLoss = Math.min(...data.map(d => d.validationLoss));
    const lossRange = maxLoss - minLoss;

    const maxEpoch = data[data.length - 1].epoch;

    const getX = (epoch: number) => {
        if(maxEpoch === 0) return padding;
        return (epoch / maxEpoch) * (width - padding * 2) + padding;
    };

    const getY = (loss: number) => {
        if (lossRange < 1e-9) return height / 2;
        return height - padding - (((loss - minLoss) / lossRange) * (height - padding * 2));
    };

    const pathData = data.map(d => `${getX(d.epoch).toFixed(2)},${getY(d.validationLoss).toFixed(2)}`).join(' L ');
    
    // Create Y-axis labels
    const yAxisLabels = [];
    const numLabels = 5;
    for(let i=0; i<=numLabels; i++){
        const value = minLoss + (lossRange / numLabels) * i;
        yAxisLabels.push({
            value: value.toFixed(3),
            y: getY(value)
        })
    }
    
    // Create X-axis labels
    const xAxisLabels = [];
    const numXLabels = Math.min(maxEpoch, 10);
     for(let i=0; i<=numXLabels; i++){
        const epoch = Math.round((maxEpoch / numXLabels) * i);
        xAxisLabels.push({
            value: epoch,
            x: getX(epoch)
        })
    }


    return (
        <div className="bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 p-4 rounded-lg shadow-lg aspect-video relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-baseline mb-2">
                 <h3 className="text-lg font-semibold text-gray-200">{t('performance.title')}</h3>
                 <div className="font-mono text-sm">
                    <span className="text-gray-400">{t('chart.learning_rate')}: </span>
                    <span className="text-yellow-300 font-bold">{currentLr.toExponential(2)}</span>
                 </div>
            </div>
            <div className="flex-grow">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                    {/* Y-axis */}
                    <text x="10" y={padding - 10} className="text-xs fill-current text-gray-500" textAnchor="start">{t('chart.val_loss')}</text>
                    {yAxisLabels.map(label => (
                        <g key={label.y}>
                            <line x1={padding} y1={label.y} x2={width-padding} y2={label.y} className="stroke-gray-700" strokeWidth="0.5" strokeDasharray="2" />
                            <text x={padding - 5} y={label.y} dy="0.3em" className="text-xs fill-current text-gray-500" textAnchor="end">{label.value}</text>
                        </g>
                    ))}

                     {/* X-axis */}
                     {xAxisLabels.map(label => (
                         <g key={label.x}>
                             <text x={label.x} y={height - padding + 15} className="text-xs fill-current text-gray-500" textAnchor="middle">{label.value}</text>
                         </g>
                     ))}
                     <text x={width / 2} y={height-10} className="text-xs fill-current text-gray-500" textAnchor="middle">{t('controls.step')}</text>

                    {/* Path */}
                    <path d={`M ${pathData}`} className="stroke-cyan-400 fill-none" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

                    {/* Last point circle */}
                    <circle cx={getX(data[data.length - 1].epoch)} cy={getY(data[data.length - 1].validationLoss)} r="4" className="fill-cyan-400" />
                    <circle cx={getX(data[data.length - 1].epoch)} cy={getY(data[data.length - 1].validationLoss)} r="8" className="fill-cyan-400/30 animate-pulse" />

                </svg>
            </div>
        </div>
    );
};

export default TrainingMonitor;
