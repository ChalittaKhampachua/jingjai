"use client";
import React from "react";
import dynamic from "next/dynamic";
import animationData from "../../public/animations/voice.json";

interface AnimatedVoiceProps {
  isAnimating: boolean;
}

const Lottie = dynamic(() => import("react-lottie"), { ssr: false });

const AnimatedVoice: React.FC<AnimatedVoiceProps> = ({ isAnimating }) => {
  const defaultOptions = {
    loop: true,
    autoplay: isAnimating,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <Lottie
      options={defaultOptions}
      isStopped={!isAnimating}
      height={300}
      width={300}
    />
  );
};

export default AnimatedVoice;
