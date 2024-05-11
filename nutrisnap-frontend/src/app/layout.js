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
  const [isIPhone, setIsIPhone] = useState(false);

  useEffect(() => {
    // Check if navigator is available
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent || navigator.vendor;
      // Check if user agent contains "Instagram"
      setIsInstagramInAppBrowser(ua.indexOf('Instagram') > -1);
      // Check if user agent contains "iPhone"
      setIsIPhone(/iPad|iPhone|iPod/.test(ua));
    }
  }, []);

  return (
    <html lang="en">
      <body>
        {/* Render the "Open in browser" button if user is in Instagram in-app browser on Android */}
        {!isIPhone && isInstagramInAppBrowser && (
          <div className="mt-4 text-center">
            <a href={location.href} target="_blank" download>
              Open in browser (Android)
            </a>
          </div>
        )}
        {/* Render the special button for iPhone users on Instagram */}
        {isIPhone && isInstagramInAppBrowser && (
          <div className="mt-4 text-center">
            <button onClick={() => {
              // Handle the action for iPhone users on Instagram
              if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                window.location.href = 'googlechrome://nutrisnap.tech';
              } else {
                window.location.href = 'intent:https://nutrisnap.tech#Intent;end';
              }
            }}>
              Special Button for iPhone Users on Instagram
            </button>
          </div>
        )}
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
      </body>
    </html>
  );
}
