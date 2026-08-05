import React, { useState, useEffect, useMemo } from "react";
import { callAI } from '../../services/api';
import { useTheme } from "../../context/ThemeContext";
import { placementService } from '../../services/placementService';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  MapPin,
  Link2,
  DollarSign,
  Eye,
  Edit3,
  Trash2,
  FileText,
  X,
  PlusCircle,
  Brain,
  RefreshCw,
  AlertCircle
} from "lucide-react";

const STATUSES = ["Applied", "Screening", "Interview", "Offer", "Accepted", "Rejected"];
const SOURCES = ["LinkedIn", "Campus Drive", "Naukri", "Company Website", "Referral", "Internshala", "Indeed", "Other"];

const STATUS_STYLES = {
  Applied:    { bgLight: "#EFF6FF", textLight: "#1D4ED8", dotLight: "#3B82F6", bgDark: "rgba(59, 130, 246, 0.15)", textDark: "#93c5fd", dotDark: "#3b82f6" },
  Screening:  { bgLight: "#FFFBEB", textLight: "#92400E", dotLight: "#F59E0B", bgDark: "rgba(245, 158, 11, 0.15)", textDark: "#fde047", dotDark: "#f59e0b" },
  Interview:  { bgLight: "#F5F3FF", textLight: "#5B21B6", dotLight: "#7C3AED", bgDark: "rgba(124, 58, 237, 0.15)", textDark: "#c084fc", dotDark: "#7c3aed" },
  Offer:      { bgLight: "#ECFDF5", textLight: "#065F46", dotLight: "#10B981", bgDark: "rgba(16, 185, 129, 0.15)", textDark: "#34d399", dotDark: "#10b981" },
  Accepted:   { bgLight: "#D1FAE5", textLight: "#064E3B", dotLight: "#059669", bgDark: "rgba(5, 150, 105, 0.15)", textDark: "#6ee7b7", dotDark: "#059669" },
  Rejected:   { bgLight: "#FEF2F2", textLight: "#991B1B", dotLight: "#EF4444", bgDark: "rgba(239, 68, 68, 0.15)", textDark: "#fca5a5", dotDark: "#ef4444" },
};

const emptyForm = () => ({
  company: "", role: "", date: new Date().toISOString().slice(0, 10),
  status: "Applied", source: "", ctc: "", location: "", notes: "",
});

