'use client'
import { DM_Sans } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";
import Bot from "./components/Bot/Bot.js";
import Header from "./components/Header/Header";
import { useEffect, useState } from "react";
import Footer from "./components/Footer/Footer";
const inter = DM_Sans({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const [isInstagramInAppBrowser, setIsInstagramInAppBrowser] = useState(false);

  useEffect(() => {
    // Check if navigator is available and user agent contains "Instagram"
    if (typeof navigator !== "undefined" && navigator.userAgent.includes("Instagram")) {
      setIsInstagramInAppBrowser(true);
    }
  }, []);
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Render everything if user is not in Instagram in-app browser */}
        {!isInstagramInAppBrowser && (
          <>
            <Header />
            {children}
            <SpeedInsights />
            <Bot />
            <Footer />
          </>
        )}
        {/* Render the "Open in browser" button if user is in Instagram in-app browser */}
        {isInstagramInAppBrowser && (
          <div className="mt-4 text-center">
            <a href={location.href} target="_blank" download>
              Open in browser
            </a>
          </div>
        )}
      </body>
    </html>
  );
}
