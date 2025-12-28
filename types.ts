
export interface ProjectData {
  title: string;
  studentName: string;
  rollNo: string;
  session: string;
  supervisorName: string;
  supervisorDesignation: string;
}

export interface DocumentSection {
  title: string;
  content: string;
  subsections?: DocumentSection[];
}

export interface GeneratedDocuments {
  srs: DocumentSection[];
  sdd: DocumentSection[];
}

export interface ProjectHistoryItem {
  id: string;
  timestamp: number;
  data: ProjectData;
  content: GeneratedDocuments;
}
