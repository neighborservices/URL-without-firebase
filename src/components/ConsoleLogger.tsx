import React, { useState, useEffect, useRef } from 'react';
import { Terminal, MinimizeIcon, MaximizeIcon, Database } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'warn';
  dbData?: any;
}

export function ConsoleLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showDbLogs, setShowDbLogs] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Override console methods to capture logs
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };

    function addLog(message: any, type: 'info' | 'error' | 'warn' = 'info') {
      const timestamp = new Date().toLocaleTimeString();
      const formattedMessage = typeof message === 'object' 
        ? JSON.stringify(message, null, 2) 
        : String(message);

      setLogs(prev => [...prev, { timestamp, message: formattedMessage, type }]);
      
      // Keep original console functionality
      switch (type) {
        case 'error':
          originalConsole.error(message);
          break;
        case 'warn':
          originalConsole.warn(message);
          break;
        default:
          originalConsole.log(message);
      }
    }

    // Override console methods
    console.log = (...args) => addLog(args[0], 'info');
    console.error = (...args) => addLog(args[0], 'error');
    console.warn = (...args) => addLog(args[0], 'warn');
    console.info = (...args) => addLog(args[0], 'info');

    // Subscribe to Firebase logs if enabled
    let unsubscribe: () => void;
    
    if (showDbLogs) {
      const logsRef = collection(db, 'logs');
      const q = query(logsRef, orderBy('timestamp', 'desc'), limit(50));
      
      unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            addLog({ 
              action: data.action,
              data: data.data,
              level: data.level
            }, data.level);
          }
        });
      });
    }

    // Scroll to bottom when new logs are added
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }

    // Cleanup
    return () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;
      if (unsubscribe) unsubscribe();
    };
  }, [showDbLogs]);

  const clearLogs = () => setLogs([]);

  return (
    <div 
      className={`fixed bottom-4 right-4 bg-gray-900 text-white rounded-lg shadow-lg transition-all duration-200 ${
        isMinimized ? 'w-12 h-12' : 'w-96 h-64'
      }`}
    >
      <div className="flex items-center justify-between p-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span className={isMinimized ? 'hidden' : 'text-sm'}>Console</span>
        </div>
        <div className="flex items-center gap-2">
          {!isMinimized && (
            <>
              <button
                onClick={() => setShowDbLogs(!showDbLogs)}
                className={`text-xs px-2 py-1 rounded ${
                  showDbLogs ? 'bg-blue-600' : 'bg-gray-700'
                } hover:bg-opacity-80`}
              >
                <Database className="w-4 h-4" />
              </button>
              <button 
                onClick={clearLogs}
                className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
              >
                Clear
              </button>
            </>
          )}
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-white"
          >
            {isMinimized ? (
              <MaximizeIcon className="w-4 h-4" />
            ) : (
              <MinimizeIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <div 
          ref={logContainerRef}
          className="h-[calc(100%-2.5rem)] overflow-y-auto p-2 font-mono text-sm"
        >
          {logs.map((log, index) => (
            <div 
              key={index} 
              className={`mb-1 ${
                log.type === 'error' ? 'text-red-400' :
                log.type === 'warn' ? 'text-yellow-400' :
                'text-green-400'
              }`}
            >
              <span className="text-gray-500">[{log.timestamp}]</span>{' '}
              <span className="whitespace-pre-wrap">{log.message}</span>
              {log.dbData && (
                <pre className="text-xs text-gray-400 ml-4">
                  {JSON.stringify(log.dbData, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}