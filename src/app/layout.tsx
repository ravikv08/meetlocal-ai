import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { BottomNav } from "@/components/BottomNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "meetlocal.ai · Every city has a friend you haven't met",
  description:
    "Open meetlocal.ai when you land. Within hours, you're with a vetted local who knows the spots, the shortcuts, and the stories.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body>
        {children}
        <BottomNav
          isAuthed={!!session?.user}
          isAdmin={session?.user?.isAdmin ?? false}
        />
      </body>
    </html>
  );
}
