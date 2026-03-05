export type Mode = 'lunch' | 'dinner';

export type FlowType = 'quick' | 'compare' | 'random';
export type QuickFlowType = Extract<FlowType, 'quick' | 'random'>;

export type Step =
    | 'intro'
    | 'flowSelect'
    | 'quick1'
    | 'quick2'
    | 'compare1'
    | 'compare2'
    | 'compare3'
    | 'compare4';

export type CriterionKey = 'taste' | 'price' | 'distance' | 'waitTime';

export interface Weights {
    taste: number;
    price: number;
    distance: number;
}

export interface Candidate {
    id: string;
    name: string;
    icon?: string;
}

export type ScoreMatrix = Record<Candidate['id'], Partial<Record<CriterionKey, number>>>;

export type QuickTag = string;

export interface Result {
    winnerId: Candidate['id'];
    winnerName: Candidate['name'];
    totalScore: number;
    ranking: Array<{
        candidateId: Candidate['id'];
        candidateName: Candidate['name'];
        score: number;
    }>;
    reason: string;
}
