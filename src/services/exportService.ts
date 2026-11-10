import { jsPDF } from 'jspdf';
import { TranscriptTurn } from '../types';
import { PARITOSH_PROFILE } from '../data/personaData';

export function exportToJson(transcripts: TranscriptTurn[]): void {
  const exportData = {
    metadata: {
      candidate: PARITOSH_PROFILE.name,
      role: PARITOSH_PROFILE.title,
      currentRole: PARITOSH_PROFILE.currentRole,
      availability: PARITOSH_PROFILE.availability,
      experience: PARITOSH_PROFILE.experience,
      coreAreas: PARITOSH_PROFILE.coreAreas,
      techStack: PARITOSH_PROFILE.techStack,
      exportedAt: new Date().toISOString(),
      formattedDate: new Date().toLocaleString(),
      totalTurns: transcripts.length,
      userQuestionsCount: transcripts.filter((t) => t.sender === 'user').length,
    },
    conversation: transcripts.map((t) => ({
      sender: t.sender === 'user' ? 'Interviewer / User' : 'Paritosh Kumar (AI Persona)',
      source: t.source,
      timestamp: t.timestamp,
      durationMs: t.durationMs,
      text: t.text,
    })),
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filename = `paritosh-kumar-interview-log-${new Date().toISOString().slice(0, 10)}.json`;

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToPdf(transcripts: TranscriptTurn[]): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header banner background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 90, 'F');

  // Candidate Name & Title
  doc.setTextColor(248, 250, 252);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('PARITOSH KUMAR', margin, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('IT Application Support Specialist & AI System Builder | 12+ Years Experience', margin, 54);
  doc.setFontSize(9);
  doc.text('Mitratech TSE II (TeamConnect) · Local-First AI & RAG · Python 3.13 · Enterprise Support', margin, 68);

  y = 110;

  // Metadata summary strip
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(margin, y, contentWidth, 38, 4, 4, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('INTERVIEW SESSION LOG', margin + 12, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const dateStr = new Date().toLocaleString();
  const turnsCount = transcripts.length;
  doc.text(`Generated: ${dateStr}   |   Total Dialog Turns: ${turnsCount}`, margin + 12, y + 28);

  y += 56;

  if (transcripts.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('No conversation records found in this session.', margin, y + 20);
  } else {
    transcripts.forEach((turn, idx) => {
      // Check page overflow
      if (y > pageHeight - 90) {
        doc.addPage();
        y = margin;
      }

      const isUser = turn.sender === 'user';
      const speakerLabel = isUser ? 'INTERVIEWER / USER' : 'PARITOSH KUMAR';
      const labelColor: [number, number, number] = isUser ? [14, 116, 144] : [15, 118, 110]; // cyan or emerald
      const boxBgColor: [number, number, number] = isUser ? [248, 250, 252] : [240, 253, 250];

      // Format turn text
      const cleanText = turn.text.replace(/[*_#`]/g, '');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const splitText = doc.splitTextToSize(cleanText, contentWidth - 24);
      const textHeight = splitText.length * 12 + 24;

      // Card bounding box
      doc.setFillColor(...boxBgColor);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, textHeight, 4, 4, 'FD');

      // Sender badge
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...labelColor);
      doc.text(`${speakerLabel}  [${turn.source?.toUpperCase() || 'INPUT'}]`, margin + 12, y + 14);

      // Timestamp
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(turn.timestamp, margin + contentWidth - 70, y + 14);

      // Body Text
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(splitText, margin + 12, y + 28);

      y += textHeight + 12;
    });
  }

  // Footer on current page
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Paritosh Kumar AI Voice Persona Console — Certified System Support Portfolio', margin, pageHeight - 20);

  const filename = `paritosh-kumar-interview-log-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
