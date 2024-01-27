'use client'
import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";
import Plots from "./plots";

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
  const [csvUrls, setCsvUrls] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [user, setUser] = useState(null);
  const [showPlots, setShowPlots] = useState(false);

  useEffect(() => {
    const userFromSession = sessionStorage.getItem('user');
    if (userFromSession) {
      setUser(JSON.parse(userFromSession));
    }
  }, []);

  const uploadCsv = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'lodrnpjl');

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dmdhep1qp/raw/upload',
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();
      const newCsvUrl = data.secure_url;
      setCsvUrls([...csvUrls, newCsvUrl]);
      updateUserDataWithCsvUrl(newCsvUrl);
    } catch (err) {
      console.error('Error uploading CSV: ', err);
    }
  };

  const updateUserDataWithCsvUrl = async (csvUrl) => {
    try {
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          CsvUrls: arrayUnion(csvUrl),
        });
        fetchAnalysisData(csvUrl);
      } else {
        console.error('User not found in session storage');
      }
    } catch (error) {
      console.error('Error updating CSV URL: ', error);
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

  return (
    <div className="container mx-auto mt-10">
      <div className="text-center text-2xl font-bold mb-4">
        Ready to Analyze your CSV Data?
      </div>
      <input
        type="file"
        id="file"
        accept=".csv"
        onChange={uploadCsv}
        className="sr-only"
      />
      <label
        htmlFor="file"
        className="cursor-pointer border px-4 py-2 rounded-md border-gray-800 hover:bg-black hover:text-white transition duration-300 ease-in-out"
      >
        Upload CSV
      </label>
      {csvUrls.length > 0 &&
        csvUrls.map((url, index) => (
          <div key={index} className="mt-4">
            <p>{url}</p>
          </div>
        ))}
     {analysisResults.length > 0 && (
  <div className="mt-8">
    <button
      onClick={handleAnalyse}
      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out"
    >
      Analyze
    </button>
  </div>
)}

{analysisResults.length > 0 && (
  <div>
    {analysisResults.map((result, index) => (
      <div key={index} className="mt-4">
        {/* Render each analysis result here */}
        {/* Example: */}
        <p>Analysis Result {index + 1}:</p>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
    ))}
  </div>
)}

{showPlots && <Plots analysisResults={analysisResults} />}


      {showPlots && <Plots analysisResults={analysisResults} />}
    </div>
  );
};

export default CsvUploader;
