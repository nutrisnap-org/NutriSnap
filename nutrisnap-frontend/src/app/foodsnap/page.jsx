  'use client'
  import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { Image } from 'cloudinary-react';
import { getFirestore, doc, updateDoc , arrayUnion} from 'firebase/firestore';

const firebaseConfig = {

  apiKey: "AIzaSyAbn4iCEy5W9rSO-UiOmd_8Vbp9nRlkRCI",

  authDomain: "nutrisnap-e6cf9.firebaseapp.com",

  projectId: "nutrisnap-e6cf9",

  storageBucket: "nutrisnap-e6cf9.appspot.com",

  messagingSenderId: "169090435206",

  appId: "1:169090435206:web:45f0d96b834969ca236907",

  measurementId: "G-VHL1DB60YR"

};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ImageUploader = () => {
  const [imageUrls, setImageUrls] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Retrieve user from session storage
    const userFromSession = sessionStorage.getItem('user');
    if (userFromSession) {
      setUser(JSON.parse(userFromSession));
    }
  }, []);

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'lodrnpjl'); // Replace with your Cloudinary upload preset

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dmdhep1qp/image/upload',
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();
      const newImageUrl = data.secure_url;

      // Update state with new image URL
      setImageUrls([...imageUrls, newImageUrl]);

      // Update Firestore document with image URL
      updateUserDataWithImageUrl(newImageUrl);
    } catch (err) {
      console.error('Error uploading image: ', err);
    }
  };

  const updateUserDataWithImageUrl = async (imageUrl) => {
    try {
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          foodsnapUrls: arrayUnion(imageUrl)
        });
        console.log('Image URL successfully updated in Firestore!');
      } else {
        console.error('User not found in session storage');
      }
    } catch (error) {
      console.error('Error updating image URL: ', error);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={uploadImage} />
      {imageUrls.length > 0 && (
        <div>
          <h2>Uploaded Images:</h2>
          {imageUrls.map((url, index) => (
            <div key={index}>
              <Image cloudName="dmdhep1qp" publicId={url} width="300" crop="scale" />
              <p>Image URL: {url}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
