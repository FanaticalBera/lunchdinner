import React, { useMemo, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { StepHeader } from '../components/common/StepHeader';
import { ProgressBar } from '../components/common/ProgressBar';
import { BottomActionBar } from '../components/common/BottomActionBar';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { HelperText } from '../components/common/HelperText';
import { Storefront } from '@phosphor-icons/react';
import type { Candidate, CriterionKey, ScoreMatrix } from '../domain/types';

interface Props {
    candidates: Candidate[];
    scores: ScoreMatrix;
    onScoreChange: (candidateId: string, criterion: CriterionKey, score: number) => void;
    onNext: () => void;
    onBack: () => void;
    onHome?: () => void;
}

const TAB_CONFIG: Array<{ key: CriterionKey; label: string }> = [
    { key: 'taste', label: '맛' },
    { key: 'price', label: '가성비' },
    { key: 'distance', label: '거리' },
];

const REQUIRED_SCORE_KEYS: CriterionKey[] = ['taste', 'price', 'distance'];
const EMOJIS = ['😞', '😐', '🙂', '😋', '🤩'];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
};

export const ScoringBoardScreen: React.FC<Props> = ({
    candidates,
    scores,
    onScoreChange,
    onNext,
    onBack,
    onHome,
}) => {
    const [activeTab, setActiveTab] = useState(0);
    const activeCriterion = TAB_CONFIG[activeTab].key;

    const incompleteCandidateCount = useMemo(() => {
        return candidates.filter((candidate) => {
            return REQUIRED_SCORE_KEYS.some((key) => typeof scores[candidate.id]?.[key] !== 'number');
        }).length;
    }, [candidates, scores]);

    const isReadyToCalculate = candidates.length >= 2 && incompleteCandidateCount === 0;

    return (
        <div className="flex-1 flex flex-col bg-[var(--bg-color)] h-[100dvh] relative overflow-hidden">
            <div className="flex-none z-20 bg-[var(--surface-color)] border-b border-[var(--border-color)]">
                <StepHeader title="점수 평가" onBack={onBack} onHome={onHome} />
                <ProgressBar currentStep={3} totalSteps={4} />

                <div className="flex px-4 pt-1 bg-[var(--surface-color)]">
                    {TAB_CONFIG.map((tab, index) => {
                        const isActive = index === activeTab;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(index)}
                                className={`flex-1 text-center py-3 text-sm transition-all relative outline-none ${
                                    isActive
                                        ? 'font-bold text-emerald-500'
                                        : 'font-medium text-[var(--text-helper)] hover:text-[var(--text-secondary)]'
                                }`}
                            >
                                {tab.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-emerald-500 rounded-t-full"
                                        initial={false}
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <motion.div
                className="p-6 flex-1 overflow-y-auto pb-36"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                key={activeTab}
            >
                <div className="mb-6 w-full max-w-sm mx-auto mt-2">
                    <motion.h2 variants={itemVariants} className="text-2xl font-display font-semibold text-[var(--text-primary)] tracking-tight leading-snug mb-2">
                        직관적으로 선택하고
                        <br />
                        빠르게 결정해요
                    </motion.h2>
                    <motion.div variants={itemVariants}>
                        <HelperText message={`현재 [${TAB_CONFIG[activeTab].label}] 기준으로 점수 평가 중입니다.`} />
                    </motion.div>
                </div>

                <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
                    {candidates.map((candidate) => {
                        const selectedScore = scores[candidate.id]?.[activeCriterion];

                        return (
                            <motion.div
                                key={candidate.id}
                                variants={itemVariants}
                                className="bg-[var(--surface-color)] p-5 rounded-3xl shadow-[var(--shadow-sm)] border border-[var(--border-color)] flex flex-col gap-5 group hover:shadow-[var(--shadow-md)] transition-shadow"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 bg-slate-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-inner border border-[var(--border-color)]">
                                        {candidate.icon ? (
                                            <span className="text-xl">{candidate.icon}</span>
                                        ) : (
                                            <Storefront weight="duotone" size={22} className="text-[var(--text-secondary)]" />
                                        )}
                                    </div>
                                    <h3 className="text-base font-bold text-[var(--text-primary)]">{candidate.name}</h3>
                                </div>

                                <div className="flex justify-between px-3 items-center bg-slate-50 dark:bg-zinc-800/50 py-3.5 rounded-2xl border border-[var(--border-color)]">
                                    {EMOJIS.map((emoji, index) => {
                                        const score = index + 1;
                                        const isSelected = selectedScore === score;

                                        return (
                                            <motion.button
                                                key={emoji}
                                                onClick={() => onScoreChange(candidate.id, activeCriterion, score)}
                                                whileTap={{ scale: 0.85 }}
                                                className={`text-3xl transition-all relative outline-none p-1 ${
                                                    isSelected
                                                        ? 'scale-125 hover:scale-125 grayscale-0 z-10 drop-shadow-md'
                                                        : 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-110'
                                                }`}
                                                aria-label={`${candidate.name} ${TAB_CONFIG[activeTab].label} ${score}점`}
                                            >
                                                {emoji}
                                                {isSelected && (
                                                    <motion.div
                                                        layoutId={`${candidate.id}-${activeCriterion}-emoji`}
                                                        className="absolute -inset-1.5 bg-emerald-500/15 rounded-full -z-10"
                                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                                    />
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            <BottomActionBar>
                <div className="w-full flex flex-col gap-2">
                    {!isReadyToCalculate && (
                        <HelperText
                            message={
                                candidates.length < 2
                                    ? '후보를 최소 2개 이상 입력해 주세요.'
                                    : `아직 ${incompleteCandidateCount}개 후보의 점수가 덜 입력됐어요.`
                            }
                        />
                    )}
                    <PrimaryButton onClick={onNext} className="w-full" disabled={!isReadyToCalculate}>
                        결과 계산하기
                    </PrimaryButton>
                </div>
            </BottomActionBar>
        </div>
    );
};
