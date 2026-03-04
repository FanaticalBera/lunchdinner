import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { StepHeader } from '../components/common/StepHeader';
import { ProgressBar } from '../components/common/ProgressBar';
import { BottomActionBar } from '../components/common/BottomActionBar';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { HelperText } from '../components/common/HelperText';
import { VerticalJellySlider } from '../components/common/VerticalJellySlider';

interface Props {
    onNext: () => void;
    onBack: () => void;
    onHome?: () => void;
}

const INITIAL_WEIGHTS = {
    taste: 40,
    price: 35,
    distance: 25,
};

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
};

export const WeightWizardScreen: React.FC<Props> = ({ onNext, onBack, onHome }) => {
    const [weights, setWeights] = useState(INITIAL_WEIGHTS);

    const handleWeightChange = (key: keyof typeof INITIAL_WEIGHTS, newValue: number) => {
        const val = Math.max(0, Math.min(100, newValue));
        const diff = val - weights[key];

        const otherKeys = (Object.keys(weights) as Array<keyof typeof INITIAL_WEIGHTS>).filter((k) => k !== key);
        const currentOtherTotal = otherKeys.reduce((sum, k) => sum + weights[k], 0);

        const newWeights = { ...weights, [key]: val };

        if (currentOtherTotal === 0) {
            const half = (100 - val) / 2;
            otherKeys.forEach((k) => {
                newWeights[k] = half;
            });
        } else {
            otherKeys.forEach((k) => {
                const proportion = weights[k] / currentOtherTotal;
                newWeights[k] = Math.max(0, weights[k] - (diff * proportion));
            });
        }

        const rounded = {
            taste: Math.round(newWeights.taste),
            price: Math.round(newWeights.price),
            distance: Math.round(newWeights.distance),
        };

        const total = rounded.taste + rounded.price + rounded.distance;
        if (total !== 100) {
            const adjustment = 100 - total;
            if (key !== 'taste') rounded.taste += adjustment;
            else rounded.price += adjustment;
        }

        setWeights(rounded);
    };

    return (
        <div className="flex-1 flex flex-col bg-[var(--bg-color)] h-[100dvh] relative overflow-hidden">
            <div className="flex-none bg-[var(--surface-color)] z-10 border-b border-[var(--border-color)]">
                <StepHeader title="가중치 설정" onBack={onBack} onHome={onHome} />
                <ProgressBar currentStep={1} totalSteps={4} />
            </div>

            <motion.div
                className="flex-1 overflow-y-auto px-6 pt-6 pb-36 flex flex-col"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <motion.div variants={itemVariants} className="text-center w-full max-w-sm mx-auto mb-6 mt-2">
                    <h2 className="text-2xl font-display font-semibold text-[var(--text-primary)] tracking-tight leading-snug mb-2">
                        이번 식사에서
                        <br />
                        뭐가 가장 중요해요?
                    </h2>
                    <HelperText message="합계 100%가 되도록 슬라이더를 조절해 주세요." />
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="flex justify-center gap-6 sm:gap-10 mt-auto mb-auto py-8 bg-[var(--surface-color)] rounded-3xl shadow-[var(--shadow-sm)] border border-[var(--border-color)] px-6 mx-auto w-full max-w-sm"
                >
                    <VerticalJellySlider
                        label="맛"
                        icon="😋"
                        value={weights.taste}
                        onChange={(v) => handleWeightChange('taste', v)}
                        color="var(--primary)"
                    />
                    <VerticalJellySlider
                        label="가격"
                        icon="💸"
                        value={weights.price}
                        onChange={(v) => handleWeightChange('price', v)}
                        color="var(--secondary-1)"
                    />
                    <VerticalJellySlider
                        label="거리"
                        icon="📍"
                        value={weights.distance}
                        onChange={(v) => handleWeightChange('distance', v)}
                        color="var(--secondary-3)"
                    />
                </motion.div>
            </motion.div>

            <BottomActionBar>
                <PrimaryButton onClick={onNext} className="w-full">
                    후보 입력하기
                </PrimaryButton>
            </BottomActionBar>
        </div>
    );
};
