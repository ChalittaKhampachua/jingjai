"use client";
import React, { useEffect, useState } from "react";
import { Button, Box, Typography, Alert } from "@mui/material";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import TextOutput from "./TextOutput";
import AnimatedVoice from "./AnimatedVoice";
import { sendMessage } from "api/messageApi";

const SpeechRecognition: React.FC = () => {
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    isSupported,
    error,
  } = useSpeechRecognition();
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleOnSendMessage = () => {
    stopListening();
    setIsSending(true);
    // Send the transcribed text to the server
    sendMessage(transcript)
      .then((response) => {
        console.log("Message sent successfully[page]:", response);
        setIsSending(false);
      })
      .catch((error) => {
        console.error("Error sending message:", error);
        setIsSending(false);
      });
  };


  useEffect(() => {
    if (isListening) {
      setIsRecording(true);
    } else {
      setIsRecording(false);
    }
  }, [isListening]);

  const handleRecordButtonClick = () => {
    if (isRecording) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <Box sx={{ textAlign: "center", my: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Speech recognition is not supported in your browser. Please try using
          Chrome, Edge, or Safari for the best experience.
        </Alert>
        <Typography variant="body1">
          This feature requires a modern browser with Web Speech API support.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      {error && error !== "no-speech" && (
        <Alert severity="warning" sx={{ width: "100%", mb: 2 }}>
          {error}
        </Alert>
      )}

      <AnimatedVoice isAnimating={isRecording} />

      <Button
        variant="contained"
        color={isRecording ? "error" : "primary"}
        onClick={handleRecordButtonClick}
        sx={{
          px: 3,
          py: 1.5,
          mt: 1,
          borderRadius: 8,
          fontSize: "1rem",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
          },
        }}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </Button>

      {isRecording && (
        <Typography variant="caption" color="lightGrey" sx={{ mt: 1 }}>
          Speak clearly into your microphone...
        </Typography>
      )}

      <TextOutput
        text={transcript}
        onSend={() => handleOnSendMessage()}
        isSending={isSending}
      />
    </Box>
  );
};

export default SpeechRecognition;
