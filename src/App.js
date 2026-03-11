import { useState, useCallback } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from "recharts";

/* ═══════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════ */
const ADMIN = { id:"admin", username:"admin", password:"admin123", name:"Principal Admin", role:"admin" };

const SEED_CLASSES = [
  { id:"cls1", name:"AI & DS — Section A" },
  { id:"cls2", name:"AI & DS — Section B" },
  { id:"cls3", name:"AI & DS — Section C" },
];

const SEED_TEACHERS = [
  { id:"t1", name:"Mrs. Kavitha Rao",  username:"kavitha", password:"teach123", classId:"cls1" },
  { id:"t2", name:"Mr. Rajan Kumar",   username:"rajan",   password:"teach123", classId:"cls2" },
  { id:"t3", name:"Ms. Divya Sharma",  username:"divya",   password:"teach123", classId:"cls3" },
];

const SEED_STUDENTS = [
  { id:"s1",  rollNo:"2024001", name:"Aarav Sharma",   password:"2024001", gender:"M", classId:"cls1", math:88, science:91, english:76, programming:94, ds:89, prev_gpa:8.2 },
  { id:"s2",  rollNo:"2024002", name:"Priya Reddy",    password:"2024002", gender:"F", classId:"cls1", math:72, science:68, english:85, programming:71, ds:74, prev_gpa:7.9 },
  { id:"s3",  rollNo:"2024003", name:"Rohan Mehta",    password:"2024003", gender:"M", classId:"cls1", math:58, science:62, english:60, programming:55, ds:61, prev_gpa:6.5 },
  { id:"s4",  rollNo:"2024004", name:"Ananya Iyer",    password:"2024004", gender:"F", classId:"cls2", math:95, science:93, english:90, programming:97, ds:94, prev_gpa:9.1 },
  { id:"s5",  rollNo:"2024005", name:"Kiran Das",      password:"2024005", gender:"M", classId:"cls2", math:79, science:81, english:74, programming:83, ds:80, prev_gpa:7.5 },
  { id:"s6",  rollNo:"2024006", name:"Divya Nair",     password:"2024006", gender:"F", classId:"cls2", math:63, science:70, english:78, programming:66, ds:68, prev_gpa:7.2 },
  { id:"s7",  rollNo:"2024007", name:"Arjun Patel",    password:"2024007", gender:"M", classId:"cls3", math:84, science:87, english:82, programming:90, ds:86, prev_gpa:8.0 },
  { id:"s8",  rollNo:"2024008", name:"Sneha Kulkarni", password:"2024008", gender:"F", classId:"cls3", math:50, science:55, english:58, programming:48, ds:52, prev_gpa:5.8 },
  { id:"s9",  rollNo:"2024009", name:"Vikram Singh",   password:"2024009", gender:"M", classId:"cls3", math:76, science:72, english:69, programming:78, ds:73, prev_gpa:7.0 },
  { id:"s10", rollNo:"2024010", name:"Meera Joshi",    password:"2024010", gender:"F", classId:"cls1", math:89, science:88, english:92, programming:87, ds:91, prev_gpa:8.4 },
];

const PERIODS = [
  { no:1, label:"Period 1", time:"9:00 – 9:50",  subject:"Mathematics"   },
  { no:2, label:"Period 2", time:"9:50 – 10:40", subject:"Science"       },
  { no:3, label:"Period 3", time:"10:55 – 11:45",subject:"English"       },
  { no:4, label:"Period 4", time:"11:45 – 12:35",subject:"Programming"   },
  { no:5, label:"Period 5", time:"1:20 – 2:10",  subject:"Data Science"  },
  { no:6, label:"Period 6", time:"2:10 – 3:00",  subject:"Sports / Activity" },
];

// Demo seed attendance records for the last 7 days
function makeSeedAttendance() {
  const records = [];
  const today = new Date();
  // 5 past days
  for (let d = 6; d >= 1; d--) {
    const dt = new Date(today); dt.setDate(today.getDate() - d);
    const dateStr = dt.toISOString().slice(0,10);
    const day = dt.getDay();
    if (day === 0 || day === 6) continue; // skip weekends

    SEED_CLASSES.forEach(cls => {
      const stuInClass = SEED_STUDENTS.filter(s => s.classId === cls.id);
      PERIODS.forEach(p => {
        stuInClass.forEach(s => {
          // Random attendance: high attenders present more often
          const prob = ["s3","s8"].includes(s.id) ? 0.5 : 0.85;
          records.push({
            id: `${dateStr}-${cls.id}-${p.no}-${s.id}`,
            classId: cls.id,
            studentId: s.id,
            date: dateStr,
            period: p.no,
            subject: p.subject,
            present: Math.random() < prob,
          });
        });
      });
    });
  }
  return records;
}

const SUB_KEYS   = ["math","science","english","programming","ds"];
const SUB_LABELS = ["Math","Science","English","Programming","Data Science"];
const SUB_COLORS = ["#6366f1","#22d3ee","#f472b6","#a78bfa","#34d399"];
const RISK_COLORS = { Low:"#22c55e", Medium:"#f59e0b", High:"#ef4444" };
const SEM_TREND = [
  { sem:"Sem 1", avg:7.1, top:9.2, low:4.8 },
  { sem:"Sem 2", avg:7.4, top:9.3, low:5.1 },
  { sem:"Sem 3", avg:7.2, top:9.4, low:4.9 },
  { sem:"Sem 4", avg:7.6, top:9.5, low:5.2 },
  { sem:"Sem 5", avg:7.8, top:9.6, low:5.4 },
  { sem:"Sem 6", avg:7.5, top:9.5, low:4.7 },
];

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
function uid() { return Date.now().toString(36)+Math.random().toString(36).slice(2); }

// Get attendance % for a student from records
function getAttendancePct(studentId, records) {
  const mine = records.filter(r => r.studentId === studentId);
  if (mine.length === 0) return null; // no records yet
  const present = mine.filter(r => r.present).length;
  return parseFloat(((present / mine.length) * 100).toFixed(1));
}

function calcGPA(s, attPct) {
  const avg = SUB_KEYS.reduce((a,k) => a + (+s[k]||0), 0) / 5;
  const att = attPct ?? (+s.attendance ?? 75);
  return parseFloat(Math.min(10, (avg/100)*6 + (att/100)*4).toFixed(2));
}
function calcRisk(gpa, att) {
  if (gpa >= 7.5 && att >= 75) return "Low";
  if (gpa >= 5.5 && att >= 55) return "Medium";
  return "High";
}
function enrichStudent(s, records) {
  const attPct = getAttendancePct(s.id, records) ?? s.attendance ?? 75;
  const gpa    = calcGPA(s, attPct);
  return { ...s, attendance: attPct, gpa, risk: calcRisk(gpa, attPct) };
}

function safeAvg(arr, key) {
  if (!arr || arr.length === 0) return 0;
  return parseFloat((arr.reduce((a,s) => a+(+s[key]||0), 0) / arr.length).toFixed(2));
}
function safeMax(arr, key) {
  if (!arr || arr.length === 0) return { [key]:0, name:"—" };
  return arr.reduce((a,b) => ((+a[key]||0) > (+b[key]||0) ? a : b));
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
}
function todayISO() { return new Date().toISOString().slice(0,10); }

// localStorage hook
function useLS(key, seed) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); if (s !== null) return JSON.parse(s); } catch {}
    return typeof seed === "function" ? seed() : seed;
  });
  const set = useCallback(v => {
    setVal(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);
  return [val, set];
}

/* ═══════════════════════════════════════════════════════
   SHARED UI
═══════════════════════════════════════════════════════ */
const G = {
  page:  { minHeight:"100vh", background:"#060b14", color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif" },
  card:  { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"18px 22px", position:"relative", overflow:"hidden" },
  panel: { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:22 },
  input: { width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"10px 14px", color:"#e2e8f0", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"inherit" },
  tt:    { background:"#1e293b", border:"1px solid #334155", borderRadius:8, fontSize:13 },
};

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={G.card}>
      <div style={{ fontSize:24, marginBottom:4 }}>{icon}</div>
      <div style={{ fontSize:10, color:"#94a3b8", letterSpacing:1, textTransform:"uppercase" }}>{label}</div>
      <div style={{ fontSize:30, fontWeight:800, color, fontFamily:"'Syne',sans-serif", lineHeight:1.1, marginTop:3 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:"#64748b", marginTop:3 }}>{sub}</div>}
      <div style={{ position:"absolute", right:-18, bottom:-18, width:60, height:60, borderRadius:"50%", background:color, opacity:0.07 }} />
    </div>
  );
}
function RiskBadge({ risk }) {
  return <span style={{ padding:"3px 9px", borderRadius:20, fontSize:10, fontWeight:600, background:`${RISK_COLORS[risk]}22`, color:RISK_COLORS[risk], border:`1px solid ${RISK_COLORS[risk]}44` }}>{risk}</span>;
}
function Toast({ toast }) {
  if (!toast) return null;
  const col = { success:"#22c55e", edit:"#f59e0b", delete:"#ef4444", info:"#6366f1" }[toast.type]||"#22c55e";
  const ico = { success:"✅", edit:"✏️", delete:"🗑", info:"ℹ️" }[toast.type]||"✅";
  return <div style={{ position:"fixed", top:22, right:22, zIndex:3000, padding:"11px 18px", borderRadius:11, background:`${col}18`, border:`1px solid ${col}44`, color:col, fontSize:13, fontWeight:600, boxShadow:"0 8px 30px rgba(0,0,0,0.4)", maxWidth:320 }}>{ico} {toast.msg}</div>;
}
function ScoreField({ label, field, value, onChange, color, error }) {
  const pct = Math.min(100, Math.max(0, parseInt(value)||0));
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <label style={{ fontSize:12, color:"#94a3b8" }}>{label}</label>
        <span style={{ fontSize:12, fontWeight:700, color:pct>=75?"#22c55e":pct>=50?"#f59e0b":pct?"#ef4444":"#475569" }}>{pct}/100</span>
      </div>
      <input type="number" min="0" max="100" placeholder="0–100" value={value} onChange={e=>onChange(field,e.target.value)}
        style={{ ...G.input, borderColor:error?"#ef4444":"rgba(255,255,255,0.12)" }}
        onFocus={e=>(e.target.style.borderColor=color)}
        onBlur={e=>(e.target.style.borderColor=error?"#ef4444":"rgba(255,255,255,0.12)")} />
      <div style={{ height:3, borderRadius:2, background:"rgba(255,255,255,0.06)", marginTop:5, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color, transition:"width 0.3s", borderRadius:2 }} />
      </div>
      {error && <div style={{ fontSize:11, color:"#ef4444", marginTop:3 }}>⚠ {error}</div>}
    </div>
  );
}
function avatarBg(id) { const s=String(id); return `linear-gradient(135deg,${SUB_COLORS[s.charCodeAt(0)%5]},${SUB_COLORS[(s.charCodeAt(0)+2)%5]})`; }
function initials(name) { return (name||"?").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase(); }

