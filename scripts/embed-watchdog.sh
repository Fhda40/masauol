#!/bin/bash
# Watchdog: يراقب embed-legal.ts ويعيد تشغيله تلقائياً عند التوقف أو اكتمال الـ quota

SCRIPT_DIR="/root/masauol_new"
LOG="/tmp/embed-legal.log"
GEMINI_API_KEY="AIzaSyBCh3QwRIMl3-j-Uwyn-zA55Z89t2K9it0"
CACHE="$SCRIPT_DIR/api/legal-systems/embeddings-cache.json"
CHUNKS="$SCRIPT_DIR/api/legal-systems/extracted-temp/legal-rag-masaoul/output/chunks.json"

check_done() {
  python3 -c "
import json
try:
    total = len(json.load(open('$CHUNKS')))
    done  = len(json.load(open('$CACHE')))
    print('done' if done >= total else 'pending')
except:
    print('pending')
" 2>/dev/null
}

echo "[watchdog] بدأ — $(date)" | tee -a "$LOG"

while true; do
  # تحقق إذا اكتملت الـ embeddings
  if [ "$(check_done)" = "done" ]; then
    echo "[watchdog] ✅ اكتملت جميع الـ embeddings — $(date)" | tee -a "$LOG"
    break
  fi

  # تحقق إذا البروسس شغال
  if ! pgrep -f "embed-legal.ts" > /dev/null; then
    echo "[watchdog] ⚡ البروسس متوقف — يعيد التشغيل — $(date)" | tee -a "$LOG"
    cd "$SCRIPT_DIR" && GEMINI_API_KEY="$GEMINI_API_KEY" npx tsx api/scripts/embed-legal.ts >> "$LOG" 2>&1 &
    sleep 30  # انتظر قبل التحقق مجدداً
  else
    sleep 60  # تحقق كل دقيقة
  fi
done

echo "[watchdog] انتهى — $(date)" | tee -a "$LOG"
