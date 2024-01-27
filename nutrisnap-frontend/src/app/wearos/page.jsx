"use client";
import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { Image } from "cloudinary-react";
import { useRouter } from "next/navigation";
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";
// import React from 'react';
import Plot from './plots'; 

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
    const router = useRouter();
    const [user, setUser] = useState(null);
  
    useEffect(() => {
      // Retrieve user from session storage
      const userFromSession = sessionStorage.getItem('user');
      if (userFromSession) {
        setUser(JSON.parse(userFromSession));
      } else {
        router.push('/login');
      }
    }, []);
  
    const uploadCsv = async (e) => {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'lodrnpjl'); // Replace with your Cloudinary upload preset
  
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
  
        // Update state with new CSV URL
        setCsvUrls([...csvUrls, newCsvUrl]);
  
        // Update Firestore document with CSV URL
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
          console.log('CSV URL successfully updated in Firestore!');
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
        console.log(data);
  
        // Parse the result string into a JSON object
        // const parsedResult = JSON.parse(data.result);
  
        // Update analysisResults state with the parsed result
        setAnalysisResults([...analysisResults, data]);
        console.log(analysisResults);
      } catch (error) {
        console.error("Error fetching analysis data: ", error);
      }
    };
  
    return (
      <>
        <div className="">
          <div className=" mx-auto text-center text-7xl max-sm:text-5xl max-md:text-6xl font-bold mt-10">
            Ready to Analyse your <span className="text-grad">"CSV Data"</span> ?
          </div>
          <p className="text-sm max-sm:text-xs text-gray-600 mt-4 mx-auto text-center">
            Upload a CSV file to analyze your data using our AI
          </p>
          <div className="flex max-md:flex-col mx-auto justify-center mt-8 px-24 max-sm:px-4">
            <div className="w-full">
              <div className="w-fit max-md:w-11/12 p-8 max-sm:p-2 bg-violet-100 rounded-md h-fit max-h-min mx-auto mt-8 mb-8 flex-col items-center justify-center">
                <div className=" flex-col items-center justify-center">
                  <input
                    type="file"
                    id="file"
                    accept=".csv"
                    onChange={uploadCsv}
                    className="sr-only mx-auto"
                  />
                  <label
                    htmlFor="file"
                    className="items-center max-sm:text-sm cursor-pointer border max-sm:px-2 px-4 py-2 mx-auto text-center h-fit rounded-md border-gray-800 hover:bg-black hover:text-white transition duration-300 ease-in-out"
                  >
                    Upload CSV
                  </label>
                  {csvUrls.length > 0 && (
                    <div>
                      {csvUrls.map((url, index) => (
                        <div key={index} className="m-8">
                          {/* Display uploaded CSV URLs */}
                          <p>{url}</p>
                        </div>
                       
                      ))}
                    </div>
                    
                  )}
                 
                </div>
              </div>
            </div>
            <div>
            <div>
  {/* Display analysis results */}
  {/* Display analysis results */}
{/* Display analysis results */}
{analysisResults.map((result, index) => {
  // Convert the result to string
  const resultString = JSON.stringify(result);

  // Trim the leading and trailing characters and remove the newline characters
  const cleanedResult = resultString.slice(8, -1).trim();
  const Result=cleanedResult +']';
  console.log('Result:', Result);
  const jsonArray = JSON.parse(Result);

  
  

  
  return (
    <div key={index} className="m-8">
      <p>Analysis Result {index + 1}:</p>
      <pre style={{ whiteSpace: "wrap", overflowX: "auto" }}>{ Result }</pre>
      
      {/* <Plot result={Result} /> */}
    </div> 
    
  );
})}


</div>

            </div>
          </div>
        </div>
      </>
    );
  };
 
  export default CsvUploader;