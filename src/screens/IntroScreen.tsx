import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Sparkle, Shuffle } from '@phosphor-icons/react';

interface IntroScreenProps {
    onSelectMode: (mode: 'lunch' | 'dinner') => void;
    onRandomPick: () => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100, damping: 20 }
    }
};

export const IntroScreen: React.FC<IntroScreenProps> = ({ onSelectMode, onRandomPick }) => {
    return (
        <motion.div
            className="flex flex-col items-center justify-center w-full min-h-[100dvh] relative overflow-hidden bg-[var(--bg-color)] px-6 py-12 gap-12"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {/* Minimal Decorative Element */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4" />

            <motion.div variants={itemVariants} className="max-w-md mx-auto w-full z-10 text-center flex flex-col items-center">
                <div className="flex items-center justify-center gap-2 mb-5 text-[var(--text-secondary)]">
                    <Sparkle weight="fill" className="text-emerald-500" size={18} />
                    <span className="font-medium tracking-wide text-xs uppercase">Smart Decision Maker</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-display font-semibold text-[var(--text-primary)] leading-[1.1] tracking-tighter mb-3">
                    대신<br />
                    골라줘.
                </h1>

                <p className="text-[var(--text-secondary)] text-base max-w-[260px]">
                    가장 합리적인 방법으로 <br />
                    오늘 당신의 식사 메뉴를 결정합니다.
                </p>
            </motion.div>

            <div className="max-w-md mx-auto w-full z-10 flex flex-col gap-3">
                <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectMode('lunch')}
                    className="w-full bg-[var(--surface-color)] rounded-3xl p-6 flex flex-col items-start justify-center shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] border border-[var(--border-color)] hover:border-emerald-500/30 transition-all duration-300 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-[0_8px_16px_rgba(16,185,129,0.3)] transition-all duration-300">
                            <Sun weight="fill" size={26} />
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <span className="text-xl font-display font-semibold text-[var(--text-primary)] tracking-wide">점심 먹을래</span>
                            <span className="text-[var(--text-secondary)] text-sm mt-0.5">오후를 든든하게 채워줄 한 끼</span>
                        </div>
                    </div>
                </motion.button>

                <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectMode('dinner')}
                    className="w-full bg-[var(--surface-color)] rounded-3xl p-6 flex flex-col items-start justify-center shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] border border-[var(--border-color)] hover:border-indigo-400/50 transition-all duration-300 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center shadow-inner group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-[0_8px_16px_rgba(99,102,241,0.3)] transition-all duration-300">
                            <Moon weight="fill" size={26} />
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <span className="text-xl font-display font-semibold text-[var(--text-primary)] tracking-wide">저녁 먹을래</span>
                            <span className="text-[var(--text-secondary)] text-sm mt-0.5">피로를 녹여줄 완벽한 보상</span>
                        </div>
                    </div>
                </motion.button>

                {/* Random Pick Sub-button */}
                <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onRandomPick}
                    className="flex items-center justify-center gap-2 py-3 text-[var(--text-secondary)] hover:text-emerald-500 transition-colors duration-200"
                >
                    <Shuffle weight="bold" size={16} />
                    <span className="text-sm font-medium">그냥 아무거나 골라줘</span>
                </motion.button>
            </div>
        </motion.div>
    );
};
