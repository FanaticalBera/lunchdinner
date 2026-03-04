import React from 'react';
import { motion } from 'framer-motion';
import { StepHeader } from '../components/common/StepHeader';
import { Lightning, Scales, Shuffle } from '@phosphor-icons/react';

interface FlowSelectScreenProps {
    onSelectFlow: (flow: 'quick' | 'compare' | 'random') => void;
    onBack: () => void;
    onHome?: () => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.05,
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    show: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100, damping: 20 }
    }
};

export const FlowSelectScreen: React.FC<FlowSelectScreenProps> = ({ onSelectFlow, onBack, onHome }) => {
    return (
        <div className="flex flex-col w-full min-h-[100dvh] bg-[var(--bg-color)]">
            <div className="flex-none sticky top-0 z-20 liquid-glass border-b-0">
                <StepHeader title="결정 방식 선택" onBack={onBack} onHome={onHome} />
            </div>

            <motion.div
                className="flex-1 px-6 pb-12 w-full max-w-md mx-auto flex flex-col justify-center"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <motion.div variants={itemVariants} className="mb-8 w-full">
                    <h2 className="text-2xl font-display font-semibold text-[var(--text-primary)] mb-2 tracking-tight">
                        어떻게 고를까요?
                    </h2>
                    <p className="text-[var(--text-secondary)] text-sm">
                        지금 상황에 가장 잘 맞는 방법을 선택해 주세요.
                    </p>
                </motion.div>

                <div className="flex flex-col gap-4 w-full">
                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectFlow('quick')}
                        className="relative overflow-hidden w-full bg-[var(--surface-color)] rounded-3xl p-5 md:p-6 flex flex-col gap-2 border border-[var(--border-color)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-amber-300/50 dark:hover:border-amber-500/30 transition-all duration-300 text-left group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="absolute -top-4 -right-2 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-10 dark:group-hover:opacity-10 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 pointer-events-none">
                            <Lightning weight="fill" size={100} className="text-amber-500" />
                        </div>

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-500/20 group-hover:bg-amber-500 transition-colors duration-300 shadow-sm">
                                <Lightning weight="fill" size={18} className="text-amber-600 dark:text-amber-300 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-[1.1rem] md:text-lg font-display font-semibold text-[var(--text-primary)] tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">
                                취향대로 추천받기
                            </h3>
                        </div>

                        <p className="relative z-10 text-[var(--text-secondary)] text-[0.85rem] md:text-sm leading-relaxed font-medium pl-12">
                            느낌 태그만 골라주면 알아서 결정해 드려요.
                        </p>
                    </motion.button>

                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectFlow('compare')}
                        className="relative overflow-hidden w-full bg-[var(--surface-color)] rounded-3xl p-5 md:p-6 flex flex-col gap-2 border border-[var(--border-color)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-blue-300/50 dark:hover:border-blue-500/30 transition-all duration-300 text-left group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="absolute -top-4 -right-2 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-10 dark:group-hover:opacity-10 transition-all duration-500 group-hover:-rotate-12 group-hover:scale-110 pointer-events-none">
                            <Scales weight="fill" size={100} className="text-blue-500" />
                        </div>

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-500/20 group-hover:bg-blue-500 transition-colors duration-300 shadow-sm">
                                <Scales weight="fill" size={18} className="text-blue-600 dark:text-blue-300 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-[1.1rem] md:text-lg font-display font-semibold text-[var(--text-primary)] tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                직접 비교하기
                            </h3>
                        </div>

                        <p className="relative z-10 text-[var(--text-secondary)] text-[0.85rem] md:text-sm leading-relaxed font-medium pl-12">
                            후보 2개 이상 넣고 스코어로 치열하게 승부!
                        </p>
                    </motion.button>

                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectFlow('random')}
                        className="relative overflow-hidden w-full bg-[var(--surface-color)] rounded-3xl p-5 md:p-6 flex flex-col gap-2 border border-[var(--border-color)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-emerald-300/50 dark:hover:border-emerald-500/30 transition-all duration-300 text-left group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="absolute -top-4 -right-2 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-10 dark:group-hover:opacity-10 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 pointer-events-none">
                            <Shuffle weight="fill" size={100} className="text-emerald-500" />
                        </div>

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors duration-300 shadow-sm">
                                <Shuffle weight="fill" size={18} className="text-emerald-600 dark:text-emerald-300 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-[1.1rem] md:text-lg font-display font-semibold text-[var(--text-primary)] tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                                진짜 아무거나 골라줘
                            </h3>
                        </div>

                        <p className="relative z-10 text-[var(--text-secondary)] text-[0.85rem] md:text-sm leading-relaxed font-medium pl-12">
                            고민도 사치! 100% 랜덤 추첨.
                        </p>
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};
