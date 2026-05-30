// dashboard/PopulationDashboard.jsx
// ====================================
// Population Health Dashboard for ACO Operations
// Runs against synthetic CMS data (sandbox-safe for public demo)
// Stack: React + Recharts + Tailwind-like inline styles

import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// ── Synthetic data (replace with real dbt gold layer API in production) ──────
const SYNTHETIC = {
  summary: {
    total_attributed: 4832,
    high_risk: 412,
    medium_risk: 1205,
    low_risk: 3215,
    newly_attributed: 87,
    terminated: 34,
    match_rate: 98.2,
    open_care_gaps: 1847,
    dual_eligible: 623,
  },
  utilization: [
    { month: "Jan", inpatient: 42, ed_visits: 118, part_b: 1840, spend: 1240000 },
    { month: "Feb", inpatient: 38, ed_visits: 102, part_b: 1720, spend: 1180000 },
    { month: "Mar", inpatient: 51, ed_visits: 131, part_b: 1960, spend: 1390000 },
    { month: "Apr", inpatient: 35, ed_visits: 97,  part_b: 1810, spend: 1120000 },
    { month: "May", inpatient: 44, ed_visits: 121, part_b: 1890, spend: 1270000 },
    { month: "Jun", inpatient: 29, ed_visits: 88,  part_b: 1750, spend: 980000  },
  ],
  care_gaps: [
    { gap: "Annual Wellness Visit",     open: 842, pct: 74 },
    { gap: "Diabetes Eye Exam",         open: 312, pct: 58 },
    { gap: "Colorectal Screening",      open: 287, pct: 61 },
    { gap: "Flu Vaccine",               open: 198, pct: 82 },
    { gap: "No Claims 180d",            open: 208, pct: 4  },
  ],
  equity: [
    { race: "White",           n: 2814, avg_spend: 9200,  pct_high_risk: 7.2,  dual: 8.4  },
    { race: "Black/AA",        n: 892,  avg_spend: 11800, pct_high_risk: 12.1, dual: 18.2 },
    { race: "Hispanic",        n: 421,  avg_spend: 10400, pct_high_risk: 9.8,  dual: 14.6 },
    { race: "Asian/PI",        n: 312,  avg_spend: 8100,  pct_high_risk: 6.4,  dual: 6.1  },
    { race: "Other/Unknown",   n: 393,  avg_spend: 9900,  pct_high_risk: 10.2, dual: 12.3 },
  ],
  bcda_gap_log: [
    { date: "2025-11", match_rate: 97.1, roster_only: 141, bcda_only: 22 },
    { date: "2025-12", match_rate: 97.4, roster_only: 125, bcda_only: 19 },
    { date: "2026-01", match_rate: 96.8, roster_only: 153, bcda_only: 31 },
    { date: "2026-02", match_rate: 97.9, roster_only: 101, bcda_only: 15 },
    { date: "2026-03", match_rate: 98.1, roster_only: 92,  bcda_only: 12 },
    { date: "2026-04", match_rate: 98.2, roster_only: 87,  bcda_only: 9  },
  ],
};

// ── Color palette ─────────────────────────────────────────────────────────────
const C = {
  red:    "#e53935", blue:  "#1565c0", green: "#2e7d32",
  amber:  "#e65100", purple:"#6a1b9a", teal:  "#00695c",
  bg:     "#0a0a0a", surface: "#141414", border: "#222",
  text:   "#f0f0f0", muted:  "#888",
};

const RISK_COLORS  = [C.red, C.amber, C.green];
const EQUITY_COLORS = ["#1565c0","#c62828","#e65100","#00695c","#5e35b1"];

// ── Reusable components ───────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{
    background: C.surface, border: `1px solid ${C.border}`,
    padding: "20px", borderRadius: "2px", ...style
  }}>{children}</div>
);

const Stat = ({ label, value, sub, color = C.text }) => (
  <div style={{ padding: "16px 0", borderBottom: `1px solid ${C.border}` }}>
    <div style={{ fontSize: "0.68rem", letterSpacing: "3px", textTransform: "uppercase", color: C.muted, marginBottom: "4px" }}>{label}</div>
    <div style={{ fontSize: "1.8rem", fontWeight: 700, color, fontFamily: "monospace", lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: "0.72rem", color: C.muted, marginTop: "4px" }}>{sub}</div>}
  </div>
);

const TabBtn = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: "8px 18px", fontSize: "0.75rem", letterSpacing: "2px",
    textTransform: "uppercase", fontFamily: "monospace", cursor: "pointer",
    background: active ? C.text : "transparent",
    color: active ? C.bg : C.muted,
    border: `1px solid ${active ? C.text : C.border}`,
    borderRadius: "1px", transition: "all 0.15s",
  }}>{label}</button>
);

