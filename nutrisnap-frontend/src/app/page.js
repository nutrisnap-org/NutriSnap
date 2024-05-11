"use client"
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import { useRouter } from "next/navigation";
import { useEffect , useState } from "react";
import Footer from "./components/Footer/Footer";
export default function Home() {
  const [isInstagramInAppBrowser, setIsInstagramInAppBrowser] = useState(false);

  useEffect(() => {
    // Check if navigator is available (i.e., if code is running in the browser)
    if (typeof navigator !== "undefined") {
      setIsInstagramInAppBrowser(navigator.userAgent.includes("Instagram"));
    }
  }, []);
  return (
    <>
    <main className="flex flex-col items-center justify-between px-4">
      <Hero />
      
    </main>
    <div className="bottom-navigation bottom-0 fixed w-full p-4 md:hidden bg-gradient-to-b from-white to-transparent backdrop-blur-md shadow-2xl h-fit">
        <div className="flex items-center justify-around md:hidden">
          <div className="flex flex-col items-center">
            <a href="/foodsnap">
              <img
                src="/food.png"
                alt=""
                height={30}
                width={30}
                className={` mx-auto opacity-40`}
              />
              <div className="text-xs text-center">Food</div>
            </a>
          </div>
          <div className="flex flex-col items-center">
            <a href="/skinsnap">
              <img
                src="/face.png"
                alt=""
                height={30}
                width={30}
                className={` mx-auto opacity-40 hover:opacity-100`}
              />
              <div className="text-xs text-center">Skin</div>
            </a>
          </div>
          <div className="flex flex-col items-center">
            <a href="/bodysnap">
              <img
                src="/body.png"
                alt=""
                height={30}
                width={30}
                className={` mx-auto opacity-40 active:opacity-100`}
              />
              <div className="text-xs text-center">Body</div>
            </a>
          </div>

          <div className="flex flex-col items-center">
            <a href="/scoreboard">
              <img
                src="/nutricon.png"
                alt=""
                height={30}
                width={30}
                className={` mx-auto opacity-40`}
              />
              <div className="text-xs text-center">Score Board</div>
            </a>
          </div>
        </div>
      </div>
        {isInstagramInAppBrowser && (
        <div className="mt-4 text-center">
          <a href={location.href} target="_blank" download>
            Open in browser
          </a>
        </div>
      )}
    </>
  );
}
