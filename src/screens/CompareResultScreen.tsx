import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { House, PencilSimple, ArrowCounterClockwise, Check, Confetti } from '@phosphor-icons/react';
import { ProgressBar } from '../components/common/ProgressBar';
import { BottomActionBar } from '../components/common/BottomActionBar';
import { PrimaryButton } from '../components/common/PrimaryButton';
import type { Candidate } from '../domain/types';

interface Props {
    candidates: Candidate[];
    drawNonce: number;
    onRedraw: () => void;
    onRemoveCandidate: (id: string) => void;
    onBack: () => void;
    onHome: () => void;
}

function pickRandomCandidate(candidates: Candidate[]): Candidate | null {
    if (candidates.length === 0) {
        return null;
    }

    const index = Math.floor(Math.random() * candidates.length);
    return candidates[index] ?? candidates[0] ?? null;
}

type Phase = 'rolling' | 'winner';

export const CompareResultScreen: React.FC<Props> = ({
    candidates,
    drawNonce,
    onRedraw,
    onRemoveCandidate,
    onBack,
    onHome,
}) => {
    const [phase, setPhase] = useState<Phase>('rolling');
    const [removedName, setRemovedName] = useState<string | null>(null);
    const [winnerCandidate, setWinnerCandidate] = useState<Candidate | null>(null);
    const [rollingCandidate, setRollingCandidate] = useState<Candidate | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (candidates.length === 0) {
            setPhase('winner');
            setWinnerCandidate(null);
            setShowConfetti(false);
            return;
        }

        setPhase('rolling');
        setShowConfetti(false);

        const pickedWinner = pickRandomCandidate(candidates);
        setWinnerCandidate(pickedWinner);

        if (!pickedWinner) return;

        // 고속 플리퍼(슬롯머신) 효과를 위한 타이머
        const duration = 1200; // 1.2초 동안 돌아감
        const flipInterval = 60; // 0.06초마다 후보 변경

        const interval = window.setInterval(() => {
            const randomC = candidates[Math.floor(Math.random() * candidates.length)];
            setRollingCandidate(randomC);
        }, flipInterval);

        const timer = window.setTimeout(() => {
            window.clearInterval(interval);
            setPhase('winner');
            setShowConfetti(true);
        }, duration);

        return () => {
            window.clearInterval(interval);
            window.clearTimeout(timer);
        };
    }, [drawNonce, candidates]);

    const handleRemoveAndRedraw = () => {
        if (!winnerCandidate) {
            return;
        }

        setRemovedName(winnerCandidate.name);
        onRemoveCandidate(winnerCandidate.id);
        onRedraw();
    };

    return (
        <div className="flex-1 flex flex-col bg-[var(--bg-color)] h-full relative overflow-hidden">
            <div className="flex-none bg-[var(--surface-color)] z-20 border-b border-[var(--border-color)] relative">
                <div className="h-14 flex items-center justify-center font-display font-semibold text-base text-[var(--text-primary)] tracking-wide">
                    {phase === 'rolling' ? '결정 중...' : '결정 완료!'}
                </div>
                <button
                    className="absolute top-2 left-4 w-10 h-10 flex items-center justify-center text-[var(--text-primary)] outline-none hover:text-emerald-500 transition-colors"
                    onClick={onBack}
                    aria-label="후보 수정하기"
                >
                    <PencilSimple weight="bold" size={22} />
                </button>
                <button
                    className="absolute top-2 right-4 w-10 h-10 flex items-center justify-center text-[var(--text-primary)] outline-none hover:text-emerald-500 transition-colors"
                    onClick={onHome}
                    aria-label="처음으로"
                >
                    <House weight="bold" size={22} />
                </button>
                <ProgressBar currentStep={2} totalSteps={2} />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 relative">

                {/* 상단 제거 알림 (방금 000 제외됨) */}
                <div className="absolute top-6 left-0 right-0 flex justify-center h-8">
                    <AnimatePresence>
                        {removedName && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="text-sm text-rose-500 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-500/10 px-4 py-1.5 rounded-full border border-rose-100 dark:border-rose-500/20 shadow-sm"
                            >
                                방금 '{removedName}' 제외됨 💨
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {candidates.length > 0 ? (
                    <motion.div
                        className="w-full max-w-sm flex flex-col items-center"
                        initial={false}
                        animate={phase === 'winner' ? { y: -10 } : { y: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    >
                        <motion.h2
                            className="text-2xl font-display font-semibold text-[var(--text-primary)] tracking-tight drop-shadow-sm mb-2 text-center"
                        >
                            {phase === 'rolling' ? '운명의 주사위...' : '오늘은 이걸로!'}
                        </motion.h2>

                        <motion.span
                            className="px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200 shadow-sm mb-8"
                        >
                            남은 후보: {candidates.length}개
                        </motion.span>

                        {/* 메인 카드 영역 */}
                        <div className="w-full bg-[var(--surface-color)] rounded-3xl border border-[var(--border-color)] shadow-[var(--shadow-md)] flex flex-col items-center text-center relative overflow-hidden h-[280px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-transparent to-amber-50/40 dark:from-emerald-500/5 dark:to-amber-500/5 pointer-events-none" />

                            <div className="flex-1 w-full flex flex-col items-center justify-center relative p-8">
                                <AnimatePresence mode="popLayout">
                                    {phase === 'rolling' && rollingCandidate ? (
                                        <motion.div
                                            key={`roll-${rollingCandidate.id}-${Date.now()}`}
                                            initial={{ y: 50, opacity: 0, scale: 0.8 }}
                                            animate={{ y: 0, opacity: 1, scale: 1 }}
                                            exit={{ y: -50, opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.1 }}
                                            className="absolute flex flex-col items-center justify-center w-full"
                                        >
                                            <div className="w-24 h-24 bg-slate-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mb-5 border border-slate-100 dark:border-zinc-700">
                                                <span className="text-5xl opacity-40 blur-[1px]">{rollingCandidate.icon ?? '🎲'}</span>
                                            </div>
                                            <h1 className="text-3xl font-bold font-display text-[var(--text-secondary)] tracking-tight opacity-40 blur-[1px]">
                                                {rollingCandidate.name}
                                            </h1>
                                        </motion.div>
                                    ) : phase === 'winner' && winnerCandidate ? (
                                        <motion.div
                                            key="winner-card"
                                            initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
                                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                            transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.1 }}
                                            className="absolute flex flex-col items-center justify-center w-full"
                                        >
                                            <motion.div
                                                animate={showConfetti ? { scale: [1, 1.15, 1], rotate: [0, -8, 8, 0] } : {}}
                                                transition={{ duration: 0.6, delay: 0.3 }}
                                                className="relative z-10 w-28 h-28 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-5 shadow-inner border-2 border-emerald-200 dark:border-emerald-500/20"
                                            >
                                                <span className="text-6xl drop-shadow-md">{winnerCandidate.icon ?? '🍽️'}</span>
                                            </motion.div>

                                            <h1 className="relative z-10 text-4xl font-bold font-display text-[var(--text-primary)] tracking-tighter leading-tight drop-shadow-sm">
                                                {winnerCandidate.name}
                                            </h1>

                                            {showConfetti && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.5 }}
                                                    className="absolute -bottom-8 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"
                                                >
                                                    <Confetti weight="fill" size={20} />
                                                    <span className="text-sm font-bold">결정 완료!</span>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="text-center">
                        <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">남은 후보가 없습니다.</h2>
                        <PrimaryButton onClick={onBack}>후보 다시 입력하기</PrimaryButton>
                    </div>
                )}
            </div>

            {phase === 'winner' && candidates.length > 0 && (
                <BottomActionBar>
                    <div className="flex flex-col gap-2.5 w-full">
                        {/* 메인 액션 */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <PrimaryButton
                                onClick={onHome}
                                className="w-full flex items-center justify-center gap-2 text-base font-bold shadow-lg shadow-emerald-500/20 px-2"
                            >
                                <Check weight="bold" size={22} />
                                이걸로 바로 할게요!
                            </PrimaryButton>
                        </motion.div>

                        <div className="flex flex-col items-center gap-3 w-full mt-2">
                            {/* 세컨드 액션: 깔끔한 가로 가득 채우는 라인 버튼 */}
                            {candidates.length > 1 && (
                                <motion.button
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={handleRemoveAndRedraw}
                                    className="w-full py-4 rounded-full flex items-center justify-center gap-1.5 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[var(--text-secondary)] font-bold hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors text-base shadow-sm"
                                >
                                    <ArrowCounterClockwise weight="bold" size={18} />
                                    이건 빼고 다시 돌릴래
                                </motion.button>
                            )}

                            {/* 서드 액션: 테두리 없는 순수 텍스트 링크 타입 */}
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                onClick={onBack}
                                className="py-2 px-4 flex items-center justify-center gap-1.5 text-[var(--text-helper)] hover:text-[var(--text-secondary)] transition-colors text-sm font-medium"
                            >
                                <PencilSimple weight="bold" size={16} /> 후보 목록 수정하기
                            </motion.button>
                        </div>
                    </div>
                </BottomActionBar>
            )}
        </div>
    );
};
