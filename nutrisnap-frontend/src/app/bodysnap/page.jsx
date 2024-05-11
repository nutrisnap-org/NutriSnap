"use client";
import { Analytics } from "@vercel/analytics/react";
import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { initializeApp } from "firebase/app";
import bcrypt from "bcryptjs";
import { Image } from "cloudinary-react";
import { ThreeDots } from "react-loader-spinner";
import { getAuth, signOut, onAuthStateChanged, reload } from "firebase/auth";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import {
  setDoc,
  getFirestore,
  doc,
  updateDoc,
  arrayUnion,
  getDoc, // Add getDoc function import
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
const auth = getAuth(app);
const ImageUploader = () => {
  const [previewImage, setPreviewImage] = useState(null);
  const divShot = () => {
    html2canvas(document.querySelector("#capture"), {
      imageTimeout: 20000,
    }).then((canvas) => {
      var link = document.createElement("a");
      link.download = `remedies.png`;
      link.href = canvas.toDataURL();

      link.click();
    });
  };
  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [user, setUser] = useState(null);
  const [userXP, setUserXP] = useState(0);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const saveUserDataToFirestore = async (user) => {
          try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
              await setDoc(docRef, {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                // You can add more user data as needed
              });
              console.log("User data successfully stored in Firestore!");
            } else {
              console.log("User already exists in Firestore!");
            }
          } catch (error) {
            console.error("Error storing user data: ", error);
          }
        };
        saveUserDataToFirestore(user);
        // Fetch user's XP from Firestore
      } else {
        setUser(null);
        router.push("/login");

        // Reset user's XP if not logged in
      }
    });
    return () => unsubscribe();
  }, []);
  // useEffect(() => {
  //   // Retrieve user from session storage
  //   const userFromSession = sessionStorage.getItem("user");
  //   if (userFromSession) {
  //     setUser(JSON.parse(userFromSession));
  //   }
  //   if(!userFromSession){

  //   }
  // }, []);
  const fetchUserXP = async () => {
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserXP(userData.xp);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user XP:", error);
    }
  };
  const reload = () => {
    window.location.reload();
  };
  useEffect(
    () => {
      if (user) {
        fetchUserXP();
      }
    },
    [user],
    []
  );
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
            xp: updatedXP,
          });

          console.log("User XP successfully updated in Firestore!");
        } else {
          console.error("No such document!");
        }
      } else {
        router.push("/login");
        console.error("User not found in session storage");
      }
    } catch (error) {
      console.error("Error updating user XP:", error);
    }
  };

  const uploadImage = async (e) => {
    handleFileInputChange(e);

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "lodrnpjl"); // Replace with your Cloudinary upload preset
    async function generateHash(data) {
      const saltRounds = 1; // Adjust the salt rounds as needed
      return await bcrypt.hash(data, saltRounds);
    }
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
      fetchAnalysisData(file);
      const imageUrlHash = await generateHash(newImageUrl);

      setImageUrls([...imageUrls, imageUrlHash]);

      updateUserDataWithImageUrl(imageUrlHash);
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
      } else {
        console.error("User not found in session storage");
      }
    } catch (error) {
      console.error("Error updating image URL: ", error);
    }
  };

  const fetchAnalysisData = async (file) => {
    try {
      setLoading(true);
      const genAI = new GoogleGenerativeAI(
        process.env.NEXT_PUBLIC_GOOGLE_API_KEYII
      );
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

      const generationConfig = {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      };

      const safetySettings = [
        // Add your safety settings here
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      const parts = [
        await fileToGenerativePart(file),
        {
          text: "Analyse the person and give output in this manner in a json format eg {status:'healthy',description:'the person looks healthy and active lean', bodyfat:'30 percent', remedies:'maintain diet and cardio' pls give a comprehensive report in remedies pointwise, XP:'6 the value ranges from 1-10 depending on the health of the person'\n",
        },
      ];

      const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig,
        safetySettings,
      });
      const data = result.response.text();
      const data2 = result.response[1];
      const data3 = JSON.parse(data);
      setAnalysisResults([...analysisResults, data3]);
      console.log(analysisResults);
      console.log(data2);

      // regex error fix end

      // Update analysisResults state with parsed result
      // Parse and set analysis results
      if (data3.XP) {
        updateUserXP(parseInt(data3.XP));
      }
    } catch (error) {
      console.error("Error fetching analysis data: ", error);
    } finally {
      setLoading(false); // Set loading to false when analysis is done
    }
  };
  const fileToGenerativePart = async (file) => {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
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
      <Analytics />
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
                    {previewImage && (
                      <div className="m-8">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-400 h-400"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            {imageUrls.length > 0 && !loading && (
              <>
                <div
                  onClick={reload}
                  className=" analyze-button flex mb-8 cursor-pointer mx-auto px-4 py-2 bg-gradient-to-r from-violet-700 to-violet-800 shadow-md rounded-full text-white w-fit mt-6 hover:from-slate-800 hover:to-slate-600 transition duration-300 ease-in-out"
                >
                  <img src="/refresh.png" alt="" className="mr-2" /> Try
                  Refreshing
                </div>
                <div
                  className="Download Remedies mb-8 cursor-pointer mx-auto px-4 py-2 text-black border rounded-full w-fit border-black"
                  onClick={divShot}
                >
                  Download Remedies
                </div>
              </>
            )}
            {loading && (
              <div className="loader mb-8 items-center mx-auto w-fit mt-6 hover:from-slate-800 hover:to-slate-600 transition duration-300 ease-in-out">
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
                <p classname="max-sm:text-xs text-black text-center text-sm">
                  Good things takes time but it's worth! *10-15 seconds*{" "}
                </p>
              </div>
            )}
          </div>
          <div>
            {analysisResults.map((result, index) => (
              <div className="w-full" key={index} id="capture">
                <div className="text-4xl mb-4 px-4 max-md:px-2">Report:</div>
                <div className="card px-4 max-md:px-2">
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
                className={` mx-auto opacity-100 active:opacity-100`}
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
                className={` mx-auto opacity-40`}
              />
              <div className="text-xs text-center">Scoreboard</div>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageUploader;
