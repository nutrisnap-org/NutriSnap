import { NextResponse } from 'next/server';
import fetch from 'node-fetch'; // Import fetch for making HTTP requests

// Define base URL and headers for Underdog Protocol
const baseURL = 'https://devnet.underdogprotocol.com/v2';
const underdogHeaders = {
  'Authorization': `Bearer ${process.env.NEXT_PUBLIC_UNDERDOG_API_KEY}`,
  'Content-Type': 'application/json',
};

// Function to call the local /api/create-collage endpoint
async function getCollageUrl(imageUrls) {
  // Create the query parameter string
  const queryParams = imageUrls.map(url => `url=${encodeURIComponent(url)}`).join('&');
  const requestUrl = `https://nutrisnap.tech/api/create-collag?${queryParams}`;

  const response = await fetch(requestUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.ok) {
    const data = await response.json();
    return data.imageUrl;  // Correct the key to match the response
  } else {
    throw new Error('Failed to create collage');
  }
}

// POST handler
export async function POST(request) {
  try {
    const { displayName, email, photoURL, unhashedfoodsnapUrls, xp } = await request.json();

    const imageUrls = unhashedfoodsnapUrls.map(snap => snap.imageUrl);
    const collageUrl = await getCollageUrl(imageUrls);

    // Step 2: Create the NFT using Underdog Protocol API
    const url = `${baseURL}/projects/1/nfts`;
    const nftData = {
      name: displayName,
      symbol: 'SYM',
      description: `NFT created for ${displayName} with XP ${xp}`,
      image: collageUrl,
      projectId: '1',
      delegated: true,
      attributes: {
        xp
      },
      receiver: {
        identifier: email,
        namespace: "love yourself"
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: underdogHeaders,
      body: JSON.stringify(nftData),
    });

    if (response.ok) {
      const responseData = await response.json();
console.log(responseData)
      const newNft = {
        id: responseData.nftId,
        name: displayName,
        description: `NFT created for ${displayName} with XP ${xp}`,
        imageUrl: collageUrl,
        createdAt: new Date().toISOString(),
      };
      console.log(newNft)
      return NextResponse.json(newNft, { status: 201 });
    } else {
      const errorMessage = await response.text();
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }
  } catch (error) {
    console.error('Error creating NFT:', error);
    return NextResponse.json({ error: 'Failed to create NFT' }, { status: 500 });
  }
}
