import { useState } from 'react'
import { AppShell } from './components/common/AppShell'
import { IntroScreen } from './screens/IntroScreen'
import { FlowSelectScreen } from './screens/FlowSelectScreen'
import { QuickTagScreen } from './screens/QuickTagScreen'
import { QuickResultScreen } from './screens/QuickResultScreen'
import { WeightWizardScreen } from './screens/WeightWizardScreen'
import { CandidateInputScreen } from './screens/CandidateInputScreen'
import { ScoringBoardScreen } from './screens/ScoringBoardScreen'
import { ResultScreen } from './screens/ResultScreen'

export type AppMode = 'lunch' | 'dinner' | null;

function App() {
    const [currentStep, setCurrentStep] = useState<string>('intro');
    const [mode, setMode] = useState<AppMode>(null);

    const handleModeSelect = (selectedMode: 'lunch' | 'dinner') => {
        setMode(selectedMode);
        setCurrentStep('flowSelect');
    };

    const handleFlowSelect = (flow: 'quick' | 'compare') => {
        if (flow === 'quick') {
            setCurrentStep('quick1');
        } else {
            setCurrentStep('compare1');
        }
    };

    const handleRestart = () => {
        setCurrentStep('intro');
        setMode(null);
    };

    const handleReWeight = () => {
        setCurrentStep('compare1');
    };

    const renderScreen = () => {
        switch (currentStep) {
            case 'intro':
                return <IntroScreen onSelectMode={handleModeSelect} />;
            case 'flowSelect':
                return <FlowSelectScreen onSelectFlow={handleFlowSelect} onBack={() => setCurrentStep('intro')} />;

            // Route A: Quick Recommendation
            case 'quick1':
                return <QuickTagScreen onNext={() => setCurrentStep('quick2')} onBack={() => setCurrentStep('flowSelect')} />;
            case 'quick2':
                return <QuickResultScreen onRestart={() => setCurrentStep('quick1')} onSelectFlow={() => setCurrentStep('compare1')} />;

            // Route B: Manual Comparison
            case 'compare1':
                return <WeightWizardScreen onNext={() => setCurrentStep('compare2')} onBack={() => setCurrentStep('flowSelect')} />;
            case 'compare2':
                return <CandidateInputScreen onNext={() => setCurrentStep('compare3')} onBack={() => setCurrentStep('compare1')} />;
            case 'compare3':
                return <ScoringBoardScreen onNext={() => setCurrentStep('compare4')} onBack={() => setCurrentStep('compare2')} />;
            case 'compare4':
                return <ResultScreen onRestart={handleRestart} onReWeight={handleReWeight} />;

            default:
                return <IntroScreen onSelectMode={handleModeSelect} />;
        }
    };

    return (
        <AppShell theme={mode}>
            {renderScreen()}
        </AppShell>
    )
}

export default App
