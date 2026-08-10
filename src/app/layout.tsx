import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepoArena — Compare GitHub Repositories",
  description: "Compare GitHub repositories using engineering metrics, not just stars.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
