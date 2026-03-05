import React from 'react';

interface WinnerCardProps {
    icon: React.ReactNode;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    badge?: React.ReactNode;
    overlay?: React.ReactNode;
    children?: React.ReactNode;
    containerClassName?: string;
    innerClassName?: string;
    iconWrapperClassName?: string;
    titleClassName?: string;
    subtitleClassName?: string;
}

export const WinnerCard: React.FC<WinnerCardProps> = ({
    icon,
    title,
    subtitle,
    badge,
    overlay,
    children,
    containerClassName = '',
    innerClassName = '',
    iconWrapperClassName = '',
    titleClassName = '',
    subtitleClassName = '',
}) => {
    return (
        <div className={`relative bg-[var(--surface-color)] rounded-3xl w-full border border-[var(--border-color)] overflow-hidden ${containerClassName}`}>
            {overlay}

            <div className={`relative z-10 flex flex-col items-center text-center ${innerClassName}`}>
                {badge}

                <div className={iconWrapperClassName}>{icon}</div>

                {title && <h1 className={titleClassName}>{title}</h1>}
                {subtitle && <p className={subtitleClassName}>{subtitle}</p>}

                {children}
            </div>
        </div>
    );
};
