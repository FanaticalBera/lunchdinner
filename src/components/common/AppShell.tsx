import React, { useEffect } from 'react';
import type { Mode } from '../../domain/types';

interface AppShellProps {
    children: React.ReactNode;
    theme?: Mode | null;
}

export const AppShell: React.FC<AppShellProps> = ({ children, theme }) => {
    // ?뚮쭏 蹂寃?濡쒖쭅 泥섎━
    useEffect(() => {
        if (theme === 'dinner') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }, [theme]);

    return (
        <div className="w-full max-w-[480px] mx-auto min-h-[100dvh] flex flex-col relative overflow-x-hidden bg-[var(--bg-color)] shadow-2xl border-x border-slate-200/50 dark:border-white/5 transition-colors duration-300">
            {children}
        </div>
    );
};

