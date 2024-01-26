"use client";
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
        className=" bottom-0 right-0 fixed m-8 bg-violet-200 border-violet-600 shadow-xl w-fit bg-opacity-40 backdrop-blur-sm p-4 border-2 cursor-pointer rounded-full hover:scale-110 transition-all text-white"
      >
        <img src="/bot.png" height={40} width={40} alt="" />
      </div>
      <div
        className={`bottom-0 right-0 fixed m-8 z-40 px-4 py-2 text-white bg-black cursor-pointer rounded-full ${
          isActive ? "block" : "hidden"
        }`}
        onClick={handleClick}
      >
        Close
      </div>
      {isActive && (
        <>
          <iframe
            className="bottom-0 right-0 fixed m-8 opacity-90 rounded-md backdrop-blur-md shadow-xl"
            width={320}
            height={560}
            src="https://nutrisnap-chat.vercel.app/"
          ></iframe>
        </>
      )}
    </div>
  );
};

export default Bot;
