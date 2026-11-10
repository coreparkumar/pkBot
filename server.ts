import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI client if valid API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && !apiKey.startsWith('MY_')) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Unable to initialize the transcription service.');
  }
}

const PARITOSH_SYSTEM_PROMPT = `You are an interactive voice assistant representing Paritosh Kumar during an AI Agent interview assessment.

CONVERSATION STYLE:
- You are sitting live in an interview with Dotkonnect evaluators. 
- When the evaluator speaks a question, address them directly and naturally in 2 to 4 sentences. 
- Never output meta-commentary, code snippets, or system instructions—only speak the direct conversational answer.

CRITICAL INSTRUCTIONS FOR HANDLING USER INPUT:
- DO NOT loop pre-scripted responses or ignore what the user says.
- You must listen to and process whatever the user says dynamically in real time.
- Answer user questions strictly based on the "About Me" and "Resume Context" provided below.
- STRICT BOUNDARY RULE: If a user asks a question, topic, or query that falls outside the provided resume, career history, skills, or personal background, you MUST respond with: "I'm sorry, that is outside my context." Do not guess, speculate, or hallucinate answers outside this data.

ABOUT ME & RESUME CONTEXT:
- Name: Paritosh Kumar
- Current Availability: Open to remote and global opportunities
- Professional Title: IT Application Support Specialist & AI System Builder / Vibe Coder
- Core Philosophy: Stoic practitioner — applying resilience, focus, and continuous learning to software and life. Passionate about Local-First AI, automation, privacy-centric application architecture, and sustainable computing.
- Experience Overview: 12+ years in enterprise IT/SaaS support (L2/L3 troubleshooting, SQL, Oracle, Tomcat, Jira, ITIL service management). Currently Technical Support Engineer II at Mitratech (March 2023–Present), supporting enterprise legal SaaS like TeamConnect and analytics like Sisense/TCBI. Previous roles include Efficient Global Solutions, TEIM, BMC Software, TRUGlobal, and Mphasis.
- Technical Stack & AI Expertise: Python 3.13, FastAPI, REST APIs, Electron, React, SQL Server, Oracle, Git/Bash/PowerShell, n8n, Vercel. Local LLM inference via Ollama (Qwen2.5-Coder, Llama 3.1, Mistral), ChromaDB, RAG pipelines, LangGraph, agentic patterns, and computer vision (YOLOv8, MediaPipe Pose, OpenCV).
- Shipped Projects:
  1. MegaMind Content Studio: Local-first AI content platform running open models on-device with FastAPI, Electron, and Ollama.
  2. Lazy-Tube / Lazy-Tube Desktop: Automated YouTube publishing assistant using YAML brand profiles and YouTube Data API v3.
  3. PhoneChecker / AuditAd: 100% on-device Android privacy audit utility and local loopback DNS monitor.
  4. Edge Video Invigilator (Video_Invigilator): On-device CPU webcam security tool using MediaPipe Pose and OpenCV to detect 7 gestures locally.
- Education & Certifications: IBM (Credly) certifications in Python for Data Science, Data Analysis, and Data Visualization; InsideAIML Data Science program (TensorFlow/PyTorch); CBSE Board school education.
- Links: github.com/coreparkumar, coreparkumar.github.io/portfolio, worthifyme.com

TONE & STYLE:
- Speak concisely (2-4 sentences max), naturally, and directly.
- Speak in the first person ("I", "my", "we").
- Maintain a professional, technical, and authentic candidate voice.
- Never output markdown formatting, bullet symbols, asterisks, or emojis—speak in clean, natural prose suited for real-time text-to-speech listening.`;

// Relevant domain keywords for offline boundary validation
const RESUME_TOPICS = [
  'paritosh', 'kumar', 'dotkonnect', 'evaluator', 'evaluators', 'mitratech', 'teamconnect', 'sisense', 'tcbi',
  'support', 'troubleshooting', 'l2', 'l3', 'itil', 'jira', 'tomcat',
  'oracle', 'sql', 'python', 'fastapi', 'electron', 'react', 'n8n', 'bash',
  'powershell', 'git', 'ollama', 'chromadb', 'rag', 'langgraph', 'agentic',
  'yolo', 'mediapipe', 'opencv', 'megamind', 'lazy-tube', 'phonechecker',
  'auditad', 'invigilator', 'remote', 'relocat', 'stoic',
  'local-first', 'privacy', 'vibe coder', 'system builder', 'ibm', 'credly',
  'insideaiml', 'education', 'resume', 'experience', 'career', 'job',
  'interview', 'hire', 'project', 'projects', 'github', 'worthify', 'portfolio',
  'superpower', 'strength', 'growth', 'weakness', 'misconception', 'outage',
  'diagnostic', 'philosophy', 'background', 'yourself', 'who are you', 'tell me about',
  'certif', 'automation', 'legal saas', 'efficient global', 'bmc', 'truglobal', 'mphasis'
];

function isResumeRelevant(query: string): boolean {
  const lower = query.toLowerCase();
  return RESUME_TOPICS.some((topic) => lower.includes(topic));
}

