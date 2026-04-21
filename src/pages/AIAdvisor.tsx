import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  Send, Plus, Scale, Brain, Sparkles, Shield,
  Zap, Target, AlertTriangle, FileSearch, Gavel, BookOpen,
  Lightbulb, ListTodo, Compass, Database,
  ChevronRight, MessageSquare, Clock, ChevronLeft,
  Activity, Loader2
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import type { Message } from "@db/schema";
import GlowCard from "@/components/GlowCard";
import MagneticButton from "@/components/MagneticButton";

/* ─── Types ─── */
interface ClassificationData {
  caseType: string;
  caseSubtype?: string;
  riskLevel: string;
  urgencyLevel: string;
}

interface ChatResponse {
  content: string;
  analysis: Record<string, string> | null;
  classification: ClassificationData | null;
  leadTriggered: boolean;
  kbUsed: boolean;
  kbChunksCount: number;
}

/* ─── Risk/Urgency Labels ─── */
const riskConfig: Record<string, { text: string; color: string; bar: string }> = {
  low:    { text: "منخفض",  color: "text-[#17B26A]",  bar: "bg-[#17B26A]" },
  medium: { text: "متوسط",  color: "text-[#4EA8DE]",  bar: "bg-[#4EA8DE]" },
  high:   { text: "عالي",   color: "text-[#F59E0B]",  bar: "bg-[#F59E0B]" },
  critical:{ text: "حرج",   color: "text-[#F04438]",  bar: "bg-[#F04438]" },
};

