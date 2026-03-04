import React from 'react';
import { House } from '@phosphor-icons/react';
import './StepHeader.css';

interface StepHeaderProps {
    title: string;
    onBack?: () => void;
    onHome?: () => void;
    showBack?: boolean;
}

export const StepHeader: React.FC<StepHeaderProps> = ({ title, onBack, onHome, showBack = true }) => {
    return (
        <header className="step-header">
            <div className="step-header-left">
                {showBack && (
                    <button className="back-btn" onClick={onBack} aria-label="뒤로가기">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                )}
            </div>
            <h2 className="step-header-title">{title}</h2>
            <div className="step-header-right">
                {onHome && (
                    <button className="back-btn outline-none hover:text-emerald-500 transition-colors" onClick={onHome} aria-label="처음으로">
                        <House weight="bold" size={24} />
                    </button>
                )}
            </div>
        </header>
    );
};
