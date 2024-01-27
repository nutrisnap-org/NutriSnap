"use client";
import { useState } from "react";
import "./Header.css";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { useRouter, useEffect } from "next/navigation";
import { motion } from "framer-motion";

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
  const [user, setUser] = useState(true);
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
        router.push("/");
        setUser(!user); // Remove user data from session storage
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
          {user ? (
            <button onClick={handleLogout}>
              <img src="/exit.png" height={30} width={30} alt="" />
            </button>
          ) : (
            ""
          )}
        </div>
        <ul className="list-none gap-12 my-4 md:mx-12 text-md text-gray-800 md:flex items-center justify-between">
          {/* <li>
            <a href="/login">Login</a>
          </li> */}
          {!user ? (
            <li>
              <a
                href="/login"
                className=" rounded-full px-4 py-2 -ml-4 text-gray-100 bg-black hover:bg-white hover:text-black transition duration-300 ease-in-out"
              >
                Login
              </a>
            </li>
          ) : (
            <>
              <li>
                <a
                  href="/foodsnap"
                  className="max-md:hidden rounded-full px-2 py-2 -ml-4 text-black hover:bg-gray-300 transition duration-300 ease-in-out"
                >
                  Food
                </a>
              </li>
              <li>
                <a
                  href="/bodysnap"
                  className="max-md:hidden rounded-full px-2 py-2 -ml-4 text-black hover:bg-gray-300 transition duration-300 ease-in-out"
                >
                  Body
                </a>
              </li>
              <li>
                <a
                  href="/skinsnap"
                  className="max-md:hidden rounded-full px-2 py-2 -ml-4 text-black hover:bg-gray-300 transition duration-300 ease-in-out"
                >
                  Skin
                </a>
              </li>
              <li>
                <a
                  href="/nutricon"
                  className="max-md:hidden rounded-full px-2 py-2 -ml-4 text-black hover:bg-gray-300 transition duration-300 ease-in-out"
                >
                  NutriCon
                </a>
              </li>
            </>
          )}
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
