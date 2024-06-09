"use client";

import React, { useContext, useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { auth, db } from "../utils/firebase"; // Ensure Firebase is initialized here
import { ProfileContext } from "../context/profileContext";
import Loader from "../components/Loader";

const Profile = () => {
  const [nft, setNft] = useState(null);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { darkbg, setDarkbg } = useContext(ProfileContext);
  const path = usePathname();

  useEffect(() => {
    if (path === "/profile") {
      setDarkbg(true);
    } else {
      setDarkbg(false);
    }
  }, [path, setDarkbg]);

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
  }, [router]);

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
    } finally {
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

  return (
    <>
      <div className={`${darkbg ? "bg-gray-950" : ""}`}>
        <h1 className="text-center text-6xl font-bold uppercase text-gray-100  max-sm:text-4xl max-md:text-6xl mb-12">
          Profile
        </h1>
        {!nft && (
          <div className="text-gray-400 pt-28 pb-[25rem] flex justify-center w-full mx-auto">
            <Loader />
          </div>
        )}
        {nft ? (
          <div>
            <iframe
              src={`https://claim.underdogprotocol.com/nfts/${nft.mintAddress}?network=DEVNET`}
              className="w-full h-screen border-gray-200 rounded-lg"
              title="Claim NFT"
            ></iframe>
            <div className="flex justify-center items-center mt-10">
              <span className="font-semibold text-gray-600">
                Check Your NFT: &nbsp;
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
                  borderRadius: "10px", // Set the border radius
                  backdropFilter: "blur(20px)", // Apply a backdrop blur effect
                }}
                onClick={shareOnTwitter}
              >
                Flex on{" "}
                <img
                  src="/twitter.png"
                  alt="Twitter"
                  className="w-6 h-6 ml-2"
                />
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-lg">{message}</p>
        )}
      </div>
    </>
  );
};

export default Profile;
