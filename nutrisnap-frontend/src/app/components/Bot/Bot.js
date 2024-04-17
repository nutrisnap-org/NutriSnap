"use client";
import { Analytics } from '@vercel/analytics/react';
import React from "react";
import { useState } from "react";
const Bot = () => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
  };
  return (
    <div>
      <div
        onClick={handleClick}
        className=" bottom-20 right-0 fixed m-8 bg-violet-50 border-violet-600 shadow-xl w-fit bg-opacity-80 backdrop-blur-sm p-4 border-2 cursor-pointer rounded-full hover:scale-110 transition-all text-white"
      >
        <Analytics />
        <img src="/bot.png" height={40} width={40} alt="" />
      </div>
      <div
        className={`bottom-[31rem] max-sm:bottom-[30rem] right-1 fixed m-8 z-40 p-4 cursor-pointer rounded-full ${
          isActive ? "block" : "hidden"
        }`}
        onClick={handleClick}
      >
        <img src="/close.png" alt="" />
      </div>
      {isActive && (
        <>
          <iframe
            className="bottom-0 max-sm:w-11/12 max-sm:m-2 right-0 fixed m-8 rounded-md backdrop-blur-md shadow-xl border border-violet-600/30"
            width={450}
            height={560}
            src="https://nutrisnap-chat.vercel.app/"
          ></iframe>
        </>
      )}
    </div>
  );
};

export default Bot;
