"""
Local FastEmbed HTTP server for Arabic legal text embeddings.
Model: sentence-transformers/paraphrase-multilingual-mpnet-base-v2 (768 dims)
Run via PM2 or: python3 embed-server.py
"""
import json
import sys
import warnings
warnings.filterwarnings("ignore")
from http.server import HTTPServer, BaseHTTPRequestHandler
from fastembed import TextEmbedding

PORT = 5555
MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

print("Loading embedding model {}...".format(MODEL), flush=True)
model = TextEmbedding(MODEL)
print("Model ready. Server on port {}".format(PORT), flush=True)


class EmbedHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # Suppress HTTP access logs

    def do_POST(self):
        if self.path == "/embed":
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            text = body.get("text", "")
            embedding = list(next(model.embed([text])))
            response = json.dumps({
                "embedding": embedding,
                "dims": len(embedding)
            }).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(response)))
            self.end_headers()
            self.wfile.write(response)
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"ok")
        else:
            self.send_response(404)
            self.end_headers()


print("Ready. Listening on http://localhost:{}".format(PORT), flush=True)
server = HTTPServer(("localhost", PORT), EmbedHandler)
server.serve_forever()
