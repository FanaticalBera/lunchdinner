import { useEffect, useMemo, useReducer } from 'react';
import { AppShell } from './components/common/AppShell';
import { IntroScreen } from './screens/IntroScreen';
import { FlowSelectScreen } from './screens/FlowSelectScreen';
import { QuickTagScreen } from './screens/QuickTagScreen';
import { QuickResultScreen } from './screens/QuickResultScreen';
import { CandidateInputScreen } from './screens/CandidateInputScreen';
import { CompareResultScreen } from './screens/CompareResultScreen';
import { appReducer, initialAppState, type AppState } from './domain/state';
import { loadAppState, saveAppState } from './domain/persistence';
import {
    pickQuickRecommendation,
    pickRandomRecommendation,
    scoreMenusByTags,
    type MenuItem,
} from './domain/recommendation';
import type { Candidate, FlowType, Mode, QuickTag, Step } from './domain/types';
import menuDbRaw from './data/menu-db.json';

const MENU_DB = menuDbRaw as MenuItem[];
const MAX_COMPARE_CANDIDATES = 4;

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
        case 'compare2':
            if (!state.mode) {
                return 'intro';
            }
            return state.flowType === 'compare' ? 'compare2' : 'flowSelect';
        case 'compareResult':
            if (!state.mode) {
                return 'intro';
            }
            if (state.flowType !== 'compare') {
                return 'flowSelect';
            }
            if (state.candidates.length < 1 || state.candidates.length > MAX_COMPARE_CANDIDATES) {
                return 'compare2';
            }
            return 'compareResult';
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
        candidates,
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

    const handleCandidatesChange = (nextCandidates: Candidate[]) => {
        dispatch({ type: 'SET_CANDIDATES', candidates: nextCandidates });
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

    const renderScreen = () => {
        switch (guardedStep) {
            case 'intro':
                return <IntroScreen onSelectMode={handleModeSelect} />;
            case 'flowSelect':
                return (
                    <FlowSelectScreen
                        onSelectFlow={handleFlowSelect}
                        onBack={handleRestart}
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
            case 'compare2':
                return (
                    <CandidateInputScreen
                        candidates={candidates}
                        maxCandidates={MAX_COMPARE_CANDIDATES}
                        onCandidatesChange={handleCandidatesChange}
                        onNext={() => dispatch({ type: 'NAVIGATE', step: 'compareResult' })}
                        onBack={() => dispatch({ type: 'NAVIGATE', step: 'flowSelect' })}
                    />
                );
            case 'compareResult':
                return (
                    <CompareResultScreen
                        candidates={candidates}
                        drawNonce={recommendationNonce}
                        onRedraw={handleRefetchRecommendation}
                        onRemoveCandidate={(id) => handleCandidatesChange(candidates.filter((candidate) => candidate.id !== id))}
                        onBack={() => dispatch({ type: 'NAVIGATE', step: 'compare2' })}
                        onHome={handleRestart}
                    />
                );
            default:
                return <IntroScreen onSelectMode={handleModeSelect} />;
        }
    };

    return <AppShell theme={mode}>{renderScreen()}</AppShell>;
}

export default App;
