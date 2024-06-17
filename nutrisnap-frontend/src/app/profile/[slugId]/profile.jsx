"use client";

import React, { useContext, useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  query,
  where,
  collection,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { auth, db } from "../../utils/firebase"; // Ensure Firebase is initialized here
import { ProfileContext } from "../../context/profileContext";
import Loader from "../../components/Loader";
import { BiCopy } from "react-icons/bi";
import { useClipboard } from "use-clipboard-copy";

const Profile = () => {
  const [nft, setNft] = useState(null);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  const [view, setView] = useState(false);
  const [nosuchuser, setNosuchuser] = useState(false);
  const [nutritionData, setNutritionData] = useState({
    totalCalories: "loading",
    totalProtein: "loading",
    last24HoursCalories: "loading",
    last24HoursProtein: "loading",
    photoURL: "https://i.kym-cdn.com/photos/images/newsfeed/002/051/162/211.gif",
    displayName: "loading",
    email: "loading",
    xp:"loading",
  });
  const router = useRouter();
  const { darkbg, setDarkbg } = useContext(ProfileContext);
  const path = usePathname();

  useEffect(() => {
    if (path.includes("/profile/")) {
      setDarkbg(true);
    } else {
      setDarkbg(false);
    }
  }, [path, setDarkbg]);

  useEffect(() => {
    const email = path.split("/profile/")[1];
    if (email) {
      fetchDataByEmail(email);
      fetchNutritionData(email);
    }
  }, [path, router]);

  const fetchDataByEmail = async (email) => {
    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        console.log(userData);

        const nftDocRef = doc(db, "nfts", userDoc.id);
        const nftDoc = await getDoc(nftDocRef);

        if (nftDoc.exists()) {
          const nftData = nftDoc.data();
          await fetchNftDetails(nftData.id);
        } else {
          setLoading(false);
        }
      } else {
        console.log("No such user document!");
        setMessage("No such user");
        setNosuchuser(true);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching/creating NFT:", error);
      setMessage("Error fetching/creating NFT");
      setLoading(false);
    }
  };

  const fetchNftDetails = async (nftId) => {
    try {
      const response = await fetch(
        `https://devnet.underdogprotocol.com/v2/projects/1/nfts/${nftId}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            authorization: `Bearer ${process.env.NEXT_PUBLIC_UNDERDOG_API_KEY}`,
          },
        }
      );

      if (response.ok) {
        const nftDetails = await response.json();
        setNft(nftDetails);
      } else {
        const errorData = await response.json();
        setMessage(`Failed to fetch NFT details: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error fetching NFT details:", error);
      setMessage("Error fetching NFT details");
    } finally {
      setLoading(false);
    }
  };

  const mintNft = async () => {
    try {
      setIsMinting(true);
      const email = path.split("/profile/")[1];
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        const nftData = {
          displayName: userData.displayName,
          email: userData.email,
          photoURL: userData.photoURL,
          unhashedfoodsnapUrls: userData.unhashedfoodsnapUrls,
          xp: userData.xp,
        };

        const createNftResponse = await fetch("/api/create-nft", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(nftData),
        });

        if (createNftResponse.ok) {
          const newNft = await createNftResponse.json();
          const nftDocRef = doc(db, "nfts", userDoc.id);
          await setDoc(nftDocRef, { id: newNft.id });

          // setView(true);
          setMinted(true);
          setMessage(
            `NFT created successfully! ID wait 2 seconds to view nft: ${newNft.id}`
          );
          // Automatically view the NFT after 3 seconds
          setTimeout(() => {
            setView(true);
          }, 1000);
        } else {
          const errorData = await createNftResponse.json();
          setMessage( `Failed to create NFT : "USE FOODSNAP MORE AND THEN TRY AGAIN "  ${errorData.error}`);
        }
      } else {
        console.log("No such user document!");
      }
    } catch (error) {
      console.error("Error minting NFT:", error);
      setMessage("Error minting NFT");
    } finally {
      setIsMinting(false);
    }
  };

  // Function to fetch user data from custom API
  const fetchNutritionData = async (email) => {
    try {
      const response = await fetch(`/api/user?email=${email}`); // Call your API endpoint
      if (response.ok) {
        const data = await response.json();
        setNutritionData(data); // Assuming your API returns an object with totalCalories, totalProtein, last24HoursCalories, last24HoursProtein
      } else {
        console.error("Failed to fetch nutrition data");
      }
    } catch (error) {
      console.error("Error fetching nutrition data:", error);
    }
  };
  const shareOnTwitter = () => {
    if (nft) {
      const tweetText = `Tracking My Progress Using nutrisnap.tech 😋 Love The App! Check out my Progress with an NFT here: https://claim.underdogprotocol.com/nfts/${nft.mintAddress}?network=DEVNET`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        tweetText
      )}`;
      window.open(twitterUrl, "_blank");
    }
  };

  const clipboard = useClipboard();
  const line = usePathname();
  const newline = "https://nutrisnap.tech" + line;
  const [copy, setCopy] = useState(false);
  const copyToClipboard = () => {
    clipboard.copy(newline);
    setCopy(true);
  };

  return (
    <div className={`${darkbg ? "bg-gray-950" : ""}`}>
      <img
        src="/bannergrad.webp"
        alt=""
        className="h-72 w-full object-cover opacity-35"
      />
  {!nosuchuser &&    <div className="bg-gradient-to-br from-zinc-950 to-zinc-800 relative p-8 max-sm:p-4 rounded-lg w-8/12 max-sm:w-11/12 mx-auto mb-20 -mt-20 max-sm:-mt-48 z-10">
        <div className="flex justify-between max-sm:flex-col max-sm:gap-4">
          <div className="flex-col items-center justify-center">
            <img
              src={nutritionData.photoURL}
              alt=""
              className="w-20 h-20 rounded-full"
            />
            <h1 className="text-2xl text-white font-semibold mt-4">
              {nutritionData.displayName}
            </h1>
            <p className="text-gray-400 mt-2">{nutritionData.email}</p>
          </div>
          <div>
            <div
              onClick={copyToClipboard}
              className="text-white px-4 py-2 rounded-md border border-gray-600 hover:bg-white/25  cursor-pointer"
            >
              {clipboard.copy && copy ? "Copied!" : "Copy Profile url"}{" "}
              {clipboard.copy && copy ? "" : <BiCopy className="inline" />}
            </div>
          </div>
        </div>
        <div className="flex max-sm:flex-col gap-4">
          <div className="mt-6 w-fit border border-zinc-700 p-4 rounded-md flex gap-6">
            <div>
              <h1 className="text-white font-semibold">
                Past 24 hours Calories
              </h1>
              <p className="text-gray-400">
                {nutritionData.last24HoursCalories} cal
              </p>
            </div>
            <div>
              <h1 className="text-white font-semibold">
                Past 24 hours Protien
              </h1>
              <p className="text-gray-400">
                {nutritionData.last24HoursProtein} gms
              </p>
            </div>
          </div>
          <div className="mt-6 w-fit border border-zinc-700 p-4 rounded-md flex gap-6">
            <div>
              <h1 className="text-white font-semibold">Total Calories</h1>
              <p className="text-gray-400">{nutritionData.totalCalories} cal</p>
            </div>
            <div>
              <h1 className="text-white font-semibold">Total Protien</h1>
              <p className="text-gray-400">{nutritionData.totalProtein} gms</p>
            </div>
          </div>
        </div>
      </div>
}
      {loading ? (
        <div className="text-gray-400 pt-28 pb-[25rem] flex justify-center w-full mx-auto">
          <Loader />
        </div>
      ) : nft ? (
        <div>
          {nft.mintAddress && (
            <iframe
              src={`https://claim.underdogprotocol.com/nfts/${nft.mintAddress}?network=DEVNET`}
              className="w-full h-screen border-gray-200 rounded-lg"
              title="Claim NFT"
            ></iframe>
          )}
          <div className="flex justify-center items-center mt-10">
            <span className="font-semibold text-gray-600">
              Check Your NFT:{" "}
            </span>
            <a
              href={`https://claim.underdogprotocol.com/nfts/${nft.mintAddress}?network=DEVNET`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              claim.underdogprotocol.com/nfts/{nft.id}
            </a>
          </div>
          <div className="flex justify-center mt-8">
            <button
              className="bg-black hover:bg-gray-800 border w-fit mb-32 border-white px-4 py-2 flex text-white font-bold rounded"
              style={{
                borderRadius: "10px",
                backdropFilter: "blur(20px)",
              }}
              onClick={shareOnTwitter}
            >
              Flex on{" "}
              <img src="/twitter.png" alt="Twitter" className="w-6 h-6 ml-2" />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">{message}</p>
          {!minted ? (
            !isMinting ? (
              <div>  {!nosuchuser && 
              
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                  onClick={mintNft}
                >
                  Mint NFT
                </button> }
                <div className="text-gray-400 pt-28 pb-[25rem] flex justify-center w-full mx-auto">
                {!nosuchuser &&     <Loader /> }
                </div>
                
                 </div> 
            ) : (
              <div>
                <p className="text-gray-500 text-lg mb-4">Minting NFT...</p>
                <div className="text-gray-400 pt-28 pb-[25rem] flex justify-center w-full mx-auto">
                  <Loader />
                </div>
              </div>
            )
          ) : (
            view && (
              <div>
                <button
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => location.reload()}
                >
                  View NFT
                </button>
                <div className="text-gray-400 pt-28 pb-[25rem] flex justify-center w-full mx-auto">
                  <Loader />
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
