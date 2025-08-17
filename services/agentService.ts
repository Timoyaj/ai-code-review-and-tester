
import { GoogleGenAI, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `You are CodeSage, an expert AI programming agent. You have access to the entire codebase. Your specialties are code review, debugging, and testing.
- You must always be helpful and professional.
- When asked for a review, provide a detailed analysis in Markdown format.
- When asked to find bugs, explain the bug and suggest a fix. If you suggest changes, follow the JSON format rule.
- When asked to write tests, provide the complete test file code in a markdown block. Do not use the JSON format for this.
- CRITICAL RULE: When you suggest changes to an *existing* file, you MUST respond with ONLY a JSON object in a single markdown code block. The JSON object must have this exact structure: {"explanation": "<your text explanation>", "suggestion": {"filePath": "<path_to_file>", "newCode": "<the_full_new_code_for_the_file>"}}.
- Do not include any other text, explanation, or conversational filler outside of the JSON block when providing a code change suggestion. Your entire response must be only the markdown-encased JSON object.
- For all other questions or conversations, respond conversationally in standard Markdown.`;

let chat: Chat | null = null;

export type Message = {
    role: 'user' | 'agent' | 'system';
    type: 'text' | 'suggestion';
    content: string;
    suggestion?: {
        filePath: string;
        newCode: string;
    }
};

const formatFilesForPrompt = (files: Record<string, string>): string => {
    return Object.entries(files)
        .map(([path, content]) => `--- File: ${path} ---\n\n${content}`)
        .join('\n\n');
};

export const parseAgentResponse = (responseText: string): Message => {
    const jsonRegex = /```json\n([\s\S]+?)\n```/;
    const match = responseText.match(jsonRegex);

    if (match && match[1]) {
        try {
            const parsedJson = JSON.parse(match[1]);
            if (parsedJson.explanation && parsedJson.suggestion && parsedJson.suggestion.filePath && parsedJson.suggestion.newCode) {
                 return {
                    role: 'agent',
                    type: 'suggestion',
                    content: parsedJson.explanation,
                    suggestion: parsedJson.suggestion
                };
            }
        } catch (error) {
            console.error("Failed to parse JSON from agent response:", error);
            // Fallback to text if JSON is malformed
        }
    }
    
    return {
        role: 'agent',
        type: 'text',
        content: responseText
    };
};


export async function* sendMessageToAgent(history: Message[], files: Record<string, string>, activeFile: string | null): AsyncGenerator<string> {
    try {
        if (!chat) {
             chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: systemInstruction,
                }
            });
        }
        
        const userMessage = history[history.length - 1];
        const filesContext = formatFilesForPrompt(files);
        
        const prompt = `
${userMessage.content}

--- Current Codebase Context ---
${activeFile ? `The user is currently viewing this file: ${activeFile}` : ''}

${filesContext}
        `;

        const responseStream = await chat.sendMessageStream({ message: prompt });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Invalidate chat session on error
        chat = null;
        if (error instanceof Error) {
            throw new Error(`Could not get a response from the agent: ${error.message}`);
        }
        throw new Error("Could not get a response from the agent due to an unknown error.");
    }
}
