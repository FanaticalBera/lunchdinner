import React from 'react';

interface HelperTextProps {
    message: string;
    isError?: boolean;
}

export const HelperText: React.FC<HelperTextProps> = ({ message, isError = false }) => {
    return (
        <p className={`text-sm mt-2 transition-colors duration-200 ${isError ? 'text-rose-500 font-medium' : 'text-[var(--text-helper)]'}`}>
            {message}
        </p>
    );
};
