// profile.js
"use client";
import React, { useState, useEffect } from "react";
import { auth, db } from "../utils/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Loader from "../components/Loader";
import gsap from "gsap";
import { data } from "autoprefixer";
   
const moment = require("moment");
const Profile = () => {
  const [imageData, setImageData] = useState([]);
  const [user, setUser] = useState(null);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein24Hours, setTotalProtein24Hours] = useState(0);
  const [totalCalories24Hours, setTotalCalories24Hours] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchImages(user.uid);
      } else {
        setUser(null);
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [imageData]);

  const calculateTotals = () => {
    let totalProtein = 0;
    let totalCalories = 0;
    let totalProtein24Hours = 0;
    let totalCalories24Hours = 0;

    const currentTime = new Date();

    imageData.forEach((item) => {
      totalProtein += parseInt(item.protein);
      totalCalories += parseInt(item.calories);

      // Convert timestamp to Date object
      const timestamp = new Date(item.timestamp.seconds * 1000);

      // Calculate the time difference in milliseconds
      const timeDifference = currentTime.getTime() - timestamp.getTime();
      const twentyFourHoursInMilliseconds = 24 * 60 * 60 * 1000;

      // Check if the timestamp is within the last 24 hours
      if (
        timeDifference <= twentyFourHoursInMilliseconds &&
        timeDifference >= 0
      ) {
        totalProtein24Hours += parseInt(item.protein);
        totalCalories24Hours += parseInt(item.calories);
      }
    });

    setTotalProtein(totalProtein);
    setTotalCalories(totalCalories);
    setTotalProtein24Hours(totalProtein24Hours);
    setTotalCalories24Hours(totalCalories24Hours);
  };

  const fetchImages = async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.unhashedfoodsnapUrls) {
          setImageData(data.unhashedfoodsnapUrls);
          console.log("Fetched images: ", data.unhashedfoodsnapUrls);
        }
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching images: ", error);
    }
  };
  useEffect(() => {
    gsap.set(".greenball", { xPercent: -50, yPercent: -50 });
    let targets = gsap.utils.toArray(".greenball");
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
  const renderTree = (data) => {
    return (
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 lg:px-24 md:px-10 px-4">
        {data
          .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds) // Sort by timestamp in descending order
          .map((item, index) => (
            <li key={index} className="rounded-lg overflow-hidden shadow-md">
              <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={item.imageUrl}
                  alt={`Image ${index + 1}`}
                  className="w-full h-auto md:h-80 object-cover"
                />
              </a>
              <div className="text-center py-1">
                <div className="mt-2 p-3 bg-gray-900 text-white  rounded-lg text-xs overflow-hidden">
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                      padding: "8px",
                      borderRadius: "8px",
                    }}
                  >
                    <code>
                      {`{ `}
                      <span style={{ color: "#ff79c6" }}>
                        "timestamp"
                      </span>:{" "}
                      <span style={{ color: "#f1fa8c" }}>
                        "${formatTimestamp(item.timestamp)}"
                      </span>
                      ,<span style={{ color: "#ff79c6" }}>"calories"</span>:{" "}
                      <span style={{ color: "#8be9fd" }}>{item.calories}</span>,
                      <span style={{ color: "#ff79c6" }}>"protein"</span>:{" "}
                      <span style={{ color: "#8be9fd" }}>{item.protein}</span>
                      {` }`}
                    </code>
                  </pre>
                </div>
              </div>
            </li>
          ))}
      </ul>
    );
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

  return (
    <div>
          
      <div className="greenball blur-3xl bg-violet-400/50 w-96 h-96 fixed top-0 left-0 rounded-full"></div>
      <h1 className="text-8xl moving font-bold filter drop-shadow-xl max-sm:text-4xl max-md:text-6xl flex justify-center items-center my-5">
        Food Calendar
      </h1>
      {user ? (
        <div>
          <div className="text-center font-bold  text-gray-600">
            <div>Total Intake in Last 24 Hours:</div>
            <div className="flex text-center font-bold justify-center items-center my-4 gap-4">
              <h2 className="text-lg px-4 py-2 bg-white rounded-full shadow-lg border border-purple-600 hover:scale-95 transition-all">
                {" "}
                Protein : {totalProtein24Hours} ❤️{" "}
              </h2>
              <h2 className="text-lg px-4 py-2 bg-white rounded-full shadow-lg border border-green-600 hover:scale-95 transition-all">
                {" "}
                Calorie : {totalCalories24Hours} 🔥{" "}
              </h2>
            </div>
          </div>
          <ul>{renderTree(imageData)}</ul>
          <h2 className="text-2xl flex justify-center items-center my-5">
            Keep it up Champ
          </h2>

          <div className="text-center font-bold text-gray-600">
            <div>Total Intake in forever:</div>
            <div className="flex text-center justify-center items-center gap-4 mt-4">
              <h2 className="text-lg px-4 py-2 bg-white rounded-full shadow-lg border border-purple-600 hover:scale-95 transition-all">
                {" "}
                Protein : {totalProtein}
              </h2>
              <h2 className="text-lg px-4 py-2 bg-white rounded-full shadow-lg border border-green-600 hover:scale-95 transition-all">
                {" "}
                Calorie : {totalCalories}
              </h2>
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
                <a href="/foodcalender">
                  <img
                    src="/body.png"
                    alt=""
                    height={30}
                    width={30}
                    className={` mx-auto opacity-100 active:opacity-100`}
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
                  <div className="text-xs text-center">Scoreboard</div>
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default Profile;
