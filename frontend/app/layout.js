import "./globals.css";

export const metadata = {
  title: "AI Blogger Pro | Multi-Agent Content Engine",
  description: "Autonomous SEO blog generator powered by a 4-agent AI pipeline: Research, Planning, Writing, and SEO optimization.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#090d16] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
