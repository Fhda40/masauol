import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Phone, Mail, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";

interface LeadFormProps {
  conversationId: number;
  analysis: Record<string, string>;
  classification?: {
    caseType: string;
    riskLevel: string;
    urgencyLevel: string;
  } | null;
  onSubmitted: () => void;
}

const caseTypeLabels: Record<string, string> = {
  enforcement: "تنفيذ / ديون",
  cybercrime: "جرائم إلكترونية",
  drugs: "مخدرات",
  labor: "عمالي",
  civil: "مدني",
  criminal: "جنائي",
  commercial: "تجاري",
  family: "أحوال شخصية",
  other: "آخر",
};

const riskLabels: Record<string, { text: string; color: string }> = {
  low: { text: "منخفضة", color: "bg-[#17B26A]/20 text-[#17B26A]" },
  medium: { text: "متوسطة", color: "bg-[#4EA8DE]/20 text-[#4EA8DE]" },
  high: { text: "عالية", color: "bg-[#F59E0B]/20 text-[#F59E0B]" },
  critical: { text: "حرجة", color: "bg-[#F04438]/20 text-[#F04438]" },
};

const urgencyLabels: Record<string, { text: string; color: string }> = {
  low: { text: "عادي", color: "bg-white/5 text-white/50" },
  medium: { text: "متوسطة", color: "bg-[#4EA8DE]/20 text-[#4EA8DE]" },
  high: { text: "عاجلة", color: "bg-[#F59E0B]/20 text-[#F59E0B]" },
  urgent: { text: "حرجة", color: "bg-[#F04438]/20 text-[#F04438]" },
};

export default function LeadForm({ conversationId, analysis, classification, onSubmitted }: LeadFormProps) {
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const createLead = trpc.lead.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      onSubmitted();
    },
  });

  // Extract from classification or analysis
  const caseType = classification?.caseType ?? "other";
  const riskLevel = classification?.riskLevel ?? "medium";
  const urgencyLevel = classification?.urgencyLevel ?? "medium";
  const issueSummary = analysis["فهم الحالة"] || analysis["التوصية"] || analysis["التوجيه الاحترافي"] || "تحليل قضية";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName && !contactPhone && !contactEmail) return;

    createLead.mutate({
      conversationId,
      caseType: caseTypeLabels[caseType] ?? caseType,
      issueSummary,
      riskLevel: riskLevel as "low" | "medium" | "high" | "critical",
      urgencyLevel: urgencyLevel as "low" | "medium" | "high" | "urgent",
      contactName: contactName || undefined,
      contactPhone: contactPhone || undefined,
      contactEmail: contactEmail || undefined,
    });
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel rounded-sm p-6 my-4 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-[#17B26A]/20 flex items-center justify-center mx-auto mb-4">
          <Send className="w-6 h-6 text-[#17B26A]" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">تم استلام طلبك بنجاح</h3>
        <p className="text-sm text-white/60">
          سيقوم فريق شركة مسؤول للمحاماة بمراجعة قضيتك والتواصل معك قريباً
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-sm p-4 my-4 border-t-2 border-t-[#17B26A]"
    >
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-5 h-5 text-[#17B26A]" />
        <h3 className="text-base font-semibold text-white">طلب مراجعة خبراء مسؤول</h3>
      </div>

      <p className="text-sm text-white/60 mb-4">
        هذه القضية تستحق مراجعة متخصصة من فريقنا. املأ بيانات التواصل وسنراجع قضيتك بشكل مفصل.
      </p>

      {/* Classification summary */}
      <div className="mb-4 p-3 bg-white/5 rounded-sm">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center justify-between w-full text-right"
        >
          <div className="flex flex-wrap gap-2 text-xs font-mono-ar">
            <span className={`px-2 py-1 rounded-sm ${riskLabels[riskLevel]?.color}`}>
              المخاطر: {riskLabels[riskLevel]?.text}
            </span>
            <span className={`px-2 py-1 rounded-sm ${urgencyLabels[urgencyLevel]?.color}`}>
              العجلة: {urgencyLabels[urgencyLevel]?.text}
            </span>
            <span className="px-2 py-1 bg-white/5 text-white/40 rounded-sm">
              النوع: {caseTypeLabels[caseType]}
            </span>
          </div>
          <span className="text-white/30 mr-2">
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-white/10"
            >
              <p className="text-xs text-white/40 leading-relaxed">{issueSummary}</p>
              {analysis["الاستراتيجية الموصى بها"] && (
                <p className="text-xs text-white/30 mt-2 line-clamp-2">
                  الاستراتيجية: {analysis["الاستراتيجية الموصى بها"]}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="الاسم الكريم"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="bg-white/5 border-white/10 text-white pr-10 text-right placeholder:text-white/30"
          />
        </div>

        <div className="relative">
          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="رقم الجوال"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="bg-white/5 border-white/10 text-white pr-10 text-right placeholder:text-white/30"
            dir="ltr"
          />
        </div>

        <div className="relative">
          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="البريد الإلكتروني"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="bg-white/5 border-white/10 text-white pr-10 text-right placeholder:text-white/30"
            dir="ltr"
          />
        </div>

        <Button
          type="submit"
          disabled={createLead.isPending || (!contactName && !contactPhone && !contactEmail)}
          className="w-full bg-gradient-to-r from-[#17B26A] to-[#4EA8DE] hover:opacity-90 text-white font-medium rounded-sm"
        >
          {createLead.isPending ? "جاري الإرسال..." : "إرسال طلب المراجعة"}
        </Button>
      </form>
    </motion.div>
  );
}
