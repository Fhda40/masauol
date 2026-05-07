import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import {
  Clock, AlertTriangle, Mail, Phone, User,
  ArrowLeft, FileText, TrendingUp, Lock,
  Search, RefreshCw, LogOut, CheckCircle2,
  XCircle, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

const riskLabels: Record<string, string> = {
  low: "منخفضة", medium: "متوسطة", high: "عالية", critical: "حرجة",
};
const urgencyLabels: Record<string, string> = {
  low: "عادي", medium: "متوسطة", high: "عاجلة", urgent: "حرجة",
};
const statusLabels: Record<string, string> = {
  new: "جديد", contacted: "تم التواصل", qualified: "مؤهل", closed: "مغلق",
};
const riskColor: Record<string, string> = {
  low: "#22c55e", medium: "#3b82f6", high: "#f59e0b", critical: "#ef4444",
};
const urgencyBg: Record<string, string> = {
  low: "rgba(0,0,0,0.04)", medium: "rgba(59,130,246,0.1)",
  high: "rgba(239,68,68,0.1)", urgent: "rgba(239,68,68,0.15)",
};

// ── Login Screen ──────────────────────────────────────────────
function LoginScreen({ onAuth }: { onAuth: (token: string) => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: (data) => {
      sessionStorage.setItem("masoul_admin_token", data.token);
      onAuth(data.token);
    },
    onError: (e) => {
      setError(e.message);
      setPw("");
    },
  });

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="card-apple p-8 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "#171717" }}>
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>لوحة التحكم</h2>
          <p className="text-xs mb-6" style={{ color: "var(--text-tertiary)" }}>أدخل كلمة المرور للمتابعة</p>
          <form onSubmit={(e) => { e.preventDefault(); loginMutation.mutate({ password: pw }); }} className="space-y-4">
            <input
              type="password" value={pw}
              onChange={(e) => { setPw(e.target.value); setError(""); }}
              placeholder="كلمة المرور"
              className="input-apple text-center w-full"
              dir="ltr" autoFocus
            />
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-xs flex items-center justify-center gap-1.5"
                  style={{ color: "#ef4444" }}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            <button
              type="submit"
              disabled={loginMutation.isPending || !pw}
              className="btn-apple w-full justify-center disabled:opacity-60"
            >
              {loginMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <><Lock className="w-4 h-4" /> دخول</>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const { data: leads, isLoading, refetch } = trpc.lead.list.useQuery(undefined, {
    refetchInterval: 30_000,
    onSuccess: () => setLastRefresh(new Date()),
  });

  const utils = trpc.useUtils();
  const updateLead = trpc.lead.update.useMutation({
    onSuccess: () => utils.lead.list.invalidate(),
  });

  const handleRefresh = useCallback(() => {
    refetch();
    setLastRefresh(new Date());
  }, [refetch]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(handleRefresh, 30_000);
    return () => clearInterval(id);
  }, [handleRefresh]);

  const filtered = leads?.filter((l) => {
    const matchStatus = filter === "all" || l.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || [l.contactName, l.contactPhone, l.contactEmail, l.caseType, l.issueSummary]
      .some((v) => v?.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  }) ?? [];

  const total = leads?.length ?? 0;
  const newCount = leads?.filter((l) => l.status === "new").length ?? 0;
  const highRisk = leads?.filter((l) => l.riskLevel === "high" || l.riskLevel === "critical").length ?? 0;
  const urgent = leads?.filter((l) => l.urgencyLevel === "urgent" || l.urgencyLevel === "high").length ?? 0;

  return (
    <div className="pb-20">
      {/* Header */}
      <section className="section-apple border-b" style={{ borderColor: "var(--border-primary)" }}>
        <div className="container-apple">
          <div className="flex items-center justify-between">
            <div>
              <span className="badge-apple mb-2 inline-flex"><FileText className="w-3.5 h-3.5" />لوحة التحكم</span>
              <h1 className="headline-section">إدارة الطلبات</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors"
                style={{ color: "var(--text-tertiary)", backgroundColor: "var(--bg-secondary)" }}
                title="تحديث"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {lastRefresh.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors"
                style={{ color: "#ef4444", backgroundColor: "rgba(239,68,68,0.08)" }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">خروج</span>
              </button>
              <Link
                to="/"
                className="flex items-center gap-1.5 text-xs transition-colors"
                style={{ color: "var(--text-tertiary)" }}
              >
                <ArrowLeft className="w-3 h-3" />
                <span className="hidden sm:inline">الموقع</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container-apple">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 mt-6">
          {[
            { icon: <FileText className="w-4 h-4" />, label: "إجمالي الطلبات", value: total, color: "var(--text-primary)" },
            { icon: <Clock className="w-4 h-4" />, label: "جديدة", value: newCount, color: "#3b82f6", pulse: newCount > 0 },
            { icon: <AlertTriangle className="w-4 h-4" />, label: "مخاطر عالية", value: highRisk, color: "#f59e0b" },
            { icon: <TrendingUp className="w-4 h-4" />, label: "عاجلة", value: urgent, color: "#ef4444", pulse: urgent > 0 },
          ].map((s) => (
            <div key={s.label} className="card-apple p-4 relative overflow-hidden">
              {s.pulse && s.value > 0 && (
                <span className="absolute top-3 left-3 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: s.color }} />
              )}
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: "var(--text-tertiary)" }}>{s.icon}</span>
                <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{s.label}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو الجوال أو الموضوع..."
              className="input-apple w-full pr-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "الكل", count: total },
              { key: "new", label: "جديد", count: newCount },
              { key: "contacted", label: "تواصلنا" },
              { key: "qualified", label: "مؤهل" },
              { key: "closed", label: "مغلق" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1.5"
                style={{
                  backgroundColor: filter === f.key ? "#171717" : "var(--bg-secondary)",
                  color: filter === f.key ? "#fff" : "var(--text-secondary)",
                }}
              >
                {f.label}
                {f.count !== undefined && f.count > 0 && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      backgroundColor: filter === f.key ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)",
                    }}
                  >
                    {f.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Leads List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-5 h-5 animate-spin" style={{ color: "var(--text-tertiary)" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-apple p-12 text-center">
            <FileText className="w-8 h-8 mx-auto mb-4" style={{ color: "var(--text-tertiary)" }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {search ? "لا توجد نتائج للبحث" : "لا توجد طلبات"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((lead, i) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02, duration: 0.35 }}
                className="card-apple"
              >
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                        <span
                          className="text-[10px] font-semibold px-2.5 py-1 rounded-full border"
                          style={{
                            borderColor: lead.status === "new" ? "#3b82f6" : "transparent",
                            backgroundColor: lead.status === "new" ? "rgba(59,130,246,0.08)" : "rgba(0,0,0,0.04)",
                            color: lead.status === "new" ? "#3b82f6" : "#888",
                          }}
                        >
                          {statusLabels[lead.status]}
                        </span>
                        <span
                          className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                          style={{
                            backgroundColor: urgencyBg[lead.urgencyLevel],
                            color: riskColor[lead.riskLevel],
                          }}
                        >
                          خطر: {riskLabels[lead.riskLevel]}
                        </span>
                        <span
                          className="text-[10px] font-medium px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-tertiary)" }}
                        >
                          {lead.caseType}
                        </span>
                        <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                          #{lead.id}
                        </span>
                      </div>

                      {/* Summary */}
                      <p className="text-sm leading-relaxed mb-3 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                        {lead.issueSummary}
                      </p>

                      {/* Contact info */}
                      <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--text-tertiary)" }}>
                        {lead.contactName && (
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{lead.contactName}</span>
                        )}
                        {lead.contactPhone && (
                          <a href={`tel:${lead.contactPhone}`} className="flex items-center gap-1 hover:underline" style={{ color: "#3b82f6" }}>
                            <Phone className="w-3 h-3" />{lead.contactPhone}
                          </a>
                        )}
                        {lead.contactEmail && (
                          <a href={`mailto:${lead.contactEmail}`} className="flex items-center gap-1 hover:underline" style={{ color: "#3b82f6" }}>
                            <Mail className="w-3 h-3" />{lead.contactEmail}
                          </a>
                        )}
                        <span>{new Date(lead.createdAt).toLocaleString("ar-SA", { dateStyle: "short", timeStyle: "short" })}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {lead.status === "new" && (
                        <Button size="sm" variant="outline"
                          onClick={() => updateLead.mutate({ id: lead.id, status: "contacted" })}
                          className="text-xs h-8 rounded-full gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> تواصلنا
                        </Button>
                      )}
                      {lead.status === "contacted" && (
                        <Button size="sm" variant="outline"
                          onClick={() => updateLead.mutate({ id: lead.id, status: "qualified" })}
                          className="text-xs h-8 rounded-full"
                        >
                          مؤهل
                        </Button>
                      )}
                      {(lead.status === "new" || lead.status === "contacted" || lead.status === "qualified") && (
                        <Button size="sm" variant="outline"
                          onClick={() => updateLead.mutate({ id: lead.id, status: "closed" })}
                          className="text-xs h-8 rounded-full gap-1.5"
                          style={{ color: "#888" }}
                        >
                          <XCircle className="w-3.5 h-3.5" /> إغلاق
                        </Button>
                      )}
                      {lead.status === "closed" && (
                        <Button size="sm" variant="outline"
                          onClick={() => updateLead.mutate({ id: lead.id, status: "new" })}
                          className="text-xs h-8 rounded-full"
                        >
                          إعادة فتح
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function Admin() {
  const [token, setToken] = useState<string | null>(
    () => sessionStorage.getItem("masoul_admin_token")
  );

  // Verify existing session on load
  const { data: verify } = trpc.admin.verify.useQuery(undefined, {
    enabled: !!token,
    retry: false,
  });

  const isAuthed = !!token && verify?.valid !== false;

  const handleLogout = () => {
    sessionStorage.removeItem("masoul_admin_token");
    setToken(null);
  };

  // If session expired on server, clear locally
  useEffect(() => {
    if (token && verify?.valid === false) handleLogout();
  }, [verify, token]);

  if (!isAuthed) {
    return <LoginScreen onAuth={setToken} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}
