"use client";
import React, { createContext, useState } from "react";

// Create the context
export const ProfileContext = createContext();

// Create the provider component
export const ProfileProvider = ({ children }) => {
  // State for the darkbg value
  const [darkbg, setDarkbg] = useState(false);

  return (
    <ProfileContext.Provider value={{ darkbg, setDarkbg }}>
      {children}
    </ProfileContext.Provider>
  );
};
