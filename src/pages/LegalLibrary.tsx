import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Search, ChevronDown, ChevronUp, Scale,
  Shield, Briefcase, Gavel, Lock, FileText, Heart,
  Building, AlertTriangle, Brain, X,
} from "lucide-react";
import { trpc } from "@/providers/trpc";

const CATEGORY_META: Record<string, { label: string; color: string; Icon: typeof Shield }> = {
  cybercrime:  { label: "جرائم معلوماتية", color: "#4EA8DE", Icon: Shield },
  labor:       { label: "العمل",           color: "#C9A84C", Icon: Briefcase },
  enforcement: { label: "التنفيذ",         color: "#17B26A", Icon: Gavel },
  drugs:       { label: "المخدرات",        color: "#E74C3C", Icon: AlertTriangle },
  family:      { label: "الأحوال الشخصية", color: "#9B59B6", Icon: Heart },
  commercial:  { label: "الشركات",         color: "#F39C12", Icon: Building },
  criminal:    { label: "الجزائي",         color: "#E67E22", Icon: Lock },
  civil:       { label: "المدني",          color: "#1ABC9C", Icon: FileText },
};

const LAW_ICONS: Record<string, typeof Shield> = {
  cybercrime: Shield,
  labor: Briefcase,
  enforcement: Gavel,
  drugs: AlertTriangle,
  family: Heart,
  commercial: Building,
  criminal: Lock,
  civil: FileText,
};

