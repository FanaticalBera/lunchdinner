import { useEffect, useMemo, useReducer } from 'react';
import { AppShell } from './components/common/AppShell';
import { IntroScreen } from './screens/IntroScreen';
import { FlowSelectScreen } from './screens/FlowSelectScreen';
import { QuickTagScreen } from './screens/QuickTagScreen';
import { QuickResultScreen } from './screens/QuickResultScreen';
import { WeightWizardScreen } from './screens/WeightWizardScreen';
import { CandidateInputScreen } from './screens/CandidateInputScreen';
import { ScoringBoardScreen } from './screens/ScoringBoardScreen';
import { ResultScreen } from './screens/ResultScreen';
import { appReducer, initialAppState, type AppState } from './domain/state';
import { loadAppState, saveAppState } from './domain/persistence';
import {
    buildCompareResult,
    pickQuickRecommendation,
    pickRandomRecommendation,
    scoreMenusByTags,
    type MenuItem,
} from './domain/recommendation';
import type { Candidate, CriterionKey, FlowType, Mode, QuickTag, Step, Weights } from './domain/types';
import menuDbRaw from './data/menu-db.json';

const MENU_DB = menuDbRaw as MenuItem[];
const REQUIRED_SCORE_KEYS: CriterionKey[] = ['taste', 'price', 'distance'];

function hasCompleteScores(candidates: Candidate[], scores: AppState['scores']): boolean {
    if (candidates.length < 2) {
        return false;
    }

    return candidates.every((candidate) =>
        REQUIRED_SCORE_KEYS.every((key) => {
            const score = scores[candidate.id]?.[key];
            return typeof score === 'number';
        })
    );
}

function isMenuAvailableForMode(menu: MenuItem, mode: Mode | null): boolean {
    if (!mode) {
        return true;
    }

    const mealType = menu.mealType ?? 'both';
    return mealType === 'both' || mealType === mode;
}

function resolveGuardedStep(state: AppState): Step {
    if (state.mode === null && state.currentStep !== 'intro') {
        return 'intro';
    }

    switch (state.currentStep) {
        case 'intro':
            return 'intro';
        case 'flowSelect':
            return state.mode ? 'flowSelect' : 'intro';
        case 'quick1':
            return state.mode ? 'quick1' : 'intro';
        case 'quick2':
            if (!state.mode) {
                return 'intro';
            }
            if (state.flowType === 'quick' && state.quickTags.length === 0) {
                return 'quick1';
            }
            return 'quick2';
        case 'compare1':
            if (!state.mode) {
                return 'intro';
            }
            return state.flowType === 'compare' ? 'compare1' : 'flowSelect';
        case 'compare2':
            if (!state.mode) {
                return 'intro';
            }
            return state.flowType === 'compare' ? 'compare2' : 'flowSelect';
        case 'compare3':
            if (!state.mode) {
                return 'intro';
            }
            if (state.flowType !== 'compare') {
                return 'flowSelect';
            }
            if (state.candidates.length < 2) {
                return 'compare2';
            }
            return 'compare3';
        case 'compare4':
            if (!state.mode) {
                return 'intro';
            }
            if (state.flowType !== 'compare') {
                return 'flowSelect';
            }
            if (state.candidates.length < 2) {
                return 'compare2';
            }
            if (!hasCompleteScores(state.candidates, state.scores)) {
                return 'compare3';
            }
            return 'compare4';
        default:
            return 'intro';
    }
}

