import { Routes, Route } from "react-router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import AIAdvisor from "./pages/AIAdvisor";
import CaseReview from "./pages/CaseReview";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ai-advisor" element={<AIAdvisor />} />
        <Route path="/case-review" element={<CaseReview />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Layout>
  );
}
