import { describe, expect, it } from 'vitest';
import { loadAppState, saveAppState } from './persistence';
import { pickQuickRecommendation, pickRandomRecommendation, type MenuItem } from './recommendation';
import { appReducer, createInitialAppState } from './state';

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

const KIMCHI_STEW = '\uAE40\uCE58\uCC0C\uAC1C';
const PORK_CUTLET = '\uB3C8\uAE4C\uC2A4';
const UDON = '\uC6B0\uB3D9';
const SALAD = '\uC0D0\uB7EC\uB4DC';
const SOUP = '\uAD6D\uBB3C';
const SPICY = '\uB9E4\uC6B4\uB9DB';
const KOREAN = '\uD55C\uC2DD';
const MEAT = '\uACE0\uAE30';
const VALUE = '\uAC00\uC131\uBE44';
const WESTERN = '\uC591\uC2DD';
const LIGHT = '\uAC00\uBCBC\uC6B4';
const JAPANESE = '\uC77C\uC2DD';
const HEALTHY = '\uAC74\uAC15\uD55C';
const LEGACY_RESTAURANT = '\uAE40\uCE58\uCC0C\uAC1C \uC804\uBB38\uC810';
const LEGACY_NEIGHBOR = '\uC606\uC9D1 \uB3C8\uAE4C\uC2A4';
const MALATANG = '\uB9C8\uB77C\uD0D5';

const FLOW_TEST_MENUS: MenuItem[] = [
    { id: 'm1', name: KIMCHI_STEW, tags: [SOUP, SPICY, KOREAN] },
    { id: 'm2', name: PORK_CUTLET, tags: [MEAT, VALUE, WESTERN] },
    { id: 'm3', name: UDON, tags: [SOUP, LIGHT, JAPANESE] },
    { id: 'm4', name: SALAD, tags: [LIGHT, HEALTHY] },
];

describe('flow smoke', () => {
    it('passes intro -> quick/random path with recommendation refresh', () => {
        let state = createInitialAppState();

        state = appReducer(state, { type: 'SELECT_MODE', mode: 'lunch' });
        expect(state.currentStep).toBe('flowSelect');

        state = appReducer(state, { type: 'SELECT_FLOW', flowType: 'quick' });
        expect(state.currentStep).toBe('quick1');

        state = appReducer(state, { type: 'SET_TAGS', tags: [SOUP, SPICY] });
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

    it('passes compare path into candidate input -> compare result', () => {
        let state = createInitialAppState();

        state = appReducer(state, { type: 'SELECT_MODE', mode: 'dinner' });
        state = appReducer(state, { type: 'SELECT_FLOW', flowType: 'compare' });
        expect(state.currentStep).toBe('compare2');

        state = appReducer(state, {
            type: 'SET_CANDIDATES',
            candidates: [
                { id: 'a', name: KIMCHI_STEW },
                { id: 'b', name: PORK_CUTLET },
                { id: 'c', name: UDON },
            ],
        });

        state = appReducer(state, { type: 'NAVIGATE', step: 'compareResult' });
        expect(state.currentStep).toBe('compareResult');
        expect(state.candidates).toHaveLength(3);
    });

    it('resets mode and transient selections when returning to intro', () => {
        let state = createInitialAppState();

        state = appReducer(state, { type: 'SELECT_MODE', mode: 'dinner' });
        state = appReducer(state, { type: 'SELECT_FLOW', flowType: 'compare' });
        state = appReducer(state, {
            type: 'SET_CANDIDATES',
            candidates: [
                { id: 'a', name: KIMCHI_STEW },
                { id: 'b', name: PORK_CUTLET },
            ],
        });
        state = appReducer(state, { type: 'RESET' });

        expect(state).toEqual(createInitialAppState());
    });

    it('keeps compare result when candidate compression leaves one item', () => {
        let state = createInitialAppState();

        state = appReducer(state, { type: 'SELECT_MODE', mode: 'dinner' });
        state = appReducer(state, { type: 'SELECT_FLOW', flowType: 'compare' });
        state = appReducer(state, {
            type: 'SET_CANDIDATES',
            candidates: [
                { id: 'a', name: KIMCHI_STEW },
                { id: 'b', name: PORK_CUTLET },
            ],
        });
        state = appReducer(state, { type: 'NAVIGATE', step: 'compareResult' });
        state = appReducer(state, {
            type: 'SET_CANDIDATES',
            candidates: [{ id: 'a', name: KIMCHI_STEW }],
        });

        expect(state.currentStep).toBe('compareResult');
        expect(state.candidates).toHaveLength(1);
    });

    it('saves/restores state and handles invalid storage payloads', () => {
        const globalAny = globalThis as any;
        const previousWindow = globalAny.window;
        const localStorage = new MemoryStorage();
        globalAny.window = { localStorage };

        try {
            let state = createInitialAppState();
            state = appReducer(state, { type: 'SELECT_MODE', mode: 'lunch' });
            state = appReducer(state, { type: 'SELECT_FLOW', flowType: 'compare' });
            state = appReducer(state, {
                type: 'SET_CANDIDATES',
                candidates: [
                    { id: 'a', name: KIMCHI_STEW },
                    { id: 'b', name: PORK_CUTLET },
                ],
            });
            state = appReducer(state, { type: 'NAVIGATE', step: 'compareResult' });

            saveAppState(state);

            const restored = loadAppState(createInitialAppState());
            expect(restored.mode).toBe('lunch');
            expect(restored.flowType).toBe('compare');
            expect(restored.currentStep).toBe('compareResult');
            expect(restored.candidates).toHaveLength(2);

            localStorage.setItem('appState:v1', JSON.stringify({
                version: 1,
                state: {
                    currentStep: 'compare2',
                    mode: 'dinner',
                    flowType: 'compare',
                    candidates: [
                        { id: '1', name: LEGACY_RESTAURANT },
                        { id: '2', name: LEGACY_NEIGHBOR },
                        { id: '3', name: MALATANG },
                    ],
                    quickTags: [],
                    recommendationNonce: 0,
                },
            }));
            const migrated = loadAppState(createInitialAppState());
            expect(migrated.candidates).toEqual([{ id: '3', name: MALATANG }]);

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