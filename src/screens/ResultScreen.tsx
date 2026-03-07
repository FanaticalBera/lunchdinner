import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { BottomActionBar } from '../components/common/BottomActionBar';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { WinnerCard } from '../components/common/WinnerCard';
import { MapTrifold, ArrowsClockwise, Crown } from '@phosphor-icons/react';
import type { Candidate, CriterionKey, Result } from '../domain/types';

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
        transition: { staggerChildren: 0.16, delayChildren: 0.08 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.94, y: 18 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 110, damping: 16 } }
};

const CRITERION_KEYS: CriterionKey[] = ['taste', 'price', 'distance'];

const CRITERION_META: Record<CriterionKey, { label: string; tintClassName: string; softClassName: string }> = {
    taste: {
        label: '맛',
        tintClassName: 'text-rose-500 dark:text-rose-300',
        softClassName: 'bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20',
    },
    price: {
        label: '가성비',
        tintClassName: 'text-sky-500 dark:text-sky-300',
        softClassName: 'bg-sky-50 border-sky-100 dark:bg-sky-500/10 dark:border-sky-500/20',
    },
    distance: {
        label: '거리',
        tintClassName: 'text-amber-500 dark:text-amber-300',
        softClassName: 'bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20',
    },
};

function getWinnerIcon(result: Result | null, candidates: Candidate[]): string {
    if (!result) {
        return '🍽️';
    }

    const winner = candidates.find((candidate) => candidate.id === result.winnerId);
    return winner?.icon ?? '🍽️';
}

function getSummaryHeadline(result: Result): string {
    if (result.summaryTone === 'tie') {
        return '아직 결승전이 안 끝났어요';
    }

    if (result.summaryTone === 'close') {
        return `${result.scoreGapFromRunnerUp.toFixed(2)}점 차이의 박빙 승부예요`;
    }

    return '오늘의 1위가 또렷하게 나왔어요';
}

function getSummaryBody(result: Result): string {
    if (result.summaryTone === 'tie') {
        return '공동 1위 후보가 남아 있어요. 가중치를 다시 조정하거나 후보를 더 좁히면 결정이 쉬워집니다.';
    }

    if (result.summaryTone === 'close') {
        return '1위와 2위 차이가 작습니다. 지금 기준이 정말 중요한지 한 번 더 확인해볼 만합니다.';
    }

    return '현재 가중치 기준에서는 우세한 후보가 분명하게 드러났습니다.';
}

function formatCriteriaList(keys: CriterionKey[]): string {
    if (keys.length === 0) {
        return '없음';
    }

    return keys.map((key) => CRITERION_META[key].label).join(', ');
}

