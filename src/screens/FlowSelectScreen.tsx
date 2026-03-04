import React from 'react';
import { motion } from 'framer-motion';
import { StepHeader } from '../components/common/StepHeader';
import { Lightning, Scales } from '@phosphor-icons/react';

interface FlowSelectScreenProps {
    onSelectFlow: (flow: 'quick' | 'compare') => void;
    onBack: () => void;
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

export const FlowSelectScreen: React.FC<FlowSelectScreenProps> = ({ onSelectFlow, onBack }) => {
    return (
        <div className="flex flex-col w-full min-h-[100dvh] bg-[var(--bg-color)]">
            <div className="flex-none sticky top-0 z-20 liquid-glass border-b-0">
                <StepHeader title="결정 방식 선택" onBack={onBack} />
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
                        whileHover={{ scale: 1.01, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectFlow('quick')}
                        className="w-full bg-[var(--surface-color)] rounded-3xl p-7 flex flex-col items-start border border-[var(--border-color)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:border-amber-400/50 transition-all duration-300 text-left relative overflow-hidden group"
                    >
                        <div className="relative z-10 flex flex-col items-start w-full">
                            <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center mb-5 ring-[1px] ring-[var(--border-color)] group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-[0_8px_16px_rgba(245,158,11,0.3)] transition-all duration-300">
                                <Lightning weight="fill" size={28} className="text-amber-500 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-xl font-display font-semibold text-[var(--text-primary)] mb-2 tracking-wide">
                                빠르게 추천받기
                            </h3>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                끌리는 느낌표 태그 몇 개만 고르세요.<br />복잡한 고민 없이 알아서 결정해 드립니다.
                            </p>
                        </div>
                    </motion.button>

                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.01, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectFlow('compare')}
                        className="w-full bg-[var(--surface-color)] rounded-3xl p-7 flex flex-col items-start border border-[var(--border-color)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] hover:border-blue-400/50 transition-all duration-300 text-left relative overflow-hidden group"
                    >
                        <div className="relative z-10 flex flex-col items-start w-full">
                            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mb-5 ring-[1px] ring-[var(--border-color)] group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-[0_8px_16px_rgba(59,130,246,0.3)] transition-all duration-300">
                                <Scales weight="fill" size={28} className="text-blue-500 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-xl font-display font-semibold text-[var(--text-primary)] mb-2 tracking-wide">
                                직접 비교하기
                            </h3>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                마음속에 후보가 2개 이상 있나요?<br />맛, 가격 등의 스코어로 치열하게 승부합니다.
                            </p>
                        </div>
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};
