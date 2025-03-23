import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Grid,
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

interface Voice {
  name: string;
  lang: string;
  voiceURI: string;
}

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState<string>("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // โหลดรายการเสียง
  useEffect(() => {
    speechSynthRef.current = window.speechSynthesis;

    const loadVoices = () => {
      const availableVoices = speechSynthRef.current?.getVoices() || [];

      const voiceList = availableVoices
        .filter(
          (voice) => voice.lang.includes("th") || voice.lang.includes("en")
        ) // กรองเฉพาะเสียงภาษาไทยและอังกฤษ
        .map((voice) => ({
          name: voice.name,
          lang: voice.lang,
          voiceURI: voice.voiceURI,
        }));

      setVoices(voiceList);

      // เลือกเสียงไทยเป็นค่าเริ่มต้นถ้ามี
      const thVoice = voiceList.find((v) => v.lang.includes("th"));
      if (thVoice) {
        setSelectedVoice(thVoice.voiceURI);
      } else if (voiceList.length > 0) {
        setSelectedVoice(voiceList[0].voiceURI);
      }

      setIsLoading(false);
    };

    // ตรวจสอบว่ามีเสียงพร้อมใช้งานหรือไม่
    if (speechSynthRef.current?.getVoices()?.length) {
      loadVoices();
    }

    // รอให้เสียงโหลดเสร็จ
    speechSynthRef.current?.addEventListener("voiceschanged", loadVoices);

    return () => {
      speechSynthRef.current?.removeEventListener("voiceschanged", loadVoices);
      if (isSpeaking) {
        speechSynthRef.current?.cancel();
      }
    };
  }, []);

  // จัดการสิ้นสุดการพูด
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

  const speak = () => {
    if (!text.trim() || !speechSynthRef.current) return;

    // หยุดการพูดปัจจุบัน (ถ้ามี)
    speechSynthRef.current.cancel();

    // สร้าง utterance ใหม่
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // ตั้งค่าเสียง
    if (selectedVoice) {
      const voice = speechSynthRef.current
        .getVoices()
        .find((v) => v.voiceURI === selectedVoice);
      if (voice) {
        utterance.voice = voice;
      }
    }

    // ตั้งค่าความเร็วและระดับเสียง
    utterance.rate = rate;
    utterance.pitch = pitch;

    // เริ่มพูด
    setIsSpeaking(true);
    setIsPaused(false);
    speechSynthRef.current.speak(utterance);

    // เพิ่ม event listener สำหรับการสิ้นสุดการพูด
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
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

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  if (isLoading) {
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
        <Typography variant="body2" color="text.secondary" gutterBottom>
          พิมพ์ข้อความที่ต้องการอ่านออกเสียง
        </Typography>
      </Box>

      <TextField
        fullWidth
        multiline
        rows={4}
        label="ข้อความที่ต้องการอ่านออกเสียง"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="พิมพ์ข้อความที่นี่..."
        variant="outlined"
        sx={{ mb: 2 }}
      />

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
              onClick={speak}
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
