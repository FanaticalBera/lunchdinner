import React from 'react';
import { motion } from 'framer-motion';
import { BottomActionBar } from '../components/common/BottomActionBar';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { MapTrifold, ArrowsClockwise, Crown } from '@phosphor-icons/react';

interface Props {
    onRestart: () => void;
    onReWeight: () => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 30 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

export const ResultScreen: React.FC<Props> = ({ onRestart, onReWeight }) => {
    return (
        <div className="flex-1 flex flex-col bg-[var(--bg-color)] h-[100dvh] relative overflow-hidden">

            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2" />


            <motion.div
                className="flex-1 flex flex-col pt-12 pb-6 px-6 justify-center max-w-sm mx-auto w-full z-10"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <motion.div variants={itemVariants} className="text-center mb-8 w-full">
                    <h2 className="text-3xl font-display font-semibold text-[var(--text-primary)] tracking-tighter leading-tight drop-shadow-sm">
                        치열한 접전 끝에<br />승리한 곳은!
                    </h2>
                </motion.div>

                {/* Winner Card */}
                <motion.div
                    variants={itemVariants}
                    className="relative bg-[var(--surface-color)] rounded-3xl pt-12 pb-7 px-7 text-center shadow-[0_20px_60px_-15px_rgba(16,185,129,0.15)] dark:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.10)] w-full border border-emerald-500/20 dark:border-indigo-500/20 group mt-4"
                >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 dark:via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        {/* Crown */}
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className="absolute -top-12 left-1/2 -translate-x-1/2 text-amber-400 drop-shadow-lg"
                        >
                            <Crown weight="fill" size={56} />
                        </motion.div>

                        <div className="w-24 h-24 bg-emerald-50 dark:bg-indigo-500/10 rounded-3xl flex items-center justify-center text-4xl mb-5 shadow-inner border border-emerald-100 dark:border-indigo-500/20 relative overflow-hidden mt-4">
                            <motion.span
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.5 }}
                            >
                                🍲
                            </motion.span>
                        </div>

                        <h1 className="text-2xl mb-6 font-display font-bold text-[var(--text-primary)] tracking-tight leading-tight">
                            김치찌개전문점
                        </h1>

                        {/* Stats */}
                        <div className="w-full bg-[var(--bg-color)] rounded-2xl p-4 text-sm leading-relaxed text-[var(--text-secondary)] font-medium border border-[var(--border-color)] flex flex-col gap-2.5 text-left shadow-inner">
                            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2.5">
                                <span className="text-[var(--text-helper)]">종합 스코어</span>
                                <strong className="text-emerald-500 dark:text-indigo-400 text-xl font-display font-bold tracking-tight">88점</strong>
                            </div>
                            <div className="flex justify-between items-center pt-0.5">
                                <span className="text-[var(--text-helper)]">맛 평가</span>
                                <strong className="text-[var(--text-primary)] text-sm">압도적 1위</strong>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[var(--text-helper)]">거리</span>
                                <strong className="text-[var(--text-primary)] text-sm">도보 5분 소요</strong>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            <BottomActionBar>
                <div className="flex w-full gap-2.5">
                    <PrimaryButton
                        onClick={onReWeight}
                        className="flex-1 flex items-center justify-center gap-2"
                        variant="secondary"
                    >
                        <MapTrifold weight="fill" size={18} className="text-emerald-500" />
                        <span>지도 보기</span>
                    </PrimaryButton>
                    <PrimaryButton
                        onClick={onRestart}
                        className="flex-1 flex items-center justify-center gap-2"
                        variant="secondary"
                    >
                        <ArrowsClockwise weight="bold" size={18} />
                        <span>처음으로</span>
                    </PrimaryButton>
                </div>
            </BottomActionBar>

            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};