const urgencyConfig: Record<string, { text: string; color: string }> = {
  low:    { text: "عادي",  color: "text-white/40" },
  medium: { text: "متوسط", color: "text-[#4EA8DE]" },
  high:   { text: "عاجل",  color: "text-[#F59E0B]" },
  urgent: { text: "حرج",   color: "text-[#F04438]" },
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

/* ─── Quick Prompts ─── */
const QUICK_PROMPTS = [
  "قضيتي عن ديون مستحقة وإجراءات التنفيذ",
  "تعرضت لابتزاز إلكتروني، ما هي إجراءاتي؟",
  "ما هي حقوقي في حالة النزاع العمالي؟",
  "شرح نظام مكافحة المخدرات",
  "مشكلة فصل تعسفي من العمل",
  "حجز على راتبي من قبل جهة تنفيذ",
];

/* ─── Section Card Config ─── */
const SECTION_CONFIG: Record<string, { icon: React.ReactNode; color: string; glowColor: string; label: string }> = {
  "فهم_الحالة":         { icon: <FileSearch className="w-4 h-4" />,  color: "border-[#4EA8DE]/30", glowColor: "#4EA8DE", label: "فهم الحالة" },
  "التكييف_القانوني":   { icon: <Gavel className="w-4 h-4" />,       color: "border-[#4EA8DE]/30", glowColor: "#4EA8DE", label: "التكييف القانوني" },
  "العناصر_النظامية":   { icon: <BookOpen className="w-4 h-4" />,    color: "border-[#17B26A]/30", glowColor: "#17B26A", label: "العناصر النظامية" },
  "نقاط_القوة":         { icon: <Shield className="w-4 h-4" />,      color: "border-[#17B26A]/30", glowColor: "#17B26A", label: "نقاط القوة" },
  "نقاط_الضعف":         { icon: <AlertTriangle className="w-4 h-4" />, color: "border-[#F59E0B]/30", glowColor: "#F59E0B", label: "نقاط الضعف" },
  "المخاطر_القانونية":  { icon: <Zap className="w-4 h-4" />,        color: "border-[#F04438]/30", glowColor: "#F04438", label: "المخاطر القانونية" },
  "السيناريوهات_المحتملة":{ icon: <Compass className="w-4 h-4" />,   color: "border-[#4EA8DE]/30", glowColor: "#4EA8DE", label: "السيناريوهات" },
  "الاستراتيجية_الموصى_بها":{ icon: <Target className="w-4 h-4" />,   color: "border-[#17B26A]/30", glowColor: "#17B26A", label: "الاستراتيجية" },
  "الإثباتات_المطلوبة": { icon: <BookOpen className="w-4 h-4" />,    color: "border-[#4EA8DE]/30", glowColor: "#4EA8DE", label: "الإثباتات المطلوبة" },
  "خطة_العمل":          { icon: <ListTodo className="w-4 h-4" />,    color: "border-[#c9a84c]/30", glowColor: "#c9a84c", label: "خطة العمل" },
  "رؤى_استراتيجية":     { icon: <Lightbulb className="w-4 h-4" />,   color: "border-[#c9a84c]/40", glowColor: "#c9a84c", label: "رؤى استراتيجية" },
  "التوجيه_الاحترافي":  { icon: <Activity className="w-4 h-4" />,    color: "border-white/10",     glowColor: "#c9a84c", label: "التوجيه الاحترافي" },
};

/* ═══════════════════════════════════════════════
   CINEMATIC SECTION CARD with GlowCard
   ═══════════════════════════════════════════════ */
function SectionCard({ titleKey, content, index }: { titleKey: string; content: string; index: number }) {
  const config = SECTION_CONFIG[titleKey];
  if (!config) return null;

  return (
    <GlowCard
      glowColor={config.glowColor}
      intensity={0.35}
      delay={index * 0.06}
      className={`border ${config.color}`}
    >
      <div className="p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <motion.span
            whileHover={{ rotate: 10, scale: 1.15 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="text-[#c9a84c]/70"
          >
            {config.icon}
          </motion.span>
          <span className="text-xs font-semibold text-white/80 tracking-wide">{config.label}</span>
        </div>
        <p className="text-sm text-white/65 leading-[1.8]">{content}</p>
      </div>
    </GlowCard>
  );
}

/* ═══════════════════════════════════════════════
   ANALYSIS DASHBOARD (Right Panel)
   ═══════════════════════════════════════════════ */
function AnalysisDashboard({
  analysis,
  classification,
  kbUsed,
  kbChunksCount,
  isLoading,
}: {
  analysis: Record<string, string> | null;
  classification: ClassificationData | null;
  kbUsed: boolean;
  kbChunksCount: number;
  isLoading: boolean;
}) {
  // Loading state — cinematic orbital
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-28 h-28 mx-auto mb-8" style={{ perspective: 800 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-[#c9a84c]/20 border-t-[#c9a84c]"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
              className="absolute inset-3 rounded-full border border-[#4EA8DE]/15 border-t-[#4EA8DE]"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
              className="absolute inset-6 rounded-full border border-[#c9a84c]/10 border-t-[#c9a84c]/50"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Brain className="w-7 h-7 text-[#c9a84c]" />
            </motion.div>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              جاري التحليل القانوني
            </motion.span>
          </h3>
          <p className="text-sm text-white/40 mb-6">يتم المرور على 3 مراحل: تحليل عميق → تفكير استراتيجي → صياغة الرد</p>
          <div className="flex items-center justify-center gap-3">
            {[
              { label: "تحليل القضية", done: true },
              { label: "الاستراتيجية", done: true },
              { label: "الصياغة", done: false },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex items-center gap-2"
              >
                <motion.div
                  animate={!step.done ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className={`w-2 h-2 rounded-full ${step.done ? "bg-[#c9a84c]" : "bg-white/20"}`}
                />
                <span className={`text-[10px] font-mono-ar ${step.done ? "text-[#c9a84c]" : "text-white/30"}`}>
                  {step.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Empty state
  if (!analysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="text-center max-w-sm"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#c9a84c]/15 to-[#c9a84c]/5 border border-[#c9a84c]/15 flex items-center justify-center mx-auto mb-6"
          >
            <Scale className="w-10 h-10 text-[#c9a84c]/60" />
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-2">مركز التحليل القانوني</h3>
          <p className="text-sm text-white/40 leading-relaxed">
            اكتب وصف قضيتك في الجانب الأيسر، وسيظهر هنا التحليل القانوني المُنظّم
            مع الاستشهاد بالمواد القانونية من قاعدة المعرفة.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-[10px] font-mono-ar text-white/20">
            {[
              { icon: <Database className="w-3 h-3" />, text: "80 مادة قانونية" },
              { icon: <Shield className="w-3 h-3" />, text: "4 أنظمة سعودية" },
              { icon: <Zap className="w-3 h-3" />, text: "3 مراحل تحليل" },
            ].map((item, i) => (
              <motion.span
                key={i}
                whileHover={{ scale: 1.05, color: "rgba(201, 168, 76, 0.5)" }}
                className="flex items-center gap-1 transition-colors duration-300"
              >
                {item.icon}
                {item.text}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // Analysis dashboard
  const entries = Object.entries(analysis)
    .filter(([key]) => !key.startsWith("_"))
    .filter(([key]) => SECTION_CONFIG[key])
    .sort((a, b) => {
      const orderA = Object.keys(SECTION_CONFIG).indexOf(a[0]);
      const orderB = Object.keys(SECTION_CONFIG).indexOf(b[0]);
      return orderA - orderB;
    });

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="p-6 space-y-4">
        {/* Header with classification */}
        {classification && (
          <motion.div
            initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-2"
          >
            <div className="flex items-center gap-3">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="text-xs font-mono-ar px-2.5 py-1 bg-[#c9a84c]/15 text-[#c9a84c] rounded-sm border border-[#c9a84c]/20"
              >
                {caseTypeLabels[classification.caseType] || classification.caseType}
              </motion.span>
              {classification.caseSubtype && (
                <span className="text-[10px] font-mono-ar text-white/30">{classification.caseSubtype}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono-ar px-2 py-0.5 rounded-sm ${riskConfig[classification.riskLevel]?.color.replace("text-", "bg-").replace("]", "]/15")} ${riskConfig[classification.riskLevel]?.color}`}>
                {riskConfig[classification.riskLevel]?.text}
              </span>
              <span className={`text-[10px] font-mono-ar px-2 py-0.5 rounded-sm ${urgencyConfig[classification.urgencyLevel]?.color.replace("text-", "bg-").replace("]", "]/15")} ${urgencyConfig[classification.urgencyLevel]?.color}`}>
                {urgencyConfig[classification.urgencyLevel]?.text}
              </span>
            </div>
          </motion.div>
        )}

        {/* KB Badge */}
        {kbUsed && (
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="flex items-center gap-2 p-3 bg-[#17B26A]/8 border border-[#17B26A]/20 rounded-lg"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            >
              <Database className="w-3.5 h-3.5 text-[#17B26A]" />
            </motion.div>
            <span className="text-[11px] text-[#17B26A] font-mono-ar">
              التحليل مبني على {kbChunksCount} مادة قانونية من قاعدة المعرفة
            </span>
          </motion.div>
        )}

        {/* AI Response Text */}
        {analysis["_response"] && (
          <GlowCard glowColor="#c9a84c" intensity={0.3} delay={0} className="border-r-2 border-r-[#c9a84c]/30">
            <div className="p-4 bg-gradient-to-r from-[#c9a84c]/5 to-transparent">
              <p className="text-sm text-white/80 leading-[1.8]">{analysis["_response"]}</p>
            </div>
          </GlowCard>
        )}

        {/* Section Cards Grid */}
        <div className="grid grid-cols-1 gap-3">
          {entries.map(([key, value], i) => (
            <SectionCard key={key} titleKey={key} content={value} index={i} />
          ))}
        </div>

        {/* Lead CTA */}
        {analysis["_lead_triggered"] === "true" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
          >
            <GlowCard glowColor="#c9a84c" intensity={0.5} className="border border-[#c9a84c]/30">
              <div className="p-5 text-center">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="w-12 h-12 rounded-full bg-[#c9a84c]/10 flex items-center justify-center mx-auto mb-3 border border-[#c9a84c]/20"
                >
                  <Shield className="w-6 h-6 text-[#c9a84c]" />
                </motion.div>
                <h4 className="text-sm font-semibold text-white mb-2">قضيتك تستحق مراجعة خبير</h4>
                <p className="text-xs text-white/50 mb-4">
                  هذه القضية معقدة أو عاجلة — فريق مسؤول للمحاماة جاهز لمراجعة قضيتك بشكل مفصل.
                </p>
                <MagneticButton
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#c9a84c] to-[#a88a3a] text-black text-xs font-semibold rounded-sm"
                  strength={0.15}
                >
                  <Link to="/case-review" className="contents">
                    <Shield className="w-3.5 h-3.5" />
                    اطلب مراجعة خبير
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </MagneticButton>
              </div>
            </GlowCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN AI ADVISOR PAGE
   ═══════════════════════════════════════════════ */
export default function AIAdvisor() {
  const [input, setInput] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<Record<string, string> | null>(null);
  const [classification, setClassification] = useState<ClassificationData | null>(null);
  const [kbUsed, setKbUsed] = useState(false);
  const [kbChunksCount, setKbChunksCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fingerprint = getDeviceFingerprint();

  const { data: conversations, refetch: refetchConversations } =
    trpc.conversation.list.useQuery({ deviceFingerprint: fingerprint });

  const { data: dbMessages } =
    trpc.message.list.useQuery(
      { conversationId: currentConversationId! },
      { enabled: currentConversationId !== null }
    );

  const createConversation = trpc.conversation.create.useMutation({
    onSuccess: (data) => {
      setCurrentConversationId(data.id);
      setMessages([]);
      setLastAnalysis(null);
      setClassification(null);
      setKbUsed(false);
      refetchConversations();
    },
  });

  const chatMutation = trpc.chat.send.useMutation({
    onMutate: () => setIsLoading(true),
    onSettled: () => setIsLoading(false),
    onSuccess: (data) => {
      if (!data) return;
      const resp = data as unknown as ChatResponse;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          conversationId: currentConversationId!,
          role: "assistant",
          content: resp.content,
          analysis: resp.analysis as Record<string, unknown> | null,
          createdAt: new Date(),
        },
      ]);
      if (resp.analysis) {
        setLastAnalysis(resp.analysis);
        setClassification(resp.classification);
        setKbUsed(resp.kbUsed);
        setKbChunksCount(resp.kbChunksCount);
      }
      refetchConversations();
    },
  });

  useEffect(() => {
    if (dbMessages) setMessages(dbMessages);
  }, [dbMessages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");

    let convId = currentConversationId;
    if (!convId) {
      const newConv = await createConversation.mutateAsync({
        deviceFingerprint: fingerprint,
        title: text.slice(0, 50) + "...",
      });
      convId = newConv.id;
    }

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), conversationId: convId!, role: "user", content: text, analysis: null, createdAt: new Date() },
    ]);

    chatMutation.mutate({ conversationId: convId!, message: text });
  };

  const startNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setLastAnalysis(null);
    setClassification(null);
    setKbUsed(false);
    setShowHistory(false);
  };

  const selectConversation = (id: number) => {
    setCurrentConversationId(id);
    setLastAnalysis(null);
    setClassification(null);
    setKbUsed(false);
    setShowHistory(false);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-black text-white overflow-hidden" dir="rtl">
      {/* ─── History Sidebar ─── */}
      <motion.div
        initial={false}
        animate={{ width: showHistory ? 260 : 0, opacity: showHistory ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="border-l border-white/[0.06] bg-[#050508] flex flex-col overflow-hidden flex-shrink-0"
      >
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <span className="text-xs font-semibold text-white/60">المحادثات</span>
          <button onClick={() => setShowHistory(false)} className="text-white/30 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations?.map((conv) => (
            <motion.button
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full text-right p-3 rounded-lg text-xs transition-all duration-300 ${
                currentConversationId === conv.id
                  ? "bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20"
                  : "text-white/50 hover:bg-white/5 hover:text-white/70"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-3 h-3 flex-shrink-0" />
                <span className="truncate font-medium">{conv.title}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-white/25">
                <Clock className="w-2.5 h-2.5" />
                {new Date(conv.createdAt).toLocaleDateString("ar-SA")}
              </div>
            </motion.button>
          ))}
          {(!conversations || conversations.length === 0) && (
            <div className="text-center py-8 text-white/20 text-xs">لا توجد محادثات</div>
          )}
        </div>
      </motion.div>

      {/* ─── LEFT PANEL: Input ─── */}
      <div className="w-full lg:w-[420px] flex-shrink-0 border-l border-white/[0.06] bg-[#050508] flex flex-col">
        {/* Panel Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c9a84c] to-[#a88a3a] flex items-center justify-center"
            >
              <Brain className="w-4 h-4 text-black" />
            </motion.div>
            <div>
              <h2 className="text-sm font-bold text-white">المستشار الذكي</h2>
              <p className="text-[9px] font-mono-ar text-white/30">3 مراحل تحليل قانوني</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={startNewChat}
              className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* User Input Area */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Previous user messages */}
          <div className="space-y-3 mb-6">
            {messages.filter((m) => m.role === "user").map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="p-4 glass-card border border-white/[0.06]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white/40" />
                  </div>
                  <span className="text-[10px] font-mono-ar text-white/30">وصف القضية</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">{msg.content}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Prompts (when empty) */}
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <p className="text-[10px] font-mono-ar text-white/20 uppercase tracking-widest mb-3">أمثلة سريعة</p>
              {QUICK_PROMPTS.map((prompt, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.02, x: -4, borderColor: "rgba(201,168,76,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInput(prompt)}
                  className="w-full text-right p-3.5 text-xs text-white/50 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] rounded-lg transition-all duration-300"
                >
                  {prompt}
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Input Field */}
        <div className="p-4 border-t border-white/[0.06] bg-[#050508]">
          <div className="relative group">
            {/* Animated gradient border on focus */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-[#c9a84c]/20 via-[#4EA8DE]/10 to-[#c9a84c]/20 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm pointer-events-none" />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="صف قضيتك بالتفصيل..."
              disabled={isLoading}
              rows={3}
              className="relative z-10 w-full bg-white/[0.03] border border-white/[0.08] group-focus-within:border-[#c9a84c]/30 rounded-lg text-white text-sm text-right placeholder:text-white/20 focus:outline-none resize-none p-4 pb-12 transition-all duration-300"
            />
            <motion.button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute left-3 bottom-3 z-10 p-2.5 bg-gradient-to-r from-[#c9a84c] to-[#a88a3a] rounded-lg text-black hover:shadow-lg hover:shadow-[#c9a84c]/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </motion.button>
          </div>
          <p className="text-center text-[9px] font-mono-ar text-white/15 mt-2">
            مسؤول — تحليل قانوني مبني على {kbChunksCount > 0 ? kbChunksCount : "80"} مادة من الأنظمة السعودية
          </p>
        </div>
      </div>

      {/* ─── RIGHT PANEL: Analysis Dashboard ─── */}
      <div className="flex-1 min-w-0 bg-black relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(201,168,76,0.03)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(78,168,222,0.02)_0%,_transparent_50%)]" />
        <div className="relative h-full">
          <AnalysisDashboard
            analysis={lastAnalysis}
            classification={classification}
            kbUsed={kbUsed}
            kbChunksCount={kbChunksCount}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
