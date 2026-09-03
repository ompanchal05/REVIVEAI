import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Play,
  Shield,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Sparkles,
  ArrowDownToLine
} from 'lucide-react';
import { RecoveryCase } from '../types';
import { formatINR, formatPercent, getStatusBadgeStyle, getRiskBadgeStyle } from '../utils/formatters';

interface RecoveryQueueViewProps {
  cases: RecoveryCase[];
  totalCases: number;
  loading: boolean;
  onSelectCase: (c: RecoveryCase) => void;
  onExecuteCase: (c: RecoveryCase) => void;
  onApproveCase: (c: RecoveryCase) => void;
  onFilterChange: (filters: any) => void;
  onOpenDirectPull?: () => void;
}

export const RecoveryQueueView: React.FC<RecoveryQueueViewProps> = ({
  cases,
  totalCases,
  loading,
  onSelectCase,
  onExecuteCase,
  onApproveCase,
  onFilterChange,
  onOpenDirectPull,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'probability' | 'erv'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      search: searchTerm,
      status: statusFilter,
      risk_level: riskFilter,
      payment_method: methodFilter,
      sort_by: sortBy,
      sort_order: sortOrder
    });
  };

  const handleFilterUpdate = (newStatus: string, newRisk: string, newMethod: string, newSort: any, newOrder: any) => {
    setStatusFilter(newStatus);
    setRiskFilter(newRisk);
    setMethodFilter(newMethod);
    setSortBy(newSort);
    setSortOrder(newOrder);
    onFilterChange({
      search: searchTerm,
      status: newStatus,
      risk_level: newRisk,
      payment_method: newMethod,
      sort_by: newSort,
      sort_order: newOrder
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCaseIds(cases.map((c) => c.id));
    } else {
      setSelectedCaseIds([]);
    }
  };

  const toggleSelectCase = (id: string) => {
    setSelectedCaseIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    const headers = 'Case ID,Customer Name,Email,Amount,Method,Failure Reason,Probability,Policy Decision,Status,Recovered Amount\n';
    const rows = cases
      .map(
        (c) =>
          `"${c.id}","${c.customer.name}","${c.customer.email}",${c.amount},"${c.payment_method}","${c.failure_reason}",${c.recovery_probability},"${c.policy_decision}","${c.status}",${c.recovered_amount}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reviveai_recovery_cases_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">Recovery Operations Queue</h1>
          <p className="text-xs text-[#E5E5E5]/60 font-light mt-0.5">
            Real-time pipeline of revenue recovery cases governed by deterministic policies.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {onOpenDirectPull && (
            <button
              type="button"
              id="queue-direct-pull-btn"
              onClick={onOpenDirectPull}
              className="flex items-center space-x-1.5 px-3 py-2 text-[10px] uppercase tracking-[0.2em] font-medium bg-[#141414] hover:bg-[#1A1A1A] text-[#00D2FF] border border-[#00D2FF]/40 hover:border-[#00D2FF] transition shadow-sm"
              title="Pull failed transactions directly from Razorpay"
            >
              <ArrowDownToLine className="h-3 w-3 text-[#00D2FF]" />
              <span>Razorpay Direct Pull</span>
            </button>
          )}
          <button
            type="button"
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 text-[10px] uppercase tracking-[0.2em] font-medium bg-[#1A1A1A] hover:bg-[#222222] text-[#E5E5E5] border border-[#2A2A2A] hover:border-[#C5A059]/40 transition"
          >
            <Download className="h-3 w-3 text-[#C5A059]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#141414] border border-[#2A2A2A] p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-[#E5E5E5]/40" />
            <input
              type="text"
              id="case-search-input"
              placeholder="Search by customer name, email, case ID, failure code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#0F0F0F] border border-[#2A2A2A] text-white placeholder-[#E5E5E5]/30 focus:outline-none focus:border-[#C5A059] transition font-sans"
            />
          </div>
          <button
            type="submit"
            id="search-submit-btn"
            className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold bg-[#C5A059] hover:bg-[#D4B36D] text-[#0F0F0F] border border-[#C5A059] transition shrink-0"
          >
            Search Cases
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#2A2A2A] text-xs">
          <div className="flex items-center space-x-1 text-[#C5A059] text-[10px] uppercase tracking-[0.2em] mr-2 font-medium">
            <Filter className="h-3 w-3" />
            <span>Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            id="status-filter-select"
            value={statusFilter}
            onChange={(e) => handleFilterUpdate(e.target.value, riskFilter, methodFilter, sortBy, sortOrder)}
            className="bg-[#0F0F0F] border border-[#2A2A2A] text-[#E5E5E5]/80 px-2.5 py-1 text-xs focus:outline-none focus:border-[#C5A059] font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTION_READY">Action Ready</option>
            <option value="AWAITING_HUMAN">Awaiting Human Review</option>
            <option value="RECOVERED">Recovered</option>
            <option value="FAILED">Failed Attempt</option>
            <option value="STOPPED">Stopped by Policy</option>
            <option value="ESCALATED">Escalated</option>
          </select>

          {/* Risk Filter */}
          <select
            id="risk-filter-select"
            value={riskFilter}
            onChange={(e) => handleFilterUpdate(statusFilter, e.target.value, methodFilter, sortBy, sortOrder)}
            className="bg-[#0F0F0F] border border-[#2A2A2A] text-[#E5E5E5]/80 px-2.5 py-1 text-xs focus:outline-none focus:border-[#C5A059] font-mono"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="CRITICAL">Critical Risk</option>
          </select>

          {/* Method Filter */}
          <select
            id="method-filter-select"
            value={methodFilter}
            onChange={(e) => handleFilterUpdate(statusFilter, riskFilter, e.target.value, sortBy, sortOrder)}
            className="bg-[#0F0F0F] border border-[#2A2A2A] text-[#E5E5E5]/80 px-2.5 py-1 text-xs focus:outline-none focus:border-[#C5A059] font-mono"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="NETBANKING">Netbanking</option>
            <option value="MANDATE">e-Mandate / Autopay</option>
          </select>

          {/* Sort Control */}
          <div className="ml-auto flex items-center space-x-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#E5E5E5]/50">Sort:</span>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => handleFilterUpdate(statusFilter, riskFilter, methodFilter, e.target.value as any, sortOrder)}
              className="bg-[#0F0F0F] border border-[#2A2A2A] text-[#E5E5E5]/80 px-2.5 py-1 text-xs focus:outline-none focus:border-[#C5A059] font-mono"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="probability">Probability</option>
              <option value="erv">Expected Value (ERV)</option>
            </select>
            <button
              type="button"
              id="sort-toggle-btn"
              onClick={() => handleFilterUpdate(statusFilter, riskFilter, methodFilter, sortBy, sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-1.5 bg-[#0F0F0F] border border-[#2A2A2A] text-[#E5E5E5]/60 hover:text-white"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#141414] border border-[#2A2A2A] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#E5E5E5]/80">
            <thead className="bg-[#1A1A1A] text-[#C5A059] uppercase text-[9px] tracking-[0.25em] border-b border-[#2A2A2A]">
              <tr>
                <th className="py-3 px-3 w-8 font-normal">
                  <input
                    type="checkbox"
                    checked={cases.length > 0 && selectedCaseIds.length === cases.length}
                    onChange={handleSelectAll}
                    className="border-[#2A2A2A] bg-[#0F0F0F] text-[#C5A059] focus:ring-0"
                  />
                </th>
                <th className="py-3 px-4 font-normal">Case ID / Customer</th>
                <th className="py-3 px-4 font-normal">Amount</th>
                <th className="py-3 px-4 font-normal">Failure & Method</th>
                <th className="py-3 px-4 font-normal">Recovery Prob.</th>
                <th className="py-3 px-4 font-normal">Expected Value (ERV)</th>
                <th className="py-3 px-4 font-normal">Policy Decision</th>
                <th className="py-3 px-4 font-normal">Status</th>
                <th className="py-3 px-4 text-right font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#E5E5E5]/60 font-light">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#2A2A2A] border-t-[#C5A059] mb-2" />
                    <p>Loading recovery queue...</p>
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#E5E5E5]/60 font-light">
                    <AlertCircle className="h-8 w-8 mx-auto text-[#C5A059] mb-2" />
                    <p className="font-serif italic text-white text-base">No cases found matching filter criteria</p>
                    <p className="text-xs text-[#E5E5E5]/40 mt-1">Try broadening your search or resetting filters</p>
                  </td>
                </tr>
              ) : (
                cases.map((c) => {
                  const statusStyle = getStatusBadgeStyle(c.status);
                  const riskStyle = getRiskBadgeStyle(c.risk_level);
                  const isSelected = selectedCaseIds.includes(c.id);

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectCase(c)}
                      className={`hover:bg-[#1C1A14] cursor-pointer transition ${
                        isSelected ? 'bg-[#C5A059]/5' : ''
                      }`}
                    >
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectCase(c.id)}
                          className="border-[#2A2A2A] bg-[#0F0F0F] text-[#C5A059] focus:ring-0"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-serif text-white">{c.customer.name}</div>
                        <div className="text-[10px] font-mono text-[#E5E5E5]/40 flex items-center space-x-1">
                          <span>{c.id}</span>
                          <span>•</span>
                          <span>{c.customer.segment}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-serif font-semibold text-white text-sm">{formatINR(c.amount)}</div>
                        {c.recovered_amount > 0 && (
                          <div className="text-[10px] font-mono text-[#00FF66]">
                            Recovered: {formatINR(c.recovered_amount)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[#E5E5E5]/90">
                          {c.failure_reason.replace(/_/g, ' ')}
                        </div>
                        <div className="text-[10px] font-mono text-[#E5E5E5]/40">
                          {c.payment_method} • {c.retry_count} retries
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-semibold text-white">
                            {(c.recovery_probability * 100).toFixed(0)}%
                          </span>
                          <span className={`px-1.5 py-0.5 text-[9px] font-mono ${riskStyle.bg}`}>
                            {c.risk_level}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-serif font-semibold text-[#C5A059]">
                        {formatINR(c.expected_recovery_value)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          <span
                            className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider ${
                              c.policy_decision === 'ALLOW'
                                ? 'bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30'
                                : c.policy_decision === 'HUMAN_REVIEW'
                                ? 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {c.policy_decision}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#E5E5E5]/40 truncate max-w-[140px] font-light mt-0.5" title={c.policy_reason}>
                          {c.policy_reason}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          {c.status === 'AWAITING_HUMAN' && (
                            <button
                              type="button"
                              onClick={() => onApproveCase(c)}
                              className="px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] font-bold bg-[#C5A059] hover:bg-[#D4B36D] text-[#0F0F0F] transition"
                              title="Review & Approve Case"
                            >
                              Review
                            </button>
                          )}
                          {c.status === 'ACTION_READY' && c.policy_decision === 'ALLOW' && (
                            <button
                              type="button"
                              onClick={() => onExecuteCase(c)}
                              className="px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] font-bold bg-[#C5A059] hover:bg-[#D4B36D] text-[#0F0F0F] transition flex items-center space-x-1"
                              title="Execute Authorized Intervention"
                            >
                              <Play className="h-2.5 w-2.5 fill-current" />
                              <span>Execute</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onSelectCase(c)}
                            className="p-1 text-[#E5E5E5]/40 hover:text-white transition"
                            title="Inspect Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-3.5 border-t border-[#2A2A2A] bg-[#141414] flex items-center justify-between text-xs text-[#E5E5E5]/60 font-light">
          <div>
            Showing <span className="text-white font-medium font-mono">{cases.length}</span> of{' '}
            <span className="text-white font-medium font-mono">{totalCases}</span> total revenue recovery cases
          </div>
          <div className="text-[10px] uppercase tracking-widest text-[#E5E5E5]/40">
            All actions executed through ReviveAI verify real gateway settlement.
          </div>
        </div>
      </div>
    </div>
  );
};
