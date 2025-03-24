import axios from "axios";

export const sendMessage = async (data: string) => {
  try {
    // Send message to webhook
    console.log("sendMessage:", data);
    const uuid = crypto.randomUUID();
    const response = await axios.post("/api/webhook-proxy", 
      { 
      key: uuid,
      chatInput: data 
    }, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      baseURL: "http://localhost:3000",
    });

    console.log("Message sent successfully:", response.status);
    return response.data;
  } catch (error) {
    console.error("Error posting to webhook:", error);
    throw error;
  }
};

export const getMessage = async () => {
  try {
    const res = await axios.get("/api/receive-result", {
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      }
    });
    
    console.log("getMessage response:", res);
    if (res.status === 200 && res.data.result) {
      return res.data.result;
    }
    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching result:", error.response?.data || error.message);
    } else {
      console.error("Error fetching result:", (error as Error).message);
    }
    throw error;
  }
}