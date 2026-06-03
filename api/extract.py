import json, base64, os
from http.server import BaseHTTPRequestHandler
import urllib.request

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

PROMPT = """You are a QC assistant for ORIN Group s.r.o., a Slovak dietary supplement manufacturer.

Extract ALL data from this Certificate of Analysis. Return ONLY valid JSON, no markdown.

LEARNED FROM ORIN INTERNAL TEMPLATES:
- Standard style: Parameter | Min/Max | Result
- Algae Oil style: Parameter | Unit | Min/Max | Result (separate unit column, footnotes 1 2)
- Capsule style: Analytical data | Test method | Specification | Result
- Meta fields vary per product type
- Fatty acid profiles (long individual lists) are EXCLUDED
- Summary specs like DHA%, EPA% are INCLUDED
- Footnotes like "1 tested annually" go into notes field

Return this JSON:
{
  "commonName": "",
  "supplier": "",
  "countryOfOrigin": "",
  "batchNumber": "",
  "productCode": "",
  "manufacturingDate": "",
  "retestDate": "",
  "species": "",
  "storageConditions": "",
  "shelfLife": "",
  "allergens": "",
  "gmo": "",
  "kosher": "",
  "description": "",
  "extraMeta": {},
  "notes": "",
  "layout": {
    "max_param_chars": 30,
    "max_minmax_chars": 20,
    "max_result_chars": 15,
    "max_unit_chars": 0,
    "max_method_chars": 0,
    "has_unit_column": false,
    "has_method_column": false,
    "has_sections": false,
    "sections": []
  },
  "parameters": [
    {
      "section": "",
      "name": "",
      "unit": "",
      "min_max": "",
      "result": "",
      "method": "",
      "status": "pass"
    }
  ]
}

RULES:
- status: pass=within spec, fail=outside spec, info=not tested/not applicable
- min_max: combine as "55.0 / 70.0 %" or "- / 1 mg KOH/g" or "ND"
- result: value + unit together unless separate unit column
- extraMeta: extra product-specific meta fields
- has_unit_column: true if separate unit column exists
- has_method_column: true if test method column exists
- Preserve footnote markers in parameter names

filename: {filename}"""

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body   = json.loads(self.rfile.read(length))
        
        file_b64     = body.get("file_b64", "")
        file_type    = body.get("file_type", "application/pdf")
        filename     = body.get("filename", "document.pdf")
        chat_history = body.get("chat_history", [])
        current_data = body.get("current_data", None)

        if not ANTHROPIC_API_KEY:
            self._json(500, {"error": "ANTHROPIC_API_KEY nie je nastavený"})
            return

        is_pdf = "pdf" in file_type.lower() or filename.lower().endswith(".pdf")

        # Chat mode — oprava existujucich dat
        if current_data and chat_history:
            messages = []
            messages.append({
                "role": "user",
                "content": (
                    f"Tu sú aktuálne extrahované dáta CoA:\n"
                    f"```json\n{json.dumps(current_data, ensure_ascii=False, indent=2)}\n```\n\n"
                    f"Použivateľ žiada: {chat_history[-1].get('content','')}"
                    f"\n\nVráť OPRAVENÝ JSON s rovnakou štruktúrou. Zmeň len čo bolo požadované. "
                    f"Vráť IBA JSON, žiadny text navyše."
                )
            })
            payload = {
                "model": "claude-sonnet-4-5",
                "max_tokens": 4000,
                "messages": messages
            }
        else:
            # Extraction mode
            block = (
                {"type": "document", "source": {"type": "base64", "media_type": "application/pdf", "data": file_b64}}
                if is_pdf else
                {"type": "image", "source": {"type": "base64", "media_type": file_type, "data": file_b64}}
            )
            payload = {
                "model": "claude-sonnet-4-5",
                "max_tokens": 4000,
                "messages": [{
                    "role": "user",
                    "content": [block, {"type": "text", "text": PROMPT.replace("{filename}", filename)}]
                }]
            }

        try:
            req = urllib.request.Request(
                "https://api.anthropic.com/v1/messages",
                data=json.dumps(payload).encode(),
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                },
                method="POST"
            )
            with urllib.request.urlopen(req) as resp:
                result = json.loads(resp.read())

            raw = "".join(b.get("text","") for b in result.get("content",[])).strip()
            raw = raw.replace("```json","").replace("```","").strip()
            extracted = json.loads(raw)

            # Verifikácia
            from lib.generator import verify_parameters, verify_meta
            params, param_issues = verify_parameters(extracted.get("parameters",[]))
            meta_issues = verify_meta(extracted)
            extracted["parameters"] = params
            extracted["verification"] = {
                "issues": param_issues + meta_issues,
                "has_errors": any(i.get("note") for i in param_issues + meta_issues)
            }

            self._json(200, {"data": extracted})

        except Exception as e:
            self._json(500, {"error": str(e)})

    def _json(self, code, data):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(code)
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
