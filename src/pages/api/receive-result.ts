import { NextApiRequest, NextApiResponse } from "next";

let messageOutput: string | null = null;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { content } = req.body;
      console.log("Received content:", content);
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }
      
      messageOutput = content;
      return res.status(201).json({ message: "Success", content });
    } catch (error) {
      console.error('Error saving message:', error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else if(req.method === "GET") {
    try {
        if (!messageOutput) {
            return res.status(204).end();
        }
        console.log("Output latest result:", messageOutput);
        return res.status(200).json({ result: messageOutput});
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
  }
  return res.status(405).json({ message: "Method not allowed" });
}