import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Shield,
  AlertTriangle,
  Target,
  Zap,
  BookOpen,
  Gavel,
  Lightbulb,
  ListTodo,
  Compass,
  FileSearch,
  Sparkles,
  Briefcase,
  Database,
} from "lucide-react";
import { useState } from "react";

interface CaseAnalysisProps {
  analysis: Record<string, string>;
  classification?: {
    caseType: string;
    caseSubtype?: string;
    riskLevel: string;
    urgencyLevel: string;
  } | null;
}

const sectionConfig: Record<string, { icon: React.ReactNode; color: string; priority: number }> = {
  "فهم الحالة": { icon: <FileSearch className="w-4 h-4" />, color: "border-r-[#4EA8DE]", priority: 1 },
  "التكييف القانوني": { icon: <Gavel className="w-4 h-4" />, color: "border-r-[#4EA8DE]", priority: 2 },
  "العناصر_النظامية": { icon: <BookOpen className="w-4 h-4" />, color: "border-r-[#17B26A]", priority: 3 },
  "نقاط_القوة": { icon: <Shield className="w-4 h-4" />, color: "border-r-[#17B26A]", priority: 4 },
  "نقاط_الضعف": { icon: <AlertTriangle className="w-4 h-4" />, color: "border-r-[#F04438]", priority: 5 },
  "المخاطر_القانونية": { icon: <AlertTriangle className="w-4 h-4" />, color: "border-r-[#F04438]", priority: 6 },
  "السيناريوهات_المحتملة": { icon: <Compass className="w-4 h-4" />, color: "border-r-[#4EA8DE]", priority: 7 },
  "الاستراتيجية_الموصى_بها": { icon: <Target className="w-4 h-4" />, color: "border-r-[#17B26A]", priority: 8 },
  "الإثباتات_المطلوبة": { icon: <Briefcase className="w-4 h-4" />, color: "border-r-[#4EA8DE]", priority: 9 },
  "خطة_العمل": { icon: <ListTodo className="w-4 h-4" />, color: "border-r-[#17B26A]", priority: 10 },
  "رؤى_استراتيجية": { icon: <Sparkles className="w-4 h-4" />, color: "border-r-[#F59E0B]", priority: 0 },
  "التوجيه_الاحترافي": { icon: <Lightbulb className="w-4 h-4" />, color: "border-r-[#4EA8DE]", priority: 12 },
};

const caseTypeLabels: Record<string, string> = {
  enforcement: "تنفيذ / ديون",
  cybercrime: "جرائم إلكترونية",
  drugs: "مخدرات",
  labor: "عمالي",
  civil: "مدني",
  criminal: "جنائي",
  commercial: "تجاري",
  family: "أحوال شخصية",
  general: "استشارة عامة",
};

const riskLabels: Record<string, { text: string; color: string }> = {
  low: { text: "منخفض", color: "bg-[#17B26A]/20 text-[#17B26A]" },
  medium: { text: "متوسط", color: "bg-[#4EA8DE]/20 text-[#4EA8DE]" },
  high: { text: "عالي", color: "bg-[#F59E0B]/20 text-[#F59E0B]" },
  critical: { text: "حرج", color: "bg-[#F04438]/20 text-[#F04438]" },
};

const urgencyLabels: Record<string, { text: string; color: string }> = {
  low: { text: "عادي", color: "bg-white/5 text-white/50" },
  medium: { text: "متوسط", color: "bg-[#4EA8DE]/20 text-[#4EA8DE]" },
  high: { text: "عاجل", color: "bg-[#F59E0B]/20 text-[#F59E0B]" },
  urgent: { text: "حرج", color: "bg-[#F04438]/20 text-[#F04438]" },
};

