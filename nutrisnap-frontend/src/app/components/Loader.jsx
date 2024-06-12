// components/Loader.jsx

import React from "react";
import "ldrs/trefoil";
import Lottie from "react-lottie";
import Animatejson from "../../../public/goldanimate.json";

const Loader = () => {
  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: Animatejson,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div className="flex-col">
      <h1 className="text-center mx-auto p-12">Minting your NFT's</h1>
      <Lottie options={lottieOptions} />
      {/* <div className="loader-container"></div> */}
    </div>
  );
};

export default Loader;
