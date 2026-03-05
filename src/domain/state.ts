import type { Candidate, CriterionKey, FlowType, Mode, QuickTag, ScoreMatrix, Step, Weights } from './types';

export interface AppState {
    currentStep: Step;
    mode: Mode | null;
    flowType: FlowType;
    weights: Weights;
    candidates: Candidate[];
    scores: ScoreMatrix;
    quickTags: QuickTag[];
}

export type AppAction =
    | { type: 'NAVIGATE'; step: Step }
    | { type: 'SELECT_MODE'; mode: Mode }
    | { type: 'SELECT_FLOW'; flowType: FlowType }
    | { type: 'SET_WEIGHTS'; weights: Weights }
    | { type: 'SET_CANDIDATES'; candidates: Candidate[] }
    | { type: 'SET_SCORE'; candidateId: string; criterion: CriterionKey; score: number }
    | { type: 'SET_TAGS'; tags: QuickTag[] }
    | { type: 'RESET' };

export const initialAppState: AppState = {
    currentStep: 'intro',
    mode: null,
    flowType: 'quick',
    weights: {
        taste: 40,
        price: 35,
        distance: 25,
    },
    candidates: [],
    scores: {},
    quickTags: [],
};

const flowToStep: Record<FlowType, Step> = {
    quick: 'quick1',
    random: 'quick2',
    compare: 'compare1',
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
            };
        case 'SET_WEIGHTS':
            return {
                ...state,
                weights: action.weights,
            };
        case 'SET_CANDIDATES':
            return {
                ...state,
                candidates: action.candidates,
            };
        case 'SET_SCORE':
            return {
                ...state,
                scores: {
                    ...state.scores,
                    [action.candidateId]: {
                        ...state.scores[action.candidateId],
                        [action.criterion]: action.score,
                    },
                },
            };
        case 'SET_TAGS':
            return {
                ...state,
                quickTags: [...new Set(action.tags)],
            };
        case 'RESET':
            return initialAppState;
        default:
            return state;
    }
}
