
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import { useRouter } from "next/navigation";



import Footer from "./components/Footer/Footer";
export const metadata = {  
  manifest: "/manifest.json", 
  title: "Nutrisnap",
  description:
    "Think of Fitness Think of Us Creation By Prathik Shetty, Rahul Singh , Rishabh Pandey",
  image: "/logo.png",
  url: "https://nutrisnap.vercel.app/",
  type: "website",
  siteName: "Nutrisnap",
};

export default function Home() {
 
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
            <a href="/foodcalender">
              <img
                src="/body.png"
                alt=""
                height={30}
                width={30}
                className={` mx-auto opacity-40 active:opacity-100`}
              />
              <div className="text-xs text-center">Track</div>
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
        
    </>
  );
}
