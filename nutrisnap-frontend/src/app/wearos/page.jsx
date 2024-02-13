"use client";
import { Analytics } from '@vercel/analytics/react';
import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";
import Plots from "./plots";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";


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

const CsvUploader = () => {
  const router = useRouter();
  const [csvUrls, setCsvUrls] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [user, setUser] = useState(null);
  const [showPlots, setShowPlots] = useState(false);

  useEffect(() => {
    const userFromSession = sessionStorage.getItem("user");
    if (userFromSession) {
      setUser(JSON.parse(userFromSession));
    }
  }, []);

  const uploadCsv = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "lodrnpjl");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dmdhep1qp/raw/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      const newCsvUrl = data.secure_url;
      setCsvUrls([...csvUrls, newCsvUrl]);
      updateUserDataWithCsvUrl(newCsvUrl);
    } catch (err) {
      console.error("Error uploading CSV: ", err);
    }
  };

  const updateUserDataWithCsvUrl = async (csvUrl) => {
    try {
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          CsvUrls: arrayUnion(csvUrl),
        });
        fetchAnalysisData(csvUrl);
      } else {
        console.error("User not found in session storage");
      }
    } catch (error) {
      console.error("Error updating CSV URL: ", error);
    }
  };

  const fetchAnalysisData = async (csvUrl) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/get-csv-from-url?url=${csvUrl}`
      );
      const data = await response.json();
      setAnalysisResults([...analysisResults, data]);
    } catch (error) {
      console.error("Error fetching analysis data: ", error);
    }
  };

  const handleAnalyse = () => {
    setShowPlots(true);
  };
  useEffect(() => {
    gsap.set(".redball", { xPercent: -50, yPercent: -50 });
    let targets = gsap.utils.toArray(".redball");
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
      <div className="redball blur-3xl bg-green-400/50 w-96 h-96 fixed top-0 left-0 rounded-full"></div>

      <div className="mx-auto text-center text-7xl max-sm:text-5xl max-md:text-6xl font-bold mt-10">
        Ready to Analyze your <span className="redtext">"Fit Streaks"</span> ?
      </div>
      <p className="text-sm max-sm:text-xs text-gray-600 mt-4 mx-auto text-center">
        Upload your CSV file and let our AI do the magic
      </p>
      <div className="flex max-md:flex-col mx-auto justify-center mt-8 px-24 max-sm:px-4">
        <div className="w-full">
          <div className="w-fit max-md:w-11/12 p-8 max-sm:p-2 bg-green-100 border border-green-300 rounded-md h-fit max-h-min mx-auto mt-8 mb-8 flex-col items-center justify-center">
            <div className=" flex-col items-center justify-center"></div>
            <input
              type="file"
              id="file"
              accept=".csv"
              onChange={uploadCsv}
              className="sr-only"
            />
            <label
              htmlFor="file"
              className="items-center cursor-pointer border border-gray-800 text-black px-4 py-2 rounded-md hover:bg-black hover:text-white transition duration-300 ease-in-out block mx-auto"
            >
              Upload CSV
            </label>
            {csvUrls.length > 0 &&
              csvUrls.map((url, index) => (
                <div key={index} className="mt-4">
                  <p>{url}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleAnalyse}
          className="items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-800 transition duration-300 ease-in-out"
        >
          Analyze
        </button>
      </div>

      {showPlots && (
        <div className="flex justify-center">
          <div className="w-1/2 mx-2">
            <Plots analysisResults={analysisResults[3]} />
          </div>
        </div>
      )}
    </>
  );
};

export default CsvUploader;
