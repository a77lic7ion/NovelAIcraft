
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

class GlobalErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Studio Crash Detected:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full bg-black flex flex-col items-center justify-center p-10 text-center">
          <div className="size-20 bg-red-500/20 text-red-500 rounded-3xl flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl">running_with_errors</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Studio Emergency Reset</h1>
          <p className="text-gray-500 max-w-md mb-8">
            NovelAIcraft encountered a critical memory or rendering issue. Your work in progress is likely safe in the laboratory database.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-primary text-black font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            Re-initialize Studio
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);
