import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export interface LogEntry {
  timestamp: string;
  type: 'info' | 'error' | 'warning' | 'success' | 'action' | 'state';
  message: string;
  details?: any;
  component?: string;
  action?: string;
}

class Logger {
  private logSubject = new Subject<LogEntry>();
  private logs: LogEntry[] = [];
  private subscribers: ((logs: LogEntry[]) => void)[] = [];
  private maxLogs = 100;

  constructor() {
    this.logSubject.pipe(
      debounceTime(100) // Batch updates
    ).subscribe(entry => {
      this.logs = [entry, ...this.logs].slice(0, this.maxLogs);
      this.notifySubscribers();
    });
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback([...this.logs]));
  }

  subscribe(callback: (logs: LogEntry[]) => void): () => void {
    this.subscribers.push(callback);
    callback([...this.logs]); // Initial state
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private addLog(entry: LogEntry) {
    this.logSubject.next(entry);
    
    // Also log to console for debugging
    const logMethod = entry.type === 'error' ? console.error : console.log;
    logMethod(`[${entry.type.toUpperCase()}] ${entry.message}`, entry.details || '');
  }

  info(message: string, details?: any, component?: string) {
    this.addLog({
      timestamp: new Date().toISOString(),
      type: 'info',
      message,
      details,
      component
    });
  }

  error(message: string, details?: any, component?: string) {
    this.addLog({
      timestamp: new Date().toISOString(),
      type: 'error',
      message,
      details,
      component
    });
  }

  warning(message: string, details?: any, component?: string) {
    this.addLog({
      timestamp: new Date().toISOString(),
      type: 'warning',
      message,
      details,
      component
    });
  }

  success(message: string, details?: any, component?: string) {
    this.addLog({
      timestamp: new Date().toISOString(),
      type: 'success',
      message,
      details,
      component
    });
  }

  action(action: string, component: string, details?: any) {
    this.addLog({
      timestamp: new Date().toISOString(),
      type: 'action',
      message: `Action: ${action}`,
      action,
      component,
      details
    });
  }

  state(component: string, state: any) {
    this.addLog({
      timestamp: new Date().toISOString(),
      type: 'state',
      message: `State Update: ${component}`,
      component,
      details: state
    });
  }

  clear() {
    this.logs = [];
    this.notifySubscribers();
  }
}

export const logger = new Logger();