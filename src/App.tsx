import { useLocation, Routes, Route } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import AIAdvisor from "./pages/AIAdvisor";
import CaseReview from "./pages/CaseReview";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/ai-advisor" element={<AIAdvisor />} />
          <Route path="/case-review" element={<CaseReview />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Layout>
      <AnimatedRoutes />
    </Layout>
  );
}
