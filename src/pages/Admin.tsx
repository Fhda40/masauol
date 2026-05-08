import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import {
  Clock, AlertTriangle, Mail, Phone, User,
  ArrowLeft, FileText, TrendingUp, Search,
  X, Scale, ChevronLeft, LayoutList, Columns3,
  Calendar, CheckCircle2, Circle, ArrowUpRight,
  Lock, Eye, EyeOff, LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import GlowCard from "@/components/GlowCard";
import { useTheme } from "@/contexts/ThemeContext";

// ── Lookup maps ──────────────────────────────────────────────────────────────

const riskConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  low:      { label: "منخفضة", color: "#17B26A", bg: "rgba(23,178,106,0.10)", border: "rgba(23,178,106,0.25)" },
  medium:   { label: "متوسطة", color: "#4EA8DE", bg: "rgba(78,168,222,0.10)", border: "rgba(78,168,222,0.25)" },
  high:     { label: "عالية",  color: "#F59E0B", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.25)" },
  critical: { label: "حرجة",  color: "#F04438", bg: "rgba(240,68,56,0.10)",  border: "rgba(240,68,56,0.25)" },
};

const urgencyConfig: Record<string, { label: string; accent: string; barColor: string }> = {
  low:    { label: "عادي",   accent: "rgba(255,255,255,0.15)", barColor: "#475569" },
  medium: { label: "متوسطة", accent: "rgba(78,168,222,0.35)",  barColor: "#4EA8DE" },
  high:   { label: "عاجلة",  accent: "rgba(245,158,11,0.35)",  barColor: "#F59E0B" },
  urgent: { label: "حرجة",   accent: "rgba(240,68,56,0.45)",   barColor: "#F04438" },
};

const statusConfig: Record<string, { label: string; color: string; bg: string; step: number }> = {
  new:       { label: "جديد",        color: "#4EA8DE", bg: "rgba(78,168,222,0.12)",  step: 1 },
  contacted: { label: "تم التواصل",  color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  step: 2 },
  qualified: { label: "مؤهل",        color: "#17B26A", bg: "rgba(23,178,106,0.12)",  step: 3 },
  closed:    { label: "مغلق",        color: "#64748B", bg: "rgba(100,116,139,0.12)", step: 4 },
};

const PIPELINE_STEPS = [
  { key: "new",       label: "جديد",       icon: Circle },
  { key: "contacted", label: "تواصل",      icon: Phone },
  { key: "qualified", label: "مؤهل",       icon: CheckCircle2 },
  { key: "closed",    label: "مغلق",       icon: Scale },
];

// ── Types ────────────────────────────────────────────────────────────────────

type Lead = {
  id: string;
  status: string;
  riskLevel: string;
  urgencyLevel: string;
  caseType: string;
  issueSummary: string;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  createdAt: string | Date;
};

// ── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, accent, delay = 0,
}: {
  icon: React.ReactNode; label: string; value: number; accent: string; delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <GlowCard glowColor={accent} intensity={0.18}>
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: `${accent}22`, border: `1px solid ${accent}33` }}
            >
              <span style={{ color: accent }}>{icon}</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5" style={{ color: "var(--text-faint)" }} />
          </div>
          <div>
            <div
              className="text-3xl font-black tabular-nums"
              style={{ color: "var(--text-primary)", fontFamily: "'IBM Plex Sans Arabic', sans-serif", letterSpacing: "-0.02em" }}
            >
              {value}
            </div>
            <div className="text-[11px] mt-0.5 font-mono-ar" style={{ color: "var(--text-faint)" }}>
              {label}
            </div>
          </div>
          {/* Thin accent bar */}
          <div className="h-px w-full rounded-full" style={{ background: `linear-gradient(to left, ${accent}44, transparent)` }} />
        </div>
      </GlowCard>
    </motion.div>
  );
}

