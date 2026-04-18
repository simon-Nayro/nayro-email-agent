import "./globals.css";

export const metadata = {
  title: "Nayro Email Agent",
  description: "Agent IA pour la gestion des emails Nayro",
  icons: { icon: "https://nayro.eu/images/logo.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
