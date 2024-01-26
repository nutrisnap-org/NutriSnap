'use client'
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';


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
const auth = getAuth(app);
const db = getFirestore(app);

const LoginWithGoogle = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
        // Store user data in Firestore
        saveUserDataToFirestore(authUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        // User signed in
        const user = result.user;
        setUser(user);
        sessionStorage.setItem('user', JSON.stringify(user));
      })
      .catch((error) => {
        // Handle errors
        console.error(error);
      });
  };

  const saveUserDataToFirestore = (user) => {
    setDoc(doc(db, 'users', user.uid), {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      // You can add more user data as needed
    })
    .then(() => {
      console.log('User data successfully stored in Firestore!');
    })
    .catch((error) => {
      console.error('Error storing user data: ', error);
    });
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        setUser(null);
      })
      .catch((error) => {
        console.error('Error signing out: ', error);
      });
  };

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.displayName}</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <h1>Login with Google</h1>
          <button onClick={handleGoogleLogin}>Login</button>
        </div>
      )}
    </div>
  );
};

export default LoginWithGoogle;