function PipelineBar({ leads }: { leads: Lead[] }) {
  const counts = useMemo(() => ({
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    qualified: leads.filter((l) => l.status === "qualified").length,
    closed: leads.filter((l) => l.status === "closed").length,
  }), [leads]);
  const total = leads.length || 1;

  return (
    <div className="rounded-xl p-4 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono-ar tracking-wider uppercase" style={{ color: "var(--text-faint)" }}>مسار الطلبات</span>
        <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>{leads.length} طلب إجمالي</span>
      </div>
      {/* Segmented progress bar */}
      <div className="flex rounded-full overflow-hidden gap-px h-2 mb-3">
        {PIPELINE_STEPS.map(({ key }) => {
          const cfg = statusConfig[key];
          const pct = (counts[key as keyof typeof counts] / total) * 100;
          return pct > 0 ? (
            <div key={key} className="h-full transition-all duration-700" style={{ width: `${pct}%`, background: cfg.color }} />
          ) : null;
        })}
      </div>
      {/* Step labels */}
      <div className="flex items-center justify-between">
        {PIPELINE_STEPS.map(({ key, label }) => {
          const cfg = statusConfig[key];
          const count = counts[key as keyof typeof counts];
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
              <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>{label}</span>
              <span className="text-[10px] font-bold" style={{ color: cfg.color }}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LeadCard({
  lead, isSelected, onClick, onUpdate, isUpdating,
}: {
  lead: Lead;
  isSelected: boolean;
  onClick: () => void;
  onUpdate: (status: string) => void;
  isUpdating: boolean;
}) {
  const urgency = urgencyConfig[lead.urgencyLevel] ?? urgencyConfig.low;
  const risk = riskConfig[lead.riskLevel] ?? riskConfig.low;
  const status = statusConfig[lead.status] ?? statusConfig.new;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div
        className="relative rounded-xl overflow-hidden transition-all duration-200"
        style={{
          background: isSelected ? "var(--bg-card-hover)" : "var(--bg-card)",
          border: `1px solid ${isSelected ? status.color + "44" : "var(--border-subtle)"}`,
          boxShadow: isSelected ? `0 0 0 1px ${status.color}22, 0 4px 24px rgba(0,0,0,0.15)` : undefined,
        }}
      >
        {/* Urgency accent — left strip (in RTL = right side visually) */}
        <div
          className="absolute inset-y-0 right-0 w-0.5 transition-opacity duration-200"
          style={{ background: urgency.barColor, opacity: isSelected ? 1 : 0.5 }}
        />

        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            {/* Left: Content */}
            <div className="flex-1 min-w-0">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-sm"
                  style={{ background: status.bg, color: status.color }}
                >
                  {status.label}
                </span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-sm"
                  style={{ background: risk.bg, color: risk.color, border: `1px solid ${risk.border}` }}
                >
                  خطر {risk.label}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-sm" style={{ background: "var(--bg-input)", color: "var(--text-muted)" }}>
                  {lead.caseType}
                </span>
              </div>

              {/* Summary */}
              <p
                className="text-sm leading-relaxed mb-3 line-clamp-2 transition-colors"
                style={{ color: isSelected ? "var(--text-secondary)" : "var(--text-muted)" }}
              >
                {lead.issueSummary}
              </p>

              {/* Contact info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]" style={{ color: "var(--text-faint)" }}>
                {lead.contactName && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {lead.contactName}
                  </span>
                )}
                {lead.contactPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {lead.contactPhone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(lead.createdAt).toLocaleDateString("ar-SA")}
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0 sm:flex-col sm:items-end">
              {lead.status === "new" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={(e) => { e.stopPropagation(); onUpdate("contacted"); }}
                  className="text-[11px] h-7 cursor-pointer transition-all"
                  style={{ borderColor: "rgba(245,158,11,0.35)", color: "var(--accent-amber)" }}
                >
                  تم التواصل
                </Button>
              )}
              {lead.status === "contacted" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={(e) => { e.stopPropagation(); onUpdate("qualified"); }}
                  className="text-[11px] h-7 cursor-pointer transition-all"
                  style={{ borderColor: "rgba(23,178,106,0.35)", color: "var(--accent-green)" }}
                >
                  مؤهّل
                </Button>
              )}
              {lead.status !== "closed" && (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isUpdating}
                  onClick={(e) => { e.stopPropagation(); onUpdate("closed"); }}
                  className="text-[11px] h-7 cursor-pointer"
                  style={{ color: "var(--text-faint)" }}
                >
                  إغلاق
                </Button>
              )}
              {lead.status === "closed" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={(e) => { e.stopPropagation(); onUpdate("new"); }}
                  className="text-[11px] h-7 cursor-pointer"
                  style={{ borderColor: "rgba(78,168,222,0.35)", color: "var(--accent-blue)" }}
                >
                  إعادة فتح
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DetailPanel({ lead, onClose, onUpdate, isUpdating }: {
  lead: Lead; onClose: () => void; onUpdate: (status: string) => void; isUpdating: boolean;
}) {
  const risk = riskConfig[lead.riskLevel] ?? riskConfig.low;
  const urgency = urgencyConfig[lead.urgencyLevel] ?? urgencyConfig.low;
  const status = statusConfig[lead.status] ?? statusConfig.new;
  const currentStep = status.step;

  return (
    <motion.div
      key="detail"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col h-full overflow-y-auto"
      style={{ borderRight: "1px solid var(--border-subtle)" }}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between p-5 sticky top-0 z-10" style={{ background: "var(--bg-primary)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4" style={{ color: "var(--accent-gold)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>تفاصيل الطلب</span>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 transition-colors cursor-pointer hover:bg-white/5">
          <X className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Status pipeline */}
        <div>
          <p className="text-[10px] font-mono-ar tracking-widest uppercase mb-3" style={{ color: "var(--text-faint)" }}>مرحلة الطلب</p>
          <div className="flex items-center gap-0">
            {PIPELINE_STEPS.map(({ key, label }, i) => {
              const cfg = statusConfig[key];
              const done = cfg.step <= currentStep;
              const active = cfg.step === currentStep;
              return (
                <div key={key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300"
                      style={{
                        background: done ? cfg.color : "var(--bg-card)",
                        color: done ? "#000" : "var(--text-faint)",
                        border: `2px solid ${done ? cfg.color : "var(--border-default)"}`,
                        boxShadow: active ? `0 0 12px ${cfg.color}66` : undefined,
                      }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-[9px] whitespace-nowrap" style={{ color: done ? cfg.color : "var(--text-faint)" }}>{label}</span>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div
                      className="flex-1 h-0.5 mb-4 mx-1 transition-all duration-500"
                      style={{ background: cfg.step < currentStep ? cfg.color : "var(--border-subtle)" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-md font-semibold" style={{ background: risk.bg, color: risk.color, border: `1px solid ${risk.border}` }}>
            خطر {risk.label}
          </span>
          <span className="text-[11px] px-2.5 py-1 rounded-md font-semibold" style={{ background: urgency.accent, color: urgency.barColor }}>
            {urgency.label}
          </span>
          <span className="text-[11px] px-2.5 py-1 rounded-md" style={{ background: "var(--bg-card)", color: "var(--text-muted)" }}>
            {lead.caseType}
          </span>
        </div>

        {/* Summary */}
        <div className="rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
          <p className="text-[10px] font-mono-ar tracking-widest uppercase mb-2" style={{ color: "var(--text-faint)" }}>ملخص القضية</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{lead.issueSummary}</p>
        </div>

        {/* Contact info */}
        <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
          <p className="text-[10px] font-mono-ar tracking-widest uppercase" style={{ color: "var(--text-faint)" }}>بيانات التواصل</p>
          {lead.contactName && (
            <div className="flex items-center gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              <User className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--text-faint)" }} />
              {lead.contactName}
            </div>
          )}
          {lead.contactPhone && (
            <div className="flex items-center gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--text-faint)" }} />
              <span dir="ltr">{lead.contactPhone}</span>
            </div>
          )}
          {lead.contactEmail && (
            <div className="flex items-center gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--text-faint)" }} />
              <span dir="ltr" className="text-xs">{lead.contactEmail}</span>
            </div>
          )}
          <div className="flex items-center gap-2.5 text-xs" style={{ color: "var(--text-faint)" }}>
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            {new Date(lead.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          {lead.status === "new" && (
            <Button
              disabled={isUpdating}
              onClick={() => onUpdate("contacted")}
              className="w-full text-sm cursor-pointer"
              style={{ background: "rgba(245,158,11,0.15)", color: "var(--accent-amber)", border: "1px solid rgba(245,158,11,0.3)" }}
            >
              تم التواصل مع العميل
            </Button>
          )}
          {lead.status === "contacted" && (
            <Button
              disabled={isUpdating}
              onClick={() => onUpdate("qualified")}
              className="w-full text-sm cursor-pointer"
              style={{ background: "rgba(23,178,106,0.15)", color: "var(--accent-green)", border: "1px solid rgba(23,178,106,0.3)" }}
            >
              تأهيل الطلب
            </Button>
          )}
          {lead.status !== "closed" && (
            <Button
              variant="ghost"
              disabled={isUpdating}
              onClick={() => onUpdate("closed")}
              className="w-full text-sm cursor-pointer"
              style={{ color: "var(--text-muted)" }}
            >
              إغلاق الطلب
            </Button>
          )}
          {lead.status === "closed" && (
            <Button
              disabled={isUpdating}
              onClick={() => onUpdate("new")}
              className="w-full text-sm cursor-pointer"
              style={{ background: "rgba(78,168,222,0.15)", color: "var(--accent-blue)", border: "1px solid rgba(78,168,222,0.3)" }}
            >
              إعادة فتح الطلب
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Admin Login ──────────────────────────────────────────────────────────────

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const loginMut = trpc.admin.login.useMutation({
    onSuccess(data) {
      sessionStorage.setItem("masoul_admin_token", data.token);
      onSuccess();
    },
    onError(err) {
      setError(err.message);
      setPassword("");
    },
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-primary)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <GlowCard glowColor="#C9A84C" intensity={0.25}>
          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)", boxShadow: "0 8px 28px rgba(201,168,76,0.4)" }}
              >
                <Lock className="w-7 h-7" style={{ color: "#0A0A0A" }} />
              </div>
              <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>لوحة التحكم</h1>
              <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>مساول · دخول المشرف</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setError("");
                loginMut.mutate({ password });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[11px] font-semibold mb-2 tracking-widest uppercase" style={{ color: "var(--text-faint)" }}>
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="••••••••"
                    dir="ltr"
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "var(--bg-input)",
                      border: `1px solid ${error ? "rgba(240,68,56,0.5)" : "var(--border-default)"}`,
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)"; }}
                    onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = "var(--border-default)"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ color: "var(--text-faint)" }}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs mt-2"
                      style={{ color: "#F04438" }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <Button
                type="submit"
                disabled={!password || loginMut.isPending}
                className="w-full py-3 text-sm font-semibold rounded-xl cursor-pointer"
                style={{
                  background: password && !loginMut.isPending ? "linear-gradient(135deg, #C9A84C, #A8893A)" : "rgba(201,168,76,0.15)",
                  color: password && !loginMut.isPending ? "#0A0A0A" : "rgba(201,168,76,0.4)",
                  boxShadow: password && !loginMut.isPending ? "0 6px 24px rgba(201,168,76,0.35)" : "none",
                }}
              >
                {loginMut.isPending ? "جاري الدخول..." : "دخول"}
              </Button>
            </form>
          </div>
        </GlowCard>
      </motion.div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function Admin() {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [isAuthed, setIsAuthed] = useState(() => !!sessionStorage.getItem("masoul_admin_token"));

  const verifyQuery = trpc.admin.verify.useQuery(undefined, {
    enabled: isAuthed,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMut = trpc.admin.logout.useMutation({
    onSuccess() {
      sessionStorage.removeItem("masoul_admin_token");
      setIsAuthed(false);
    },
  });

  const { data: leads = [], isLoading } = trpc.lead.list.useQuery(undefined, {
    enabled: isAuthed && verifyQuery.data?.valid === true,
  });
  useTheme();

  if (!isAuthed || verifyQuery.data?.valid === false) {
    return <AdminLogin onSuccess={() => setIsAuthed(true)} />;
  }

  if (verifyQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="flex items-center gap-2 text-sm"
          style={{ color: "var(--accent-gold)" }}
        >
          <Scale className="w-4 h-4" />
          <span>جاري التحقق...</span>
        </motion.div>
      </div>
    );
  }

  const utils = trpc.useUtils();
  const updateLead = trpc.lead.update.useMutation({
    onSuccess: () => {
      utils.lead.list.invalidate();
    },
  });

  const selectedLead = useMemo(
    () => leads.find((l) => l.id === selectedId) ?? null,
    [leads, selectedId]
  );

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchFilter = filter === "all" || l.status === filter;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        l.issueSummary?.toLowerCase().includes(q) ||
        l.contactName?.toLowerCase().includes(q) ||
        l.caseType?.toLowerCase().includes(q) ||
        l.contactPhone?.includes(q);
      return matchFilter && matchSearch;
    });
  }, [leads, filter, search]);

  const stats = useMemo(() => ({
    total:     leads.length,
    newLeads:  leads.filter((l) => l.status === "new").length,
    highRisk:  leads.filter((l) => l.riskLevel === "high" || l.riskLevel === "critical").length,
    urgent:    leads.filter((l) => l.urgencyLevel === "urgent" || l.urgencyLevel === "high").length,
  }), [leads]);

  function handleUpdate(id: string, status: string) {
    updateLead.mutate({ id, status });
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="flex items-center gap-2 text-sm"
          style={{ color: "var(--accent-gold)" }}
        >
          <Scale className="w-4 h-4" />
          <span>جاري التحميل...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ── Page header ── */}
      <section className="relative pt-24 pb-6">
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, var(--border-hover), transparent)" }}
        />
        {/* Subtle gold radial behind title */}
        <div
          className="absolute top-0 right-0 w-96 h-64 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 80% 20%, var(--glow-gold) 0%, transparent 65%)" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <span
                  className="text-[10px] tracking-[0.2em] uppercase mb-2 block font-mono-ar"
                  style={{ color: "var(--accent-gold)" }}
                >
                  مساول · لوحة التحكم
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold hero-headline" style={{ color: "var(--text-primary)" }}>
                  إدارة <span className="text-gradient">الطلبات</span>
                </h1>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <Link
                  to="/"
                  className="flex items-center gap-1.5 text-xs transition-colors"
                  style={{ color: "var(--text-faint)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-faint)")}
                >
                  <ArrowLeft className="w-3 h-3" />
                  الرئيسية
                </Link>
                <button
                  onClick={() => logoutMut.mutate()}
                  disabled={logoutMut.isPending}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  style={{ border: "1px solid rgba(240,68,56,0.2)", color: "rgba(240,68,56,0.7)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(240,68,56,0.08)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(240,68,56,0.4)";
                    (e.currentTarget as HTMLElement).style.color = "#F04438";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(240,68,56,0.2)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(240,68,56,0.7)";
                  }}
                >
                  <LogOut className="w-3 h-3" />
                  خروج
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <StatCard icon={<FileText className="w-4 h-4" />}    label="إجمالي الطلبات" value={stats.total}    accent="var(--accent-gold)"  delay={0}    />
              <StatCard icon={<Clock className="w-4 h-4" />}        label="طلبات جديدة"   value={stats.newLeads} accent="var(--accent-blue)"  delay={0.06} />
              <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="مخاطر عالية"  value={stats.highRisk} accent="var(--accent-amber)" delay={0.12} />
              <StatCard icon={<TrendingUp className="w-4 h-4" />}   label="عاجلة"          value={stats.urgent}   accent="var(--accent-red)"   delay={0.18} />
            </div>

            {/* Pipeline bar */}
            {leads.length > 0 && <PipelineBar leads={leads} />}

            {/* Toolbar: search + filter + view toggle */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search
                  className="absolute top-1/2 -translate-y-1/2 right-3 w-3.5 h-3.5 pointer-events-none"
                  style={{ color: "var(--text-faint)" }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث بالاسم أو القضية..."
                  className="w-full text-xs py-2 pr-9 pl-3 rounded-lg outline-none placeholder:text-[color:var(--text-faint)] transition-colors"
                  style={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-gold)")}
                  onBlur={(e) =>  (e.currentTarget.style.borderColor = "var(--border-default)")}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute top-1/2 -translate-y-1/2 left-2.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" style={{ color: "var(--text-faint)" }} />
                  </button>
                )}
              </div>

              {/* Status filter tabs */}
              <div className="flex gap-1 flex-wrap">
                {[
                  { key: "all",       label: "الكل",        count: leads.length },
                  { key: "new",       label: "جديد",        count: stats.newLeads },
                  { key: "contacted", label: "تم التواصل",  count: leads.filter((l) => l.status === "contacted").length },
                  { key: "qualified", label: "مؤهل",        count: leads.filter((l) => l.status === "qualified").length },
                  { key: "closed",    label: "مغلق",        count: leads.filter((l) => l.status === "closed").length },
                ].map((f) => {
                  const active = filter === f.key;
                  const cfg = f.key !== "all" ? statusConfig[f.key] : null;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 cursor-pointer"
                      style={{
                        background: active ? (cfg ? cfg.bg : "rgba(139,105,20,0.15)") : "var(--bg-card)",
                        color: active ? (cfg ? cfg.color : "var(--accent-gold)") : "var(--text-muted)",
                        border: `1px solid ${active ? (cfg ? cfg.color + "44" : "var(--accent-gold)44") : "var(--border-subtle)"}`,
                      }}
                    >
                      {f.label}
                      <span
                        className="text-[9px] font-bold px-1 rounded-sm"
                        style={{ background: active ? "rgba(0,0,0,0.2)" : "var(--bg-input)", color: "inherit" }}
                      >
                        {f.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* View toggle */}
              <div className="flex gap-1 mr-auto">
                {([["list", LayoutList], ["kanban", Columns3]] as const).map(([mode, Icon]) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className="p-2 rounded-lg transition-all cursor-pointer"
                    style={{
                      background: viewMode === mode ? "var(--bg-card-hover)" : "transparent",
                      color: viewMode === mode ? "var(--accent-gold)" : "var(--text-faint)",
                      border: `1px solid ${viewMode === mode ? "var(--border-hover)" : "transparent"}`,
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Content area ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div
          className="flex gap-5 transition-all duration-300"
          style={{ alignItems: "flex-start" }}
        >

          {/* ── Lead list / kanban ── */}
          <div className="flex-1 min-w-0">
            {viewMode === "list" ? (
              /* LIST VIEW */
              <motion.div layout className="flex flex-col gap-2.5">
                <AnimatePresence mode="popLayout">
                  {filteredLeads.length === 0 ? (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <GlowCard glowColor="var(--accent-gold)" intensity={0.08}>
                        <div className="py-16 text-center flex flex-col items-center gap-3">
                          <Scale className="w-8 h-8" style={{ color: "var(--text-faint)" }} />
                          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            {search ? `لا نتائج لـ "${search}"` : "لا توجد طلبات"}
                          </p>
                        </div>
                      </GlowCard>
                    </motion.div>
                  ) : (
                    filteredLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        isSelected={selectedId === lead.id}
                        onClick={() => setSelectedId(selectedId === lead.id ? null : lead.id)}
                        onUpdate={(status) => handleUpdate(lead.id, status)}
                        isUpdating={updateLead.isPending}
                      />
                    ))
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* KANBAN VIEW */
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {PIPELINE_STEPS.map(({ key, label }) => {
                  const cfg = statusConfig[key];
                  const col = filteredLeads.filter((l) => l.status === key);
                  return (
                    <div key={key} className="flex flex-col gap-2">
                      {/* Column header */}
                      <div
                        className="flex items-center justify-between px-3 py-2 rounded-lg sticky top-2 z-10"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.color}33` }}
                      >
                        <span className="text-[11px] font-semibold" style={{ color: cfg.color }}>{label}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm" style={{ background: "rgba(0,0,0,0.25)", color: cfg.color }}>{col.length}</span>
                      </div>
                      {/* Cards */}
                      <AnimatePresence>
                        {col.map((lead) => (
                          <motion.div
                            key={lead.id}
                            layout
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            onClick={() => setSelectedId(selectedId === lead.id ? null : lead.id)}
                            className="cursor-pointer"
                          >
                            <div
                              className="rounded-xl p-3 transition-all"
                              style={{
                                background: "var(--bg-card)",
                                border: `1px solid ${selectedId === lead.id ? cfg.color + "44" : "var(--border-subtle)"}`,
                              }}
                            >
                              <p className="text-[11px] leading-relaxed line-clamp-3 mb-2" style={{ color: "var(--text-secondary)" }}>
                                {lead.issueSummary}
                              </p>
                              <div className="flex items-center justify-between">
                                <span
                                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded-sm"
                                  style={{ background: riskConfig[lead.riskLevel]?.bg, color: riskConfig[lead.riskLevel]?.color }}
                                >
                                  {riskConfig[lead.riskLevel]?.label}
                                </span>
                                <span className="text-[9px]" style={{ color: "var(--text-faint)" }}>
                                  {new Date(lead.createdAt).toLocaleDateString("ar-SA")}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {col.length === 0 && (
                        <div
                          className="rounded-xl py-6 text-center text-[11px]"
                          style={{ background: "var(--bg-card)", color: "var(--text-faint)", border: "1px dashed var(--border-subtle)" }}
                        >
                          لا طلبات
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Detail panel ── */}
          <AnimatePresence>
            {selectedLead && (
              <motion.div
                key="panel"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 320 }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex-shrink-0 rounded-2xl overflow-hidden"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  minHeight: 400,
                  position: "sticky",
                  top: "1rem",
                  maxHeight: "calc(100vh - 2rem)",
                }}
              >
                <DetailPanel
                  lead={selectedLead}
                  onClose={() => setSelectedId(null)}
                  onUpdate={(status) => handleUpdate(selectedLead.id, status)}
                  isUpdating={updateLead.isPending}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
