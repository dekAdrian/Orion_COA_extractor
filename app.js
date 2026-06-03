
const { useState, useRef } = React;
const LOGO = "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";

const C = {
  pri:"#3D2B6B", mid:"#6B4FA0", lt:"#F0ECF8",
  acc:"#C9A8F0", bdr:"#D5C5EC", wh:"#FFFFFF",
  tx:"#1A0A33", mu:"#7A6A92", alt:"#F8F5FD",
};

function b64(file) {
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=()=>res(r.result.split(",")[1]);
    r.onerror=rej;
    r.readAsDataURL(file);
  });
}

function buildPrompt(fname) {
  return "You are a QC assistant for ORIN Group s.r.o.\n"
    +"Extract data from this Certificate of Analysis. Return ONLY valid JSON, no markdown.\n\n"
    +"RULES:\n"
    +"- Include ONLY main parameters: physical/chemical, heavy metals, microbiological, PAH, dioxins, PCBs\n"
    +"- Do NOT include individual fatty acid profile lists from lab appendices\n"
    +"- Summary spec params like C8:0 Caprylic or C10:0 Capric are fine if primary spec\n"
    +"- MIN/MAX field: combine as '55.0 / 70.0 %' or '- / 1 mg KOH/g' or 'ND' — include unit\n"
    +"- RESULT field: value + unit together e.g. '61.6 %' or '0.03 mg KOH/g' or 'Not detected'\n\n"
    +"JSON structure:\n"
    +'{\n'
    +'  "commonName":"","supplier":"","countryOfOrigin":"",\n'
    +'  "batchNumber":"","productCode":"",\n'
    +'  "manufacturingDate":"","retestDate":"",\n'
    +'  "species":"","storageConditions":"","shelfLife":"",\n'
    +'  "allergens":"","gmo":"","kosher":"",\n'
    +'  "parameters":[{"name":"","min_max":"","result":""}],\n'
    +'  "notes":""\n'
    +'}\n'
    +"filename: "+fname;
}

