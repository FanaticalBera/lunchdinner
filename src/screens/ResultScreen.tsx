import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { BottomActionBar } from '../components/common/BottomActionBar';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { MapTrifold, ArrowsClockwise, Crown } from '@phosphor-icons/react';
import type { Candidate, Result } from '../domain/types';

interface Props {
    result: Result | null;
    candidates: Candidate[];
    onRestart: () => void;
    onReWeight: () => void;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 30 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

function getWinnerIcon(result: Result | null, candidates: Candidate[]): string {
    if (!result) {
        return '🍽️';
    }

    const winner = candidates.find((candidate) => candidate.id === result.winnerId);
    return winner?.icon ?? '🍽️';
}

export const ResultScreen: React.FC<Props> = ({ result, candidates, onRestart, onReWeight }) => {
    const winnerIcon = getWinnerIcon(result, candidates);
    const tieCount = result
        ? result.ranking.filter((item) => item.score === result.totalScore).length
        : 0;

    return (
        <div className="flex-1 flex flex-col bg-[var(--bg-color)] h-[100dvh] relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2" />

            <motion.div
                className="flex-1 flex flex-col pt-12 pb-6 px-6 justify-center max-w-sm mx-auto w-full z-10"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <motion.div variants={itemVariants} className="text-center mb-8 w-full">
                    <h2 className="text-3xl font-display font-semibold text-[var(--text-primary)] tracking-tighter leading-tight drop-shadow-sm">
                        최종 결과가
                        <br />
                        나왔어요!
                    </h2>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="relative bg-[var(--surface-color)] rounded-3xl pt-12 pb-7 px-7 text-center shadow-[0_20px_60px_-15px_rgba(16,185,129,0.15)] dark:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.10)] w-full border border-emerald-500/20 dark:border-indigo-500/20 group mt-4"
                >
                    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 dark:via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                            className="absolute -top-12 left-1/2 -translate-x-1/2 text-amber-400 drop-shadow-lg"
                        >
                            <Crown weight="fill" size={56} />
                        </motion.div>

                        <div className="w-24 h-24 bg-emerald-50 dark:bg-indigo-500/10 rounded-3xl flex items-center justify-center text-4xl mb-5 shadow-inner border border-emerald-100 dark:border-indigo-500/20 relative overflow-hidden mt-4">
                            <motion.span
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
                            >
                                {winnerIcon}
                            </motion.span>
                        </div>

                        {result ? (
                            <>
                                <h1 className="text-2xl mb-6 font-display font-bold text-[var(--text-primary)] tracking-tight leading-tight">
                                    {result.winnerName}
                                </h1>

                                <div className="w-full bg-[var(--bg-color)] rounded-2xl p-4 text-sm leading-relaxed text-[var(--text-secondary)] font-medium border border-[var(--border-color)] flex flex-col gap-2.5 text-left shadow-inner">
                                    <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2.5">
                                        <span className="text-[var(--text-helper)]">종합 점수</span>
                                        <strong className="text-emerald-500 dark:text-indigo-400 text-xl font-display font-bold tracking-tight">
                                            {result.totalScore.toFixed(2)}점
                                        </strong>
                                    </div>
                                    <div className="flex justify-between items-center pt-0.5">
                                        <span className="text-[var(--text-helper)]">순위</span>
                                        <strong className="text-[var(--text-primary)] text-sm">
                                            {tieCount > 1 ? `공동 1위 (${tieCount}개 후보)` : `${result.ranking.length}개 후보 중 1위`}
                                        </strong>
                                    </div>
                                    <div className="flex flex-col gap-1 pt-1.5 border-t border-[var(--border-color)]">
                                        <span className="text-[var(--text-helper)]">요약</span>
                                        <strong className="text-[var(--text-primary)] text-sm">{result.reason}</strong>
                                    </div>
                                </div>

                                <div className="w-full mt-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] p-3 flex flex-col gap-2 text-left">
                                    {result.ranking.slice(0, 3).map((item, index) => (
                                        <div key={item.candidateId} className="flex items-center justify-between text-sm">
                                            <span className="text-[var(--text-secondary)]">{index + 1}. {item.candidateName}</span>
                                            <strong className="text-[var(--text-primary)]">{item.score.toFixed(2)}점</strong>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="w-full bg-[var(--bg-color)] rounded-2xl p-4 text-sm leading-relaxed text-[var(--text-secondary)] font-medium border border-[var(--border-color)] text-left shadow-inner">
                                결과를 계산할 데이터가 부족해요. 가중치/후보/점수를 먼저 입력해 주세요.
                            </div>
                        )}
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
                        <span>가중치 다시 정하기</span>
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