/* ═══════════════════════════════════════════════════════
   HEADER
═══════════════════════════════════════════════════════ */
function Header({ user, tabs, activeTab, setActiveTab, onLogout, rightSlot }) {
  const roleColor = user.role==="admin"?"#f59e0b":user.role==="teacher"?"#22d3ee":"#a78bfa";
  const roleLabel = { admin:"Admin", teacher:"Teacher", student:"Student" }[user.role]||"";
  return (
    <div style={{ background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)", borderBottom:"1px solid rgba(99,102,241,0.2)", padding:"14px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:200, backdropFilter:"blur(20px)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:11 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>📊</div>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:800, color:"#fff" }}>EduAnalytics</div>
          <div style={{ fontSize:9, color:"#6366f1", letterSpacing:2, textTransform:"uppercase" }}>Performance Intelligence</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:5, alignItems:"center" }}>
        {tabs.map(t=>(
          <button key={t.key} onClick={()=>setActiveTab(t.key)} style={{ padding:"7px 14px", borderRadius:7, border:"1px solid", fontSize:12, fontWeight:500, cursor:"pointer", transition:"all 0.2s", borderColor:activeTab===t.key?"#6366f1":"rgba(255,255,255,0.1)", background:activeTab===t.key?"rgba(99,102,241,0.2)":"transparent", color:activeTab===t.key?"#a5b4fc":"#64748b" }}>{t.label}</button>
        ))}
        {rightSlot}
        <div style={{ display:"flex", alignItems:"center", gap:9, marginLeft:8, paddingLeft:11, borderLeft:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#e2e8f0" }}>{user.name}</div>
            <div style={{ fontSize:10, color:roleColor, fontWeight:600 }}>{roleLabel}</div>
          </div>
          <button onClick={onLogout} style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:"#ef4444", width:30, height:30, borderRadius:7, cursor:"pointer", fontSize:13 }}>⏻</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PERIOD ATTENDANCE TAKER  (Teacher)
═══════════════════════════════════════════════════════ */
function AttendanceTaker({ teacher, students, records, setRecords, classes, showToast }) {
  const myStudents = students.filter(s => s.classId === teacher.classId);
  const myClass    = classes.find(c => c.id === teacher.classId);

  const [date,    setDate]    = useState(todayISO());
  const [period,  setPeriod]  = useState(1);
  const [present, setPresent] = useState({});
  const [saved,   setSaved]   = useState(false);

  const selPeriod = PERIODS.find(p => p.no === period);

  // When date/period changes, load existing records into state
  function loadSlot(d, p) {
    setDate(d); setPeriod(p); setSaved(false);
    const existing = {};
    myStudents.forEach(s => {
      const rec = records.find(r => r.studentId===s.id && r.date===d && r.period===p && r.classId===teacher.classId);
      existing[s.id] = rec ? rec.present : false;
    });
    setPresent(existing);
  }

  // Initialise on first render
  useState(() => { loadSlot(date, period); });

  function toggleAll(val) { const u={}; myStudents.forEach(s=>u[s.id]=val); setPresent(u); }
  function toggle(id)     { setPresent(p=>({...p,[id]:!p[id]})); setSaved(false); }

  function save() {
    setRecords(prev => {
      // Remove old records for this slot
      const filtered = prev.filter(r => !(r.date===date && r.period===period && r.classId===teacher.classId));
      // Add new
      const fresh = myStudents.map(s => ({
        id: `${date}-${teacher.classId}-${period}-${s.id}`,
        classId: teacher.classId,
        studentId: s.id,
        date, period,
        subject: selPeriod.subject,
        present: !!present[s.id],
      }));
      return [...filtered, ...fresh];
    });
    setSaved(true);
    showToast(`Attendance saved for ${selPeriod.label} — ${fmtDate(date)}`, "success");
  }

  const presentCount = Object.values(present).filter(Boolean).length;
  const totalCount   = myStudents.length;

  return (
    <div>
      {/* Top controls */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:14, marginBottom:22, alignItems:"end" }}>
        <div>
          <label style={{ fontSize:11, color:"#94a3b8", display:"block", marginBottom:6, letterSpacing:1, textTransform:"uppercase" }}>📅 Date</label>
          <input type="date" value={date} max={todayISO()}
            onChange={e=>loadSlot(e.target.value, period)}
            style={{ ...G.input, border:"1px solid rgba(255,255,255,0.12)", cursor:"pointer" }} />
        </div>
        <div>
          <label style={{ fontSize:11, color:"#94a3b8", display:"block", marginBottom:6, letterSpacing:1, textTransform:"uppercase" }}>🕐 Period</label>
          <select value={period} onChange={e=>loadSlot(date, +e.target.value)}
            style={{ ...G.input, border:"1px solid rgba(255,255,255,0.12)", cursor:"pointer" }}>
            {PERIODS.map(p=>(
              <option key={p.no} value={p.no}>{p.label} — {p.subject} ({p.time})</option>
            ))}
          </select>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>toggleAll(true)}  style={{ padding:"10px 14px", borderRadius:9, border:"1px solid rgba(34,197,94,0.4)", background:"rgba(34,197,94,0.1)", color:"#22c55e", cursor:"pointer", fontSize:12, fontWeight:600, whiteSpace:"nowrap" }}>✅ All Present</button>
          <button onClick={()=>toggleAll(false)} style={{ padding:"10px 14px", borderRadius:9, border:"1px solid rgba(239,68,68,0.4)", background:"rgba(239,68,68,0.1)", color:"#ef4444", cursor:"pointer", fontSize:12, fontWeight:600, whiteSpace:"nowrap" }}>❌ All Absent</button>
        </div>
      </div>

      {/* Class info bar */}
      <div style={{ marginBottom:18, padding:"12px 18px", borderRadius:11, background:"rgba(99,102,241,0.07)", border:"1px solid rgba(99,102,241,0.18)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
        <div>
          <span style={{ fontSize:12, color:"#a5b4fc", fontWeight:600 }}>{myClass?.name}</span>
          <span style={{ fontSize:12, color:"#64748b", margin:"0 8px" }}>•</span>
          <span style={{ fontSize:12, color:"#94a3b8" }}>{selPeriod?.label} ({selPeriod?.time})</span>
          <span style={{ fontSize:12, color:"#64748b", margin:"0 8px" }}>•</span>
          <span style={{ fontSize:12, color:"#94a3b8" }}>{fmtDate(date)}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={{ fontSize:13, color:"#22c55e", fontWeight:700 }}>Present: {presentCount}</span>
          <span style={{ fontSize:13, color:"#ef4444", fontWeight:700 }}>Absent: {totalCount - presentCount}</span>
          <div style={{ width:80, height:6, borderRadius:3, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
            <div style={{ height:"100%", width:totalCount?`${(presentCount/totalCount)*100}%`:"0%", background:"#22c55e", borderRadius:3, transition:"width 0.3s" }} />
          </div>
          <span style={{ fontSize:12, color:"#64748b" }}>{totalCount ? Math.round((presentCount/totalCount)*100) : 0}%</span>
        </div>
      </div>

      {/* Student list */}
      {myStudents.length === 0 ? (
        <div style={{ textAlign:"center", padding:"40px 20px", color:"#475569" }}>
          <div style={{ fontSize:36, marginBottom:8 }}>🎓</div>
          <div>No students in your class yet.</div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:10, marginBottom:22 }}>
          {myStudents.map(s => {
            const isPresent = !!present[s.id];
            const stuAtt    = getAttendancePct(s.id, records);
            return (
              <button key={s.id} onClick={()=>toggle(s.id)} style={{
                display:"flex", alignItems:"center", gap:12, padding:"14px 16px", borderRadius:12,
                border:`2px solid ${isPresent?"rgba(34,197,94,0.5)":"rgba(239,68,68,0.35)"}`,
                background:isPresent?"rgba(34,197,94,0.07)":"rgba(239,68,68,0.05)",
                cursor:"pointer", textAlign:"left", transition:"all 0.2s",
              }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:avatarBg(s.id), display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff", flexShrink:0 }}>
                  {initials(s.name)}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"#e2e8f0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.name}</div>
                  <div style={{ fontSize:11, color:"#475569" }}>
                    {s.rollNo}
                    {stuAtt !== null && <span style={{ marginLeft:8, color:stuAtt>=75?"#22c55e":stuAtt>=55?"#f59e0b":"#ef4444" }}>Overall: {stuAtt}%</span>}
                  </div>
                </div>
                <div style={{ width:30, height:30, borderRadius:"50%", background:isPresent?"rgba(34,197,94,0.2)":"rgba(239,68,68,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                  {isPresent ? "✅" : "❌"}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Save */}
      {myStudents.length > 0 && (
        <button onClick={save} style={{
          width:"100%", padding:"14px 0", borderRadius:12, border:"none",
          background: saved ? "rgba(34,197,94,0.3)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
          color:"#fff", cursor:saved?"default":"pointer", fontSize:14, fontWeight:700,
          fontFamily:"'Syne',sans-serif", boxShadow: saved?"none":"0 4px 18px rgba(99,102,241,0.38)",
          transition:"all 0.3s",
        }}>
          {saved ? "✅ Attendance Saved!" : `Save Attendance for ${selPeriod?.label}`}
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ATTENDANCE HISTORY  (Teacher — view all records)
═══════════════════════════════════════════════════════ */
function AttendanceHistory({ classId, students, records }) {
  const myStudents = students.filter(s => s.classId === classId);
  const myRecords  = records.filter(r => r.classId === classId);

  const [selStudent, setSelStudent] = useState("all");
  const [selMonth,   setSelMonth]   = useState("");

  // Unique dates
  const allDates = [...new Set(myRecords.map(r=>r.date))].sort().reverse();
  const months   = [...new Set(allDates.map(d=>d.slice(0,7)))].sort().reverse();

  const filteredRecords = myRecords.filter(r => {
    const ms = selStudent==="all" || r.studentId===selStudent;
    const mm = !selMonth || r.date.startsWith(selMonth);
    return ms && mm;
  });

  // Group by date → period for display
  const byDate = {};
  filteredRecords.forEach(r => {
    if (!byDate[r.date]) byDate[r.date] = {};
    if (!byDate[r.date][r.period]) byDate[r.date][r.period] = [];
    byDate[r.date][r.period].push(r);
  });
  const sortedDates = Object.keys(byDate).sort().reverse();

  return (
    <div>
      {/* Filters */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:18 }}>
        <div>
          <label style={{ fontSize:11, color:"#94a3b8", display:"block", marginBottom:5 }}>Filter by Student</label>
          <select value={selStudent} onChange={e=>setSelStudent(e.target.value)}
            style={{ ...G.input, border:"1px solid rgba(255,255,255,0.12)", cursor:"pointer" }}>
            <option value="all">All Students</option>
            {myStudents.map(s=><option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize:11, color:"#94a3b8", display:"block", marginBottom:5 }}>Filter by Month</label>
          <select value={selMonth} onChange={e=>setSelMonth(e.target.value)}
            style={{ ...G.input, border:"1px solid rgba(255,255,255,0.12)", cursor:"pointer" }}>
            <option value="">All Months</option>
            {months.map(m=><option key={m} value={m}>{new Date(m+"-01").toLocaleDateString("en-IN",{month:"long",year:"numeric"})}</option>)}
          </select>
        </div>
      </div>

      {sortedDates.length === 0 ? (
        <div style={{ textAlign:"center", padding:"40px 20px", color:"#475569" }}>
          <div style={{ fontSize:36, marginBottom:8 }}>📋</div>
          <div>No attendance records found.</div>
        </div>
      ) : sortedDates.map(date => (
        <div key={date} style={{ marginBottom:18, ...G.panel }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:"#fff", marginBottom:14, display:"flex", alignItems:"center", gap:10 }}>
            📅 {fmtDate(date)}
          </div>
          {Object.keys(byDate[date]).sort((a,b)=>+a-+b).map(pno => {
            const recs = byDate[date][pno];
            const p    = PERIODS.find(x=>x.no===+pno);
            const presentRecs = recs.filter(r=>r.present);
            return (
              <div key={pno} style={{ marginBottom:10, padding:"10px 14px", borderRadius:10, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <div>
                    <span style={{ fontSize:12, fontWeight:700, color:"#a5b4fc" }}>Period {pno}</span>
                    <span style={{ fontSize:11, color:"#64748b", margin:"0 8px" }}>•</span>
                    <span style={{ fontSize:11, color:"#94a3b8" }}>{p?.subject}</span>
                    <span style={{ fontSize:11, color:"#64748b", margin:"0 8px" }}>•</span>
                    <span style={{ fontSize:11, color:"#64748b" }}>{p?.time}</span>
                  </div>
                  <span style={{ fontSize:12, fontWeight:600, color:"#22c55e" }}>{presentRecs.length}/{recs.length} present</span>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {recs.map(r => {
                    const stu = myStudents.find(s=>s.id===r.studentId);
                    return (
                      <span key={r.studentId} style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:500, background:r.present?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.1)", color:r.present?"#22c55e":"#ef4444", border:`1px solid ${r.present?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.25)"}` }}>
                        {r.present?"✅":"❌"} {stu?.name||r.studentId}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STUDENT ATTENDANCE VIEW  (Student self-portal)
═══════════════════════════════════════════════════════ */
function StudentAttendanceView({ student, records }) {
  const myRecords = records.filter(r => r.studentId === student.id).sort((a,b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return a.period - b.period;
  });

  const totalPeriods   = myRecords.length;
  const presentPeriods = myRecords.filter(r=>r.present).length;
  const absentPeriods  = totalPeriods - presentPeriods;
  const pct            = totalPeriods ? parseFloat(((presentPeriods/totalPeriods)*100).toFixed(1)) : null;

  // Per-subject stats
  const subjectStats = PERIODS.map(p => {
    const subRecs = myRecords.filter(r=>r.subject===p.subject);
    const pr      = subRecs.filter(r=>r.present).length;
    return { subject:p.subject, total:subRecs.length, present:pr, pct:subRecs.length?Math.round((pr/subRecs.length)*100):null };
  }).filter(s=>s.total>0);

  const [selMonth, setSelMonth] = useState("");
  const months = [...new Set(myRecords.map(r=>r.date.slice(0,7)))].sort().reverse();

  const filtered = myRecords.filter(r => !selMonth || r.date.startsWith(selMonth));

  // Group by date
  const byDate = {};
  filtered.forEach(r => { if(!byDate[r.date]) byDate[r.date]=[]; byDate[r.date].push(r); });
  const sortedDates = Object.keys(byDate).sort().reverse();

  const attColor = pct===null?"#64748b":pct>=75?"#22c55e":pct>=55?"#f59e0b":"#ef4444";
  const attStatus = pct===null?"No records yet":pct>=75?"Good Standing ✅":pct>=55?"Needs Improvement ⚠️":"Critical — Below Minimum 🚨";

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:13, marginBottom:22 }}>
        <StatCard label="Overall Attendance" value={pct!==null?`${pct}%`:"—"} sub={attStatus} color={attColor} icon="📅" />
        <StatCard label="Periods Present"    value={presentPeriods} sub={`out of ${totalPeriods}`} color="#22c55e" icon="✅" />
        <StatCard label="Periods Absent"     value={absentPeriods}  sub={`out of ${totalPeriods}`} color="#ef4444" icon="❌" />
        <StatCard label="Total Periods"      value={totalPeriods}   sub="recorded so far"          color="#6366f1" icon="📋" />
      </div>

      {/* Attendance % bar */}
      {pct !== null && (
        <div style={{ marginBottom:22, ...G.panel }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:"#fff" }}>📊 Attendance Progress</div>
            <div style={{ fontSize:22, fontWeight:800, fontFamily:"'Syne',sans-serif", color:attColor }}>{pct}%</div>
          </div>
          <div style={{ height:14, borderRadius:7, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, borderRadius:7, background:`linear-gradient(90deg,${attColor},${attColor}99)`, transition:"width 0.8s ease" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
            <span style={{ fontSize:11, color:"#64748b" }}>0%</span>
            <span style={{ fontSize:11, color:"#f59e0b" }}>55% (Min)</span>
            <span style={{ fontSize:11, color:"#22c55e" }}>75% (Good)</span>
            <span style={{ fontSize:11, color:"#64748b" }}>100%</span>
          </div>
          <div style={{ display:"flex", gap:2, marginTop:10 }}>
            {[55,75].map(thresh=>(
              <div key={thresh} style={{ position:"relative", flex:thresh===55?thresh:75-55 }}>
                <div style={{ height:4, borderRadius:2, background:pct>=thresh?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.2)" }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject-wise attendance */}
      {subjectStats.length > 0 && (
        <div style={{ marginBottom:22, ...G.panel }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:"#fff", marginBottom:14 }}>📚 Subject-wise Attendance</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:10 }}>
            {subjectStats.map((ss,i) => (
              <div key={ss.subject} style={{ padding:"12px 14px", borderRadius:11, background:"rgba(255,255,255,0.03)", border:`1px solid ${SUB_COLORS[i%SUB_COLORS.length]}22` }}>
                <div style={{ fontSize:11, color:"#64748b", marginBottom:4, textTransform:"uppercase", letterSpacing:0.8 }}>{ss.subject}</div>
                <div style={{ fontSize:22, fontWeight:800, fontFamily:"'Syne',sans-serif", color:ss.pct>=75?"#22c55e":ss.pct>=55?"#f59e0b":"#ef4444" }}>
                  {ss.pct}%
                </div>
                <div style={{ fontSize:11, color:"#475569", marginTop:2 }}>{ss.present}/{ss.total} periods</div>
                <div style={{ height:3, borderRadius:2, background:"rgba(255,255,255,0.06)", marginTop:7, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${ss.pct}%`, background:SUB_COLORS[i%SUB_COLORS.length], borderRadius:2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Period-wise log */}
      <div style={G.panel}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:"#fff" }}>📋 Period-wise Log</div>
          <select value={selMonth} onChange={e=>setSelMonth(e.target.value)}
            style={{ ...G.input, width:"auto", fontSize:12, padding:"7px 12px", border:"1px solid rgba(255,255,255,0.12)", cursor:"pointer" }}>
            <option value="">All Months</option>
            {months.map(m=><option key={m} value={m}>{new Date(m+"-01").toLocaleDateString("en-IN",{month:"long",year:"numeric"})}</option>)}
          </select>
        </div>

        {sortedDates.length === 0 ? (
          <div style={{ textAlign:"center", padding:"30px 20px", color:"#475569" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>📭</div>
            <div>No records found for selected month.</div>
          </div>
        ) : sortedDates.map(date => (
          <div key={date} style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#64748b", marginBottom:8, letterSpacing:0.5 }}>{fmtDate(date)}</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:7 }}>
              {byDate[date].map(r => {
                const p = PERIODS.find(x=>x.no===r.period);
                return (
                  <div key={r.id} style={{
                    padding:"10px 12px", borderRadius:10,
                    background:r.present?"rgba(34,197,94,0.07)":"rgba(239,68,68,0.06)",
                    border:`1px solid ${r.present?"rgba(34,197,94,0.25)":"rgba(239,68,68,0.2)"}`,
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                      <span style={{ fontSize:11, fontWeight:700, color:"#a5b4fc" }}>P{r.period}</span>
                      <span style={{ fontSize:14 }}>{r.present?"✅":"❌"}</span>
                    </div>
                    <div style={{ fontSize:11, color:"#94a3b8", fontWeight:500 }}>{r.subject}</div>
                    <div style={{ fontSize:10, color:"#475569", marginTop:1 }}>{p?.time}</div>
                    <div style={{ marginTop:6, fontSize:11, fontWeight:600, color:r.present?"#22c55e":"#ef4444" }}>
                      {r.present?"Present":"Absent"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MODALS (Student & Teacher)
═══════════════════════════════════════════════════════ */
const EMPTY_FORM = { name:"", rollNo:"", password:"", gender:"F", classId:"", math:"", science:"", english:"", programming:"", ds:"" };

function StudentModal({ mode, student, classes, onSave, onClose }) {
  const isEdit = mode==="edit";
  const [step, setStep]     = useState(1);
  const [form, setForm]     = useState(isEdit ? { name:student.name, rollNo:student.rollNo, password:student.password||student.rollNo, gender:student.gender, classId:student.classId, math:String(student.math), science:String(student.science), english:String(student.english), programming:String(student.programming), ds:String(student.ds) } : { ...EMPTY_FORM, classId:classes[0]?.id||"" });
  const [errors, setErrors] = useState({});
  const [done, setDone]     = useState(false);

  function set(f,v) { setForm(p=>({...p,[f]:v})); if(errors[f]) setErrors(e=>({...e,[f]:null})); }

  const allFilled = SUB_KEYS.every(k=>form[k]!=="");
  const preGPA    = allFilled ? calcGPA(form, 75) : null;
  const preRisk   = preGPA ? calcRisk(preGPA, 75) : null;

  function v1() { const e={}; if(!form.name.trim()) e.name="Required"; if(!form.rollNo.trim()) e.rollNo="Required"; if(!form.classId) e.classId="Select a class"; return e; }
  function v2() { const e={}; SUB_KEYS.forEach(k=>{ if(form[k]===""||+form[k]<0||+form[k]>100) e[k]="Enter 0–100"; }); return e; }
  function next() { const e=v1(); if(Object.keys(e).length){setErrors(e);return;} setErrors({}); setStep(2); }
  function submit() {
    const e=v2(); if(Object.keys(e).length){setErrors(e);return;}
    const built = { ...(isEdit?student:{}), id:isEdit?student.id:uid(), name:form.name.trim(), rollNo:form.rollNo.trim(), password:form.password.trim()||form.rollNo.trim(), gender:form.gender, classId:form.classId, math:+form.math, science:+form.science, english:+form.english, programming:+form.programming, ds:+form.ds, prev_gpa:isEdit?(student.prev_gpa||7):7 };
    onSave(built);
    setDone(true);
    setTimeout(onClose, 1700);
  }

  const ac = isEdit?"#f59e0b":"#6366f1";
  const ag = isEdit?"linear-gradient(135deg,#f59e0b,#f97316)":"linear-gradient(135deg,#6366f1,#8b5cf6)";

  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",padding:20 }}>
      <div style={{ background:"#0f172a",border:`1px solid ${ac}55`,borderRadius:20,width:"100%",maxWidth:530,boxShadow:"0 25px 80px rgba(0,0,0,0.6)",overflow:"hidden" }}>
        <div style={{ padding:"20px 24px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"#fff" }}>{done?(isEdit?"✅ Updated!":"✅ Added!"):(isEdit?"Edit Student":"Add New Student")}</div>
            {!done && <div style={{ fontSize:11,color:"#64748b",marginTop:2 }}>Step {step} of 2 — {step===1?"Basic Info":"Subject Scores"}</div>}
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.06)",border:"none",color:"#94a3b8",width:30,height:30,borderRadius:7,cursor:"pointer",fontSize:15 }}>✕</button>
        </div>
        {!done && <div style={{ height:3,background:"rgba(255,255,255,0.05)" }}><div style={{ height:"100%",width:step===1?"50%":"100%",background:ag,transition:"width 0.4s" }} /></div>}
        <div style={{ padding:"22px 24px" }}>
          {done ? (
            <div style={{ textAlign:"center",padding:"12px 0" }}>
              <div style={{ fontSize:50,marginBottom:12 }}>🎉</div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:"#fff" }}>{form.name} {isEdit?"updated":"added"}!</div>
            </div>
          ) : step===1 ? (
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <div>
                  <label style={{ fontSize:12,color:"#94a3b8",display:"block",marginBottom:5 }}>Full Name *</label>
                  <input placeholder="Full name" value={form.name} onChange={e=>set("name",e.target.value)} style={{ ...G.input,borderColor:errors.name?"#ef4444":"rgba(255,255,255,0.12)" }} onFocus={e=>(e.target.style.borderColor=ac)} onBlur={e=>(e.target.style.borderColor=errors.name?"#ef4444":"rgba(255,255,255,0.12)")} />
                  {errors.name && <div style={{ fontSize:10,color:"#ef4444",marginTop:2 }}>⚠ {errors.name}</div>}
                </div>
                <div>
                  <label style={{ fontSize:12,color:"#94a3b8",display:"block",marginBottom:5 }}>Roll Number *</label>
                  <input placeholder="e.g. 2024011" value={form.rollNo} onChange={e=>set("rollNo",e.target.value)} style={{ ...G.input,borderColor:errors.rollNo?"#ef4444":"rgba(255,255,255,0.12)" }} onFocus={e=>(e.target.style.borderColor=ac)} onBlur={e=>(e.target.style.borderColor=errors.rollNo?"#ef4444":"rgba(255,255,255,0.12)")} />
                  {errors.rollNo && <div style={{ fontSize:10,color:"#ef4444",marginTop:2 }}>⚠ {errors.rollNo}</div>}
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <div>
                  <label style={{ fontSize:12,color:"#94a3b8",display:"block",marginBottom:5 }}>Student Password</label>
                  <input placeholder="Default: roll number" value={form.password} onChange={e=>set("password",e.target.value)} style={{ ...G.input,borderColor:"rgba(255,255,255,0.12)" }} onFocus={e=>(e.target.style.borderColor=ac)} onBlur={e=>(e.target.style.borderColor="rgba(255,255,255,0.12)")} />
                </div>
                <div>
                  <label style={{ fontSize:12,color:"#94a3b8",display:"block",marginBottom:5 }}>Assign Class *</label>
                  <select value={form.classId} onChange={e=>set("classId",e.target.value)} style={{ ...G.input,borderColor:errors.classId?"#ef4444":"rgba(255,255,255,0.12)",cursor:"pointer" }}>
                    <option value="">Select class…</option>
                    {classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.classId && <div style={{ fontSize:10,color:"#ef4444",marginTop:2 }}>⚠ {errors.classId}</div>}
                </div>
              </div>
              <div>
                <label style={{ fontSize:12,color:"#94a3b8",display:"block",marginBottom:6 }}>Gender</label>
                <div style={{ display:"flex",gap:10 }}>
                  {[["F","👩 Female"],["M","👦 Male"]].map(([v,l])=>(
                    <button key={v} onClick={()=>set("gender",v)} style={{ flex:1,padding:"9px 0",borderRadius:9,cursor:"pointer",fontSize:12,fontWeight:500,border:`1px solid ${form.gender===v?ac:"rgba(255,255,255,0.1)"}`,background:form.gender===v?`${ac}22`:"rgba(255,255,255,0.03)",color:form.gender===v?ac:"#64748b" }}>{l}</button>
                  ))}
                </div>
              </div>
              <button onClick={next} style={{ padding:"12px 0",borderRadius:11,border:"none",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Syne',sans-serif",background:ag,boxShadow:`0 4px 16px ${ac}44` }}>Continue to Scores →</button>
            </div>
          ) : (
            <div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:13,marginBottom:14 }}>
                {SUB_KEYS.map((k,i)=>(
                  <div key={k} style={{ gridColumn:i===4?"1 / -1":undefined }}>
                    <ScoreField label={SUB_LABELS[i]} field={k} value={form[k]} onChange={set} color={SUB_COLORS[i]} error={errors[k]} />
                  </div>
                ))}
              </div>
              {preGPA && (
                <div style={{ marginBottom:14,padding:13,borderRadius:10,background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div><div style={{ fontSize:10,color:"#64748b",letterSpacing:1,textTransform:"uppercase" }}>Live Preview</div><div style={{ fontSize:12,color:"#94a3b8",marginTop:1 }}>{form.name||"Student"}'s estimate</div></div>
                  <div style={{ display:"flex",gap:16 }}>
                    <div style={{ textAlign:"center" }}><div style={{ fontSize:10,color:"#64748b" }}>GPA</div><div style={{ fontSize:21,fontWeight:800,fontFamily:"'Syne',sans-serif",color:"#a5b4fc" }}>{preGPA}</div></div>
                    <div style={{ textAlign:"center" }}><div style={{ fontSize:10,color:"#64748b" }}>Risk</div><div style={{ fontSize:15,fontWeight:700,color:RISK_COLORS[preRisk] }}>{preRisk}</div></div>
                  </div>
                </div>
              )}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <button onClick={()=>{setStep(1);setErrors({});}} style={{ padding:"12px 0",borderRadius:11,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#94a3b8",cursor:"pointer",fontSize:13,fontWeight:600 }}>← Back</button>
                <button onClick={submit} style={{ padding:"12px 0",borderRadius:11,border:"none",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Syne',sans-serif",background:isEdit?"linear-gradient(135deg,#f59e0b,#f97316)":"linear-gradient(135deg,#22c55e,#16a34a)",boxShadow:isEdit?"0 4px 14px rgba(245,158,11,0.3)":"0 4px 14px rgba(34,197,94,0.28)" }}>
                  {isEdit?"✓ Save Changes":"✓ Add Student"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TeacherModal({ mode, teacher, classes, onSave, onClose }) {
  const isEdit = mode==="edit";
  const [form, setForm]     = useState(isEdit?{name:teacher.name,username:teacher.username,password:teacher.password,classId:teacher.classId}:{name:"",username:"",password:"",classId:classes[0]?.id||""});
  const [errors, setErrors] = useState({});
  const [done, setDone]     = useState(false);
  function set(f,v) { setForm(p=>({...p,[f]:v})); if(errors[f]) setErrors(e=>({...e,[f]:null})); }
  function submit() {
    const e={}; if(!form.name.trim()) e.name="Required"; if(!form.username.trim()) e.username="Required"; if(!form.password.trim()) e.password="Required"; if(!form.classId) e.classId="Select a class";
    if(Object.keys(e).length){setErrors(e);return;}
    onSave({...(isEdit?teacher:{}),id:isEdit?teacher.id:uid(),name:form.name.trim(),username:form.username.trim(),password:form.password.trim(),classId:form.classId});
    setDone(true); setTimeout(onClose,1600);
  }
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",padding:20 }}>
      <div style={{ background:"#0f172a",border:"1px solid rgba(34,197,94,0.3)",borderRadius:20,width:"100%",maxWidth:460,boxShadow:"0 25px 80px rgba(0,0,0,0.6)",overflow:"hidden" }}>
        <div style={{ padding:"20px 24px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:"#fff" }}>{done?"✅ Done!":isEdit?"Edit Teacher":"Add Teacher"}</div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.06)",border:"none",color:"#94a3b8",width:30,height:30,borderRadius:7,cursor:"pointer",fontSize:15 }}>✕</button>
        </div>
        <div style={{ padding:"22px 24px" }}>
          {done ? <div style={{ textAlign:"center",padding:"12px 0" }}><div style={{ fontSize:50,marginBottom:10 }}>👩‍🏫</div><div style={{ fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:"#fff" }}>{form.name} {isEdit?"updated":"added"}!</div></div> : (
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div><label style={{ fontSize:12,color:"#94a3b8",display:"block",marginBottom:5 }}>Full Name *</label><input placeholder="Teacher's full name" value={form.name} onChange={e=>set("name",e.target.value)} style={{ ...G.input,borderColor:errors.name?"#ef4444":"rgba(255,255,255,0.12)" }} onFocus={e=>(e.target.style.borderColor="#22c55e")} onBlur={e=>(e.target.style.borderColor=errors.name?"#ef4444":"rgba(255,255,255,0.12)")} />{errors.name&&<div style={{ fontSize:10,color:"#ef4444",marginTop:2 }}>⚠ {errors.name}</div>}</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                <div><label style={{ fontSize:12,color:"#94a3b8",display:"block",marginBottom:5 }}>Username *</label><input placeholder="Login username" value={form.username} onChange={e=>set("username",e.target.value)} style={{ ...G.input,borderColor:errors.username?"#ef4444":"rgba(255,255,255,0.12)" }} onFocus={e=>(e.target.style.borderColor="#22c55e")} onBlur={e=>(e.target.style.borderColor=errors.username?"#ef4444":"rgba(255,255,255,0.12)")} />{errors.username&&<div style={{ fontSize:10,color:"#ef4444",marginTop:2 }}>⚠ {errors.username}</div>}</div>
                <div><label style={{ fontSize:12,color:"#94a3b8",display:"block",marginBottom:5 }}>Password *</label><input placeholder="Login password" value={form.password} onChange={e=>set("password",e.target.value)} style={{ ...G.input,borderColor:errors.password?"#ef4444":"rgba(255,255,255,0.12)" }} onFocus={e=>(e.target.style.borderColor="#22c55e")} onBlur={e=>(e.target.style.borderColor=errors.password?"#ef4444":"rgba(255,255,255,0.12)")} />{errors.password&&<div style={{ fontSize:10,color:"#ef4444",marginTop:2 }}>⚠ {errors.password}</div>}</div>
              </div>
              <div><label style={{ fontSize:12,color:"#94a3b8",display:"block",marginBottom:5 }}>Assign Class *</label><select value={form.classId} onChange={e=>set("classId",e.target.value)} style={{ ...G.input,borderColor:errors.classId?"#ef4444":"rgba(255,255,255,0.12)",cursor:"pointer" }}><option value="">Select class…</option>{classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>{errors.classId&&<div style={{ fontSize:10,color:"#ef4444",marginTop:2 }}>⚠ {errors.classId}</div>}</div>
              <button onClick={submit} style={{ padding:"12px 0",borderRadius:11,border:"none",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Syne',sans-serif",background:"linear-gradient(135deg,#22c55e,#16a34a)",boxShadow:"0 4px 14px rgba(34,197,94,0.3)",marginTop:4 }}>{isEdit?"✓ Save Changes":"✓ Add Teacher"}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DeleteDialog({ title, body, onConfirm, onClose }) {
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",padding:20 }}>
      <div style={{ background:"#0f172a",border:"1px solid rgba(239,68,68,0.35)",borderRadius:20,width:"100%",maxWidth:400,padding:"30px 26px",boxShadow:"0 25px 80px rgba(0,0,0,0.6)",textAlign:"center" }}>
        <div style={{ fontSize:44,marginBottom:12 }}>🗑️</div>
        <div style={{ fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:800,color:"#fff",marginBottom:7 }}>{title}</div>
        <div style={{ fontSize:13,color:"#94a3b8",marginBottom:20,lineHeight:1.6 }}>{body}</div>
        <div style={{ padding:"11px 14px",borderRadius:9,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",fontSize:12,color:"#64748b",marginBottom:22 }}>⚠️ This action cannot be undone.</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          <button onClick={onClose} style={{ padding:"11px 0",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#94a3b8",cursor:"pointer",fontSize:13,fontWeight:600 }}>Cancel</button>
          <button onClick={()=>{onConfirm();onClose();}} style={{ padding:"11px 0",borderRadius:10,border:"none",background:"linear-gradient(135deg,#ef4444,#dc2626)",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Syne',sans-serif",boxShadow:"0 4px 14px rgba(239,68,68,0.32)" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SHARED OVERVIEW CHARTS
═══════════════════════════════════════════════════════ */
function OverviewCharts({ students }) {
  if (!students || students.length === 0) return (
    <div style={{ textAlign:"center",padding:"60px 20px",color:"#475569" }}>
      <div style={{ fontSize:48,marginBottom:12 }}>📊</div>
      <div style={{ fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,color:"#64748b",marginBottom:6 }}>No student data yet</div>
      <div style={{ fontSize:13 }}>Add students to see analytics here.</div>
    </div>
  );
  const avgGPA     = safeAvg(students,"gpa");
  const highRisk   = students.filter(s=>s.risk==="High").length;
  const topStudent = safeMax(students,"gpa");
  const avgAtt     = safeAvg(students,"attendance");
  const subAvg     = SUB_KEYS.map((k,i)=>({ subject:SUB_LABELS[i], avg:parseFloat(safeAvg(students,k).toFixed(1)) }));
  const scatter    = students.map(s=>({ x:s.attendance, y:s.gpa, name:s.name, risk:s.risk }));
  return (
    <div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:24 }}>
        <StatCard label="Class Avg GPA"    value={avgGPA}         sub={`${students.length} students`}  color="#6366f1" icon="🎓" />
        <StatCard label="Avg Attendance"   value={`${avgAtt}%`}   sub="From period records"            color="#22d3ee" icon="📅" />
        <StatCard label="At-Risk Students" value={highRisk}        sub="Need intervention"              color="#ef4444" icon="⚠️" />
        <StatCard label="Top Performer"    value={topStudent.gpa} sub={topStudent.name}               color="#22c55e" icon="🏆" />
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:16 }}>
        <div style={G.panel}>
          <div style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#fff",marginBottom:16 }}>📈 GPA Trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={SEM_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="sem" stroke="#475569" tick={{ fontSize:11 }} />
              <YAxis domain={[4,10]} stroke="#475569" tick={{ fontSize:11 }} />
              <Tooltip contentStyle={G.tt} /><Legend />
              <Line type="monotone" dataKey="avg" stroke="#6366f1" strokeWidth={2.5} dot={{ fill:"#6366f1",r:3 }} name="Avg" />
              <Line type="monotone" dataKey="top" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Top" />
              <Line type="monotone" dataKey="low" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Low" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={G.panel}>
          <div style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#fff",marginBottom:16 }}>📚 Subject Avg</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={subAvg} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" domain={[40,100]} stroke="#475569" tick={{ fontSize:10 }} />
              <YAxis type="category" dataKey="subject" stroke="#475569" tick={{ fontSize:10 }} width={78} />
              <Tooltip contentStyle={G.tt} />
              <Bar dataKey="avg" radius={[0,5,5,0]}>{subAvg.map((_,i)=><Cell key={i} fill={SUB_COLORS[i]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={G.panel}>
        <div style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#fff",marginBottom:4 }}>🔍 Attendance vs GPA</div>
        <div style={{ fontSize:11,color:"#64748b",marginBottom:14 }}>Attendance now reflects period records — hover to explore</div>
        <ResponsiveContainer width="100%" height={200}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="x" unit="%" stroke="#475569" tick={{ fontSize:11 }} label={{ value:"Attendance %",position:"insideBottom",offset:-2,fill:"#64748b",fontSize:11 }} />
            <YAxis dataKey="y" domain={[3,10]} stroke="#475569" tick={{ fontSize:11 }} label={{ value:"GPA",angle:-90,position:"insideLeft",fill:"#64748b",fontSize:11 }} />
            <Tooltip contentStyle={G.tt} labelFormatter={(_,p)=>p?.[0]?.payload?.name||""} />
            <Scatter data={scatter}>{scatter.map((s,i)=><Cell key={i} fill={RISK_COLORS[s.risk]} opacity={0.85} />)}</Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div style={{ display:"flex",gap:16,marginTop:10,justifyContent:"center" }}>
          {["Low","Medium","High"].map(r=><div key={r} style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#94a3b8" }}><div style={{ width:8,height:8,borderRadius:"50%",background:RISK_COLORS[r] }} /> {r} Risk</div>)}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STUDENTS TABLE
═══════════════════════════════════════════════════════ */
function StudentsTable({ students, classes, onEdit, onDelete, canDelete, canAdd, onAdd, showClass=true }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const shown = students.filter(s => {
    const mr = filter==="All" || s.risk===filter;
    const ms = s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo.includes(search);
    return mr&&ms;
  });
  const cls = id => classes.find(c=>c.id===id)?.name||"—";

  return (
    <div>
      <div style={{ display:"flex",gap:9,marginBottom:16,flexWrap:"wrap",alignItems:"center" }}>
        <input placeholder="🔍 Search by name or roll no…" value={search} onChange={e=>setSearch(e.target.value)} style={{ ...G.input,flex:1,border:"1px solid rgba(255,255,255,0.1)" }} />
        {["All","Low","Medium","High"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ padding:"8px 14px",borderRadius:8,border:"1px solid",fontSize:11,fontWeight:500,cursor:"pointer",borderColor:filter===f?(RISK_COLORS[f]||"#6366f1"):"rgba(255,255,255,0.1)",background:filter===f?`${RISK_COLORS[f]||"#6366f1"}22`:"transparent",color:filter===f?(RISK_COLORS[f]||"#a5b4fc"):"#64748b" }}>{f}</button>
        ))}
        <span style={{ fontSize:11,color:"#475569" }}>{shown.length}/{students.length}</span>
        {canAdd && <button onClick={onAdd} style={{ padding:"8px 16px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:600,boxShadow:"0 3px 12px rgba(99,102,241,0.38)" }}>＋ Add Student</button>}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:selected?"1fr 330px":"1fr",gap:16 }}>
        <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,overflow:"auto" }}>
          {shown.length===0 ? (
            <div style={{ padding:40,textAlign:"center",color:"#475569" }}>
              <div style={{ fontSize:36,marginBottom:10 }}>🎓</div>
              <div style={{ fontSize:14 }}>{canAdd?"No students yet. Click '＋ Add Student' to get started.":"No students match your filter."}</div>
            </div>
          ) : (
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.07)",background:"rgba(99,102,241,0.08)" }}>
                  {["Student","Roll No",...(showClass?["Class"]:[]),"Attendance","GPA","Risk","Actions"].map(h=>(
                    <th key={h} style={{ padding:"12px 14px",textAlign:"left",fontSize:10,color:"#64748b",letterSpacing:1,textTransform:"uppercase",whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map(s=>(
                  <tr key={s.id} style={{ borderBottom:"1px solid rgba(255,255,255,0.04)",background:selected?.id===s.id?"rgba(99,102,241,0.07)":"transparent",transition:"background 0.15s" }}>
                    <td style={{ padding:"12px 14px" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:9 }}>
                        <div style={{ width:30,height:30,borderRadius:"50%",background:avatarBg(s.id),display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0 }}>{initials(s.name)}</div>
                        <div><div style={{ fontSize:13,fontWeight:500,color:"#e2e8f0" }}>{s.name}</div><div style={{ fontSize:10,color:"#475569" }}>{s.gender==="F"?"Female":"Male"}</div></div>
                      </div>
                    </td>
                    <td style={{ padding:"12px 14px",fontSize:12,color:"#94a3b8",fontFamily:"monospace" }}>{s.rollNo}</td>
                    {showClass && <td style={{ padding:"12px 14px",fontSize:11,color:"#64748b" }}>{cls(s.classId)}</td>}
                    <td style={{ padding:"12px 14px" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                        <div style={{ width:48,height:3,borderRadius:2,background:"rgba(255,255,255,0.1)",overflow:"hidden" }}><div style={{ height:"100%",width:`${s.attendance}%`,background:s.attendance>=75?"#22c55e":s.attendance>=55?"#f59e0b":"#ef4444",borderRadius:2 }} /></div>
                        <span style={{ fontSize:11,color:"#94a3b8" }}>{s.attendance}%</span>
                      </div>
                    </td>
                    <td style={{ padding:"12px 14px",fontSize:14,fontWeight:800,fontFamily:"'Syne',sans-serif",color:s.gpa>=8?"#22c55e":s.gpa>=6.5?"#f59e0b":"#ef4444" }}>{s.gpa}</td>
                    <td style={{ padding:"12px 14px" }}><RiskBadge risk={s.risk} /></td>
                    <td style={{ padding:"12px 14px" }}>
                      <div style={{ display:"flex",gap:6 }}>
                        <button onClick={()=>setSelected(selected?.id===s.id?null:s)} style={{ padding:"4px 10px",borderRadius:6,border:"1px solid rgba(99,102,241,0.4)",background:"rgba(99,102,241,0.1)",color:"#a5b4fc",cursor:"pointer",fontSize:11,fontWeight:600 }}>{selected?.id===s.id?"Close":"View"}</button>
                        <button onClick={()=>onEdit(s)} style={{ width:26,height:26,borderRadius:6,border:"1px solid rgba(245,158,11,0.35)",background:"rgba(245,158,11,0.1)",color:"#f59e0b",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center" }}>✏️</button>
                        {canDelete && <button onClick={()=>onDelete(s)} style={{ width:26,height:26,borderRadius:6,border:"1px solid rgba(239,68,68,0.35)",background:"rgba(239,68,68,0.1)",color:"#ef4444",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center" }}>🗑️</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {selected && (
          <div style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:16,padding:20 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
              <div><div style={{ fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:"#fff" }}>{selected.name}</div><div style={{ fontSize:11,color:"#64748b",marginTop:1 }}>Roll: {selected.rollNo}</div></div>
              <div style={{ display:"flex",gap:6 }}>
                <button onClick={()=>onEdit(selected)} style={{ padding:"4px 10px",borderRadius:6,border:"1px solid rgba(245,158,11,0.35)",background:"rgba(245,158,11,0.1)",color:"#f59e0b",cursor:"pointer",fontSize:11 }}>✏️ Edit</button>
                <button onClick={()=>setSelected(null)} style={{ background:"rgba(255,255,255,0.06)",border:"none",color:"#94a3b8",width:26,height:26,borderRadius:6,cursor:"pointer",fontSize:13 }}>✕</button>
              </div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16 }}>
              {[["GPA",selected.gpa,"#6366f1"],["Attendance",`${selected.attendance}%`,"#22d3ee"],["Predicted",calcGPA(selected,selected.attendance),"#22c55e"],["Risk",selected.risk,RISK_COLORS[selected.risk]]].map(([l,v,c])=>(
                <div key={l} style={{ background:"rgba(255,255,255,0.03)",borderRadius:9,padding:"10px 12px",border:`1px solid ${c}22` }}>
                  <div style={{ fontSize:10,color:"#64748b",marginBottom:2 }}>{l}</div>
                  <div style={{ fontSize:17,fontWeight:700,fontFamily:"'Syne',sans-serif",color:c }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:10,fontWeight:700,color:"#94a3b8",marginBottom:7,letterSpacing:1 }}>SUBJECT RADAR</div>
            <ResponsiveContainer width="100%" height={170}>
              <RadarChart data={SUB_KEYS.map((k,i)=>({ subject:SUB_LABELS[i],score:selected[k] }))}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill:"#64748b",fontSize:10 }} />
                <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false} />
                <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.22} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   LOGIN PAGE
═══════════════════════════════════════════════════════ */
function LoginPage({ teachers, students, onLogin }) {
  const [tab,  setTab]    = useState("staff");
  const [form, setForm]   = useState({ username:"", password:"" });
  const [show, setShow]   = useState(false);
  const [err,  setErr]    = useState("");
  const [busy, setBusy]   = useState(false);

  function attempt() {
    if (!form.username.trim()||!form.password.trim()) { setErr("Please fill in both fields."); return; }
    setBusy(true);
    setTimeout(() => {
      if (tab==="staff") {
        if (form.username===ADMIN.username&&form.password===ADMIN.password) { onLogin({...ADMIN}); return; }
        const t = teachers.find(t=>t.username===form.username&&t.password===form.password);
        if (t) { onLogin({...t,role:"teacher"}); return; }
        setErr("Invalid username or password.");
      } else {
        const s = students.find(s=>s.rollNo===form.username.trim()&&s.password===form.password.trim());
        if (s) { onLogin({...s,role:"student"}); return; }
        setErr("Invalid Roll Number or password.");
      }
      setBusy(false);
    }, 800);
  }

  return (
    <div style={{ ...G.page,display:"flex",alignItems:"center",justifyContent:"center",padding:20,position:"relative",overflow:"hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      {[["#6366f1","-8%","-8%"],["#8b5cf6","78%","68%"],["#22d3ee","58%","-12%"]].map(([c,l,t],i)=>(
        <div key={i} style={{ position:"absolute",left:l,top:t,width:380,height:380,borderRadius:"50%",background:c,opacity:0.07,filter:"blur(80px)",pointerEvents:"none" }} />
      ))}
      <div style={{ width:"100%",maxWidth:430,position:"relative",zIndex:1 }}>
        <div style={{ textAlign:"center",marginBottom:30 }}>
          <div style={{ width:54,height:54,borderRadius:15,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 13px" }}>📊</div>
          <div style={{ fontFamily:"'Syne',sans-serif",fontSize:25,fontWeight:800,color:"#fff" }}>EduAnalytics</div>
          <div style={{ fontSize:12,color:"#475569",marginTop:3 }}>Student Performance Intelligence Platform</div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:20,overflow:"hidden",boxShadow:"0 28px 70px rgba(0,0,0,0.45)" }}>
          <div style={{ display:"flex",borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
            {[["staff","🏫 Staff Login"],["student","🎓 Student Login"]].map(([key,lbl])=>(
              <button key={key} onClick={()=>{setTab(key);setErr("");setForm({username:"",password:""});}} style={{ flex:1,padding:"13px 0",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,transition:"all 0.2s",background:tab===key?"rgba(99,102,241,0.15)":"transparent",color:tab===key?"#a5b4fc":"#475569",borderBottom:tab===key?"2px solid #6366f1":"2px solid transparent" }}>{lbl}</button>
            ))}
          </div>
          <div style={{ padding:"26px 26px 30px" }}>
            <div style={{ fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:700,color:"#fff",marginBottom:3 }}>{tab==="staff"?"Welcome back!":"Student Portal"}</div>
            <div style={{ fontSize:12,color:"#475569",marginBottom:22 }}>{tab==="staff"?"Sign in with admin or teacher credentials":"Sign in with your Roll Number"}</div>
            <div style={{ marginBottom:15 }}>
              <label style={{ fontSize:12,color:"#94a3b8",display:"block",marginBottom:6 }}>{tab==="staff"?"Username":"Roll Number"}</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:15 }}>{tab==="staff"?"👤":"🎫"}</span>
                <input placeholder={tab==="staff"?"Enter username":"e.g. 2024001"} value={form.username} onChange={e=>{setForm(f=>({...f,username:e.target.value}));setErr("");}} onKeyDown={e=>e.key==="Enter"&&attempt()} style={{ ...G.input,paddingLeft:40,borderColor:err?"#ef4444":"rgba(255,255,255,0.12)" }} onFocus={e=>(e.target.style.borderColor="#6366f1")} onBlur={e=>(e.target.style.borderColor=err?"#ef4444":"rgba(255,255,255,0.12)")} />
              </div>
            </div>
            <div style={{ marginBottom:err?10:18 }}>
              <label style={{ fontSize:12,color:"#94a3b8",display:"block",marginBottom:6 }}>Password</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:15 }}>🔒</span>
                <input type={show?"text":"password"} placeholder="Enter password" value={form.password} onChange={e=>{setForm(f=>({...f,password:e.target.value}));setErr("");}} onKeyDown={e=>e.key==="Enter"&&attempt()} style={{ ...G.input,paddingLeft:40,paddingRight:42,borderColor:err?"#ef4444":"rgba(255,255,255,0.12)" }} onFocus={e=>(e.target.style.borderColor="#6366f1")} onBlur={e=>(e.target.style.borderColor=err?"#ef4444":"rgba(255,255,255,0.12)")} />
                <button onClick={()=>setShow(p=>!p)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:15,color:"#64748b" }}>{show?"🙈":"👁"}</button>
              </div>
            </div>
            {err && <div style={{ marginBottom:15,padding:"9px 13px",borderRadius:8,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",fontSize:12,color:"#ef4444" }}>⚠ {err}</div>}
            <button onClick={attempt} disabled={busy} style={{ width:"100%",padding:"12px 0",borderRadius:11,border:"none",background:busy?"rgba(99,102,241,0.4)":"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",cursor:busy?"not-allowed":"pointer",fontSize:14,fontWeight:700,fontFamily:"'Syne',sans-serif",boxShadow:busy?"none":"0 4px 20px rgba(99,102,241,0.38)" }}>{busy?"Signing in…":"Sign In →"}</button>
            <div style={{ marginTop:20,padding:"13px 15px",borderRadius:10,background:"rgba(99,102,241,0.06)",border:"1px solid rgba(99,102,241,0.15)" }}>
              <div style={{ fontSize:10,color:"#6366f1",fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:7 }}>Demo Credentials</div>
              {tab==="staff" ? (
                <div style={{ fontSize:12,color:"#64748b",lineHeight:2 }}>
                  <b style={{color:"#94a3b8"}}>Admin →</b> admin / admin123<br/>
                  <b style={{color:"#94a3b8"}}>Teacher →</b> kavitha / teach123
                </div>
              ) : (
                <div style={{ fontSize:12,color:"#64748b",lineHeight:2 }}>
                  <b style={{color:"#94a3b8"}}>Roll →</b> 2024001 &nbsp;/ password: 2024001<br/>
                  <i style={{color:"#475569"}}>(password = roll number by default)</i>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════════════════ */
function AdminDashboard({ user, students, setStudents, teachers, setTeachers, classes, records, onLogout }) {
  const [tab, setTab]       = useState("overview");
  const [modal, setModal]   = useState(null);
  const [delTarget, setDel] = useState(null);
  const [toast, setToast]   = useState(null);

  function showToast(msg, type="success") { setToast({msg,type}); setTimeout(()=>setToast(null),3000); }

  // Enrich students with live attendance from records
  const enriched = students.map(s => enrichStudent(s, records));

  function saveStudent(s) {
    setStudents(prev => modal.mode==="add" ? [...prev,s] : prev.map(x=>x.id===s.id?s:x));
    showToast(`${s.name} ${modal.mode==="add"?"added":"updated"}!`, modal.mode==="add"?"success":"edit");
  }
  function saveTeacher(t) {
    setTeachers(prev => modal.mode==="add"?[...prev,t]:prev.map(x=>x.id===t.id?t:x));
    showToast(`${t.name} ${modal.mode==="add"?"added":"updated"}!`, modal.mode==="add"?"success":"edit");
  }
  function confirmDelete() {
    if (delTarget.type==="student") { const n=delTarget.data.name; setStudents(prev=>prev.filter(s=>s.id!==delTarget.data.id)); showToast(`${n} deleted.`,"delete"); }
    else { setTeachers(prev=>prev.filter(t=>t.id!==delTarget.data.id)); showToast(`${delTarget.data.name} removed.`,"delete"); }
  }

  const TABS = [{key:"overview",label:"📊 Overview"},{key:"students",label:"🎓 Students"},{key:"teachers",label:"👩‍🏫 Teachers"}];
  return (
    <div style={G.page}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <Toast toast={toast} />
      <Header user={user} tabs={TABS} activeTab={tab} setActiveTab={setTab} onLogout={onLogout} />
      {modal?.type==="student" && <StudentModal mode={modal.mode} student={modal.data} classes={classes} onSave={saveStudent} onClose={()=>setModal(null)} />}
      {modal?.type==="teacher" && <TeacherModal mode={modal.mode} teacher={modal.data} classes={classes} onSave={saveTeacher} onClose={()=>setModal(null)} />}
      {delTarget && <DeleteDialog title={delTarget.type==="student"?"Delete Student?":"Remove Teacher?"} body={`Permanently remove ${delTarget.data.name}?`} onConfirm={confirmDelete} onClose={()=>setDel(null)} />}
      <div style={{ padding:"24px 32px" }}>
        {tab==="overview" && <OverviewCharts students={enriched} />}
        {tab==="students" && <StudentsTable students={enriched} classes={classes} onEdit={s=>setModal({type:"student",mode:"edit",data:students.find(x=>x.id===s.id)||s})} onDelete={s=>setDel({type:"student",data:s})} onAdd={()=>setModal({type:"student",mode:"add"})} canDelete canAdd showClass />}
        {tab==="teachers" && (
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
              <div><div style={{ fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,color:"#fff" }}>Teachers</div><div style={{ fontSize:12,color:"#64748b",marginTop:2 }}>{teachers.length} teachers • {classes.length} classes</div></div>
              <button onClick={()=>setModal({type:"teacher",mode:"add"})} style={{ padding:"9px 18px",borderRadius:9,border:"none",background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,boxShadow:"0 3px 14px rgba(34,197,94,0.3)" }}>＋ Add Teacher</button>
            </div>
            {teachers.length===0 ? <div style={{ textAlign:"center",padding:"50px 20px",color:"#475569" }}><div style={{ fontSize:44,marginBottom:10 }}>👩‍🏫</div><div>No teachers yet.</div></div> : (
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:14 }}>
                {teachers.map(t=>{
                  const cls = classes.find(c=>c.id===t.classId);
                  const cnt = students.filter(s=>s.classId===t.classId).length;
                  return (
                    <div key={t.id} style={{ ...G.card,border:"1px solid rgba(34,197,94,0.15)" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:11,marginBottom:12 }}>
                        <div style={{ width:38,height:38,borderRadius:"50%",background:avatarBg(t.id),display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:"#fff",flexShrink:0 }}>{initials(t.name)}</div>
                        <div><div style={{ fontSize:14,fontWeight:600,color:"#e2e8f0" }}>{t.name}</div><div style={{ fontSize:11,color:"#475569" }}>@{t.username}</div></div>
                      </div>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12 }}>
                        <div style={{ padding:"8px 10px",borderRadius:8,background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.15)" }}><div style={{ fontSize:9,color:"#64748b",marginBottom:2 }}>CLASS</div><div style={{ fontSize:11,color:"#a5b4fc",fontWeight:600 }}>{cls?.name||"Unassigned"}</div></div>
                        <div style={{ padding:"8px 10px",borderRadius:8,background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.15)" }}><div style={{ fontSize:9,color:"#64748b",marginBottom:2 }}>STUDENTS</div><div style={{ fontSize:18,fontWeight:800,fontFamily:"'Syne',sans-serif",color:"#22c55e" }}>{cnt}</div></div>
                      </div>
                      <div style={{ display:"flex",gap:8 }}>
                        <button onClick={()=>setModal({type:"teacher",mode:"edit",data:t})} style={{ flex:1,padding:"8px 0",borderRadius:8,border:"1px solid rgba(245,158,11,0.35)",background:"rgba(245,158,11,0.08)",color:"#f59e0b",cursor:"pointer",fontSize:12,fontWeight:600 }}>✏️ Edit</button>
                        <button onClick={()=>setDel({type:"teacher",data:t})} style={{ flex:1,padding:"8px 0",borderRadius:8,border:"1px solid rgba(239,68,68,0.35)",background:"rgba(239,68,68,0.08)",color:"#ef4444",cursor:"pointer",fontSize:12,fontWeight:600 }}>🗑️ Remove</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TEACHER DASHBOARD
═══════════════════════════════════════════════════════ */
function TeacherDashboard({ user, students, setStudents, classes, records, setRecords, onLogout }) {
  const [tab, setTab]     = useState("attendance");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  function showToast(msg, type="success") { setToast({msg,type}); setTimeout(()=>setToast(null),3000); }

  const myClass    = classes.find(c=>c.id===user.classId);
  const rawStudents = students.filter(s=>s.classId===user.classId);
  const enriched   = rawStudents.map(s=>enrichStudent(s,records));

  function saveStudent(s) {
    setStudents(prev=>prev.map(x=>x.id===s.id?s:x));
    showToast(`${s.name} updated!`,"edit");
  }

  const TABS = [
    {key:"attendance", label:"📋 Take Attendance"},
    {key:"history",    label:"🗂 History"},
    {key:"overview",   label:"📊 Overview"},
    {key:"students",   label:"🎓 My Class"},
  ];

  return (
    <div style={G.page}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <Toast toast={toast} />
      <Header user={user} tabs={TABS} activeTab={tab} setActiveTab={setTab} onLogout={onLogout} />
      {modal && <StudentModal mode="edit" student={modal} classes={classes} onSave={saveStudent} onClose={()=>setModal(null)} />}
      <div style={{ padding:"24px 32px" }}>
        {/* Class banner */}
        <div style={{ marginBottom:20,padding:"12px 18px",borderRadius:12,background:"rgba(34,211,238,0.06)",border:"1px solid rgba(34,211,238,0.18)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:10,color:"#22d3ee",letterSpacing:1,textTransform:"uppercase",fontWeight:700 }}>Your Assigned Class</div>
            <div style={{ fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:"#fff",marginTop:1 }}>{myClass?.name||"Unassigned"}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:10,color:"#64748b" }}>Students</div>
            <div style={{ fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:"#22d3ee" }}>{rawStudents.length}</div>
          </div>
        </div>

        {tab==="attendance" && <AttendanceTaker teacher={user} students={students} records={records} setRecords={setRecords} classes={classes} showToast={showToast} />}
        {tab==="history"    && <AttendanceHistory classId={user.classId} students={rawStudents} records={records} />}
        {tab==="overview"   && <OverviewCharts students={enriched} />}
        {tab==="students"   && <StudentsTable students={enriched} classes={classes} onEdit={s=>setModal(students.find(x=>x.id===s.id)||s)} onDelete={()=>{}} canDelete={false} canAdd={false} showClass={false} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STUDENT SELF DASHBOARD
═══════════════════════════════════════════════════════ */
function StudentSelfDashboard({ user, students, classes, records, onLogout }) {
  const me         = enrichStudent(students.find(s=>s.id===user.id)||user, records);
  const myClass    = classes.find(c=>c.id===me.classId);
  const classmates = students.map(s=>enrichStudent(s,records)).filter(s=>s.classId===me.classId);
  const sorted     = [...classmates].sort((a,b)=>b.gpa-a.gpa);
  const rank       = sorted.findIndex(s=>s.id===me.id)+1;

  const [tab, setTab] = useState("performance");
  const TABS = [{key:"performance",label:"📊 Performance"},{key:"attendance",label:"📅 My Attendance"}];

  const subBar = SUB_KEYS.map((k,i)=>({ subject:SUB_LABELS[i], mine:me[k], classAvg:parseFloat(safeAvg(classmates,k).toFixed(1)) }));
  const radar  = SUB_KEYS.map((k,i)=>({ subject:SUB_LABELS[i], score:me[k], classAvg:parseFloat(safeAvg(classmates,k).toFixed(1)) }));
  const attColor = me.attendance>=75?"#22c55e":me.attendance>=55?"#f59e0b":"#ef4444";

  return (
    <div style={G.page}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <Header user={{...me,role:"student"}} tabs={TABS} activeTab={tab} setActiveTab={setTab} onLogout={onLogout} />
      <div style={{ padding:"24px 32px" }}>
        {/* Welcome */}
        <div style={{ marginBottom:22,padding:"20px 24px",borderRadius:16,background:"linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08))",border:"1px solid rgba(99,102,241,0.2)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ width:50,height:50,borderRadius:"50%",background:avatarBg(me.id),display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,fontWeight:700,color:"#fff" }}>{initials(me.name)}</div>
            <div>
              <div style={{ fontSize:12,color:"#64748b" }}>Welcome back,</div>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:"#fff" }}>{me.name}</div>
              <div style={{ fontSize:12,color:"#6366f1",marginTop:2 }}>Roll: {me.rollNo} • {myClass?.name||"—"}</div>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:10,color:"#64748b",marginBottom:2 }}>Class Rank</div>
            <div style={{ fontFamily:"'Syne',sans-serif",fontSize:32,fontWeight:800,color:"#a5b4fc" }}>#{rank}</div>
            <div style={{ fontSize:11,color:"#475569" }}>of {classmates.length} students</div>
          </div>
        </div>

        {tab==="performance" && (
          <div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:22 }}>
              <StatCard label="My GPA"     value={me.gpa}              sub={`Predicted: ${calcGPA(me,me.attendance)}`} color={me.gpa>=8?"#22c55e":me.gpa>=6.5?"#f59e0b":"#ef4444"} icon="🎓" />
              <StatCard label="Attendance" value={`${me.attendance}%`} sub={me.attendance>=75?"Good standing":"Needs improvement"} color={attColor} icon="📅" />
              <StatCard label="Risk Level" value={me.risk}             sub={me.risk==="Low"?"Keep it up!":me.risk==="Medium"?"Focus needed":"Urgent attention"} color={RISK_COLORS[me.risk]} icon={me.risk==="Low"?"✅":me.risk==="Medium"?"⚠️":"🚨"} />
              <StatCard label="Class Rank" value={`#${rank}`}          sub={`of ${classmates.length} students`} color="#a78bfa" icon="🏅" />
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
              <div style={G.panel}>
                <div style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#fff",marginBottom:14 }}>📚 My Scores vs Class Average</div>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={subBar}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="subject" stroke="#475569" tick={{ fontSize:10 }} />
                    <YAxis domain={[0,100]} stroke="#475569" tick={{ fontSize:11 }} />
                    <Tooltip contentStyle={G.tt} /><Legend />
                    <Bar dataKey="mine"     fill="#6366f1" radius={[4,4,0,0]} name="My Score" />
                    <Bar dataKey="classAvg" fill="#334155" radius={[4,4,0,0]} name="Class Avg" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={G.panel}>
                <div style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#fff",marginBottom:14 }}>🎯 Subject Radar</div>
                <ResponsiveContainer width="100%" height={210}>
                  <RadarChart data={radar}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill:"#64748b",fontSize:10 }} />
                    <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false} />
                    <Radar name="My Score"  dataKey="score"    stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                    <Radar name="Class Avg" dataKey="classAvg" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 4" />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={G.panel}>
              <div style={{ fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"#fff",marginBottom:14 }}>📋 Subject Breakdown</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10 }}>
                {SUB_KEYS.map((k,i)=>{
                  const score=me[k]; const avg=parseFloat(safeAvg(classmates,k).toFixed(1)); const diff=score-avg;
                  return (
                    <div key={k} style={{ padding:"13px 11px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:`1px solid ${SUB_COLORS[i]}22`,textAlign:"center" }}>
                      <div style={{ fontSize:9,color:"#64748b",marginBottom:3,textTransform:"uppercase",letterSpacing:1 }}>{SUB_LABELS[i]}</div>
                      <div style={{ fontSize:24,fontWeight:800,fontFamily:"'Syne',sans-serif",color:score>=75?"#22c55e":score>=50?"#f59e0b":"#ef4444" }}>{score}</div>
                      <div style={{ fontSize:10,color:diff>=0?"#22c55e":"#ef4444",marginTop:2 }}>{diff>=0?`▲ +${diff.toFixed(1)}`:`▼ ${diff.toFixed(1)}`} vs class</div>
                      <div style={{ height:3,borderRadius:2,background:"rgba(255,255,255,0.06)",marginTop:7,overflow:"hidden" }}><div style={{ height:"100%",width:`${score}%`,background:SUB_COLORS[i],borderRadius:2 }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
            {me.risk!=="Low" && (
              <div style={{ marginTop:14,padding:"15px 18px",borderRadius:12,background:`${RISK_COLORS[me.risk]}0a`,border:`1px solid ${RISK_COLORS[me.risk]}33` }}>
                <div style={{ fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:RISK_COLORS[me.risk],marginBottom:5 }}>{me.risk==="High"?"🚨 Urgent Action Needed":"⚠️ Areas for Improvement"}</div>
                <div style={{ fontSize:13,color:"#94a3b8",lineHeight:1.7 }}>{me.risk==="High"?"Your attendance and/or grades are critically low. Please speak with your teacher or counselor immediately.":"You're doing okay but there's room to improve. Focus on your weaker subjects and attendance."}</div>
              </div>
            )}
            {me.risk==="Low" && <div style={{ marginTop:14,padding:"15px 18px",borderRadius:12,background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)" }}><div style={{ fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:"#22c55e",marginBottom:4 }}>🌟 Great Work!</div><div style={{ fontSize:13,color:"#94a3b8",lineHeight:1.7 }}>You're performing well! Keep it up and aim to push all scores above 80 for an even higher GPA.</div></div>}
          </div>
        )}

        {tab==="attendance" && <StudentAttendanceView student={me} records={records} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
  ROOT APP
═══════════════════════════════════════════════════════ */
export default function App() {
  const [classes,  ]            = useLS("edu_classes",     SEED_CLASSES);
  const [teachers, setTeachers] = useLS("edu_teachers",    SEED_TEACHERS);
  const [students, setStudents] = useLS("edu_students",    SEED_STUDENTS);
  const [records,  setRecords]  = useLS("edu_att_records", makeSeedAttendance);
  const [user, setUser]         = useState(null);

  if (!user) return <LoginPage teachers={teachers} students={students} onLogin={setUser} />;
  if (user.role==="admin")   return <AdminDashboard   user={user} students={students} setStudents={setStudents} teachers={teachers} setTeachers={setTeachers} classes={classes} records={records} onLogout={()=>setUser(null)} />;
  if (user.role==="teacher") return <TeacherDashboard user={user} students={students} setStudents={setStudents} classes={classes} records={records} setRecords={setRecords} onLogout={()=>setUser(null)} />;
  if (user.role==="student") return <StudentSelfDashboard user={user} students={students} classes={classes} records={records} onLogout={()=>setUser(null)} />;
  return null;
}