// ── Tab Screens ───────────────────────────────────────────────────────────────
const OverviewTab = ({ data }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2px" }}>
    <Card>
      <Stat label="Total Attributed" value={data.summary.total_attributed.toLocaleString()} sub="active beneficiaries" />
      <Stat label="High Risk" value={data.summary.high_risk} color={C.red} sub="require care management" />
      <Stat label="New This Month" value={data.summary.newly_attributed} color={C.blue} sub="newly attributed" />
      <Stat label="Dual Eligible" value={data.summary.dual_eligible} sub="Medicare + Medicaid" />
    </Card>
    <Card style={{ gridColumn: "span 2" }}>
      <div style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: C.muted, marginBottom: "16px" }}>Monthly Spend & Utilization</div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data.utilization}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} />
          <YAxis yAxisId="left" tick={{ fill: C.muted, fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: C.muted, fontSize: 11 }} />
          <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text }} />
          <Legend wrapperStyle={{ color: C.muted, fontSize: 11 }} />
          <Line yAxisId="left"  type="monotone" dataKey="spend"     stroke={C.blue}  strokeWidth={2} dot={false} name="Total Spend ($)" />
          <Line yAxisId="right" type="monotone" dataKey="inpatient" stroke={C.red}   strokeWidth={2} dot={false} name="Inpatient Claims" />
          <Line yAxisId="right" type="monotone" dataKey="ed_visits" stroke={C.amber} strokeWidth={2} dot={false} name="ED Visits" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
    <Card>
      <div style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: C.muted, marginBottom: "16px" }}>Risk Distribution</div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={[
            { name: "High Risk",   value: data.summary.high_risk },
            { name: "Medium Risk", value: data.summary.medium_risk },
            { name: "Low Risk",    value: data.summary.low_risk },
          ]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
            {RISK_COLORS.map((color, i) => <Cell key={i} fill={color} />)}
          </Pie>
          <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text }} />
          <Legend wrapperStyle={{ color: C.muted, fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
    <Card style={{ gridColumn: "span 2" }}>
      <div style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: C.muted, marginBottom: "16px" }}>Open Care Gaps by Type</div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data.care_gaps} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} />
          <YAxis dataKey="gap" type="category" width={160} tick={{ fill: C.muted, fontSize: 11 }} />
          <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text }} />
          <Bar dataKey="open" fill={C.blue} radius={[0, 2, 2, 0]} name="Open Gaps" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  </div>
);

const EquityTab = ({ data }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
    <Card style={{ gridColumn: "span 2" }}>
      <div style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: C.muted, marginBottom: "16px" }}>Average Annual Spend by Race/Ethnicity</div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data.equity}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey="race" tick={{ fill: C.muted, fontSize: 11 }} />
          <YAxis tick={{ fill: C.muted, fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
          <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text }} formatter={v => [`$${v.toLocaleString()}`, "Avg Spend"]} />
          <Bar dataKey="avg_spend" name="Avg Annual Spend" radius={[2, 2, 0, 0]}>
            {data.equity.map((_, i) => <Cell key={i} fill={EQUITY_COLORS[i % EQUITY_COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
    <Card>
      <div style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: C.muted, marginBottom: "16px" }}>High-Risk % by Race</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data.equity}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey="race" tick={{ fill: C.muted, fontSize: 9 }} />
          <YAxis tick={{ fill: C.muted, fontSize: 11 }} unit="%" />
          <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text }} />
          <Bar dataKey="pct_high_risk" name="% High Risk" fill={C.red} radius={[2,2,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
    <Card>
      <div style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: C.muted, marginBottom: "16px" }}>Dual Eligible % by Race</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data.equity}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey="race" tick={{ fill: C.muted, fontSize: 9 }} />
          <YAxis tick={{ fill: C.muted, fontSize: 11 }} unit="%" />
          <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text }} />
          <Bar dataKey="dual" name="% Dual Eligible" fill={C.purple} radius={[2,2,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
    <Card style={{ gridColumn: "span 2", background: "#0d1520", borderColor: C.blue }}>
      <div style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: C.blue, marginBottom: "8px" }}>LEAD Model Equity Requirement</div>
      <p style={{ fontSize: "0.82rem", color: "#aaa", lineHeight: 1.65 }}>
        The LEAD Model (launching Jan 2027) includes explicit equity reporting mandates.
        The disparities shown above in spend and high-risk rates by race/ethnicity
        are exactly the metrics CMS will require ACOs to track and address.
        This dashboard is pre-built for LEAD compliance.
      </p>
    </Card>
  </div>
);

