import React from 'react';

interface BottomActionBarProps {
    children: React.ReactNode;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({ children }) => {
    return (
        <div className="flex-none bg-[var(--bg-color)]/80 backdrop-blur-xl border-t border-[var(--border-color)] p-6 pb-8 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.03)] dark:shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.5)] w-full sticky bottom-0 z-20">
            <div className="w-full max-w-sm mx-auto flex flex-col gap-3">
                {children}
            </div>
        </div>
    );
};
