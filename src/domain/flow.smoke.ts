import { loadAppState, saveAppState } from './persistence.ts';
import { buildCompareResult, pickQuickRecommendation, pickRandomRecommendation, type MenuItem } from './recommendation.ts';
import { appReducer, createInitialAppState, type AppState } from './state.ts';
import type { CriterionKey } from './types.ts';

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

function assert(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
    if (actual !== expected) {
        throw new Error(`${message} (actual=${String(actual)}, expected=${String(expected)})`);
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

function runQuickFlowCheck(menus: MenuItem[]): void {
    let state = createInitialAppState();

    state = appReducer(state, { type: 'SELECT_MODE', mode: 'lunch' });
    assertEqual(state.currentStep, 'flowSelect', 'intro -> flowSelect 전이 실패');

    state = appReducer(state, { type: 'SELECT_FLOW', flowType: 'quick' });
    assertEqual(state.currentStep, 'quick1', 'flowSelect -> quick1 전이 실패');

    state = appReducer(state, { type: 'SET_TAGS', tags: ['국물', '매운맛'] });
    assertEqual(state.quickTags.length, 2, 'quick 태그 저장 실패');

    state = appReducer(state, { type: 'NAVIGATE', step: 'quick2' });
    assertEqual(state.currentStep, 'quick2', 'quick1 -> quick2 전이 실패');

    const quickResult = pickQuickRecommendation(state.quickTags, menus, () => 0.1);
    assert(quickResult !== null, 'quick 추천 결과 없음');

    const nonceBefore = state.recommendationNonce;
    state = appReducer(state, { type: 'REFETCH_RECOMMENDATION' });
    assertEqual(state.recommendationNonce, nonceBefore + 1, 'quick 재추천 nonce 증가 실패');

    state = appReducer(state, { type: 'SELECT_FLOW', flowType: 'random' });
    assertEqual(state.currentStep, 'quick2', 'random 플로우 전이 실패');

    const randomResult = pickRandomRecommendation(state.quickTags, menus, () => 0.7);
    assert(randomResult !== null, 'random 추천 결과 없음');
}

function runCompareFlowCheck(): void {
    let state = createInitialAppState();

    state = appReducer(state, { type: 'SELECT_MODE', mode: 'dinner' });
    state = appReducer(state, { type: 'SELECT_FLOW', flowType: 'compare' });
    assertEqual(state.currentStep, 'compare1', 'flowSelect -> compare1 전이 실패');

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
    assert(result !== null, 'compare 결과 계산 실패');
    assertEqual(result?.ranking.length, 3, 'compare 랭킹 개수 오류');
}

function runPersistenceCheck(): void {
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
        assertEqual(restored.mode, 'lunch', '복원 모드 오류');
        assertEqual(restored.flowType, 'quick', '복원 플로우 오류');
        assertEqual(restored.quickTags.length, 2, '복원 태그 개수 오류');

        localStorage.setItem('appState:v1', JSON.stringify({ version: 999, state: {} }));
        const resetByVersion = loadAppState(createInitialAppState());
        assertEqual(resetByVersion.currentStep, 'intro', '버전 불일치 초기화 실패');

        localStorage.setItem('appState:v1', 'invalid-json');
        const resetByParseError = loadAppState(createInitialAppState());
        assertEqual(resetByParseError.currentStep, 'intro', '파싱 실패 초기화 실패');
    } finally {
        globalAny.window = previousWindow;
    }
}

function runFlowSmoke(): void {
    runQuickFlowCheck(FLOW_TEST_MENUS);
    runCompareFlowCheck();
    runPersistenceCheck();
}

runFlowSmoke();
console.log('Flow smoke check passed: intro -> flow -> quick/compare -> result + persistence restore');




