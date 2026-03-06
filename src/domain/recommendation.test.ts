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

    it('builds compare result winner with head-to-head fields', () => {
        const result = buildCompareResult(weights, candidates, scoreMatrix);

        expect(result).not.toBeNull();
        expect(result?.winnerId).toBe('c2');
        expect(result?.runnerUp?.candidateId).toBe('c1');
        expect(result?.isTie).toBe(false);
        expect(result?.summaryTone).toBe('close');
        expect(result?.firstPlaceCount).toBe(1);
        expect(result?.scoreGapFromRunnerUp).toBe(0.1);
        expect(result?.winnerScoreByKey.price.weightedScore).toBe(1.2);
        expect(result?.comparisonByKey?.taste.weightedGap).toBe(-0.5);
        expect(result?.comparisonByKey?.price.leaderCandidateId).toBe('c2');
        expect(result?.leadingCriteria).toEqual(['price']);
        expect(result?.trailingCriteria).toEqual(['taste']);
        expect(result?.tiedCriteria).toEqual(['distance']);
        expect(result?.decidingCriteria).toEqual(['price']);
    });

    it('supports two-candidate compare with clear winner summary', () => {
        const twoCandidates: Candidate[] = [
            { id: 'a', name: 'A식당' },
            { id: 'b', name: 'B식당' },
        ];

        const twoCandidateScores: ScoreMatrix = {
            a: { taste: 5, price: 5, distance: 4 },
            b: { taste: 2, price: 3, distance: 3 },
        };

        const result = buildCompareResult(weights, twoCandidates, twoCandidateScores);

        expect(result).not.toBeNull();
        expect(result?.ranking).toHaveLength(2);
        expect(result?.winnerId).toBe('a');
        expect(result?.runnerUp?.candidateId).toBe('b');
        expect(result?.summaryTone).toBe('clear');
        expect(result?.scoreGapFromRunnerUp).toBeGreaterThan(0.3);
    });

    it('keeps top candidate group when first place is tied', () => {
        const tieCandidates: Candidate[] = [
            { id: 'a', name: 'A식당' },
            { id: 'b', name: 'B식당' },
            { id: 'c', name: 'C식당' },
        ];

        const tieScores: ScoreMatrix = {
            a: { taste: 5, price: 3, distance: 1 },
            b: { taste: 4, price: 4, distance: 2 },
            c: { taste: 2, price: 2, distance: 2 },
        };

        const result = buildCompareResult(weights, tieCandidates, tieScores);

        expect(result).not.toBeNull();
        expect(result?.isTie).toBe(true);
        expect(result?.summaryTone).toBe('tie');
        expect(result?.firstPlaceCount).toBe(2);
        expect(result?.topCandidates.map((item) => item.candidateId)).toEqual(['a', 'b']);
        expect(result?.comparisonByKey).toBeNull();
        expect(result?.runnerUp?.candidateId).toBe('c');
    });

    it('ranks four candidates in score order with enriched ranking fields', () => {
        const fourCandidates: Candidate[] = [
            { id: 'a', name: 'A식당' },
            { id: 'b', name: 'B식당' },
            { id: 'c', name: 'C식당' },
            { id: 'd', name: 'D식당' },
        ];

        const fourCandidateScores: ScoreMatrix = {
            a: { taste: 5, price: 4, distance: 4 },
            b: { taste: 4, price: 4, distance: 4 },
            c: { taste: 3, price: 3, distance: 4 },
            d: { taste: 2, price: 2, distance: 2 },
        };

        const result = buildCompareResult(weights, fourCandidates, fourCandidateScores);

        expect(result).not.toBeNull();
        expect(result?.ranking).toHaveLength(4);
        expect(result?.ranking.map((item) => item.candidateId)).toEqual(['a', 'b', 'c', 'd']);
        expect(result?.ranking[3]?.scoreByKey.distance.rawScore).toBe(2);
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
