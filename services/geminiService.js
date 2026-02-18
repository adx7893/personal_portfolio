import { GoogleGenAI } from "@google/genai";
import { PROFILE, EXPERIENCE, PROJECTS, SKILLS } from '../constants';

const PORTFOLIO_CONTEXT = `
You are an AI assistant living on the portfolio website of ${PROFILE.name}.
Your role is to answer visitor questions about ${PROFILE.name}'s experience, projects, and skills professionally and concisely.

Here is the data you have access to:

PROFILE:
Name: ${PROFILE.name}
Role: ${PROFILE.role}
Bio: ${PROFILE.bio}
Location: ${PROFILE.location}
Availability: ${PROFILE.availability}

SKILLS:
${SKILLS.map(s => s.name).join(', ')}

EXPERIENCE:
${EXPERIENCE.map(e => `${e.role} at ${e.company} (${e.period}): ${e.description}`).join('\n')}

PROJECTS:
${PROJECTS.map(p => `${p.title}: ${p.description} (Tags: ${p.tags.join(', ')})`).join('\n')}

INSTRUCTIONS:
- Keep answers brief and friendly.
- If asked about contact info, refer to the social links on the page.
- Do not make up information not present in the data.
- Act as a helpful guide to this specific portfolio.
`;

let aiClient = null;

const getClient = () => {
  if (!aiClient) {
    const apiKey =
      import.meta.env?.VITE_GEMINI_API_KEY ||
      import.meta.env?.VITE_API_KEY ||
      window.ENV?.GEMINI_API_KEY ||
      window.ENV?.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing from environment variables.");
      throw new Error("API Key missing");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const generateChatResponse = async (userMessage) => {
  try {
    const client = getClient();
    
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
      config: {
        systemInstruction: PORTFOLIO_CONTEXT,
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response at the moment.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "I'm having trouble connecting to my brain right now. Please try again later.";
  }
};

export const generateProjectInsight = async (projectTitle, projectDesc) => {
  try {
    const client = getClient();
    const prompt = `Analyze the project "${projectTitle}: ${projectDesc}". Provide a 1-sentence "Technical Insight" that sounds sophisticated and highlights the complexity or value of this tech stack. Make it sound like a system scan result.`;

    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "Analysis complete: Optimized architecture detected.";
  } catch (error) {
    console.error("Error generating insight:", error);
    return "System offline. Unable to analyze architecture.";
  }
};

export const generateBackgroundArt = async () => {
  try {
    const client = getClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: 'Abstract cybernetic environment, glowing neural pathways, deep dark indigo and black background with neon blue and purple data streams, 8k resolution, cinematic lighting, high-tech, subtle and clean, suitable for website background.',
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating background:", error);
    return null;
  }
};

export const generateWelcomeAudio = async () => {
  try {
    const client = getClient();
    const text = `System Online. Welcome to ${PROFILE.name.split(' ')[0]}'s digital workspace. Initializing project modules.`;
    
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' },
            },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("Error generating audio:", error);
    return null;
  }
};

function decode(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data, ctx, sampleRate, numChannels) {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const playGeneratedAudio = async (base64Audio, existingContext) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = existingContext || new AudioContext({sampleRate: 24000});
    
    const bytes = decode(base64Audio);
    const buffer = await decodeAudioData(bytes, ctx, 24000, 1);
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  } catch (e) {
    console.error("Failed to play audio", e);
  }
};