// Styles
const S = {
  app:{minHeight:"100vh",background:C.lt,fontFamily:"'Segoe UI',system-ui,sans-serif",color:C.tx},
  hdr:{background:"linear-gradient(135deg,#3D2B6B,#6B4FA0)",padding:"0 32px",display:"flex",alignItems:"center",height:"58px",boxShadow:"0 2px 16px rgba(61,43,107,0.3)"},
  hdrImg:{height:"32px",filter:"brightness(0) invert(1)"},
  badge:{marginLeft:"auto",background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",color:"#fff",padding:"4px 12px",borderRadius:"20px",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase"},
  main:{maxWidth:"960px",margin:"0 auto",padding:"32px 20px"},
  h1:{fontSize:"24px",fontWeight:700,color:C.pri,marginBottom:"4px"},
  sub:{color:C.mu,fontSize:"13px",marginBottom:"28px"},
  card:{background:C.wh,border:"1px solid "+C.bdr,borderRadius:"12px",padding:"24px 28px",marginBottom:"18px",boxShadow:"0 2px 12px rgba(61,43,107,0.06)"},
  st:{fontSize:"10px",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:C.pri,marginBottom:"18px",paddingBottom:"10px",borderBottom:"2px solid "+C.lt,display:"flex",alignItems:"center",gap:"8px"},
  num:{background:C.pri,color:"#fff",width:20,height:20,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",flexShrink:0},
  upz:{border:"2px dashed "+C.acc,borderRadius:"10px",padding:"44px 20px",textAlign:"center",cursor:"pointer",transition:"all 0.2s",background:C.alt},
  upzA:{borderColor:C.pri,background:"#EAE0F8"},
  chip:{display:"inline-flex",alignItems:"center",gap:"8px",background:C.lt,border:"1px solid "+C.bdr,borderRadius:"20px",padding:"5px 14px",fontSize:"12px",color:C.pri,fontWeight:500,marginTop:"12px"},
  bp:{background:"linear-gradient(135deg,#3D2B6B,#6B4FA0)",color:"#fff",border:"none",borderRadius:"8px",padding:"10px 26px",fontSize:"13px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(61,43,107,0.25)",marginTop:"18px"},
  bo:{background:"transparent",color:C.pri,border:"1.5px solid "+C.pri,borderRadius:"8px",padding:"9px 20px",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:"inherit"},
  bs:{background:C.lt,color:C.pri,border:"1px solid "+C.bdr,borderRadius:"6px",padding:"4px 10px",fontSize:"12px",fontWeight:600,cursor:"pointer",fontFamily:"inherit"},
  bd:{background:"#FFF5F5",color:"#C62828",border:"1px solid #FFCDD2",borderRadius:"6px",padding:"2px 7px",fontSize:"12px",cursor:"pointer",fontFamily:"inherit"},
  fg:{display:"flex",flexDirection:"column",gap:"4px"},
  lbl:{fontSize:"9px",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:C.mu},
  inp:{border:"1.5px solid "+C.bdr,borderRadius:"6px",padding:"8px 10px",fontSize:"13px",color:C.tx,background:C.alt,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box"},
  grid2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"},
  tbl:{width:"100%",borderCollapse:"collapse",fontSize:"12px"},
  th:{background:C.pri,color:"#fff",padding:"8px 10px",textAlign:"left",fontSize:"9px",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase"},
  td:{padding:"6px 10px",border:"1px solid "+C.bdr,verticalAlign:"middle"},
  tdr:{padding:"6px 10px",border:"1px solid "+C.bdr,verticalAlign:"middle",background:"#EDE0FF"},
  ti:{border:"none",background:"transparent",width:"100%",fontSize:"12px",color:C.tx,outline:"none",fontFamily:"inherit",padding:0},
  tir:{border:"none",background:"transparent",width:"100%",fontSize:"12px",color:C.pri,fontWeight:700,outline:"none",fontFamily:"inherit",padding:0},
  dlrow:{display:"flex",gap:"10px",marginTop:"18px",paddingTop:"16px",borderTop:"1px solid "+C.bdr,alignItems:"center",flexWrap:"wrap"},
  stB:{display:"flex",alignItems:"center",gap:"10px",padding:"11px 16px",borderRadius:"8px",marginBottom:"16px",fontSize:"13px",fontWeight:500},
  spin:{width:"14px",height:"14px",flexShrink:0,border:"2px solid #FFD54F",borderTop:"2px solid #6D4C00",borderRadius:"50%",animation:"spin 0.8s linear infinite"},
};

function App() {
  const [file,setFile]=useState(null);
  const [drag,setDrag]=useState(false);
  const [status,setStatus]=useState(null);
  const [data,setData]=useState(null);
  const [params,setParams]=useState([]);
  const [apiKey,setApiKey]=useState(localStorage.getItem("orin_api_key")||"");
  const fileRef=useRef();

  const saveKey=(k)=>{setApiKey(k);localStorage.setItem("orin_api_key",k);};

  const onFile=(f)=>{
    if(!f)return;
    const ok=["application/pdf","image/jpeg","image/png","image/jpg"].includes(f.type)||f.name.toLowerCase().endsWith(".pdf");
    if(!ok){setStatus({type:"error",msg:"Podporované formáty: PDF, JPG, PNG"});return;}
    setFile(f);setStatus(null);setData(null);setParams([]);
  };

  const extract=async()=>{
    if(!file)return;
    if(!apiKey){setStatus({type:"error",msg:"Zadajte Anthropic API kľúč vyššie"});return;}
    setStatus({type:"processing",msg:"Claude číta certifikát a pripravuje ORIN template…"});
    setData(null);setParams([]);
    try {
      const fileB64=await b64(file);
      const isPdf=file.type==="application/pdf"||file.name.toLowerCase().endsWith(".pdf");
      const block=isPdf
        ?{type:"document",source:{type:"base64",media_type:"application/pdf",data:fileB64}}
        :{type:"image",source:{type:"base64",media_type:file.type||"image/jpeg",data:fileB64}};
      const resp=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-allow-browser":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,
          messages:[{role:"user",content:[block,{type:"text",text:buildPrompt(file.name)}]}]})
      });
      const json=await resp.json();
      if(!resp.ok)throw new Error(json.error?.message||"API error");
      const raw=json.content.map(b=>b.text||"").join("").trim().replace(/```json|```/g,"").trim();
      const d=JSON.parse(raw);
      setData(d);
      setParams((d.parameters||[]).map(p=>({name:p.name||"",min_max:p.min_max||"",result:p.result||""})));
      setStatus({type:"done",msg:"✅ Extrakcia dokončená — skontrolujte hodnoty a stiahnite výstup."});
    } catch(e){
      setStatus({type:"error",msg:"⚠️ "+e.message});
    }
  };

  const upd=(k,v)=>setData(d=>({...d,[k]:v}));
  const updP=(i,k,v)=>setParams(p=>{const n=[...p];n[i]={...n[i],[k]:v};return n;});
  const addP=()=>setParams(p=>[...p,{name:"",min_max:"",result:""}]);
  const delP=(i)=>setParams(p=>p.filter((_,j)=>j!==i));

  const fld=(label,key,full)=>(
    <div style={{...S.fg,...(full?{gridColumn:"1/-1"}:{})}}>
      <label style={S.lbl}>{label}</label>
      <input style={S.inp} value={data?.[key]||""} onChange={e=>upd(key,e.target.value)}
        onFocus={e=>e.target.style.borderColor=C.pri}
        onBlur={e=>e.target.style.borderColor=C.bdr}/>
    </div>
  );

  const exportSpreadsheet=(fmt)=>{
    const d=data||{};
    const rows=[
      ["","","",""],["","","",""],
      ["ORIN Group, Na Stepnici 1379/1, 960 01 Zvolen, Slovakia    ID: 46294490   VAT: SK2023327735    info@privatebrand.eu","","",""],
      ["","DM20","",""],["","CERTIFICATE OF ANALYSIS","",""],["","","",""],
      ["Common Name",d.commonName||"","Manufacture Date",d.manufacturingDate||""],
      ["Batch number",d.batchNumber||"","Retest date",d.retestDate||""],
    ];
    if(d.species)rows.push(["Species",d.species,"",""]);
    if(d.productCode)rows.push(["Product Code",d.productCode,"",""]);
    rows.push(["","","",""]);
    rows.push(["PARAMETER","MIN / MAX","","RESULT"]);
    params.forEach(p=>rows.push([p.name||"",p.min_max||"","",p.result||""]));
    if(d.notes){rows.push(["","","",""]);rows.push([d.notes,"","",""]);}
    rows.push(["","","",""]);rows.push(["","","",""]);
    rows.push(["","","QA Manager",""]);
    const wb=XLSX.utils.book_new();
    const ws=XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"]=[{wch:50},{wch:22},{wch:14},{wch:22}];
    XLSX.utils.book_append_sheet(wb,ws,"Certificate of Analysis");
    const ext=fmt==="ods"?"ods":"xlsx";
    const mime=fmt==="ods"?"application/vnd.oasis.opendocument.spreadsheet":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const out=XLSX.write(wb,{bookType:ext,type:"array"});
    const blob=new Blob([out],{type:mime});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="ORIN_CoA_"+(d.batchNumber||"export")+"."+ext;
    document.body.appendChild(a);a.click();document.body.removeChild(a);
  };

  const exportHTML=()=>{
    const d=data||{};
    const rows=params.map(p=>
      "<tr><td>"+p.name+"</td><td style='color:#5A4A7A'>"+p.min_max+"</td><td style='font-weight:700;color:#3D2B6B;text-align:center'>"+p.result+"</td></tr>"
    ).join("");
    const ml=
      "<div style='display:flex;gap:6px;padding:2px 0;font-size:9pt'><span style='color:#7A6A92;min-width:130px;font-weight:600'>Common Name</span><span>"+(d.commonName||"")+"</span></div>"+
      "<div style='display:flex;gap:6px;padding:2px 0;font-size:9pt'><span style='color:#7A6A92;min-width:130px;font-weight:600'>Batch Number</span><span>"+(d.batchNumber||"")+"</span></div>"+
      (d.species?"<div style='display:flex;gap:6px;padding:2px 0;font-size:9pt'><span style='color:#7A6A92;min-width:130px;font-weight:600'>Species</span><span>"+d.species+"</span></div>":"")+
      (d.supplier?"<div style='display:flex;gap:6px;padding:2px 0;font-size:9pt'><span style='color:#7A6A92;min-width:130px;font-weight:600'>Supplier</span><span>"+d.supplier+"</span></div>":"")+
      (d.allergens?"<div style='display:flex;gap:6px;padding:2px 0;font-size:9pt'><span style='color:#7A6A92;min-width:130px;font-weight:600'>Allergens</span><span>"+d.allergens+"</span></div>":"");
    const mr=
      "<div style='display:flex;gap:6px;padding:2px 0;font-size:9pt'><span style='color:#7A6A92;min-width:130px;font-weight:600'>Manufacturing Date</span><span>"+(d.manufacturingDate||"")+"</span></div>"+
      "<div style='display:flex;gap:6px;padding:2px 0;font-size:9pt'><span style='color:#7A6A92;min-width:130px;font-weight:600'>Retest / Expiry</span><span>"+(d.retestDate||"")+"</span></div>"+
      (d.productCode?"<div style='display:flex;gap:6px;padding:2px 0;font-size:9pt'><span style='color:#7A6A92;min-width:130px;font-weight:600'>Product Code</span><span>"+d.productCode+"</span></div>":"")+
      (d.shelfLife?"<div style='display:flex;gap:6px;padding:2px 0;font-size:9pt'><span style='color:#7A6A92;min-width:130px;font-weight:600'>Shelf Life</span><span>"+d.shelfLife+"</span></div>":"");
    const doc="<!DOCTYPE html><html><head><meta charset='UTF-8'>"
      +"<style>@page{size:A4;margin:16mm}*{box-sizing:border-box;margin:0;padding:0}body{font-family:Calibri,Arial,sans-serif;font-size:10pt;color:#1A0A33}"
      +".hdr{display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:10px;border-bottom:2px solid #3D2B6B;margin-bottom:8px}"
      +"table{width:100%;border-collapse:collapse;font-size:9.5pt}thead tr{background:#3D2B6B}th{color:#fff;padding:7px 10px;text-align:left;font-weight:600}"
      +"td{padding:5px 10px;border-bottom:1px solid #EDE7F6}tr:nth-child(even) td{background:#F8F5FD}</style></head><body>"
      +"<div class='hdr'><img src='data:image/webp;base64,"+LOGO+"' style='height:44px'>"
      +"<div style='font-size:8pt;color:#7A6A92;text-align:right;line-height:1.7'>ORIN Group s.r.o.<br>Na \u0160tepnici 1379/1, 960 01 Zvolen, Slovakia<br>ID: 46294490 | VAT: SK2023327735<br>info@privatebrand.eu</div></div>"
      +"<div style='text-align:center;font-size:13pt;font-weight:bold;color:#3D2B6B;letter-spacing:2px;margin:8px 0 2px'>CERTIFICATE OF ANALYSIS</div>"
      +"<div style='text-align:center;font-size:16pt;font-weight:bold;color:#3D2B6B;margin-bottom:12px;font-family:Calibri,Arial,sans-serif'>"+(d.commonName||"")+"</div>"
      +"<div style='display:grid;grid-template-columns:1fr 1fr;gap:0 24px;margin-bottom:12px;border:1px solid #D5C5EC;border-radius:4px;padding:8px 12px;background:#F8F5FD'>"
      +"<div>"+ml+"</div><div>"+mr+"</div></div>"
      +"<table><thead><tr><th style='width:50%'>PARAMETER</th><th style='width:25%'>MIN / MAX</th><th style='width:25%;text-align:center'>RESULT</th></tr></thead>"
      +"<tbody>"+rows+"</tbody></table>"
      +(d.notes?"<div style='margin-top:10px;font-size:8.5pt;color:#7A6A92;font-style:italic'>"+d.notes+"</div>":"")
      +"<div style='margin-top:24px;display:flex;justify-content:space-between;border-top:1px solid #D5C5EC;padding-top:12px'>"
      +"<div><strong>QA Manager</strong><div style='border-bottom:1px solid #3D2B6B;width:220px;margin-top:30px'></div>"
      +"<div style='font-size:8pt;color:#7A6A92;margin-top:4px'>Signature &amp; Date</div></div>"
      +"<div style='font-size:8pt;color:#7A6A92;text-align:right'>ORIN Group s.r.o. &mdash; Internal QC Document<br>Generated: "+new Date().toLocaleDateString("sk-SK")+"</div>"
      +"</div></body></html>";
    const blob=new Blob([doc],{type:"text/html;charset=utf-8"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="ORIN_CoA_"+(d.batchNumber||"export")+".html";
    document.body.appendChild(a);a.click();document.body.removeChild(a);
  };

  const stColors={
    processing:{background:"#FFF8E1",border:"1.5px solid #FFD54F",color:"#6D4C00"},
    done:{background:"#E8F5E9",border:"1.5px solid #81C784",color:"#1B5E20"},
    error:{background:"#FCE4EC",border:"1.5px solid #F48FB1",color:"#880E2F"},
  };

  return (
    <div style={S.app}>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}} button:hover{opacity:.85} *{box-sizing:border-box}"}</style>
      <div style={S.hdr}>
        <img src={"data:image/webp;base64,"+LOGO} alt="ORIN" style={S.hdrImg}/>
        <span style={S.badge}>CoA Extractor</span>
      </div>
      <div style={S.main}>
        <h1 style={S.h1}>Certificate of Analysis &#8212; Extrakcia</h1>
        <p style={S.sub}>Nahrajte extern&#253; CoA &#8594; AI vytiahne d&#225;ta &#8594; stiahni ORIN template.</p>

        <div style={S.card}>
          <div style={S.st}><span style={S.num}>0</span>API K&#318;&#250;&#269;</div>
          <div style={S.fg}>
            <label style={S.lbl}>Anthropic API Key (ulo&#382;&#237; sa v prehliadači)</label>
            <input style={{...S.inp,fontFamily:"monospace"}} type="password"
              placeholder="sk-ant-..." value={apiKey}
              onChange={e=>saveKey(e.target.value)}/>
          </div>
          <div style={{fontSize:11,color:C.mu,marginTop:6}}>
            Z&#237;skate na <a href="https://console.anthropic.com" target="_blank" style={{color:C.pri}}>console.anthropic.com</a> &#8594; API Keys
          </div>
        </div>

        <div style={S.card}>
          <div style={S.st}><span style={S.num}>1</span>Nahranie dokumentu</div>
          <div style={{...S.upz,...(drag?S.upzA:{})}}
            onDragOver={e=>{e.preventDefault();setDrag(true);}}
            onDragLeave={()=>setDrag(false)}
            onDrop={e=>{e.preventDefault();setDrag(false);onFile(e.dataTransfer.files[0]);}}
            onClick={()=>fileRef.current.click()}>
            <div style={{fontSize:40,marginBottom:10}}>&#128196;</div>
            <div style={{fontSize:15,fontWeight:600,color:C.pri,marginBottom:5}}>Pretiahnite s&#250;bor alebo kliknite</div>
            <div style={{fontSize:12,color:C.mu}}>PDF, JPG, PNG</div>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
              style={{display:"none"}} onChange={e=>onFile(e.target.files[0])}/>
          </div>
          {file&&<div style={S.chip}>&#128206; <strong>{file.name}</strong> <span style={{color:C.mu}}>({Math.round(file.size/1024)} KB)</span></div>}
          <br/>
          <button style={{...S.bp,...(!file||status?.type==="processing"?{opacity:.45,cursor:"not-allowed"}:{})}}
            onClick={extract} disabled={!file||status?.type==="processing"}>
            {status?.type==="processing"?"&#9203; Extrahujem...":"&#128269; Extrahovať d&#225;ta"}
          </button>
        </div>

        {status&&(
          <div style={{...S.stB,...(stColors[status.type]||{})}}>
            {status.type==="processing"&&<div style={S.spin}/>}
            {status.msg}
          </div>
        )}

        {data&&(<>
          <div style={S.card}>
            <div style={S.st}><span style={S.num}>2</span>Z&#225;kladn&#233; inform&#225;cie</div>
            <div style={S.grid2}>
              {fld("N&#225;zov / Common Name","commonName")}
              {fld("Dod&#225;vate&#318;","supplier")}
              {fld("&#268;&#237;slo &#353;ar&#382;e","batchNumber")}
              {fld("K&#243;d produktu","productCode")}
              {fld("D&#225;tum v&#253;roby","manufacturingDate")}
              {fld("Retest / Expir&#225;cia","retestDate")}
              {fld("Druh / Species","species")}
              {fld("Krajina p&#244;vodu","countryOfOrigin")}
              {fld("Trvanlivos&#357;","shelfLife")}
              {fld("Alerg&#233;ny","allergens")}
              {fld("GMO","gmo")}
              {fld("Kosher","kosher")}
              {fld("Skladovanie","storageConditions",true)}
            </div>
          </div>

          <div style={S.card}>
            <div style={S.st}>
              <span style={S.num}>3</span>Analytick&#233; parametre
              <span style={{marginLeft:"auto",fontWeight:400,color:C.mu,fontSize:"11px",textTransform:"none",letterSpacing:0}}>{params.length} parametrov</span>
            </div>
            <table style={S.tbl}>
              <thead><tr>
                <th style={{...S.th,width:"48%"}}>Parameter</th>
                <th style={{...S.th,width:"26%"}}>Min / Max</th>
                <th style={{...S.th,width:"22%"}}>V&#253;sledok</th>
                <th style={{...S.th,width:"4%"}}></th>
              </tr></thead>
              <tbody>
                {params.map((p,i)=>(
                  <tr key={i} style={{background:i%2===0?C.wh:C.alt}}>
                    <td style={{...S.td,fontWeight:500}}><input style={S.ti} value={p.name} onChange={e=>updP(i,"name",e.target.value)}/></td>
                    <td style={{...S.td,color:C.mu}}><input style={{...S.ti,color:C.mu}} value={p.min_max} onChange={e=>updP(i,"min_max",e.target.value)}/></td>
                    <td style={S.tdr}><input style={S.tir} value={p.result} onChange={e=>updP(i,"result",e.target.value)}/></td>
                    <td style={{...S.td,textAlign:"center",width:32}}><button style={S.bd} onClick={()=>delP(i)}>&#10005;</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{marginTop:10}}><button style={S.bs} onClick={addP}>+ Prida&#357; parameter</button></div>
          </div>

          <div style={S.card}>
            <div style={S.st}><span style={S.num}>4</span>Pozn&#225;mky a export</div>
            <div style={{...S.fg,marginBottom:18}}>
              <label style={S.lbl}>Pozn&#225;mky</label>
              <input style={S.inp} value={data.notes||""} onChange={e=>upd("notes",e.target.value)}
                onFocus={e=>e.target.style.borderColor=C.pri}
                onBlur={e=>e.target.style.borderColor=C.bdr}/>
            </div>
            <div style={S.dlrow}>
              <button style={{...S.bp,marginTop:0}} onClick={exportHTML}>&#128424; HTML &#8594; PDF</button>
              <button style={S.bo} onClick={()=>exportSpreadsheet("xlsx")}>&#8595; XLSX</button>
              <button style={S.bo} onClick={()=>exportSpreadsheet("ods")}>&#8595; ODS</button>
              <span style={{fontSize:11,color:C.mu}}>HTML &#8594; otvori&#357; v prehliadači &#8594; Ctrl+P &#8594; Uloži&#357; ako PDF</span>
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
}

const root=ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
