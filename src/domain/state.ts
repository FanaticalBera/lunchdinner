import type { Candidate, CriterionKey, FlowType, Mode, QuickTag, ScoreMatrix, Step, Weights } from './types';

export interface AppState {
    currentStep: Step;
    mode: Mode | null;
    flowType: FlowType;
    weights: Weights;
    candidates: Candidate[];
    scores: ScoreMatrix;
    quickTags: QuickTag[];
    recommendationNonce: number;
}

export type AppAction =
    | { type: 'NAVIGATE'; step: Step }
    | { type: 'SELECT_MODE'; mode: Mode }
    | { type: 'SELECT_FLOW'; flowType: FlowType }
    | { type: 'SET_WEIGHTS'; weights: Weights }
    | { type: 'SET_CANDIDATES'; candidates: Candidate[] }
    | { type: 'SET_SCORE'; candidateId: string; criterion: CriterionKey; score: number }
    | { type: 'SET_TAGS'; tags: QuickTag[] }
    | { type: 'REFETCH_RECOMMENDATION' }
    | { type: 'RESET' };

const INITIAL_CANDIDATES: Candidate[] = [
    { id: '1', name: '김치찌개 전문점', icon: '🍲' },
    { id: '2', name: '옆집 돈까스', icon: '🍱' },
];

const INITIAL_WEIGHTS: Weights = {
    taste: 40,
    price: 35,
    distance: 25,
};

export function createInitialAppState(): AppState {
    return {
        currentStep: 'intro',
        mode: null,
        flowType: 'quick',
        weights: { ...INITIAL_WEIGHTS },
        candidates: INITIAL_CANDIDATES.map((candidate) => ({ ...candidate })),
        scores: {},
        quickTags: [],
        recommendationNonce: 0,
    };
}

export const initialAppState: AppState = createInitialAppState();

const flowToStep: Record<FlowType, Step> = {
    quick: 'quick1',
    random: 'quick2',
    compare: 'compare1',
};

function pickValidScores(scores: ScoreMatrix, validCandidateIds: Set<string>): ScoreMatrix {
    return Object.fromEntries(
        Object.entries(scores).filter(([candidateId]) => validCandidateIds.has(candidateId))
    );
}

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
        case 'SET_WEIGHTS':
            return {
                ...state,
                weights: action.weights,
            };
        case 'SET_CANDIDATES': {
            const validIds = new Set(action.candidates.map((candidate) => candidate.id));
            return {
                ...state,
                candidates: action.candidates,
                scores: pickValidScores(state.scores, validIds),
            };
        }
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
