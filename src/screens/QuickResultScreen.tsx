import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../components/common/ProgressBar';
import { BottomActionBar } from '../components/common/BottomActionBar';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { HelperText } from '../components/common/HelperText';
import { DiceThree, BowlFood, ArrowsLeftRight, Lightning, House } from '@phosphor-icons/react';

interface Props {
    onRestart: () => void; // go back to start
    onRefetch: () => void; // refetch with same tags
    onSelectFlow: () => void; // go to compare
    flowType?: 'quick' | 'random';
    onHome?: () => void;
}

export const QuickResultScreen: React.FC<Props> = ({ onRestart, onRefetch, onSelectFlow, flowType = 'quick', onHome }) => {
    const [loading, setLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);

    const handleRestartClick = () => {
        setLoading(true);
        setRetryCount(c => c + 1);
        if (flowType === 'quick') {
            onRefetch(); // Trigger any logic to pick a new restaurant with the same tags
        }
    };

    useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => {
                setLoading(false);
            }, 1800);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    return (
        <div className="flex-1 flex flex-col bg-[var(--bg-color)] h-[100dvh] relative overflow-hidden">
            <div className="flex-none bg-[var(--surface-color)] z-20 border-b border-[var(--border-color)] relative">
                <div className="h-14 flex items-center justify-center font-display font-semibold text-base text-[var(--text-primary)] tracking-wide">
                    {loading ? '메뉴 스캔 중' : '추천 결과'}
                </div>
                {!loading && onHome && (
                    <button className="absolute top-2 right-4 w-10 h-10 flex items-center justify-center text-[var(--text-primary)] outline-none hover:text-emerald-500 transition-colors" onClick={onHome} aria-label="처음으로">
                        <House weight="bold" size={24} />
                    </button>
                )}
                <ProgressBar currentStep={2} totalSteps={2} />
            </div>

            <div className="flex-1 flex flex-col px-6 items-center justify-center">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="text-center flex flex-col items-center w-full max-w-sm"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="w-20 h-20 bg-[var(--surface-color)] rounded-2xl shadow-sm flex items-center justify-center mb-8 border border-[var(--border-color)]"
                            >
                                <div className="text-emerald-500">
                                    <DiceThree weight="fill" size={40} />
                                </div>
                            </motion.div>
                            <h2 className="text-xl font-display font-semibold text-[var(--text-primary)] tracking-tight mb-2">
                                {flowType === 'random' && retryCount > 0
                                    ? '다시 주사위를 굴리며 찾는 중...'
                                    : '찰떡 메뉴 찾는 중...'}
                            </h2>
                            <HelperText message={flowType === 'random' && retryCount > 0 ? "이번엔 뭐가 나올까요?" : "당신의 입맛을 고속 분석하고 있어요."} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                            className="w-full max-w-sm flex flex-col items-center"
                        >
                            <div className="text-center mb-6 w-full">
                                <h2 className="text-2xl font-display font-semibold text-[var(--text-primary)] tracking-tight drop-shadow-sm">오늘의 메뉴는 바로!</h2>
                            </div>

                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-[var(--surface-color)] rounded-3xl p-7 text-center shadow-[var(--shadow-md)] w-full border border-[var(--border-color)] relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent pointer-events-none" />

                                <div className="relative z-10 flex flex-col items-center pt-2">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -45 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                                        className="w-24 h-24 bg-amber-50 dark:bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 mb-6 shadow-inner border border-amber-500/20"
                                    >
                                        <BowlFood weight="fill" size={52} />
                                    </motion.div>

                                    <h1 className="text-3xl mb-3 font-bold font-display text-[var(--text-primary)] tracking-tighter leading-tight">
                                        얼큰한 짬뽕
                                    </h1>
                                    <p className="text-[var(--text-secondary)] text-sm font-medium">선택하신 태그 조합의 최고 만족</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {!loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
                        className="w-full"
                    >
                        <BottomActionBar>
                            <div className="flex flex-col items-center gap-3 w-full">
                                <PrimaryButton
                                    onClick={handleRestartClick}
                                    className="w-full"
                                >
                                    {flowType === 'random' ? '다시 주사위 굴리기!' : '이 느낌 그대로 다시 추천!'}
                                </PrimaryButton>

                                <div className="flex gap-4">
                                    {flowType === 'quick' && (
                                        <button
                                            onClick={onRestart}
                                            className="flex items-center gap-1.5 text-sm text-[var(--text-helper)] hover:text-[var(--text-secondary)] transition-colors py-1"
                                        >
                                            <ArrowsLeftRight weight="bold" size={14} />
                                            <span>조건 다시 고르기</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={onSelectFlow}
                                        className="flex items-center gap-1.5 text-sm text-[var(--text-helper)] hover:text-[var(--text-secondary)] transition-colors py-1"
                                    >
                                        {flowType === 'random' ? (
                                            <>
                                                <Lightning weight="bold" size={14} />
                                                <span>이럴 바엔 내 취향대로 추천받을래</span>
                                            </>
                                        ) : (
                                            <>
                                                <ArrowsLeftRight weight="bold" size={14} />
                                                <span>이럴 바엔 내가 직접 비교할래</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </BottomActionBar>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
