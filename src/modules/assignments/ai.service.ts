import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../../config/env.js";


const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

export class AIService {
  static async generateQuestions(promptText: string) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const systemInstruction = `
            You are an educational assistant. 
            Convert the following input text or topic into a structured list of questions (MCQ, Code, or Text) for a programming assignment.
            
            OUTPUT FORMAT:
            Strictly return a JSON array of Question objects. Do not include markdown code blocks.
            
            Schema:
            [
              {
                "id": "q1",
                "type": "mcq", // or "code" or "text"
                "text": "Question content here",
                "points": 10,
                // If MCQ
                "options": ["A", "B", "C"],
                "correctOptionIndex": 0,
                // If Code
                "language": "javascript", // or python etc
                "starterCode": "function foo() {}"
              }
            ]

            Ensure questions are relevant to the input topic.

            CRITICAL RULES:
            1. For 'correctOptionIndex', return ONLY a 0-based integer (0, 1, 2, 3).
            2. If the input contains an Answer Key like "a) ... b) ...", map "a" to 0, "b" to 1, "c" to 2, etc.
            3. Do NOT return string values like "a" or "c" or the answer text for 'correctOptionIndex'. It MUST be a number.
            4. If no answer is provided in the input, solve the question yourself and provide the correct index.
            `;

      const result = await model.generateContent([systemInstruction, promptText]);
      const response = result.response;
      const text = response.text();

      // Cleanup: Sometimes Gemini wraps in \`\`\`json ... \`\`\`
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

      return JSON.parse(cleanText);
    } catch (error) {
      console.error("AI Generation Failed:", error);
      throw new Error("Failed to generate questions using AI");
    }
  }
}
