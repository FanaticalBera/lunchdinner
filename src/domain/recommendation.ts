import type {
    Candidate,
    CriterionComparisonMap,
    CriterionKey,
    CriterionScoreMap,
    Mode,
    QuickTag,
    Result,
    ResultRankingItem,
    ResultSummaryTone,
} from './types';

export interface Weights {
    taste: number;
    price: number;
    distance: number;
}

export type ScoreMatrix = Record<Candidate['id'], Partial<Record<CriterionKey, number>>>;

export interface CandidateTotal {
    candidateId: Candidate['id'];
    candidateName: Candidate['name'];
    score: number;
}

export interface RankedCandidateTotal extends CandidateTotal {
    rank: number;
    isTie: boolean;
}

export type MealType = Mode | 'both';

export interface MenuItem {
    id: string;
    name: string;
    icon?: string;
    tags: QuickTag[];
    mealType?: MealType;
}

export interface MenuRecommendation {
    menu: MenuItem;
    matchedTags: QuickTag[];
    matchedTagCount: number;
    candidatePoolSize: number;
}

const WEIGHT_KEYS: CriterionKey[] = ['taste', 'price', 'distance'];
const CLOSE_SCORE_GAP_THRESHOLD = 0.3;

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

function buildEmptyCriterionScoreMap(): CriterionScoreMap {
    return WEIGHT_KEYS.reduce((acc, key) => {
        acc[key] = {
            rawScore: 0,
            weightedScore: 0,
            weight: 0,
        };
        return acc;
    }, {} as CriterionScoreMap);
}

function buildCriterionScoreMap(
    weights: Weights,
    candidateScores: Partial<Record<CriterionKey, number>>
): { scoreByKey: CriterionScoreMap; totalScore: number } {
    const nonNegativeWeightTotal = WEIGHT_KEYS.reduce((acc, key) => acc + Math.max(0, weights[key]), 0);
    const weightTotal = nonNegativeWeightTotal > 0 ? nonNegativeWeightTotal : 1;

    let totalWeightedScore = 0;

    const scoreByKey = WEIGHT_KEYS.reduce((acc, key) => {
        const rawWeight = Math.max(0, weights[key]);
        const weightRatio = rawWeight / weightTotal;
        const rawScore = Math.max(0, candidateScores[key] ?? 0);
        const weightedScore = rawScore * weightRatio;

        totalWeightedScore += weightedScore;
        acc[key] = {
            rawScore,
            weightedScore: round2(weightedScore),
            weight: rawWeight,
        };

        return acc;
    }, {} as CriterionScoreMap);

    return {
        scoreByKey,
        totalScore: round2(totalWeightedScore),
    };
}

function buildCriterionComparisonMap(
    winner: ResultRankingItem,
    runnerUp: ResultRankingItem
): {
    comparisonByKey: CriterionComparisonMap;
    leadingCriteria: CriterionKey[];
    trailingCriteria: CriterionKey[];
    tiedCriteria: CriterionKey[];
    decidingCriteria: CriterionKey[];
} {
    let maxWeightedGap = 0;

    const comparisonByKey = WEIGHT_KEYS.reduce((acc, key) => {
        const winnerScore = winner.scoreByKey[key];
        const runnerUpScore = runnerUp.scoreByKey[key];
        const rawGap = round2(winnerScore.rawScore - runnerUpScore.rawScore);
        const weightedGap = round2(winnerScore.weightedScore - runnerUpScore.weightedScore);
        const isTie = weightedGap === 0;
        const absWeightedGap = Math.abs(weightedGap);

        if (absWeightedGap > maxWeightedGap) {
            maxWeightedGap = absWeightedGap;
        }

        acc[key] = {
            winnerRawScore: winnerScore.rawScore,
            runnerUpRawScore: runnerUpScore.rawScore,
            winnerWeightedScore: winnerScore.weightedScore,
            runnerUpWeightedScore: runnerUpScore.weightedScore,
            rawGap,
            weightedGap,
            leaderCandidateId: isTie ? null : weightedGap > 0 ? winner.candidateId : runnerUp.candidateId,
            leaderCandidateName: isTie ? null : weightedGap > 0 ? winner.candidateName : runnerUp.candidateName,
            isTie,
        };

        return acc;
    }, {} as CriterionComparisonMap);

    const leadingCriteria = WEIGHT_KEYS.filter((key) => comparisonByKey[key].weightedGap > 0);
    const trailingCriteria = WEIGHT_KEYS.filter((key) => comparisonByKey[key].weightedGap < 0);
    const tiedCriteria = WEIGHT_KEYS.filter((key) => comparisonByKey[key].weightedGap === 0);
    const decidingCriteria =
        maxWeightedGap === 0
            ? []
            : WEIGHT_KEYS.filter((key) => Math.abs(comparisonByKey[key].weightedGap) === maxWeightedGap);

    return {
        comparisonByKey,
        leadingCriteria,
        trailingCriteria,
        tiedCriteria,
        decidingCriteria,
    };
}

