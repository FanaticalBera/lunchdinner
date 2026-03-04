import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StepHeader } from '../components/common/StepHeader';
import { ProgressBar } from '../components/common/ProgressBar';
import { BottomActionBar } from '../components/common/BottomActionBar';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { Check } from '@phosphor-icons/react';

interface Props {
    onNext: () => void;
    onBack: () => void;
}

const DUMMY_TAGS = [
    '국물', '면', '고기', '해산물',
    '매콤한', '느끼한', '담백한',
    '밥', '샐러드', '패스트푸드',
    '건강한', '가볍게', '분식류'
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } }
};

export const QuickTagScreen: React.FC<Props> = ({ onNext, onBack }) => {
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

    const toggleTag = (tag: string) => {
        const newTags = new Set(selectedTags);
        if (newTags.has(tag)) {
            newTags.delete(tag);
        } else {
            newTags.add(tag);
        }
        setSelectedTags(newTags);
    };

    return (
        <div className="flex flex-col w-full min-h-[100dvh] bg-[var(--bg-color)] relative overflow-hidden">

            {/* Top Fixed Area */}
            <div className="flex-none w-full z-20 sticky top-0 bg-[var(--surface-color)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
                <StepHeader title="빠른 추천" onBack={onBack} />
                <ProgressBar currentStep={1} totalSteps={2} />
            </div>

            {/* Scrollable Main Content */}
            <div className="flex-1 w-full max-w-sm mx-auto pt-8 pb-36 px-6">

                {/* Header Question */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="mb-8 w-full mt-2"
                >
                    <h2 className="text-2xl font-display font-semibold text-[var(--text-primary)] leading-snug tracking-tight mb-2">
                        이번엔 끌리는<br />느낌이 있나요?
                    </h2>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">
                        자유롭게 여러 개 선택할 수 있어요.
                    </p>
                </motion.div>

                {/* Tags Flex Container */}
                <motion.div
                    className="flex flex-wrap gap-2.5 w-full"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {DUMMY_TAGS.map(tag => {
                        const isSelected = selectedTags.has(tag);
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
                                        : 'bg-white text-[var(--text-primary)] border-2 border-slate-200 hover:border-emerald-400 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.08)] dark:bg-zinc-800 dark:border-zinc-600'
                                    }
                                `}
                            >
                                {isSelected && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
                    disabled={selectedTags.size === 0}
                    className="w-full flex items-center justify-center"
                >
                    {selectedTags.size > 0
                        ? `${selectedTags.size}가지 느낌으로 추천받기`
                        : '끌리는 느낌을 골라주세요'}
                </PrimaryButton>
            </BottomActionBar>

        </div>
    );
};
