"use client";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import GmailAgent from "../components/GmailAgent";

function LoginScreen() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A1515", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#0F1C1C", border: "1px solid #1A2E2E", borderRadius: 20, padding: "48px 40px", textAlign: "center", maxWidth: 420, width: "90%" }}>
        <img src="https://nayro.eu/images/logo.svg" alt="Nayro" style={{ height: 48, marginBottom: 24 }} onError={e => e.target.style.display = "none"} />
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 3, color: "#E8F8F8", marginBottom: 8 }}>NAYRO</div>
        <div style={{ fontSize: 14, color: "#7AA8A8", marginBottom: 32 }}>Email Agent IA</div>
        <button
          onClick={() => signIn("google")}
          style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#4DD9E8,#2ABFCE)", color: "#0A1515", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif", boxShadow: "0 4px 22px rgba(77,217,232,.25)" }}
        >
          Connexion avec Google
        </button>
        <div style={{ marginTop: 16, fontSize: 11, color: "#3D6060", lineHeight: 1.6 }}>
          Accès requis : Gmail + Google Calendar<br />Vos données restent sur votre compte Google.
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { data: session, status } = useSession();
  if (status === "loading") return <div style={{ minHeight: "100vh", background: "#0A1515", display: "flex", alignItems: "center", justifyContent: "center", color: "#4DD9E8" }}>Chargement…</div>;
  if (!session) return <LoginScreen />;
  return <GmailAgent session={session} onSignOut={() => signOut()} />;
}

export default function Page() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}
