import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { StepHeader } from '../components/common/StepHeader';
import { ProgressBar } from '../components/common/ProgressBar';
import { BottomActionBar } from '../components/common/BottomActionBar';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { HelperText } from '../components/common/HelperText';
import { X, Plus, Storefront } from '@phosphor-icons/react';

interface Props {
    onNext: () => void;
    onBack: () => void;
    onHome?: () => void;
}

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

export const CandidateInputScreen: React.FC<Props> = ({ onNext, onBack, onHome }) => {
    const [candidates, setCandidates] = useState([
        { id: '1', name: '김치찌개 전문점', icon: '🍲' },
        { id: '2', name: '옆집 돈까스', icon: '🍱' }
    ]);
    const [inputValue, setInputValue] = useState('');

    const handleAdd = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = inputValue.trim();
        if (trimmed && !candidates.find((c) => c.name === trimmed)) {
            setCandidates([...candidates, { id: Date.now().toString(), name: trimmed, icon: '🍽️' }]);
            setInputValue('');
        }
    };

    const handleRemove = (id: string) => {
        setCandidates(candidates.filter((c) => c.id !== id));
    };

    return (
        <div className="flex-1 flex flex-col bg-[var(--bg-color)] h-[100dvh] relative overflow-hidden">
            <div className="flex-none bg-[var(--surface-color)] z-10 border-b border-[var(--border-color)]">
                <StepHeader title="후보 입력" onBack={onBack} onHome={onHome} />
                <ProgressBar currentStep={2} totalSteps={4} />
            </div>

            <div className="p-6 flex-1 overflow-y-auto pb-36">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    className="mb-6 w-full max-w-sm mx-auto mt-2"
                >
                    <h2 className="text-2xl font-display font-semibold text-[var(--text-primary)] tracking-tight leading-snug mb-2">
                        어디를 두고
                        <br />
                        고민 중인가요?
                    </h2>
                    <HelperText message="최소 2개 이상의 식당/메뉴를 입력해 주세요." />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
                    className="w-full max-w-sm mx-auto bg-[var(--surface-color)] rounded-2xl shadow-[var(--shadow-sm)] border border-[var(--border-color)] p-5 mb-6"
                >
                    <form onSubmit={handleAdd} className="relative">
                        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[var(--text-helper)]">
                            <Storefront weight="duotone" size={22} />
                        </div>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="식당/메뉴 이름 입력 후 엔터"
                            className="w-full p-3.5 pl-12 pr-14 rounded-xl border border-[var(--border-color)] text-base bg-slate-50 dark:bg-zinc-800/50 focus:bg-[var(--surface-color)] focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium placeholder-[var(--text-helper)] text-[var(--text-primary)] placeholder:font-normal"
                        />
                        <button
                            type="button"
                            onClick={handleAdd}
                            className="absolute inset-y-1.5 right-1.5 flex items-center justify-center w-10 bg-emerald-50 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 rounded-lg text-emerald-500 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 transition-colors shadow-sm"
                            aria-label="후보 추가"
                        >
                            <Plus weight="bold" size={18} />
                        </button>
                    </form>
                </motion.div>

                <motion.div
                    className="w-full max-w-sm mx-auto flex flex-col gap-2.5"
                    variants={listContainerVariants}
                    initial="hidden"
                    animate="show"
                >
                    <AnimatePresence mode="popLayout">
                        {candidates.map((c) => (
                            <motion.div
                                key={c.id}
                                layout
                                variants={itemVariants}
                                initial="hidden"
                                animate="show"
                                exit="exit"
                                className="p-3.5 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[var(--bg-color)] flex items-center justify-center text-lg shadow-inner border border-[var(--border-color)]">
                                        {c.icon}
                                    </div>
                                    <span className="text-base font-bold text-[var(--text-primary)]">{c.name}</span>
                                </div>
                                <button
                                    onClick={() => handleRemove(c.id)}
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-helper)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                                    aria-label={`${c.name} 삭제`}
                                >
                                    <X weight="bold" size={18} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            <BottomActionBar>
                <PrimaryButton
                    onClick={onNext}
                    className="w-full"
                    disabled={candidates.length < 2}
                >
                    점수 매기기
                </PrimaryButton>
            </BottomActionBar>
        </div>
    );
};