function getSummaryTone(isTie: boolean, scoreGapFromRunnerUp: number): ResultSummaryTone {
    if (isTie) {
        return 'tie';
    }

    if (scoreGapFromRunnerUp <= CLOSE_SCORE_GAP_THRESHOLD) {
        return 'close';
    }

    return 'clear';
}

export function calculateCandidateTotals(
    weights: Weights,
    candidates: Candidate[],
    scoreMatrix: ScoreMatrix
): CandidateTotal[] {
    return candidates.map((candidate) => {
        const { totalScore } = buildCriterionScoreMap(weights, scoreMatrix[candidate.id] ?? {});

        return {
            candidateId: candidate.id,
            candidateName: candidate.name,
            score: totalScore,
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
    const candidateBreakdowns = candidates.map((candidate) => {
        const { scoreByKey, totalScore } = buildCriterionScoreMap(weights, scoreMatrix[candidate.id] ?? {});

        return {
            candidateId: candidate.id,
            candidateName: candidate.name,
            score: totalScore,
            scoreByKey,
        };
    });

    const ranked = rankCandidateTotals(candidateBreakdowns);
    if (ranked.length === 0) {
        return null;
    }

    const scoreByCandidateId = new Map(
        candidateBreakdowns.map((candidate) => [candidate.candidateId, candidate.scoreByKey])
    );

    const ranking: ResultRankingItem[] = ranked.map((item) => ({
        candidateId: item.candidateId,
        candidateName: item.candidateName,
        score: item.score,
        scoreByKey: scoreByCandidateId.get(item.candidateId) ?? buildEmptyCriterionScoreMap(),
    }));

    const winner = ranking[0];
    const topCandidates = ranking.filter((item) => item.score === winner.score);
    const runnerUp = ranking.find((item) => item.score < winner.score) ?? null;
    const isTie = topCandidates.length > 1;
    const scoreGapFromRunnerUp = runnerUp ? round2(winner.score - runnerUp.score) : 0;

    const comparison = !isTie && runnerUp
        ? buildCriterionComparisonMap(winner, runnerUp)
        : {
            comparisonByKey: null,
            leadingCriteria: [],
            trailingCriteria: [],
            tiedCriteria: [],
            decidingCriteria: [],
        };

    const summaryTone = getSummaryTone(isTie, scoreGapFromRunnerUp);
    const reason =
        isTie
            ? `상위 ${topCandidates.length}개 후보가 ${winner.score}점으로 동점입니다. 추가 기준이 필요해요.`
            : summaryTone === 'close'
                ? `${winner.candidateName}이(가) ${scoreGapFromRunnerUp}점 차이의 근소한 우세로 1위입니다.`
                : `가중치와 점수를 반영했을 때 ${winner.candidateName}이(가) ${winner.score}점으로 1위입니다.`;

    return {
        winnerId: winner.candidateId,
        winnerName: winner.candidateName,
        totalScore: winner.score,
        ranking,
        topCandidates,
        runnerUp,
        winnerScoreByKey: winner.scoreByKey,
        comparisonByKey: comparison.comparisonByKey,
        leadingCriteria: comparison.leadingCriteria,
        trailingCriteria: comparison.trailingCriteria,
        tiedCriteria: comparison.tiedCriteria,
        decidingCriteria: comparison.decidingCriteria,
        scoreGapFromRunnerUp,
        firstPlaceCount: topCandidates.length,
        isTie,
        summaryTone,
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
    menus: MenuItem[],
    randomFn: () => number = Math.random
): MenuRecommendation | null {
    if (menus.length === 0) {
        return null;
    }

    const scoredMenus = scoreMenusByTags(selectedTags, menus);
    const topScore = scoredMenus[0]?.matchedTagCount ?? 0;
    const pool = scoredMenus.filter((item) => item.matchedTagCount === topScore);

    const randomValue = safeRandom(randomFn());
    const index = Math.floor(randomValue * pool.length);
    const picked = pool[index] ?? scoredMenus[0];

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
