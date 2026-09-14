import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Berea Application Caught Error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('berea_user_notes');
      // Clear any bad cached chapters
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('berea_chapter_')) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#26221F] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 border border-[#EBE5DC] shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FAF3E8] border border-[#B4793D]/30 flex items-center justify-center mx-auto text-[#B4793D]">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold font-heading text-[#26221F]">Grace and Peace</h2>
              <p className="text-xs text-[#78716C] leading-relaxed">
                An unexpected display issue occurred. You can safely refresh the workspace to restore the full Scripture study interface.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-[#FAF5ED] p-3 rounded-lg border border-[#EBE5DC] text-[11px] font-mono text-[#57524E] max-h-24 overflow-auto">
                {this.state.error.message || 'Unknown error'}
              </div>
            )}

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-[#26221F] text-white rounded-xl text-xs font-semibold hover:bg-[#38332E] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset & Reload Workspace
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
