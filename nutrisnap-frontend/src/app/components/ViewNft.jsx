'use client'
import React from 'react';
import { Helmet } from 'react-helmet';
import './NftCard.css'; // Ensure this path is correct
import { metadata } from './metadata'; // Ensure this path is correct
import { FaInstagram, FaTelegram, FaWhatsapp } from "react-icons/fa";
import { CiFacebook } from "react-icons/ci";
import { FaXTwitter } from "react-icons/fa6";
import { CiYoutube } from "react-icons/ci";
import { CiLinkedin } from "react-icons/ci";

const NftCard = ({ data }) => {
  const { name, description, image, externalUrl, mintAddress } = data;

  const tweetText = `Damn check nutrisnap.tech out, got this coolest NFT for Being healthy? Coolest nutritionist and skin care expert!`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(`https://claim.underdogprotocol.com/nfts/${mintAddress}?network=DEVNET`)}&via=nutrisnap&hashtags=nutrition,NFT,health`;

  const instagramShareUrl = `https://www.instagram.com/?url=${encodeURIComponent(`https://claim.underdogprotocol.com/nfts/${mintAddress}?network=DEVNET`)}`;
  const redditShareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(`https://claim.underdogprotocol.com/nfts/${mintAddress}?network=DEVNET`)}`;

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content={metadata.image} />
        <meta property="og:url" content={metadata.url} />
        <meta property="og:type" content={metadata.type} />
        <meta property="og:site_name" content={metadata.siteName} />
     
      </Helmet>
      <div className='font-bold text-4xl md:ml-10 ml-5'>
        Your Nfts
      </div>
      <div className="nft-card">

        <img src={image} alt={name} className="nft-image" />
        <div className="nft-details">
          <h2>{name}</h2>
          <p>{description}</p>
          <div className="flex space-x-4 mt-10">
            <FaTelegram
                className="icon text-blue-400 telegram
                           swing-animation" />
          <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" >  <FaXTwitter
                className="icon text-black twitter 
                           pulse-animation" /> </a>
            <FaInstagram
                className="icon text-orange-500 insta
                           rotate-animation" />
            <CiFacebook
                className="icon text-blue-500 fb 
                           bounce-animation" />
            <FaWhatsapp
                className="icon text-green-500 whatsapp 
                           flash-animation" />
            
           
        </div>
         </div>
      </div>
    </>
  );
};

export default NftCard;