const BCDAGapTab = ({ data }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
    <Card style={{ gridColumn: "span 2" }}>
      <div style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: C.muted, marginBottom: "16px" }}>BCDA Field-Mapping Gap — Monthly Tracking (Research Data)</div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data.bcda_gap_log}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey="date" tick={{ fill: C.muted, fontSize: 11 }} />
          <YAxis yAxisId="rate" domain={[95, 100]} tick={{ fill: C.muted, fontSize: 11 }} unit="%" />
          <YAxis yAxisId="count" orientation="right" tick={{ fill: C.muted, fontSize: 11 }} />
          <Tooltip contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text }} />
          <Legend wrapperStyle={{ color: C.muted, fontSize: 11 }} />
          <Line yAxisId="rate"  type="monotone" dataKey="match_rate"   stroke={C.green} strokeWidth={2} name="Match Rate %" />
          <Line yAxisId="count" type="monotone" dataKey="roster_only"  stroke={C.red}   strokeWidth={2} strokeDasharray="5 5" name="Roster-Only (BCDA Gap)" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
    <Card style={{ background: "#0d1a10", borderColor: C.green }}>
      <div style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: C.green, marginBottom: "8px" }}>What This Data Is</div>
      <p style={{ fontSize: "0.82rem", color: "#aaa", lineHeight: 1.65 }}>
        "Roster-Only" = beneficiaries present in the CMS attribution roster but
        NOT returned in the BCDA Patient NDJSON file. This is the BCDA field-mapping gap —
        a known issue acknowledged by CMS's Beneficiary FHIR Data Server team.
        This longitudinal dataset is the preliminary data for a JAMIA methods paper.
      </p>
    </Card>
    <Card style={{ background: "#1a0d10", borderColor: C.red }}>
      <div style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: C.red, marginBottom: "8px" }}>Why It Matters</div>
      <p style={{ fontSize: "0.82rem", color: "#aaa", lineHeight: 1.65 }}>
        ACOs using only BCDA (without CCLF cross-reference) may be missing
        attributed beneficiaries from their care management programs.
        Integris is the only platform that systematically quantifies and
        reports this gap — turning a known limitation into a documented,
        peer-reviewed infrastructure contribution.
      </p>
    </Card>
  </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function PopulationDashboard() {
  const [tab, setTab] = useState("overview");
  const data = SYNTHETIC;

  const tabs = [
    { id: "overview",  label: "Population Overview" },
    { id: "equity",    label: "Equity Dashboard" },
    { id: "bcda_gap",  label: "BCDA Gap Research" },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'Barlow', system-ui, sans-serif", fontWeight: 300 }}>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "0.6rem", letterSpacing: "4px", textTransform: "uppercase", color: C.muted, marginBottom: "2px" }}>Integris Health Data Systems</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 600, letterSpacing: "1px" }}>Population Health Dashboard</div>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ fontSize: "0.65rem", color: C.muted, textAlign: "right" }}>
            <div>Sandbox Demo — Synthetic CMS Data</div>
            <div style={{ color: "#00e676", marginTop: "2px" }}>● Live</div>
          </div>
        </div>
      </div>

      {/* Key stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", borderBottom: `1px solid ${C.border}` }}>
        {[
          { label: "Attributed",    value: data.summary.total_attributed.toLocaleString(), color: C.text },
          { label: "High Risk",     value: data.summary.high_risk,      color: C.red },
          { label: "Open Gaps",     value: data.summary.open_care_gaps.toLocaleString(), color: C.amber },
          { label: "Match Rate",    value: `${data.summary.match_rate}%`, color: "#00e676" },
          { label: "Dual Eligible", value: data.summary.dual_eligible,  color: C.blue },
        ].map((s, i) => (
          <div key={i} style={{ padding: "14px 20px", borderRight: `1px solid ${C.border}` }}>
            <div style={{ fontSize: "0.6rem", letterSpacing: "3px", textTransform: "uppercase", color: C.muted, marginBottom: "3px" }}>{s.label}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div style={{ padding: "16px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: "8px" }}>
        {tabs.map(t => <TabBtn key={t.id} label={t.label} active={tab === t.id} onClick={() => setTab(t.id)} />)}
      </div>

      {/* Tab content */}
      <div style={{ padding: "20px 28px" }}>
        {tab === "overview"  && <OverviewTab  data={data} />}
        {tab === "equity"    && <EquityTab    data={data} />}
        {tab === "bcda_gap"  && <BCDAGapTab   data={data} />}
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 28px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.65rem", color: C.muted, fontFamily: "monospace" }}>integrishealthdata.com/demo · Synthetic data only — no PHI</span>
        <span style={{ fontSize: "0.65rem", color: C.muted, fontFamily: "monospace" }}>bcda-client v0.1.0 · dbt integris_cms · FHIR R4</span>
      </div>
    </div>
  );
}
