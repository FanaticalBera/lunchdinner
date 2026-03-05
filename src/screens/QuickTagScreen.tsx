import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { StepHeader } from '../components/common/StepHeader';
import { ProgressBar } from '../components/common/ProgressBar';
import { BottomActionBar } from '../components/common/BottomActionBar';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { Check } from '@phosphor-icons/react';
import type { QuickTag } from '../domain/types';

interface Props {
    tags: QuickTag[];
    selectedTags: QuickTag[];
    onTagsChange: (tags: QuickTag[]) => void;
    onNext: () => void;
    onBack: () => void;
    onHome?: () => void;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
};

export const QuickTagScreen: React.FC<Props> = ({ tags, selectedTags, onTagsChange, onNext, onBack, onHome }) => {
    const selectedSet = new Set(selectedTags);

    const toggleTag = (tag: string) => {
        const nextSet = new Set(selectedSet);

        if (nextSet.has(tag)) {
            nextSet.delete(tag);
        } else {
            nextSet.add(tag);
        }

        onTagsChange(Array.from(nextSet));
    };

    return (
        <div className="flex flex-col w-full min-h-[100dvh] bg-[var(--bg-color)] relative overflow-hidden">
            <div className="flex-none w-full z-20 sticky top-0 bg-[var(--surface-color)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
                <StepHeader title="빠른 추천" onBack={onBack} onHome={onHome} />
                <ProgressBar currentStep={1} totalSteps={2} />
            </div>

            <div className="flex-1 w-full max-w-sm mx-auto pt-8 pb-36 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    className="mb-8 w-full mt-2"
                >
                    <h2 className="text-2xl font-display font-semibold text-[var(--text-primary)] leading-snug tracking-tight mb-2">
                        이번엔 어떤
                        <br />
                        분위기로 갈까요?
                    </h2>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">
                        여러 개를 골라도 괜찮아요.
                    </p>
                </motion.div>

                <motion.div
                    className="flex flex-wrap gap-2.5 w-full"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {tags.map((tag) => {
                        const isSelected = selectedSet.has(tag);
                        return (
                            <motion.button
                                variants={itemVariants}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.93 }}
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`
                                    relative flex items-center justify-center gap-1.5 py-3 px-5 rounded-full text-[15px] font-semibold transition-all duration-200 overflow-hidden outline-none
                                    ${isSelected
                                        ? 'bg-emerald-500 text-white shadow-[0_4px_12px_-2px_rgba(16,185,129,0.4)] border-2 border-emerald-400'
                                        : 'bg-[var(--surface-color)] text-[var(--text-primary)] border-2 border-[var(--border-color)] hover:border-emerald-400 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.08)]'
                                    }
                                `}
                            >
                                {isSelected && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        className="flex items-center"
                                    >
                                        <Check weight="bold" size={16} className="text-white" />
                                    </motion.span>
                                )}
                                <span>{tag}</span>
                            </motion.button>
                        );
                    })}
                </motion.div>
            </div>

            <BottomActionBar>
                <PrimaryButton
                    onClick={onNext}
                    disabled={selectedTags.length === 0}
                    className="w-full flex items-center justify-center"
                >
                    {selectedTags.length > 0
                        ? `${selectedTags.length}개 태그로 추천받기`
                        : '먼저 태그를 골라주세요'}
                </PrimaryButton>
            </BottomActionBar>
        </div>
    );
};
