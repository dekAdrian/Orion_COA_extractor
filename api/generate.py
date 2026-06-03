import json, base64, os, tempfile
from http.server import BaseHTTPRequestHandler
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body   = json.loads(self.rfile.read(length))
        fmt    = body.get("format", "xlsx")   # xlsx | ods | pdf
        data   = body.get("data", {})

        try:
            from lib.generator import generate_xlsx, generate_ods, generate_pdf

            with tempfile.NamedTemporaryFile(
                suffix=f".{fmt}", delete=False
            ) as tmp:
                out_path = tmp.name

            if fmt == "xlsx":
                generate_xlsx(data, out_path)
                mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            elif fmt == "ods":
                generate_ods(data, out_path)
                mime = "application/vnd.oasis.opendocument.spreadsheet"
            else:
                generate_pdf(data, out_path)
                mime = "application/pdf"

            with open(out_path, "rb") as f:
                file_bytes = f.read()
            os.unlink(out_path)

            filename = f"ORIN_CoA_{data.get('batchNumber','export')}.{fmt}"
            self.send_response(200)
            self.send_header("Content-Type", mime)
            self.send_header("Content-Disposition",
                             f"attachment; filename=\"{filename}\"")
            self.send_header("Content-Length", len(file_bytes))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(file_bytes)

        except Exception as e:
            body = json.dumps({"error": str(e)}).encode()
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", len(body))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, *args): pass
