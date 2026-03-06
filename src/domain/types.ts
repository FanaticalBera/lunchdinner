export type Mode = 'lunch' | 'dinner';

export type FlowType = 'quick' | 'compare' | 'random';
export type QuickFlowType = Extract<FlowType, 'quick' | 'random'>;

export type Step =
    | 'intro'
    | 'flowSelect'
    | 'quick1'
    | 'quick2'
    | 'compare2'
    | 'compareResult';

export type CriterionKey = 'taste' | 'price' | 'distance';

export interface Candidate {
    id: string;
    name: string;
    icon?: string;
}

export type QuickTag = string;

export interface CriterionScoreSummary {
    rawScore: number;
    weightedScore: number;
    weight: number;
}

export type CriterionScoreMap = Record<CriterionKey, CriterionScoreSummary>;

export interface ResultRankingItem {
    candidateId: Candidate['id'];
    candidateName: Candidate['name'];
    score: number;
    scoreByKey: CriterionScoreMap;
}

export interface CriterionComparisonSummary {
    winnerRawScore: number;
    runnerUpRawScore: number;
    winnerWeightedScore: number;
    runnerUpWeightedScore: number;
    rawGap: number;
    weightedGap: number;
    leaderCandidateId: Candidate['id'] | null;
    leaderCandidateName: Candidate['name'] | null;
    isTie: boolean;
}

export type CriterionComparisonMap = Record<CriterionKey, CriterionComparisonSummary>;

export type ResultSummaryTone = 'tie' | 'close' | 'clear';

export interface Result {
    winnerId: Candidate['id'];
    winnerName: Candidate['name'];
    totalScore: number;
    ranking: ResultRankingItem[];
    topCandidates: ResultRankingItem[];
    runnerUp: ResultRankingItem | null;
    winnerScoreByKey: CriterionScoreMap;
    comparisonByKey: CriterionComparisonMap | null;
    leadingCriteria: CriterionKey[];
    trailingCriteria: CriterionKey[];
    tiedCriteria: CriterionKey[];
    decidingCriteria: CriterionKey[];
    scoreGapFromRunnerUp: number;
    firstPlaceCount: number;
    isTie: boolean;
    summaryTone: ResultSummaryTone;
    reason: string;
}
