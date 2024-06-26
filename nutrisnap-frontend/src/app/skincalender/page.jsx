// profile.js
"use client";
import React, { useState, useEffect } from "react";
import { auth, db } from "../utils/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Head from "next/head";
const Profile = () => {
  const [imageData, setImageData] = useState([]);
  const [user, setUser] = useState(null);
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

  const fetchImages = async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.unhashedskinsnapUrls) {
          setImageData(data.unhashedskinsnapUrls);
          console.log("Fetched images: ", data.unhashedskinsnapUrls);
        }
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching images: ", error);
    }
  };

  const renderTree = (data) => {
    return (
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {data.map((item, index) => (
          <li key={index} className="rounded-lg overflow-hidden shadow-md">
            <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">
              <img src={item.imageUrl} alt={`Image ${index + 1}`} className="w-full h-auto  md:h-80" />
            </a>
            <div className="text-center py-2">
              <span className="text-sm text-gray-600">
                {formatTimestamp(item.timestamp)}
              </span>
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
         <Head>
    <script id="hydro_config" type="text/javascript">
    window.Hydro_tagId = "5aaf26c3-644d-4392-bd0e-d42832c1dcec";
  </script>
  <script id="hydro_script" src="https://track.hydro.online/"></script>
        </Head>
      <h1 className="text-2xl flex justify-center items-center my-5">Track Your Skin</h1>
      {user ? (
        <div>
          
          <ul>{renderTree(imageData)}</ul>
          <h2 className="text-2xl flex justify-center items-center my-5">Your Skin is Skining</h2>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Profile;
