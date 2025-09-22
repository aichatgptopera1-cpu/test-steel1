import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4 text-center text-red-700 dark:text-red-300">
           <i className="fas fa-exclamation-triangle fa-lg mb-2"></i>
          <p className="text-sm font-semibold">{this.props.fallbackMessage || 'متاسفانه در بارگذاری این بخش مشکلی پیش آمد.'}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
