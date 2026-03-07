import {
    buildCompareResult,
    calculateCandidateTotals,
    pickQuickRecommendation,
    pickRandomRecommendation,
    rankCandidateTotals,
    type MenuItem,
    type ScoreMatrix,
    type Weights,
} from './recommendation.ts';
import type { Candidate } from './types.ts';

function section(title: string): void {
    console.log(`\n=== ${title} ===`);
}

function main(): void {
    section('weighted compare result');
    const candidates: Candidate[] = [
        { id: 'c1', name: '김치찌개' },
        { id: 'c2', name: '돈까스' },
        { id: 'c3', name: '우동' },
    ];

    const weights: Weights = {
        taste: 50,
        price: 30,
        distance: 20,
    };

    const scoreMatrix: ScoreMatrix = {
        c1: { taste: 5, price: 3, distance: 4 },
        c2: { taste: 4, price: 5, distance: 5 },
        c3: { taste: 3, price: 4, distance: 3 },
    };

    const totals = calculateCandidateTotals(weights, candidates, scoreMatrix);
    console.log('candidate totals', totals);

    const ranked = rankCandidateTotals(totals);
    console.log('ranked totals', ranked);

    const compareResult = buildCompareResult(weights, candidates, scoreMatrix);
    console.log('compare result winner', compareResult?.winnerName);
    console.log('compare result reason', compareResult?.reason);

    section('tag based quick / random');
    const menus: MenuItem[] = [
        { id: 'm1', name: '김치찌개', tags: ['국물', '매운맛', '한식'] },
        { id: 'm2', name: '돈까스', tags: ['고기', '바삭함', '양식'] },
        { id: 'm3', name: '우동', tags: ['국물', '가벼운', '일식'] },
    ];

    const quickResult = pickQuickRecommendation(['국물', '매운맛'], menus, () => 0);
    console.log('quick recommendation', quickResult?.menu.name, quickResult?.matchedTags);

    const randomResult = pickRandomRecommendation(['국물'], menus, () => 0.6);
    console.log('random recommendation', randomResult?.name);
}

main();