function StatusBadge({ status }) {
  const { isDarkMode } = useTheme();
  const s = STATUS_STYLES[status] || STATUS_STYLES.Applied;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 20,
      fontSize: 12, fontWeight: 600,
      background: isDarkMode ? s.bgDark : s.bgLight,
      color: isDarkMode ? s.textDark : s.textLight,
      border: isDarkMode ? `1px solid ${s.dotDark}33` : "none",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: isDarkMode ? s.dotDark : s.dotLight, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function StatCard({ label, value, color }) {
  const { isDarkMode } = useTheme();
  
  const colors = {
    purple: { bgLight: "rgba(124, 58, 237, 0.08)", textLight: "#7c3aed", borderLight: "rgba(124, 58, 237, 0.2)", bgDark: "rgba(167, 139, 250, 0.1)", textDark: "#a78bfa", borderDark: "rgba(167, 139, 250, 0.2)" },
    blue:   { bgLight: "rgba(37, 99, 235, 0.08)", textLight: "#2563eb", borderLight: "rgba(37, 99, 235, 0.2)", bgDark: "rgba(59, 130, 246, 0.1)", textDark: "#60a5fa", borderDark: "rgba(59, 130, 246, 0.2)" },
    cyan:   { bgLight: "rgba(8, 145, 178, 0.08)", textLight: "#0891b2", borderLight: "rgba(8, 145, 178, 0.2)", bgDark: "rgba(6, 182, 212, 0.1)", textDark: "#22d3ee", borderDark: "rgba(6, 182, 212, 0.2)" },
    pink:   { bgLight: "rgba(219, 39, 119, 0.08)", textLight: "#db2777", borderLight: "rgba(219, 39, 119, 0.2)", bgDark: "rgba(236, 72, 153, 0.1)", textDark: "#f472b6", borderDark: "rgba(236, 72, 153, 0.2)" },
    red:    { bgLight: "rgba(220, 38, 38, 0.08)", textLight: "#dc2626", borderLight: "rgba(220, 38, 38, 0.2)", bgDark: "rgba(239, 68, 68, 0.1)", textDark: "#f87171", borderDark: "rgba(239, 68, 68, 0.2)" },
    orange: { bgLight: "rgba(217, 119, 6, 0.08)", textLight: "#d97706", borderLight: "rgba(217, 119, 6, 0.2)", bgDark: "rgba(245, 158, 11, 0.1)", textDark: "#fbbf24", borderDark: "rgba(245, 158, 11, 0.2)" },
  };

  const c = colors[color] || colors.purple;
  const bg = isDarkMode ? c.bgDark : c.bgLight;
  const txt = isDarkMode ? c.textDark : c.textLight;
  const border = isDarkMode ? c.borderDark : c.borderLight;

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 12,
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: 4,
      boxShadow: "var(--shadow-sm)"
    }}>
      <div style={{ fontSize: 11, color: isDarkMode ? "var(--text-secondary)" : "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: txt, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function Modal({ open, onClose, onSave, editData }) {
  const [form, setForm] = useState(editData || emptyForm());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(editData || emptyForm());
    setErrors({});
  }, [editData, open]);

  if (!open) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.company.trim()) e.company = "Required";
    if (!form.role.trim()) e.role = "Required";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  };

  const Field = ({ label, name, type = "text", children, required }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5 }}>
        {label}{required && <span style={{ color: "#EF4444", marginLeft: 2 }}>*</span>}
      </label>
      {children || (
        <input
          type={type}
          value={form[name] || ""}
          onChange={e => { set(name, e.target.value); setErrors(er => ({ ...er, [name]: "" })); }}
          style={{
            width: "100%", padding: "8px 12px", borderRadius: 8, fontSize: 14,
            border: errors[name] ? "1.5px solid #EF4444" : "1px solid var(--border-color)",
            outline: "none", background: "var(--bg-primary)", color: "var(--text-primary)",
            boxSizing: "border-box",
          }}
        />
      )}
      {errors[name] && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 3 }}>{errors[name]}</div>}
    </div>
  );

  const selectStyle = {
    width: "100%", padding: "8px 12px", borderRadius: 8, fontSize: 14,
    border: "1px solid var(--border-color)", outline: "none", background: "var(--bg-primary)",
    color: "var(--text-primary)", boxSizing: "border-box", cursor: "pointer",
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 16, backdropFilter: "blur(3px)"
    }}>
      <div style={{
        background: "var(--bg-secondary)", borderRadius: 16, padding: 28,
        width: "100%", maxWidth: 460, maxHeight: "90vh",
        border: "1px solid var(--border-color)",
        overflowY: "auto", boxShadow: "var(--shadow-lg)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
            {editData ? "Edit Application" : "New Application"}
          </h3>
          <button onClick={onClose} style={{
            background: "var(--bg-tertiary)", border: "none", borderRadius: 8,
            width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-secondary)"
          }}><X size={16} /></button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
          <div style={{ gridColumn: "1/-1" }}>
            <Field label="Company" name="company" required />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <Field label="Role / Position" name="role" required />
          </div>
          <Field label="Applied Date" name="date" type="date" />
          <Field label="Status" name="status">
            <select value={form.status} onChange={e => set("status", e.target.value)} style={selectStyle}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Source" name="source">
            <select value={form.source} onChange={e => set("source", e.target.value)} style={selectStyle}>
              <option value="">— select —</option>
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="CTC / Package (LPA)" name="ctc" />
          <div style={{ gridColumn: "1/-1" }}>
            <Field label="Location" name="location" />
          </div>
          <div style={{ gridColumn: "1/-1", marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5 }}>Notes</label>
            <textarea
              value={form.notes || ""}
              onChange={e => set("notes", e.target.value)}
              rows={3}
              placeholder="Interview rounds, contacts, follow-up dates..."
              style={{
                width: "100%", padding: "8px 12px", borderRadius: 8, fontSize: 14,
                border: "1px solid var(--border-color)", outline: "none", background: "var(--bg-primary)",
                color: "var(--text-primary)", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            padding: "9px 20px", borderRadius: 8, border: "1px solid var(--border-color)",
            background: "transparent", color: "var(--text-secondary)", fontSize: 14, cursor: "pointer", fontWeight: 500,
          }}>Cancel</button>
          <button onClick={handleSave} style={{
            padding: "9px 20px", borderRadius: 8, border: "none",
            background: "var(--accent-purple)", color: "#fff", fontSize: 14, cursor: "pointer", fontWeight: 600,
          }}>Save</button>
        </div>
      </div>
    </div>
  );
}

