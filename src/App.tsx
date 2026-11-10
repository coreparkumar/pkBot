import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BotStatus, TranscriptTurn, PresetQuestion, AudioSettings } from './types';
import { PRESET_QUESTIONS, PARITOSH_PROFILE } from './data/personaData';
import { speechService, VoiceInputMode } from './services/speechService';
import { Header } from './components/Header';
import { PersonaHeaderCard } from './components/PersonaHeaderCard';
import { VoiceCore } from './components/VoiceCore';
import { PresetQuestions } from './components/PresetQuestions';
import { LiveTranscript } from './components/LiveTranscript';
import { AudioSettingsModal } from './components/AudioSettingsModal';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export default function App() {
  const [status, setStatus] = useState<BotStatus>('idle');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [transcripts, setTranscripts] = useState<TranscriptTurn[]>([]);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState<VoiceInputMode>('auto');
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Audio settings state
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    voiceURI: '',
    rate: 1.05,
    pitch: 1.0,
    volume: 1.0,
    autoSpeak: true,
  });

  const simulatedAudioIntervalRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Format current timestamp
  const getFormattedTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Speaks response using speech synthesis with status transitions
  const speakBotResponse = useCallback((text: string) => {
    setStatus('speaking');

    // Start simulated visualizer waves for speaking state
    if (simulatedAudioIntervalRef.current) {
      clearInterval(simulatedAudioIntervalRef.current);
    }
    simulatedAudioIntervalRef.current = window.setInterval(() => {
      setAudioLevel(0.3 + Math.random() * 0.5);
    }, 100);

    speechService.speak(
      text,
      audioSettings,
      () => {
        setStatus('speaking');
      },
      () => {
        setStatus('idle');
        setAudioLevel(0);
        if (simulatedAudioIntervalRef.current) {
          clearInterval(simulatedAudioIntervalRef.current);
          simulatedAudioIntervalRef.current = null;
        }
      },
      (err) => {
        console.warn('Speech playback issue:', err);
        setStatus('idle');
        setAudioLevel(0);
        if (simulatedAudioIntervalRef.current) {
          clearInterval(simulatedAudioIntervalRef.current);
          simulatedAudioIntervalRef.current = null;
        }
      }
    );
  }, [audioSettings]);

  const speakText = useCallback((aiResponse: string) => {
    speakBotResponse(aiResponse);
  }, [speakBotResponse]);

  // Stops any ongoing speech immediately
  const handleStopSpeaking = useCallback(() => {
    speechService.stopSpeaking();
    setStatus('idle');
    setAudioLevel(0);
    if (simulatedAudioIntervalRef.current) {
      clearInterval(simulatedAudioIntervalRef.current);
      simulatedAudioIntervalRef.current = null;
    }
  }, []);

  // Send EXACT transcript text to Gemini API backend
  const callGeminiAPI = useCallback(async (userSpokenText: string): Promise<string> => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userSpokenText,
          history: chatHistory.slice(-6),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      return data.text || "I'm sorry, that is outside my context.";
    } catch (err: any) {
      console.warn('Backend query error, checking boundary for local response:', err);

      // Boundary check for offline fallback
      const lower = userSpokenText.toLowerCase();
      const isRelevant = [
        'paritosh', 'kumar', 'dotkonnect', 'evaluator', 'evaluators', 'mitratech', 'teamconnect', 'sisense', 'support',
        'troubleshoot', 'l2', 'l3', 'python', 'fastapi', 'ollama', 'langgraph',
        'rag', 'chromadb', 'megamind', 'lazy-tube', 'phonechecker', 'auditad',
        'invigilator', 'remote', 'relocat', 'stoic', 'vibe coder',
        'experience', 'resume', 'project', 'background', 'certif', 'stack', 'sql', 'oracle'
      ].some((term) => lower.includes(term));

      if (isRelevant) {
        if (lower.includes('dotkonnect') || lower.includes('evaluator')) {
          return "I am excited to interview with Dotkonnect evaluators. With over 12 years in enterprise L2 and L3 support and my passion for building local AI systems, I look forward to contributing deeply to mission-critical platforms and agile AI operations.";
        }
        return "I am an IT Application Support Specialist and AI System Builder with over 12 years of enterprise troubleshooting experience, currently supporting TeamConnect at Mitratech. I specialize in combining rock-solid L2/L3 support with modern local-first AI agents, Python automation, and Stoic resilience.";
      }

      return "I'm sorry, that is outside my context.";
    }
  }, [chatHistory]);

  // Handles submitting a query (from preset or typed input)
  const handleProcessQuery = useCallback(async (query: string, source: 'voice' | 'preset' | 'text', presetId?: string) => {
    if (!query.trim()) return;

    setErrorMessage(null);
    setInterimTranscript('');

    const userTurn: TranscriptTurn = {
      id: `turn-user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: getFormattedTime(),
      source,
    };

    setChatHistory((prev) => [...prev, { role: 'user', text: query }]);
    setTranscripts((prev) => [...prev, userTurn]);
    setStatus('thinking');

    if (presetId) {
      setActiveQuestionId(presetId);
    }

    const aiResponse = await callGeminiAPI(query);

    const botTurn: TranscriptTurn = {
      id: `turn-bot-${Date.now()}`,
      sender: 'bot',
      text: aiResponse,
      timestamp: getFormattedTime(),
      source: presetId ? 'preset' : source,
    };

    setChatHistory((prev) => [...prev, { role: 'model', text: aiResponse }]);
    setTranscripts((prev) => [...prev, botTurn]);
    speakText(aiResponse);
  }, [callGeminiAPI, speakText]);

  // Handle Preset Question click
  const handleSelectPreset = useCallback((preset: PresetQuestion) => {
    if (status === 'speaking') {
      handleStopSpeaking();
    }
    handleProcessQuery(preset.query, 'preset', preset.id);
  }, [handleProcessQuery, handleStopSpeaking, status]);

  // Voice Input Mode handler
  const handleSetVoiceMode = useCallback((mode: VoiceInputMode) => {
    setVoiceMode(mode);
    speechService.setVoiceInputMode(mode);
    setErrorMessage(null);
    setInfoNotice(
      mode === 'direct-record'
        ? 'Direct Audio mode active (100% immune to browser speech network blocks).'
        : mode === 'webspeech'
        ? 'WebSpeech mode active.'
        : 'Auto Dual-Engine active (uses WebSpeech with instant Direct Audio fallback).'
    );
    setTimeout(() => setInfoNotice(null), 5000);
  }, []);

  // Frontend Speech-to-Text Binding (JavaScript / React Logic)
  const handleToggleListen = useCallback(async () => {
    // If currently listening, tapping means "Done speaking - process audio"
    if (status === 'listening') {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setStatus('thinking');
      setInfoNotice('Transcribing audio...');
      const transcribedText = await speechService.stopListeningAndTranscribe();
      setInfoNotice(null);

      if (transcribedText && transcribedText.trim()) {
        const userSpokenText = transcribedText.trim();
        console.log("User Spoken (Direct Audio):", userSpokenText);

        // 1. Immediately update UI chat state with what you actually said
        setChatHistory((prev) => [...prev, { role: 'user', text: userSpokenText }]);
        const userTurn: TranscriptTurn = {
          id: `turn-user-${Date.now()}`,
          sender: 'user',
          text: userSpokenText,
          timestamp: getFormattedTime(),
          source: 'voice',
        };
        setTranscripts((prev) => [...prev, userTurn]);
        setInterimTranscript('');

        // 2. Send EXACT transcript text to Gemini API backend
        const aiResponse = await callGeminiAPI(userSpokenText);

        // 3. Display and Speak AI Response
        setChatHistory((prev) => [...prev, { role: 'model', text: aiResponse }]);
        const botTurn: TranscriptTurn = {
          id: `turn-bot-${Date.now()}`,
          sender: 'bot',
          text: aiResponse,
          timestamp: getFormattedTime(),
          source: 'voice',
        };
        setTranscripts((prev) => [...prev, botTurn]);
        speakText(aiResponse);
      } else {
        setStatus('idle');
        setAudioLevel(0);
      }
      return;
    }

    if (status === 'speaking') {
      handleStopSpeaking();
    }

    setErrorMessage(null);
    setInterimTranscript('');

    // Setup visualizer analyzer stream
    await speechService.initAudioAnalyzer((level, freqData) => {
      setAudioLevel(level);
      setFrequencyData(freqData);
    });

    const isDirectMode = voiceMode === 'direct-record' || !speechService.isSpeechSupported();

    if (!isDirectMode) {
      try {
        const win = window as any;
        const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognitionRef.current = recognition;

        recognition.onresult = async (event: any) => {
          const userSpokenText = event.results[0][0].transcript;
          console.log("User Spoken:", userSpokenText);

          // 1. Immediately update UI chat state with what you actually said
          setChatHistory((prev) => [...prev, { role: 'user', text: userSpokenText }]);
          const userTurn: TranscriptTurn = {
            id: `turn-user-${Date.now()}`,
            sender: 'user',
            text: userSpokenText,
            timestamp: getFormattedTime(),
            source: 'voice',
          };
          setTranscripts((prev) => [...prev, userTurn]);
          setStatus('thinking');
          speechService.stopAudioAnalyzer();

          // 2. Send EXACT transcript text to Gemini API backend
          const aiResponse = await callGeminiAPI(userSpokenText);

          // 3. Display and Speak AI Response
          setChatHistory((prev) => [...prev, { role: 'model', text: aiResponse }]);
          const botTurn: TranscriptTurn = {
            id: `turn-bot-${Date.now()}`,
            sender: 'bot',
            text: aiResponse,
            timestamp: getFormattedTime(),
            source: 'voice',
          };
          setTranscripts((prev) => [...prev, botTurn]);
          speakText(aiResponse);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          speechService.stopAudioAnalyzer();
          setStatus('idle');
          setAudioLevel(0);
          if (event.error === 'network') {
            setErrorMessage('Network error during browser speech recognition. Automatically switched to Direct Audio Recording mode — tap the microphone again to speak!');
            handleSetVoiceMode('direct-record');
          } else if (event.error === 'not-allowed') {
            setErrorMessage('Microphone access was denied. Please allow microphone permissions.');
          } else if (event.error === 'no-speech') {
            setErrorMessage('No speech detected. Please tap microphone and speak again.');
          } else {
            setErrorMessage(`Speech recognition error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          speechService.stopAudioAnalyzer();
          setStatus((prev) => (prev === 'listening' ? 'idle' : prev));
          setAudioLevel(0);
        };

        recognition.start();
        return;
      } catch (err: any) {
        console.warn('SpeechRecognition failed to start, falling back to direct recording:', err);
      }
    }

    // Direct recording fallback if browser speech recognition is not supported
    const started = await speechService.startListening({
      onStart: () => {
        setStatus('listening');
      },
      onAudioLevel: (level, freqData) => {
        setAudioLevel(level);
        setFrequencyData(freqData);
      },
      onInfoNotice: (notice) => {
        setInfoNotice(notice);
        setTimeout(() => setInfoNotice(null), 5000);
      },
      onFinal: async (finalText) => {
        speechService.stopListening();
        const userSpokenText = finalText;
        console.log("User Spoken:", userSpokenText);

        // 1. Immediately update UI chat state with what you actually said
        setChatHistory((prev) => [...prev, { role: 'user', text: userSpokenText }]);
        const userTurn: TranscriptTurn = {
          id: `turn-user-${Date.now()}`,
          sender: 'user',
          text: userSpokenText,
          timestamp: getFormattedTime(),
          source: 'voice',
        };
        setTranscripts((prev) => [...prev, userTurn]);
        setStatus('thinking');
        speechService.stopAudioAnalyzer();

        // 2. Send EXACT transcript text to Gemini API backend
        const aiResponse = await callGeminiAPI(userSpokenText);

        // 3. Display and Speak AI Response
        setChatHistory((prev) => [...prev, { role: 'model', text: aiResponse }]);
        const botTurn: TranscriptTurn = {
          id: `turn-bot-${Date.now()}`,
          sender: 'bot',
          text: aiResponse,
          timestamp: getFormattedTime(),
          source: 'voice',
        };
        setTranscripts((prev) => [...prev, botTurn]);
        speakText(aiResponse);
      },
      onError: (err) => {
        speechService.stopListening();
        setErrorMessage(err);
        setStatus('idle');
        setAudioLevel(0);
      },
      onEnd: () => {
        speechService.stopAudioAnalyzer();
        setStatus((prev) => (prev === 'listening' ? 'idle' : prev));
        setAudioLevel(0);
      },
    });

    if (!started) {
      setStatus('idle');
    }
  }, [callGeminiAPI, handleSetVoiceMode, handleStopSpeaking, speakText, status, voiceMode]);

  // Reset session
  const handleClearSession = () => {
    handleStopSpeaking();
    setChatHistory([]);
    setTranscripts([]);
    setInterimTranscript('');
    setErrorMessage(null);
    setActiveQuestionId(null);
  };

  // Replay a previous bot answer
  const handleReplayVoice = (text: string) => {
    handleStopSpeaking();
    speakBotResponse(text);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechService.stopSpeaking();
      speechService.stopListening();
      speechService.stopAudioAnalyzer();
      if (simulatedAudioIntervalRef.current) {
        clearInterval(simulatedAudioIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black flex flex-col font-sans selection:bg-[#FFE600] selection:text-black">
      {/* Top Bar Header adhering to 3-zone contract */}
      <Header
        transcripts={transcripts}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onClearSession={handleClearSession}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Persona Header Summary Card */}
        <PersonaHeaderCard status={status} />

        {/* 2-Column Split: Voice Core Centerpiece & Live Transcript */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Voice Core + Microphone Controller */}
          <div className="lg:col-span-5 space-y-6">
            <VoiceCore
              status={status}
              audioLevel={audioLevel}
              frequencyData={frequencyData}
              interimTranscript={interimTranscript}
              onToggleListen={handleToggleListen}
              onStopSpeaking={handleStopSpeaking}
              onSubmitText={(text) => handleProcessQuery(text, 'text')}
              errorMessage={errorMessage}
              infoNotice={infoNotice}
              voiceMode={voiceMode}
              onSetVoiceMode={handleSetVoiceMode}
            />

            {/* Quick System Context Card */}
            <div className="bg-[#FEF08A] border-4 border-black shadow-[6px_6px_0_0_#000] p-5 text-black space-y-2.5">
              <div className="text-black font-black font-mono flex items-center justify-between text-xs uppercase">
                <span>AI Assessment Persona Grounding</span>
                <span className="text-[10px] font-mono bg-black text-[#FFE600] px-2 py-0.5 border border-black shadow-[1px_1px_0_0_#000]">
                  RESUME-STRICT-V2
                </span>
              </div>
              <p className="text-xs font-bold leading-relaxed text-black/90 font-mono">
                Persona represents Paritosh Kumar (TSE II at Mitratech, 12+ yrs experience, local-first AI builder). Evaluates all queries dynamically against verified resume data in real time.
              </p>
              <div className="text-[11px] font-mono font-black text-black bg-white border-2 border-black p-2.5 shadow-[2px_2px_0_0_#000] leading-snug">
                ⚠️ Strict Boundary Rule Active: Queries outside Paritosh's career, skills, and background strictly return: "I'm sorry, that is outside my context."
              </div>
            </div>
          </div>

          {/* Right Column: Live Transcript Stream */}
          <div className="lg:col-span-7">
            <LiveTranscript
              transcripts={transcripts}
              onReplayVoice={handleReplayVoice}
              onClear={handleClearSession}
            />
          </div>
        </div>

        {/* 5 Key Interview Questions Presets Bar */}
        <PresetQuestions
          status={status}
          activeQuestionId={activeQuestionId}
          onSelectPreset={handleSelectPreset}
        />
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-[#FFE600] py-4 px-6 text-center text-xs text-black font-mono font-black shadow-[0_-4px_0_0_#000]">
        ⚡ PARITOSH KUMAR · IT APPLICATION SUPPORT & LOCAL AI SYSTEM BUILDER · VIBE CODER
      </footer>

      {/* Audio Engine Settings Modal */}
      <AudioSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={audioSettings}
        onUpdateSettings={(newVals) =>
          setAudioSettings((prev) => ({ ...prev, ...newVals }))
        }
        voiceMode={voiceMode}
        onSetVoiceMode={handleSetVoiceMode}
      />
    </div>
  );
}
