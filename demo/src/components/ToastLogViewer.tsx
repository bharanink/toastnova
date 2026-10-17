import React, { useState, useEffect } from 'react';
import { toastLogger, type ToastLogEntry } from '../utils/toastLogger';

interface ToastLogViewerProps {
  title?: string;
  defaultExpanded?: boolean;
  className?: string;
  compact?: boolean;
}

export const ToastLogViewer: React.FC<ToastLogViewerProps> = ({
  title = 'Live Notification Event Logs',
  defaultExpanded = false,
  className = '',
  compact = false
}) => {
  const [logs, setLogs] = useState<ToastLogEntry[]>(toastLogger.getLogs());
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    return toastLogger.subscribe((updatedLogs) => {
      setLogs([...updatedLogs]);
    });
  }, []);

  const handleCopyPayload = (log: ToastLogEntry) => {
    const payload = JSON.stringify(log.details || log, null, 2);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(payload);
    }
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getEventBadgeClass = (event: ToastLogEntry['event']) => {
    switch (event) {
      case 'triggered':
        return 'log-badge-triggered';
      case 'updated':
        return 'log-badge-updated';
      case 'dismissed':
        return 'log-badge-dismissed';
      default:
        return 'log-badge-default';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'log-type-success';
      case 'error':
        return 'log-type-error';
      case 'warning':
        return 'log-type-warning';
      case 'info':
        return 'log-type-info';
      case 'loading':
        return 'log-type-loading';
      default:
        return 'log-type-default';
    }
  };

  return (
    <div className={`doc-log-viewer ${isExpanded ? 'expanded' : 'collapsed'} ${compact ? 'compact' : ''} ${className}`}>
      <div className="doc-log-header">
        <div className="doc-log-title-area" onClick={() => setIsExpanded(!isExpanded)}>
          <span className="doc-log-indicator-pulse" />
          <span className="doc-log-title">{title}</span>
          <span className="doc-log-counter-pill" title={`${logs.length} events recorded`}>
            {logs.length} {logs.length === 1 ? 'event' : 'events'}
          </span>
        </div>

        <div className="doc-log-controls">
          {logs.length > 0 && (
            <button
              type="button"
              className="doc-log-btn-clear"
              onClick={(e) => {
                e.stopPropagation();
                toastLogger.clearLogs();
              }}
              aria-label="Clear all event logs"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            className="doc-log-toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Hide event logs' : 'View event logs'}
          >
            {isExpanded ? (
              <>
                <span>Hide Logs</span>
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 10l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            ) : (
              <>
                <span>View Logs</span>
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="doc-log-body">
          {logs.length === 0 ? (
            <div className="doc-log-empty">
              <span className="doc-log-empty-icon">📡</span>
              <p>No notifications triggered yet.</p>
              <span className="doc-log-empty-hint">
                Click any trigger button above to inspect real-time library events and payloads!
              </span>
            </div>
          ) : (
            <div className="doc-log-list">
              {logs.map((log) => {
                const isItemExpanded = expandedLogId === log.id;
                return (
                  <div key={log.id} className="doc-log-item">
                    <div className="doc-log-item-summary">
                      <span className="doc-log-timestamp">{log.timestamp}</span>
                      <span className={`doc-log-badge ${getEventBadgeClass(log.event)}`}>
                        {log.event.toUpperCase()}
                      </span>
                      <span className={`doc-log-badge ${getTypeBadgeClass(log.type)}`}>
                        {log.type}
                      </span>
                      <span className="doc-log-item-msg">
                        {log.title && <strong className="doc-log-item-title">[{log.title}] </strong>}
                        <span className="doc-log-msg-text">&ldquo;{log.message}&rdquo;</span>
                      </span>
                      <span className="doc-log-id-chip">{log.toastId}</span>

                      <div className="doc-log-item-actions">
                        <button
                          type="button"
                          className="doc-log-item-btn"
                          onClick={() => setExpandedLogId(isItemExpanded ? null : log.id)}
                          title="Inspect raw payload JSON"
                        >
                          {isItemExpanded ? 'Close JSON' : 'JSON'}
                        </button>
                        <button
                          type="button"
                          className="doc-log-item-btn"
                          onClick={() => handleCopyPayload(log)}
                          title="Copy payload to clipboard"
                        >
                          {copiedId === log.id ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {isItemExpanded && (
                      <div className="doc-log-payload-box">
                        <pre className="doc-log-payload-pre">
                          <code>{JSON.stringify(log.details || log, null, 2)}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
