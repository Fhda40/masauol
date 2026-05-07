# دليل نشر مشروع مسؤول للمحاماة على VPS

## المتطلبات
- Ubuntu 22.04 LTS (أو أي توزيعة Linux)
- Node.js 20.x
- PM2 (لإدارة العمليات)
- Nginx ( reverse proxy )
- MySQL قاعدة بيانات متصلة

## الخطوة 1: تثبيت المتطلبات

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# تثبيت PM2
sudo npm install -g pm2

# تثبيت Nginx
sudo apt install -y nginx

# إنشاء مجلد المشروع
sudo mkdir -p /opt/masoul-law
sudo chown -R $USER:$USER /opt/masoul-law
```

## الخطوة 2: نقل الملفات

```bash
# على جهازك المحلي، ضغط المشروع
cd /mnt/agents/output/app
tar -czf masoul-law.tar.gz \
  dist/ \
  api/ \
  db/ \
  public/ \
  package.json \
  package-lock.json \
  drizzle.config.ts \
  pm2.config.cjs \
  .env

# نقل للسيرفر
scp masoul-law.tar.gz user@your-vps-ip:/opt/masoul-law/

# على السيرفر
ssh user@your-vps-ip
cd /opt/masoul-law
tar -xzf masoul-law.tar.gz
```

## الخطوة 3: تثبيت الحزم

```bash
cd /opt/masoul-law
npm ci --production
```

## الخطوة 4: ضبط المتغيرات البيئية

```bash
# تحرير ملف .env
nano /opt/masoul-law/.env
```

تأكد من وجود هذه المتغيرات:
```
DATABASE_URL=mysql://user:pass@host:port/dbname
OPENAI_API_KEY=sk-...
NODE_ENV=production
PORT=3000
```

## الخطوة 5: تشغيل قاعدة البيانات

```bash
# تشغيل migrations
npx drizzle-kit migrate

# (اختياري) إعادة تعبئة قاعدة المعرفة
npx tsx db/seed-legal.ts
```

## الخطوة 6: تشغيل التطبيق مع PM2

```bash
# بدء التطبيق
pm2 start pm2.config.cjs

# حفظ إعدادات PM2
pm2 save

# إعداد PM2 للبدء مع النظام
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

## الخطوة 7: إعداد Nginx

```bash
sudo nano /etc/nginx/sites-available/masoul-law
```

أضف هذا المحتوى:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

تفعيل الإعداد:
```bash
sudo ln -s /etc/nginx/sites-available/masoul-law /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## الخطوة 8: SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## الخطوة 9: فتح جدار النار

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## أمر التحديث

```bash
cd /opt/masoul-law
npm run build
pm2 restart masoul-law-app
```

## الأوامر المفيدة

```bash
# مراقبة السجلات
pm2 logs masoul-law-app

# إعادة التشغيل
pm2 restart masoul-law-app

# إيقاف التطبيق
pm2 stop masoul-law-app

# حالة التطبيق
pm2 status

# استخدام الموارد
pm2 monit
```

## ملاحظات أمان مهمة

1. **لا تنشر ملف `.env` على GitHub**
2. **استخدم SSL (HTTPS)**
3. **أغلق المنفذ 3000 في جدار النار (خلي Nginx يتعامل معه)**
4. **حدث الـ OpenAI API Key بشكل دوري**
5. **سجل backups لقاعدة البيانات**
