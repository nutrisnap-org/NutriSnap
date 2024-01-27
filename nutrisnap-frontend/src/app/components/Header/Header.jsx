"use client";
import { useState } from "react";
import "./Header.css";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { useRouter, useEffect } from "next/navigation";


const firebaseConfig = {
  apiKey: "AIzaSyAbn4iCEy5W9rSO-UiOmd_8Vbp9nRlkRCI",

  authDomain: "nutrisnap-e6cf9.firebaseapp.com",

  projectId: "nutrisnap-e6cf9",

  storageBucket: "nutrisnap-e6cf9.appspot.com",

  messagingSenderId: "169090435206",

  appId: "1:169090435206:web:45f0d96b834969ca236907",

  measurementId: "G-VHL1DB60YR",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const Header = () => {
  const [isActive, setIsActive] = useState(false);

  const router = useRouter();
  function toggleActive() {
    setIsActive(!isActive);
  }

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        // setUser(null);
        sessionStorage.removeItem("user");
        router.push('/'); // Remove user data from session storage
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };
  return (
    <>
      <div
        className={`text-gray-950 w-full p-4 md:p-6 flex justify-between items-center max-md:mt-4 `}
      >
        <div className="flex md:mx-12 items-center gap-2">
          <a href="/" className="flex">
            <img
              src="/logo.png"
              alt=""
              height={30}
              width={30}
              className="mr-4"
            />
            <h1 className="md:block font-bold text-xl">Nutrisnap</h1>
          </a>
          <button onClick={handleLogout}>logout</button>
        </div>
        <ul className="hidden list-none gap-12 my-4 md:mx-12 text-md text-gray-800 md:flex items-center justify-between">
          {/* <li>
            <a href="/login">Login</a>
          </li> */}
          <li>
            <a
              href="/login"
              className=" rounded-full px-4 py-2 -ml-4 text-gray-100 bg-black hover:bg-white hover:text-black transition duration-300 ease-in-out"
            >
             Login
            </a>
          </li>
        </ul>
        <div
          className={`menu-btn-1 md:hidden mx-6 z-20 ${
            isActive ? "active" : ""
          } ${router.pathname === "/" ? "block" : "hidden"}`}
          onClick={toggleActive}
        >
          <span></span>
        </div>
      </div>
      {isActive && <HamBurger />}

      <div className="bottom-navigation bottom-0 fixed w-full p-4 sm:hidden bg-white shadow-2xl h-fit">
        <div className="flex items-center justify-around sm:hidden">
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
            <a href="/">
              <img
                src="/nutricon.png"
                alt=""
                height={30}
                width={30}
                className={` mx-auto opacity-40`}
              />
              <div className="text-xs text-center">Nutricon</div>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
export default Header;

const HamBurger = () => {
  return (
    <>
      <div className="absolute mt-2 rounded-lg border border-gray-50/20 z-10 bg-gray-50 drop-shadow-2xl backdrop-filter backdrop-blur-[6px] w-[96%] p-2">
        <ul className="list-none gap-12 my-4 text-xs flex flex-col items-center justify-between">
          <li>
            <a href="#">Home</a>
          </li>
          <li>
            <a href="#">login</a>
          </li>
          <li>
            <a href="#">Register</a>
          </li>
        </ul>
      </div>
    </>
  );
};
