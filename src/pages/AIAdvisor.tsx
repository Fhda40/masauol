import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Plus, Brain, MessageSquare, Scale, Shield,
  FileSearch, BookOpen, Zap, Target, Database,
  Loader2, ChevronDown, ChevronUp, AlertCircle,
  Phone, X, History,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import { useAuth, GoogleLoginButton } from "@/providers/AuthProvider";

/* ─── Types ─── */
interface AnalysisData {
  [key: string]: string | boolean | number | string[];
}
interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  analysis?: AnalysisData | null;
  classification?: { caseType: string; riskLevel: string; urgencyLevel: string } | null;
  kbUsed?: boolean;
  kbChunksCount?: number;
  leadTriggered?: boolean;
}

/* ─── Config ─── */
const riskConfig: Record<string, { text: string; color: string; bg: string }> = {
  low:     { text: "خطر منخفض",  color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
  medium:  { text: "خطر متوسط",  color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  high:    { text: "خطر عالي",   color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  critical:{ text: "خطر حرج",   color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};
const urgencyConfig: Record<string, { text: string; color: string }> = {
  low:    { text: "عادي",    color: "#6B6355" },
  medium: { text: "متوسط",   color: "#3b82f6" },
  high:   { text: "عاجل",    color: "#f59e0b" },
  urgent: { text: "حرج جداً", color: "#ef4444" },
};
const caseTypeLabels: Record<string, string> = {
  enforcement: "تنفيذ / ديون", cybercrime: "جرائم إلكترونية", drugs: "مخدرات",
  labor: "عمالي", civil: "مدني", criminal: "جنائي",
  commercial: "تجاري", family: "أحوال شخصية", general: "استشارة عامة",
};
const SECTION_CONFIG: Record<string, { icon: React.ReactNode; label: string }> = {
  "فهم_الحالة":              { icon: <FileSearch className="w-3.5 h-3.5" />, label: "فهم الحالة" },
  "التكييف_القانوني":        { icon: <Scale className="w-3.5 h-3.5" />,     label: "التكييف القانوني" },
  "العناصر_النظامية":        { icon: <BookOpen className="w-3.5 h-3.5" />,  label: "المواد النظامية" },
  "نقاط_القوة":              { icon: <Shield className="w-3.5 h-3.5" />,    label: "نقاط القوة" },
  "نقاط_الضعف":              { icon: <Zap className="w-3.5 h-3.5" />,      label: "نقاط الضعف" },
  "المخاطر_القانونية":       { icon: <AlertCircle className="w-3.5 h-3.5" />, label: "المخاطر" },
  "السيناريوهات_المحتملة":   { icon: <Target className="w-3.5 h-3.5" />,    label: "السيناريوهات" },
  "الاستراتيجية_الموصى_بها": { icon: <Target className="w-3.5 h-3.5" />,    label: "الاستراتيجية" },
  "الإثباتات_المطلوبة":      { icon: <BookOpen className="w-3.5 h-3.5" />,  label: "الإثباتات" },
  "خطة_العمل":               { icon: <Target className="w-3.5 h-3.5" />,    label: "خطة العمل" },
  "رؤى_استراتيجية":          { icon: <Brain className="w-3.5 h-3.5" />,     label: "رؤى استراتيجية" },
  "التوجيه_الاحترافي":       { icon: <FileSearch className="w-3.5 h-3.5" />, label: "التوجيه" },
  "تحليل_الحكم":             { icon: <Scale className="w-3.5 h-3.5" />,     label: "تحليل الحكم" },
  "أخطاء_إجرائية":           { icon: <AlertCircle className="w-3.5 h-3.5" />, label: "أخطاء إجرائية" },
  "فرص_الطعن":               { icon: <Shield className="w-3.5 h-3.5" />,    label: "فرص الطعن" },
  "إجراءات_موصى_بها":        { icon: <Target className="w-3.5 h-3.5" />,    label: "إجراءات موصى بها" },
};
const QUICK_PROMPTS = [
  "لديّ ديون ومحكمة التنفيذ طلبت منع سفري، ما هي حقوقي؟",
  "تعرضت لابتزاز إلكتروني، ما الإجراءات القانونية؟",
  "فُصلت من عملي دون سبب، ما هي مستحقاتي؟",
  "نزاع على حضانة الأطفال بعد الطلاق",
];

/* ─── Typing Indicator ─── */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 mb-4">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)" }}>
        <Scale className="w-4 h-4" style={{ color: "#0A0A0A" }} />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-br-sm"
        style={{ background: "#1A1A1A", border: "1px solid rgba(201,168,76,0.15)" }}>
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#C9A84C" }}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Analysis Card (inside AI bubble) ─── */
function AnalysisCard({ analysis, classification, kbUsed, kbChunksCount, leadTriggered }: {
  analysis: AnalysisData;
  classification?: { caseType: string; riskLevel: string; urgencyLevel: string } | null;
  kbUsed?: boolean;
  kbChunksCount?: number;
  leadTriggered?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const sections = Object.entries(analysis)
    .filter(([k]) => !k.startsWith("_") && SECTION_CONFIG[k] && typeof analysis[k] === "string")
    .sort((a, b) => {
      const keys = Object.keys(SECTION_CONFIG);
      return keys.indexOf(a[0]) - keys.indexOf(b[0]);
    });

  const risk = classification ? riskConfig[classification.riskLevel] : null;
  const urgency = classification ? urgencyConfig[classification.urgencyLevel] : null;

  return (
    <div className="mt-3 rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(201,168,76,0.12)", background: "rgba(201,168,76,0.03)" }}>

      {/* Header badges */}
      {classification && (
        <div className="flex flex-wrap gap-2 px-4 pt-3 pb-2">
          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: "rgba(201,168,76,0.1)", color: "#C9A84C" }}>
            {caseTypeLabels[classification.caseType] ?? classification.caseType}
          </span>
          {risk && (
            <span className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: risk.bg, color: risk.color }}>
              {risk.text}
            </span>
          )}
          {urgency && urgency.text !== "عادي" && (
            <span className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: "rgba(245,158,11,0.1)", color: urgency.color }}>
              {urgency.text}
            </span>
          )}
          {kbUsed && (
            <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
              style={{ background: "rgba(22,163,74,0.08)", color: "#16a34a" }}>
              <Database className="w-3 h-3" />
              {kbChunksCount} مادة
            </span>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs transition-colors"
        style={{ color: "#9A8F7A", borderTop: classification ? "1px solid rgba(201,168,76,0.08)" : "none" }}
      >
        <span>{expanded ? "إخفاء التحليل التفصيلي" : `عرض التحليل التفصيلي (${sections.length} قسم)`}</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {/* Sections */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2.5">
              {sections.map(([key, value]) => {
                const cfg = SECTION_CONFIG[key];
                return (
                  <div key={key} className="p-3 rounded-xl"
                    style={{ background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="flex items-center gap-2 mb-1.5"
                      style={{ color: "#C9A84C" }}>
                      {cfg.icon}
                      <span className="text-xs font-semibold">{cfg.label}</span>
                    </div>
                    <p className="text-xs leading-relaxed whitespace-pre-line"
                      style={{ color: "#9A8F7A" }}>{value as string}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lead CTA */}
      {leadTriggered && (
        <div className="mx-4 mb-4 p-3 rounded-xl flex items-center justify-between"
          style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}>
          <div>
            <p className="text-xs font-semibold" style={{ color: "#C9A84C" }}>قضيتك تستدعي متابعة فورية</p>
            <p className="text-[11px]" style={{ color: "#6B6355" }}>ننصح بالتواصل مع محامٍ متخصص</p>
          </div>
          <a href="/contact"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)", color: "#0A0A0A" }}>
            <Phone className="w-3 h-3" />
            تواصل
          </a>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function AIAdvisor() {
  const { user, loading: authLoading } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentConvId, setCurrentConvId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoLoadedRef = useRef(false);
  const fingerprint = getDeviceFingerprint();

  const { data: conversations, refetch: refetchConvs } =
    trpc.conversation.list.useQuery({ deviceFingerprint: fingerprint }, { enabled: !!user });

  const { data: dbMessages } =
    trpc.message.list.useQuery(
      { conversationId: currentConvId! },
      { enabled: currentConvId !== null }
    );

  // Auto-load last conversation on first load only
  useEffect(() => {
    if (conversations?.length && currentConvId === null && !autoLoadedRef.current) {
      autoLoadedRef.current = true;
      setCurrentConvId(conversations[0].id);
    }
  }, [conversations]);

  useEffect(() => {
    if (dbMessages) {
      setMessages(dbMessages.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        analysis: m.analysis,
        classification: m.analysis ? {
          caseType: m.analysis._case_type,
          riskLevel: m.analysis._risk_level,
          urgencyLevel: m.analysis._urgency_level,
        } : null,
        kbUsed: m.analysis?._kb_retrieved,
        kbChunksCount: m.analysis?._kb_chunks_count,
      })));
    }
  }, [dbMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const createConversation = trpc.conversation.create.useMutation();
  const chatMutation = trpc.chat.send.useMutation({
    onMutate: () => { setIsLoading(true); setError(null); },
    onSettled: () => setIsLoading(false),
    onSuccess: (data: any) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: "assistant",
        content: data.content ?? "",
        analysis: data.analysis,
        classification: data.classification,
        kbUsed: data.kbUsed,
        kbChunksCount: data.kbChunksCount,
        leadTriggered: data.leadTriggered,
      }]);
      refetchConvs();
    },
    onError: (err: any) => {
      setError(err?.message ?? "حدث خطأ، أعد المحاولة.");
    },
  });

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput("");
    setError(null);

    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: text }]);

    let convId = currentConvId;
    if (!convId) {
      try {
        const conv = await createConversation.mutateAsync({
          deviceFingerprint: fingerprint,
          title: text.slice(0, 60),
        });
        convId = conv.id;
        setCurrentConvId(conv.id);
        refetchConvs();
      } catch (err: any) {
        const msg = err?.message ?? "";
        setMessages(prev => prev.slice(0, -1));
        if (msg.includes("استشارتك المجانية")) {
          setError("لقد استخدمت استشارتك المجانية. للحصول على استشارات إضافية، تواصل مع فريق مسؤول للمحاماة.");
        } else if (msg.includes("تسجيل الدخول")) {
          setError("يرجى تسجيل الدخول أولاً.");
        } else {
          setError(msg || "تعذر إنشاء المحادثة، أعد المحاولة.");
        }
        return;
      }
    }

    chatMutation.mutate({ conversationId: convId!, message: text });
  };

  const startNew = () => {
    setCurrentConvId(null);
    setMessages([]);
    setError(null);
    setShowSidebar(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  /* ─── Login screen ─── */
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: "#C9A84C" }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12" dir="rtl">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)" }}>
              <Scale className="w-8 h-8" style={{ color: "#0A0A0A" }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "#F0EAD8" }}>
              المستشار القانوني الذكي
            </h1>
            <p className="text-sm" style={{ color: "#6B6355" }}>
              استشارة قانونية مجانية مبنية على الأنظمة السعودية
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: Shield, text: "مجاني" },
              { icon: Brain, text: "تحليل ذكي" },
              { icon: BookOpen, text: "أنظمة سعودية" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-2 p-3 rounded-2xl"
                style={{ background: "#141414", border: "1px solid rgba(201,168,76,0.1)" }}>
                <Icon className="w-5 h-5" style={{ color: "#C9A84C" }} />
                <span className="text-xs" style={{ color: "#9A8F7A" }}>{text}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl mb-6 text-xs text-center"
            style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.1)", color: "#6B6355" }}>
            سجّل بحساب Google — استشارة مجانية واحدة لكل حساب
          </div>

          <div className="flex justify-center">
            <GoogleLoginButton />
          </div>
        </motion.div>
      </div>
    );
  }

  /* ─── Chat UI ─── */
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden" dir="rtl"
      style={{ background: "#0A0A0A" }}>

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-shrink-0 flex flex-col overflow-hidden border-l"
            style={{ borderColor: "rgba(201,168,76,0.08)", background: "#0D0D0D" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "rgba(201,168,76,0.08)" }}>
              <span className="text-xs font-semibold" style={{ color: "#9A8F7A" }}>المحادثات</span>
              <button onClick={() => setShowSidebar(false)} style={{ color: "#6B6355" }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <button onClick={startNew}
              className="mx-3 my-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors"
              style={{ background: "rgba(201,168,76,0.08)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.15)" }}>
              <Plus className="w-3.5 h-3.5" />
              محادثة جديدة
            </button>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations?.map((conv: any) => (
                <button key={conv.id}
                  onClick={() => { setCurrentConvId(conv.id); setMessages([]); setError(null); setShowSidebar(false); }}
                  className="w-full text-right px-3 py-2.5 rounded-xl text-xs transition-colors"
                  style={{
                    background: currentConvId === conv.id ? "rgba(201,168,76,0.08)" : "transparent",
                    color: currentConvId === conv.id ? "#C9A84C" : "#6B6355",
                    border: currentConvId === conv.id ? "1px solid rgba(201,168,76,0.12)" : "1px solid transparent",
                  }}>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{conv.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
          style={{ borderColor: "rgba(201,168,76,0.08)", background: "#0D0D0D" }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-xl transition-colors"
              style={{ color: "#6B6355", background: showSidebar ? "rgba(201,168,76,0.08)" : "transparent" }}>
              <History className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)" }}>
                <Scale className="w-3.5 h-3.5" style={{ color: "#0A0A0A" }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#F0EAD8" }}>مسؤول</p>
                <p className="text-[10px]" style={{ color: "#6B6355" }}>مستشار قانوني • أنظمة سعودية</p>
              </div>
            </div>
          </div>
          <button onClick={startNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-colors"
            style={{ color: "#6B6355", border: "1px solid rgba(201,168,76,0.1)" }}>
            <Plus className="w-3.5 h-3.5" />
            جديد
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">

          {/* Welcome (empty state) */}
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)" }}>
                  <Scale className="w-7 h-7" style={{ color: "#0A0A0A" }} />
                </div>
                <p className="text-base font-semibold mb-1" style={{ color: "#F0EAD8" }}>
                  مرحباً، {user.name.split(" ")[0]}
                </p>
                <p className="text-sm mb-8" style={{ color: "#6B6355" }}>
                  صف قضيتك وسأحللها قانونياً بناءً على الأنظمة السعودية
                </p>
                <div className="grid grid-cols-1 gap-2 max-w-sm w-full">
                  {QUICK_PROMPTS.map((p, i) => (
                    <motion.button key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      onClick={() => setInput(p)}
                      className="text-right px-4 py-3 rounded-xl text-sm transition-all"
                      style={{
                        background: "#141414",
                        border: "1px solid rgba(201,168,76,0.1)",
                        color: "#9A8F7A",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.25)";
                        (e.currentTarget as HTMLElement).style.color = "#C9A84C";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.1)";
                        (e.currentTarget as HTMLElement).style.color = "#9A8F7A";
                      }}>
                      {p}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, i) => (
            <motion.div key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-end gap-3 mb-4 ${msg.role === "user" ? "justify-start flex-row-reverse" : "justify-start"}`}>

              {/* Avatar */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={msg.role === "user"
                  ? { background: "rgba(201,168,76,0.15)", color: "#C9A84C" }
                  : { background: "linear-gradient(135deg, #C9A84C, #A8893A)", color: "#0A0A0A" }}>
                {msg.role === "user"
                  ? (user.picture
                    ? <img src={user.picture} className="w-8 h-8 rounded-full" />
                    : user.name[0])
                  : <Scale className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={msg.role === "user"
                    ? {
                      background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(168,137,58,0.1))",
                      border: "1px solid rgba(201,168,76,0.2)",
                      color: "#F0EAD8",
                      borderBottomRightRadius: 4,
                    }
                    : {
                      background: "#141414",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "#D4C9B0",
                      borderBottomLeftRadius: 4,
                    }}>
                  {msg.content}
                </div>

                {/* Analysis accordion */}
                {msg.role === "assistant" && msg.analysis && (
                  <div className="w-full mt-1">
                    <AnalysisCard
                      analysis={msg.analysis}
                      classification={msg.classification}
                      kbUsed={msg.kbUsed}
                      kbChunksCount={msg.kbChunksCount}
                      leadTriggered={msg.leadTriggered}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {isLoading && <TypingIndicator />}

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-start gap-2 p-3 rounded-xl mx-2"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
              <p className="text-xs" style={{ color: "#ef4444" }}>{error}</p>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0 px-4 py-4 border-t"
          style={{ borderColor: "rgba(201,168,76,0.08)", background: "#0D0D0D" }}>
          <div className="flex items-end gap-3 max-w-3xl mx-auto">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="صف قضيتك... (Enter للإرسال، Shift+Enter لسطر جديد)"
              disabled={isLoading}
              rows={1}
              className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-all"
              style={{
                background: "#1A1A1A",
                border: "1px solid rgba(201,168,76,0.15)",
                color: "#F0EAD8",
                minHeight: 44,
                maxHeight: 120,
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(201,168,76,0.35)")}
              onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.15)")}
            />
            <motion.button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              whileHover={!isLoading && input.trim() ? { scale: 1.05 } : {}}
              whileTap={!isLoading && input.trim() ? { scale: 0.95 } : {}}
              className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all"
              style={{
                background: isLoading || !input.trim()
                  ? "rgba(201,168,76,0.08)"
                  : "linear-gradient(135deg, #C9A84C, #A8893A)",
                color: isLoading || !input.trim() ? "#6B6355" : "#0A0A0A",
              }}>
              {isLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />}
            </motion.button>
          </div>
          <p className="text-center text-[10px] mt-2" style={{ color: "#3D3530" }}>
            مسؤول للمحاماة — التحليل للاستئناس فقط ولا يغني عن مراجعة محامٍ مختص
          </p>
        </div>
      </div>
    </div>
  );
}
