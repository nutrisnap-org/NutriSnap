'use client'
import { DM_Sans, Didact_Gothic } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";
import Bot from "./components/Bot/Bot.js";
import Header from "./components/Header/Header";
import { useEffect, useState } from "react";
import Footer from "./components/Footer/Footer";
const inter = DM_Sans({ subsets: ["latin"] });
import { ProfileProvider } from "./context/profileContext";
import GoogleAdsense from './Google'
import { EmailProvider } from "./context/emailContext";
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

  useEffect(() => {

if(isInstagramInAppBrowser){
    const redirectToBrowser = () => {
      const url = 'https://nutrisnap.tech'; // Replace with your URL
      const browsers = [
        'googlechrome://nutrisnap.tech',
        'firefox://open-url?url=nutrisnap.tech',
        'brave://open-url?url=nutrisnap.tech',
      ];

      // Try opening the URL in different browsers
      for (let browser of browsers) {
        try {
          // Open the URL in the current browser
          window.location.href = browser 
          // If successful, break out of the loop
          break;
        } catch (error) {
          // If opening in the current browser fails, try the next one
          continue;
        }
      }

    };

    // Redirect users
    redirectToBrowser();
  }
  }, [isInstagramInAppBrowser]);

useEffect(() => {
  // Automatically trigger click event on <a> tag with download attribute
  if (!isIPhone && isInstagramInAppBrowser) {
    const link = document.querySelector('a[href="' + location.href + '"][download]');
    if (link) {
      link.click();
    }
  }
}, [isInstagramInAppBrowser]);


  
  const handleCopyToClipboard = async () => {
    const url = 'https://nutrisnap.tech'; // Replace with your URL
    try {
      await navigator.clipboard.writeText(url);
      alert('URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy URL: ', error);
      alert('Failed to copy URL. Please copy manually.');
    }
  };

  
  return (
    <html lang="en">
      <body>
    　<GoogleAdsense  />

      {!isInstagramInAppBrowser && (
          <>
          <EmailProvider>
          <ProfileProvider>
            <Header />
            {children}
            <SpeedInsights />
            <Bot />
            <Footer />
            </ProfileProvider>
            </EmailProvider>
          </>
        )}


        {/* Render the "Open in browser" button if user is in Instagram in-app browser on Android */}
        {!isIPhone && isInstagramInAppBrowser && (
          <div className="mt-4 text-center">
            <a href={location.href} target="_blank" download>
            Click to Open in browser 
            </a>
          </div>
        )}

 {/* Render separate button to open Safari directly */}
 {isIPhone && isInstagramInAppBrowser  && (
          <div className="mt-4 text-center">
            <p>
            Hi, copy this URL and paste it into your favorite browser: <br />
            <strong>nutrisnap.tech</strong>
          </p>
          {/* Render the copy button */}
          <button onClick={handleCopyToClipboard}>Copy URL</button>
          {/* Render loading message */}
          <p>(IOS user with no Chrome)</p>
          </div>
        )}

       
        {/* Render everything if user is not in Instagram in-app browser */}
       
      </body>
    </html>
  );
}
