'use client'
import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import {
    getFirestore,
    collection,
    query,
    orderBy,
    getDocs,
} from "firebase/firestore";

const UserRankingPage = () => {
    const firebaseConfig = {
        apiKey: "AIzaSyAbn4iCEy5W9rSO-UiOmd_8Vbp9nRlkRCI",
      
        authDomain: "nutrisnap-e6cf9.firebaseapp.com",
      
        projectId: "nutrisnap-e6cf9",
      
        storageBucket: "nutrisnap-e6cf9.appspot.com",
      
        messagingSenderId: "169090435206",
      
        appId: "1:169090435206:web:45f0d96b834969ca236907",
      
        measurementId: "G-VHL1DB60YR",
      };
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const [userList, setUserList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const usersCollection = collection(db, 'users');
                const usersQuery = query(usersCollection, orderBy('xp', 'desc'));
                const querySnapshot = await getDocs(usersQuery);
                
                const users = [];
                querySnapshot.forEach(doc => {
                    users.push({
                        id: doc.id,
                        name: doc.data().displayName, // Assuming displayName field exists
                        xp: doc.data().xp // Assuming xp field exists
                    });
                });
                setUserList(users);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setLoading(false);
            }
        };

        fetchUserData();

        // Clean up function
        return () => {
            // Detach Firebase listeners if any
        };
    }, [db]);

    const handleSearch = () => {
        const result = userList.find(user => user.name.toLowerCase() === searchTerm.toLowerCase());
        setSearchResult(result);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Filter suggestions based on input value
        const suggestions = userList.filter(user =>
            user.name.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(suggestions);
    };

    const handleSuggestionClick = (name) => {
        setSearchTerm(name);
        setSuggestions([]); // Clear suggestions
    };

    return (
        <>
        <div>
            <h1>User Ranking</h1>
            <div>
                <input
                    type="text"
                    placeholder="Search your name"
                    value={searchTerm}
                    onChange={handleInputChange}
                />
                <button onClick={handleSearch}>Search</button>
                {/* Suggestions */}
                {suggestions.length > 0 && (
                    <ul>
                        {suggestions.map((user, index) => (
                            <li key={index} onClick={() => handleSuggestionClick(user.name)}>
                                {user.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {loading ? (
                <p>Loading...</p>
            ) : searchResult ? (
                <p>
                    Your rank is {userList.findIndex(user => user.id === searchResult.id) + 1} with XP: {searchResult.xp}
                </p>
            ) : null}
            <h2>Overall Ranking</h2>
            <ol>
                {userList.map((user, index) => (
                    <li key={user.id}>
                        {user.name} - XP: {user.xp}
                    </li>
                ))}
            </ol>
        </div>
            <div className="bottom-navigation bottom-0 fixed w-full p-4 md:hidden bg-gradient-to-b from-white to-transparent backdrop-blur-md shadow-2xl h-fit">
            <div className="flex items-center justify-around md:hidden">
              <div className="flex flex-col items-center">
                <a href="/foodsnap">
                  <img
                    src="/food.png"
                    alt=""
                    height={30}
                    width={30}
                    className={` mx-auto opacity-40`}
                  />
                  <div className="text-xs text-center">Food</div>
                </a>
              </div>
              <div className="flex flex-col items-center">
                <a href="/skinsnap">
                  <img
                    src="/face.png"
                    alt=""
                    height={30}
                    width={30}
                    className={` mx-auto opacity-40 hover:opacity-100`}
                  />
                  <div className="text-xs text-center">Skin</div>
                </a>
              </div>
              <div className="flex flex-col items-center">
                <a href="/bodysnap">
                  <img
                    src="/body.png"
                    alt=""
                    height={30}
                    width={30}
                    className={` mx-auto opacity-40 active:opacity-100`}
                  />
                  <div className="text-xs text-center">Body</div>
                </a>
              </div>
    
              <div className="flex flex-col items-center">
                <a href="/ranking">
                  <img
                    src="/nutricon.png"
                    alt=""
                    height={30}
                    width={30}
                    className={` mx-auto opacity-100`}
                  />
                  <div className="text-xs text-center">Nutricon</div>
                </a>
              </div>
            </div>
          </div>
        </>
    );
};

export default UserRankingPage;
