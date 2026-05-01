'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardText,
  DownloadSimple,
  ArrowsClockwise,
  FunnelSimple,
  MagnifyingGlass,
  CheckCircle,
  Eye,
  Stamp,
  Wrench,
  CaretDown,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';

interface Decision {
  decision_id: string;
  operator_id: string;
  action: string;
  record_type: 'anomaly' | 'proposal';
  record_id: string;
  comment: string;
  timestamp: string;
}

type FilterAction = 'all' | 'Acknowledge' | 'Approve' | 'Investigate' | 'Resolve';

const actionConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
  Acknowledge: { icon: Eye,            color: 'text-[#374151]', bg: 'bg-[#f3f4f6]' },
  Approve:     { icon: CheckCircle,    color: 'text-[#059669]', bg: 'bg-[#ecfdf5]' },
  Investigate: { icon: MagnifyingGlass,color: 'text-[#b45309]', bg: 'bg-[#fffbeb]' },
  Resolve:     { icon: Wrench,         color: 'text-[#1d4ed8]', bg: 'bg-[#eff6ff]' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 20 } },
};

export default function AuditPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filterAction, setFilterAction] = useState<FilterAction>('all');
  const [filterType, setFilterType] = useState<'all' | 'anomaly' | 'proposal'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDecisions = useCallback(() => {
    setLoading(true);
    fetch('/api/decisions')
      .then((res) => res.json())
      .then((data) => {
        setDecisions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/reports/export');
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `water-audit-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  // Apply filters
  const filtered = decisions.filter((d) => {
    if (filterAction !== 'all' && d.action !== filterAction) return false;
    if (filterType !== 'all' && d.record_type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.operator_id.toLowerCase().includes(q) ||
        d.record_id.toLowerCase().includes(q) ||
        d.comment.toLowerCase().includes(q) ||
        d.action.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return {
      date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
    };
  };

  const formatRelativeTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white">
      {/* Page Header */}
      <div className="w-full border-b border-[#e5e7eb] bg-white">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ClipboardText size={16} weight="duotone" className="text-[#6b7280]" />
            <h1 className="text-sm font-semibold tracking-tight text-[#111111]">Audit Trail</h1>
            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-[#f3f4f6] border border-[#e5e7eb] text-xs font-mono text-[#6b7280]">
              {filtered.length} entries
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDecisions}
              disabled={loading}
            >
              <ArrowsClockwise size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleExport}
              disabled={exporting}
            >
              <DownloadSimple size={16} weight="bold" />
              {exporting ? 'Generating...' : 'Export XLSX'}
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="w-full border-b border-[#e5e7eb] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Search operator, zone, or comment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-[#e5e7eb] rounded-md text-[#111111] placeholder:text-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#111111] focus:border-[#111111] transition-all"
            />
          </div>

          {/* Action filter */}
          <div className="flex items-center gap-2">
            <FunnelSimple size={14} className="text-[#9ca3af]" />
            <div className="relative">
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value as FilterAction)}
                className="appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-[#e5e7eb] rounded-md text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111] cursor-pointer"
              >
                <option value="all">All Actions</option>
                <option value="Acknowledge">Acknowledge</option>
                <option value="Approve">Approve</option>
                <option value="Investigate">Investigate</option>
                <option value="Resolve">Resolve</option>
              </select>
              <CaretDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" />
            </div>
          </div>

          {/* Type filter */}
          <div className="flex rounded-md border border-[#e5e7eb] overflow-hidden">
            {(['all', 'anomaly', 'proposal'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  filterType === type
                    ? 'bg-[#111111] text-white'
                    : 'bg-white text-[#6b7280] hover:bg-[#f9fafb]'
                }`}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#e5e7eb]">
            <div className="col-span-2 text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">Timestamp</div>
            <div className="col-span-2 text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">Operator</div>
            <div className="col-span-2 text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">Action</div>
            <div className="col-span-1 text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">Type</div>
            <div className="col-span-2 text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">Record</div>
            <div className="col-span-3 text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">Comment</div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
                <span className="text-sm font-medium">Loading decisions</span>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Stamp size={40} weight="thin" className="mb-3 text-slate-300" />
              <p className="text-sm font-medium">No matching decisions found</p>
              <p className="text-xs mt-1">Try adjusting your filters or search</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${filterAction}-${filterType}-${searchQuery}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="divide-y divide-slate-100"
              >
                {filtered.map((decision) => {
                  const ts = formatTimestamp(decision.timestamp);
                  const relative = formatRelativeTime(decision.timestamp);
                  const config = actionConfig[decision.action] || actionConfig.Acknowledge;
                  const ActionIcon = config.icon;

                  return (
                    <motion.div
                      key={decision.decision_id}
                      variants={rowVariants}
                      className="audit-row grid grid-cols-12 gap-4 px-6 py-4 items-center"
                    >
                      {/* Timestamp */}
                      <div className="col-span-2">
                        <div className="text-sm font-mono text-slate-900">{ts.time}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{ts.date}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{relative}</div>
                      </div>

                      {/* Operator */}
                      <div className="col-span-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#f3f4f6] border border-[#e5e7eb] flex items-center justify-center text-[11px] font-semibold text-[#111111] shrink-0">
                          {decision.operator_id.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-[#111111] truncate">{decision.operator_id}</span>
                      </div>

                      {/* Action */}
                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.color}`}>
                          <ActionIcon size={14} weight="bold" />
                          {decision.action}
                        </span>
                      </div>

                      {/* Type */}
                      <div className="col-span-1">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider ${
                          decision.record_type === 'anomaly'
                            ? 'bg-red-50 text-red-700 border border-red-100'
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {decision.record_type}
                        </span>
                      </div>

                      {/* Record ID */}
                      <div className="col-span-2">
                        <span className="text-xs font-mono text-[#374151] bg-[#f3f4f6] px-2 py-0.5 rounded">
                          {decision.record_id}
                        </span>
                      </div>

                      {/* Comment */}
                      <div className="col-span-3">
                        <p className="text-xs text-[#6b7280] line-clamp-2 leading-relaxed">{decision.comment}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Footer summary */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-[#9ca3af]">
          <span>
            Showing {filtered.length} of {decisions.length} decisions
          </span>
          <span className="font-mono">
            Last refreshed: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </span>
        </div>
      </div>
    </div>
  );
}
