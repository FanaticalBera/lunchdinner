import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { StepHeader } from '../components/common/StepHeader';
import { Lightning, Scales, Shuffle } from '@phosphor-icons/react';
import type { FlowType } from '../domain/types';

interface FlowSelectScreenProps {
    onSelectFlow: (flow: FlowType) => void;
    onBack: () => void;
    onHome?: () => void;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.05,
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    show: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 100, damping: 20 }
    }
};

export const FlowSelectScreen: React.FC<FlowSelectScreenProps> = ({ onSelectFlow, onBack, onHome }) => {
    return (
        <div className="flex flex-col w-full min-h-[100dvh] bg-[var(--bg-color)]">
            <div className="flex-none sticky top-0 z-20 liquid-glass border-b-0">
                <StepHeader title="寃곗젙 諛⑹떇 ?좏깮" onBack={onBack} onHome={onHome} />
            </div>

            <motion.div
                className="flex-1 px-6 pb-12 w-full max-w-md mx-auto flex flex-col justify-center"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <motion.div variants={itemVariants} className="mb-8 w-full">
                    <h2 className="text-2xl font-display font-semibold text-[var(--text-primary)] mb-2 tracking-tight">
                        ?대뼸寃?怨좊?源뚯슂?
                    </h2>
                    <p className="text-[var(--text-secondary)] text-sm">
                        吏湲??곹솴??留욌뒗 諛⑸쾿???좏깮??二쇱꽭??
                    </p>
                </motion.div>

                <div className="flex flex-col gap-4 w-full">
                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectFlow('quick')}
                        className="relative overflow-hidden w-full bg-[var(--surface-color)] rounded-3xl p-5 md:p-6 flex flex-col gap-2 border border-[var(--border-color)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-amber-300/50 dark:hover:border-amber-500/30 transition-all duration-300 text-left group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="absolute -top-4 -right-2 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-10 dark:group-hover:opacity-10 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 pointer-events-none">
                            <Lightning weight="fill" size={100} className="text-amber-500" />
                        </div>

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-500/20 group-hover:bg-amber-500 transition-colors duration-300 shadow-sm">
                                <Lightning weight="fill" size={18} className="text-amber-600 dark:text-amber-300 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-[1.1rem] md:text-lg font-display font-semibold text-[var(--text-primary)] tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">
                                痍⑦뼢?쇰줈 鍮좊Ⅴ寃?異붿쿇
                            </h3>
                        </div>

                        <p className="relative z-10 text-[var(--text-secondary)] text-[0.85rem] md:text-sm leading-relaxed font-medium pl-12">
                            ?쒓렇留?怨좊Ⅴ硫?諛붾줈 硫붾돱瑜?異붿쿇???쒕젮??
                        </p>
                    </motion.button>

                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectFlow('compare')}
                        className="relative overflow-hidden w-full bg-[var(--surface-color)] rounded-3xl p-5 md:p-6 flex flex-col gap-2 border border-[var(--border-color)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-blue-300/50 dark:hover:border-blue-500/30 transition-all duration-300 text-left group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="absolute -top-4 -right-2 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-10 dark:group-hover:opacity-10 transition-all duration-500 group-hover:-rotate-12 group-hover:scale-110 pointer-events-none">
                            <Scales weight="fill" size={100} className="text-blue-500" />
                        </div>

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-500/20 group-hover:bg-blue-500 transition-colors duration-300 shadow-sm">
                                <Scales weight="fill" size={18} className="text-blue-600 dark:text-blue-300 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-[1.1rem] md:text-lg font-display font-semibold text-[var(--text-primary)] tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                吏곸젒 鍮꾧탳?섍린
                            </h3>
                        </div>

                        <p className="relative z-10 text-[var(--text-secondary)] text-[0.85rem] md:text-sm leading-relaxed font-medium pl-12">
                            ?꾨낫瑜??ｊ퀬 ?먯닔濡???泥닿퀎?곸쑝濡?寃곗젙?댁슂.
                        </p>
                    </motion.button>

                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectFlow('random')}
                        className="relative overflow-hidden w-full bg-[var(--surface-color)] rounded-3xl p-5 md:p-6 flex flex-col gap-2 border border-[var(--border-color)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-emerald-300/50 dark:hover:border-emerald-500/30 transition-all duration-300 text-left group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="absolute -top-4 -right-2 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-10 dark:group-hover:opacity-10 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 pointer-events-none">
                            <Shuffle weight="fill" size={100} className="text-emerald-500" />
                        </div>

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors duration-300 shadow-sm">
                                <Shuffle weight="fill" size={18} className="text-emerald-600 dark:text-emerald-300 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-[1.1rem] md:text-lg font-display font-semibold text-[var(--text-primary)] tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                                ?쒕뜡?쇰줈 怨좊Ⅴ湲?                            </h3>
                        </div>

                        <p className="relative z-10 text-[var(--text-secondary)] text-[0.85rem] md:text-sm leading-relaxed font-medium pl-12">
                            怨좊? ?? ?꾩쟾 ?쒕뜡 異붿쿇?쇰줈 諛붾줈 寃곗젙?댁슂.
                        </p>
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

