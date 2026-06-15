export interface Note {
  id: string;
  title: string;
  content: string; // HTML content from rich text editor
  tags: string[];
  isPinned: boolean;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}
