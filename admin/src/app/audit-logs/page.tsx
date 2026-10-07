'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/components/auth/AuthProvider';
import { auditService } from '@/lib/services/auditService';
import { AuditLog, AuditAction, ResourceType } from '@/types/audit';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils/cn';
import { Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 8;

export default function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadLogs() {
      try {
        setIsLoading(true);
        const data = await auditService.getLogs(100);
        setLogs(data);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedResource]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesResource =
        selectedResource === 'all' || log.resourceType === selectedResource;

      return matchesSearch && matchesResource;
    });
  }, [logs, searchQuery, selectedResource]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE) || 1;

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  const getActionBadgeColor = (action: AuditAction) => {
    if (action.includes('CREATE')) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (action.includes('DELETE')) return 'bg-red-500/15 text-red-400 border-red-500/30';
    if (action.includes('UPDATE') || action.includes('TOGGLE')) return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    if (action.includes('AUTH')) return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    return 'bg-stone-100 text-stone-800 border-stone-300';
  };

  return (
    <AdminLayout requiredPermission="audit:view">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-aura-50">
            System Audit Trail ({filteredLogs.length})
          </h1>
          <p className="text-xs text-aura-300 mt-1">
            Immutable log of all administrative actions, data modifications, and authentication events (8 per page)
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by administrator, action, resource, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <select
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            className="bg-espresso-950 border border-aura-800 rounded-xl px-3 py-2 text-xs text-aura-200 focus:outline-none focus:border-caramel-500 cursor-pointer"
          >
            <option value="all">All Resource Types</option>
            <option value="auth">Authentication</option>
            <option value="menu">Menu Items</option>
            <option value="category">Categories</option>
            <option value="staff">Staff Directory</option>
            <option value="user">User Accounts</option>
            <option value="settings">Settings</option>
          </select>
        </div>

        {/* Audit Log Table */}
        <div className="bg-espresso-900/80 border border-aura-800/80 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-espresso-950/80 text-[11px] font-semibold text-aura-400 uppercase tracking-wider border-b border-aura-800/80">
                <tr>
                  <th className="px-5 py-3.5 min-w-[150px]">Timestamp</th>
                  <th className="px-5 py-3.5">Administrator</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Resource</th>
                  <th className="px-5 py-3.5">Action Details</th>
                  <th className="px-5 py-3.5 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-aura-800/50 text-xs">
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-aura-400">
                      No audit log entries found.
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-aura-900/20 transition-colors">
                      <td className="px-5 py-3.5 text-aura-300 font-mono text-[11px] whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-aura-50">{log.userName}</p>
                        <p className="text-[10px] text-aura-400">{log.userEmail}</p>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-aura-300 uppercase font-semibold text-[10px] tracking-wider">
                        {log.resourceType}
                      </td>

                      <td className="px-5 py-3.5 text-aura-200 line-clamp-1 max-w-md">
                        {log.details}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 rounded-lg text-aura-400 hover:text-aura-50 hover:bg-aura-800/50 transition-colors"
                          title="Inspect metadata"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredLogs.length > 0 && (
            <div className="p-4 border-t border-aura-800/80 bg-espresso-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <p className="text-aura-400">
                Showing <span className="font-semibold text-aura-200">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                <span className="font-semibold text-aura-200">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)}
                </span>{' '}
                of <span className="font-semibold text-aura-200">{filteredLogs.length}</span> records
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-aura-800 bg-espresso-900 text-aura-300 hover:text-aura-50 hover:bg-aura-800/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 font-medium text-xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg font-mono text-xs font-semibold transition-all ${
                            currentPage === page
                              ? 'bg-caramel-500 text-espresso-950 shadow-sm font-bold'
                              : 'border border-aura-800 bg-espresso-900 text-aura-300 hover:text-aura-50 hover:bg-aura-800/50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-1 text-aura-500 text-xs">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-aura-800 bg-espresso-900 text-aura-300 hover:text-aura-50 hover:bg-aura-800/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 font-medium text-xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Audit Inspection Modal */}
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title="Audit Trail Details"
          description="Detailed metadata recorded for this administrative event."
          maxWidth="md"
        >
          {selectedLog && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-espresso-950 rounded-xl border border-aura-800">
                <div>
                  <span className="text-aura-400 text-[10px] uppercase">Administrator</span>
                  <p className="font-semibold text-aura-100">{selectedLog.userName}</p>
                  <p className="text-aura-400 text-[11px]">{selectedLog.userEmail}</p>
                </div>
                <div>
                  <span className="text-aura-400 text-[10px] uppercase">Timestamp</span>
                  <p className="font-mono text-aura-200">{formatDate(selectedLog.timestamp)}</p>
                </div>
              </div>

              <div>
                <span className="text-aura-400 text-[10px] uppercase font-semibold">
                  Action Executed
                </span>
                <p className="mt-1 font-mono text-caramel-300 font-bold bg-espresso-950 p-2 rounded-lg border border-aura-800">
                  {selectedLog.action}
                </p>
              </div>

              <div>
                <span className="text-aura-400 text-[10px] uppercase font-semibold">
                  Full Details
                </span>
                <p className="mt-1 text-aura-200 leading-relaxed bg-espresso-950 p-3 rounded-lg border border-aura-800">
                  {selectedLog.details}
                </p>
              </div>

              {selectedLog.resourceId && (
                <div>
                  <span className="text-aura-400 text-[10px] uppercase font-semibold">
                    Target Resource ID
                  </span>
                  <p className="mt-1 font-mono text-aura-300 bg-espresso-950 p-2 rounded-lg border border-aura-800">
                    {selectedLog.resourceId}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
