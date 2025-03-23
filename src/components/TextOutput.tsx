import React, { useState } from "react";
import { Typography, Paper, Button, CircularProgress } from "@mui/material";

interface TextOutputProps {
  text: string;
  onSend?: () => void;
  isSending?: boolean;
}

const TextOutput: React.FC<TextOutputProps> = (prop) => {
  const { text, onSend, isSending} = prop;
  return (
    <div style={{ width: "100%", maxWidth: "100vw" }}>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mt: 1,
          mb: 2,
          backgroundColor: "#f5f5f5",
          minHeight: "100px",
          maxHeight: "300px",
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >
        <Typography variant="body1" component="p">
          {text || "Your transcribed text will appear here..."}
        </Typography>
        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={onSend}
            disabled={!text.trim() || isSending}
            sx={{ mt: 1 }}
          >
            {isSending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </Paper>
    </div>
  );
};

export default TextOutput;
