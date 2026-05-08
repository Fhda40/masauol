import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send, Plus, Brain, MessageSquare, Scale, Shield,
  FileSearch, BookOpen, Zap, Target, Database,
  Loader2, ChevronDown, ChevronUp, AlertCircle,
  Phone, X, History,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import { useAuth, GoogleLoginButton } from "@/providers/AuthProvider";

/* ─── Markdown Renderer ─── */
function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A", marginBottom: "0.5rem", marginTop: "0.75rem", fontFamily: "'EB Garamond', serif", lineHeight: 1.4 }}>
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.4rem", marginTop: "0.7rem", lineHeight: 1.4 }}>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#A8893A", marginBottom: "0.3rem", marginTop: "0.6rem", lineHeight: 1.4 }}>
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p style={{ fontSize: "0.875rem", lineHeight: 1.75, color: "#1e293b", marginBottom: "0.5rem" }}>
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul style={{ paddingRight: "1.25rem", paddingLeft: 0, marginBottom: "0.5rem", listStyleType: "disc" }}>
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol style={{ paddingRight: "1.25rem", paddingLeft: 0, marginBottom: "0.5rem", listStyleType: "decimal" }}>
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "#1e293b", marginBottom: "0.2rem" }}>
            {children}
          </li>
        ),
        strong: ({ children }) => (
          <strong style={{ fontWeight: 700, color: "#0F172A" }}>
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em style={{ color: "#475569", fontStyle: "italic" }}>{children}</em>
        ),
        hr: () => (
          <hr style={{ border: "none", borderTop: "1px solid rgba(201,168,76,0.20)", margin: "0.6rem 0" }} />
        ),
        blockquote: ({ children }) => (
          <blockquote style={{
            borderRight: "3px solid #C9A84C",
            paddingRight: "0.75rem",
            paddingLeft: "0.5rem",
            margin: "0.5rem 0",
            color: "#475569",
            fontSize: "0.85rem",
            lineHeight: 1.65,
            background: "rgba(201,168,76,0.04)",
            borderRadius: "0 8px 8px 0",
          }}>
            {children}
          </blockquote>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          return isBlock ? (
            <code style={{
              display: "block",
              background: "rgba(15,23,42,0.06)",
              border: "1px solid rgba(201,168,76,0.12)",
              borderRadius: "8px",
              padding: "0.5rem 0.75rem",
              fontSize: "0.8rem",
              color: "#1e293b",
              margin: "0.4rem 0",
              overflowX: "auto",
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
            }}>
              {children}
            </code>
          ) : (
            <code style={{
              background: "rgba(201,168,76,0.10)",
              borderRadius: "4px",
              padding: "1px 5px",
              fontSize: "0.82rem",
              color: "#A8893A",
              fontFamily: "monospace",
            }}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

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
  low:     { text: "خطر منخفض",  color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
  medium:  { text: "خطر متوسط",  color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
  high:    { text: "خطر عالي",   color: "#d97706", bg: "rgba(217,119,6,0.08)" },
  critical:{ text: "خطر حرج",   color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
};
const urgencyConfig: Record<string, { text: string; color: string }> = {
  low:    { text: "عادي",    color: "#64748b" },
  medium: { text: "متوسط",   color: "#3b82f6" },
  high:   { text: "عاجل",    color: "#d97706" },
  urgent: { text: "حرج جداً", color: "#dc2626" },
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
        <Scale className="w-4 h-4 text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-br-sm"
        style={{
          background: "rgba(255,255,255,0.80)",
          border: "1px solid rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
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

/* ─── Analysis Card ─── */
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

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.65)",
        border: "1px solid rgba(201,168,76,0.15)",
        backdropFilter: "blur(8px)",
      }}>

      {/* Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs transition-colors cursor-pointer"
        style={{ color: "#64748b" }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,168,76,0.04)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
        <span className="flex items-center gap-1.5">
          <FileSearch className="w-3.5 h-3.5" style={{ color: "#C9A84C" }} />
          {expanded ? "إخفاء التحليل التفصيلي" : `عرض التحليل التفصيلي (${sections.length} قسم)`}
        </span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {/* Sections */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {sections.map(([key, value]) => {
                const cfg = SECTION_CONFIG[key];
                return (
                  <div key={key} className="p-3 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.75)",
                      border: "1px solid rgba(201,168,76,0.10)",
                    }}>
                    <div className="flex items-center gap-2 mb-1.5" style={{ color: "#C9A84C" }}>
                      {cfg.icon}
                      <span className="text-xs font-semibold">{cfg.label}</span>
                    </div>
                    <p className="text-xs leading-relaxed whitespace-pre-line"
                      style={{ color: "#475569" }}>{value as string}</p>
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
          style={{
            background: "rgba(201,168,76,0.08)",
            border: "1px solid rgba(201,168,76,0.20)",
          }}>
          <div>
            <p className="text-xs font-semibold" style={{ color: "#A8893A" }}>قضيتك تستدعي متابعة فورية</p>
            <p className="text-[11px]" style={{ color: "#64748b" }}>ننصح بالتواصل مع محامٍ متخصص</p>
          </div>
          <a href="/contact"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
            style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)", color: "#fff" }}>
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

  /* ─── Loading screen ─── */
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: "#C9A84C" }} />
      </div>
    );
  }

  /* ─── Login screen ─── */
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12" dir="rtl">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm">

          {/* Hero icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
              style={{
                background: "rgba(255,255,255,0.80)",
                border: "1px solid rgba(201,168,76,0.25)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 8px 32px rgba(201,168,76,0.12), 0 2px 8px rgba(0,0,0,0.06)",
              }}>
              <Scale className="w-9 h-9" style={{ color: "#C9A84C" }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "#0F172A" }}>
              المستشار القانوني الذكي
            </h1>
            <p className="text-sm" style={{ color: "#64748b" }}>
              استشارة قانونية مجانية مبنية على الأنظمة السعودية
            </p>
          </div>

          {/* Feature pills */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: Shield, text: "مجاني" },
              { icon: Brain, text: "تحليل ذكي" },
              { icon: BookOpen, text: "أنظمة سعودية" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-2 p-3 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.72)",
                  border: "1px solid rgba(201,168,76,0.15)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}>
                <Icon className="w-5 h-5" style={{ color: "#C9A84C" }} />
                <span className="text-xs font-medium" style={{ color: "#475569" }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="p-4 rounded-2xl mb-6 text-xs text-center"
            style={{
              background: "rgba(255,255,255,0.72)",
              border: "1px solid rgba(201,168,76,0.15)",
              backdropFilter: "blur(12px)",
              color: "#64748b",
            }}>
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
    <div className="flex h-[calc(100vh-64px)] overflow-hidden" dir="rtl">

      {/* Sidebar overlay on mobile */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            key="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 lg:hidden"
            style={{ background: "rgba(15,23,42,0.18)", backdropFilter: "blur(2px)" }}
            onClick={() => setShowSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-shrink-0 flex flex-col overflow-hidden border-l z-40"
            style={{
              borderColor: "rgba(201,168,76,0.15)",
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(24px) saturate(160%)",
              boxShadow: "-4px 0 24px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "rgba(201,168,76,0.12)" }}>
              <span className="text-xs font-semibold" style={{ color: "#64748b" }}>المحادثات</span>
              <button onClick={() => setShowSidebar(false)}
                className="p-1 rounded-lg cursor-pointer transition-colors"
                style={{ color: "#94a3b8" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#0F172A")}
                onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <button onClick={startNew}
              className="mx-3 my-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs cursor-pointer transition-all"
              style={{
                background: "rgba(201,168,76,0.10)",
                color: "#A8893A",
                border: "1px solid rgba(201,168,76,0.20)",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.18)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.10)"; }}>
              <Plus className="w-3.5 h-3.5" />
              محادثة جديدة
            </button>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations?.map((conv: any) => (
                <button key={conv.id}
                  onClick={() => { setCurrentConvId(conv.id); setMessages([]); setError(null); setShowSidebar(false); }}
                  className="w-full text-right px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                  style={{
                    background: currentConvId === conv.id ? "rgba(201,168,76,0.10)" : "transparent",
                    color: currentConvId === conv.id ? "#A8893A" : "#64748b",
                    border: currentConvId === conv.id ? "1px solid rgba(201,168,76,0.18)" : "1px solid transparent",
                  }}
                  onMouseEnter={e => {
                    if (currentConvId !== conv.id) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.60)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (currentConvId !== conv.id) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
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
          style={{
            borderColor: "rgba(201,168,76,0.12)",
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(20px) saturate(160%)",
          }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-xl transition-all cursor-pointer"
              style={{
                color: "#64748b",
                background: showSidebar ? "rgba(201,168,76,0.10)" : "transparent",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,168,76,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.background = showSidebar ? "rgba(201,168,76,0.10)" : "transparent")}>
              <History className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.80)",
                  border: "1px solid rgba(201,168,76,0.25)",
                  boxShadow: "0 2px 8px rgba(201,168,76,0.10)",
                }}>
                <Scale className="w-4 h-4" style={{ color: "#C9A84C" }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#0F172A" }}>مسؤول</p>
                <p className="text-[10px]" style={{ color: "#94a3b8" }}>مستشار قانوني • أنظمة سعودية</p>
              </div>
            </div>
          </div>

          <button onClick={startNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
            style={{
              color: "#64748b",
              border: "1px solid rgba(201,168,76,0.18)",
              background: "transparent",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.08)";
              (e.currentTarget as HTMLElement).style.color = "#A8893A";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#64748b";
            }}>
            <Plus className="w-3.5 h-3.5" />
            جديد
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">

          {/* Welcome / empty state */}
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">

                {/* Icon */}
                <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5"
                  style={{
                    background: "rgba(255,255,255,0.80)",
                    border: "1px solid rgba(201,168,76,0.25)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 8px 32px rgba(201,168,76,0.12)",
                  }}>
                  <Scale className="w-7 h-7" style={{ color: "#C9A84C" }} />
                </div>

                <p className="text-lg font-bold mb-1" style={{ color: "#0F172A" }}>
                  مرحباً، {user.name.split(" ")[0]}
                </p>
                <p className="text-sm mb-8" style={{ color: "#64748b" }}>
                  صف قضيتك وسأحللها قانونياً بناءً على الأنظمة السعودية
                </p>

                {/* Quick prompts */}
                <div className="grid grid-cols-1 gap-2 w-full">
                  {QUICK_PROMPTS.map((p, i) => (
                    <motion.button key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      onClick={() => setInput(p)}
                      className="text-right px-4 py-3 rounded-2xl text-sm transition-all cursor-pointer"
                      style={{
                        background: "rgba(255,255,255,0.72)",
                        border: "1px solid rgba(201,168,76,0.12)",
                        color: "#475569",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.30)";
                        (e.currentTarget as HTMLElement).style.color = "#A8893A";
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,248,230,0.80)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.12)";
                        (e.currentTarget as HTMLElement).style.color = "#475569";
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.72)";
                      }}>
                      {p}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Message list */}
          {messages.map((msg) => (
            <motion.div key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-end gap-3 mb-4 ${msg.role === "user" ? "justify-start flex-row-reverse" : "justify-start"}`}>

              {/* Avatar */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden"
                style={msg.role === "user"
                  ? { background: "rgba(201,168,76,0.12)", border: "1.5px solid rgba(201,168,76,0.25)" }
                  : { background: "linear-gradient(135deg, #C9A84C, #A8893A)" }}>
                {msg.role === "user"
                  ? (user.picture
                    ? <img src={user.picture} className="w-8 h-8 object-cover" />
                    : <span style={{ color: "#C9A84C" }}>{user.name[0]}</span>)
                  : <Scale className="w-4 h-4 text-white" />}
              </div>

              {/* Bubble */}
              <div className={`flex flex-col ${msg.role === "user" ? "items-end max-w-[76%]" : "items-start w-full max-w-[82%]"}`}>

                {/* User bubble — plain text */}
                {msg.role === "user" && (
                  <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background: "rgba(255,248,230,0.90)",
                      border: "1px solid rgba(201,168,76,0.25)",
                      backdropFilter: "blur(12px)",
                      color: "#0F172A",
                      borderBottomRightRadius: 6,
                      boxShadow: "0 2px 10px rgba(201,168,76,0.08)",
                    }}>
                    {msg.content}
                  </div>
                )}

                {/* AI bubble — tags + markdown */}
                {msg.role === "assistant" && (
                  <div className="w-full rounded-2xl overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.85)",
                      border: "1px solid rgba(255,255,255,0.90)",
                      backdropFilter: "blur(16px)",
                      borderBottomLeftRadius: 6,
                      boxShadow: "0 2px 14px rgba(0,0,0,0.06)",
                    }}>

                    {/* Classification tags — shown above response */}
                    {msg.classification && (
                      <div className="flex flex-wrap gap-1.5 px-4 pt-3 pb-2 border-b"
                        style={{ borderColor: "rgba(201,168,76,0.10)" }}>
                        {/* Case type */}
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                          style={{ background: "rgba(201,168,76,0.10)", color: "#A8893A" }}>
                          {caseTypeLabels[msg.classification.caseType] ?? msg.classification.caseType}
                        </span>
                        {/* Risk */}
                        {(() => {
                          const r = riskConfig[msg.classification.riskLevel];
                          return r ? (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                              style={{ background: r.bg, color: r.color }}>
                              {r.text}
                            </span>
                          ) : null;
                        })()}
                        {/* Urgency */}
                        {(() => {
                          const u = urgencyConfig[msg.classification.urgencyLevel];
                          return u && u.text !== "عادي" ? (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                              style={{ background: "rgba(217,119,6,0.08)", color: u.color }}>
                              {u.text}
                            </span>
                          ) : null;
                        })()}
                        {/* KB badge */}
                        {msg.kbUsed && (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1"
                            style={{ background: "rgba(22,163,74,0.08)", color: "#16a34a" }}>
                            <Database className="w-3 h-3" />
                            {msg.kbChunksCount} مادة
                          </span>
                        )}
                      </div>
                    )}

                    {/* Markdown content */}
                    <div className="px-4 py-3" dir="rtl" style={{ textAlign: "right" }}>
                      <MarkdownContent content={msg.content} />
                    </div>
                  </div>
                )}

                {/* Analysis accordion */}
                {msg.role === "assistant" && msg.analysis && (
                  <div className="w-full mt-1.5">
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

          {isLoading && <TypingIndicator />}

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-start gap-2 p-3 rounded-2xl mx-2"
              style={{
                background: "rgba(254,242,242,0.90)",
                border: "1px solid rgba(220,38,38,0.18)",
                backdropFilter: "blur(8px)",
              }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#dc2626" }} />
              <p className="text-xs" style={{ color: "#dc2626" }}>{error}</p>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0 px-4 py-4 border-t"
          style={{
            borderColor: "rgba(201,168,76,0.12)",
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(20px) saturate(160%)",
          }}>
          <div className="flex items-end gap-3 max-w-3xl mx-auto">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              placeholder="صف قضيتك... (Enter للإرسال، Shift+Enter لسطر جديد)"
              disabled={isLoading}
              rows={1}
              className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.80)",
                border: "1.5px solid rgba(201,168,76,0.20)",
                color: "#0F172A",
                minHeight: 44,
                maxHeight: 120,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
              onFocus={e => {
                e.target.style.borderColor = "rgba(201,168,76,0.50)";
                e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.08)";
              }}
              onBlur={e => {
                e.target.style.borderColor = "rgba(201,168,76,0.20)";
                e.target.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
              }}
            />
            <motion.button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              whileHover={!isLoading && input.trim() ? { scale: 1.04 } : {}}
              whileTap={!isLoading && input.trim() ? { scale: 0.96 } : {}}
              className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer"
              style={{
                background: isLoading || !input.trim()
                  ? "rgba(201,168,76,0.10)"
                  : "linear-gradient(135deg, #C9A84C, #A8893A)",
                color: isLoading || !input.trim() ? "#b0a070" : "#fff",
                boxShadow: !isLoading && input.trim()
                  ? "0 4px 14px rgba(201,168,76,0.30)"
                  : "none",
              }}>
              {isLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />}
            </motion.button>
          </div>
          <p className="text-center text-[10px] mt-2" style={{ color: "#94a3b8" }}>
            مسؤول للمحاماة — التحليل للاستئناس فقط ولا يغني عن مراجعة محامٍ مختص
          </p>
        </div>
      </div>
    </div>
  );
}
