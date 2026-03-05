import type { Candidate, QuickTag, Result, ScoreMatrix, Weights } from './types';

export interface CandidateTotal {
    candidateId: Candidate['id'];
    candidateName: Candidate['name'];
    score: number;
}

export interface RankedCandidateTotal extends CandidateTotal {
    rank: number;
    isTie: boolean;
}

export interface MenuItem {
    id: string;
    name: string;
    tags: QuickTag[];
}

export interface MenuRecommendation {
    menu: MenuItem;
    matchedTags: QuickTag[];
    matchedTagCount: number;
    candidatePoolSize: number;
}

const WEIGHT_KEYS: Array<keyof Weights> = ['taste', 'price', 'distance'];

function round2(value: number): number {
    return Math.round(value * 100) / 100;
}

function normalizeTag(tag: string): string {
    return tag.trim().toLowerCase();
}

function uniqueNormalizedTags(tags: QuickTag[]): string[] {
    return [...new Set(tags.map(normalizeTag).filter(Boolean))];
}

function safeRandom(randomValue: number): number {
    if (!Number.isFinite(randomValue)) return 0;
    if (randomValue < 0) return 0;
    if (randomValue >= 1) return 0.999999;
    return randomValue;
}

export function calculateCandidateTotals(
    weights: Weights,
    candidates: Candidate[],
    scoreMatrix: ScoreMatrix
): CandidateTotal[] {
    const nonNegativeWeightTotal = WEIGHT_KEYS.reduce((acc, key) => acc + Math.max(0, weights[key]), 0);
    const weightTotal = nonNegativeWeightTotal > 0 ? nonNegativeWeightTotal : 1;

    return candidates.map((candidate) => {
        const candidateScores = scoreMatrix[candidate.id] ?? {};

        const weightedTotal = WEIGHT_KEYS.reduce((acc, key) => {
            const weightRatio = Math.max(0, weights[key]) / weightTotal;
            const rawScore = candidateScores[key] ?? 0;
            const clampedScore = Math.max(0, rawScore);
            return acc + (clampedScore * weightRatio);
        }, 0);

        return {
            candidateId: candidate.id,
            candidateName: candidate.name,
            score: round2(weightedTotal),
        };
    });
}

export function rankCandidateTotals(totals: CandidateTotal[]): RankedCandidateTotal[] {
    const sorted = [...totals].sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return a.candidateName.localeCompare(b.candidateName, 'ko');
    });

    const scoreCounts = new Map<string, number>();
    sorted.forEach((item) => {
        const key = item.score.toFixed(2);
        scoreCounts.set(key, (scoreCounts.get(key) ?? 0) + 1);
    });

    let currentRank = 0;
    let lastScore: number | null = null;

    return sorted.map((item, index) => {
        if (lastScore === null || item.score !== lastScore) {
            currentRank = index + 1;
            lastScore = item.score;
        }

        const key = item.score.toFixed(2);
        return {
            ...item,
            rank: currentRank,
            isTie: (scoreCounts.get(key) ?? 0) > 1,
        };
    });
}

export function buildCompareResult(
    weights: Weights,
    candidates: Candidate[],
    scoreMatrix: ScoreMatrix
): Result | null {
    const ranked = rankCandidateTotals(calculateCandidateTotals(weights, candidates, scoreMatrix));
    if (ranked.length === 0) {
        return null;
    }

    const winner = ranked[0];
    const firstPlaceGroup = ranked.filter((item) => item.rank === 1);
    const reason =
        firstPlaceGroup.length > 1
            ? `상위 ${firstPlaceGroup.length}개 후보가 ${winner.score}점으로 동점입니다. 추가 기준이 필요해요.`
            : `가중치와 점수를 반영했을 때 ${winner.candidateName}이(가) ${winner.score}점으로 1위입니다.`;

    return {
        winnerId: winner.candidateId,
        winnerName: winner.candidateName,
        totalScore: winner.score,
        ranking: ranked.map((item) => ({
            candidateId: item.candidateId,
            candidateName: item.candidateName,
            score: item.score,
        })),
        reason,
    };
}

export function scoreMenusByTags(selectedTags: QuickTag[], menus: MenuItem[]): MenuRecommendation[] {
    const normalizedSelectedTags = uniqueNormalizedTags(selectedTags);

    return menus
        .map((menu) => {
            const normalizedMenuTags = uniqueNormalizedTags(menu.tags);
            const matchedTags = normalizedSelectedTags.filter((tag) => normalizedMenuTags.includes(tag));

            return {
                menu,
                matchedTags,
                matchedTagCount: matchedTags.length,
                candidatePoolSize: 0,
            };
        })
        .sort((a, b) => {
            if (b.matchedTagCount !== a.matchedTagCount) {
                return b.matchedTagCount - a.matchedTagCount;
            }
            return a.menu.name.localeCompare(b.menu.name, 'ko');
        });
}

export function pickQuickRecommendation(
    selectedTags: QuickTag[],
    menus: MenuItem[]
): MenuRecommendation | null {
    if (menus.length === 0) {
        return null;
    }

    const scoredMenus = scoreMenusByTags(selectedTags, menus);
    const topScore = scoredMenus[0]?.matchedTagCount ?? 0;
    const pool = scoredMenus.filter((item) => item.matchedTagCount === topScore);
    const picked = pool[0] ?? scoredMenus[0];

    return {
        ...picked,
        candidatePoolSize: pool.length,
    };
}

export function pickRandomRecommendation(
    selectedTags: QuickTag[],
    menus: MenuItem[],
    randomFn: () => number = Math.random
): MenuItem | null {
    if (menus.length === 0) {
        return null;
    }

    const normalizedSelectedTags = uniqueNormalizedTags(selectedTags);
    const matchedPool =
        normalizedSelectedTags.length === 0
            ? menus
            : menus.filter((menu) => {
                  const menuTags = uniqueNormalizedTags(menu.tags);
                  return normalizedSelectedTags.some((tag) => menuTags.includes(tag));
              });

    const pool = matchedPool.length > 0 ? matchedPool : menus;
    const randomValue = safeRandom(randomFn());
    const index = Math.floor(randomValue * pool.length);
    return pool[index];
}