function App() {
    const [state, dispatch] = useReducer(appReducer, initialAppState, loadAppState);
    const {
        currentStep,
        mode,
        flowType,
        weights,
        candidates,
        scores,
        quickTags,
        recommendationNonce,
    } = state;

    const guardedStep = useMemo(() => resolveGuardedStep(state), [state]);

    useEffect(() => {
        if (guardedStep !== currentStep) {
            dispatch({ type: 'NAVIGATE', step: guardedStep });
        }
    }, [currentStep, guardedStep]);

    useEffect(() => {
        saveAppState(state);
    }, [state]);

    const menusForMode = useMemo(() => {
        return MENU_DB.filter((menu) => isMenuAvailableForMode(menu, mode));
    }, [mode]);

    const availableQuickTags = useMemo(() => {
        return [...new Set(menusForMode.flatMap((menu) => menu.tags))].sort((a, b) => a.localeCompare(b, 'ko'));
    }, [menusForMode]);

    const quickRecommendation = useMemo(() => {
        return pickQuickRecommendation(quickTags, menusForMode, Math.random);
    }, [quickTags, menusForMode, recommendationNonce]);

    const randomRecommendation = useMemo(() => {
        return pickRandomRecommendation(quickTags, menusForMode, Math.random);
    }, [quickTags, menusForMode, recommendationNonce]);

    const randomMatchedTags = useMemo(() => {
        if (!randomRecommendation) {
            return [];
        }

        return scoreMenusByTags(quickTags, [randomRecommendation])[0]?.matchedTags ?? [];
    }, [quickTags, randomRecommendation]);

    const handleModeSelect = (selectedMode: Mode) => {
        dispatch({ type: 'SELECT_MODE', mode: selectedMode });
    };

    const handleFlowSelect = (flow: FlowType) => {
        dispatch({ type: 'SELECT_FLOW', flowType: flow });
    };

    const handleWeightsChange = (nextWeights: Weights) => {
        dispatch({ type: 'SET_WEIGHTS', weights: nextWeights });
    };

    const handleCandidatesChange = (nextCandidates: Candidate[]) => {
        dispatch({ type: 'SET_CANDIDATES', candidates: nextCandidates });
    };

    const handleScoreChange = (candidateId: string, criterion: CriterionKey, score: number) => {
        dispatch({ type: 'SET_SCORE', candidateId, criterion, score });
    };

    const handleTagsChange = (tags: QuickTag[]) => {
        dispatch({ type: 'SET_TAGS', tags });
    };

    const handleRefetchRecommendation = () => {
        dispatch({ type: 'REFETCH_RECOMMENDATION' });
    };

    const handleRestart = () => {
        dispatch({ type: 'RESET' });
    };

    const handleReWeight = () => {
        dispatch({ type: 'NAVIGATE', step: 'compare1' });
    };

    const renderScreen = () => {
        switch (guardedStep) {
            case 'intro':
                return <IntroScreen onSelectMode={handleModeSelect} />;
            case 'flowSelect':
                return (
                    <FlowSelectScreen
                        onSelectFlow={handleFlowSelect}
                        onBack={() => dispatch({ type: 'NAVIGATE', step: 'intro' })}
                    />
                );

            case 'quick1':
                return (
                    <QuickTagScreen
                        tags={availableQuickTags}
                        selectedTags={quickTags}
                        onTagsChange={handleTagsChange}
                        onNext={() => dispatch({ type: 'NAVIGATE', step: 'quick2' })}
                        onBack={() => dispatch({ type: 'NAVIGATE', step: 'flowSelect' })}
                    />
                );
            case 'quick2': {
                const isRandomFlow = flowType === 'random';
                const menu = isRandomFlow ? randomRecommendation : (quickRecommendation?.menu ?? null);
                const matchedTags = isRandomFlow ? randomMatchedTags : (quickRecommendation?.matchedTags ?? []);
                const candidatePoolSize = isRandomFlow ? 1 : (quickRecommendation?.candidatePoolSize ?? 1);

                return (
                    <QuickResultScreen
                        flowType={isRandomFlow ? 'random' : 'quick'}
                        menu={menu}
                        selectedTags={quickTags}
                        matchedTags={matchedTags}
                        candidatePoolSize={candidatePoolSize}
                        onRestart={() => dispatch({ type: 'NAVIGATE', step: 'quick1' })}
                        onRefetch={handleRefetchRecommendation}
                        onSelectFlow={() => {
                            if (isRandomFlow) {
                                dispatch({ type: 'SELECT_FLOW', flowType: 'quick' });
                            } else {
                                dispatch({ type: 'SELECT_FLOW', flowType: 'compare' });
                            }
                        }}
                        onHome={handleRestart}
                    />
                );
            }

            case 'compare1':
                return (
                    <WeightWizardScreen
                        weights={weights}
                        onWeightsChange={handleWeightsChange}
                        onNext={() => dispatch({ type: 'NAVIGATE', step: 'compare2' })}
                        onBack={() => dispatch({ type: 'NAVIGATE', step: 'flowSelect' })}
                    />
                );
            case 'compare2':
                return (
                    <CandidateInputScreen
                        candidates={candidates}
                        onCandidatesChange={handleCandidatesChange}
                        onNext={() => dispatch({ type: 'NAVIGATE', step: 'compare3' })}
                        onBack={() => dispatch({ type: 'NAVIGATE', step: 'compare1' })}
                    />
                );
            case 'compare3':
                return (
                    <ScoringBoardScreen
                        candidates={candidates}
                        scores={scores}
                        onScoreChange={handleScoreChange}
                        onNext={() => dispatch({ type: 'NAVIGATE', step: 'compare4' })}
                        onBack={() => dispatch({ type: 'NAVIGATE', step: 'compare2' })}
                    />
                );
            case 'compare4': {
                const result = buildCompareResult(weights, candidates, scores);
                return (
                    <ResultScreen
                        result={result}
                        candidates={candidates}
                        onRestart={handleRestart}
                        onReWeight={handleReWeight}
                    />
                );
            }

            default:
                return <IntroScreen onSelectMode={handleModeSelect} />;
        }
    };

    return <AppShell theme={mode}>{renderScreen()}</AppShell>;
}

export default App;


