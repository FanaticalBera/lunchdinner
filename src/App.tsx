import { useReducer } from 'react';
import { AppShell } from './components/common/AppShell';
import { IntroScreen } from './screens/IntroScreen';
import { FlowSelectScreen } from './screens/FlowSelectScreen';
import { QuickTagScreen } from './screens/QuickTagScreen';
import { QuickResultScreen } from './screens/QuickResultScreen';
import { WeightWizardScreen } from './screens/WeightWizardScreen';
import { CandidateInputScreen } from './screens/CandidateInputScreen';
import { ScoringBoardScreen } from './screens/ScoringBoardScreen';
import { ResultScreen } from './screens/ResultScreen';
import { appReducer, initialAppState } from './domain/state';
import type { CriterionKey, FlowType, Mode, Weights, Candidate } from './domain/types';

function App() {
    const [state, dispatch] = useReducer(appReducer, initialAppState);
    const { currentStep, mode, flowType, weights, candidates, scores } = state;

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

    const handleRestart = () => {
        dispatch({ type: 'RESET' });
    };

    const handleReWeight = () => {
        dispatch({ type: 'NAVIGATE', step: 'compare1' });
    };

    const renderScreen = () => {
        switch (currentStep) {
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
                        onNext={() => dispatch({ type: 'NAVIGATE', step: 'quick2' })}
                        onBack={() => dispatch({ type: 'NAVIGATE', step: 'flowSelect' })}
                    />
                );
            case 'quick2':
                return (
                    <QuickResultScreen
                        flowType={flowType === 'random' ? 'random' : 'quick'}
                        onRestart={() => dispatch({ type: 'NAVIGATE', step: 'quick1' })}
                        onRefetch={() => {
                            // TODO: Implement actual refetching logic later
                            console.log('Refetching with same tags...');
                        }}
                        onSelectFlow={() => {
                            if (flowType === 'random') {
                                dispatch({ type: 'SELECT_FLOW', flowType: 'quick' });
                            } else {
                                dispatch({ type: 'SELECT_FLOW', flowType: 'compare' });
                            }
                        }}
                        onHome={handleRestart}
                    />
                );

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
            case 'compare4':
                return <ResultScreen onRestart={handleRestart} onReWeight={handleReWeight} />;

            default:
                return <IntroScreen onSelectMode={handleModeSelect} />;
        }
    };

    return <AppShell theme={mode}>{renderScreen()}</AppShell>;
}

export default App;
