import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL_TEXT } from "../constants";

// Initialize the API client. 
// Note: In a real production app, ensure your key is restricted or proxied through a backend.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeInquiry = async (message: string, context: string = '') => {
  if (!process.env.API_KEY) {
    return {
      summary: "API Key missing. Cannot generate summary.",
      suggestedReply: "Please configure your Google Gemini API Key."
    };
  }

  try {
    const prompt = `
      You are an expert consultancy assistant. Analyze the following client inquiry.
      
      Client Message: "${message}"
      ${context ? `Context: ${context}` : ''}

      Please provide:
      1. A brief summary of their need (max 1 sentence).
      2. A sentiment analysis (Positive, Neutral, Urgent, etc.).
      3. A suggested professional reply draft.

      Return the response in strictly valid JSON format with keys: "summary", "sentiment", "suggestedReply".
      Do not use markdown code blocks. Just the JSON string.
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "Error analyzing message.",
      sentiment: "Unknown",
      suggestedReply: "Could not generate reply due to an error."
    };
  }
};
