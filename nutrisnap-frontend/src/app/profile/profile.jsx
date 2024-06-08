"use client";
import React, { useContext, useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { auth, db } from "../utils/firebase"; // Make sure you have the firebase initialized here
import { set } from "lodash";
import { ProfileContext } from "../context/profileContext";

const Profile = () => {
  const [nft, setNft] = useState(null);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchData(user);
      } else {
        setUser(null);
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async (user) => {
    try {
      // Fetch user data from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Check if NFT ID already exists in Firestore
        const nftDocRef = doc(db, "nfts", user.uid);
        const nftDoc = await getDoc(nftDocRef);

        if (nftDoc.exists()) {
          const nftData = nftDoc.data();
          await fetchNftDetails(nftData.id);
        } else {
          // If no NFT exists, create a new one
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
            await setDoc(nftDocRef, { id: newNft.id });
            await fetchNftDetails(newNft.id);
            setMessage(`NFT created successfully! ID: ${newNft.id}`);
          } else {
            const errorData = await createNftResponse.json();
            setMessage(`Failed to create NFT: ${errorData.error}`);
          }
        }
      } else {
        console.log("No such user document!");
      }
    } catch (error) {
      console.error("Error fetching/creating NFT:", error);
      setMessage("Error fetching/creating NFT");
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
    }
  };
  // Function to handle Twitter share
  const shareOnTwitter = () => {
    if (nft) {
      const tweetText = `Tracking My Progress Using nutrisnap.tech 😋 Love The App! Check out my Progress with an NFT here: https://claim.underdogprotocol.com/nfts/${nft.mintAddress}?network=DEVNET`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        tweetText
      )}`;
      window.open(twitterUrl, "_blank");
    }
  };

  const { darkbg, setDarkbg } = useContext(ProfileContext);
  const path = usePathname();
  useEffect(() => {
    if (path === "/profile") {
      setDarkbg(true);
    } else {
      setDarkbg(false);
    }
  });

  return (
    <div className={`${darkbg ? "bg-gray-950" : ""}`}>
      <h1 className="text-center text-6xl font-bold uppercase  text-gray-100 max-sm:text-4xl max-md:text-6xl mb-12">
        Profile
      </h1>
      {!nft && <div className="text-gray-400"> *good things take time *</div>}
      {nft ? (
        <div>
          <iframe
            src={`https://claim.underdogprotocol.com/nfts/${nft.mintAddress}?network=DEVNET`}
            className="w-full h-screen border-gray-200 rounded-lg"
            title="Claim NFT"
          ></iframe>

          <div className="flex justify-center items-center mt-10">
            <span className="font-semibold text-gray-600">
              Check Your Nft: &nbsp;
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
              className="bg-black  hover:bg-gray-800 border border-black flex  text-white font-bold pt-4 px-4 rounded"
              style={{
                borderRadius: "10px", // Set the border radius
                // Apply a blur effect
                backdropFilter: "blur(20px)", // Apply a backdrop blur effect
              }}
              onClick={shareOnTwitter}
            >
              <div>
                Flex &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </div>
              &nbsp;on&nbsp;
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="fill-current text-white"
              >
                <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-lg">{message}</p>
      )}
    </div>
  );
};

export default Profile;