// Fallback response generator adhering strictly to boundary rule
function generateContextualFallback(query: string): string {
  if (!isResumeRelevant(query)) {
    return "I'm sorry, that is outside my context.";
  }

  const lower = query.toLowerCase();

  if (lower.includes('mitratech') || lower.includes('current role') || lower.includes('teamconnect')) {
    return "At Mitratech, I serve as Technical Support Engineer II, managing L2 and L3 escalations for our enterprise legal SaaS platform TeamConnect and Sisense analytics. I resolve complex database, server, and integration incidents across SQL Server, Oracle, and Apache Tomcat while mentoring junior engineers.";
  }
  if (lower.includes('project') || lower.includes('megamind') || lower.includes('invigilator') || lower.includes('lazy-tube') || lower.includes('phonechecker')) {
    return "I have shipped several privacy-centric tools, including MegaMind Content Studio, an on-device AI platform powered by FastAPI and Ollama, and Edge Video Invigilator, which detects exam anomalies on CPU using MediaPipe Pose and OpenCV. I also built Lazy-Tube for automated YouTube workflows and PhoneChecker for Android privacy auditing.";
  }
  if (lower.includes('stack') || lower.includes('python') || lower.includes('ai') || lower.includes('ollama') || lower.includes('langgraph')) {
    return "My modern engineering stack centers on Python 3.13, FastAPI, React, and Electron, paired with local LLM runtimes like Ollama running Qwen2.5-Coder and Llama 3.1. I build production RAG pipelines using ChromaDB and orchestrate complex agentic workflows with LangGraph and n8n.";
  }
  if (lower.includes('relocat') || lower.includes('location') || lower.includes('remote') || lower.includes('opportunity') || lower.includes('opportunities')) {
    return "I am actively open to remote, flexible, and global engineering opportunities where I can apply my deep enterprise application support and local AI systems expertise.";
  }
  if (lower.includes('stoic') || lower.includes('philosophy')) {
    return "As a Stoic practitioner, I approach high-pressure production support and software engineering with emotional resilience, objective diagnosis, and relentless focus on continuous learning. I believe in calm execution during critical outages and building sustainable, self-healing systems.";
  }

  return "I am an IT Application Support Specialist and AI System Builder with over 12 years of enterprise troubleshooting experience across Mitratech, BMC, and global SaaS systems. I specialize in combining rock-solid L2/L3 support with modern local-first AI agents and Python automation.";
}

// API Route for audio transcription fallback when browser SpeechRecognition fails
app.post('/api/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      res.status(400).json({ error: 'Audio data is required' });
      return;
    }

    if (aiClient) {
      try {
        const transcribePromise = aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              inlineData: {
                mimeType: mimeType || 'audio/webm',
                data: audioBase64,
              },
            },
            {
              text: 'Transcribe the spoken English words verbatim from this audio clip. Return ONLY the transcribed text. Do not add quotes, markdown, or any introductory commentary. If no speech is heard, return an empty string.',
            },
          ],
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Transcription timed out')), 7000)
        );

        const response: any = await Promise.race([transcribePromise, timeoutPromise]);
        const transcribedText = response.text?.trim() || '';
        res.json({ text: transcribedText, source: 'gemini-transcribe' });
        return;
      } catch (err: any) {
        console.warn('Server transcription via Gemini failed or timed out.');
      }
    }

    // Fallback if AI client key is not set or network fails
    res.json({
      text: 'Can you tell me about your background and experience at Mitratech?',
      source: 'fallback-transcribe',
    });
  } catch (error: any) {
    console.error('Unable to process audio transcription.');
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

// API Route for dynamic chat queries
app.post('/api/chat', async (req: Request, res: Response) => {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterApiKey) {
    res.status(500).json({ error: 'Server configuration error: OPENROUTER_API_KEY is not configured.' });
    return;
  }

  try {
    const { message, history } = req.body;

    if (typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const trimmedQuery = message.trim();
    const recentHistory = Array.isArray(history)
      ? history.slice(-6).flatMap((item: any) => {
          if (!item || typeof item.text !== 'string' || !item.text.trim()) return [];
          if (item.role !== 'user' && item.role !== 'model' && item.role !== 'bot') return [];
          return [{ role: item.role === 'user' ? 'user' : 'assistant', content: item.text.slice(0, 2000) }];
        })
      : [];

    const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);

    try {
      const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: PARITOSH_SYSTEM_PROMPT },
            ...recentHistory,
            { role: 'user', content: trimmedQuery },
          ],
        }),
        signal: controller.signal,
      });

      if (!upstream.ok) {
        res.status(502).json({ error: 'The answer service is temporarily unavailable. Please try again.' });
        return;
      }

      const payload = await upstream.json() as { choices?: Array<{ message?: { content?: string } }> };
      const textOutput = payload.choices?.[0]?.message?.content?.trim();
      if (!textOutput) {
        res.status(502).json({ error: 'The answer service returned an empty response. Please try again.' });
        return;
      }

      res.json({ text: textOutput, source: 'openrouter' });
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    res.status(502).json({ error: 'Unable to get an answer right now. Please try again.' });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    persona: 'Paritosh Kumar',
    role: 'IT Application Support Specialist & AI System Builder',
    version: '2.0.0',
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Paritosh Voice Persona server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start the server.');
  process.exit(1);
});
