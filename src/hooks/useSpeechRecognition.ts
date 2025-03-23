import { useEffect, useState, useCallback, useRef } from "react";

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
    isFinal?: boolean;
    length: number;
  };
}

// Define SpeechRecognition as an interface, not as a class
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: any) => void;
}

// For the constructor
interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

// Augment Window interface
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const useSpeechRecognition = () => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize recognition only once
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        // Using a more generic language code that's widely supported
        recognition.lang = "th-TH";
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          const currentTranscript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join("");
          setTranscript(currentTranscript);
          setError(null);
        };

        recognition.onend = () => {
          // Only restart if still in listening mode
          if (isListening) {
            try {
              recognition.start();
            } catch (error) {
              console.error("Recognition error on restart:", error);
              setError("Error restarting recognition");
              setIsListening(false);
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setError(`Recognition error: ${event.error}`);

          // Don't set isListening to false for 'no-speech' errors to allow continued listening
          if (event.error !== "no-speech") {
            setIsListening(false);
          }
        };

        recognitionRef.current = recognition;
      } else {
        setIsSupported(false);
        setError("Speech recognition not supported in this browser");
      }
    }

    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  // This effect has a dependency on isListening which could cause issues
  // with the closure over recognition.onend
  useEffect(() => {
    // Update the onend handler whenever isListening changes
    if (recognitionRef.current) {
      const recognition = recognitionRef.current;
      recognition.onend = () => {
        if (isListening) {
          try {
            recognition.start();
          } catch (error) {
            console.error("Recognition error on restart:", error);
            setError("Error restarting recognition");
            setIsListening(false);
          }
        }
      };
    }
  }, [isListening]);

  // Handle changes to isListening state
  useEffect(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Failed to start speech recognition:", error);
        setError("Failed to start speech recognition");
        setIsListening(false);
      }
    } else {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Failed to stop speech recognition:", error);
        setError("Failed to stop speech recognition");
      }
    }
  }, [isListening]);

  const startListening = useCallback(() => {
    if (!isListening) {
      setTranscript(""); // Clear previous transcript when starting new session
      setError(null);
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (isListening) {
      setIsListening(false);
    }
  }, [isListening]);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    isSupported,
    error,
  };
};

export default useSpeechRecognition;
