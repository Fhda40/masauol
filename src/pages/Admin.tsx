import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  Clock, AlertTriangle, Mail, Phone, User,
  ArrowLeft, FileText, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import GlowCard from "@/components/GlowCard";
import { useTheme } from "@/contexts/ThemeContext";

const riskColors: Record<string, string> = {
  low: "bg-[#17B26A]/15 text-[#17B26A]",
  medium: "bg-[#4EA8DE]/15 text-[#4EA8DE]",
  high: "bg-[#F59E0B]/15 text-[#F59E0B]",
  critical: "bg-[#F04438]/15 text-[#F04438]",
};

const riskLabels: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  critical: "حرجة",
};

const urgencyColors: Record<string, string> = {
  low: "bg-white/5 text-white/40",
  medium: "bg-[#4EA8DE]/15 text-[#4EA8DE]",
  high: "bg-[#F59E0B]/15 text-[#F59E0B]",
  urgent: "bg-[#F04438]/15 text-[#F04438]",
};

const urgencyLabels: Record<string, string> = {
  low: "عادي",
  medium: "متوسطة",
  high: "عاجلة",
  urgent: "حرجة",
};

const statusColors: Record<string, string> = {
  new: "bg-[#4EA8DE]/15 text-[#4EA8DE]",
  contacted: "bg-[#F59E0B]/15 text-[#F59E0B]",
  qualified: "bg-[#17B26A]/15 text-[#17B26A]",
  closed: "bg-white/5 text-white/30",
};

const statusLabels: Record<string, string> = {
  new: "جديد",
  contacted: "تم التواصل",
  qualified: "مؤهل",
  closed: "مغلق",
};

export default function Admin() {
  const [filter, setFilter] = useState<string>("all");
  const { data: leads, isLoading } = trpc.lead.list.useQuery();
  useTheme(); // triggers re-render on theme change

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
        <div className="text-sm" style={{ color: "var(--text-faint)" }}>جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <section className="relative pt-24 pb-8">
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, var(--border-hover), transparent)" }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
            <div>
              <span className="text-xs tracking-widest uppercase mb-2 block" style={{ color: "var(--accent-gold)", fontFamily: "'IBM Plex Mono', monospace" }}>
                لوحة التحكم
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold hero-headline" style={{ color: "var(--text-primary)" }}>
                إدارة <span className="text-gradient">الطلبات</span>
              </h1>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 text-xs transition-colors"
              style={{ color: "var(--text-faint)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-faint)")}
            >
              <ArrowLeft className="w-3 h-3" />
              العودة للموقع
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <FileText className="w-4 h-4" />, label: "إجمالي الطلبات", value: totalLeads, color: "var(--text-primary)" },
            { icon: <Clock className="w-4 h-4" />, label: "طلبات جديدة", value: newLeads, color: "var(--accent-blue)" },
            { icon: <AlertTriangle className="w-4 h-4" />, label: "مخاطر عالية", value: highRiskLeads, color: "var(--accent-amber)" },
            { icon: <TrendingUp className="w-4 h-4" />, label: "عاجلة", value: urgentLeads, color: "var(--accent-red)" },
          ].map((stat) => (
            <GlowCard key={stat.label} glowColor="var(--accent-gold)" intensity={0.15}>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: "var(--text-faint)" }}>{stat.icon}</span>
                  <span className="text-[10px] font-mono-ar" style={{ color: "var(--text-faint)" }}>{stat.label}</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: stat.color, fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
                  {stat.value}
                </div>
              </div>
            </GlowCard>
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
              className="px-3 py-1.5 text-xs font-medium rounded-sm transition-colors"
              style={{
                backgroundColor: filter === f.key ? "var(--accent-gold)/20" : "var(--bg-card)",
                color: filter === f.key ? "var(--accent-gold)" : "var(--text-muted)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Leads List */}
        <div className="space-y-3">
          {filteredLeads?.length === 0 && (
            <GlowCard glowColor="var(--accent-gold)" intensity={0.1}>
              <div className="p-12 text-center">
                <FileText className="w-8 h-8 mx-auto mb-4" style={{ color: "var(--text-faint)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>لا توجد طلبات</p>
              </div>
            </GlowCard>
          )}

          {filteredLeads?.map((lead, i) => (
            <GlowCard key={lead.id} glowColor="var(--accent-gold)" intensity={0.1} delay={i * 0.03}>
              <div className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-[10px] font-mono-ar px-2 py-0.5 rounded-sm ${statusColors[lead.status]}`}>
                        {statusLabels[lead.status]}
                      </span>
                      <span className={`text-[10px] font-mono-ar px-2 py-0.5 rounded-sm ${riskColors[lead.riskLevel]}`}>
                        {riskLabels[lead.riskLevel]}
                      </span>
                      <span className={`text-[10px] font-mono-ar px-2 py-0.5 rounded-sm ${urgencyColors[lead.urgencyLevel]}`}>
                        {urgencyLabels[lead.urgencyLevel]}
                      </span>
                      <span className="text-[10px] font-mono-ar" style={{ color: "var(--text-faint)" }}>{lead.caseType}</span>
                    </div>

                    <p className="text-sm leading-relaxed mb-3 line-clamp-2" style={{ color: "var(--text-secondary)" }}>{lead.issueSummary}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: "var(--text-faint)" }}>
                      {lead.contactName && (
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{lead.contactName}</span>
                      )}
                      {lead.contactPhone && (
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.contactPhone}</span>
                      )}
                      {lead.contactEmail && (
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.contactEmail}</span>
                      )}
                      <span className="font-mono-ar">{new Date(lead.createdAt).toLocaleDateString("ar-SA")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {lead.status === "new" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateLead.mutate({ id: lead.id, status: "contacted" })}
                        className="text-xs h-8"
                        style={{ borderColor: "var(--accent-amber)/30", color: "var(--accent-amber)" }}
                      >
                        تم التواصل
                      </Button>
                    )}
                    {lead.status === "contacted" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateLead.mutate({ id: lead.id, status: "qualified" })}
                        className="text-xs h-8"
                        style={{ borderColor: "var(--accent-green)/30", color: "var(--accent-green)" }}
                      >
                        مؤهل
                      </Button>
                    )}
                    {(lead.status === "new" || lead.status === "contacted" || lead.status === "qualified") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateLead.mutate({ id: lead.id, status: "closed" })}
                        className="text-xs h-8"
                        style={{ borderColor: "var(--border-default)", color: "var(--text-muted)" }}
                      >
                        إغلاق
                      </Button>
                    )}
                    {lead.status === "closed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateLead.mutate({ id: lead.id, status: "new" })}
                        className="text-xs h-8"
                        style={{ borderColor: "var(--accent-blue)/30", color: "var(--accent-blue)" }}
                      >
                        إعادة فتح
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      </div>
    </div>
  );
}
