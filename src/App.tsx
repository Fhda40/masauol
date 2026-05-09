import { lazy, Suspense, useEffect } from "react";
import { useLocation, Routes, Route } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";

/* ── Lazy-loaded pages (code splitting) ── */
const Home          = lazy(() => import("./pages/Home"));
const AIAdvisor     = lazy(() => import("./pages/AIAdvisor"));
const CaseReview    = lazy(() => import("./pages/CaseReview"));
const Services      = lazy(() => import("./pages/Services"));
const About         = lazy(() => import("./pages/About"));
const Contact       = lazy(() => import("./pages/Contact"));
const Admin         = lazy(() => import("./pages/Admin"));
const NotFound      = lazy(() => import("./pages/NotFound"));
const FAQ           = lazy(() => import("./pages/FAQ"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const LegalLibrary  = lazy(() => import("./pages/LegalLibrary"));

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
};

function PageLoader() {
  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        border: "3px solid rgba(201,168,76,0.15)",
        borderTopColor: "#C9A84C",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path="/"              element={<Home />} />
            <Route path="/ai-advisor"   element={<AIAdvisor />} />
            <Route path="/case-review"  element={<CaseReview />} />
            <Route path="/services"     element={<Services />} />
            <Route path="/about"        element={<About />} />
            <Route path="/contact"      element={<Contact />} />
            <Route path="/admin"        element={<Admin />} />
            <Route path="/faq"          element={<FAQ />} />
            <Route path="/privacy"      element={<PrivacyPolicy />} />
            <Route path="/terms"        element={<TermsOfService />} />
            <Route path="/legal-library" element={<LegalLibrary />} />
            <Route path="*"             element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  /* Mirror backdrop-filter → -webkit-backdrop-filter for Safari/iOS */
  useEffect(() => {
    const apply = (root: Document | Element = document) => {
      (root === document ? document.querySelectorAll('[style]') : (root as Element).querySelectorAll('[style]'))
        .forEach(el => {
          const s = (el as HTMLElement).style;
          if (s.backdropFilter && s.webkitBackdropFilter !== s.backdropFilter) {
            s.webkitBackdropFilter = s.backdropFilter;
          }
        });
    };

    apply();

    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if (m.type === "attributes") {
          const s = (m.target as HTMLElement).style;
          if (s?.backdropFilter && s.webkitBackdropFilter !== s.backdropFilter) {
            s.webkitBackdropFilter = s.backdropFilter;
          }
        } else {
          m.addedNodes.forEach(n => { if (n.nodeType === 1) apply(n as Element); });
        }
      });
    });

    observer.observe(document.body, {
      childList: true, subtree: true,
      attributes: true, attributeFilter: ["style"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <ErrorBoundary>
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </ErrorBoundary>
  );
}
