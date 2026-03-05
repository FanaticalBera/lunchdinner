import { describe, expect, it } from 'vitest';
import {
    buildCompareResult,
    calculateCandidateTotals,
    pickQuickRecommendation,
    pickRandomRecommendation,
    rankCandidateTotals,
    type MenuItem,
} from './recommendation';
import type { Candidate, ScoreMatrix, Weights } from './types';

describe('recommendation domain', () => {
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

    it('calculates weighted totals', () => {
        const totals = calculateCandidateTotals(weights, candidates, scoreMatrix);

        expect(totals).toHaveLength(3);
        expect(totals.find((item) => item.candidateId === 'c2')?.score).toBe(3.3);
    });

    it('ranks ties correctly', () => {
        const ranked = rankCandidateTotals([
            { candidateId: 'a', candidateName: 'A', score: 3.3 },
            { candidateId: 'b', candidateName: 'B', score: 3.3 },
            { candidateId: 'c', candidateName: 'C', score: 2.1 },
        ]);

        expect(ranked[0]?.rank).toBe(1);
        expect(ranked[1]?.rank).toBe(1);
        expect(ranked[2]?.rank).toBe(3);
        expect(ranked[0]?.isTie).toBe(true);
    });

    it('builds compare result winner', () => {
        const result = buildCompareResult(weights, candidates, scoreMatrix);

        expect(result).not.toBeNull();
        expect(result?.winnerId).toBe('c2');
    });

    it('picks quick recommendation from best matched menu', () => {
        const menus: MenuItem[] = [
            { id: 'm1', name: '짬뽕', tags: ['국물', '매운맛'] },
            { id: 'm2', name: '제육덮밥', tags: ['고기', '매운맛'] },
            { id: 'm3', name: '샐러드', tags: ['가벼운'] },
        ];

        const quick = pickQuickRecommendation(['국물', '매운맛'], menus);

        expect(quick).not.toBeNull();
        expect(quick?.menu.id).toBe('m1');
        expect(quick?.matchedTagCount).toBe(2);
    });

    it('picks random recommendation from tag pool or fallback pool', () => {
        const menus: MenuItem[] = [
            { id: 'm1', name: '짬뽕', tags: ['국물', '매운맛'] },
            { id: 'm2', name: '제육덮밥', tags: ['고기', '매운맛'] },
            { id: 'm3', name: '샐러드', tags: ['가벼운'] },
        ];

        const randomByTag = pickRandomRecommendation(['가벼운'], menus, () => 0.7);
        expect(randomByTag?.id).toBe('m3');

        const randomFallback = pickRandomRecommendation(['없는태그'], menus, () => 0.8);
        expect(randomFallback?.id).toBe('m3');
    });
});
