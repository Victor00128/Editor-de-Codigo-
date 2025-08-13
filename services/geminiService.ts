
import { GoogleGenAI } from "@google/genai";

// In a real environment, the @google/genai package would be installed.
// The API key must be provided as an environment variable `process.env.API_KEY`.

/**
 * Uses the Gemini API to generate an explanation for a given code snippet.
 * @param code The code snippet to explain.
 * @returns A promise that resolves to the AI-generated explanation.
 */
export const explainCode = async (code: string): Promise<string> => {
  // This check simulates a real environment where the API key is required.
  // The UI will handle this gracefully.
  if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Returning mock response.");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          `## Mock AI Response\n\n**API Key Not Found.** In a real application, this panel would provide an AI-powered explanation of your code. To enable this, set the \`API_KEY\` environment variable.\n\nThe selected code appears to be:\n\`\`\`\n${code}\n\`\`\`\n\nThis feature helps in understanding complex logic, identifying potential issues, or learning new patterns.`
        );
      }, 1000);
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Explain the following code snippet concisely for a professional developer. Focus on its purpose, logic, and potential improvements. Format the output in Markdown:\n\n\`\`\`\n${code}\n\`\`\``,
        config: {
            temperature: 0.3,
            topP: 0.9,
            thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster response
        }
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `Error interacting with the AI service: ${error.message}`;
    }
    return "An unknown error occurred while contacting the AI service.";
  }
};
