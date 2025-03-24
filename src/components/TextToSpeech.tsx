import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  IconButton,
  Paper,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import SettingsIcon from "@mui/icons-material/Settings";
import { getMessage } from "api/messageApi";
import useSpeechSynthesis from "../hooks/useSpeechSynthesis"; // Import custom hook

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState<string>("");
  const [result, setResult] = useState<any | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const {
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
  } = useSpeechSynthesis(); // Use custom hook

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const data = await getMessage();
        console.log("Message received:", data);
        if (isMounted && data !== null && data !== undefined) {
          setResult(data);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error fetching result:", error);
        return false;
      }
    };

    const interval = setInterval(async () => {
      const hasData = await fetchData();
      if (hasData) {
        clearInterval(interval);
      }
    }, 3000); // ลดเวลา polling เป็น 3 วินาที

    // เรียกครั้งแรกทันที
    fetchData();

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (result) {
      console.log("New result received:", result);
      setText(result);
      
      // รอให้ voices โหลดเสร็จก่อน
      setTimeout(() => {
        if (!isSpeaking && voices.length > 0) {
          console.log("Auto speaking result");
          speak(result);
        }
      }, 100);
    }
  }, [result, voices.length]);

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  if (voices.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, my: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Text to Speech
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          {result ? result : "กำลังรอผลลัพธ์..."}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          {!isSpeaking ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => speak(result)}
              disabled={!text.trim() || voices.length === 0}
              startIcon={<VolumeUpIcon />}
            >
              อ่านข้อความ
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={resume}
                  startIcon={<PlayArrowIcon />}
                >
                  เล่นต่อ
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={pause}
                  startIcon={<PauseIcon />}
                >
                  หยุดชั่วคราว
                </Button>
              )}
              <Button
                variant="outlined"
                color="error"
                onClick={stop}
                startIcon={<StopIcon />}
              >
                หยุด
              </Button>
            </>
          )}
        </Box>

        <Tooltip title="การตั้งค่าเสียง">
          <IconButton onClick={toggleSettings} color="primary">
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {showSettings && (
        <Box sx={{ mt: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            การตั้งค่าเสียง
          </Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel id="voice-select-label">เสียง</InputLabel>
            <Select
              labelId="voice-select-label"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value as string)}
              label="เสียง"
            >
              {voices.map((voice) => (
                <MenuItem key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>ความเร็ว: {rate.toFixed(1)}</Typography>
            <Slider
              value={rate}
              onChange={(_, newValue) => setRate(newValue as number)}
              min={0.5}
              max={2}
              step={0.1}
              valueLabelDisplay="auto"
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>ระดับเสียง: {pitch.toFixed(1)}</Typography>
            <Slider
              value={pitch}
              onChange={(_, newValue) => setPitch(newValue as number)}
              min={0.5}
              max={2}
              step={0.1}
              valueLabelDisplay="auto"
            />
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default TextToSpeech;
