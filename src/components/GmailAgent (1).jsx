"use client";
import { useState, useRef, useEffect } from "react";

async function callClaude(userPrompt, systemPrompt) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: userPrompt }], system: systemPrompt }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// FIX 1: accessToken ajouté
async function sendGmailReal(to, subject, body, notificationEmail, accessToken) {
  const res = await fetch("/api/gmail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject, body, notificationEmail, accessToken }),
  });
  return res.json();
}

async function fetchInboxReal() {
  const res = await fetch("/api/gmail");
  return res.json();
}

async function addCalendarEvent(title, dateStr, attendeeEmail, description) {
  const res = await fetch("/api/calendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, dateStr, attendeeEmail, description }),
  });
  return res.json();
}

const N = {
  bg: "#0A1515", bgCard: "#0F1C1C", bgCardHover: "#142020",
  border: "#1A2E2E", borderLight: "#243D3D",
  accent: "#4DD9E8", accentGlow: "rgba(77,217,232,0.18)",
  accentLight: "rgba(77,217,232,0.10)", accentMed: "rgba(77,217,232,0.18)",
  success: "#22C55E", successBg: "rgba(34,197,94,0.1)",
  warning: "#F59E0B", warningBg: "rgba(245,158,11,0.1)",
  error: "#EF4444", errorBg: "rgba(239,68,68,0.1)",
  purple: "#A855F7", purpleBg: "rgba(168,85,247,0.1)",
  textPrimary: "#E8F8F8", textSecondary: "#7AA8A8", textMuted: "#3D6060",
  font: "'Inter','DM Sans',sans-serif",
};

const CATEGORIES = [
  { id: "commercial", label: "Commercial", icon: "💼", color: "rgba(77,217,232,0.10)", accent: N.accent },
  { id: "support", label: "Support client", icon: "🎧", color: "rgba(34,197,94,0.10)", accent: "#22C55E" },
  { id: "partenariat", label: "Partenariat", icon: "🤝", color: "rgba(168,85,247,0.10)", accent: "#A855F7" },
  { id: "relance", label: "Relance", icon: "🔔", color: "rgba(245,158,11,0.10)", accent: "#F59E0B" },
  { id: "interne", label: "Interne", icon: "🏢", color: "rgba(236,72,153,0.10)", accent: "#EC4899" },
];

const DEFAULT_TEMPLATES = {
  commercial: { name: "Prospection commerciale", subject: "Proposition de collaboration – {{company}}", body: "Bonjour {{prenom}},\n\nJe me permets de vous contacter au sujet d'une opportunité qui pourrait intéresser {{company}}.\n\n{{message_personnalise}}\n\nCordialement," },
  support: { name: "Réponse support", subject: "Re: Votre demande #{{ticket_id}}", body: "Bonjour {{prenom}},\n\nNous avons bien reçu votre demande concernant {{sujet}}.\n\n{{reponse}}\n\nN'hésitez pas à nous recontacter si besoin.\n\nCordialement," },
  partenariat: { name: "Proposition partenariat", subject: "Opportunité de partenariat avec {{company}}", body: "Bonjour {{prenom}},\n\nNous serions ravis de discuter d'un potentiel partenariat entre nos deux structures.\n\n{{details}}\n\nDisposez-vous de disponibilités pour un échange ?\n\nCordialement," },
  relance: { name: "Email de relance", subject: "Suite à notre échange – {{sujet}}", body: "Bonjour {{prenom}},\n\nJe me permets de revenir vers vous suite à mon précédent message du {{date}}.\n\n{{message_relance}}\n\nDans l'attente de votre retour,\n\nCordialement," },
  interne: { name: "Communication interne", subject: "[Interne] {{sujet}}", body: "Bonjour à tous,\n\n{{message}}\n\nMerci de votre attention.\n\nCordialement," },
};

const DEFAULT_SIGNATURES = [
  { id: 1, name: "Direction", senderEmail: "", fullName: "Alexandre Moreau", title: "Directeur Général", company: "Nayro", phone: "+33 6 12 34 56 78", email: "alexandre@nayro.eu", website: "nayro.eu", linkedin: "linkedin.com/in/alexandre-moreau", showLogo: true, primaryColor: "#4DD9E8", secondaryColor: "#0A1515" },
  { id: 2, name: "Commercial", senderEmail: "", fullName: "Sarah Dupont", title: "Responsable Commerciale", company: "Nayro", phone: "+33 6 98 76 54 32", email: "sarah@nayro.eu", website: "nayro.eu", linkedin: "linkedin.com/in/sarah-dupont", showLogo: true, primaryColor: "#4DD9E8", secondaryColor: "#0A1515" },
];

const DEMO_CONTACTS = [
  { id: 1, prenom: "Sophie", nom: "Martin", email: "sophie.martin@acme.fr", company: "Acme Corp", category: "commercial" },
  { id: 2, prenom: "Lucas", nom: "Bernard", email: "lucas.bernard@techco.fr", company: "TechCo", category: "commercial" },
  { id: 3, prenom: "Marie", nom: "Dupont", email: "marie.dupont@startup.io", company: "Startup.io", category: "partenariat" },
  { id: 4, prenom: "Thomas", nom: "Leroy", email: "thomas.leroy@client.com", company: "ClientX", category: "support" },
  { id: 5, prenom: "Julie", nom: "Moreau", email: "julie.moreau@prospect.fr", company: "ProspectY", category: "relance" },
];

