import { AuditLog, AuditAction, ResourceType } from '@/types/audit';
import { INITIAL_AUDIT_LOGS } from '@/lib/utils/mockData';

const AUDIT_KEY = 'cafe_aura_audit_logs';

function getLocalLogs(): AuditLog[] {
  if (typeof window === 'undefined') return INITIAL_AUDIT_LOGS;
  const saved = localStorage.getItem(AUDIT_KEY);
  if (!saved) {
    localStorage.setItem(AUDIT_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
    return INITIAL_AUDIT_LOGS;
  }
  try { return JSON.parse(saved); } catch { return INITIAL_AUDIT_LOGS; }
}

function saveLocalLogs(data: AuditLog[]) {
  if (typeof window !== 'undefined') localStorage.setItem(AUDIT_KEY, JSON.stringify(data));
}

export const auditService = {
  async getLogs(maxRecords = 100): Promise<AuditLog[]> {
    try {
      const res = await fetch(`/api/audit-logs?limit=${maxRecords}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        saveLocalLogs(data);
        return data;
      }
    } catch (e) {
      console.warn('API fetch failed for audit logs, falling back to local:', e);
    }
    return getLocalLogs();
  },

  async logAction(params: {
    userId: string;
    userName: string;
    userEmail: string;
    userRole: string;
    action: AuditAction;
    resourceType: ResourceType;
    resourceId?: string;
    details: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const res = await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) return;
    } catch (e) {
      console.warn('API audit log error:', e);
    }

    const newLog: AuditLog = {
      ...params,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const current = getLocalLogs();
    saveLocalLogs([newLog, ...current]);
  }
};
