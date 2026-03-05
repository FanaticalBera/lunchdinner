import React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    errorMessage: string | null;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = {
        hasError: false,
        errorMessage: null,
    };

    static getDerivedStateFromError(error: unknown): Partial<ErrorBoundaryState> {
        const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
        return {
            hasError: true,
            errorMessage: message,
        };
    }

    componentDidCatch(error: unknown, errorInfo: React.ErrorInfo): void {
        // 기본 로깅 포인트: 이후 Sentry 같은 외부 로깅으로 확장 가능
        console.error('App crashed in ErrorBoundary:', error, errorInfo);
    }

    private handleRetry = (): void => {
        this.setState({ hasError: false, errorMessage: null });
    };

    private handleResetAndRestart = (): void => {
        try {
            window.localStorage.removeItem('appState:v1');
        } finally {
            window.location.reload();
        }
    };

    private handleReload = (): void => {
        window.location.reload();
    };

    render(): React.ReactNode {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <div className="w-full min-h-[100dvh] bg-[var(--bg-color)] text-[var(--text-primary)] flex items-center justify-center px-6">
                <div className="w-full max-w-sm bg-[var(--surface-color)] border border-[var(--border-color)] rounded-3xl p-6 shadow-[var(--shadow-md)]">
                    <div className="text-center mb-5">
                        <h1 className="text-2xl font-display font-semibold tracking-tight mb-2">문제가 발생했어요</h1>
                        <p className="text-sm text-[var(--text-secondary)]">잠시 후 다시 시도하거나 초기화 후 재시작할 수 있어요.</p>
                    </div>

                    {this.state.errorMessage && (
                        <div className="mb-5 rounded-2xl border border-rose-200/70 bg-rose-50/70 dark:bg-rose-500/10 dark:border-rose-500/20 p-3 text-xs text-rose-700 dark:text-rose-300 break-words">
                            {this.state.errorMessage}
                        </div>
                    )}

                    <div className="flex flex-col gap-2.5">
                        <button
                            onClick={this.handleRetry}
                            className="w-full rounded-full px-4 py-3 font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                        >
                            다시 시도
                        </button>
                        <button
                            onClick={this.handleResetAndRestart}
                            className="w-full rounded-full px-4 py-3 font-semibold bg-[var(--surface-color)] border border-[var(--border-color)] hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            초기화 후 재시작
                        </button>
                        <button
                            onClick={this.handleReload}
                            className="w-full rounded-full px-4 py-3 font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            새로고침
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
