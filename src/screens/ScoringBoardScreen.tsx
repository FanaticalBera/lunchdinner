import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepHeader } from '../components/common/StepHeader';
import { ProgressBar } from '../components/common/ProgressBar';
import { BottomActionBar } from '../components/common/BottomActionBar';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { HelperText } from '../components/common/HelperText';
import { Storefront } from '@phosphor-icons/react';

interface Props {
    onNext: () => void;
    onBack: () => void;
}

const TABS = ['맛', '가성비', '거리', '대기'];
const EMOJIS = ['😡', '😕', '😐', '🙂', '😍'];

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

export const ScoringBoardScreen: React.FC<Props> = ({ onNext, onBack }) => {
    const [activeTab, setActiveTab] = useState(0);

    // Dummy scores state for the MVP
    const [scores, setScores] = useState<Record<string, number>>({
        'c1': 2,
        'c2': 2
    });

    const setScore = (id: string, index: number) => {
        setScores(prev => ({ ...prev, [id]: index }));
    };

    return (
        <div className="flex-1 flex flex-col bg-[var(--bg-color)] h-[100dvh] relative overflow-hidden">
            {/* 고정 헤더 & 탭 영역 */}
            <div className="flex-none z-20 bg-[var(--surface-color)] border-b border-[var(--border-color)]">
                <StepHeader title="점수 평가" onBack={onBack} />
                <ProgressBar currentStep={3} totalSteps={4} />

                <div className="flex px-4 pt-1 bg-[var(--surface-color)]">
                    {TABS.map((tab, i) => {
                        const isActive = i === activeTab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(i)}
                                className={`flex-1 text-center py-3 text-sm transition-all relative outline-none ${isActive ? 'font-bold text-emerald-500' : 'font-medium text-[var(--text-helper)] hover:text-[var(--text-secondary)]'
                                    }`}
                            >
                                {tab}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-emerald-500 rounded-t-full"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 스크롤 가능한 본문 영역 */}
            <motion.div
                className="p-6 flex-1 overflow-y-auto pb-36"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                key={activeTab}
            >
                <div className="mb-6 w-full max-w-sm mx-auto mt-2">
                    <motion.h2 variants={itemVariants} className="text-2xl font-display font-semibold text-[var(--text-primary)] tracking-tight leading-snug mb-2">
                        당신의 직감을<br />믿고 골라주세요
                    </motion.h2>
                    <motion.div variants={itemVariants}>
                        <HelperText message={`현재 [${TABS[activeTab]}] 기준을 평가 중입니다.`} />
                    </motion.div>
                </div>

                <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
                    {/* Score Card 1 */}
                    <motion.div variants={itemVariants} className="bg-[var(--surface-color)] p-5 rounded-3xl shadow-[var(--shadow-sm)] border border-[var(--border-color)] flex flex-col gap-5 group hover:shadow-[var(--shadow-md)] transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-slate-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-inner border border-[var(--border-color)]">
                                <Storefront weight="duotone" size={22} className="text-[var(--text-secondary)]" />
                            </div>
                            <h3 className="text-base font-bold text-[var(--text-primary)]">김치찌개전문점</h3>
                        </div>

                        <div className="flex justify-between px-3 items-center bg-slate-50 dark:bg-zinc-800/50 py-3.5 rounded-2xl border border-[var(--border-color)]">
                            {EMOJIS.map((emoji, idx) => {
                                const isSelected = scores['c1'] === idx;
                                return (
                                    <motion.button
                                        key={idx}
                                        onClick={() => setScore('c1', idx)}
                                        whileTap={{ scale: 0.85 }}
                                        className={`text-3xl transition-all relative outline-none p-1 ${isSelected ? 'scale-125 hover:scale-125 grayscale-0 z-10 drop-shadow-md' : 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-110'}`}
                                    >
                                        {emoji}
                                        {isSelected && (
                                            <motion.div
                                                layoutId={`c1-emoji`}
                                                className="absolute -inset-1.5 bg-emerald-500/15 rounded-full -z-10"
                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Score Card 2 */}
                    <motion.div variants={itemVariants} className="bg-[var(--surface-color)] p-5 rounded-3xl shadow-[var(--shadow-sm)] border border-[var(--border-color)] flex flex-col gap-5 group hover:shadow-[var(--shadow-md)] transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-slate-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-inner border border-[var(--border-color)]">
                                <Storefront weight="duotone" size={22} className="text-[var(--text-secondary)]" />
                            </div>
                            <h3 className="text-base font-bold text-[var(--text-primary)]">옆집 돈까스</h3>
                        </div>

                        <div className="flex justify-between px-3 items-center bg-slate-50 dark:bg-zinc-800/50 py-3.5 rounded-2xl border border-[var(--border-color)]">
                            {EMOJIS.map((emoji, idx) => {
                                const isSelected = scores['c2'] === idx;
                                return (
                                    <motion.button
                                        key={idx}
                                        onClick={() => setScore('c2', idx)}
                                        whileTap={{ scale: 0.85 }}
                                        className={`text-3xl transition-all relative outline-none p-1 ${isSelected ? 'scale-125 hover:scale-125 grayscale-0 z-10 drop-shadow-md' : 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-110'}`}
                                    >
                                        {emoji}
                                        {isSelected && (
                                            <motion.div
                                                layoutId={`c2-emoji`}
                                                className="absolute -inset-1.5 bg-emerald-500/15 rounded-full -z-10"
                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <BottomActionBar>
                <PrimaryButton onClick={onNext} className="w-full">
                    결과 계산하기 ➔
                </PrimaryButton>
            </BottomActionBar>
        </div>
    );
};
