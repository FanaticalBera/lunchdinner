import React, { useRef } from 'react';
import { motion } from 'framer-motion';

interface VerticalJellySliderProps {
    label: string;
    icon: string;
    value: number; // 0 to 100
    onChange: (val: number) => void;
    color: string;
}

export const VerticalJellySlider: React.FC<VerticalJellySliderProps> = ({ label, icon, value, onChange, color }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleDrag = (_event: unknown, info: { point: { y: number } }) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        // Calculate new percentage based on pointer position relative to container
        const yPos = info.point.y - rect.top;
        let newPercent = 100 - (yPos / rect.height) * 100;
        newPercent = Math.max(0, Math.min(100, newPercent));
        onChange(Math.round(newPercent));
    };

    const handleClick = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const yPos = e.clientY - rect.top;
        let newPercent = 100 - (yPos / rect.height) * 100;
        newPercent = Math.max(0, Math.min(100, newPercent));
        onChange(Math.round(newPercent));
    };

    return (
        <div className="flex flex-col items-center gap-4 w-16 select-none group">
            <div className="text-sm font-semibold text-[var(--text-secondary)] tracking-wide">{label}</div>

            <div
                ref={containerRef}
                className="relative w-14 h-64 bg-[var(--bg-color)] rounded-full cursor-pointer overflow-hidden shadow-inner border border-[var(--border-color)] transition-colors"
                onClick={handleClick}
            >
                {/* Colored Fill */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 rounded-full origin-bottom shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]"
                    style={{ backgroundColor: color }}
                    animate={{ height: `${value}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />

                {/* Draggable overlay to catch events without layout trashing */}
                <motion.div
                    drag="y"
                    dragConstraints={containerRef}
                    dragElastic={0}
                    dragMomentum={false}
                    onDrag={handleDrag}
                    className="absolute inset-0 z-10 w-full h-full touch-none"
                    style={{ touchAction: 'none' }}
                />

                {/* The floating icon thumb */}
                <motion.div
                    className="absolute left-1/2 -translate-x-1/2 w-10 h-10 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-md pointer-events-none z-20 border border-slate-100 dark:border-zinc-700"
                    animate={{ bottom: `calc(${value}% - 20px)` }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                    <span className="text-lg leading-none select-none drop-shadow-sm">{icon}</span>
                </motion.div>
            </div>

            <div className="text-lg font-display font-semibold text-[var(--text-primary)] w-12 text-center">
                {Math.round(value)}<span className="text-sm text-[var(--text-secondary)]">%</span>
            </div>
        </div>
    );
};