function DetailDrawer({ app, onClose, onEdit, onDelete }) {
  if (!app) return null;
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", justifyContent: "flex-end", zIndex: 1000, backdropFilter: "blur(2px)"
    }}>
      <div style={{
        background: "var(--bg-secondary)", width: "100%", maxWidth: 380,
        height: "100%", overflowY: "auto", padding: 28,
        borderLeft: "1px solid var(--border-color)",
        boxShadow: "var(--shadow-lg)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>{app.company}</div>
            <div style={{ fontSize: 15, color: "var(--text-secondary)", marginTop: 2 }}>{app.role}</div>
          </div>
          <button onClick={onClose} style={{
            background: "var(--bg-tertiary)", border: "none", borderRadius: 8, width: 32, height: 32,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-secondary)", flexShrink: 0,
          }}><X size={16} /></button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <StatusBadge status={app.status} />
        </div>

        {[
          { label: "Applied on", val: app.date || "—", icon: Calendar },
          { label: "Location", val: app.location || "—", icon: MapPin },
          { label: "Package", val: app.ctc ? `${app.ctc} LPA` : "—", icon: DollarSign },
          { label: "Source", val: app.source || "—", icon: Link2 },
        ].map(({ label, val, icon: Icon }) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 0", borderBottom: "1px solid var(--border-color)", fontSize: 14,
          }}>
            <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 8 }}>
              <Icon size={14} style={{ color: "var(--text-muted)" }} />
              {label}
            </span>
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{val}</span>
          </div>
        ))}

        {app.notes && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Notes</div>
            <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: 8, padding: 12 }}>{app.notes}</div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 32 }}>
          <button onClick={() => onEdit(app)} style={{
            flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid var(--border-color)",
            background: "transparent", color: "var(--text-secondary)", fontSize: 14, cursor: "pointer", fontWeight: 500,
          }}>Edit</button>
          <button onClick={() => { onDelete(app.id); onClose(); }} style={{
            flex: 1, padding: "10px 0", borderRadius: 8, border: "none",
            background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontSize: 14, cursor: "pointer", fontWeight: 500,
          }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function PlacementTracker() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewApp, setViewApp] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const apps = await placementService.getApplications();
        setData(apps);
        
        // Load latest saved AI advice from PostgreSQL
        const adviceList = await placementService.getPlacementAdvice();
        if (adviceList && adviceList.length > 0) {
          setAiAdvice(adviceList[0].content);
        }
      } catch (err) {
        console.error("Failed to load placement applications", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const saveEntry = async (form) => {
    setLoading(true);
    try {
      if (editData) {
        const updated = await placementService.updateApplication(editData.id, form);
        setData(d => d.map(r => r.id === editData.id ? updated : r));
        showToast("Application updated");
      } else {
        const created = await placementService.addApplication(form);
        setData(d => [created, ...d]);
        showToast("Application added");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to save application", "danger");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditData(null);
    }
  };

  const deleteEntry = async (id) => {
    setLoading(true);
    try {
      const remaining = await placementService.deleteApplication(id);
      setData(remaining);
      showToast("Application deleted", "danger");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete application", "danger");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (app) => {
    setEditData(app);
    setViewApp(null);
    setModalOpen(true);
  };

  const filtered = useMemo(() => {
    let rows = [...data];
    if (search) rows = rows.filter(r =>
      r.company.toLowerCase().includes(search.toLowerCase()) ||
      r.role.toLowerCase().includes(search.toLowerCase())
    );
    if (filterStatus) rows = rows.filter(r => r.status === filterStatus);
    if (sortBy === "date_desc") rows.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    else if (sortBy === "date_asc") rows.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    else if (sortBy === "company") rows.sort((a, b) => (a.company || "").localeCompare(b.company || ""));
    else if (sortBy === "status") rows.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
    return rows;
  }, [data, search, filterStatus, sortBy]);

  const stats = useMemo(() => ({
    total: data.length,
    applied: data.filter(r => r.status === "Applied").length,
    interviews: data.filter(r => r.status === "Interview").length,
    offers: data.filter(r => r.status === "Offer" || r.status === "Accepted").length,
    rejected: data.filter(r => r.status === "Rejected").length,
    rate: data.length ? Math.round((data.filter(r => r.status === "Offer" || r.status === "Accepted").length / data.length) * 100) : 0,
  }), [data]);

  const [aiAdvice, setAiAdvice] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const getAIAdvice = async () => {
    setAiLoading(true);
    setAiError('');
    setAiAdvice('');
    try {
      const statsSummary = `Total applications: ${stats.total}\nApplied status: ${stats.applied}\nInterviews scheduled: ${stats.interviews}\nOffers received: ${stats.offers}\nRejections: ${stats.rejected}\nOffer conversion rate: ${stats.rate}%`;
      const systemPrompt = `You are ANVIORA's AI Placement Advisor. You are a strict, brutally honest placement advisor. Do not sugarcoat or give overly optimistic placement probability advice. Analyze the student's placement application statistics critically, evaluate their pipeline health strictly, identify severe bottlenecks (e.g., high rejections, lack of interview conversions, or stagnation), and provide direct, unvarnished preparation advice. Focus heavily on identifying realistic weaknesses and provide 3 concrete, difficult next steps. Keep it concise (max 150 words).`;
      const message = `Here is my current placement application tracker status:\n${statsSummary}`;
      const reply = await callAI(message, systemPrompt);
      
      // Save AI reply to database
      await placementService.savePlacementAdvice(reply);
      
      setAiAdvice(reply);
    } catch (e) {
      console.error(e);
      setAiError('Failed to load placement advice. Please make sure backend is running.');
    }
    setAiLoading(false);
  };

  const inputStyle = {
    padding: "9px 14px", borderRadius: 8, border: "1px solid var(--border-color)",
    fontSize: 14, outline: "none", background: "var(--bg-secondary)", color: "var(--text-primary)",
  };

  if (loading && data.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "60vh", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <LoadingSpinner size="md" />
        <span style={{ color: "var(--text-secondary)" }}>Loading your placement workspace...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "inherit" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 2000,
          background: toast.type === "danger" ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
          color: toast.type === "danger" ? "#ef4444" : "#10b981",
          border: `1px solid ${toast.type === "danger" ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)"}`,
          padding: "10px 18px", borderRadius: 10, fontSize: 14, fontWeight: 500,
          boxShadow: "var(--shadow-md)",
        }}>{toast.msg}</div>
      )}

      {/* Header Layout */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "rgba(124, 58, 237, 0.15)", borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-purple)" }}>
            <Briefcase size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "var(--text-primary)", letterSpacing: -0.3 }}>Placement Tracker</h1>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", marginTop: 1 }}>Track every application, every stage</p>
          </div>
        </div>
        <button
          onClick={() => { setEditData(null); setModalOpen(true); }}
          style={{
            background: "linear-gradient(135deg, var(--accent-purple), var(--accent-blue))",
            color: "#fff", border: "none",
            padding: "10px 20px", borderRadius: 8, fontSize: 14,
            fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            boxShadow: "0 4px 12px rgba(139, 92, 246, 0.2)"
          }}
        >
          <PlusCircle size={16} /> Add Application
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16 }}>
        <StatCard label="Total" value={stats.total} color="purple" />
        <StatCard label="Applied" value={stats.applied} color="blue" />
        <StatCard label="Interviews" value={stats.interviews} color="cyan" />
        <StatCard label="Offers" value={stats.offers} color="pink" />
        <StatCard label="Rejected" value={stats.rejected} color="red" />
        <StatCard label="Offer rate" value={`${stats.rate}%`} color="orange" />
      </div>

      {/* Toolbar & Filters */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <input
            type="text"
            placeholder="Search company or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, width: "100%", paddingLeft: 36, boxSizing: "border-box" }}
          />
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={inputStyle}>
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={inputStyle}>
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="company">Company A–Z</option>
          <option value="status">By status</option>
        </select>
      </div>

      {/* Kanban-style quick status pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {STATUSES.map(s => {
          const count = data.filter(r => r.status === s).length;
          const active = filterStatus === s;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(active ? "" : s)}
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500,
                cursor: "pointer", border: `1px solid ${active ? "var(--accent-purple)" : "var(--border-color)"}`,
                background: active ? "rgba(124, 58, 237, 0.12)" : "var(--bg-secondary)",
                color: active ? "var(--accent-purple)" : "var(--text-secondary)",
                transition: "all 0.15s",
              }}
            >
              {s} {count > 0 && <span style={{ fontWeight: 700, marginLeft: 4 }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Table Container */}
      <div style={{ background: "var(--bg-secondary)", borderRadius: 14, border: "1px solid var(--border-color)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <FileText size={48} style={{ color: "var(--text-muted)", strokeWidth: 1.5 }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 650, color: "var(--text-primary)" }}>No applications found</div>
              <div style={{ fontSize: 14, marginTop: 4, color: "var(--text-secondary)" }}>Try adjusting your filters or add a new application</div>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-color)" }}>
                  {["Company", "Role", "Applied", "Status", "Package", "Location", "Source", "Actions"].map(h => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left", fontSize: 11,
                      fontWeight: 600, color: "var(--text-secondary)",
                      textTransform: "uppercase", letterSpacing: 0.6, whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border-color)" : "none", transition: "background 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>{r.company}</div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-secondary)" }}>{r.role}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{r.date || "—"}</td>
                    <td style={{ padding: "14px 16px" }}><StatusBadge status={r.status} /></td>
                    <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-secondary)" }}>{r.ctc ? `${r.ctc} LPA` : "—"}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-secondary)" }}>{r.location || "—"}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-secondary)" }}>{r.source || "—"}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => setViewApp(r)} title="View Detail" style={{
                          background: "var(--bg-tertiary)", border: "none", borderRadius: 6,
                          width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)"
                        }}><Eye size={14} /></button>
                        <button onClick={() => openEdit(r)} title="Edit Entry" style={{
                          background: "rgba(59, 130, 246, 0.1)", border: "none", borderRadius: 6,
                          width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-blue)"
                        }}><Edit3 size={14} /></button>
                        <button onClick={() => { if(window.confirm("Delete this application?")) deleteEntry(r.id); }} title="Delete Entry" style={{
                          background: "rgba(239, 68, 68, 0.1)", border: "none", borderRadius: 6,
                          width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444"
                        }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
        Showing {filtered.length} of {data.length} applications
      </div>

      {/* AI Placement Advisor Section */}
      <div style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: 14,
        padding: 20,
        boxShadow: "var(--shadow-sm)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Brain size={18} style={{ color: "var(--accent-purple)" }} />
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>AI Placement Advisor</h3>
          </div>
          <button
            onClick={getAIAdvice}
            disabled={aiLoading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              border: "1px solid rgba(139, 92, 246, 0.3)",
              background: "rgba(139, 92, 246, 0.1)",
              color: "var(--accent-purple)",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: aiLoading ? "not-allowed" : "pointer",
            }}
          >
            <RefreshCw size={12} style={{ animation: aiLoading ? "spin 1s linear infinite" : "none" }} />
            {aiLoading ? "Analyzing..." : aiAdvice ? "Refresh Advice" : "Get AI Advice"}
          </button>
        </div>

        {aiError && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#ef4444", fontSize: "0.82rem", padding: "10px 14px", background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: 8, marginBottom: 12 }}>
            <AlertCircle size={14} /> {aiError}
          </div>
        )}

        {aiLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: "0.85rem", padding: "8px 0" }}>
            <RefreshCw size={13} style={{ animation: "spin 1s linear infinite", color: "var(--accent-purple)" }} />
            ANVIORA is analyzing your pipeline statistics...
          </div>
        )}

        {aiAdvice && !aiLoading && (
          <div style={{
            fontSize: "0.88rem",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            background: "var(--bg-primary)",
            border: "1px solid var(--border-color)",
            borderRadius: 8,
            padding: 14,
          }}>
            {aiAdvice}
          </div>
        )}

        {!aiAdvice && !aiLoading && !aiError && (
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>
            Click <strong style={{ color: "var(--accent-purple)" }}>Get AI Advice</strong> to get customized preparation insights and action steps based on your active tracker data.
          </p>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        onSave={saveEntry}
        editData={editData}
        key={editData?.id ?? "new"}
      />
      <DetailDrawer
        app={viewApp}
        onClose={() => setViewApp(null)}
        onEdit={openEdit}
        onDelete={deleteEntry}
      />
    </div>
  );
}