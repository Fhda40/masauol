import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, Sparkles, Shield } from "lucide-react";

export default function DocumentUploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      simulateAnalysis();
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      simulateAnalysis();
    }
  }, []);

  const simulateAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysis(
        "تم تحليل المستند. يتضمن إشارات إلى نظام التنفيذ السعودي (المادة ٩) وحقوق الدائن. نوصي بمراجعة قانونية مفصلة."
      );
    }, 2500);
  };

  const clearFile = () => {
    setFile(null);
    setAnalysis(null);
    setIsAnalyzing(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
        onChange={handleFileSelect}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onDragEnter={handleDragEnter}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className="relative cursor-pointer rounded-xl p-8 text-center transition-all duration-300"
            style={{
              backgroundColor: isDragging ? "#fafafa" : "var(--bg-secondary)",
              border: isDragging
                ? "2px dashed #171717"
                : "2px dashed var(--border-default)",
            }}
          >
            <motion.div
              animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-secondary)" }}
            >
              <Upload className="w-6 h-6" />
            </motion.div>

            <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              اسحب المستند هنا أو اضغط للاختيار
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              PDF, Word, صورة — حتى 10 ميجابايت
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="file"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-xl p-6"
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
            }}
          >
            {/* File info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "var(--bg-hover)", color: "var(--text-secondary)" }}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{file.name}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={clearFile}
                className="p-2 rounded-lg"
                style={{ color: "var(--text-tertiary)", backgroundColor: "var(--bg-primary)" }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Analyzing state */}
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-4 rounded-lg"
                style={{ backgroundColor: "rgba(23,23,23,0.03)" }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                </motion.div>
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  جاري تحليل المستند بالذكاء الاصطناعي...
                </span>
                {/* Progress bar */}
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-light)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: "#171717" }}
                    initial={{ width: "0%" }}
                    animate={{ width: ["0%", "30%", "60%", "90%", "100%"] }}
                    transition={{ duration: 2.5, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            )}

            {/* Analysis result */}
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-light)",
                  borderRightWidth: "2px",
                  borderRightColor: "#171717",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
                  <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>نتيجة التحليل</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{analysis}</p>
                <div className="mt-4">
                  <button
                    onClick={clearFile}
                    className="text-xs px-4 py-2 rounded-full transition-all"
                    style={{
                      backgroundColor: "#171717",
                      color: "#ffffff",
                    }}
                  >
                    تحليل مستند آخر
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
