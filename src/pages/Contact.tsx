import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone, Mail, MapPin, Clock, Send, MessageSquare,
  CheckCircle2, ArrowLeft,
} from "lucide-react";
import { Link } from "react-router";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import GlowCard from "@/components/GlowCard";
import MagneticButton from "@/components/MagneticButton";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.6, type: "spring", stiffness: 150 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-[#17B26A]/20 to-[#17B26A]/5 border border-[#17B26A]/20 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-8 h-8 text-[#17B26A]" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-3">تم إرسال رسالتك</h2>
          <p className="text-sm text-white/50 leading-relaxed mb-8">
            شكراً لتواصلك معنا. سنقوم بالرد عليك في أقرب وقت ممكن.
          </p>
          <MagneticButton
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c9a84c] to-[#a88a3a] text-black font-semibold text-sm rounded-sm"
            strength={0.15}
          >
            <Link to="/" className="contents">
              <ArrowLeft className="w-4 h-4" />
              العودة للرئيسية
            </Link>
          </MagneticButton>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-[#c9a84c]/5 rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs font-mono-ar text-[#c9a84c] tracking-widest uppercase mb-4 block"
            >
              تواصل معنا
            </motion.span>
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
              نحن هنا <span className="text-gradient">للمساعدة</span>
            </h1>
            <p className="text-sm text-white/40 max-w-md mx-auto">
              فريقنا جاهز للإجابة على استفساراتك — سواء كانت قانونية أو تقنية
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="lg:col-span-2 space-y-6"
          >
            <GlowCard glowColor="#c9a84c" intensity={0.2} delay={0}>
              <div className="p-6">
                <h3 className="text-sm font-semibold text-white mb-6">معلومات التواصل</h3>
                <div className="space-y-5">
                  {[
                    { icon: <MapPin className="w-4 h-4" />, label: "العنوان", value: "الرياض، المملكة العربية السعودية" },
                    { icon: <Phone className="w-4 h-4" />, label: "الهاتف", value: "9200XXXXX" },
                    { icon: <Mail className="w-4 h-4" />, label: "البريد", value: "info@masoul-law.sa" },
                    { icon: <Clock className="w-4 h-4" />, label: "ساعات العمل", value: "السبت — الخميس: ٩ ص — ٦ م" },
                  ].map((item) => (
                    <motion.div
                      key={item.label}
                      whileHover={{ x: -3 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="flex items-start gap-3"
                    >
                      <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className="w-9 h-9 rounded-sm bg-[#c9a84c]/10 flex items-center justify-center text-[#c9a84c] flex-shrink-0"
                      >
                        {item.icon}
                      </motion.div>
                      <div>
                        <div className="text-[10px] font-mono-ar text-white/30 uppercase mb-0.5">{item.label}</div>
                        <div className="text-sm text-white/70">{item.value}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </GlowCard>

            {/* Quick link to AI */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/ai-advisor"
                className="glass-card p-6 flex items-center gap-4 border-[#4EA8DE]/20 hover:border-[#4EA8DE]/40 transition-all duration-300 block"
              >
                <div className="w-10 h-10 rounded-sm bg-[#4EA8DE]/10 flex items-center justify-center text-[#4EA8DE]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">تحليل فوري</h4>
                  <p className="text-xs text-white/40">جرّب المستشار القانوني الذكي</p>
                </div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="lg:col-span-3"
          >
            <GlowCard glowColor="#4EA8DE" intensity={0.25} delay={0.1}>
              <div className="p-6 sm:p-8">
                <h3 className="text-sm font-semibold text-white mb-6">أرسل رسالة</h3>
                <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/60 mb-2">الاسم *</label>
                      <Input placeholder="الاسم الكريم" className="bg-white/5 border-white/10 text-white text-right placeholder:text-white/20 focus:border-[#c9a84c]/30 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/60 mb-2">البريد الإلكتروني *</label>
                      <Input placeholder="email@example.com" dir="ltr" className="bg-white/5 border-white/10 text-white text-right placeholder:text-white/20 focus:border-[#c9a84c]/30 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-2">الموضوع</label>
                    <Input placeholder="موضوع الرسالة" className="bg-white/5 border-white/10 text-white text-right placeholder:text-white/20 focus:border-[#c9a84c]/30 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-2">الرسالة *</label>
                    <Textarea placeholder="اكتب رسالتك هنا..." rows={5} className="bg-white/5 border-white/10 text-white text-right placeholder:text-white/20 resize-none focus:border-[#c9a84c]/30 transition-colors" />
                  </div>
                  <Button type="submit" className="w-full h-11 bg-gradient-to-r from-[#c9a84c] to-[#a88a3a] hover:opacity-90 hover:shadow-lg hover:shadow-[#c9a84c]/20 text-black font-semibold rounded-sm transition-all duration-300">
                    <Send className="w-4 h-4 ml-2" />
                    إرسال الرسالة
                  </Button>
                </form>
              </div>
            </GlowCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