const Card = ({ children, style }) => <div style={{ background: N.bgCard, border: `1px solid ${N.border}`, borderRadius: 16, padding: 20, ...style }}>{children}</div>;
const Label = ({ children }) => <div style={{ fontFamily: N.font, fontSize: 10, letterSpacing: 2.5, color: N.textMuted, textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>{children}</div>;
const NInput = ({ style, ...p }) => <input {...p} style={{ width: "100%", padding: "9px 12px", border: `1px solid ${N.border}`, borderRadius: 9, fontSize: 13, background: N.bg, color: N.textPrimary, outline: "none", fontFamily: N.font, ...style }} />;
const NTextarea = ({ style, ...p }) => <textarea {...p} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${N.border}`, borderRadius: 9, fontSize: 13, background: N.bg, color: N.textPrimary, outline: "none", fontFamily: N.font, lineHeight: 1.7, resize: "none", ...style }} />;
const BtnP = ({ children, onClick, disabled, style }) => <button onClick={onClick} disabled={disabled} style={{ padding: "10px 18px", fontFamily: N.font, fontWeight: 700, fontSize: 12, borderRadius: 9, border: "none", background: disabled ? N.border : `linear-gradient(135deg,${N.accent},#2ABFCE)`, color: disabled ? N.textMuted : N.bg, cursor: disabled ? "not-allowed" : "pointer", boxShadow: disabled ? "none" : `0 4px 18px ${N.accentGlow}`, transition: "all .2s", ...style }}>{children}</button>;
const BtnO = ({ children, onClick, style }) => <button onClick={onClick} style={{ padding: "9px 16px", fontFamily: N.font, fontWeight: 600, fontSize: 12, borderRadius: 9, border: `1px solid ${N.borderLight}`, background: "transparent", color: N.textSecondary, cursor: "pointer", transition: "all .2s", ...style }}>{children}</button>;
const Badge = ({ label, color, bg }) => <span style={{ background: bg, color, borderRadius: 7, padding: "3px 9px", fontFamily: N.font, fontSize: 11, fontWeight: 700 }}>{label}</span>;

function SignaturePreview({ sig }) {
  if (!sig) return null;
  return (
    <div style={{ fontFamily: "Arial, sans-serif", fontSize: 13, borderLeft: `3px solid ${sig.primaryColor}`, paddingLeft: 12, marginTop: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: sig.primaryColor }}>{sig.fullName}</div>
      <div style={{ color: "#666", fontSize: 12 }}>{sig.title} — {sig.company}</div>
      {sig.phone && <div style={{ color: "#444", fontSize: 12, marginTop: 4 }}>📞 {sig.phone}</div>}
      {sig.email && <div style={{ color: "#444", fontSize: 12 }}>✉️ {sig.email}</div>}
      {sig.website && <div style={{ color: sig.primaryColor, fontSize: 12 }}>🌐 {sig.website}</div>}
      {sig.linkedin && <div style={{ color: "#0077B5", fontSize: 12 }}>🔗 {sig.linkedin}</div>}
      {sig.showLogo && <div style={{ marginTop: 8 }}><img src="https://nayro.eu/images/logo.svg" alt="Nayro" style={{ height: 20 }} onError={e => e.target.style.display = "none"} /></div>}
    </div>
  );
}

function buildEmailWithSignature(body, sig) {
  if (!sig) return body;
  return body + `\n\n--\n${sig.fullName}\n${sig.title} — ${sig.company}\n${sig.phone || ""}\n${sig.email || ""}\n${sig.website || ""}`;
}

export default function GmailAgent({ session, onSignOut }) {
  const [screen, setScreen] = useState("compose");
  const [senderEmail, setSenderEmail] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("commercial");
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [signatures, setSignatures] = useState(DEFAULT_SIGNATURES);
  const [selectedSigId, setSelectedSigId] = useState(1);
  const [editingSig, setEditingSig] = useState(null);
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [contacts, setContacts] = useState(DEMO_CONTACTS);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [sendQueue, setSendQueue] = useState([]);
  const [sendingBulk, setSendingBulk] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ prenom: "", nom: "", email: "", company: "", category: "commercial" });
  const [inbox, setInbox] = useState([]);
  const [selectedInboxMsg, setSelectedInboxMsg] = useState(null);
  const [aiReply, setAiReply] = useState(null);
  const [generatingReply, setGeneratingReply] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [pendingCalEvent, setPendingCalEvent] = useState(null);
  const [logoSrc, setLogoSrc] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    fetch("https://nayro.eu/images/logo.svg")
      .then(r => r.blob()).then(b => { const fr = new FileReader(); fr.onload = e => setLogoSrc(e.target.result); fr.readAsDataURL(b); }).catch(() => {});
  }, []);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };
  const activeSig = signatures.find(s => s.id === selectedSigId) || signatures[0];
  const filteredContacts = contacts.filter(c => c.category === selectedCategory);
  const toggleContact = (id) => setSelectedContacts(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const selectAllByCategory = () => {
    const ids = filteredContacts.map(c => c.id);
    const all = ids.every(id => selectedContacts.includes(id));
    setSelectedContacts(all ? prev => prev.filter(id => !ids.includes(id)) : prev => [...new Set([...prev, ...ids])]);
  };
  const addNotification = (msg, type = "info") => {
    const n = { id: Date.now(), msg, type, date: new Date().toLocaleString("fr-FR") };
    setNotifications(prev => [n, ...prev]);
  };

  const generateSingle = async () => {
    if (!context.trim()) return showToast("Décrivez le contexte.", "error");
    if (!senderEmail.trim()) return showToast("Indiquez votre adresse Gmail.", "error");
    setLoading(true);
    try {
      const tpl = templates[selectedCategory];
      const sigText = activeSig ? `\n\nSignature: ${activeSig.fullName}, ${activeSig.title}, ${activeSig.company}` : "";
      const prompt = `Catégorie: ${CATEGORIES.find(c => c.id === selectedCategory)?.label}\nTemplate: ${tpl?.body || ""}\nContexte: ${context}\nExpéditeur: ${senderEmail}${sigText}\nRetourne UNIQUEMENT un JSON {"subject":"...","body":"..."}. Le corps ne doit PAS inclure la signature. Pas de markdown.`;
      const text = await callClaude(prompt);
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setSubject(parsed.subject); setEmailBody(parsed.body);
      showToast("Email généré !");
    } catch { showToast("Erreur génération.", "error"); }
    setLoading(false);
  };

  // FIX 2: session.accessToken passé
  const sendSingle = async () => {
    if (!emailBody) return showToast("Générez d'abord un email.", "error");
    const fullBody = buildEmailWithSignature(emailBody, activeSig);
    const result = await sendGmailReal(senderEmail, subject, fullBody, session?.user?.email, session?.accessToken);
    const status = result.success ? "Envoyé" : "Erreur";
    const entry = { id: Date.now(), date: new Date().toLocaleString("fr-FR"), to: senderEmail, subject, category: selectedCategory, status, bulk: false, sig: activeSig?.name };
    setHistory(prev => [entry, ...prev]);
    addNotification(`Email envoyé : "${subject}"`, "success");
    showToast(result.success ? "Email envoyé !" : `Erreur: ${result.error}`);
  };

  const generateAndSendBulk = async () => {
    if (!context.trim()) return showToast("Décrivez le contexte.", "error");
    if (!senderEmail.trim()) return showToast("Indiquez votre adresse Gmail.", "error");
    const targets = contacts.filter(c => selectedContacts.includes(c.id));
    if (!targets.length) return showToast("Sélectionnez au moins un destinataire.", "error");
    setSendingBulk(true); setSendProgress(0);
    const queue = targets.map(c => ({ contact: c, status: "pending", subject: "", body: "", error: null }));
    setSendQueue([...queue]);
    for (let i = 0; i < queue.length; i++) {
      queue[i] = { ...queue[i], status: "generating" }; setSendQueue([...queue]);
      try {
        const tpl = templates[queue[i].contact.category] || templates[selectedCategory];
        const sig = activeSig;
        const prompt = `Catégorie: ${CATEGORIES.find(c => c.id === (queue[i].contact.category || selectedCategory))?.label}\nTemplate: ${tpl?.body || ""}\nContexte: ${context}\nDestinataire: ${queue[i].contact.prenom} ${queue[i].contact.nom}, entreprise: ${queue[i].contact.company || "inconnue"}\nExpéditeur: ${sig?.fullName || senderEmail}, ${sig?.title || ""}, ${sig?.company || "Nayro"}\nPersonnalise l'email. Le corps ne doit PAS inclure la signature. UNIQUEMENT JSON {"subject":"...","body":"..."}. Pas de markdown.`;
        const text = await callClaude(prompt);
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        queue[i] = { ...queue[i], status: "sent", subject: parsed.subject, body: parsed.body };
        const fullBody = buildEmailWithSignature(parsed.body, sig);
        // FIX 3: session.accessToken passé dans bulk
        await sendGmailReal(queue[i].contact.email, parsed.subject, fullBody, session?.user?.email, session?.accessToken);
        setHistory(prev => [{ id: Date.now() + i, date: new Date().toLocaleString("fr-FR"), to: queue[i].contact.email, toName: `${queue[i].contact.prenom} ${queue[i].contact.nom}`, subject: parsed.subject, category: queue[i].contact.category || selectedCategory, status: "Envoyé", bulk: true, sig: sig?.name }, ...prev]);
      } catch { queue[i] = { ...queue[i], status: "error", error: "Échec" }; }
      setSendQueue([...queue]); setSendProgress(Math.round(((i + 1) / queue.length) * 100));
      await new Promise(r => setTimeout(r, 500));
    }
    setSendingBulk(false);
    const sent = queue.filter(q => q.status === "sent").length;
    addNotification(`Envoi en masse terminé : ${sent}/${queue.length} emails envoyés`, "success");
    showToast(`${sent}/${queue.length} emails envoyés !`);
  };

  const generateAiReply = async (msg) => {
    setSelectedInboxMsg(msg); setAiReply(null); setGeneratingReply(true);
    try {
      const sig = activeSig;
      const prompt = `Tu es un assistant IA professionnel qui répond à des emails reçus pour Nayro.\nEmail reçu de ${msg.fromName} (${msg.from}):\nSujet: ${msg.subject}\nCorps: ${msg.body}\nRédige une réponse professionnelle. L'expéditeur: ${sig?.fullName || "Nayro"}.\nRetourne UNIQUEMENT un JSON: {"subject":"...","body":"...","calendarRequest":true/false,"dateProposed":"..." ou null,"suggestedDate":"YYYY-MM-DDThh:mm" ou null,"summary":"résumé en 1 ligne"}\nPas de markdown.`;
      const text = await callClaude(prompt);
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setAiReply(parsed);
      if (parsed.calendarRequest && parsed.suggestedDate) setPendingCalEvent({ title: `RDV avec ${msg.fromName}`, date: parsed.suggestedDate, email: msg.from, name: msg.fromName });
    } catch { showToast("Erreur lors de l'analyse de l'email.", "error"); }
    setGeneratingReply(false);
  };

  const validateAndSendReply = async () => {
    if (!aiReply) return;
    const fullBody = buildEmailWithSignature(aiReply.body, activeSig);
    await sendGmailReal(selectedInboxMsg.from, aiReply.subject, fullBody, session?.user?.email, session?.accessToken);
    setInbox(prev => prev.map(m => m.id === selectedInboxMsg.id ? { ...m, replied: true, read: true } : m));
    setHistory(prev => [{ id: Date.now(), date: new Date().toLocaleString("fr-FR"), to: selectedInboxMsg.from, toName: selectedInboxMsg.fromName, subject: aiReply.subject, category: "support", status: "Envoyé", bulk: false, sig: activeSig?.name, isReply: true }, ...prev]);
    addNotification(`Réponse envoyée à ${selectedInboxMsg.fromName} : "${aiReply.subject}"`, "reply");
    showToast(`Réponse envoyée à ${selectedInboxMsg.fromName} !`);
    if (pendingCalEvent) setShowCalendar(true);
    setSelectedInboxMsg(null); setAiReply(null); setPendingCalEvent(null);
  };

  const addToCalendar = (evt) => {
    const d = new Date(evt.date);
    const hours = d.getHours(); const day = d.getDay();
    let valid = day >= 1 && day <= 5 && hours >= 9 && hours < 18;
    if (!valid) {
      if (hours < 9) d.setHours(9, 0);
      if (hours >= 18) { d.setDate(d.getDate() + 1); d.setHours(9, 0); }
      if (d.getDay() === 6) d.setDate(d.getDate() + 2);
      if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    }
    const newEvt = { ...evt, date: d.toISOString(), id: Date.now(), adjustedFromOriginal: !valid };
    setCalendarEvents(prev => [...prev, newEvt]);
    addNotification(`📅 RDV : "${evt.title}" le ${d.toLocaleDateString("fr-FR")} à ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}${!valid ? " (ajusté)" : ""}`, "calendar");
    showToast("RDV ajouté au calendrier !");
    setShowCalendar(false); setPendingCalEvent(null);
  };

  const parseCSV = (text) => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/["\r]/g, ""));
    return lines.slice(1).map((line, i) => {
      const vals = line.split(",").map(v => v.trim().replace(/^"|"$|\r/g, ""));
      const obj = {}; headers.forEach((h, idx) => { obj[h] = vals[idx] || ""; });
      return { id: Date.now() + i, prenom: obj.prenom || obj.firstname || "", nom: obj.nom || obj.lastname || "", email: obj.email || obj.mail || "", company: obj.company || obj.entreprise || "", category: obj.category || obj.categorie || selectedCategory };
    }).filter(c => c.email);
  };

  const handleCSVImport = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { const imported = parseCSV(ev.target.result); if (!imported.length) return showToast("Aucun contact valide.", "error"); setContacts(prev => [...prev, ...imported]); showToast(`${imported.length} contact(s) importé(s) !`); };
    reader.readAsText(file); e.target.value = "";
  };

  const navItems = [["compose","✍️","Composer"],["inbox","📬","Boîte de réception"],["signatures","🖊️","Signatures"],["contacts","👥","Contacts"],["templates","📋","Templates"],["calendar","📅","Calendrier"],["history","🕐","Historique"]];
  const unreadCount = inbox.filter(m => !m.read).length;
  const notifCount = notifications.filter(n => !n.seen).length;

  return (
    <div style={{ fontFamily: N.font, minHeight: "100vh", background: N.bg, color: N.textPrimary }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <input ref={fileInputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleCSVImport} />

      {toast && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: toast.type === "error" ? N.errorBg : "rgba(77,217,232,0.12)", border: `1px solid ${toast.type === "error" ? N.error : N.accent}`, color: toast.type === "error" ? N.error : N.accent, padding: "12px 20px", borderRadius: 12, fontFamily: N.font, fontSize: 13, fontWeight: 600, backdropFilter: "blur(12px)", animation: "slideIn .3s ease" }}>{toast.msg}</div>}

      {showCalendar && pendingCalEvent && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Card style={{ maxWidth: 440, width: "90%", padding: 28 }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>📅 Ajouter au calendrier</div>
            <div style={{ fontSize: 12, color: N.textMuted, marginBottom: 20 }}>Une demande de rendez-vous a été détectée.</div>
            <div style={{ background: N.bg, borderRadius: 10, padding: 16, marginBottom: 18, border: `1px solid ${N.border}` }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{pendingCalEvent.title}</div>
              <div style={{ fontSize: 12, color: N.textSecondary }}>Avec : {pendingCalEvent.email}</div>
              <div style={{ fontSize: 11, color: N.warning, marginTop: 8 }}>⚡ Horaires : Lun–Ven, 9h–18h. Ajusté automatiquement si nécessaire.</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <BtnP onClick={() => addToCalendar(pendingCalEvent)} style={{ flex: 1 }}>✓ Ajouter</BtnP>
              <BtnO onClick={() => { setShowCalendar(false); setPendingCalEvent(null); }} style={{ flex: 1 }}>Ignorer</BtnO>
            </div>
          </Card>
        </div>
      )}

      <style>{`
        @keyframes slideIn{from{transform:translateX(20px);opacity:0}to{transform:none;opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        *{box-sizing:border-box;margin:0;padding:0}
        textarea,input,select{font-family:'Inter',sans-serif;color:#E8F8F8}
        textarea::placeholder,input::placeholder{color:#3D6060}
        input:focus,textarea:focus{border-color:#4DD9E8!important;outline:none;box-shadow:0 0 0 3px rgba(77,217,232,.1)}
        select{background:#0A1515;color:#E8F8F8;border:1px solid #1A2E2E}
        select option{background:#0F1C1C}
        .nav-btn:hover{background:rgba(77,217,232,.07)!important;color:#4DD9E8!important}
        .inbox-row:hover{background:#142020!important}
        .contact-row:hover{background:#142020!important}
        .contact-row:hover .del-btn,.inbox-row:hover .del-btn{opacity:1!important}
        .del-btn{opacity:0;transition:opacity .2s}
        .cat-chip:hover{transform:translateY(-1px)}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#243D3D;border-radius:4px}
        .btn-o:hover{border-color:#4DD9E8!important;color:#4DD9E8!important}
        input[type=color]{border:none;padding:2px;cursor:pointer;border-radius:6px;height:32px;width:40px}
      `}</style>

      {/* HEADER */}
      <div style={{ background: "rgba(10,21,21,.97)", borderBottom: `1px solid ${N.border}`, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(24px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {logoSrc ? <img src={logoSrc} alt="Nayro" style={{ height: 32, width: 32, borderRadius: 7, objectFit: "cover" }} /> : <div style={{ height: 32, width: 32, borderRadius: 7, background: N.accentLight, display: "flex", alignItems: "center", justifyContent: "center", color: N.accent, fontWeight: 800 }}>N</div>}
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: 2.5, textTransform: "uppercase" }}>NAYRO</span>
          <div style={{ width: 1, height: 18, background: N.border }} />
          <span style={{ fontSize: 11, color: N.textMuted }}>Email Agent</span>
          <div style={{ background: N.accentMed, border: `1px solid ${N.accent}44`, borderRadius: 20, padding: "2px 8px", fontSize: 9, fontWeight: 800, color: N.accent, letterSpacing: 2 }}>IA</div>
        </div>
        <nav style={{ display: "flex", gap: 2 }}>
          {navItems.map(([s, icon, label]) => (
            <button key={s} className="nav-btn" onClick={() => setScreen(s)} style={{ fontFamily: N.font, fontSize: 11, fontWeight: 500, padding: "7px 11px", borderRadius: 9, background: screen === s ? N.accentLight : "transparent", color: screen === s ? N.accent : N.textSecondary, border: `1px solid ${screen === s ? N.accent + "33" : "transparent"}`, cursor: "pointer", transition: "all .2s", position: "relative", display: "flex", alignItems: "center", gap: 5 }}>
              {icon} {label}
              {s === "inbox" && unreadCount > 0 && <span style={{ background: N.error, color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", position: "absolute", top: 2, right: 2 }}>{unreadCount}</span>}
            </button>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {notifications.length > 0 && (
            <div style={{ background: N.bgCard, border: `1px solid ${N.border}`, borderRadius: 9, padding: "5px 12px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }} onClick={() => setScreen("history")}>
              <span style={{ fontSize: 14 }}>🔔</span>
              {notifCount > 0 && <span style={{ background: N.accent, color: N.bg, borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{notifCount}</span>}
            </div>
          )}
          {session?.user?.email && <div style={{ display: "flex", alignItems: "center", gap: 7, background: N.bgCard, border: `1px solid ${N.border}`, borderRadius: 18, padding: "5px 12px" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: N.success, boxShadow: `0 0 6px ${N.success}` }} />
            <span style={{ fontSize: 11, color: N.textSecondary }}>{session.user.email}</span>
          </div>}
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 18px" }}>

        {/* COMPOSE */}
        {screen === "compose" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Card>
                <Label>Expéditeur Gmail</Label>
                <NInput type="email" placeholder="votre@gmail.com" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} />
              </Card>
              <Card>
                <Label>Signature active</Label>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  {signatures.map(s => (
                    <button key={s.id} onClick={() => setSelectedSigId(s.id)} style={{ flex: 1, padding: "8px", fontFamily: N.font, fontSize: 11, fontWeight: 600, borderRadius: 9, border: `1px solid ${selectedSigId === s.id ? N.accent + "55" : N.border}`, background: selectedSigId === s.id ? N.accentLight : "transparent", color: selectedSigId === s.id ? N.accent : N.textMuted, cursor: "pointer", transition: "all .2s" }}>
                      {s.name}
                    </button>
                  ))}
                </div>
                {activeSig && <div style={{ background: N.bg, borderRadius: 10, padding: 14, border: `1px solid ${N.border}` }}><SignaturePreview sig={activeSig} /></div>}
                <button onClick={() => setScreen("signatures")} style={{ marginTop: 8, fontFamily: N.font, fontSize: 11, color: N.accent, background: "none", border: "none", cursor: "pointer" }}>+ Gérer les signatures →</button>
              </Card>
              <Card>
                <Label>Mode d'envoi</Label>
                <div style={{ display: "flex", gap: 8, marginBottom: bulkMode ? 14 : 0 }}>
                  {[[false,"✉️","Email unique"],[true,"📨","Envoi en masse"]].map(([m, icon, lbl]) => (
                    <button key={String(m)} onClick={() => setBulkMode(m)} style={{ flex: 1, padding: "9px", fontFamily: N.font, fontWeight: 600, fontSize: 11, borderRadius: 9, border: `1px solid ${bulkMode === m ? N.accent + "55" : N.border}`, background: bulkMode === m ? N.accentLight : "transparent", color: bulkMode === m ? N.accent : N.textMuted, cursor: "pointer", transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      {icon} {lbl}
                    </button>
                  ))}
                </div>
                {bulkMode && (selectedContacts.length === 0
                  ? <div style={{ fontFamily: N.font, fontSize: 12, color: N.textMuted, padding: "10px", background: N.bg, borderRadius: 9, border: `1px dashed ${N.border}`, textAlign: "center" }}>Allez dans <span style={{ color: N.accent, fontWeight: 600 }}>Contacts</span> pour sélectionner</div>
                  : <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{contacts.filter(c => selectedContacts.includes(c.id)).map(c => <div key={c.id} style={{ background: N.accentLight, border: `1px solid ${N.accent}33`, borderRadius: 14, padding: "3px 10px", fontSize: 11, color: N.accent, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>{c.prenom} {c.nom} <span style={{ cursor: "pointer", opacity: .5 }} onClick={() => toggleContact(c.id)}>✕</span></div>)}</div>
                )}
              </Card>
              <Card>
                <Label>Catégorie</Label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                  {CATEGORIES.map(cat => <div key={cat.id} className="cat-chip" onClick={() => setSelectedCategory(cat.id)} style={{ background: selectedCategory === cat.id ? cat.color : "transparent", border: `1px solid ${selectedCategory === cat.id ? cat.accent + "55" : N.border}`, borderRadius: 9, padding: "8px 11px", fontFamily: N.font, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all .2s", display: "flex", alignItems: "center", gap: 6, color: selectedCategory === cat.id ? cat.accent : N.textSecondary }}>{cat.icon} {cat.label}</div>)}
                </div>
              </Card>
              <Card>
                <Label>Contexte{bulkMode && <span style={{ color: N.textMuted, fontWeight: 400 }}> — commun à tous</span>}</Label>
                <NTextarea value={context} onChange={e => setContext(e.target.value)} placeholder="Ex : Présenter le LuckiBot Pro à ce prospect…" rows={4} />
                {!bulkMode && <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <BtnO className="btn-o" onClick={() => { const t = templates[selectedCategory]; if (t) { setSubject(t.subject); setEmailBody(t.body); } }} style={{ flex: 1 }}>📋 Template</BtnO>
                  <BtnP onClick={generateSingle} disabled={loading} style={{ flex: 2 }}>{loading ? <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span> : "✦ Générer avec l'IA"}</BtnP>
                </div>}
              </Card>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {!bulkMode && (
                <>
                  <Card style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <Label>Aperçu email</Label>
                      {emailBody && <button onClick={() => setEditMode(!editMode)} style={{ fontSize: 11, color: N.textSecondary, background: "none", border: `1px solid ${N.border}`, borderRadius: 8, padding: "3px 9px", cursor: "pointer", fontFamily: N.font }}>{editMode ? "👁 Aperçu" : "✏️ Éditer"}</button>}
                    </div>
                    {!emailBody && !loading && <div style={{ textAlign: "center", padding: "40px 20px", color: N.textMuted }}><div style={{ fontSize: 36, marginBottom: 10, opacity: .3 }}>✉️</div><div style={{ fontSize: 12 }}>Votre email apparaîtra ici</div></div>}
                    {loading && <div style={{ textAlign: "center", padding: "40px 20px" }}><div style={{ width: 32, height: 32, border: `3px solid ${N.border}`, borderTopColor: N.accent, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} /><div style={{ fontSize: 12, color: N.textMuted }}>L'IA rédige…</div></div>}
                    {emailBody && !loading && (
                      <div>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 10, color: N.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Objet</div>
                          {editMode ? <NInput value={subject} onChange={e => setSubject(e.target.value)} style={{ fontWeight: 600 }} /> : <div style={{ fontWeight: 600, fontSize: 13, padding: "9px 12px", background: N.bg, borderRadius: 9, border: `1px solid ${N.border}` }}>{subject}</div>}
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 10, color: N.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Corps</div>
                          {editMode ? <NTextarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={10} /> : <div style={{ fontSize: 12, lineHeight: 1.8, whiteSpace: "pre-wrap", padding: "10px 12px", background: N.bg, borderRadius: 9, border: `1px solid ${N.border}`, maxHeight: 220, overflowY: "auto", color: N.textSecondary }}>{emailBody}</div>}
                        </div>
                        <div style={{ fontSize: 10, color: N.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Signature</div>
                        <div style={{ padding: "10px 12px", background: N.bg, borderRadius: 9, border: `1px solid ${N.border}` }}><SignaturePreview sig={activeSig} /></div>
                      </div>
                    )}
                  </Card>
                  {emailBody && <BtnP onClick={sendSingle} style={{ width: "100%", padding: "13px" }}>📤 Envoyer depuis {senderEmail || "Gmail"}</BtnP>}
                </>
              )}

              {bulkMode && (
                <Card style={{ flex: 1 }}>
                  <Label>Envoi en masse — {selectedContacts.length} destinataire(s)</Label>
                  {sendQueue.length === 0 ? (
                    selectedContacts.length === 0
                      ? <div style={{ textAlign: "center", padding: "30px 20px" }}><div style={{ fontSize: 34, marginBottom: 10, opacity: .3 }}>👥</div><div style={{ fontSize: 12, color: N.textMuted, marginBottom: 14 }}>Sélectionnez des contacts</div><BtnP onClick={() => setScreen("contacts")}>→ Contacts</BtnP></div>
                      : <div>
                          <div style={{ fontSize: 12, color: N.textSecondary, lineHeight: 1.7, marginBottom: 12, padding: "10px 12px", background: N.accentLight, borderRadius: 9, border: `1px solid ${N.accent}22` }}>✦ Email personnalisé avec la signature <strong style={{ color: N.accent }}>{activeSig?.name}</strong> pour chaque destinataire.</div>
                          <div style={{ background: N.bg, borderRadius: 10, marginBottom: 12, maxHeight: 200, overflowY: "auto", border: `1px solid ${N.border}` }}>
                            {contacts.filter(c => selectedContacts.includes(c.id)).map(c => { const cat = CATEGORIES.find(cat => cat.id === c.category); return <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: "8px 12px", borderBottom: `1px solid ${N.border}` }}><span style={{ fontWeight: 600 }}>{c.prenom} {c.nom}</span><span style={{ color: N.textMuted }}>{c.email}</span><span style={{ background: cat?.color, color: cat?.accent, borderRadius: 5, padding: "2px 7px", fontSize: 10, fontWeight: 700 }}>{cat?.icon}</span></div>; })}
                          </div>
                          <BtnP onClick={generateAndSendBulk} disabled={sendingBulk || !context.trim()} style={{ width: "100%", padding: "12px" }}>🚀 Générer & envoyer {selectedContacts.length} email{selectedContacts.length > 1 ? "s" : ""}</BtnP>
                        </div>
                  ) : (
                    <div>
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: N.textMuted, marginBottom: 6 }}><span>Progression</span><span style={{ color: sendProgress === 100 ? N.success : N.accent, fontWeight: 700 }}>{sendProgress}%</span></div>
                        <div style={{ background: N.border, borderRadius: 5, height: 6, overflow: "hidden" }}><div style={{ background: `linear-gradient(90deg,${N.accent},#2ABFCE)`, height: "100%", width: `${sendProgress}%`, borderRadius: 5, transition: "width .4s ease" }} /></div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflowY: "auto" }}>
                        {sendQueue.map((item, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", background: N.bg, borderRadius: 9, border: `1px solid ${N.border}` }}>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: item.status === "sent" ? N.successBg : item.status === "error" ? N.errorBg : item.status === "generating" ? N.warningBg : N.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, color: item.status === "sent" ? N.success : item.status === "error" ? N.error : item.status === "generating" ? N.warning : N.textMuted }}>
                            {item.status === "generating" ? <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> : item.status === "sent" ? "✓" : item.status === "error" ? "✕" : "○"}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 12 }}>{item.contact.prenom} {item.contact.nom}</div><div style={{ fontSize: 11, color: N.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.status === "sent" ? item.subject : item.status === "generating" ? "Génération…" : item.contact.email}</div></div>
                          <Badge label={item.status === "sent" ? "✓ Envoyé" : item.status === "error" ? "✕ Erreur" : item.status === "generating" ? "⟳ En cours" : "○ En attente"} color={item.status === "sent" ? N.success : item.status === "error" ? N.error : item.status === "generating" ? N.warning : N.textMuted} bg={item.status === "sent" ? N.successBg : item.status === "error" ? N.errorBg : item.status === "generating" ? N.warningBg : "transparent"} />
                        </div>)}
                      </div>
                      {!sendingBulk && <BtnO onClick={() => { setSendQueue([]); setSendProgress(0); }} style={{ width: "100%", marginTop: 10 }}>← Nouvel envoi</BtnO>}
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        )}

        {/* INBOX */}
        {screen === "inbox" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div><div style={{ fontSize: 20, fontWeight: 700 }}>Boîte de réception</div><div style={{ fontSize: 11, color: N.textMuted, marginTop: 2 }}>{unreadCount} non lu(s) — L'IA analyse et propose des réponses</div></div>
            </div>
            {inbox.length === 0 && <Card><div style={{ textAlign: "center", padding: "40px", fontSize: 13, color: N.textMuted }}>Aucun email dans la boîte de réception</div></Card>}
            <div style={{ display: "grid", gridTemplateColumns: selectedInboxMsg ? "1fr 1fr" : "1fr", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {inbox.map(msg => (
                  <div key={msg.id} className="inbox-row" onClick={() => { setSelectedInboxMsg(msg); setAiReply(null); setInbox(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m)); }}
                    style={{ background: selectedInboxMsg?.id === msg.id ? N.accentLight : N.bgCard, border: `1px solid ${selectedInboxMsg?.id === msg.id ? N.accent + "44" : N.border}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "all .2s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {!msg.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: N.accent, flexShrink: 0 }} />}
                        <div style={{ fontWeight: msg.read ? 500 : 700, fontSize: 13 }}>{msg.fromName}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {msg.calendarDetected && <Badge label="📅 RDV" color={N.warning} bg={N.warningBg} />}
                        {msg.replied && <Badge label="✓ Répondu" color={N.success} bg={N.successBg} />}
                        <div style={{ fontSize: 10, color: N.textMuted }}>{msg.date}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{msg.subject}</div>
                    <div style={{ fontSize: 11, color: N.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.body}</div>
                  </div>
                ))}
              </div>
              {selectedInboxMsg && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeIn .3s ease" }}>
                  <Card>
                    <Label>Email reçu</Label>
                    <div style={{ fontSize: 11, color: N.textMuted, marginBottom: 6 }}>De : {selectedInboxMsg.fromName} &lt;{selectedInboxMsg.from}&gt; · {selectedInboxMsg.date}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{selectedInboxMsg.subject}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.8, color: N.textSecondary, whiteSpace: "pre-wrap", maxHeight: 200, overflowY: "auto" }}>{selectedInboxMsg.body}</div>
                    {!aiReply && !generatingReply && !selectedInboxMsg.replied && (
                      <BtnP onClick={() => generateAiReply(selectedInboxMsg)} style={{ marginTop: 14, width: "100%" }}>✦ Générer une réponse IA</BtnP>
                    )}
                  </Card>
                  {generatingReply && <Card><div style={{ textAlign: "center", padding: "24px" }}><div style={{ width: 30, height: 30, border: `3px solid ${N.border}`, borderTopColor: N.accent, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 10px" }} /><div style={{ fontSize: 12, color: N.textMuted }}>Analyse en cours…</div></div></Card>}
                  {aiReply && !generatingReply && (
                    <Card style={{ animation: "fadeIn .3s ease" }}>
                      <Label>Réponse proposée par l'IA</Label>
                      {aiReply.summary && <div style={{ background: N.accentLight, border: `1px solid ${N.accent}22`, borderRadius: 9, padding: "8px 12px", marginBottom: 12, fontSize: 11, color: N.accent }}>📋 Résumé : {aiReply.summary}</div>}
                      {aiReply.calendarRequest && <div style={{ background: N.warningBg, border: `1px solid ${N.warning}33`, borderRadius: 9, padding: "8px 12px", marginBottom: 12, fontSize: 11, color: N.warning }}>📅 Demande de RDV : {aiReply.dateProposed || "date à confirmer"}</div>}
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 10, color: N.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Objet</div>
                        <NInput value={aiReply.subject} onChange={e => setAiReply({ ...aiReply, subject: e.target.value })} />
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 10, color: N.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Corps</div>
                        <NTextarea value={aiReply.body} onChange={e => setAiReply({ ...aiReply, body: e.target.value })} rows={8} />
                      </div>
                      <div style={{ fontSize: 10, color: N.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Signature</div>
                      <div style={{ padding: "10px 12px", background: N.bg, borderRadius: 9, border: `1px solid ${N.border}`, marginBottom: 14 }}><SignaturePreview sig={activeSig} /></div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <BtnP onClick={validateAndSendReply} style={{ flex: 2 }}>✓ Valider & envoyer</BtnP>
                        <BtnO onClick={() => generateAiReply(selectedInboxMsg)} style={{ flex: 1 }}>↺ Régénérer</BtnO>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SIGNATURES */}
        {screen === "signatures" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div><div style={{ fontSize: 20, fontWeight: 700 }}>Signatures</div><div style={{ fontSize: 11, color: N.textMuted, marginTop: 2 }}>Éditeur visuel avec aperçu en temps réel</div></div>
              <BtnP onClick={() => { const ns = { id: Date.now(), name: "Nouvelle signature", senderEmail: "", fullName: "", title: "", company: "Nayro", phone: "", email: "", website: "nayro.eu", linkedin: "", showLogo: true, primaryColor: "#4DD9E8", secondaryColor: "#0A1515" }; setSignatures(prev => [...prev, ns]); setEditingSig(ns); setSelectedSigId(ns.id); }}>+ Nouvelle signature</BtnP>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {signatures.map(s => (
                  <div key={s.id} onClick={() => { setEditingSig({ ...s }); setSelectedSigId(s.id); }} style={{ background: selectedSigId === s.id ? N.accentLight : N.bgCard, border: `1px solid ${selectedSigId === s.id ? N.accent + "44" : N.border}`, borderRadius: 11, padding: "12px 14px", cursor: "pointer", transition: "all .2s" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: selectedSigId === s.id ? N.accent : N.textPrimary }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: N.textMuted, marginTop: 2 }}>{s.fullName || "Sans nom"}</div>
                  </div>
                ))}
              </div>
              {editingSig && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Card>
                    <Label>Éditeur</Label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[["Nom de la signature","name"],["Email lié (optionnel)","senderEmail"],["Nom complet","fullName"],["Titre / Poste","title"],["Entreprise","company"],["Téléphone","phone"],["Email affiché","email"],["Site web","website"],["LinkedIn","linkedin"]].map(([lbl, key]) => (
                        <div key={key}>
                          <div style={{ fontSize: 10, color: N.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>{lbl}</div>
                          <NInput value={editingSig[key] || ""} onChange={e => setEditingSig({ ...editingSig, [key]: e.target.value })} />
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 10, color: N.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Couleur principale</div>
                          <input type="color" value={editingSig.primaryColor || "#4DD9E8"} onChange={e => setEditingSig({ ...editingSig, primaryColor: e.target.value })} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
                          <input type="checkbox" checked={editingSig.showLogo || false} onChange={e => setEditingSig({ ...editingSig, showLogo: e.target.checked })} style={{ width: 15, height: 15, accentColor: N.accent }} />
                          <span style={{ fontSize: 12, color: N.textSecondary }}>Afficher le logo Nayro</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                        <BtnP onClick={() => { setSignatures(prev => prev.map(s => s.id === editingSig.id ? editingSig : s)); setSelectedSigId(editingSig.id); showToast("Signature sauvegardée !"); }} style={{ flex: 2 }}>💾 Sauvegarder</BtnP>
                        {signatures.length > 1 && <BtnO onClick={() => { setSignatures(prev => prev.filter(s => s.id !== editingSig.id)); setEditingSig(null); setSelectedSigId(signatures[0].id); }} style={{ flex: 1 }}>🗑 Supprimer</BtnO>}
                      </div>
                    </div>
                  </Card>
                  <Card>
                    <Label>Aperçu en temps réel</Label>
                    <div style={{ background: "#FFFFFF", borderRadius: 10, padding: 20, minHeight: 200 }}>
                      <div style={{ fontSize: 13, color: "#333", fontFamily: "Arial,sans-serif", lineHeight: 1.7, marginBottom: 8 }}>Cordialement,</div>
                      <SignaturePreview sig={editingSig} />
                    </div>
                    <div style={{ marginTop: 12, padding: "10px 12px", background: N.accentLight, borderRadius: 9, border: `1px solid ${N.accent}22` }}>
                      <div style={{ fontSize: 11, color: N.accent }}>✦ Cette signature sera automatiquement ajoutée à tous les emails.</div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTACTS */}
        {screen === "contacts" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div><div style={{ fontSize: 20, fontWeight: 700 }}>Contacts</div><div style={{ fontSize: 11, color: N.textMuted, marginTop: 2 }}>{contacts.length} total · {selectedContacts.length} sélectionné(s)</div></div>
              <div style={{ display: "flex", gap: 8 }}><BtnO className="btn-o" onClick={() => fileInputRef.current.click()}>📥 CSV</BtnO><BtnP onClick={() => setShowAddContact(!showAddContact)}>+ Ajouter</BtnP></div>
            </div>
            <div style={{ background: N.accentLight, border: `1px solid ${N.accent}33`, borderRadius: 9, padding: "9px 14px", marginBottom: 14, fontSize: 11, color: N.accent }}>💡 CSV : <code style={{ background: "rgba(77,217,232,.12)", padding: "1px 5px", borderRadius: 4 }}>prenom, nom, email, company, category</code></div>
            {showAddContact && <Card style={{ marginBottom: 14 }}>
              <Label>Nouveau contact</Label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr 1fr", gap: 8, marginBottom: 10 }}>
                {[["Prénom","prenom"],["Nom","nom"],["Email","email"],["Entreprise","company"]].map(([ph, key]) => <NInput key={key} placeholder={ph} value={newContact[key]} onChange={e => setNewContact({ ...newContact, [key]: e.target.value })} />)}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select value={newContact.category} onChange={e => setNewContact({ ...newContact, category: e.target.value })} style={{ padding: "9px 11px", borderRadius: 9, fontSize: 12 }}>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select>
                <BtnP onClick={() => { if (!newContact.email) return showToast("Email requis.","error"); setContacts(prev => [...prev, { ...newContact, id: Date.now() }]); setNewContact({ prenom:"",nom:"",email:"",company:"",category:"commercial" }); setShowAddContact(false); showToast("Contact ajouté !"); }}>Ajouter</BtnP>
                <BtnO onClick={() => setShowAddContact(false)}>Annuler</BtnO>
              </div>
            </Card>}
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
              {CATEGORIES.map(cat => <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{ padding: "5px 12px", fontFamily: N.font, fontSize: 11, fontWeight: 600, borderRadius: 14, border: `1px solid ${selectedCategory === cat.id ? cat.accent + "55" : N.border}`, background: selectedCategory === cat.id ? cat.color : "transparent", color: selectedCategory === cat.id ? cat.accent : N.textMuted, cursor: "pointer", transition: "all .2s" }}>{cat.icon} {cat.label} ({contacts.filter(c => c.category === cat.id).length})</button>)}
              {filteredContacts.length > 0 && <button onClick={selectAllByCategory} style={{ marginLeft: "auto", padding: "5px 12px", fontFamily: N.font, fontSize: 11, fontWeight: 600, borderRadius: 14, border: `1px solid ${N.accent}55`, background: N.accentLight, color: N.accent, cursor: "pointer" }}>{filteredContacts.every(c => selectedContacts.includes(c.id)) ? "Désélectionner tout" : `Tout sélectionner (${filteredContacts.length})`}</button>}
            </div>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 1.2fr 1fr 120px 70px", padding: "9px 14px", borderBottom: `1px solid ${N.border}`, fontSize: 10, color: N.textMuted, letterSpacing: 2.5, textTransform: "uppercase", fontWeight: 600 }}><span/><span>Nom</span><span>Email</span><span>Entreprise</span><span>Catégorie</span><span/></div>
              {filteredContacts.length === 0 ? <div style={{ padding: "30px", textAlign: "center", fontSize: 13, color: N.textMuted }}>Aucun contact dans cette catégorie</div> : filteredContacts.map(c => { const cat = CATEGORIES.find(cat => cat.id === c.category); return <div key={c.id} className="contact-row" onClick={() => toggleContact(c.id)} style={{ display: "grid", gridTemplateColumns: "40px 1fr 1.2fr 1fr 120px 70px", padding: "11px 14px", borderBottom: `1px solid ${N.border}`, alignItems: "center", background: selectedContacts.includes(c.id) ? "rgba(77,217,232,.06)" : "transparent", cursor: "pointer", transition: "background .15s" }}>
                <input type="checkbox" checked={selectedContacts.includes(c.id)} onChange={() => {}} style={{ width: 14, height: 14, accentColor: N.accent }} />
                <div style={{ fontWeight: 600, fontSize: 13 }}>{c.prenom} {c.nom}</div>
                <div style={{ fontSize: 12, color: N.textSecondary }}>{c.email}</div>
                <div style={{ fontSize: 12, color: N.textMuted }}>{c.company || "—"}</div>
                <div onClick={e => e.stopPropagation()}><Badge label={`${cat?.icon} ${cat?.label}`} color={cat?.accent} bg={cat?.color} /></div>
                <div style={{ textAlign: "right" }} onClick={e => e.stopPropagation()}><button className="del-btn" onClick={() => { setContacts(prev => prev.filter(cc => cc.id !== c.id)); setSelectedContacts(prev => prev.filter(i => i !== c.id)); }} style={{ background: N.errorBg, color: N.error, border: "none", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 11 }}>Suppr.</button></div>
              </div>; })}
            </Card>
            {selectedContacts.length > 0 && <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10 }}><span style={{ fontSize: 12, color: N.textMuted }}>{selectedContacts.length} sélectionné(s)</span><BtnP onClick={() => { setBulkMode(true); setScreen("compose"); }}>📨 Envoyer en masse →</BtnP></div>}
          </div>
        )}

        {/* TEMPLATES */}
        {screen === "templates" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Templates ({Object.keys(templates).length})</div>
              <BtnP onClick={() => { const key = `custom_${Date.now()}`; const newCat = { id: key, label: "Nouveau", icon: "📝", color: "rgba(77,217,232,.1)", accent: N.accent }; CATEGORIES.push(newCat); setTemplates(prev => ({ ...prev, [key]: { name: "Nouveau template", subject: "", body: "" } })); setEditingTemplate(key); showToast("Template créé !"); }}>+ Nouveau template</BtnP>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.keys(templates).map(key => { const cat = CATEGORIES.find(c => c.id === key); return <div key={key} onClick={() => { setSelectedCategory(key); setEditingTemplate(key); }} style={{ background: editingTemplate === key ? N.accentLight : N.bgCard, border: `1px solid ${editingTemplate === key ? N.accent + "44" : N.border}`, color: editingTemplate === key ? N.accent : N.textSecondary, borderRadius: 10, padding: "11px 14px", fontFamily: N.font, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 7, cursor: "pointer", transition: "all .2s" }}>{cat?.icon || "📝"} {templates[key].name}</div>; })}
              </div>
              {editingTemplate && templates[editingTemplate] && (
                <Card>
                  <Label>Éditer — {templates[editingTemplate].name}</Label>
                  {[["Nom du template","name"],["Objet (utilisez {{variable}})","subject"]].map(([lbl, key]) => <div key={key} style={{ marginBottom: 11 }}><div style={{ fontSize: 10, color: N.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>{lbl}</div><NInput value={templates[editingTemplate][key] || ""} onChange={e => setTemplates(prev => ({ ...prev, [editingTemplate]: { ...prev[editingTemplate], [key]: e.target.value } }))} /></div>)}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, color: N.textMuted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Corps — {'{{prenom}}'} {'{{company}}'} {'{{expediteur}}'}…</div>
                    <NTextarea value={templates[editingTemplate].body || ""} onChange={e => setTemplates(prev => ({ ...prev, [editingTemplate]: { ...prev[editingTemplate], body: e.target.value } }))} rows={12} />
                  </div>
                  <BtnP onClick={() => showToast("Template sauvegardé !")}>💾 Sauvegarder</BtnP>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* CALENDAR */}
        {screen === "calendar" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div><div style={{ fontSize: 20, fontWeight: 700 }}>Calendrier</div><div style={{ fontSize: 11, color: N.textMuted, marginTop: 2 }}>Disponibilités : Lun–Ven, 9h–18h</div></div>
            </div>
            {calendarEvents.length === 0
              ? <Card><div style={{ textAlign: "center", padding: "50px 20px" }}><div style={{ fontSize: 40, marginBottom: 12, opacity: .3 }}>📅</div><div style={{ fontSize: 13, color: N.textMuted }}>Aucun rendez-vous planifié</div></div></Card>
              : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {calendarEvents.map(evt => { const d = new Date(evt.date); return <Card key={evt.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <div style={{ background: N.accentLight, border: `1px solid ${N.accent}33`, borderRadius: 10, padding: "10px 14px", textAlign: "center", minWidth: 60 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: N.accent }}>{d.getDate()}</div>
                        <div style={{ fontSize: 10, color: N.textSecondary, textTransform: "uppercase" }}>{d.toLocaleDateString("fr-FR", { month: "short" })}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{evt.title}</div>
                        <div style={{ fontSize: 12, color: N.textSecondary }}>{evt.email} · {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
                        {evt.adjustedFromOriginal && <div style={{ fontSize: 11, color: N.warning, marginTop: 3 }}>⚡ Créneau ajusté automatiquement</div>}
                      </div>
                    </div>
                    <Badge label={d.toLocaleDateString("fr-FR", { weekday: "long" })} color={N.accent} bg={N.accentLight} />
                  </Card>; })}
                </div>
            }
          </div>
        )}

        {/* HISTORY */}
        {screen === "history" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Historique ({history.length})</div>
                {history.length === 0
                  ? <Card><div style={{ textAlign: "center", padding: "40px", fontSize: 13, color: N.textMuted }}>Aucun email envoyé</div></Card>
                  : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {history.map(h => { const cat = CATEGORIES.find(c => c.id === h.category); return <Card key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px" }}>
                        <div style={{ minWidth: 0, flex: 1, marginRight: 12 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{h.subject}</div>
                          <div style={{ fontSize: 11, color: N.textMuted }}>{h.toName ? `${h.toName} · ` : ""}{h.to} · {h.date} {h.sig && <span style={{ color: N.accent }}>· {h.sig}</span>}{h.bulk && <span style={{ background: N.accentLight, color: N.accent, borderRadius: 5, padding: "1px 6px", marginLeft: 6, fontSize: 10 }}>MASSE</span>}{h.isReply && <span style={{ background: N.purpleBg, color: N.purple, borderRadius: 5, padding: "1px 6px", marginLeft: 6, fontSize: 10 }}>RÉPONSE</span>}</div>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>{cat && <Badge label={`${cat.icon} ${cat.label}`} color={cat.accent} bg={cat.color} />}<Badge label={h.status === "Envoyé" ? "✓ Envoyé" : "⏸ Simulé"} color={h.status === "Envoyé" ? N.success : N.warning} bg={h.status === "Envoyé" ? N.successBg : N.warningBg} /></div>
                      </Card>; })}
                    </div>
                }
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Notifications ({notifications.length})</div>
                {notifications.length === 0
                  ? <Card><div style={{ textAlign: "center", padding: "30px", fontSize: 13, color: N.textMuted }}>Aucune notification</div></Card>
                  : <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {notifications.map(n => <Card key={n.id} style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span style={{ fontSize: 16 }}>{n.type === "success" ? "✅" : n.type === "reply" ? "↩️" : n.type === "calendar" ? "📅" : "🔔"}</span>
                          <div><div style={{ fontSize: 12, fontWeight: 500 }}>{n.msg}</div><div style={{ fontSize: 10, color: N.textMuted, marginTop: 3 }}>{n.date}</div></div>
                        </div>
                      </Card>)}
                    </div>
                }
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 36, paddingTop: 16, borderTop: `1px solid ${N.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {logoSrc ? <img src={logoSrc} alt="Nayro" style={{ height: 20, width: 20, borderRadius: 4, objectFit: "cover" }} /> : <div style={{ width: 20, height: 20, borderRadius: 4, background: N.accentLight, display: "flex", alignItems: "center", justifyContent: "center", color: N.accent, fontSize: 10, fontWeight: 800 }}>N</div>}
            <span style={{ fontSize: 11, color: N.textMuted }}>Nayro Email Agent · Powered by Claude AI</span>
          </div>
          <span style={{ fontSize: 11, color: N.textMuted }}>nayro.eu</span>
        </div>
      </div>
    </div>
  );
}