function ArticleCard({ article }: { article: { id: number; articleNumber: string; articleText: string; chapter: string; tags: unknown } }) {
  const [open, setOpen] = useState(false);
  const tags = (article.tags as string[]) || [];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.78)",
        border: "1px solid rgba(201,168,76,0.10)",
        transition: "all 0.25s ease",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.border = "1px solid rgba(201,168,76,0.25)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.border = "1px solid rgba(201,168,76,0.10)";
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 text-right cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0"
            style={{ background: "rgba(201,168,76,0.10)", color: "#C9A84C" }}
          >
            {article.articleNumber}
          </span>
          <span
            className="text-sm font-medium truncate"
            style={{ color: "var(--text-secondary)" }}
          >
            {article.articleText.slice(0, 80)}…
          </span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-faint)" }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-faint)" }} />
        }
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 pb-4">
              <div className="h-px mb-4" style={{ background: "rgba(201,168,76,0.10)" }} />
              {article.chapter && (
                <p className="text-[11px] font-semibold mb-3 tracking-wider uppercase"
                  style={{ color: "var(--text-faint)" }}>
                  {article.chapter}
                </p>
              )}
              <p className="text-sm leading-loose" style={{ color: "var(--text-muted)" }}>
                {article.articleText}
              </p>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {tags.map((tag, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(201,168,76,0.08)", color: "#A8893A" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LegalLibrary() {
  const [selectedLaw, setSelectedLaw] = useState<string | null>(null);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: laws, isLoading: lawsLoading } = trpc.legal.listLawsWithMeta.useQuery();
  const { data: articles, isLoading: articlesLoading } = trpc.legal.getByLaw.useQuery(
    { lawName: selectedLaw! },
    { enabled: !!selectedLaw }
  );
  const { data: searchResults, isLoading: searchLoading } = trpc.legal.searchArticles.useQuery(
    { query: search, category: selectedCat ?? undefined, limit: 30 },
    { enabled: search.length >= 2 }
  );

  const filteredLaws = useMemo(() => {
    if (!laws) return [];
    if (!selectedCat) return laws;
    return laws.filter(l => l.category === selectedCat);
  }, [laws, selectedCat]);

  const displayedArticles = search.length >= 2 ? searchResults : articles;
  const isLoading = search.length >= 2 ? searchLoading : articlesLoading;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setSelectedLaw(null);
  }

  const cats = Object.entries(CATEGORY_META);

  return (
    <div dir="rtl" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}>

      {/* Header */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 60%)",
        }} />
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)" }}>
              <BookOpen className="w-7 h-7" style={{ color: "#C9A84C" }} />
            </div>
            <p className="text-xs font-bold tracking-[0.35em] uppercase mb-4" style={{ color: "var(--accent-gold)" }}>
              مرجع قانوني
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold mb-5" style={{ fontFamily: "'EB Garamond', serif" }}>
              مكتبة الأنظمة القانونية
            </h1>
            <p className="text-base max-w-2xl mx-auto mb-8" style={{ color: "var(--text-muted)" }}>
              تصفّح ٨ أنظمة سعودية رسمية بأكثر من ٢٥٠ مادة قانونية. ابحث عن أي مادة أو تصفّح حسب النظام.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex items-center gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-faint)" }} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="ابحث في المواد... (مثال: ابتزاز، فصل تعسفي)"
                  style={{
                    width: "100%",
                    padding: "14px 44px 14px 48px",
                    borderRadius: "1rem",
                    background: "rgba(255,255,255,0.85)",
                    border: "1px solid rgba(201,168,76,0.20)",
                    fontSize: "14px",
                    color: "var(--text-primary)",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
                {searchInput && (
                  <button type="button" onClick={() => { setSearchInput(""); setSearch(""); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer">
                    <X className="w-4 h-4" style={{ color: "var(--text-faint)" }} />
                  </button>
                )}
              </div>
              <button type="submit"
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-semibold text-sm cursor-pointer flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #C9A84C, #A8893A)", color: "#0A0A0A" }}>
                <Search className="w-4 h-4" />
                بحث
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-6">

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <button
              onClick={() => { setSelectedCat(null); setSelectedLaw(null); setSearch(""); setSearchInput(""); }}
              className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all"
              style={{
                background: !selectedCat ? "linear-gradient(135deg, #C9A84C, #A8893A)" : "rgba(255,255,255,0.75)",
                color: !selectedCat ? "#0A0A0A" : "var(--text-muted)",
                border: !selectedCat ? "none" : "1px solid rgba(201,168,76,0.15)",
              }}>
              الكل
            </button>
            {cats.map(([cat, meta]) => (
              <button key={cat}
                onClick={() => { setSelectedCat(cat === selectedCat ? null : cat); setSelectedLaw(null); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all"
                style={{
                  background: selectedCat === cat ? `${meta.color}18` : "rgba(255,255,255,0.75)",
                  color: selectedCat === cat ? meta.color : "var(--text-muted)",
                  border: selectedCat === cat ? `1px solid ${meta.color}40` : "1px solid rgba(201,168,76,0.12)",
                }}>
                <meta.Icon className="w-3.5 h-3.5" />
                {meta.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Laws sidebar */}
            <div className="lg:col-span-1">
              <h2 className="text-sm font-bold mb-4 tracking-wider uppercase" style={{ color: "var(--text-faint)" }}>
                الأنظمة ({filteredLaws.length})
              </h2>
              <div className="space-y-3">
                {lawsLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-20 rounded-2xl animate-pulse"
                      style={{ background: "rgba(201,168,76,0.06)" }} />
                  ))
                  : filteredLaws.map((law) => {
                    const meta = CATEGORY_META[law.category] ?? { label: law.category, color: "#C9A84C", Icon: BookOpen };
                    const Icon = LAW_ICONS[law.category] ?? BookOpen;
                    const isActive = selectedLaw === law.lawName;

                    return (
                      <motion.button
                        key={law.lawName}
                        onClick={() => { setSelectedLaw(law.lawName); setSearch(""); setSearchInput(""); }}
                        whileHover={{ x: -3 }}
                        className="w-full text-right p-4 rounded-2xl cursor-pointer flex items-start gap-3 transition-all"
                        style={{
                          background: isActive ? `${meta.color}10` : "rgba(255,255,255,0.75)",
                          border: isActive ? `1px solid ${meta.color}35` : "1px solid rgba(201,168,76,0.10)",
                          boxShadow: isActive ? `0 4px 20px ${meta.color}14` : "none",
                        }}
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}25` }}>
                          <Icon className="w-4 h-4" style={{ color: meta.color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-snug mb-1"
                            style={{ color: isActive ? meta.color : "var(--text-primary)" }}>
                            {law.nameAr ?? law.lawName}
                          </p>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>
                              {law.count} مادة
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full"
                              style={{ background: `${meta.color}12`, color: meta.color }}>
                              {meta.label}
                            </span>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
              </div>
            </div>

            {/* Articles panel */}
            <div className="lg:col-span-2">
              {!selectedLaw && search.length < 2 ? (
                <div className="rounded-3xl p-12 text-center"
                  style={{ background: "rgba(255,255,255,0.60)", border: "1px solid rgba(201,168,76,0.10)" }}>
                  <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: "rgba(201,168,76,0.35)" }} />
                  <p className="text-lg font-semibold mb-2" style={{ fontFamily: "'EB Garamond', serif", color: "var(--text-primary)" }}>
                    اختر نظاماً أو ابحث
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    اضغط على أي نظام من القائمة لعرض مواده، أو استخدم البحث للعثور على مادة محددة
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    {[
                      { label: "نظام قانوني", value: "٨" },
                      { label: "مادة قانونية", value: "+٢٥٠" },
                      { label: "تغطية شاملة", value: "١٠٠٪" },
                    ].map((s, i) => (
                      <div key={i} className="p-4 rounded-2xl"
                        style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.10)" }}>
                        <p className="text-2xl font-bold mb-1" style={{
                          fontFamily: "'EB Garamond', serif",
                          background: "linear-gradient(135deg, #C9A84C, #F0D78A)",
                          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        }}>{s.value}</p>
                        <p className="text-xs" style={{ color: "var(--text-faint)" }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold" style={{ fontFamily: "'EB Garamond', serif" }}>
                      {search.length >= 2
                        ? `نتائج البحث عن "${search}"`
                        : selectedLaw}
                    </h2>
                    <span className="text-xs px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(201,168,76,0.10)", color: "#C9A84C" }}>
                      {isLoading ? "..." : `${displayedArticles?.length ?? 0} مادة`}
                    </span>
                  </div>

                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-14 rounded-2xl animate-pulse"
                          style={{ background: "rgba(201,168,76,0.06)" }} />
                      ))}
                    </div>
                  ) : displayedArticles?.length === 0 ? (
                    <div className="rounded-2xl p-8 text-center"
                      style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(201,168,76,0.10)" }}>
                      <Brain className="w-8 h-8 mx-auto mb-3" style={{ color: "rgba(201,168,76,0.4)" }} />
                      <p style={{ color: "var(--text-muted)" }}>لا توجد مواد مطابقة. جرّب كلمة أخرى.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {displayedArticles?.map(article => (
                        <ArticleCard key={article.id} article={article} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
