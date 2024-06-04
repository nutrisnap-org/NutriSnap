'use client'
import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '../utils/firebase'; // Make sure you have the firebase initialized here

const Profile = () => {
  const [nft, setNft] = useState(null);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchData(user);
      } else {
        setUser(null);
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async (user) => {
    try {
      // Fetch user data from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Check if NFT ID already exists in Firestore
        const nftDocRef = doc(db, 'nfts', user.uid);
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

          const createNftResponse = await fetch('/api/create-nft', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
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
      console.error('Error fetching/creating NFT:', error);
      setMessage('Error fetching/creating NFT');
    }
  };

  const fetchNftDetails = async (nftId) => {
    try {
      const response = await fetch(`https://devnet.underdogprotocol.com/v2/projects/1/nfts/${nftId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'authorization': `Bearer ${process.env.NEXT_PUBLIC_UNDERDOG_API_KEY}`
        }
      });

      if (response.ok) {
        const nftDetails = await response.json();
        setNft(nftDetails);
      } else {
        const errorData = await response.json();
        setMessage(`Failed to fetch NFT details: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error fetching NFT details:', error);
      setMessage('Error fetching NFT details');
    }
  };

  return (
    <div className="">
      <h1 className="text-center text-6xl font-bold uppercase  text-gray-800 max-sm:text-4xl max-md:text-6xl mb-12">
        Profile 
      </h1>
      {nft ? ( 
        <div>
           <iframe
              src={`https://claim.underdogprotocol.com/nfts/${nft.mintAddress}?network=DEVNET`}
              className="w-full h-screen border-2 border-gray-200 rounded-lg"
              title="Claim NFT"
            ></iframe>
     
        
        <div className='flex justify-center items-center mt-10'>
              <span className="font-semibold text-gray-600">Check Your Nft: &nbsp;</span>
              <a
                href={`https://claim.underdogprotocol.com/nfts/${nft.mintAddress}?network=DEVNET`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
               https://claim.underdogprotocol.com/nfts/${nft.mintAddress}?network=DEVNET

              </a> 
              </div>
            </div>
          
      ) : (
        <p className="text-gray-500 text-lg">{message}</p>
      )}
    </div>
  );
};

export default Profile;
