import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  Clock, AlertTriangle, Mail, Phone, User,
  ArrowLeft, FileText, TrendingUp, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

const riskLabels: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  critical: "حرجة",
};

const urgencyLabels: Record<string, string> = {
  low: "عادي",
  medium: "متوسطة",
  high: "عاجلة",
  urgent: "حرجة",
};

const statusLabels: Record<string, string> = {
  new: "جديد",
  contacted: "تم التواصل",
  qualified: "مؤهل",
  closed: "مغلق",
};

export default function Admin() {
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem("masoul_admin_token"));
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: (data) => {
      sessionStorage.setItem("masoul_admin_token", data.token);
      setAuthed(true);
    },
    onError: () => {
      setPwError(true);
      setPw("");
    },
  });
  const { data: leads, isLoading } = trpc.lead.list.useQuery(undefined, { enabled: authed });

  if (!authed) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="card-apple p-8 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "#171717" }}>
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>لوحة التحكم</h2>
            <p className="text-xs mb-6" style={{ color: "var(--text-tertiary)" }}>أدخل كلمة المرور للمتابعة</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loginMutation.mutate({ password: pw });
              }}
              className="space-y-4"
            >
              <input
                type="password"
                value={pw}
                onChange={(e) => { setPw(e.target.value); setPwError(false); }}
                placeholder="كلمة المرور"
                className="input-apple text-center"
                dir="ltr"
              />
              {pwError && (
                <p className="text-xs" style={{ color: "#ef4444" }}>كلمة المرور غير صحيحة</p>
              )}
              <button type="submit" className="btn-apple w-full justify-center">
                دخول
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  const utils = trpc.useUtils();
  const updateLead = trpc.lead.update.useMutation({
    onSuccess: () => utils.lead.list.invalidate(),
  });

  const filteredLeads = leads?.filter((lead) => {
    if (filter === "all") return true;
    return lead.status === filter;
  });

  const totalLeads = leads?.length ?? 0;
  const newLeads = leads?.filter((l) => l.status === "new").length ?? 0;
  const highRiskLeads = leads?.filter((l) => l.riskLevel === "high" || l.riskLevel === "critical").length ?? 0;
  const urgentLeads = leads?.filter((l) => l.urgencyLevel === "urgent" || l.urgencyLevel === "high").length ?? 0;

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-sm" style={{ color: "var(--text-tertiary)" }}>جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <section className="section-apple">
        <div className="container-apple">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
            <div>
              <span className="badge-apple mb-2 inline-flex">
                <FileText className="w-3.5 h-3.5" />
                لوحة التحكم
              </span>
              <h1 className="headline-section">إدارة الطلبات</h1>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 text-xs transition-colors"
              style={{ color: "var(--text-tertiary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
            >
              <ArrowLeft className="w-3 h-3" />
              العودة للموقع
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="container-apple">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <FileText className="w-4 h-4" />, label: "إجمالي الطلبات", value: totalLeads, color: "var(--text-primary)" },
            { icon: <Clock className="w-4 h-4" />, label: "طلبات جديدة", value: newLeads, color: "#3b82f6" },
            { icon: <AlertTriangle className="w-4 h-4" />, label: "مخاطر عالية", value: highRiskLeads, color: "#f59e0b" },
            { icon: <TrendingUp className="w-4 h-4" />, label: "عاجلة", value: urgentLeads, color: "#ef4444" },
          ].map((stat) => (
            <div key={stat.label} className="card-apple">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: "var(--text-tertiary)" }}>{stat.icon}</span>
                  <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{stat.label}</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "all", label: "الكل" },
            { key: "new", label: "جديد" },
            { key: "contacted", label: "تم التواصل" },
            { key: "qualified", label: "مؤهل" },
            { key: "closed", label: "مغلق" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
              style={{
                backgroundColor: filter === f.key ? "#171717" : "var(--bg-secondary)",
                color: filter === f.key ? "#ffffff" : "var(--text-secondary)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Leads List */}
        <div className="space-y-3">
          {filteredLeads?.length === 0 && (
            <div className="card-apple">
              <div className="p-12 text-center">
                <FileText className="w-8 h-8 mx-auto mb-4" style={{ color: "var(--text-tertiary)" }} />
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>لا توجد طلبات</p>
              </div>
            </div>
          )}

          {filteredLeads?.map((lead, i) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.4 }}
              className="card-apple"
            >
              <div className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: lead.status === "new" ? "rgba(59,130,246,0.1)" : lead.status === "contacted" ? "rgba(245,158,11,0.1)" : lead.status === "qualified" ? "rgba(34,197,94,0.1)" : "rgba(0,0,0,0.04)",
                          color: lead.status === "new" ? "#3b82f6" : lead.status === "contacted" ? "#f59e0b" : lead.status === "qualified" ? "#22c55e" : "#a3a3a3",
                        }}
                      >
                        {statusLabels[lead.status]}
                      </span>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: lead.riskLevel === "high" || lead.riskLevel === "critical" ? "rgba(239,68,68,0.1)" : "rgba(59,130,246,0.1)",
                          color: lead.riskLevel === "high" || lead.riskLevel === "critical" ? "#ef4444" : "#3b82f6",
                        }}
                      >
                        {riskLabels[lead.riskLevel]}
                      </span>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: lead.urgencyLevel === "urgent" || lead.urgencyLevel === "high" ? "rgba(239,68,68,0.1)" : "rgba(0,0,0,0.04)",
                          color: lead.urgencyLevel === "urgent" || lead.urgencyLevel === "high" ? "#ef4444" : "#a3a3a3",
                        }}
                      >
                        {urgencyLabels[lead.urgencyLevel]}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{lead.caseType}</span>
                    </div>

                    <p className="text-sm leading-relaxed mb-3 line-clamp-2" style={{ color: "var(--text-secondary)" }}>{lead.issueSummary}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {lead.contactName && (
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{lead.contactName}</span>
                      )}
                      {lead.contactPhone && (
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.contactPhone}</span>
                      )}
                      {lead.contactEmail && (
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.contactEmail}</span>
                      )}
                      <span>{new Date(lead.createdAt).toLocaleDateString("ar-SA")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {lead.status === "new" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateLead.mutate({ id: lead.id, status: "contacted" })}
                        className="text-xs h-8 rounded-full"
                      >
                        تم التواصل
                      </Button>
                    )}
                    {lead.status === "contacted" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateLead.mutate({ id: lead.id, status: "qualified" })}
                        className="text-xs h-8 rounded-full"
                      >
                        مؤهل
                      </Button>
                    )}
                    {(lead.status === "new" || lead.status === "contacted" || lead.status === "qualified") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateLead.mutate({ id: lead.id, status: "closed" })}
                        className="text-xs h-8 rounded-full"
                      >
                        إغلاق
                      </Button>
                    )}
                    {lead.status === "closed" && (
                      <Button
                        size="sm"
                        variant="outline"
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
      </div>
    </div>
  );
}
