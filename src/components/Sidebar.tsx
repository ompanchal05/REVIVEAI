import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  Sparkles,
  UserCheck,
  BarChart3,
  Cpu,
  FlaskConical,
  ScrollText,
  Settings,
  ShieldCheck
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'queue'
  | 'investigation'
  | 'human_review'
  | 'analytics'
  | 'model_performance'
  | 'experiments'
  | 'audit'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  humanReviewCount: number;
  activeCasesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  humanReviewCount,
  activeCasesCount,
}) => {
  const navItems: { id: NavTab; label: string; icon: any; badge?: number; badgeColor?: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'queue', label: 'Recovery Queue', icon: Inbox, badge: activeCasesCount, badgeColor: 'bg-[#1A1A1A] text-[#E5E5E5]/80 border border-[#2A2A2A]' },
    { id: 'investigation', label: 'AI Investigation', icon: Sparkles },
    {
      id: 'human_review',
      label: 'Human Review',
      icon: UserCheck,
      badge: humanReviewCount > 0 ? humanReviewCount : undefined,
      badgeColor: 'bg-[#C5A059] text-[#0F0F0F] font-bold'
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'model_performance', label: 'Model Performance', icon: Cpu },
    { id: 'experiments', label: 'Experiments', icon: FlaskConical },
    { id: 'audit', label: 'Audit Trail', icon: ScrollText },
    { id: 'settings', label: 'System & Policy', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0F0F0F] border-r border-[#2A2A2A] flex flex-col shrink-0 min-h-[calc(100vh-4.5rem)]">
      <div className="p-4 flex-1 space-y-1">
        <div className="flex items-center space-x-2 px-3 mb-3">
          <div className="w-2 h-2 rounded-full bg-[#C5A059]/80" />
          <div className="text-[9px] font-bold tracking-[0.3em] text-[#C5A059] uppercase">
            Navigation / Core
          </div>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              id={`nav-item-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-[11px] uppercase tracking-[0.15em] font-medium transition ${
                isActive
                  ? 'bg-[#1A1A1A] text-white border-l-2 border-[#C5A059] pl-2.5'
                  : 'text-[#E5E5E5]/60 hover:text-white hover:bg-[#141414] border-l-2 border-transparent pl-2.5'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#C5A059]' : 'text-[#E5E5E5]/50'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`px-2 py-0.5 text-[9px] font-mono rounded-none ${item.badgeColor || 'bg-[#1A1A1A] text-[#E5E5E5]/70 border border-[#2A2A2A]'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Trust & Architecture Motto Box */}
      <div className="p-5 border-t border-[#2A2A2A] bg-[#141414] relative overflow-hidden">
        <div className="w-8 h-[1px] bg-[#C5A059] mb-3" />
        <div className="flex items-center space-x-2 text-[#C5A059] mb-1.5">
          <ShieldCheck className="h-4 w-4 text-[#C5A059]" />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Financial Safety</span>
        </div>
        <p className="text-xs font-serif italic text-[#E5E5E5]/70 leading-relaxed">
          "AI recommends. Policy controls. Humans oversee. Systems execute."
        </p>
      </div>
    </aside>
  );
};
