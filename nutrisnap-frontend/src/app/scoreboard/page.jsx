"use client";
import { Analytics } from '@vercel/analytics/react';
import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import gsap from "gsap";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";

const UserRankingPage = () => {
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
  const db = getFirestore(app);

  const [userList, setUserList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersQuery = query(usersCollection, orderBy("xp", "desc"));
        const querySnapshot = await getDocs(usersQuery);

        const users = [];
        querySnapshot.forEach((doc) => {
          users.push({
            id: doc.id,
            name: doc.data().displayName, // Assuming displayName field exists
            xp: doc.data().xp, // Assuming xp field exists
          });
        });
        setUserList(users);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();

    // Clean up function
    return () => {
      // Detach Firebase listeners if any
    };
  }, [db]);

  const handleSearch = () => {
    const result = userList.find(
      (user) => user.name.toLowerCase() === searchTerm.toLowerCase()
    );
    setSearchResult(result);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Filter suggestions based on input value
    const suggestions = userList.filter((user) =>
      user.name.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(suggestions);
  };

  const handleSuggestionClick = (name) => {
    setSearchTerm(name);
    setSuggestions([]); // Clear suggestions
  };
  useEffect(() => {
    gsap.set(".blueball", { xPercent: -50, yPercent: -50 });
    let targets = gsap.utils.toArray(".blueball");
    window.addEventListener("mouseleave", (e) => {
      gsap.to(targets, {
        duration: 0.5,
        scale: 0,
        ease: "power1.out",
        overwrite: "auto",
        stagger: 0.02,
      });
    });
    window.addEventListener("mouseenter", (e) => {
      gsap.to(targets, {
        duration: 0.5,
        scale: 1,
        ease: "power1.out",
        overwrite: "auto",
        stagger: 0.02,
      });
    });
    window.addEventListener("mousemove", (e) => {
      gsap.to(targets, {
        duration: 0.5,
        x: e.clientX,
        y: e.clientY,
        ease: "power1.out",
        overwrite: "auto",
        stagger: 0.02,
      });
    });
  }, []);
  return (
    <>
    <Analytics />
      <div className="blueball blur-3xl bg-cyan-400/20 w-96  h-96 fixed top-0 left-0 rounded-full"></div>

      <div className="mt-2 lg:px-36">
        <h1 className="text-7xl max-sm:text-5xl nutricon font-bold mx-auto text-center mb-2 leading-tight ">
          User Ranking
        </h1>
        <p className="text-center max-sm:text-sm text-md my-2">
          Find out where you stand in the NutriSnap community.
        </p>
        <div className=" flex-col items-center justify-center">
          <div className="flex items-center mx-auto justify-center">
            <input
              type="text"
              placeholder="Search your name"
              value={searchTerm}
              onChange={handleInputChange}
              className="search_input m-2"
            />
            <button onClick={handleSearch}>
              <img src="/search.png" alt="" className="w-6 h-6 opacity-45" />
            </button>
            {/* Suggestions */}
            {searchTerm.length > 0 && suggestions.length > 0 && (
              <ul className="bg-white bg-opacity-65 backdrop-blur-md mt-72 shadow-xl mx-auto rounded-md border p-4 w-4/12 max-md:w-6/12 max-sm:w-9/12 h-52 absolute items-center justify-center overflow-hidden overflow-y-scroll">
                {suggestions.map((user, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(user.name)}
                    className="cursor-pointer hover:bg-white hover:shadow-md p-2 rounded-md"
                  >
                    {user.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {loading ? (
          <p className="text-center">Crunching Latest data for you...</p>
        ) : searchResult ? (
          <p className="font-semibold text-3xl text-center m-4">
            {searchTerm}{" "}
            <div className="flex mx-auto items-center justify-center">
              <div className="text-2xl font-medium py-2 px-3 m-2 border-green-500 bg-green-50 rounded-md border shadow-md w-fit">
                Rank:{" "}
                {userList.findIndex((user) => user.id === searchResult.id) + 1}
              </div>
              <div className="text-2xl font-medium py-2 px-3 m-2 border-green-500 bg-green-50 rounded-md border shadow-md w-fit">
                XP: {searchResult.xp}
              </div>
            </div>
          </p>
        ) : null}
        <div className="p-8 m-6 max-sm:m-1 max-sm:p-4">
          <h2 className="mt-2 foodsnap text-xl text-gray-700">
            Overall Ranking
          </h2>
          <div className="border shadow-sm rounded-md p-4 bg-white mt-2">
            <table className="border-collapse w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 py-2 px-4">Rank</th>
                  <th className="border border-gray-300 py-2 px-4">Username</th>
                  <th className="border border-gray-300 py-2 px-4">XP</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((user, index) => (
                  <tr
                    key={user.id}
                    className={
                      index === 2
                        ? "bg-orange-900/10"
                        : index === 1
                        ? "bg-gray-200"
                        : index === 0
                        ? "bg-yellow-100"
                        : "bg-white"
                    }
                  >
                    <td className="border border-gray-300 py-2 px-4">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 py-2 px-4">
                      {user.name}
                    </td>
                    <td className="border border-gray-300 py-2 px-4">
                      {user.xp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
                className={` mx-auto opacity-100`}
              />
              <div className="text-xs text-center">Scoreboard</div>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserRankingPage;
