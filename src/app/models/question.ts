export interface Question {
  id: number;
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  categoryId: number;
}
