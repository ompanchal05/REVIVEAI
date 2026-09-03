// ReviveAI — Currency, Date, and Status Formatters

export function formatINR(amount: number, compact = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';

  if (compact) {
    if (Math.abs(amount) >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(amount) >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    }
    if (Math.abs(amount) >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatPercent(val: number): string {
  if (isNaN(val)) return '0%';
  return `${val.toFixed(1)}%`;
}

export function formatTimeAgo(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  } catch {
    return isoString;
  }
}

export function getStatusBadgeStyle(status: string): { bg: string; text: string; border: string } {
  switch (status) {
    case 'RECOVERED':
      return { bg: 'bg-[#00FF66]/10', text: 'text-[#00FF66]', border: 'border-[#00FF66]/30' };
    case 'ACTION_READY':
    case 'PREDICTED':
      return { bg: 'bg-[#C5A059]/10', text: 'text-[#C5A059]', border: 'border-[#C5A059]/40' };
    case 'AWAITING_HUMAN':
      return { bg: 'bg-[#D4A373]/15', text: 'text-[#E0A84D]', border: 'border-[#E0A84D]/40' };
    case 'EXECUTING':
    case 'VERIFYING':
      return { bg: 'bg-indigo-500/10', text: 'text-indigo-300', border: 'border-indigo-500/30' };
    case 'FAILED':
      return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' };
    case 'STOPPED':
      return { bg: 'bg-[#1A1A1A]', text: 'text-[#E5E5E5]/60', border: 'border-[#2A2A2A]' };
    case 'ESCALATED':
      return { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/40' };
    default:
      return { bg: 'bg-[#141414]', text: 'text-[#E5E5E5]/70', border: 'border-[#2A2A2A]' };
  }
}

export function getRiskBadgeStyle(risk: string): { bg: string; text: string } {
  switch (risk) {
    case 'LOW':
      return { bg: 'bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20', text: 'text-[#00FF66]' };
    case 'MEDIUM':
      return { bg: 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30', text: 'text-[#C5A059]' };
    case 'HIGH':
      return { bg: 'bg-orange-500/10 text-orange-400 border border-orange-500/30', text: 'text-orange-400' };
    case 'CRITICAL':
      return { bg: 'bg-rose-500/15 text-rose-400 border border-rose-500/40', text: 'text-rose-400' };
    default:
      return { bg: 'bg-[#1A1A1A] text-[#E5E5E5]/60 border border-[#2A2A2A]', text: 'text-[#E5E5E5]/60' };
  }
}
