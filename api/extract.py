import json, base64, os
from http.server import BaseHTTPRequestHandler
import urllib.request

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

PROMPT = """You are a QC assistant for ORIN Group s.r.o., a Slovak dietary supplement manufacturer.

Extract data from this Certificate of Analysis. Return ONLY valid JSON, no markdown.

LEARNED FROM REAL CERTIFICATES (10 examples analyzed):
1. Nutraceuticals Group format: Item Name | Product Code | Batch | Manufacture | Retest | Issue Date | QA Status | Food Safety | Intended Use + Test|Specification|Results table with Heavy Metals/Microbiological sections
2. Fenchem/Chinese format: PRODUCTS | BATCH NO | TESTING DATE | MANUFACTURE DATE | EXPIRY DATE + ITEMS|SPECIFICATIONS|RESULTS
3. Alchimica/Czech format: Batch number | Manufacture date | Expiry date | Analysis date | Standard + Item|Specification|Result
4. Sensient format: Lot# | Manufacture Date | Best Before Date + Test Description|Min Value|Max Value|Test Value|Test Method (5 columns!)
5. Nexira format: Lot number | Date of manufacture | Expiry date + Test|Method|Specifications|Result
6. Donauchem/Slovak format: Lot Number | Production date | Expired date + Characteristic|Unit|Value|Limit lower|Limit higher (European comma decimals!)
7. Cortex/Polish format: Batch No | Manufacture Date | Expiration Date | Storage Condition + PARAMATER|TEST METHOD|SPECIFICATIONS|TEST RESULTS
8. Fichema/Czech atest: Sarze | Datum expirace (Slovak/Czech labels!) + Parameters|%Result|%Specification (REVERSED columns!)

FIELD MAPPING — always map these variants to our standard fields:
- batchNumber: "Batch Number", "Batch No", "Lot Number", "Lot #", "Lot number", "Sarze", "Sarze", "Lot"
- manufacturingDate: "Manufacture Date", "Manufacturing Date", "Production date", "Date of manufacture", "Datum vyroby"
- retestDate: "Retest Date", "Best Before Date", "Expiry Date", "Expiry date", "Expired date", "Expiration Date", "Best before", "Datum expirace", "Datum expiracie"
- productCode: "Product Code", "Item #", "Sensient Item #", "Item number", "Control/Certificate number", "Item Code"
- commonName: "Item Name", "Name of product", "Product Name", "PRODUCTS", "Material", "Sensient Description", "Product"

ALWAYS EXCLUDE from output (put in excluded list, NOT in extraMeta):
- Supplier name, manufacturer name, laboratory name, distributor name, company address
- Country of origin
- Issue Date, Issue date (lab document date, NOT manufacture date)
- writtenBy, approvedBy, signedBy, analyzedBy, checkedBy, controlledBy, Signed By
- Kontroloval, Skontroloval, Vystavil, Schvalil, Vydal (Slovak/Czech lab personnel)
- sampleAcceptance, testingPeriod, dateOfSampling, dateOfTesting, Testing Date, Analysis date, Report date
- Laboratory order numbers, sample numbers, report numbers, certificate numbers from lab
- Customer PO#, Customer Name, Customer Address, Customer Item#, Sales Order#, Customer info
- Quantity of goods delivered (e.g. "2500 KGS" — delivery quantity, not product property)
- Detailed fatty acid APPENDIX tables (long lists C4:0, C6:0... from appendix pages)
- Laboratory accreditation info, RvA numbers, SGS certifications
- Any person name associated with lab work (analyst, QC manager signatures, Operator, Auditor)
- Disclaimer and confidentiality text
- Place of manufacture (manufacturing facility address)
- Transportation, Packaging logistics info (how goods are transported/packaged)
- Storage and Handling logistics table (but DO extract the actual storage temperature/conditions into storageConditions)

ALWAYS INCLUDE in extraMeta (product-specific fields only):
- QA Status (e.g. "Approved")
- Food Safety Acceptance Criteria (e.g. "Meets UK and EU legislation")
- Intended Use (e.g. "Food use")
- Standard (e.g. "USP30/FCC5", "Ph.Eur", "BP", "FCC")
- Product Type (e.g. "Minerals", "Herbals")
- Kosher certification status
- Extract ratio (e.g. "4:1" for herbal extracts)
- Part used (e.g. "Root", "Leaf" for herbal extracts)
- Body Colour, CAP Colour, Opacity, Body Printing, CAP Printing (for capsules)
- Antioxidants, Colorant (for oils)

COLUMN DETECTION RULES:
1. Standard 3-col: Parameter | Specification | Result
   → min_max=Specification, result=Result, has_method_column=false, has_separate_minmax=false

2. With method 4-col: Parameter | Specification | Result | Method  (or Method before Spec)
   → min_max=Specification, result=Result, method=Method, has_method_column=true, has_separate_minmax=false

3. With separate Min+Max 5-col: Parameter | Min Value | Max Value | Test Value | Method
   → min_value=MinValue, max_value=MaxValue, result=TestValue, method=Method
   → has_method_column=true, has_separate_minmax=true
   → min_max="" (leave empty — generator will use min_value + max_value separately)

4. With unit 4-col: Parameter | Unit | Specification | Result
   → unit=Unit, min_max=Specification, result=Result, has_unit_column=true

5. Donauchem 5-col: Characteristic | Unit | Value | Limit lower | Limit higher
   → unit=Unit, result=Value, has_unit_column=true, has_separate_minmax=true
   → min_value=LimitLower, max_value=LimitHigher
   → method = text on sub-row under parameter name (e.g. "GM001 all.03")
   → Copy values EXACTLY as written — do not modify or combine

6. REVERSED columns (Result BEFORE Specification)
   → Always correctly identify: Specification→min_max, Result→result regardless of column order

COPY VALUES EXACTLY:
- Copy all values exactly as written in the original document
- Only change: European comma decimal → dot: "0,58" → "0.58"
- Do NOT add units, change operators, or reformat values
- raw_min_max = exact original text, min_max = same (with comma→dot only)
- raw_result = exact original text, result = same (with comma→dot only)

SECTION HEADERS vs PARAMETERS:
- Rows with ONLY a name and NO spec/result values are SECTION HEADERS — NOT parameters
- Examples: "Heavy Metals", "Microbiological", "Physical Properties", "Organoleptic Properties", "Storage and Handling"
- Set has_sections=true and list section names in sections[]
- Do NOT include section headers as parameters with empty values
- Each parameter gets the section name in its "section" field

MULTI-ROW PARAMETERS — create separate parameters for each:
- "Identification A: Passes" + "B: Passes" → "Identification A" and "Identification B"
- "Bulk Density Loose: 0.4-0.6" + "Tapped: 0.55-0.80" → "Bulk Density (Loose)" and "Bulk Density (Tapped)"
- "Particle Size through 20mesh" + "through 80mesh" → two separate parameters
- "Iodine 27±7mg/kg" + "Potassium Iodide 35±9mg/kg" → two separate parameters

DATE FORMATS — normalize to readable English format:
- European DD/MM/YY: "22/02/26" → "Feb 22, 2026"
- European YYYY.MM.DD: "2024.09.11" → "Sep 11, 2024"
- Czech/Slovak text: "20. 4. 2029" → "Apr 20, 2029"
- "31-Oct-2025" → "Oct 31, 2025"

NUMBER FORMAT:
- ALWAYS use dot as decimal separator in normalized fields (min_max, result)
- European comma decimal: 0,58 → 0.58 / 99,76 → 99.76 / 100,0 → 100.0
- Thousands comma: 10,000 → 10000 / 5,426 → 5426
- Rule: exactly 3 digits after comma = thousands; 1-2 digits after comma = decimal
- raw_min_max + raw_result: copy EXACTLY as in original (keep original commas/format)
- min_max + result: normalized version (dot decimal, no thousands separators)

MULTI-DOCUMENT PDFs:
- PDF may contain multiple documents (cover page, delivery note, CoA for different customer)
- Always extract from the document that contains actual analytical parameters (Test/Specification/Result table)
- Ignore customer commercial info (Customer PO#, Customer Name, Sales Order#, delivery confirmation pages)

FILENAME: "Internal_[ProductName]_[BatchNumber]" — spaces to underscores, no special chars

Return this JSON:
{
  "commonName": "",
  "fileName": "",
  "batchNumber": "",
  "productCode": "",
  "manufacturingDate": "",
  "retestDate": "",
  "species": "",
  "raw": {
    "commonName": "",
    "batchNumber": "",
    "productCode": "",
    "manufacturingDate": "",
    "retestDate": "",
    "species": "",
    "shelfLife": "",
    "allergens": ""
  },
  "storageConditions": "",
  "shelfLife": "",
  "allergens": "",
  "gmo": "",
  "kosher": "",
  "description": "",
  "extraMeta": {},
  "notes": "",
  "allTexts": [
    {"label": "", "text": ""}
  ],
  "supplier": "",
  "excluded": [
    {"field": "", "value": "", "reason": ""}
  ],
  "layout": {
    "max_param_chars": 30,
    "max_minmax_chars": 20,
    "max_result_chars": 15,
    "max_unit_chars": 0,
    "max_method_chars": 0,
    "has_unit_column": false,
    "has_method_column": false,
    "has_separate_minmax": false,
    "has_sections": false,
    "sections": []
  },
  "parameters": [
    {
      "section": "",
      "name": "",
      "unit": "",
      "raw_min_max": "",
      "raw_result": "",
      "min_value": "",
      "max_value": "",
      "min_max": "",
      "result": "",
      "method": "",
      "status": "pass"
    }
  ]
}

RULES:
- status: pass=within spec, fail=outside spec, info=Conforms/Complies/Passes test/not applicable
- min_max: copy the specification EXACTLY as written in the original document — do NOT reformat, do NOT add units, do NOT change operators, do NOT combine columns. Just copy the text as-is from the Specification/Limit column.
- result: copy the result EXACTLY as written in the original document.
- raw_min_max: identical to min_max (exact copy from original)
- raw_result: identical to result (exact copy from original)
- ONLY change: European comma decimal separator → dot: "0,58" → "0.58", "99,76" → "99.76"
- Do NOT: add units that are not in the spec column, change "≥99.0%" to ">99%", add "%" if not present, combine separate limit columns into one string with artificial formatting
- result: value + unit together unless separate unit column
- supplier: extract for internal reference only, NOT in output files
- notes: capture EVERY piece of text from the document that is not a standard parameter row, meta field, or header. This includes:
  * Free text below/above tables: "Remarks:", "Note:", "Conclusion:", "Comments:", "Information:", disclaimers
  * Text INSIDE tables that is not a parameter: rows like "Remarks: NaCl to be calculated as on dry basis"
  * Footnote explanations: "* tested annually", "(1) performed by external lab"
  * Regulatory compliance statements: "Comply with EC regulation 231/2012"
  * Any row in the parameter table that has text spanning full width without spec/result values
  * Concatenate all such texts with newline separator
  * Do NOT include storageConditions text (that goes in storageConditions field separately)
  * When in doubt — include it in notes rather than lose it
- Preserve footnote markers * ** 1 2 in parameter names
- allTexts: list of ALL free text blocks found in document (every non-table text), each with label and text. Examples: {"label": "Remarks", "text": "NaCl to be calculated as on dry basis."}, {"label": "Conclusion", "text": "Conform to specification."}, {"label": "Note", "text": "* tested annually"}. This is the complete text inventory for audit purposes.
- excluded reasons: "supplier_info", "lab_info", "lab_appendix", "lab_personnel", "lab_order_info", "customer_info", "logistics_info"
- Fatty acid appendix → ONE entry: {"field": "Fatty acid profile (detail)", "value": "X rows", "reason": "lab_appendix"}
- Section header rows (no values) → has_sections=true, NOT in parameters list

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
            # Najdeme prvy { a posledny } pre pripad ze je okolo extra text
            start = raw.find("{")
            end = raw.rfind("}") + 1
            if start != -1 and end > start:
                raw = raw[start:end]
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
