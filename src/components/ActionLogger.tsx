import React, { useState, useEffect, useRef } from 'react';
import { Terminal, MinimizeIcon, MaximizeIcon, Trash2, AlertCircle, CheckCircle, Info, AlertTriangle, MousePointer, RefreshCw } from 'lucide-react';
import { logger, LogEntry } from '../lib/logger';
import { format } from 'date-fns';

export function ActionLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [filter, setFilter] = useState<LogEntry['type'] | 'all'>('all');
  const logContainerRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Store the unsubscribe function
    unsubscribeRef.current = logger.subscribe(setLogs);

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  useEffect(() => {
    if (logContainerRef.current && !isMinimized) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs, isMinimized]);

  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'action':
        return <MousePointer className="w-4 h-4 text-purple-500" />;
      case 'state':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTimeString = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm:ss.SSS');
  };

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.type === filter);

  return (
    <div 
      className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-lg transition-all duration-200 z-50 ${
        isMinimized ? 'w-12 h-12' : 'w-96 h-96'
      }`}
    >
      <div className="flex items-center justify-between p-2 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-gray-600" />
          <span className={isMinimized ? 'hidden' : 'text-sm font-medium'}>Action Logger</span>
        </div>
        <div className="flex items-center gap-2">
          {!isMinimized && (
            <>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as LogEntry['type'] | 'all')}
                className="text-xs border rounded px-1 py-0.5"
              >
                <option value="all">All</option>
                <option value="info">Info</option>
                <option value="action">Actions</option>
                <option value="state">State</option>
                <option value="error">Errors</option>
                <option value="warning">Warnings</option>
                <option value="success">Success</option>
              </select>
              <button 
                onClick={() => logger.clear()}
                className="p-1 hover:bg-gray-200 rounded"
                title="Clear logs"
              >
                <Trash2 className="w-4 h-4 text-gray-600" />
              </button>
            </>
          )}
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {isMinimized ? (
              <MaximizeIcon className="w-4 h-4 text-gray-600" />
            ) : (
              <MinimizeIcon className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <div 
          ref={logContainerRef}
          className="h-[calc(100%-2.5rem)] overflow-y-auto p-2 space-y-2"
        >
          {filteredLogs.map((log, index) => (
            <div 
              key={index} 
              className="flex items-start gap-2 text-sm border-b border-gray-100 pb-2"
            >
              {getIcon(log.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs">
                    {getTimeString(log.timestamp)}
                  </span>
                  {log.component && (
                    <span className="text-xs bg-gray-100 px-1 rounded">
                      {log.component}
                    </span>
                  )}
                </div>
                <span className={`text-${
                  log.type === 'error' ? 'red' : 
                  log.type === 'warning' ? 'yellow' : 
                  log.type === 'success' ? 'green' :
                  log.type === 'action' ? 'purple' :
                  log.type === 'state' ? 'blue' : 
                  'gray'
                }-600`}>
                  {log.message}
                </span>
                {log.details && (
                  <pre className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}