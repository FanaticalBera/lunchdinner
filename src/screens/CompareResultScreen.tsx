import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { House, PencilSimple, ArrowCounterClockwise, Check, Confetti } from '@phosphor-icons/react';
import { ProgressBar } from '../components/common/ProgressBar';
import { BottomActionBar } from '../components/common/BottomActionBar';
import { PrimaryButton } from '../components/common/PrimaryButton';
import type { Candidate } from '../domain/types';
import { getBadgeStyle, getBadgeText } from '../utils/badgeUtils';

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
    const [rouletteItems, setRouletteItems] = useState<{ key: string, candidate: Candidate }[]>([]);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (candidates.length <= 1) {
            setPhase('winner');
            setWinnerCandidate(candidates[0] ?? null);
            setShowConfetti(true);
            return;
        }

        setPhase('rolling');
        setShowConfetti(false);

        const pickedWinner = pickRandomCandidate(candidates);
        setWinnerCandidate(pickedWinner);

        if (!pickedWinner) return;

        const items: { key: string, candidate: Candidate }[] = [];
        const spins = 30; // 룰렛이 더 오랫동안 무한대처럼 돌아가도록 항목 개수 증가
        for (let i = 0; i < spins; i++) {
            let rand = candidates[Math.floor(Math.random() * candidates.length)];
            // 이전 항목과 같으면 가급적 다르게 (후보가 2개 이상일 때)
            if (i > 0 && items[i - 1].candidate.id === rand.id && candidates.length > 1) {
                const others = candidates.filter(c => c.id !== rand.id);
                rand = others[Math.floor(Math.random() * others.length)];
            }
            items.push({ key: `roll-${drawNonce}-${i}`, candidate: rand });
        }
        items.push({ key: `roll-${drawNonce}-winner`, candidate: pickedWinner });

        // 마지막 당첨 항목 아래에도 비어보이지 않게 (무한 스크롤처럼 보이게) 더미 항목 3개 추가
        for (let i = 0; i < 3; i++) {
            items.push({
                key: `roll-${drawNonce}-dummy-${i}`,
                candidate: candidates[Math.floor(Math.random() * candidates.length)]
            });
        }

        setRouletteItems(items);
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

                {/* 상단 제거 알림 */}
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
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-amber-500/10 pointer-events-none z-0" />

                            <div className="flex-1 w-full flex flex-col items-center justify-center relative p-8">
                                <AnimatePresence mode="popLayout">
                                    {phase === 'rolling' && rouletteItems.length > 0 ? (
                                        <motion.div
                                            key={`rolling-${drawNonce}`}
                                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                            className="absolute inset-0 flex flex-col items-center justify-center w-full overflow-hidden"
                                        >
                                            {/* 중앙부 포커스 인디케이터 (Glassmorphism) */}
                                            <div className="absolute top-1/2 left-4 right-4 h-[120px] -translate-y-1/2 bg-white/40 dark:border-white/10 dark:bg-black/20 rounded-2xl border border-white/60 shadow-sm pointer-events-none z-10" />

                                            <motion.div
                                                initial={{ y: 0 }}
                                                // items 배열에서 당첨 항목(인덱스: spins)까지만 이동하도록 y값 설정
                                                animate={{ y: -(30) * 120 }}
                                                transition={{
                                                    duration: 3.5,
                                                    ease: [0.1, 0.0, 0.1, 1] // 급격하게 감속하면서 무한 스크롤 느낌을 줌
                                                }}
                                                className="flex flex-col items-center w-full absolute top-[80px] z-0"
                                                onAnimationComplete={() => {
                                                    setPhase('winner');
                                                    setShowConfetti(true);
                                                }}
                                            >
                                                {rouletteItems.map((item) => (
                                                    <div key={item.key} className="h-[120px] flex flex-col items-center justify-center w-full shrink-0 relative px-6">
                                                        <div className={`w-16 h-16 flex items-center justify-center transition-all rounded-[1.25rem] border shadow-sm mb-2 opacity-80 backdrop-blur-sm ${getBadgeStyle(item.candidate.name).bgClass} ${getBadgeStyle(item.candidate.name).textClass} ${getBadgeStyle(item.candidate.name).borderClass}`}>
                                                            <span className="text-3xl font-bold opacity-90">{getBadgeText(item.candidate.name)}</span>
                                                        </div>
                                                        <h1 className="font-bold font-display tracking-tight text-xl text-[var(--text-secondary)] opacity-80 truncate w-full">
                                                            {item.candidate.name}
                                                        </h1>
                                                    </div>
                                                ))}
                                            </motion.div>

                                            {/* 위/아래 가장자리 그라데이션 가림막 (부드럽게) */}
                                            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[var(--surface-color)] to-transparent pointer-events-none z-20" />
                                            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--surface-color)] to-transparent pointer-events-none z-20" />
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
                                                className={`relative z-10 w-28 h-28 rounded-3xl flex items-center justify-center mb-5 shadow-inner border-2 ${getBadgeStyle(winnerCandidate.name).bgClass} ${getBadgeStyle(winnerCandidate.name).textClass} ${getBadgeStyle(winnerCandidate.name).borderClass}`}
                                            >
                                                <span className="text-6xl font-bold drop-shadow-md">{getBadgeText(winnerCandidate.name)}</span>
                                            </motion.div>

                                            <h1 className="relative z-10 text-4xl font-bold font-display text-[var(--text-primary)] tracking-tighter leading-tight drop-shadow-sm truncate w-full px-4">
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
                            {candidates.length > 2 && (
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
