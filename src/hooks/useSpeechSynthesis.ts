import { useState, useEffect, useRef } from "react";

interface Voice {
  name: string;
  lang: string;
  voiceURI: string;
}

const useSpeechSynthesis = () => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthRef.current = window.speechSynthesis;
  
      const loadVoices = () => {
        console.log("Loading voices...");
        const availableVoices = speechSynthRef.current?.getVoices() || [];
        console.log("Available voices:", availableVoices);
  
        const voiceList = availableVoices
          .filter((voice) => voice.lang.includes("th") || voice.lang.includes("en"))
          .map((voice) => ({
            name: voice.name,
            lang: voice.lang,
            voiceURI: voice.voiceURI,
          }));
  
        setVoices(voiceList);
        console.log("Filtered voices:", voiceList);
  
        // เลือกเสียงไทยอัตโนมัติ
        const thVoice = voiceList.find((v) => v.lang.includes("th"));
        if (thVoice) {
          setSelectedVoice(thVoice.voiceURI);
          console.log("Selected Thai voice:", thVoice);
        } else if (voiceList.length > 0) {
          setSelectedVoice(voiceList[0].voiceURI);
          console.log("Selected default voice:", voiceList[0]);
        }
      };
  
      loadVoices(); // เรียกครั้งแรก
      speechSynthRef.current?.addEventListener("voiceschanged", loadVoices);
  
      return () => {
        speechSynthRef.current?.removeEventListener("voiceschanged", loadVoices);
      };
    }
  }, []);

  useEffect(() => {
    const handleEnd = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    if (utteranceRef.current) {
      utteranceRef.current.onend = handleEnd;
    }

    return () => {
      if (utteranceRef.current) {
        utteranceRef.current.onend = null;
      }
    };
  }, [utteranceRef.current]);

  const speak = (textToSpeak: string) => {
    console.log("Speaking text:", textToSpeak);
    if (!textToSpeak?.trim() || !speechSynthRef.current) {
      console.log("Cannot speak: empty text or no synthesis");
      return;
    }
  
    try {
      stop();
  
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      const voices = speechSynthRef.current.getVoices();
      const thVoice = voices.find(voice => voice.lang.includes('th'));
      if (thVoice) {
        utterance.voice = thVoice;
      }
  
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1;
  
      utterance.onstart = () => {
        console.log("Speech started");
        setIsSpeaking(true);
      };
  
      utterance.onend = () => {
        console.log("Speech ended");
        setIsSpeaking(false);
        setIsPaused(false);
      };
  
      utterance.onerror = (event) => {
        console.error("Speech error:", event);
        setIsSpeaking(false);
        setIsPaused(false);
      };
  
      utteranceRef.current = utterance;
      speechSynthRef.current.speak(utterance);
    } catch (error) {
      console.error("Error in speak function:", error);
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const pause = () => {
    if (speechSynthRef.current && isSpeaking) {
      speechSynthRef.current.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (speechSynthRef.current && isPaused) {
      speechSynthRef.current.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  return {
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    pitch,
    setPitch,
    isSpeaking,
    isPaused,
    speak,
    pause,
    resume,
    stop,
  };
};

export default useSpeechSynthesis;
