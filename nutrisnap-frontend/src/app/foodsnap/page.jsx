"use client";
import { Analytics } from "@vercel/analytics/react";
import React, { useState, useEffect } from "react";
import { ThreeDots } from "react-loader-spinner";
import { 
  GoogleGenerativeAI, 
  HarmCategory, 
  HarmBlockThreshold 
} from "@google/generative-ai";
import {
  setDoc,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  getDoc,
  deleteField,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import html2canvas from "html2canvas";

import { auth, db } from "../utils/firebase";

const ImageUploader = () => {
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const reload = () => {
    window.location.reload();
  };
  // Environment setup
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  // Utility function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  // HTML2Canvas screenshot download
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

  // File input change handler
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

  // Update user XP
  const updateUserXP = async (xpToAdd) => {
    try {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          const currentXP = userData.xp || 0;
          const updatedXP = currentXP + xpToAdd;

          await updateDoc(docRef, { xp: updatedXP });
          console.log("User XP successfully updated in Firestore!");
        }
      }
    } catch (error) {
      console.error("Error updating user XP:", error);
    }
  };

  // Update user data with image URL and analysis
  const updateUserDataWithImageUrl = async (imageUrl, calories, protein) => {
    try {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);

        await updateDoc(userDocRef, {
          tempTimestamp: serverTimestamp(),
        });

        const userDoc = await getDoc(userDocRef);
        const timestamp = userDoc.data().tempTimestamp;

        await updateDoc(userDocRef, {
          unhashedfoodsnapUrls: arrayUnion({
            imageUrl,
            timestamp,
            calories,
            protein,
          }),
          tempTimestamp: deleteField(),
        });

        console.log("Image URL successfully updated in Firestore!");
      }
    } catch (error) {
      console.error("Error updating image URL: ", error);
    }
  };

  // Fetch analysis data from Google Generative AI
  const fetchAnalysisData = async (file) => {
    try {
      setLoading(true);

      // Prepare base64 image
      const base64Image = await fileToBase64(file);

      // Configure model
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
      });

      const generationConfig = {
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
      };

      const safetySettings = [
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

      const prompt = `Analyse the food image and provide a JSON response with the following structure:
      {
        status: 'healthy' or 'unhealthy',
        description: 'detailed food description',
        est_calories: 'estimated calorie count',
        est_protein: 'estimated protein amount in grams',
        XP: 'health score from 1-10',
        diet: 'personalized diet recommendation'
      }
      
      Provide accurate, unique insights based on the specific food image.`;

      // Start chat session
      const chatSession = model.startChat({
        generationConfig,
        safetySettings,
      });

      // Send message with image
      const result = await chatSession.sendMessage([
        { 
          inlineData: { 
            mimeType: file.type, 
            data: base64Image 
          } 
        },
        { text: prompt }
      ]);

     // Get the response text
     const responseText = await result.response.text();
     console.log("Raw Response:", responseText); // Log raw response for debugging
 
     // More robust JSON parsing
     let parsedData;
     try {
       // Remove ```json and ``` if present
       const cleanedResponseText = responseText
         .replace(/```json/g, '')
         .replace(/```/g, '')
         .trim();
 
       parsedData = JSON.parse(cleanedResponseText);
     } catch (parseError) {
       console.error("JSON Parsing Error:", parseError);
       console.error("Problematic Response:", responseText);
       
       // Fallback parsing attempt
       try {
         // Try to extract JSON-like content
         const jsonMatch = responseText.match(/\{[\s\S]*\}/);
         if (jsonMatch) {
           parsedData = JSON.parse(jsonMatch[0]);
         } else {
           throw new Error("No JSON-like content found");
         }
       } catch (fallbackError) {
         console.error("Fallback Parsing Error:", fallbackError);
         parsedData = {
           status: 'unknown',
           description: 'Unable to analyze the image',
           est_calories: 'N/A',
           est_protein: 'N/A',
           XP: '1',
           diet: 'Consult a nutritionist for personalized advice'
         };
       }
     }
 
     // Ensure all required fields exist
     parsedData = {
       status: parsedData.status || 'unknown',
       description: parsedData.description || 'No description available',
       est_calories: parsedData.est_calories || 'N/A',
       est_protein: parsedData.est_protein || 'N/A',
       XP: parsedData.XP || '1',
       diet: parsedData.diet || 'No specific diet recommendation'
     };
 
     // Update states
     setAnalysisResults([...analysisResults, parsedData]);
     
     // Optional: Update user data and XP if available
     if (previewImage) {
       updateUserDataWithImageUrl(previewImage, parsedData.est_calories, parsedData.est_protein);
     }
     
     if (parsedData.XP) {
       updateUserXP(parseInt(parsedData.XP));
     }
 
   } catch (error) {
     console.error("Analysis Error:", error);
     setAnalysisResults([...analysisResults, {
       status: 'error',
       description: 'Failed to analyze image',
       est_calories: 'N/A',
       est_protein: 'N/A',
       XP: '1',
       diet: 'Check connection and try again'
     }]);
   } finally {
     setLoading(false);
   }
 };

  // Image upload handler
  const uploadImage = async (e) => {
    handleFileInputChange(e);
    const file = e.target.files[0];
    
    if (file) {
      setImageUrls([...imageUrls, URL.createObjectURL(file)]);
      fetchAnalysisData(file);
    }
  };

  // User authentication effect
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //     if (currentUser) {
  //       setUser(currentUser);
  //     } else {
  //       router.push("/login");
  //     }
  //   });
  //   return () => unsubscribe();
  // }, []); 


  useEffect(() => {
    gsap.set(".ball", { xPercent: -50, yPercent: -50 });
    let targets = gsap.utils.toArray(".ball");
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
      <div className="ball blur-3xl bg-purple-400/50 w-96 h-96 fixed top-0 left-0 rounded-full"></div>

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
            <div className="w-fit max-md:w-11/12 p-8 max-sm:p-2 bg-purple-100 rounded-md h-fit max-h-min mx-auto mt-8 mb-8 flex-col items-center justify-center">
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
              <div className="loader mb-8  mx-auto w-fit mt-6 hover:from-slate-800 hover:to-slate-600 transition duration-300 ease-in-out">
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
              <div className="w-full" id="capture">
                <div className="text-4xl mt-4 mb-4 px-4 max-md:px-2">
                  Report:
                </div>
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
                    Aura: : {result.XP}
                  </div>
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
                  <p className="text-md max-sm:text-sm mt-4 text-gray-600 leading-relaxed px-4 py-3 bg-gray-100 rounded-md border-l-4 border-gray-500">
                    <span className="font-bold text-lg max-sm:text-md">
                      Protein:
                    </span>{" "}
                    {result.est_protein}
                  </p>
                  <p className="text-md max-sm:text-sm mt-4 text-gray-600 leading-relaxed px-4 py-3 bg-gray-100 rounded-md border-l-4 border-gray-500">
                    <span className="font-bold text-lg max-sm:text-md">
                      Diet for you:
                    </span>{" "}
                    {result.diet}
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
                className={` mx-auto opacity-100`}
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
                className={` mx-auto opacity-40 active:opacity-100`}
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
    </>
  );
};

export default ImageUploader;
