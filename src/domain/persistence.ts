import { createInitialAppState, type AppState } from './state';
import type { Candidate, FlowType, Mode, QuickTag, Step } from './types';

const APP_STATE_VERSION = 1;
const APP_STATE_STORAGE_KEY = 'appState:v' + APP_STATE_VERSION;

const STEP_SET: Set<Step> = new Set([
    'intro',
    'flowSelect',
    'quick1',
    'quick2',
    'compare2',
    'compareResult',
]);

const MODE_SET: Set<Mode> = new Set(['lunch', 'dinner']);
const FLOW_SET: Set<FlowType> = new Set(['quick', 'compare', 'random']);
const LEGACY_SEEDED_CANDIDATES = new Map<string, string>([
    ['1', '\uAE40\uCE58\uCC0C\uAC1C \uC804\uBB38\uC810'],
    ['2', '\uC606\uC9D1 \uB3C8\uAE4C\uC2A4'],
]);

interface PersistedEnvelope {
    version: number;
    state: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function toFiniteNumber(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function sanitizeCandidates(value: unknown, fallback: Candidate[]): Candidate[] {
    if (!Array.isArray(value)) {
        return fallback.map((candidate) => ({ ...candidate }));
    }

    const sanitized: Candidate[] = [];

    value.forEach((item) => {
        if (!isRecord(item)) {
            return;
        }

        const id = typeof item.id === 'string' ? item.id.trim() : '';
        const name = typeof item.name === 'string' ? item.name.trim() : '';
        const icon = typeof item.icon === 'string' ? item.icon : undefined;

        if (!id || !name) {
            return;
        }

        if (LEGACY_SEEDED_CANDIDATES.get(id) === name) {
            return;
        }

        sanitized.push(icon ? { id, name, icon } : { id, name });
    });

    return sanitized.length > 0 ? sanitized : fallback.map((candidate) => ({ ...candidate }));
}

function sanitizeTags(value: unknown): QuickTag[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return [
        ...new Set(
            value
                .filter((item): item is string => typeof item === 'string')
                .map((tag) => tag.trim())
                .filter(Boolean)
        ),
    ];
}

function sanitizeAppState(rawState: unknown, fallback: AppState): AppState {
    if (!isRecord(rawState)) {
        return createInitialAppState();
    }

    const mode = MODE_SET.has(rawState.mode as Mode) ? (rawState.mode as Mode) : null;
    const flowType = FLOW_SET.has(rawState.flowType as FlowType) ? (rawState.flowType as FlowType) : 'quick';
    const currentStep = STEP_SET.has(rawState.currentStep as Step) ? (rawState.currentStep as Step) : 'intro';
    const candidates = sanitizeCandidates(rawState.candidates, fallback.candidates);
    const quickTags = sanitizeTags(rawState.quickTags);
    const recommendationNonce = Math.max(0, Math.floor(toFiniteNumber(rawState.recommendationNonce, 0)));

    return {
        currentStep,
        mode,
        flowType,
        candidates,
        quickTags,
        recommendationNonce,
    };
}

function readEnvelope(raw: string): PersistedEnvelope | null {
    try {
        const parsed = JSON.parse(raw) as unknown;
        if (!isRecord(parsed)) {
            return null;
        }

        const version = typeof parsed.version === 'number' ? parsed.version : NaN;
        if (!Number.isFinite(version)) {
            return null;
        }

        return {
            version,
            state: parsed.state,
        };
    } catch {
        return null;
    }
}

export function loadAppState(fallback: AppState = createInitialAppState()): AppState {
    if (typeof window === 'undefined' || !window.localStorage) {
        return fallback;
    }

    const raw = window.localStorage.getItem(APP_STATE_STORAGE_KEY);
    if (!raw) {
        return fallback;
    }

    const envelope = readEnvelope(raw);
    if (!envelope) {
        window.localStorage.removeItem(APP_STATE_STORAGE_KEY);
        return fallback;
    }

    if (envelope.version !== APP_STATE_VERSION) {
        window.localStorage.removeItem(APP_STATE_STORAGE_KEY);
        return fallback;
    }

    return sanitizeAppState(envelope.state, fallback);
}

export function saveAppState(state: AppState): void {
    if (typeof window === 'undefined' || !window.localStorage) {
        return;
    }

    const payload: PersistedEnvelope = {
        version: APP_STATE_VERSION,
        state,
    };

    try {
        window.localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(payload));
    } catch {
        // Ignore storage errors and keep in-memory state.
    }
}