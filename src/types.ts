export interface Result {
  name: string;
  referenceFile: string;
  diffFile: string;
  currentFile: string;
}

export type DiffMode = "diff" | "current";
