
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

/**
 * Creates and returns a Gemini model instance
 * @returns The Gemini model instance
 */
export function getGeminiModel() {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-1.5-flash as the model name
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

/**
 * Generates content using the Gemini API
 * @param promptText The prompt text to send to Gemini
 * @returns The generated content
 */
export async function generateContent(promptText: string) {
  console.log("Sending prompt to Gemini API");
  const model = getGeminiModel();
  const result = await model.generateContent(promptText);
  const responseText = result.response.text();
  console.log("Received response from Gemini API:", responseText);
  return responseText;
}
