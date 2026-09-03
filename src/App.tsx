import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { OverviewView } from './components/OverviewView';
import { RecoveryQueueView } from './components/RecoveryQueueView';
import { CaseDetailsDrawer } from './components/CaseDetailsDrawer';
import { AIInvestigationView } from './components/AIInvestigationView';
import { HumanReviewView } from './components/HumanReviewView';
import { AnalyticsView } from './components/AnalyticsView';
import { ModelPerformanceView } from './components/ModelPerformanceView';
import { ExperimentsView } from './components/ExperimentsView';
import { AuditTrailView } from './components/AuditTrailView';
import { SystemStatusSettingsView } from './components/SystemStatusSettingsView';
import { DemoRunnerModal } from './components/DemoRunnerModal';
import { LandingHeroModal } from './components/LandingHeroModal';
import {
  ActionType,
  AuditLog,
  DashboardMetrics,
  RecoveryAction,
  RecoveryCase,
  SystemStatus
} from './types';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { User } from 'firebase/auth';
import {
  auth,
  onAuthStateChanged,
  loginWithGoogle,
  logoutUser,
  testConnection,
  syncCaseToFirestore
} from './lib/firebase';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [totalCases, setTotalCases] = useState<number>(0);
  const [humanReviewQueue, setHumanReviewQueue] = useState<RecoveryCase[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loadingCases, setLoadingCases] = useState<boolean>(true);

  // Firebase Auth & Firestore Connection State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(true);

  // Selected Case Drawer state
  const [selectedCase, setSelectedCase] = useState<RecoveryCase | null>(null);
  const [selectedCaseActions, setSelectedCaseActions] = useState<RecoveryAction[]>([]);
  const [selectedCaseAudit, setSelectedCaseAudit] = useState<AuditLog[]>([]);

  // Modals
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState<boolean>(false);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Overview Metrics
  const loadOverview = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/overview');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard overview:', err);
    }
  }, []);

  // Load Recovery Cases with query params
  const loadCases = useCallback(async (filters: Record<string, any> = {}) => {
    setLoadingCases(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== 'ALL' && v !== '') {
          params.append(k, String(v));
        }
      });
      const res = await fetch(`/api/recovery/cases?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases || []);
        setTotalCases(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load recovery cases:', err);
    } finally {
      setLoadingCases(false);
    }
  }, []);

  // Load Human Review Queue
  const loadHumanReviewQueue = useCallback(async () => {
    try {
      const res = await fetch('/api/human-review/queue');
      if (res.ok) {
        const data = await res.json();
        setHumanReviewQueue(data.cases || []);
      }
    } catch (err) {
      console.error('Failed to load human review queue:', err);
    }
  }, []);

  // Load System Status
  const loadSystemStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/system/status');
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch (err) {
      console.error('Failed to load system status:', err);
    }
  }, []);

  // Initial Load & Firebase Boot Connection
  useEffect(() => {
    loadOverview();
    loadCases();
    loadHumanReviewQueue();
    loadSystemStatus();

    // Mandated Firebase Firestore connection test on boot
    testConnection().then((res) => {
      setFirebaseConnected(res.connected);
    });

    // Firebase Auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, [loadOverview, loadCases, loadHumanReviewQueue, loadSystemStatus]);

  const handleSignInWithGoogle = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        showToast(`Signed in as ${user.displayName || user.email}`, 'success');
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        showToast(`Authentication error: ${err.message || 'Failed to sign in'}`, 'error');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      showToast('Signed out of Firebase session.', 'warning');
    } catch (err: any) {
      showToast(`Sign out error: ${err.message}`, 'error');
    }
  };

  // Open single case dossier
  const handleOpenCase = async (c: RecoveryCase) => {
    setSelectedCase(c);
    try {
      const res = await fetch(`/api/recovery/cases/${c.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedCase(data.case);
        setSelectedCaseActions(data.actions || []);
        setSelectedCaseAudit(data.audit_logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch case details:', err);
    }
  };

  // Execute Action
  const handleExecuteAction = async (caseId: string, actionType: ActionType, idempotencyKey: string) => {
    try {
      const res = await fetch(`/api/recovery/cases/${caseId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({ action_type: actionType, idempotency_key: idempotencyKey })
      });

      const data = await res.json();

      if (res.ok) {
        setSelectedCase(data.case);
        if (currentUser && data.case) {
          syncCaseToFirestore(data.case, currentUser).catch((e) =>
            console.warn('[Firestore] Background sync notice:', e)
          );
        }
        showToast(
          data.outcome?.recovered
            ? `Verified Recovery: ₹${data.outcome.amount.toLocaleString('en-IN')} confirmed settled via Razorpay!`
            : `Action ${actionType} executed. Outcome: ${data.outcome?.message}`,
          data.outcome?.recovered ? 'success' : 'warning'
        );
        loadOverview();
        loadCases();
        loadHumanReviewQueue();
      } else {
        showToast(`Policy Guard: ${data.error?.message || 'Execution blocked'}`, 'error');
      }
    } catch (err: any) {
      showToast(`Execution failed: ${err.message}`, 'error');
    }
  };

  // Stop Case
  const handleStopCase = async (caseId: string) => {
    try {
      const res = await fetch(`/api/recovery/cases/${caseId}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Manual stop initiated by operator.' })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedCase(updated);
        showToast('Case recovery halted per operator request.', 'warning');
        loadOverview();
        loadCases();
        loadHumanReviewQueue();
      }
    } catch (err: any) {
      showToast(`Failed to stop case: ${err.message}`, 'error');
    }
  };

  // Escalate Case
  const handleEscalateCase = async (caseId: string) => {
    try {
      const res = await fetch(`/api/recovery/cases/${caseId}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Escalated to Senior Risk and Compliance operations.' })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedCase(updated);
        showToast('Case escalated to Senior Risk Ops.', 'warning');
        loadOverview();
        loadCases();
        loadHumanReviewQueue();
      }
    } catch (err: any) {
      showToast(`Failed to escalate case: ${err.message}`, 'error');
    }
  };

  // Human Review Approval
  const handleApproveCase = async (
    caseId: string,
    decision: 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'STOPPED',
    notes: string
  ) => {
    try {
      const res = await fetch(`/api/recovery/cases/${caseId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          notes,
          reviewer_name: 'Senior Finance Manager',
          reviewer_role: 'FINANCE_MANAGER'
        })
      });
      if (res.ok) {
        showToast(`Review completed: Case marked as ${decision}.`, 'success');
        loadOverview();
        loadCases();
        loadHumanReviewQueue();
        if (selectedCase?.id === caseId) {
          const updated = await res.json();
          setSelectedCase(updated.case);
        }
      }
    } catch (err: any) {
      showToast(`Review submission error: ${err.message}`, 'error');
    }
  };

  // AI Re-Investigation
  const handleReanalyzeAI = async (caseId: string) => {
    try {
      const res = await fetch(`/api/recovery/cases/${caseId}/analyze`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setSelectedCase(updated);
        showToast('AI Diagnostic synthesized with Gemini 3.8 Flash.', 'success');
        loadOverview();
        loadCases();
      }
    } catch (err: any) {
      showToast(`AI Analysis failed: ${err.message}`, 'error');
    }
  };

  // ML Re-Prediction
  const handleRepredictML = async (caseId: string) => {
    try {
      const res = await fetch(`/api/recovery/cases/${caseId}/predict`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSelectedCase(data.case);
        showToast('ML probability score refreshed with XGBoost v1.4.', 'success');
        loadOverview();
        loadCases();
      }
    } catch (err: any) {
      showToast(`ML Prediction failed: ${err.message}`, 'error');
    }
  };

  // Inject Scenario (1-7)
  const handleSelectScenario = async (num: number) => {
    try {
      const res = await fetch(`/api/demo/scenario/${num}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(`Injected Scenario ${num}: ${data.case.failure_reason}`, 'success');
        loadOverview();
        loadCases();
        loadHumanReviewQueue();
        handleOpenCase(data.case);
      }
    } catch (err: any) {
      showToast(`Failed to inject scenario: ${err.message}`, 'error');
    }
  };

  // Reset Dataset
  const handleResetData = async () => {
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        showToast('Reset database to pristine 1,000 synthetic test cohort.', 'success');
        loadOverview();
        loadCases();
        loadHumanReviewQueue();
        loadSystemStatus();
      }
    } catch (err: any) {
      showToast(`Reset error: ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[#E5E5E5] flex flex-col font-sans selection:bg-[#C5A059]/30 selection:text-white">
      {/* Toast Feedback Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-md shadow-2xl text-xs font-medium border bg-[#141414] ${
              toast.type === 'success'
                ? 'border-[#00FF66]/40 text-[#E5E5E5]'
                : toast.type === 'warning'
                ? 'border-[#C5A059]/60 text-[#E5E5E5]'
                : 'border-rose-500/40 text-[#E5E5E5]'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-[#00FF66]" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-[#C5A059]" />
            )}
            <span className="tracking-wide">{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="p-1 text-[#E5E5E5]/60 hover:text-white transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Global Header */}
      <Header
        systemStatus={systemStatus}
        currentUser={currentUser}
        firebaseConnected={firebaseConnected}
        onSignInWithGoogle={handleSignInWithGoogle}
        onSignOut={handleSignOut}
        onRunBatchDemo={() => setIsBatchModalOpen(true)}
        onSeedData={() => handleResetData()}
        onResetData={handleResetData}
        onSelectScenario={handleSelectScenario}
        onOpenArchitectureInfo={() => setIsArchModalOpen(true)}
      />

      {/* App Shell: Sidebar + Main Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          humanReviewCount={humanReviewQueue.length}
          activeCasesCount={metrics?.active_cases || cases.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-x-hidden min-w-0">
          {currentTab === 'overview' && (
            <OverviewView
              metrics={metrics}
              cases={cases}
              onSelectCase={handleOpenCase}
              onNavigateToQueue={() => setCurrentTab('queue')}
              onNavigateToExperiments={() => setCurrentTab('experiments')}
            />
          )}

          {currentTab === 'queue' && (
            <RecoveryQueueView
              cases={cases}
              totalCases={totalCases}
              loading={loadingCases}
              onSelectCase={handleOpenCase}
              onExecuteCase={(c) => handleExecuteAction(c.id, c.proposed_action, `idemp_${c.id}_${Date.now()}`)}
              onApproveCase={(c) => {
                handleOpenCase(c);
                setCurrentTab('human_review');
              }}
              onFilterChange={(filters) => loadCases(filters)}
            />
          )}

          {currentTab === 'investigation' && (
            <AIInvestigationView
              cases={cases}
              onSelectCase={handleOpenCase}
              onRunInvestigation={handleReanalyzeAI}
            />
          )}

          {currentTab === 'human_review' && (
            <HumanReviewView
              queue={humanReviewQueue}
              onSelectCase={handleOpenCase}
              onApproveCase={handleApproveCase}
            />
          )}

          {currentTab === 'analytics' && <AnalyticsView metrics={metrics} />}

          {currentTab === 'model_performance' && <ModelPerformanceView />}

          {currentTab === 'experiments' && <ExperimentsView />}

          {currentTab === 'audit' && <AuditTrailView />}

          {currentTab === 'settings' && (
            <SystemStatusSettingsView
              systemStatus={systemStatus}
              currentUser={currentUser}
              firebaseConnected={firebaseConnected}
              onRefreshStatus={loadSystemStatus}
            />
          )}
        </main>
      </div>

      {/* Drawer: Detailed Case Dossier */}
      {selectedCase && (
        <CaseDetailsDrawer
          caseData={selectedCase}
          actions={selectedCaseActions}
          auditLogs={selectedCaseAudit}
          onClose={() => setSelectedCase(null)}
          onExecuteAction={handleExecuteAction}
          onStopCase={handleStopCase}
          onEscalateCase={handleEscalateCase}
          onReanalyzeAI={handleReanalyzeAI}
          onRepredictML={handleRepredictML}
        />
      )}

      {/* Batch Demo Runner Modal */}
      <DemoRunnerModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onCompleted={() => {
          loadOverview();
          loadCases();
          loadHumanReviewQueue();
        }}
      />

      {/* Architecture & Governance Principle Modal */}
      <LandingHeroModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />
    </div>
  );
}
