export interface ReportDetail {
  file: string;
  docx_url: string;
  pdf_url: string;
  title: string;
  clientName: string;
  birthDate: string;
  careLevel: string;
  guardianContact: string;
  reportDate: string;
  socialWorkerName: string;
  summary: string;
  riskNotes: string;
  evaluation: string;
  suggestion: string;
  journalSummary: ReportJournalSummary[];
}

export interface ReportJournalSummary {
  date: string;
  careWorker: string;
  service: string;
  notes: string;
}

export interface ReportCreateRequest {
  journalIds: number[];
}
