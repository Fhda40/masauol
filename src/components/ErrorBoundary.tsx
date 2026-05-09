import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        dir="rtl"
        style={{
          minHeight: "100vh",
          background: "var(--bg-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: "100%",
            textAlign: "center",
            padding: "3rem 2rem",
            borderRadius: "2rem",
            background: "rgba(255,255,255,0.80)",
            border: "1px solid rgba(201,168,76,0.15)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "1.25rem",
              background: "rgba(240,68,56,0.08)",
              border: "1px solid rgba(240,68,56,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <AlertTriangle style={{ width: 28, height: 28, color: "#F04438" }} />
          </div>

          <h1
            style={{
              fontFamily: "'EB Garamond', serif",
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "0.75rem",
            }}
          >
            حدث خطأ غير متوقع
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "2rem", lineHeight: 1.7 }}>
            حدث عطل في هذه الصفحة. يمكنك إعادة التحميل أو العودة للرئيسية.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.875rem",
                background: "linear-gradient(135deg, #C9A84C, #A8893A)",
                color: "#0A0A0A",
                fontWeight: 600,
                fontSize: "0.875rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              <RefreshCw style={{ width: 16, height: 16 }} />
              إعادة التحميل
            </button>
            <a
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.875rem",
                background: "transparent",
                border: "1px solid rgba(201,168,76,0.3)",
                color: "var(--text-secondary)",
                fontWeight: 600,
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              <Home style={{ width: 16, height: 16 }} />
              الرئيسية
            </a>
          </div>
        </div>
      </div>
    );
  }
}
