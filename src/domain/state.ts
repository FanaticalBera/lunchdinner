import type { Candidate, FlowType, Mode, QuickTag, Step } from './types';

export interface AppState {
    currentStep: Step;
    mode: Mode | null;
    flowType: FlowType;
    candidates: Candidate[];
    quickTags: QuickTag[];
    recommendationNonce: number;
}

export type AppAction =
    | { type: 'NAVIGATE'; step: Step }
    | { type: 'SELECT_MODE'; mode: Mode }
    | { type: 'SELECT_FLOW'; flowType: FlowType }
    | { type: 'SET_CANDIDATES'; candidates: Candidate[] }
    | { type: 'SET_TAGS'; tags: QuickTag[] }
    | { type: 'REFETCH_RECOMMENDATION' }
    | { type: 'RESET' };

const INITIAL_CANDIDATES: Candidate[] = [
    { id: '1', name: '김치찌개 전문점', icon: '🍲' },
    { id: '2', name: '옆집 돈까스', icon: '🍱' },
];

export function createInitialAppState(): AppState {
    return {
        currentStep: 'intro',
        mode: null,
        flowType: 'quick',
        candidates: INITIAL_CANDIDATES.map((candidate) => ({ ...candidate })),
        quickTags: [],
        recommendationNonce: 0,
    };
}

export const initialAppState: AppState = createInitialAppState();

const flowToStep: Record<FlowType, Step> = {
    quick: 'quick1',
    random: 'quick2',
    compare: 'compare2',
};

export function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'NAVIGATE':
            return {
                ...state,
                currentStep: action.step,
            };
        case 'SELECT_MODE':
            return {
                ...state,
                mode: action.mode,
                currentStep: 'flowSelect',
            };
        case 'SELECT_FLOW':
            return {
                ...state,
                flowType: action.flowType,
                currentStep: flowToStep[action.flowType],
                recommendationNonce: 0,
            };
        case 'SET_CANDIDATES':
            return {
                ...state,
                candidates: action.candidates,
            };
        case 'SET_TAGS':
            return {
                ...state,
                quickTags: [...new Set(action.tags)],
                recommendationNonce: 0,
            };
        case 'REFETCH_RECOMMENDATION':
            return {
                ...state,
                recommendationNonce: state.recommendationNonce + 1,
            };
        case 'RESET':
            return createInitialAppState();
        default:
            return state;
    }
}