export default function CaseAnalysis({ analysis, classification }: CaseAnalysisProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const kbUsed = analysis["_kb_retrieved"] === "true";
  const kbCount = parseInt(analysis["_kb_chunks_count"] || "0");
  const kbLaws = analysis["_kb_laws_cited"];

  // Parse cited laws
  let citedLaws: string[] = [];
  try {
    if (kbLaws) {
      const parsed = JSON.parse(kbLaws);
      if (Array.isArray(parsed)) citedLaws = parsed;
    }
  } catch {
    // If not valid JSON, treat as string
    if (kbLaws) citedLaws = [kbLaws];
  }

  // Sort entries by priority
  const entries = Object.entries(analysis).filter(([key]) => !key.startsWith("_")).sort((a, b) => {
    const priorityA = sectionConfig[a[0]]?.priority ?? 99;
    const priorityB = sectionConfig[b[0]]?.priority ?? 99;
    return priorityA - priorityB;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-panel rounded-sm p-4 my-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#4EA8DE]" />
          <h3 className="text-base font-semibold text-white">تحليل قضائي مُنظّم</h3>
        </div>
        <span className="text-xs font-mono-ar text-white/30">
          {classification && caseTypeLabels[classification.caseType]}
        </span>
      </div>

      {/* KB Usage Badge */}
      {kbUsed && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-gradient-to-r from-[#17B26A]/10 to-transparent border-r-2 border-[#17B26A] rounded-sm"
        >
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-3.5 h-3.5 text-[#17B26A]" />
            <span className="text-xs font-semibold text-[#17B26A] font-mono-ar">
              مبني على {kbCount} مادة قانونية من قاعدة المعرفة
            </span>
          </div>
          {citedLaws.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {citedLaws.slice(0, 6).map((law, i) => (
                <span key={i} className="text-[9px] font-mono-ar px-1.5 py-0.5 bg-[#17B26A]/10 text-[#17B26A]/70 rounded-sm">
                  {law}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {!kbUsed && classification && classification.caseType !== "general" && (
        <div className="mb-4 p-3 bg-[#F59E0B]/5 border-r-2 border-[#F59E0B]/30 rounded-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="text-xs text-[#F59E0B]/70 font-mono-ar">
              لم يتم استرجاع نصوص قانونية مطابقة — الإجابة عامة
            </span>
          </div>
        </div>
      )}

      {/* Classification badges */}
      {classification && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`text-xs font-mono-ar px-2 py-1 rounded-sm ${riskLabels[classification.riskLevel]?.color}`}>
            الخطورة: {riskLabels[classification.riskLevel]?.text}
          </span>
          <span className={`text-xs font-mono-ar px-2 py-1 rounded-sm ${urgencyLabels[classification.urgencyLevel]?.color}`}>
            العجلة: {urgencyLabels[classification.urgencyLevel]?.text}
          </span>
          {classification.caseSubtype && (
            <span className="text-xs font-mono-ar px-2 py-1 rounded-sm bg-white/5 text-white/50">
              {classification.caseSubtype}
            </span>
          )}
        </div>
      )}

      {/* Strategic Insight */}
      {analysis["رؤى_استراتيجية"] && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-gradient-to-r from-[#F59E0B]/10 to-transparent border-r-2 border-[#F59E0B] rounded-sm"
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="text-xs font-semibold text-[#F59E0B] font-mono-ar">رؤية استراتيجية غير واضحة</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">{analysis["رؤى_استراتيجية"]}</p>
        </motion.div>
      )}

      {/* Sections */}
      <div className="space-y-2">
        {entries.map(([key, value], index) => {
          const config = sectionConfig[key];
          if (!config) return null;

          const isExpanded = expandedSections[key] ?? (config.priority === 0 ? true : false);
          const isInsights = key === "رؤى_استراتيجية";

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              className={`border-r-2 ${config.color} pr-3 py-2 ${isInsights ? "bg-[#F59E0B]/5 rounded-sm" : ""}`}
            >
              <button
                onClick={() => toggleSection(key)}
                className="flex items-center gap-2 w-full text-right hover:bg-white/5 transition-colors rounded-sm px-2 py-1"
              >
                <span className="text-white/60">{config.icon}</span>
                <span className={`text-sm font-medium ${isInsights ? "text-[#F59E0B]" : "text-white/90"}`}>
                  {key.replace(/_/g, " ")}
                </span>
                <span className="mr-auto text-white/30">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 mr-8"
                >
                  <p className={`text-sm leading-relaxed ${isInsights ? "text-white/90" : "text-white/70"}`}>
                    {value}
                  </p>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
