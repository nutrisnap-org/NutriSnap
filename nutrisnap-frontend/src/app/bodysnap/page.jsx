"use client";
import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { Image } from "cloudinary-react";
import { ThreeDots } from "react-loader-spinner";
import {
  getFirestore,
  doc,
  updateDoc,
  arrayUnion,
  getDoc // Add getDoc function import
} from "firebase/firestore";
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

const ImageUploader = () => {
  const [imageUrls, setImageUrls] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Retrieve user from session storage
    const userFromSession = sessionStorage.getItem("user");
    if (userFromSession) {
      setUser(JSON.parse(userFromSession));
    } 
  }, []);
  const fetchUserXP = async () => {
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserXP(userData.xp );
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user XP:", error);
    }
  };

useEffect(() => {
    if (user) {
      fetchUserXP();
    }
  }, [user] ,[]);
const updateUserXP = async (xpToAdd) => {
    try {
        if (user) {
            // Fetch the current XP from the database
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                const currentXP = userData.xp || 0;

                // Calculate the updated XP by adding the new XP to the current XP
                const updatedXP = currentXP + xpToAdd;

                // Update the XP in the database
                await updateDoc(docRef, {
                    xp: updatedXP
                });

                console.log("User XP successfully updated in Firestore!");
            } else {
                console.error("No such document!");
            }
        } else {
            console.error("User not found in session storage");
        }
    } catch (error) {
        console.error("Error updating user XP:", error);
    }
};
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
          bodysnapUrls: arrayUnion(imageUrl),
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
      setLoading(true);
      const response = await fetch(
        `http://127.0.0.1:5000/body-analyse?img_url=${imageUrl}`
      );
      const data = await response.json();
      console.log(data);

      let parsedResult;

      // Check if data.result is a string
      if (typeof data.result === "string") {
        // Remove non-printable characters and control characters using regex
        const sanitizedResult = data.result.replace(
          /[\x00-\x1F\x7F-\x9F]/g,
          ""
        );

        // Check if sanitizedResult contains JSON markers
if (
  sanitizedResult.startsWith("```json") &&
  sanitizedResult.endsWith("```")
) {
  // Extract JSON content without the markers
  const jsonContent = sanitizedResult.slice(8, -3).trim();

  try {
    // Attempt to parse JSON content
    parsedResult = JSON.parse(jsonContent);
  } catch (error) {
    console.error("Error parsing JSON data:", error);
    // Handle the error or set parsedResult to null or an appropriate value
    parsedResult = null;
  }
} else if (
    sanitizedResult.startsWith('```') &&
  sanitizedResult.endsWith('```')
) {
  // Extract JSON content without the markers
 const jsonContent = sanitizedResult.slice(6, -3).trim();
  try {
    // Attempt to parse JSON content
    parsedResult = JSON.parse(jsonContent);
  } catch (error) {
    console.error("Error parsing JSON data:", error);
    // Handle the error or set parsedResult to null or an appropriate value
    parsedResult = null;
  }
} else {
  // If data.result does not contain JSON markers, attempt to parse it directly
  try {
    parsedResult = JSON.parse(sanitizedResult);
  } catch (error) {
    console.error("Error parsing JSON data:", error);
    parsedResult = null;
  }
}
        }


      else {
        // If data.result is not a string, assign it directly to parsedResult
        parsedResult = data.result;
      }

      // Update analysisResults state with the parsed result
      setAnalysisResults([...analysisResults, parsedResult]);
      if (parsedResult.XP) {
        updateUserXP(parseInt(parsedResult.XP));
      }
    } catch (error) {
      console.error("Error fetching analysis data: ", error);
    } finally {
      setLoading(false); // Set loading to false when analysis is done
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
  return (
    <>
      <div className="greenball blur-3xl bg-yellow-400/20 w-96 h-96 fixed top-0 left-0 rounded-full"></div>

      <div>
        <div className=" mx-auto text-center text-7xl max-sm:text-5xl max-md:text-6xl font-bold mt-10 leading-relaxed">
          Ready to send us your <span className="yellowtext">"BodySnap"</span> ?
        </div>
        <p className="text-sm max-sm:text-xs text-gray-600 mt-4 mx-auto text-center">
          Choose a file or open camera to send us pics to analyze the food and
          provide you the necesary data
        </p>
        <div className="flex max-md:flex-col mx-auto justify-center mt-8 px-24 max-sm:px-4">
          <div className="w-full">
            <div className="w-fit max-md:w-11/12 p-8 max-sm:p-2 bg-yellow-100 rounded-md h-fit max-h-min mx-auto mt-8 mb-8 flex-col items-center justify-center">
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
                          width="400"
                          crop="cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {imageUrls.length > 0 && !loading && (
              <div className=" analyze-button mb-8 cursor-pointer mx-auto px-4 py-2 bg-gradient-to-r from-violet-700 to-violet-800 shadow-md rounded-full text-white w-fit mt-6 hover:from-slate-800 hover:to-slate-600 transition duration-300 ease-in-out">
                Analyze
              </div>
            )}
            {loading && (
              <div className="loader mb-8  mx-auto   text-white w-fit mt-6 hover:from-slate-800 hover:to-slate-600 transition duration-300 ease-in-out">
                <ThreeDots
                  visible={true}
                  height="80"
                  width="80"
                  color="#600FC7"
                  radius="9"
                  ariaLabel="three-dots-loading"
                  wrapperStyle={{}}
                  wrapperClass=""
                />
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
    result.XP >= 1 && result.XP <= 3
      ? "bg-red-100 rounded-md text-red-900 border-l-4 border-red-900"
      : result.XP >= 4 && result.XP <= 7
      ? "bg-yellow-100 rounded-md text-yellow-900 border-l-4 border-yellow-900"
      : "bg-green-100 rounded-md text-green-900 border-l-4 border-green-900"
  } shadow-sm hover:shadow-lg transition-all mt-2 mb-4`}
>
  XP: {result.XP}
</div>
                  <div
                    className={`text-md w-fit max-md:w-full font-semibold px-4 py-3 ${
                      result.status !== "healthy"
                        ? "bg-red-100 rounded-md text-red-900 border-l-4 border-red-900"
                        : "bg-green-100 rounded-md text-green-900 border-l-4 border-green-900"
                    }  shadow-sm hover:shadow-lg transition-all mt-2 mb-4`}
                  >
                    Status:{" "}
                    {result.status !== "healthy" ? result.status : "Healthy"}
                  </div>
                  <p className="text-md max-sm:text-sm text-gray-600 leading-relaxed px-4 py-3 bg-gray-100 rounded-md border-l-4 border-gray-500">
                    <span className="font-bold text-lg max-sm:text-md">
                      Description:
                    </span>{" "}
                    {result.description}
                  </p>
                  <p className="text-md max-sm:text-sm mt-4 text-gray-600 leading-relaxed px-4 py-3 bg-gray-100 rounded-md border-l-4 border-gray-500">
                    <span className="font-bold text-lg max-sm:text-md">
                      Remedies and Solutions:
                    </span>{" "}
                    {result.remedies}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bottom-navigation bottom-0 fixed w-full p-4 md:hidden bg-white shadow-2xl h-fit">
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
                className={` mx-auto opacity-100 active:opacity-100`}
              />
              <div className="text-xs text-center">Body</div>
            </a>
          </div>

          <div className="flex flex-col items-center">
            <a href="/nutricon">
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

export default ImageUploader;
