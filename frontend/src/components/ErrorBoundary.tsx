import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors anywhere in the child component tree.
 * Prevents entire app crashes from unhandled exceptions.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log to console for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // TODO: Send to error tracking service (Sentry, etc.)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[200px] p-6 glass-panel border border-destructive/30 rounded-lg">
                    <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
                    <h2 className="font-orbitron text-lg text-destructive mb-2">
                        System Error
                    </h2>
                    <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                    <Button
                        onClick={this.handleReset}
                        variant="outline"
                        className="gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
