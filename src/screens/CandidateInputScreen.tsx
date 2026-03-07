import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { StepHeader } from '../components/common/StepHeader';
import { ProgressBar } from '../components/common/ProgressBar';
import { BottomActionBar } from '../components/common/BottomActionBar';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { HelperText } from '../components/common/HelperText';
import { X, Plus, Storefront } from '@phosphor-icons/react';
import type { Candidate } from '../domain/types';

interface Props {
    candidates: Candidate[];
    maxCandidates: number;
    onCandidatesChange: (candidates: Candidate[]) => void;
    onNext: () => void;
    onBack: () => void;
    onHome?: () => void;
}

const EXAMPLE_CANDIDATES = ['김치찌개', '돈까스', '우동', '비빔밥', '샐러드', '제육덮밥'];

const listContainerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.2 } }
};

function normalizeCandidateName(value: string): string {
    return value.trim().toLocaleLowerCase('ko').replace(/\s+/g, '');
}

function hasDuplicateCandidate(candidates: Candidate[], name: string, excludeId?: string): boolean {
    const normalized = normalizeCandidateName(name);
    return candidates.some((candidate) => {
        if (excludeId && candidate.id === excludeId) {
            return false;
        }

        return normalizeCandidateName(candidate.name) === normalized;
    });
}

