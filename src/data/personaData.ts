import { PresetQuestion } from '../types';

export const PARITOSH_PROFILE = {
  name: 'Paritosh Kumar',
  title: 'IT Application Support Specialist & AI System Builder / Vibe Coder',
  availability: 'Open to Remote & Global Opportunities',
  experience: '12+ Years Enterprise IT & SaaS Support',
  currentRole: 'Technical Support Engineer II at Mitratech (TeamConnect & Sisense/TCBI)',
  philosophy: 'Stoic practitioner — applying resilience, focus, and continuous learning to software and life.',
  coreAreas: [
    'L2/L3 Enterprise Troubleshooting',
    'Local-First AI & RAG Pipelines',
    'Python 3.13 & FastAPI Automation',
    'TeamConnect & Sisense Analytics',
    'Privacy-Centric Software Architecture',
  ],
  techStack: [
    'Python 3.13',
    'FastAPI',
    'REST APIs',
    'Electron',
    'React',
    'SQL Server',
    'Oracle',
    'Git/Bash/PowerShell',
    'n8n',
    'Ollama (Qwen2.5-Coder, Llama 3.1, Mistral)',
    'ChromaDB',
    'LangGraph',
    'YOLOv8',
    'MediaPipe Pose',
    'OpenCV',
  ],
  shippedProjects: [
    {
      name: 'MegaMind Content Studio',
      description: 'Local-first AI content platform running open models on-device with FastAPI, Electron, and Ollama.',
    },
    {
      name: 'Lazy-Tube / Lazy-Tube Desktop',
      description: 'Automated YouTube publishing assistant using YAML brand profiles and YouTube Data API v3.',
    },
    {
      name: 'PhoneChecker / AuditAd',
      description: '100% on-device Android privacy audit utility and local loopback DNS monitor.',
    },
    {
      name: 'Edge Video Invigilator (Video_Invigilator)',
      description: 'On-device CPU webcam security tool using MediaPipe Pose and OpenCV to detect 7 gestures locally.',
    },
  ],
  certifications: [
    'IBM (Credly) Certifications: Python for Data Science, Data Analysis, Data Visualization',
    'InsideAIML Data Science Program (TensorFlow/PyTorch)',
  ],
  links: {
    github: 'https://github.com/coreparkumar',
    portfolio: 'https://coreparkumar.github.io/portfolio',
    website: 'https://worthifyme.com',
  },
  avatarPath: '/assets/aistudio/my-pic_c949ea9c.jpg',
};

export const PRESET_QUESTIONS: PresetQuestion[] = [
  {
    id: 'intro-mitratech',
    category: 'Experience',
    title: 'Background & Mitratech Role',
    query: 'Can you introduce yourself and your current role at Mitratech supporting TeamConnect?',
    shortDescription: '12+ years in L2/L3 support, SQL, Oracle, Tomcat, and legal SaaS at Mitratech.',
    canonicalAnswer:
      'I am an IT Application Support Specialist with over 12 years of enterprise troubleshooting experience. Currently, as Technical Support Engineer II at Mitratech, I manage L2 and L3 escalations for our flagship legal SaaS platform TeamConnect and Sisense analytics, diagnosing complex SQL, Oracle, and Tomcat issues.',
  },
  {
    id: 'shipped-projects',
    category: 'Projects',
    title: 'Shipped AI Projects',
    query: 'Tell me about the software projects you have shipped, like MegaMind and Edge Video Invigilator.',
    shortDescription: 'Local-first AI tools: MegaMind Content Studio, Lazy-Tube, PhoneChecker, and Edge Video Invigilator.',
    canonicalAnswer:
      'I have designed and shipped multiple local-first tools: MegaMind Content Studio runs open models on-device via FastAPI and Ollama; Edge Video Invigilator uses MediaPipe Pose and OpenCV on CPU to detect 7 test-taking gestures; Lazy-Tube automates YouTube publishing via YAML; and PhoneChecker conducts on-device Android privacy audits.',
  },
  {
    id: 'local-ai-stack',
    category: 'AI Stack',
    title: 'Local AI & Python Stack',
    query: 'How do you build local-first AI agent workflows with Python, Ollama, and LangGraph?',
    shortDescription: 'Python 3.13, FastAPI, Ollama, ChromaDB RAG, and LangGraph multi-agent patterns.',
    canonicalAnswer:
      'My modern AI stack leverages Python 3.13 and FastAPI paired with local Ollama models like Qwen2.5-Coder and Llama 3.1. I build privacy-centric RAG pipelines using ChromaDB and orchestrate resilient multi-agent automation using LangGraph and n8n.',
  },
  {
    id: 'stoic-philosophy',
    category: 'Philosophy',
    title: 'Stoicism & Engineering',
    query: 'What is your core philosophy and how does Stoicism influence your work as an engineer?',
    shortDescription: 'Stoic practitioner: emotional resilience, objective diagnostics, and continuous growth.',
    canonicalAnswer:
      'As a Stoic practitioner, I apply calm resilience, extreme focus, and continuous learning to high-pressure production incidents. It allows me to stay objective under critical outages, isolate root causes without panic, and build sustainable, self-healing systems.',
  },
  {
    id: 'future-opportunities',
    category: 'Opportunities',
    title: 'Career & Work Opportunities',
    query: 'What type of engineering opportunities and team environments are you looking for next?',
    shortDescription: 'Open to remote and global roles; eager to scale enterprise support and local AI systems.',
    canonicalAnswer:
      'I am actively seeking high-impact roles where I can combine deep enterprise L2/L3 application support with local-first AI automation and privacy-centric system design. I thrive in collaborative, fast-paced technical environments open to global talent.',
  },
];
