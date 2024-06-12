"use client";
import React, { createContext, useState } from "react";

// Create the context
export const EmailContext = createContext();

// Create the provider component
export const EmailProvider = ({ children }) => {
  // State for the darkbg value
  const [email, setEmail] = useState("");

  return (
    <EmailContext.Provider value={{ email, setEmail }}>
      {children}
    </EmailContext.Provider>
  );
};