export const CandidateInputScreen: React.FC<Props> = ({
    candidates,
    maxCandidates,
    onCandidatesChange,
    onNext,
    onBack,
    onHome,
}) => {
    const [inputValue, setInputValue] = useState('');
    const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

    const isAtLimit = candidates.length >= maxCandidates;
    const isOverLimit = candidates.length > maxCandidates;
    const canProceed = candidates.length >= 2 && !isOverLimit;

    const helperMessage = useMemo(() => {
        if (isOverLimit) {
            return `후보가 ${candidates.length}개예요. 직접 결정은 최대 ${maxCandidates}개까지만 추천합니다. ${candidates.length - maxCandidates}개를 줄여 주세요.`;
        }

        if (isAtLimit) {
            return `후보가 ${maxCandidates}개 찼어요. 바로 결정은 2~3개가 가장 빠르고, 최대 ${maxCandidates}개까지만 진행할 수 있어요.`;
        }

        if (candidates.length < 2) {
            return `최소 2개, 권장 2~3개, 최대 ${maxCandidates}개까지 입력할 수 있어요.`;
        }

        return `지금 ${candidates.length}개 후보가 있어요. 바로 결정은 2~3개가 가장 빠르고, 최대 ${maxCandidates}개까지 진행할 수 있어요.`;
    }, [candidates.length, isAtLimit, isOverLimit, maxCandidates]);

    const availableExampleCandidates = useMemo(() => {
        return EXAMPLE_CANDIDATES.filter((name) => !hasDuplicateCandidate(candidates, name));
    }, [candidates]);

    const handleAdd = (e?: React.FormEvent, forcedName?: string) => {
        if (e) e.preventDefault();

        const rawValue = forcedName ?? inputValue;
        const trimmed = rawValue.trim();

        if (!trimmed) {
            setFeedbackMessage('후보 이름을 입력해 주세요.');
            return;
        }

        if (isAtLimit) {
            setFeedbackMessage(`후보는 최대 ${maxCandidates}개까지만 추가할 수 있어요.`);
            return;
        }

        if (hasDuplicateCandidate(candidates, trimmed)) {
            setFeedbackMessage('이미 비슷한 이름의 후보가 있어요. 공백을 빼거나 붙여 써도 같은 후보로 봅니다.');
            return;
        }

        onCandidatesChange([...candidates, { id: Date.now().toString(), name: trimmed, icon: '🍽️' }]);
        setInputValue('');
        setFeedbackMessage(null);
    };

    const handleRemove = (id: string) => {
        onCandidatesChange(candidates.filter((candidate) => candidate.id !== id));
        if (editingCandidateId === id) {
            setEditingCandidateId(null);
            setEditingValue('');
        }
        setFeedbackMessage(null);
    };

    const handleEditStart = (candidate: Candidate) => {
        setEditingCandidateId(candidate.id);
        setEditingValue(candidate.name);
        setFeedbackMessage(null);
    };

    const handleEditCancel = () => {
        setEditingCandidateId(null);
        setEditingValue('');
    };

    const handleEditSave = (candidateId: string) => {
        const trimmed = editingValue.trim();

        if (!trimmed) {
            setFeedbackMessage('수정할 이름을 입력해 주세요.');
            return;
        }

        if (hasDuplicateCandidate(candidates, trimmed, candidateId)) {
            setFeedbackMessage('이미 비슷한 이름의 후보가 있어요. 다른 이름으로 수정해 주세요.');
            return;
        }

        onCandidatesChange(
            candidates.map((candidate) =>
                candidate.id === candidateId
                    ? { ...candidate, name: trimmed }
                    : candidate
            )
        );
        setEditingCandidateId(null);
        setEditingValue('');
        setFeedbackMessage(null);
    };

    return (
        <div className="flex-1 flex flex-col bg-[var(--bg-color)] h-full relative overflow-hidden">
            <div className="flex-none bg-[var(--surface-color)] z-10 border-b border-[var(--border-color)]">
                <StepHeader title="후보 입력" onBack={onBack} onHome={onHome} />
                <ProgressBar currentStep={1} totalSteps={2} />
            </div>

            <div className="p-6 flex-1 overflow-y-auto pb-36">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    className="mb-6 w-full max-w-sm mx-auto mt-2"
                >
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <h2 className="text-2xl font-display font-semibold text-[var(--text-primary)] tracking-tight leading-snug mb-0">
                            무엇을 두고
                            <br />
                            고민 중인가요?
                        </h2>
                        <span className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border ${isOverLimit
                            ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200'
                            : isAtLimit
                                ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200'
                            }`}>
                            {candidates.length} / {maxCandidates}
                        </span>
                    </div>
                    <HelperText message={helperMessage} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
                    className="w-full max-w-sm mx-auto bg-[var(--surface-color)] rounded-2xl shadow-[var(--shadow-sm)] border border-[var(--border-color)] p-5 mb-4"
                >
                    <form onSubmit={(e) => handleAdd(e)} className="relative">
                        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[var(--text-helper)]">
                            <Storefront weight="duotone" size={22} />
                        </div>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={isAtLimit ? `최대 ${maxCandidates}개까지 입력했어요` : '식당/메뉴 이름 입력 후 엔터'}
                            disabled={isAtLimit}
                            className="w-full p-3.5 pl-12 pr-14 rounded-xl border border-[var(--border-color)] text-base bg-slate-50 dark:bg-zinc-800/50 focus:bg-[var(--surface-color)] focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium placeholder-[var(--text-helper)] text-[var(--text-primary)] placeholder:font-normal disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                        <button
                            type="button"
                            onClick={() => handleAdd(undefined)}
                            disabled={isAtLimit}
                            className="absolute inset-y-1.5 right-1.5 flex items-center justify-center w-10 bg-emerald-50 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 rounded-lg text-emerald-500 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 transition-colors shadow-sm disabled:opacity-50 disabled:hover:bg-emerald-50 disabled:hover:text-emerald-500 disabled:cursor-not-allowed"
                            aria-label="후보 추가"
                        >
                            <Plus weight="bold" size={18} />
                        </button>
                    </form>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.15 }}
                    className="w-full max-w-sm mx-auto mb-6"
                >
                    <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="text-xs font-semibold text-[var(--text-secondary)]">빠른 예시 추가</span>
                        <span className="text-[11px] text-[var(--text-helper)]">탭해서 바로 입력</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {availableExampleCandidates.slice(0, 6).map((name) => (
                            <button
                                key={name}
                                type="button"
                                onClick={() => handleAdd(undefined, name)}
                                disabled={isAtLimit}
                                className="px-3 py-2 rounded-full text-xs font-semibold border border-[var(--border-color)] bg-[var(--surface-color)] text-[var(--text-secondary)] hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:border-emerald-500/20 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                    {feedbackMessage && <HelperText message={feedbackMessage} isError />}
                </motion.div>

                <motion.div
                    className="w-full max-w-sm mx-auto flex flex-col gap-2.5"
                    variants={listContainerVariants}
                    initial="hidden"
                    animate="show"
                >
                    <AnimatePresence mode="popLayout">
                        {candidates.map((candidate) => {
                            const isEditing = editingCandidateId === candidate.id;

                            return (
                                <motion.div
                                    key={candidate.id}
                                    layout
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="show"
                                    exit="exit"
                                    className="p-3.5 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="w-10 h-10 rounded-full bg-[var(--bg-color)] flex items-center justify-center text-lg shadow-inner border border-[var(--border-color)] shrink-0">
                                                {candidate.icon ?? '🍽️'}
                                            </div>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editingValue}
                                                    onChange={(e) => setEditingValue(e.target.value)}
                                                    className="w-full p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/10 text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="text-base font-bold text-[var(--text-primary)] break-all">{candidate.name}</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleRemove(candidate.id)}
                                            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-helper)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors shrink-0"
                                            aria-label={`${candidate.name} 삭제`}
                                        >
                                            <X weight="bold" size={18} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[11px] text-[var(--text-helper)]">
                                            {isEditing ? '공백만 다른 이름도 중복으로 처리돼요.' : '삭제하지 않고 바로 수정할 수 있어요.'}
                                        </span>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditCancel()}
                                                        className="px-3 py-1.5 rounded-full text-xs font-semibold border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
                                                    >
                                                        취소
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditSave(candidate.id)}
                                                        className="px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                                                    >
                                                        저장
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditStart(candidate)}
                                                    className="px-3 py-1.5 rounded-full text-xs font-semibold border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:border-emerald-500/20 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-200 transition-colors"
                                                >
                                                    수정
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            </div>

            <BottomActionBar>
                <div className="w-full flex flex-col gap-2 relative z-50">
                    {!canProceed && (
                        <HelperText
                            message={
                                candidates.length < 2
                                    ? '후보를 최소 2개 이상 입력해 주세요.'
                                    : `후보가 ${candidates.length}개예요. ${maxCandidates}개 이하로 줄여야 다음 단계로 갈 수 있어요.`
                            }
                        />
                    )}
                    <motion.div
                        animate={canProceed ? { y: [0, -6, 0] } : { y: 0 }}
                        transition={{
                            duration: 0.8,
                            repeat: canProceed ? Infinity : 0,
                            repeatDelay: 2,
                            ease: 'easeInOut',
                        }}
                        className="w-full"
                    >
                        <PrimaryButton
                            onClick={onNext}
                            className="w-full"
                            disabled={!canProceed}
                        >
                            바로 결정하기 🎲
                        </PrimaryButton>
                    </motion.div>
                </div>
            </BottomActionBar>
        </div>
    );
};
