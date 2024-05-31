import React from 'react';
import NftCard from '../components/ViewNft'; // Adjust path accordingly

const NftPage = () => {
  // Your JSON data
  const jsonData = {
    "name": "Alchemist",
    "description": "You're a fearless Alchemist, fearlessly indulging in a kaleidoscope of flavors, from the extraordinary to the daring, igniting culinary excitement wherever you roam.",
    "image": "https://updg8.storage.googleapis.com/a564c434-ff45-4c28-b33c-05dd3dafab41",
    "externalUrl": "https://nutrisnap.tech/",
    "attributes": {},
    "id": 1,
    "delegated": false,
    "mintAddress": "2sCUU6yoa4WMTjnfTvKmxP4V2pNH4rUxG2mhLmzYp814",
    "ownerAddress": "4iG4s2F3eSByCkMvfsGhrvzXNoPrDFUJuA7Crtuf3Pvn",
    "status": "confirmed"
  };

  return (
    <div>
      <NftCard data={jsonData} />
    </div>
  );
};

export default NftPage;
