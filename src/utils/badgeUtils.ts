export interface BadgeStyle {
    bgClass: string;
    textClass: string;
    borderClass: string;
}

// A curated list of premium pastel/soft colors for badges
const BADGE_COLORS: BadgeStyle[] = [
    { bgClass: 'bg-emerald-100 dark:bg-emerald-500/20', textClass: 'text-emerald-700 dark:text-emerald-300', borderClass: 'border-emerald-200 dark:border-emerald-500/30' },
    { bgClass: 'bg-blue-100 dark:bg-blue-500/20', textClass: 'text-blue-700 dark:text-blue-300', borderClass: 'border-blue-200 dark:border-blue-500/30' },
    { bgClass: 'bg-indigo-100 dark:bg-indigo-500/20', textClass: 'text-indigo-700 dark:text-indigo-300', borderClass: 'border-indigo-200 dark:border-indigo-500/30' },
    { bgClass: 'bg-violet-100 dark:bg-violet-500/20', textClass: 'text-violet-700 dark:text-violet-300', borderClass: 'border-violet-200 dark:border-violet-500/30' },
    { bgClass: 'bg-purple-100 dark:bg-purple-500/20', textClass: 'text-purple-700 dark:text-purple-300', borderClass: 'border-purple-200 dark:border-purple-500/30' },
    { bgClass: 'bg-fuchsia-100 dark:bg-fuchsia-500/20', textClass: 'text-fuchsia-700 dark:text-fuchsia-300', borderClass: 'border-fuchsia-200 dark:border-fuchsia-500/30' },
    { bgClass: 'bg-pink-100 dark:bg-pink-500/20', textClass: 'text-pink-700 dark:text-pink-300', borderClass: 'border-pink-200 dark:border-pink-500/30' },
    { bgClass: 'bg-rose-100 dark:bg-rose-500/20', textClass: 'text-rose-700 dark:text-rose-300', borderClass: 'border-rose-200 dark:border-rose-500/30' },
    { bgClass: 'bg-orange-100 dark:bg-orange-500/20', textClass: 'text-orange-700 dark:text-orange-300', borderClass: 'border-orange-200 dark:border-orange-500/30' },
    { bgClass: 'bg-amber-100 dark:bg-amber-500/20', textClass: 'text-amber-700 dark:text-amber-300', borderClass: 'border-amber-200 dark:border-amber-500/30' },
    { bgClass: 'bg-teal-100 dark:bg-teal-500/20', textClass: 'text-teal-700 dark:text-teal-300', borderClass: 'border-teal-200 dark:border-teal-500/30' },
    { bgClass: 'bg-cyan-100 dark:bg-cyan-500/20', textClass: 'text-cyan-700 dark:text-cyan-300', borderClass: 'border-cyan-200 dark:border-cyan-500/30' }
];

/**
 * Creates a consistent hash from a string to an index
 */
export function getHashForString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
}

/**
 * Returns the first character of the name for the badge text.
 * Skips starting spaces or special characters if necessary, but simply first char is usually fine.
 */
export function getBadgeText(name: string): string {
    const trimmed = name.trim();
    return trimmed.length > 0 ? trimmed.charAt(0) : '?';
}

/**
 * Returns a consistent badge style based on the string hash.
 */
export function getBadgeStyle(name: string): BadgeStyle {
    const hash = getHashForString(name.trim());
    return BADGE_COLORS[hash % BADGE_COLORS.length];
}
