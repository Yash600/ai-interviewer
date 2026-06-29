import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InterviewAI — Practice with a Real AI Interviewer",
  description: "A fully adaptive voice AI interviewer that listens, pushes back, and adapts in real time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0d0d1a] text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
