import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  Download,
  ShieldCheck,
  User,
  Cpu,
  Sparkles,
  Radio,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AuditLog } from '../types';
import { formatTimeAgo } from '../utils/formatters';

export const AuditTrailView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actorFilter, setActorFilter] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = (search = searchTerm, actor = actorFilter) => {
    setLoading(true);
    let url = `/api/audit?limit=100`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (actor && actor !== 'ALL') url += `&actor_type=${actor}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch audit logs:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(searchTerm, actorFilter);
  };

  const handleExport = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reviveai_audit_trail_${Date.now()}.json`;
    a.click();
  };

  const getActorIcon = (actorType: string) => {
    switch (actorType) {
      case 'AI':
        return <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />;
      case 'USER':
        return <User className="h-3.5 w-3.5 text-[#00FF66]" />;
      case 'WEBHOOK':
        return <Radio className="h-3.5 w-3.5 text-[#E5E5E5]/60" />;
      default:
        return <Cpu className="h-3.5 w-3.5 text-[#C5A059]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#2A2A2A]">
        <div>
          <div className="flex items-center space-x-2 text-[#C5A059] text-[9px] font-bold uppercase tracking-[0.3em] mb-1">
            <ScrollText className="h-3.5 w-3.5" />
            <span>Immutable Governance Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
            Financial & Regulatory Audit Trail ({total} Events)
          </h1>
          <p className="text-xs text-[#E5E5E5]/60 mt-1 font-light max-w-2xl">
            Immutable log of every event, diagnosis, policy check, and gateway execution for compliance audits.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="flex items-center space-x-1.5 px-3.5 py-2 text-[10px] uppercase tracking-[0.2em] font-medium bg-[#141414] hover:bg-[#1A1A1A] text-[#E5E5E5] border border-[#2A2A2A] transition shrink-0"
        >
          <Download className="h-3.5 w-3.5 text-[#C5A059]" />
          <span>Export Audit JSON</span>
        </button>
      </div>

      {/* Search & Actor Filters */}
      <div className="bg-[#141414] border border-[#2A2A2A] p-4 sm:p-5 shadow-sm flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#E5E5E5]/40" />
            <input
              type="text"
              placeholder="Search by case ID, actor ID, or event reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#0F0F0F] border border-[#2A2A2A] text-white placeholder-[#E5E5E5]/30 focus:outline-none focus:border-[#C5A059] font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold bg-[#C5A059] hover:bg-[#D4B36D] text-[#0F0F0F] border border-[#C5A059] shrink-0 transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#E5E5E5]/50 flex items-center space-x-1">
            <Filter className="h-3 w-3" />
            <span>Actor:</span>
          </span>
          <select
            value={actorFilter}
            onChange={(e) => {
              setActorFilter(e.target.value);
              fetchLogs(searchTerm, e.target.value);
            }}
            className="bg-[#0F0F0F] border border-[#2A2A2A] text-[#E5E5E5] px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059] font-mono"
          >
            <option value="ALL">All Actors</option>
            <option value="SYSTEM">SYSTEM (Automated)</option>
            <option value="AI">AI (Gemini / Diagnosis)</option>
            <option value="USER">USER (Human Reviewer)</option>
            <option value="WEBHOOK">WEBHOOK (Razorpay Gateway)</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#141414] border border-[#2A2A2A] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#E5E5E5]/80">
            <thead className="bg-[#1A1A1A] text-[#C5A059] uppercase text-[9px] tracking-[0.2em] font-mono border-b border-[#2A2A2A]">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Event Type</th>
                <th className="py-3 px-4 font-semibold">Actor</th>
                <th className="py-3 px-4 font-semibold">Case ID</th>
                <th className="py-3 px-4 font-semibold">Reason / Rationale</th>
                <th className="py-3 px-4 font-semibold">Policy / Model</th>
                <th className="py-3 px-4 text-right font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#E5E5E5]/40 font-serif italic text-base">
                    Loading audit records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#E5E5E5]/40 font-serif italic text-base">
                    No audit records matching search parameters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="hover:bg-[#1A1A1A]/80 cursor-pointer transition"
                      >
                        <td className="py-3.5 px-4 text-[#E5E5E5]/50 font-mono text-[11px] whitespace-nowrap">
                          {formatTimeAgo(log.timestamp)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-white text-[11px]">
                          {log.event_type}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1.5">
                            {getActorIcon(log.actor_type)}
                            <span className="font-mono text-white text-xs">{log.actor_type}</span>
                            <span className="text-[10px] text-[#E5E5E5]/40 font-mono">({log.actor_id})</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#E5E5E5]/50 text-[11px]">
                          {log.case_id || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-[#E5E5E5]/80 max-w-xs truncate font-light" title={log.reason}>
                          {log.reason}
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-[#C5A059] font-mono">
                          {log.policy_version || log.model_version || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            className="text-[#E5E5E5]/40 hover:text-white p-1"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-[#0F0F0F]">
                          <td colSpan={7} className="p-4 sm:p-6 border-t border-[#2A2A2A]">
                            <div className="space-y-2">
                              <div className="text-[9px] uppercase tracking-[0.25em] font-semibold text-[#C5A059]">Full Audit Event Metadata:</div>
                              <pre className="p-4 bg-[#141414] text-[11px] font-mono text-[#00FF66] overflow-x-auto border border-[#2A2A2A]">
                                {JSON.stringify(log, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
