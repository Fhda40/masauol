import nodemailer from "nodemailer";
import { env } from "./env";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: env.smtpUser, pass: env.smtpPass },
});

const riskAr: Record<string, string> = {
  low: "منخفضة", medium: "متوسطة", high: "عالية", critical: "حرجة 🔴",
};
const urgencyAr: Record<string, string> = {
  low: "عادي", medium: "متوسطة", high: "عاجلة", urgent: "حرجة ⚡",
};

export async function sendLeadNotification(lead: {
  id: number;
  caseType: string;
  issueSummary: string;
  riskLevel: string;
  urgencyLevel: string;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  createdAt: Date;
}) {
  const subject = `📩 طلب جديد من ${lead.contactName || "عميل"} — ${lead.caseType}`;

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; direction: rtl; }
  .card { background: #fff; border-radius: 16px; max-width: 560px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #171717, #374151); padding: 28px 32px; }
  .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; }
  .header p { color: rgba(255,255,255,0.6); margin: 6px 0 0; font-size: 13px; }
  .body { padding: 28px 32px; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-bottom: 20px; }
  .badge-urgent { background: #fef2f2; color: #dc2626; }
  .badge-high { background: #fff7ed; color: #ea580c; }
  .badge-medium { background: #eff6ff; color: #2563eb; }
  .badge-low { background: #f0fdf4; color: #16a34a; }
  .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
  .row:last-of-type { border-bottom: none; }
  .label { color: #888; }
  .value { color: #111; font-weight: 500; text-align: left; }
  .summary-box { background: #fafafa; border-radius: 10px; padding: 16px; margin: 16px 0; font-size: 14px; color: #333; line-height: 1.7; }
  .btn { display: block; text-align: center; background: #171717; color: #fff; padding: 14px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600; margin-top: 20px; }
  .footer { background: #fafafa; padding: 16px 32px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #f0f0f0; }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <h1>📩 طلب جديد — مسؤول للمحاماة</h1>
    <p>${new Date(lead.createdAt).toLocaleString("ar-SA", { dateStyle: "full", timeStyle: "short" })}</p>
  </div>
  <div class="body">
    <span class="badge badge-${lead.urgencyLevel}">الأولوية: ${urgencyAr[lead.urgencyLevel] ?? lead.urgencyLevel}</span>

    <div class="row"><span class="label">الاسم</span><span class="value">${lead.contactName || "—"}</span></div>
    <div class="row"><span class="label">الجوال</span><span class="value" dir="ltr">${lead.contactPhone || "—"}</span></div>
    <div class="row"><span class="label">البريد</span><span class="value" dir="ltr">${lead.contactEmail || "—"}</span></div>
    <div class="row"><span class="label">نوع القضية</span><span class="value">${lead.caseType}</span></div>
    <div class="row"><span class="label">مستوى الخطر</span><span class="value">${riskAr[lead.riskLevel] ?? lead.riskLevel}</span></div>

    <div class="summary-box">
      <strong>ملخص القضية:</strong><br>${lead.issueSummary}
    </div>

    <a href="https://76.13.144.170/admin" class="btn">فتح لوحة التحكم ←</a>
  </div>
  <div class="footer">مسؤول للمحاماة — هذا الإشعار تلقائي</div>
</div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"مسؤول للمحاماة" <${env.smtpUser}>`,
    to: env.notificationEmail,
    subject,
    html,
  });
}
