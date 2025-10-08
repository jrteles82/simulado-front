export type Category = 'PORTUGUES' | 'DIREITO_CONSTITUCIONAL' | 'MISTO';

export interface Question {
  id: string;
  category: Category;
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  createdAt?: string;
  updatedAt?: string;
}
