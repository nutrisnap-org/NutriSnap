import React from 'react';

const NftCard = ({ data }) => {
  const { name, description, image, externalUrl, mintAddress } = data;

  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://claim.underdogprotocol.com/nfts/${mintAddress}?network=DEVNET`)}`;
  const instagramShareUrl = `https://www.instagram.com/?url=${encodeURIComponent(`https://claim.underdogprotocol.com/nfts/${mintAddress}?network=DEVNET`)}`;
  const redditShareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(`https://claim.underdogprotocol.com/nfts/${mintAddress}?network=DEVNET`)}`;

  return (
    <div className="nft-card">
      <img src={image} alt={name} />
      <div className="nft-details">
        <h2>{name}</h2>
        <p>{description}</p>
        <a href={externalUrl} target="_blank" rel="noopener noreferrer">View on External Site</a>
        <div className="share-buttons">
          <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer">Share on Twitter</a>
          <a href={instagramShareUrl} target="_blank" rel="noopener noreferrer">Share on Instagram</a>
          <a href={redditShareUrl} target="_blank" rel="noopener noreferrer">Share on Reddit</a>
        </div>
      </div>
    </div>
  );
};

export default NftCard;
