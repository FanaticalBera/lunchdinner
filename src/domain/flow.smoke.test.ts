import { describe, expect, it } from 'vitest';
import { loadAppState, saveAppState } from './persistence';
import { buildCompareResult, pickQuickRecommendation, pickRandomRecommendation, type MenuItem } from './recommendation';
import { appReducer, createInitialAppState, type AppState } from './state';
import type { CriterionKey } from './types';

class MemoryStorage {
    private data = new Map<string, string>();

    getItem(key: string): string | null {
        return this.data.has(key) ? this.data.get(key) ?? null : null;
    }

    setItem(key: string, value: string): void {
        this.data.set(key, value);
    }

    removeItem(key: string): void {
        this.data.delete(key);
    }

    clear(): void {
        this.data.clear();
    }
}

const FLOW_TEST_MENUS: MenuItem[] = [
    { id: 'm1', name: '김치찌개', tags: ['국물', '매운맛', '한식'] },
    { id: 'm2', name: '돈까스', tags: ['고기', '가성비', '양식'] },
    { id: 'm3', name: '우동', tags: ['국물', '가벼운', '일식'] },
    { id: 'm4', name: '샐러드', tags: ['가벼운', '건강한'] },
];

function setAllScores(state: AppState, score: number): AppState {
    const keys: CriterionKey[] = ['taste', 'price', 'distance'];
    let next = state;

    state.candidates.forEach((candidate) => {
        keys.forEach((key) => {
            next = appReducer(next, {
                type: 'SET_SCORE',
                candidateId: candidate.id,
                criterion: key,
                score,
            });
        });
    });

    return next;
}

describe('flow smoke', () => {
    it('passes intro -> quick/random path with recommendation refresh', () => {
        let state = createInitialAppState();

        state = appReducer(state, { type: 'SELECT_MODE', mode: 'lunch' });
        expect(state.currentStep).toBe('flowSelect');

        state = appReducer(state, { type: 'SELECT_FLOW', flowType: 'quick' });
        expect(state.currentStep).toBe('quick1');

        state = appReducer(state, { type: 'SET_TAGS', tags: ['국물', '매운맛'] });
        expect(state.quickTags).toHaveLength(2);

        state = appReducer(state, { type: 'NAVIGATE', step: 'quick2' });
        expect(state.currentStep).toBe('quick2');

        const quickResult = pickQuickRecommendation(state.quickTags, FLOW_TEST_MENUS, () => 0.1);
        expect(quickResult).not.toBeNull();

        const nonceBefore = state.recommendationNonce;
        state = appReducer(state, { type: 'REFETCH_RECOMMENDATION' });
        expect(state.recommendationNonce).toBe(nonceBefore + 1);

        state = appReducer(state, { type: 'SELECT_FLOW', flowType: 'random' });
        expect(state.currentStep).toBe('quick2');

        const randomResult = pickRandomRecommendation(state.quickTags, FLOW_TEST_MENUS, () => 0.7);
        expect(randomResult).not.toBeNull();
    });

    it('passes compare path and computes ranking', () => {
        let state = createInitialAppState();

        state = appReducer(state, { type: 'SELECT_MODE', mode: 'dinner' });
        state = appReducer(state, { type: 'SELECT_FLOW', flowType: 'compare' });
        expect(state.currentStep).toBe('compare1');

        state = appReducer(state, {
            type: 'SET_WEIGHTS',
            weights: { taste: 50, price: 30, distance: 20 },
        });

        state = appReducer(state, {
            type: 'SET_CANDIDATES',
            candidates: [
                { id: 'a', name: '김치찌개' },
                { id: 'b', name: '돈까스' },
                { id: 'c', name: '우동' },
            ],
        });

        state = setAllScores(state, 4);

        const result = buildCompareResult(state.weights, state.candidates, state.scores);
        expect(result).not.toBeNull();
        expect(result?.ranking).toHaveLength(3);
    });

    it('saves/restores state and handles invalid storage payloads', () => {
        const globalAny = globalThis as any;
        const previousWindow = globalAny.window;
        const localStorage = new MemoryStorage();
        globalAny.window = { localStorage };

        try {
            let state = createInitialAppState();
            state = appReducer(state, { type: 'SELECT_MODE', mode: 'lunch' });
            state = appReducer(state, { type: 'SELECT_FLOW', flowType: 'quick' });
            state = appReducer(state, { type: 'SET_TAGS', tags: ['한식', '국물'] });

            saveAppState(state);

            const restored = loadAppState(createInitialAppState());
            expect(restored.mode).toBe('lunch');
            expect(restored.flowType).toBe('quick');
            expect(restored.quickTags).toHaveLength(2);

            localStorage.setItem('appState:v1', JSON.stringify({ version: 999, state: {} }));
            const resetByVersion = loadAppState(createInitialAppState());
            expect(resetByVersion.currentStep).toBe('intro');

            localStorage.setItem('appState:v1', 'invalid-json');
            const resetByParseError = loadAppState(createInitialAppState());
            expect(resetByParseError.currentStep).toBe('intro');
        } finally {
            globalAny.window = previousWindow;
        }
    });
});
