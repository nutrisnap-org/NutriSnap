"use client";
import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { Image } from "cloudinary-react";
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";

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

const ImageUploader = () => {
  const [imageUrls, setImageUrls] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  

  const [user, setUser] = useState(null);

  useEffect(() => {
    // Retrieve user from session storage
    const userFromSession = sessionStorage.getItem("user");
    if (userFromSession) {
      setUser(JSON.parse(userFromSession));
    }
  }, []);

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "lodrnpjl"); // Replace with your Cloudinary upload preset

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dmdhep1qp/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      const newImageUrl = data.secure_url;

      // Update state with new image URL
      setImageUrls([...imageUrls, newImageUrl]);

      // Update Firestore document with image URL
      updateUserDataWithImageUrl(newImageUrl);
    } catch (err) {
      console.error("Error uploading image: ", err);
    }
  };

  const updateUserDataWithImageUrl = async (imageUrl) => {
    try {
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          SkinsnapUrls: arrayUnion(imageUrl),
        });
        console.log("Image URL successfully updated in Firestore!");
        fetchAnalysisData(imageUrl);
      } else {
        console.error("User not found in session storage");
      }
    } catch (error) {
      console.error("Error updating image URL: ", error);
    }
  };

  const fetchAnalysisData = async (imageUrl) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/skin-analyse?img_url=${imageUrl}`);
      const data = await response.json();
      console.log(data);
  
      // Parse the result string into a JSON object
      const parsedResult = JSON.parse(data.result);
  
      // Update analysisResults state with the parsed result
      setAnalysisResults([...analysisResults, parsedResult]);
    } catch (error) {
      console.error("Error fetching analysis data: ", error);
    }
  };
  
 
  return (
    <>
      <div>
        <div className=" mx-auto text-center text-7xl max-sm:text-5xl max-md:text-6xl font-bold mt-10 leading-relaxed">
          Ready to send us your <span className="text-grad">"Face snap"</span> ?
        </div>
        <p className="text-sm max-sm:text-xs text-gray-600 mt-4 mx-auto text-center">
          Choose a file or open camera to send us pics to get a skin care routine and analyse your skin using our AI
        </p>
        <div className="w-11/12 p-8 bg-violet-100 rounded-md h-fit max-h-min mx-auto mt-20 flex-col items-center justify-center">
          <div className=" flex-col">
            <input
              type="file"
              accept="image/*"
              onChange={uploadImage}
              className="mb-4"
            />
            {imageUrls.length > 0 && (
              <div>
                {imageUrls.map((url, index) => (
                  <div key={index}>
                    <Image
                      cloudName="dmdhep1qp"
                      publicId={url}
                      width="300"
                      crop="scale"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {imageUrls.length > 0 && (
          <div className="analyze-button cursor-pointer mx-auto px-4 py-2 bg-gradient-to-r from-violet-700 to-violet-800 shadow-md rounded-md text-white w-fit mt-6 transition-all hover:from-slate-800 hover:to-slate-600">
            Analyze
          </div>
        )}
        {analysisResults.map((result, index) => (
        <div key={index} className="card">
          <h2>Status: {result.status}</h2>
          <p>Description: {result.description}</p>
          <p>Remedies: {result.remedies}</p>
        </div>
      ))}
      </div>
    </>
  );
};

export default ImageUploader;
