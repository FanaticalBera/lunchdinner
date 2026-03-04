import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
    currentStep: number;
    totalSteps?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps = 4 }) => {
    const percentage = Math.max(0, Math.min(100, (currentStep / totalSteps) * 100));

    return (
        <div className="w-full h-1 bg-slate-100 dark:bg-zinc-800 overflow-hidden relative" aria-label={`진행 상황 ${currentStep}/${totalSteps}`}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ type: "spring", stiffness: 60, damping: 15 }}
                className="absolute top-0 left-0 h-full bg-emerald-500 rounded-r-full"
            />
        </div>
    );
};
