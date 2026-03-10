
// DO NOT import GoogleGenerativeAI
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { Feature, Language, ChatMessage } from '../types';

interface GetResponseParams {
    feature: Feature;
    language: Language;
    systemInstruction: string;
    conversation: ChatMessage[];
    image?: {
        base64: string;
        mimeType: string;
    };
}

// Helper to create AI instance per call to ensure latest API key is used as per guidelines
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a response from the Gemini model based on the conversation context and optional image.
 * Uses gemini-3-pro-preview for complex reasoning tasks.
 */
export async function getKrishimitraResponse({
    language,
    systemInstruction,
    conversation,
    image,
}: GetResponseParams): Promise<string> {
    const ai = getAI();
    
    const contents = conversation.map((msg, index) => {
        const parts: any[] = [];
        // Attach image to the last part if provided
        if (index === conversation.length - 1 && image) {
            parts.push({
                inlineData: {
                    data: image.base64,
                    mimeType: image.mimeType,
                }
            });
        }
        if (msg.text) {
           parts.push({ text: msg.text });
        }
        return {
            role: msg.role,
            parts: parts,
        };
    });
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: contents,
            config: {
                systemInstruction: `${systemInstruction} \n The user's preferred language is ${language}. Respond ONLY in this language. Crucially, speak in a simple, voice-friendly manner as this text will be read aloud.`,
                // thinkingBudget used with gemini-3 series model
                thinkingConfig: { thinkingBudget: 4000 }
            }
        });
        
        // Use .text getter directly
        return response.text || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
        console.error("Gemini API call failed:", error);
        return "Sorry, I encountered an error. Please try again.";
    }
}

/**
 * Generates text-to-speech audio bytes from text input.
 */
export async function generateKrishimitraSpeech(text: string, language: Language): Promise<string | undefined> {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Read this clearly and naturally in ${language === Language.TE ? 'Telugu' : language === Language.HI ? 'Hindi' : 'English'}: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { 
                            voiceName: 'Kore' 
                        },
                    },
                },
            },
        });

        // Extract PCM audio bytes from inlineData
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (error) {
        console.error("Speech generation failed:", error);
        return undefined;
    }
}

/**
 * Identifies location name from coordinates using a lightweight model.
 */
export async function getLocationFromCoordinates(lat: number, lon: number): Promise<string> {
    const ai = getAI();
    const prompt = `Based on these coordinates, identify the village, district, and state. Respond with only the name. Latitude: ${lat}, Longitude: ${lon}.`;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { systemInstruction: "Provide only the location name." }
        });
        return response.text?.trim() || "an unknown location";
    } catch (error) {
        return "an unknown location";
    }
}
