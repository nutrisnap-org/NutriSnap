"use client";
import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { Image } from "cloudinary-react";
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [imageUrls, setImageUrls] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);

  const [user, setUser] = useState(null);

  useEffect(() => {
    // Retrieve user from session storage
    const userFromSession = sessionStorage.getItem("user");
    if (userFromSession) {
      setUser(JSON.parse(userFromSession));
    } else {
      router.push("/login");
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
          foodsnapUrls: arrayUnion(imageUrl),
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
      const response = await fetch(
        // console.log(imageUrl),
        `http://127.0.0.1:5000/food-snap?img_url=https://res.cloudinary.com/dmdhep1qp/image/upload/v1706315326/s25cyl3nis9dgaxdwxyi.jpg`
      );
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
      <div className="px-4">
        <div className=" mx-auto text-center text-7xl max-sm:text-4xl max-md:text-6xl font-bold mt-10">
          Ready to send us your <span className="text-grad">"Foodsnap"</span> ?
        </div>
        <p className="text-sm max-sm:text-xs text-gray-600 mt-4 mx-auto text-center">
          Choose a file or open camera to send us pics to analyze the food and
          provide you the necesary data
        </p>
        <div className="flex max-md:flex-col mx-auto justify-center mt-8 px-24 max-sm:px-4">
          <div className="w-full">
            <div className="w-fit max-md:w-11/12 p-8 max-sm:p-2 bg-violet-100 rounded-md h-fit max-h-min mx-auto mt-8 mb-8 flex-col items-center justify-center">
              <div className=" flex-col items-center justify-center">
                <input
                  type="file"
                  id="file"
                  accept="image/*"
                  onChange={uploadImage}
                  className="sr-only mx-auto"
                />
                <label
                  htmlFor="file"
                  className="items-center max-sm:text-sm cursor-pointer border max-sm:px-2 px-4 py-2 mx-auto text-center h-fit rounded-md border-gray-800 hover:bg-black hover:text-white transition duration-300 ease-in-out"
                >
                  Choose an Image
                </label>
                {imageUrls.length > 0 && (
                  <div>
                    {imageUrls.map((url, index) => (
                      <div key={index} className="m-8">
                        <Image
                          cloudName="dmdhep1qp"
                          publicId={url}
                          height="400"
                          crop="cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {imageUrls.length > 0 && (
              <div className=" analyze-button mb-8 cursor-pointer mx-auto px-4 py-2 bg-gradient-to-r from-violet-700 to-violet-800 shadow-md rounded-full text-white w-fit mt-6 hover:from-slate-800 hover:to-slate-600 transition duration-300 ease-in-out">
                Analyze
              </div>
            )}
          </div>
          <div>
            {analysisResults.map((result, index) => (
              <div className="w-full">
                <div className="text-4xl mb-4 px-4 max-md:px-2">Report:</div>
                <div key={index} className="card px-4 max-md:px-2">
                  <div
                    className={`text-md w-fit max-md:w-full font-semibold px-4 py-3 ${
                      result.status === "unhealthy"
                        ? "bg-red-100 rounded-md text-red-900 border-l-4 border-red-900"
                        : "bg-green-100 rounded-md text-green-900 border-l-4 border-green-900"
                    }  shadow-sm hover:shadow-lg transition-all mt-2 mb-4`}
                  >
                    Status:{" "}
                    {result.status === "unhealthy" ? "Unhealthy" : "Healthy"}
                  </div>
                  <p className="text-md max-sm:text-sm text-gray-600 leading-relaxed px-4 py-3 bg-gray-100 rounded-md border-l-4 border-gray-500">
                    <span className="font-bold text-lg max-sm:text-md">
                      Description:
                    </span>{" "}
                    {result.description}
                  </p>
                  <p className="text-md max-sm:text-sm mt-4 text-gray-600 leading-relaxed px-4 py-3 bg-gray-100 rounded-md border-l-4 border-gray-500">
                    <span className="font-bold text-lg max-sm:text-md">
                      Calories:
                    </span>{" "}
                    {result.est_calories}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageUploader;
