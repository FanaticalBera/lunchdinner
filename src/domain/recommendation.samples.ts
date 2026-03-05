import {
    buildCompareResult,
    calculateCandidateTotals,
    pickQuickRecommendation,
    pickRandomRecommendation,
    rankCandidateTotals,
    type MenuItem,
} from './recommendation.ts';
import type { Candidate, ScoreMatrix, Weights } from './types.ts';

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

export function runRecommendationSamples(): void {
    const weights: Weights = {
        taste: 50,
        price: 30,
        distance: 20,
    };

    const candidates: Candidate[] = [
        { id: 'c1', name: '김치찌개' },
        { id: 'c2', name: '돈까스' },
        { id: 'c3', name: '비빔밥' },
    ];

    const scoreMatrix: ScoreMatrix = {
        c1: { taste: 4, price: 2, distance: 3 },
        c2: { taste: 3, price: 4, distance: 3 },
        c3: { taste: 2, price: 4, distance: 4 },
    };

    const totals = calculateCandidateTotals(weights, candidates, scoreMatrix);
    assertEqual(totals.length, 3, '총점 계산 결과 개수 오류');

    const c2 = totals.find((item) => item.candidateId === 'c2');
    assert(c2 !== undefined, '돈까스 후보 총점 누락');
    assertEqual(c2?.score, 3.3, '돈까스 총점 계산 오류');

    const ranked = rankCandidateTotals([
        { candidateId: 'a', candidateName: 'A', score: 3.3 },
        { candidateId: 'b', candidateName: 'B', score: 3.3 },
        { candidateId: 'c', candidateName: 'C', score: 2.1 },
    ]);
    assertEqual(ranked[0].rank, 1, '동점 1위 rank 오류');
    assertEqual(ranked[1].rank, 1, '동점 1위 rank 오류');
    assertEqual(ranked[2].rank, 3, '다음 순위 rank 오류');
    assertEqual(ranked[0].isTie, true, '동점 표시 오류');

    const compareResult = buildCompareResult(weights, candidates, scoreMatrix);
    assert(compareResult !== null, '결과 생성 실패');
    assertEqual(compareResult?.winnerId, 'c2', '우승 후보 계산 오류');

    const menus: MenuItem[] = [
        { id: 'm1', name: '짬뽕', tags: ['국물', '매운맛'] },
        { id: 'm2', name: '제육덮밥', tags: ['고기', '매운맛'] },
        { id: 'm3', name: '샐러드', tags: ['가벼운'] },
    ];

    const quick = pickQuickRecommendation(['국물', '매운맛'], menus);
    assert(quick !== null, '퀵 추천 실패');
    assertEqual(quick?.menu.id, 'm1', '퀵 추천 최상위 선택 오류');
    assertEqual(quick?.matchedTagCount, 2, '퀵 추천 매칭 개수 오류');

    const randomByTag = pickRandomRecommendation(['가벼운'], menus, () => 0.7);
    assertEqual(randomByTag?.id, 'm3', '랜덤 추천(태그 풀) 선택 오류');

    const randomFallback = pickRandomRecommendation(['없는태그'], menus, () => 0.8);
    assertEqual(randomFallback?.id, 'm3', '랜덤 추천(fallback 풀) 선택 오류');
}

runRecommendationSamples();
console.log('Step 4 sample validation passed');
