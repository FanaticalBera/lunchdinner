import { describe, expect, it } from 'vitest';
import {
    buildCompareResult,
    calculateCandidateTotals,
    pickQuickRecommendation,
    pickRandomRecommendation,
    rankCandidateTotals,
    type ScoreMatrix,
    type Weights,
} from './recommendation';
import type { Candidate } from './types';

describe('recommendation domain', () => {
    const weights: Weights = {
        taste: 50,
        price: 30,
        distance: 20,
    };

    const candidates: Candidate[] = [
        { id: 'c1', name: '김치찌개' },
        { id: 'c2', name: '돈까스' },
        { id: 'c3', name: '우동' },
    ];

    const scoreMatrix: ScoreMatrix = {
        c1: { taste: 5, price: 3, distance: 4 },
        c2: { taste: 4, price: 5, distance: 5 },
        c3: { taste: 3, price: 4, distance: 3 },
    };

    it('calculates weighted totals for candidates', () => {
        const totals = calculateCandidateTotals(weights, candidates, scoreMatrix);

        expect(totals).toEqual([
            { candidateId: 'c1', candidateName: '김치찌개', score: 4.2 },
            { candidateId: 'c2', candidateName: '돈까스', score: 4.5 },
            { candidateId: 'c3', candidateName: '우동', score: 3.5 },
        ]);
    });

    it('ranks candidates and preserves tie metadata', () => {
        const totals = [
            { candidateId: 'c2', candidateName: '돈까스', score: 4.5 },
            { candidateId: 'c1', candidateName: '김치찌개', score: 4.5 },
            { candidateId: 'c3', candidateName: '우동', score: 3.5 },
        ];

        const ranked = rankCandidateTotals(totals);

        expect(ranked).toEqual([
            { candidateId: 'c1', candidateName: '김치찌개', score: 4.5, rank: 1, isTie: true },
            { candidateId: 'c2', candidateName: '돈까스', score: 4.5, rank: 1, isTie: true },
            { candidateId: 'c3', candidateName: '우동', score: 3.5, rank: 3, isTie: false },
        ]);
    });

    it('builds compare result summary with weighted winner reason', () => {
        const result = buildCompareResult(weights, candidates, scoreMatrix);

        expect(result).not.toBeNull();
        expect(result?.winnerName).toBe('돈까스');
        expect(result?.ranking).toHaveLength(3);
        expect(result?.comparisonByKey?.taste.leaderCandidateName).toBe('김치찌개');
        expect(result?.comparisonByKey?.price.leaderCandidateName).toBe('돈까스');
        expect(result?.reason).toContain('돈까스');
    });

    it('detects ties and returns tie summary tone', () => {
        const twoCandidates: Candidate[] = [
            { id: 'a', name: '국밥' },
            { id: 'b', name: '비빔밥' },
        ];
        const twoCandidateScores: ScoreMatrix = {
            a: { taste: 4, price: 4, distance: 4 },
            b: { taste: 4, price: 4, distance: 4 },
        };

        const result = buildCompareResult(weights, twoCandidates, twoCandidateScores);

        expect(result?.isTie).toBe(true);
        expect(result?.summaryTone).toBe('tie');
        expect(result?.firstPlaceCount).toBe(2);
    });

    it('returns close summary when winner gap is narrow', () => {
        const tieCandidates: Candidate[] = [
            { id: 'a', name: '냉면' },
            { id: 'b', name: '쌀국수' },
        ];
        const tieScores: ScoreMatrix = {
            a: { taste: 4, price: 4, distance: 4 },
            b: { taste: 4, price: 4, distance: 3 },
        };

        const result = buildCompareResult(weights, tieCandidates, tieScores);

        expect(result?.isTie).toBe(false);
        expect(result?.summaryTone).toBe('close');
        expect(result?.scoreGapFromRunnerUp).toBe(0.2);
        expect(result?.reason).toContain('근소한 우세');
    });

    it('supports four candidates and keeps descending rank order', () => {
        const fourCandidates: Candidate[] = [
            { id: 'a', name: '김밥' },
            { id: 'b', name: '라면' },
            { id: 'c', name: '쌀국수' },
            { id: 'd', name: '파스타' },
        ];
        const fourCandidateScores: ScoreMatrix = {
            a: { taste: 4, price: 5, distance: 5 },
            b: { taste: 3, price: 4, distance: 4 },
            c: { taste: 5, price: 3, distance: 2 },
            d: { taste: 4, price: 2, distance: 3 },
        };

        const result = buildCompareResult(weights, fourCandidates, fourCandidateScores);

        expect(result?.ranking.map((item) => item.candidateName)).toEqual(['김밥', '라면', '쌀국수', '파스타']);
        expect(result?.ranking[0]?.score).toBeGreaterThan(result?.ranking[1]?.score ?? 0);
    });

    it('picks a quick recommendation from top matched menus', () => {
        const menus = [
            { id: 'm1', name: '김치찌개', tags: ['국물', '매운맛', '한식'] },
            { id: 'm2', name: '우동', tags: ['국물', '가벼운', '일식'] },
            { id: 'm3', name: '비빔밥', tags: ['한식', '든든한'] },
        ];

        const result = pickQuickRecommendation(['국물', '한식'], menus, () => 0.49);

        expect(result?.menu.name).toBe('김치찌개');
        expect(result?.matchedTags).toEqual(['국물', '한식']);
        expect(result?.candidatePoolSize).toBe(1);
    });

    it('falls back to all menus when random tag match pool is empty', () => {
        const menus = [
            { id: 'm1', name: '김치찌개', tags: ['국물', '매운맛', '한식'] },
            { id: 'm2', name: '우동', tags: ['국물', '가벼운', '일식'] },
            { id: 'm3', name: '샐러드', tags: ['가벼운', '건강한'] },
        ];

        const result = pickRandomRecommendation(['치즈'], menus, () => 0.8);

        expect(result?.name).toBe('샐러드');
    });
});
