"use client";

import React, { useContext, useEffect, useState } from "react";
import { doc, getDoc, setDoc, query, where, collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { auth, db } from "../../utils/firebase"; // Ensure Firebase is initialized here
import { ProfileContext } from "../../context/profileContext";
import Loader from "../../components/Loader";

const Profile = () => {
  const [nft, setNft] = useState(null);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  const [view, setView] = useState(false);

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const email = path.split("/profile/")[1];
        if (email) {
          await fetchDataByEmail(email);
        }
      } else {
        setUser(null);
        router.push("/login");
      }
    });
    return () => unsubscribe();
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
          
          setMinted(true);
          setView(true);
          setMessage(`NFT created successfully! ID: ${newNft.id}`);
        } else {
          const errorData = await createNftResponse.json();
          setMessage(`Failed to create NFT: ${errorData.error}`);
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
    <div className={`${darkbg ? "bg-gray-950" : ""}`}>
      <h1 className="text-center text-6xl font-bold uppercase text-gray-100 max-sm:text-4xl max-md:text-6xl mb-12">
        Profile
      </h1>
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
            <span className="font-semibold text-gray-600">Check Your NFT: &nbsp;</span>
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
              <div>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                onClick={mintNft}
              >
                Mint NFT
              </button>
               <div className="text-gray-400 pt-28 pb-[25rem] flex justify-center w-full mx-auto">
               <Loader />
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
          ) : view && (
            <div>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={() =>location.reload()}
            >
              View NFT
            </button>
            <div className="text-gray-400 pt-28 pb-[25rem] flex justify-center w-full mx-auto">
            <Loader />
          </div> 
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
