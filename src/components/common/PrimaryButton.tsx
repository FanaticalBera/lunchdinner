import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface PrimaryButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    children,
    variant = 'primary',
    className = '',
    ...props
}) => {
    // Premium tactile feedback and shadows
    const baseStyles = "relative inline-flex items-center justify-center px-6 py-4 text-lg font-bold rounded-full w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none overflow-hidden group tracking-wide";

    const variants = {
        primary: "bg-emerald-500 text-white shadow-[0_8px_16px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_24px_rgba(16,185,129,0.4)] border border-emerald-400/50",
        secondary: "bg-[var(--surface-color)] text-[var(--text-primary)] border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:border-white/10 dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)]",
        outline: "bg-transparent border-2 border-slate-200/60 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-zinc-400 dark:hover:bg-zinc-800/50",
        danger: "bg-rose-50 border border-rose-200 text-rose-600 shadow-[0_4px_12px_rgba(244,63,94,0.1)] hover:bg-rose-500 hover:text-white transition-colors dark:bg-rose-500/10 dark:border-rose-500/20 dark:hover:bg-rose-500"
    };

    return (
        <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            <span className="relative z-10">{children}</span>
            {/* Subtle highlight overlay */}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 pointer-events-none" />
        </motion.button>
    );
};
