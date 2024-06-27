"use client";
import React, { useState } from "react";
import Profile from "./profile";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ProfileContext } from "../../context/profileContext";
import { useContext } from "react";
   
import { EmailContext } from "../../context/emailContext";
const Home = () => {
  const { darkbg, setDarkbg } = useContext(ProfileContext);
  const { email, setEmail } = useContext(EmailContext);

  const path = usePathname();
  const slugId = "id";
  useEffect(() => {
    if (path.includes("/profile/")) {
      setDarkbg(true);
    } else {
      setDarkbg(false);
    }
  });

  return (
    <div className="">
          
      <Profile />
      <div
        className={`bottom-navigation bottom-0 fixed w-full p-4 md:hidden bg-gradient-to-b ${
          darkbg
            ? "from-black to-transparent text-white"
            : "from-white to-transparent"
        }  backdrop-blur-md shadow-2xl h-fit`}
      >
        <div className="flex items-center justify-around md:hidden">
          <div className="flex flex-col items-center">
            <a href="/foodsnap">
              <img
                src="/food.png"
                alt=""
                height={30}
                width={30}
                className={` mx-auto opacity-40 hover:opacity-100`}
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
                className={` mx-auto opacity-40 hover:opacity-100`}
              />
              <div className="text-xs text-center">Scoreboard</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