export const ResultScreen: React.FC<Props> = ({ result, candidates, onRestart, onReWeight }) => {
    const winnerIcon = getWinnerIcon(result, candidates);

    return (
        <div className="flex-1 flex flex-col bg-[var(--bg-color)] h-[100dvh] relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2" />

            <motion.div
                className="flex-1 overflow-y-auto pt-12 pb-36 px-6 max-w-sm mx-auto w-full z-10"
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

                <motion.div variants={itemVariants} className="w-full mt-4">
                    <WinnerCard
                        containerClassName="pt-12 pb-7 px-7 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.15)] dark:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.10)] border-emerald-500/20 dark:border-indigo-500/20 group"
                        overlay={(
                            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 dark:via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                            </div>
                        )}
                        badge={(
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                className="absolute -top-12 left-1/2 -translate-x-1/2 text-amber-400 drop-shadow-lg"
                            >
                                <Crown weight="fill" size={56} />
                            </motion.div>
                        )}
                        iconWrapperClassName="w-24 h-24 bg-emerald-50 dark:bg-indigo-500/10 rounded-3xl flex items-center justify-center text-4xl mb-5 shadow-inner border border-emerald-100 dark:border-indigo-500/20 relative overflow-hidden mt-4"
                        icon={
                            <motion.span
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
                            >
                                {winnerIcon}
                            </motion.span>
                        }
                        title={result?.winnerName}
                        titleClassName="text-2xl mb-6 font-display font-bold text-[var(--text-primary)] tracking-tight leading-tight"
                    >
                        {result ? (
                            <>
                                <div className="w-full bg-[var(--bg-color)] rounded-2xl p-4 text-sm leading-relaxed text-[var(--text-secondary)] font-medium border border-[var(--border-color)] flex flex-col gap-3 text-left shadow-inner">
                                    <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2.5">
                                        <span className="text-[var(--text-helper)]">종합 점수</span>
                                        <strong className="text-emerald-500 dark:text-indigo-400 text-xl font-display font-bold tracking-tight">
                                            {result.totalScore.toFixed(2)}점
                                        </strong>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[var(--text-helper)]">순위</span>
                                        <strong className="text-[var(--text-primary)] text-sm">
                                            {result.isTie ? `공동 1위 (${result.firstPlaceCount}개 후보)` : `${result.ranking.length}개 후보 중 1위`}
                                        </strong>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[var(--text-helper)]">결과 톤</span>
                                        <strong className="text-[var(--text-primary)] text-sm">{getSummaryHeadline(result)}</strong>
                                    </div>
                                    <div className="flex flex-col gap-1 pt-1.5 border-t border-[var(--border-color)]">
                                        <span className="text-[var(--text-helper)]">요약</span>
                                        <strong className="text-[var(--text-primary)] text-sm">{result.reason}</strong>
                                        <span className="text-xs text-[var(--text-secondary)]">{getSummaryBody(result)}</span>
                                    </div>
                                </div>

                                <div className="w-full mt-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] p-4 flex flex-col gap-3 text-left shadow-inner">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-0">기준별 1위 점수</h3>
                                        {!result.isTie && result.runnerUp && (
                                            <span className="text-xs text-[var(--text-secondary)]">
                                                2위와 {result.scoreGapFromRunnerUp.toFixed(2)}점 차이
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2.5">
                                        {CRITERION_KEYS.map((key) => {
                                            const criterion = result.winnerScoreByKey[key];
                                            const meta = CRITERION_META[key];

                                            return (
                                                <div key={key} className={`rounded-2xl border p-3 ${meta.softClassName}`}>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className={`text-sm font-bold ${meta.tintClassName}`}>{meta.label}</span>
                                                        <span className="text-xs text-[var(--text-secondary)]">가중치 {criterion.weight}%</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-[var(--text-secondary)]">원점수 {criterion.rawScore.toFixed(1)}점</span>
                                                        <strong className="text-[var(--text-primary)]">반영 점수 {criterion.weightedScore.toFixed(2)}</strong>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {result.isTie ? (
                                    <div className="w-full mt-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] p-4 flex flex-col gap-3 text-left shadow-inner">
                                        <div>
                                            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">공동 1위 후보</h3>
                                            <p className="text-xs text-[var(--text-secondary)] mb-0">
                                                가중치를 다시 조정하거나 후보를 더 좁히면 결론을 더 쉽게 낼 수 있습니다.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {result.topCandidates.map((candidate) => (
                                                <span
                                                    key={candidate.candidateId}
                                                    className="px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200 text-xs font-semibold"
                                                >
                                                    {candidate.candidateName} {candidate.score.toFixed(2)}점
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : result.runnerUp && result.comparisonByKey ? (
                                    <div className="w-full mt-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] p-4 flex flex-col gap-3 text-left shadow-inner">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">1위 vs 2위 비교</h3>
                                                <p className="text-xs text-[var(--text-secondary)] mb-0">
                                                    {result.winnerName} vs {result.runnerUp?.candidateName ?? '2위 후보'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <strong className="block text-sm text-[var(--text-primary)]">
                                                    {result.scoreGapFromRunnerUp.toFixed(2)}점 차이
                                                </strong>
                                                <span className="text-xs text-[var(--text-helper)]">{getSummaryHeadline(result)}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2">
                                            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-3 text-xs text-[var(--text-secondary)]">
                                                앞선 기준: <strong className="text-[var(--text-primary)]">{formatCriteriaList(result.leadingCriteria)}</strong>
                                            </div>
                                            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-3 text-xs text-[var(--text-secondary)]">
                                                밀린 기준: <strong className="text-[var(--text-primary)]">{formatCriteriaList(result.trailingCriteria)}</strong>
                                            </div>
                                            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-color)] p-3 text-xs text-[var(--text-secondary)]">
                                                승부 기준: <strong className="text-[var(--text-primary)]">{formatCriteriaList(result.decidingCriteria)}</strong>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2.5">
                                            {CRITERION_KEYS.map((key) => {
                                                const meta = CRITERION_META[key];
                                                const comparison = result.comparisonByKey?.[key];
                                                if (!comparison) {
                                                    return null;
                                                }

                                                const leaderLabel = comparison.isTie
                                                    ? '동률'
                                                    : comparison.leaderCandidateId === result.winnerId
                                                        ? `${result.winnerName} 우세`
                                                        : `${result.runnerUp?.candidateName ?? '2위'} 우세`;

                                                return (
                                                    <div key={key} className={`rounded-2xl border p-3 ${meta.softClassName}`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className={`text-sm font-bold ${meta.tintClassName}`}>{meta.label}</span>
                                                            <span className="text-xs text-[var(--text-secondary)]">{leaderLabel}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                            <div className="rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] px-3 py-2">
                                                                <span className="block text-[var(--text-helper)] mb-1">{result.winnerName}</span>
                                                                <strong className="block text-[var(--text-primary)]">
                                                                    {comparison.winnerWeightedScore.toFixed(2)}
                                                                </strong>
                                                                <span className="text-[var(--text-secondary)]">원점수 {comparison.winnerRawScore.toFixed(1)}</span>
                                                            </div>
                                                            <div className="rounded-xl bg-[var(--surface-color)] border border-[var(--border-color)] px-3 py-2">
                                                                <span className="block text-[var(--text-helper)] mb-1">{result.runnerUp?.candidateName ?? '2위 후보'}</span>
                                                                <strong className="block text-[var(--text-primary)]">
                                                                    {comparison.runnerUpWeightedScore.toFixed(2)}
                                                                </strong>
                                                                <span className="text-[var(--text-secondary)]">원점수 {comparison.runnerUpRawScore.toFixed(1)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : null}

                                <div className="w-full mt-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] p-4 flex flex-col gap-2 text-left shadow-inner">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-0">전체 순위</h3>
                                        <span className="text-xs text-[var(--text-secondary)]">상위 3개 표시</span>
                                    </div>
                                    {result.ranking.slice(0, 3).map((item, index) => (
                                        <div key={item.candidateId} className="flex items-center justify-between text-sm rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] px-3 py-2.5">
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
                    </WinnerCard>
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

