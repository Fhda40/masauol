import { useState, useEffect, useRef, createContext, useContext, useCallback } from "react";
import { useSearchParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import SEO from "@/components/SEO";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send, Plus, Brain, MessageSquare, Scale, Shield,
  FileSearch, BookOpen, Zap, Target, Database,
  Loader2, ChevronDown, ChevronUp, AlertCircle,
  Phone, X, History, Paperclip, FileText, Sparkles,
  ArrowLeft,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import { useAuth, GoogleLoginButton } from "@/providers/AuthProvider";

/* ─── List type context ─── */
const ListTypeCtx = createContext<"ul" | "ol">("ul");

/* ─── Markdown ─── */
function MarkdownContent({ content }: { content: string }) {
  return (
    <div style={{ direction: "rtl", textAlign: "right" }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A", marginBottom: "0.5rem", marginTop: "1rem", lineHeight: 1.4, paddingBottom: "0.25rem", borderBottom: "1.5px solid rgba(201,168,76,0.20)" }}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.4rem", marginTop: "0.85rem", lineHeight: 1.4 }}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#A8893A", marginBottom: "0.3rem", marginTop: "0.75rem", lineHeight: 1.4, display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ display: "inline-block", width: "3px", height: "0.85rem", background: "linear-gradient(180deg, #C9A84C, #A8893A)", borderRadius: "2px", flexShrink: 0 }} />
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p style={{ fontSize: "0.875rem", lineHeight: 1.8, color: "#1e293b", marginBottom: "0.5rem" }}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ListTypeCtx.Provider value="ul">
              <ul style={{ paddingRight: "0.5rem", paddingLeft: 0, marginBottom: "0.5rem", marginTop: "0.2rem", listStyleType: "none" }}>
                {children}
              </ul>
            </ListTypeCtx.Provider>
          ),
          ol: ({ children }) => (
            <ListTypeCtx.Provider value="ol">
              <ol style={{ paddingRight: "1.2rem", paddingLeft: 0, marginBottom: "0.5rem", marginTop: "0.2rem", listStyleType: "decimal" }}>
                {children}
              </ol>
            </ListTypeCtx.Provider>
          ),
          li: ({ children }) => {
            const listType = useContext(ListTypeCtx);
            return (
              <li style={{ fontSize: "0.875rem", lineHeight: 1.75, color: "#1e293b", marginBottom: "0.25rem", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                {listType === "ul" && (
                  <span style={{ display: "inline-block", width: "5px", height: "5px", borderRadius: "50%", background: "#C9A84C", flexShrink: 0, marginTop: "0.58rem" }} />
                )}
                <span style={{ flex: 1 }}>{children}</span>
              </li>
            );
          },
          strong: ({ children }) => <strong style={{ fontWeight: 700, color: "#0F172A" }}>{children}</strong>,
          em: ({ children }) => <em style={{ color: "#64748b", fontStyle: "italic" }}>{children}</em>,
          hr: () => <hr style={{ border: "none", borderTop: "1px solid rgba(201,168,76,0.18)", margin: "0.75rem 0" }} />,
          blockquote: ({ children }) => (
            <blockquote style={{ borderRight: "3px solid #C9A84C", paddingRight: "0.85rem", margin: "0.6rem 0", color: "#475569", fontSize: "0.85rem", lineHeight: 1.7, background: "rgba(201,168,76,0.05)", borderRadius: "0 8px 8px 0", padding: "0.4rem 0.85rem" }}>
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => className?.includes("language-") ? (
            <code style={{ display: "block", background: "rgba(15,23,42,0.04)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: "8px", padding: "0.6rem 0.85rem", fontSize: "0.8rem", color: "#1e293b", margin: "0.5rem 0", overflowX: "auto", fontFamily: "monospace", whiteSpace: "pre-wrap", direction: "ltr", textAlign: "left" }}>
              {children}
            </code>
          ) : (
            <code style={{ background: "rgba(201,168,76,0.10)", borderRadius: "4px", padding: "1px 6px", fontSize: "0.8rem", color: "#A8893A", fontFamily: "monospace" }}>
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/* ─── Types ─── */
interface AnalysisData { [key: string]: string | boolean | number | string[] }
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
  low:      { text: "خطر منخفض", color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
  medium:   { text: "خطر متوسط", color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
  high:     { text: "خطر عالي",  color: "#d97706", bg: "rgba(217,119,6,0.08)" },
  critical: { text: "خطر حرج",  color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
};
const urgencyConfig: Record<string, { text: string; color: string }> = {
  low:    { text: "عادي",     color: "#64748b" },
  medium: { text: "متوسط",    color: "#3b82f6" },
  high:   { text: "عاجل",     color: "#d97706" },
  urgent: { text: "حرج جداً", color: "#dc2626" },
};
const caseTypeLabels: Record<string, string> = {
  enforcement: "تنفيذ / ديون", cybercrime: "جرائم إلكترونية", drugs: "مخدرات",
  labor: "عمالي", civil: "مدني", criminal: "جنائي",
  commercial: "تجاري", family: "أحوال شخصية", general: "استشارة عامة",
};
const SECTION_CONFIG: Record<string, { icon: React.ReactNode; label: string }> = {
  "فهم_الحالة":              { icon: <FileSearch className="w-3.5 h-3.5" />, label: "فهم الحالة" },
  "التكييف_القانوني":        { icon: <Scale className="w-3.5 h-3.5" />,      label: "التكييف القانوني" },
  "العناصر_النظامية":        { icon: <BookOpen className="w-3.5 h-3.5" />,   label: "المواد النظامية" },
  "نقاط_القوة":              { icon: <Shield className="w-3.5 h-3.5" />,     label: "نقاط القوة" },
  "نقاط_الضعف":              { icon: <Zap className="w-3.5 h-3.5" />,        label: "نقاط الضعف" },
  "المخاطر_القانونية":       { icon: <AlertCircle className="w-3.5 h-3.5" />,label: "المخاطر" },
  "السيناريوهات_المحتملة":   { icon: <Target className="w-3.5 h-3.5" />,     label: "السيناريوهات" },
  "الاستراتيجية_الموصى_بها": { icon: <Target className="w-3.5 h-3.5" />,     label: "الاستراتيجية" },
  "الإثباتات_المطلوبة":      { icon: <BookOpen className="w-3.5 h-3.5" />,   label: "الإثباتات" },
  "خطة_العمل":               { icon: <Target className="w-3.5 h-3.5" />,     label: "خطة العمل" },
  "رؤى_استراتيجية":          { icon: <Brain className="w-3.5 h-3.5" />,      label: "رؤى استراتيجية" },
  "التوجيه_الاحترافي":       { icon: <FileSearch className="w-3.5 h-3.5" />, label: "التوجيه" },
  "تحليل_الحكم":             { icon: <Scale className="w-3.5 h-3.5" />,      label: "تحليل الحكم" },
  "أخطاء_إجرائية":           { icon: <AlertCircle className="w-3.5 h-3.5" />,label: "أخطاء إجرائية" },
  "فرص_الطعن":               { icon: <Shield className="w-3.5 h-3.5" />,     label: "فرص الطعن" },
  "إجراءات_موصى_بها":        { icon: <Target className="w-3.5 h-3.5" />,     label: "إجراءات موصى بها" },
};
const QUICK_PROMPTS = [
  { text: "لديّ إيقاف خدمات، ما حقوقي؟",                    icon: <Scale className="w-4 h-4" /> },
  { text: "تم فصلي من العمل، ماذا أفعل؟",                    icon: <BookOpen className="w-4 h-4" /> },
  { text: "لديّ مطالبة مالية على شخص، ما الإجراء؟",          icon: <Target className="w-4 h-4" /> },
  { text: "هل محادثات الواتساب تعتبر دليلاً قانونياً؟",       icon: <Shield className="w-4 h-4" /> },
];

/* ─── Typing indicator ─── */
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="flex items-end gap-3 mb-4 px-1"
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)", boxShadow: "0 2px 8px rgba(201,168,76,0.30)" }}>
        <Scale className="w-4 h-4 text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tr-sm"
        style={{ background: "#ffffff", border: "1.5px solid rgba(201,168,76,0.22)", boxShadow: "0 4px 20px rgba(201,168,76,0.08)" }}>
        <div className="flex items-center gap-2.5" dir="rtl">
          <div className="flex gap-1.5 items-center">
            {[0, 1, 2].map(i => (
              <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: "#C9A84C" }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <span className="text-xs" style={{ color: "#94a3b8" }}>جارٍ تحليل الحالة قانونياً...</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Analysis card ─── */
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
    .sort((a, b) => Object.keys(SECTION_CONFIG).indexOf(a[0]) - Object.keys(SECTION_CONFIG).indexOf(b[0]));

  return (
    <div className="rounded-2xl overflow-hidden mt-2"
      style={{ background: "rgba(248,250,252,0.80)", border: "1px solid rgba(201,168,76,0.12)", backdropFilter: "blur(8px)" }}>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs transition-all cursor-pointer"
        style={{ color: "#64748b" }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,168,76,0.05)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <span className="flex items-center gap-1.5">
          <FileSearch className="w-3.5 h-3.5" style={{ color: "#C9A84C" }} />
          {expanded ? "إخفاء التحليل التفصيلي" : `التحليل التفصيلي — ${sections.length} قسم`}
        </span>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {sections.map(([key, value]) => {
                const cfg = SECTION_CONFIG[key];
                return (
                  <div key={key} className="p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.80)", border: "1px solid rgba(201,168,76,0.08)" }}>
                    <div className="flex items-center gap-2 mb-1.5" style={{ color: "#C9A84C" }}>
                      {cfg.icon}
                      <span className="text-xs font-semibold">{cfg.label}</span>
                    </div>
                    <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: "#475569" }}>
                      {value as string}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {leadTriggered && (
        <div className="mx-4 mb-4 p-3 rounded-xl flex items-center justify-between gap-3"
          style={{ background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.18)" }}>
          <div>
            <p className="text-xs font-semibold" style={{ color: "#A8893A" }}>قضيتك تستدعي متابعة فورية</p>
            <p className="text-[11px] mt-0.5" style={{ color: "#64748b" }}>ننصح بالتواصل مع محامٍ متخصص</p>
          </div>
          <a href="/contact"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer flex-shrink-0 transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)", color: "#fff" }}>
            <Phone className="w-3 h-3" />
            تواصل
          </a>
        </div>
      )}
    </div>
  );
}

/* ─── Main component ─── */
export default function AIAdvisor() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState(() => searchParams.get("q") ?? "");
  const [inputFocused, setInputFocused] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentConvId, setCurrentConvId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [attachedPdf, setAttachedPdf] = useState<File | null>(null);
  const [pdfExtracting, setPdfExtracting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoLoadedRef = useRef(false);
  const fingerprint = getDeviceFingerprint();

  const { data: conversations, refetch: refetchConvs } =
    trpc.conversation.list.useQuery({ deviceFingerprint: fingerprint }, { enabled: !!user });

  const { data: dbMessages } =
    trpc.message.list.useQuery({ conversationId: currentConvId! }, { enabled: currentConvId !== null });

  useEffect(() => {
    if (conversations?.length && currentConvId === null && !autoLoadedRef.current) {
      autoLoadedRef.current = true;
      setCurrentConvId(conversations[0].id);
    }
  }, [conversations]);

  useEffect(() => {
    if (dbMessages) {
      setMessages(dbMessages.map((m: any) => ({
        id: m.id, role: m.role, content: m.content, analysis: m.analysis,
        classification: m.analysis ? { caseType: m.analysis._case_type, riskLevel: m.analysis._risk_level, urgencyLevel: m.analysis._urgency_level } : null,
        kbUsed: m.analysis?._kb_retrieved, kbChunksCount: m.analysis?._kb_chunks_count,
      })));
    }
  }, [dbMessages]);

  useEffect(() => {
    if (messages.length === 0 && !isLoading) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isLoading]);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, []);

  const createConversation = trpc.conversation.create.useMutation();
  const chatMutation = trpc.chat.send.useMutation({
    onMutate: () => { setIsLoading(true); setError(null); },
    onSettled: () => setIsLoading(false),
    onSuccess: (data: any) => {
      setMessages(prev => [...prev, {
        id: Date.now(), role: "assistant", content: data.content ?? "",
        analysis: data.analysis, classification: data.classification,
        kbUsed: data.kbUsed, kbChunksCount: data.kbChunksCount, leadTriggered: data.leadTriggered,
      }]);
      refetchConvs();
    },
    onError: (err: any) => {
      const msg = err?.message ?? "";
      if (msg.includes("quota") || msg.includes("429") || msg.includes("rate limit") || msg.includes("capacity")) {
        setError("الخدمة مشغولة حالياً، حاول مرة أخرى بعد لحظات.");
      } else if (msg.includes("network") || msg.includes("fetch") || msg.includes("ECONNRESET")) {
        setError("تعذّر الاتصال بالمستشار. تحقق من الاتصال وأعد المحاولة.");
      } else {
        setError(msg || "حدث خطأ، أعد المحاولة.");
      }
    },
  });

  const handleSend = async () => {
    if ((input.trim().length < 10 && !attachedPdf) || isLoading) return;
    let text = input.trim();
    setInput("");
    setError(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    if (attachedPdf) {
      setPdfExtracting(true);
      try {
        const fd = new FormData();
        fd.append("pdf", attachedPdf);
        const res = await fetch("/api/pdf/extract", { method: "POST", body: fd });
        const data = await res.json() as { text?: string; pages?: number; filename?: string; error?: string };
        if (data.error) throw new Error(data.error);
        const pdfHeader = `[محتوى ملف PDF: ${attachedPdf.name} — ${data.pages} صفحة]\n${data.text}`;
        text = text ? `${text}\n\n${pdfHeader}` : pdfHeader;
      } catch (e: any) {
        setError(e.message || "تعذّر قراءة الملف");
        setPdfExtracting(false);
        return;
      } finally {
        setPdfExtracting(false);
        setAttachedPdf(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }

    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: text }]);

    let convId = currentConvId;
    if (!convId) {
      try {
        const conv = await createConversation.mutateAsync({ deviceFingerprint: fingerprint, title: text.slice(0, 60) });
        convId = conv.id;
        setCurrentConvId(conv.id);
        refetchConvs();
      } catch (err: any) {
        const msg = err?.message ?? "";
        setMessages(prev => prev.slice(0, -1));
        setError(msg.includes("استشارتك المجانية")
          ? "لقد استخدمت استشارتك المجانية. للمزيد، تواصل مع فريق مسؤول."
          : msg || "تعذر إنشاء المحادثة.");
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

  const canSend = ((input.trim().length >= 10 || !!attachedPdf)) && !isLoading && !pdfExtracting;

  /* ─── Auth loading ─── */
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-64px)]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
          <Scale className="w-6 h-6" style={{ color: "#C9A84C" }} />
        </motion.div>
      </div>
    );
  }

  /* ─── Login screen ─── */
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100dvh-64px)] px-4 py-12" dir="rtl">
        <SEO
          title="المستشار القانوني الذكي — مسؤول"
          description="احصل على تحليل قانوني أولي مبني على الأنظمة السعودية الرسمية."
          path="/ai-advisor"
        />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-sm">

          {/* Icon with pulse */}
          <div className="text-center mb-10">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-3xl animate-ping opacity-20"
                style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)" }} />
              <div className="relative w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)", boxShadow: "0 12px 40px rgba(201,168,76,0.35)" }}>
                <Scale className="w-9 h-9 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "#0F172A" }}>المستشار القانوني الذكي</h1>
            <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
              تحليل قانوني فوري مبني على الأنظمة السعودية
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: Shield, text: "سري تماماً" },
              { icon: Brain,  text: "تحليل ذكي" },
              { icon: BookOpen, text: "أنظمة سعودية" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(201,168,76,0.14)", backdropFilter: "blur(12px)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(201,168,76,0.10)" }}>
                  <Icon className="w-4.5 h-4.5" style={{ color: "#C9A84C" }} />
                </div>
                <span className="text-xs font-medium text-center" style={{ color: "#475569" }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="p-3.5 rounded-2xl mb-7 text-center"
            style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.16)" }}>
            <p className="text-xs" style={{ color: "#7a6030" }}>
              استشارة مجانية واحدة لكل حساب Google
            </p>
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
    <div className="flex h-[calc(100dvh-64px)] overflow-hidden" dir="rtl">
      <SEO
        title="المستشار القانوني الذكي — مسؤول"
        description="احصل على تحليل قانوني أولي مبني على الأنظمة السعودية الرسمية. اطرح سؤالك واحصل على تكييف قانوني وخطوات موصى بها."
        path="/ai-advisor"
      />

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 lg:hidden"
            style={{ background: "rgba(15,23,42,0.25)", backdropFilter: "blur(3px)" }}
            onClick={() => setShowSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            key="sidebar"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="flex-shrink-0 flex flex-col overflow-hidden border-l z-40 absolute lg:relative h-full"
            style={{
              width: 260, right: 0,
              borderColor: "rgba(201,168,76,0.12)",
              background: "rgba(255,255,255,0.94)",
              backdropFilter: "blur(24px) saturate(160%)",
              boxShadow: "-6px 0 32px rgba(0,0,0,0.07)",
            }}
          >
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b"
              style={{ borderColor: "rgba(201,168,76,0.10)" }}>
              <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#94a3b8" }}>المحادثات</span>
              <button onClick={() => setShowSidebar(false)}
                className="p-1.5 rounded-lg cursor-pointer transition-colors"
                style={{ color: "#94a3b8" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#0F172A")}
                onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* New chat */}
            <div className="px-3 pt-3">
              <button onClick={startNew}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all"
                style={{ background: "rgba(201,168,76,0.08)", color: "#A8893A", border: "1px solid rgba(201,168,76,0.18)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,168,76,0.15)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(201,168,76,0.08)")}>
                <Plus className="w-3.5 h-3.5" />
                محادثة جديدة
              </button>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1 mt-2">
              {conversations?.map((conv: any) => (
                <button key={conv.id}
                  onClick={() => { setCurrentConvId(conv.id); setMessages([]); setError(null); setShowSidebar(false); }}
                  className="w-full text-right px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                  style={{
                    background: currentConvId === conv.id ? "rgba(201,168,76,0.10)" : "transparent",
                    color: currentConvId === conv.id ? "#A8893A" : "#64748b",
                    border: `1px solid ${currentConvId === conv.id ? "rgba(201,168,76,0.20)" : "transparent"}`,
                  }}
                  onMouseEnter={e => { if (currentConvId !== conv.id) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.03)"; }}
                  onMouseLeave={e => { if (currentConvId !== conv.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                    <span className="truncate">{conv.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
          style={{
            borderColor: "rgba(201,168,76,0.10)",
            background: "rgba(255,255,255,0.90)",
            backdropFilter: "blur(20px) saturate(160%)",
          }}>
          <div className="flex items-center gap-3">
            {/* History toggle */}
            <button onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-xl transition-all cursor-pointer"
              style={{ color: showSidebar ? "#C9A84C" : "#94a3b8", background: showSidebar ? "rgba(201,168,76,0.08)" : "transparent" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.08)"; (e.currentTarget as HTMLElement).style.color = "#C9A84C"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = showSidebar ? "rgba(201,168,76,0.08)" : "transparent"; (e.currentTarget as HTMLElement).style.color = showSidebar ? "#C9A84C" : "#94a3b8"; }}
              title="المحادثات السابقة"
              aria-label="عرض المحادثات السابقة">
              <History className="w-4 h-4" />
            </button>

            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)", boxShadow: "0 2px 8px rgba(201,168,76,0.25)" }}>
                <Scale className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none mb-0.5" style={{ color: "#0F172A" }}>مسؤول</p>
                <p className="text-[10px] leading-none" style={{ color: "#94a3b8" }}>مستشار قانوني • أنظمة سعودية</p>
              </div>
            </div>
          </div>

          {/* New chat button */}
          <button onClick={startNew}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all"
            style={{ color: "#64748b", border: "1px solid rgba(201,168,76,0.18)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.08)"; (e.currentTarget as HTMLElement).style.color = "#A8893A"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.30)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#64748b"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.18)"; }}>
            <Plus className="w-3.5 h-3.5" />
            جديد
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto" style={{ background: "var(--bg-primary, #f8fafc)" }}>
          <div className="max-w-3xl mx-auto px-4 py-6">

            {/* Empty state */}
            {messages.length === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-center pt-6 pb-8"
              >
                {/* Icon */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-3xl blur-xl opacity-30"
                    style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)", transform: "scale(1.3)" }} />
                  <div className="relative w-18 h-18 w-[72px] h-[72px] rounded-3xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)", boxShadow: "0 12px 40px rgba(201,168,76,0.30)" }}>
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>

                <h2 className="text-xl font-bold mb-1.5" style={{ color: "#0F172A" }}>
                  مرحباً، {user.name.split(" ")[0]} 👋
                </h2>
                <p className="text-sm mb-10 max-w-xs leading-relaxed" style={{ color: "#64748b" }}>
                  صف قضيتك وسأحللها قانونياً بناءً على الأنظمة السعودية
                </p>

                {/* Quick prompts */}
                <div className="w-full max-w-md space-y-2">
                  {QUICK_PROMPTS.map((p, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.07 }}
                      onClick={() => { setInput(p.text); setTimeout(() => textareaRef.current?.focus(), 50); }}
                      className="w-full flex items-center gap-3 text-right px-4 py-3.5 rounded-2xl transition-all cursor-pointer group"
                      style={{
                        background: "rgba(255,255,255,0.80)",
                        border: "1px solid rgba(201,168,76,0.12)",
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.32)";
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,251,240,0.90)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(201,168,76,0.10)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.12)";
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.80)";
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                      }}
                    >
                      <span className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(201,168,76,0.10)", color: "#C9A84C" }}>
                        {p.icon}
                      </span>
                      <span className="flex-1 text-sm" style={{ color: "#475569" }}>{p.text}</span>
                      <ArrowLeft className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#C9A84C" }} />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages list */}
            <div className="space-y-5">
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: idx === messages.length - 1 ? 0 : 0 }}
                  className={`flex items-end gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
                    style={msg.role === "user"
                      ? { background: "rgba(201,168,76,0.10)", border: "1.5px solid rgba(201,168,76,0.22)" }
                      : { background: "linear-gradient(135deg, #C9A84C, #A8893A)", boxShadow: "0 2px 8px rgba(201,168,76,0.25)" }}>
                    {msg.role === "user"
                      ? (user.picture
                        ? <img src={user.picture} className="w-8 h-8 object-cover" alt={user.name} />
                        : <span className="text-xs font-bold" style={{ color: "#C9A84C" }}>{user.name[0]}</span>)
                      : <Scale className="w-4 h-4 text-white" />}
                  </div>

                  {/* Bubble */}
                  {msg.role === "user" ? (
                    /* User bubble — بيج دافئ مميّز */
                    <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,251,235,0.98), rgba(254,243,199,0.90))",
                        border: "1px solid rgba(201,168,76,0.28)",
                        color: "#1e293b",
                        boxShadow: "0 2px 12px rgba(201,168,76,0.12)",
                        direction: "rtl",
                        textAlign: "right",
                      }}>
                      {msg.content}
                    </div>
                  ) : (
                    /* AI bubble — أبيض نظيف بحدود ذهبية */
                    <div className="flex-1 min-w-0">
                      <div className="rounded-2xl rounded-tr-sm overflow-hidden"
                        style={{
                          background: "#ffffff",
                          border: "1.5px solid rgba(201,168,76,0.22)",
                          boxShadow: "0 4px 20px rgba(201,168,76,0.08), 0 1px 4px rgba(0,0,0,0.04)",
                        }}>

                        {/* Classification row */}
                        {msg.classification && (
                          <div className="flex flex-wrap gap-1.5 px-4 pt-3 pb-2.5 border-b"
                            style={{ borderColor: "rgba(201,168,76,0.08)" }}>
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                              style={{ background: "rgba(201,168,76,0.09)", color: "#A8893A" }}>
                              {caseTypeLabels[msg.classification.caseType] ?? msg.classification.caseType}
                            </span>
                            {(() => { const r = riskConfig[msg.classification.riskLevel]; return r ? <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: r.bg, color: r.color }}>{r.text}</span> : null; })()}
                            {(() => { const u = urgencyConfig[msg.classification.urgencyLevel]; return u && u.text !== "عادي" ? <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium" style={{ background: "rgba(217,119,6,0.07)", color: u.color }}>{u.text}</span> : null; })()}
                            {msg.kbUsed && (
                              <span className="text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1"
                                style={{ background: "rgba(22,163,74,0.07)", color: "#16a34a" }}>
                                <Database className="w-3 h-3" />
                                {msg.kbChunksCount} مادة
                              </span>
                            )}
                          </div>
                        )}

                        {/* Content */}
                        <div className="px-4 py-3.5" dir="rtl">
                          <MarkdownContent content={msg.content} />
                        </div>
                      </div>

                      {/* Analysis accordion */}
                      {msg.analysis && (
                        <AnalysisCard
                          analysis={msg.analysis}
                          classification={msg.classification}
                          kbUsed={msg.kbUsed}
                          kbChunksCount={msg.kbChunksCount}
                          leadTriggered={msg.leadTriggered}
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {isLoading && <TypingIndicator />}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-2.5 p-3.5 rounded-2xl"
                    style={{ background: "rgba(254,242,242,0.95)", border: "1px solid rgba(220,38,38,0.15)" }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#dc2626" }} />
                    <p className="text-xs leading-relaxed" style={{ color: "#dc2626" }}>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div ref={bottomRef} />
          </div>
        </div>

        {/* ─── Input area ─── */}
        <div className="flex-shrink-0 border-t px-4 pt-3 pb-4"
          style={{
            borderColor: "rgba(201,168,76,0.10)",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px) saturate(160%)",
          }}>
          <div className="max-w-3xl mx-auto">

            {/* Quick prompts chips — always visible when no loading */}
            <AnimatePresence>
              {!isLoading && messages.length < 6 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-wrap gap-2 mb-3"
                  dir="rtl"
                >
                  {QUICK_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(p.text); setTimeout(() => textareaRef.current?.focus(), 50); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer flex-shrink-0"
                      style={{
                        background: "rgba(201,168,76,0.07)",
                        border: "1px solid rgba(201,168,76,0.20)",
                        color: "#7a6030",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.14)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.40)";
                        (e.currentTarget as HTMLElement).style.color = "#A8893A";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.07)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.20)";
                        (e.currentTarget as HTMLElement).style.color = "#7a6030";
                      }}
                    >
                      <span className="flex-shrink-0" style={{ color: "#C9A84C" }}>{p.icon}</span>
                      <span className="truncate max-w-[180px] sm:max-w-none">{p.text}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input card */}
            <motion.div
              animate={{
                boxShadow: inputFocused
                  ? "0 0 0 3px rgba(201,168,76,0.14), 0 8px 32px rgba(0,0,0,0.08)"
                  : "0 2px 12px rgba(0,0,0,0.06)",
                borderColor: inputFocused ? "rgba(201,168,76,0.45)" : "rgba(201,168,76,0.20)",
              }}
              transition={{ duration: 0.18 }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.97)",
                border: "1.5px solid rgba(201,168,76,0.20)",
              }}
            >
              {/* PDF chip inside card */}
              <AnimatePresence>
                {attachedPdf && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 px-4 pt-3 pb-0">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl w-fit"
                        style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.22)" }}>
                        <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#C9A84C" }} />
                        <span className="text-xs font-medium truncate max-w-[180px]" style={{ color: "#A8893A" }}>
                          {attachedPdf.name}
                        </span>
                        <span className="text-[10px]" style={{ color: "#94a3b8" }}>
                          {(attachedPdf.size / 1024).toFixed(0)} KB
                        </span>
                        <button
                          onClick={() => { setAttachedPdf(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                          className="flex-shrink-0 cursor-pointer rounded-full transition-colors"
                          style={{ color: "#94a3b8" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "#dc2626")}
                          onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}
                          aria-label="إزالة الملف">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hidden file input */}
              <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 10 * 1024 * 1024) { setError("الملف كبير جداً — الحد الأقصى 10MB"); return; }
                  setAttachedPdf(f); setError(null);
                }}
              />

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => { setInput(e.target.value); resizeTextarea(); }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder={attachedPdf ? "اكتب سؤالك عن الملف المرفق..." : "صف قضيتك القانونية..."}
                disabled={isLoading || pdfExtracting}
                rows={1}
                dir="rtl"
                className="w-full resize-none outline-none bg-transparent text-sm leading-relaxed"
                style={{
                  padding: "14px 16px 8px",
                  minHeight: 52,
                  maxHeight: 180,
                  color: "#0F172A",
                  caretColor: "#C9A84C",
                }}
              />

              {/* Bottom toolbar */}
              <div className="flex items-center justify-between px-3 pb-3 pt-1">

                {/* Left: attach + hint */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || pdfExtracting}
                    title="إرفاق ملف PDF"
                    aria-label="إرفاق ملف PDF"
                    className="flex items-center justify-center w-8 h-8 rounded-xl cursor-pointer transition-all"
                    style={{ color: attachedPdf ? "#C9A84C" : "#94a3b8", background: attachedPdf ? "rgba(201,168,76,0.10)" : "transparent" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.09)"; (e.currentTarget as HTMLElement).style.color = "#C9A84C"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = attachedPdf ? "rgba(201,168,76,0.10)" : "transparent"; (e.currentTarget as HTMLElement).style.color = attachedPdf ? "#C9A84C" : "#94a3b8"; }}>
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <span className="text-[11px] hidden sm:block select-none" style={{ color: "#c4c4c4" }}>
                    Enter للإرسال • Shift+Enter لسطر جديد
                  </span>
                </div>

                {/* Right: char count + send */}
                <div className="flex items-center gap-2">
                  {input.length > 150 && (
                    <span className="text-[11px] tabular-nums" style={{ color: input.length > 800 ? "#d97706" : "#94a3b8" }}>
                      {input.length}
                    </span>
                  )}

                  <motion.button
                    onClick={handleSend}
                    disabled={!canSend}
                    whileHover={canSend ? { scale: 1.03 } : {}}
                    whileTap={canSend ? { scale: 0.96 } : {}}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all"
                    style={{
                      background: canSend ? "linear-gradient(135deg, #C9A84C, #A8893A)" : "rgba(201,168,76,0.08)",
                      color: canSend ? "#fff" : "#c0a860",
                      boxShadow: canSend ? "0 4px 16px rgba(201,168,76,0.28)" : "none",
                      cursor: canSend ? "pointer" : "not-allowed",
                    }}
                    aria-label="إرسال"
                  >
                    {(isLoading || pdfExtracting)
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />}
                    <span className="hidden sm:inline">
                      {(isLoading || pdfExtracting) ? "جاري التحليل..." : "إرسال"}
                    </span>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Disclaimer */}
            <p className="text-center text-[10px] mt-2 select-none" style={{ color: "#c4c4c4" }}>
              التحليل للاستئناس فقط ولا يغني عن مراجعة محامٍ مختص · مسؤول للمحاماة
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
