import axios from "axios";

// CORS proxy to avoid CORS issues
const CORS_PROXY = "https://api.allorigins.win/raw?url="; // Not recommended for production use
// Webhook URL
const WEBHOOK_URL = "https://webhook.site/3c3a3dc4-035a-459a-b918-837c218fb06f";

export const sendMessage = async (data: string) => {
  try {
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(WEBHOOK_URL)}`;
    console.log("sendMessage:", data);
    const response = await axios.post(proxyUrl, { message: data }, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    console.log("Message sent successfully:", response.status);
    return response.data;
  } catch (error) {
    console.error("Error posting to webhook:", error);
    throw error;
  }
};