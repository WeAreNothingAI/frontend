export interface JournalListItem {
  date: string;
  journalId: number;
  createdAt: string;
}

export interface JournalDetail {
  summary: string;
  recommendations: string;
  opinion: string;
  result: string;
  note: string;
}

export interface JournalFull {
  id: number;
  careWorkerId: number;
  clientId: number;
  rawAudioUrl: string;
  transcript: string;
  editedTranscript?: string;
  summary?: string;
  recommendations?: string;
  opinion?: string;
  result?: string;
  note?: string;
  exportedPdf?: string;
  exportedDocx?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalSummaryResponse {
  file: string;
  docx_url: string;
  pdf_url: string;
  summary: string;
  recommendations: string;
  opinion: string;
  result: string;
  note: string;
  updated: JournalFull;
}