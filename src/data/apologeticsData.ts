export interface ApologeticObjection {
  id: string;
  title: string;
  objection: string;
  defense: string;
  category: 'Historical' | 'Scientific' | 'Moral' | 'Philosophical' | 'Contradiction' | 'Theological';
  relatedVerses?: number[];
}

export type ApologeticsMap = Record<string, Record<number, ApologeticObjection[]>>;
