import { DenominationalLens } from './theologyData';
import {
  MASTER_UNABRIDGED_CONFESSIONAL_CORPUS,
  UNABRIDGED_CATHOLIC_CORPUS,
  UNABRIDGED_ORTHODOX_CORPUS,
  UNABRIDGED_REFORMED_CORPUS,
  UNABRIDGED_LUTHERAN_CORPUS,
  UNABRIDGED_WESLEYAN_CORPUS,
  UNABRIDGED_ANGLICAN_CORPUS,
  UNABRIDGED_BAPTIST_EVANGELICAL_CORPUS,
  getUnabridgedConfessionsForLens
} from './unabridged';

export interface DoctrinalEntry {
  id: string;
  tradition: DenominationalLens;
  documentTitle: string;
  sectionOrArticle: string;
  citation: string;
  yearOrEra: string;
  topic: string;
  coreDoctrine: string;
  fullExcerpt: string;
  relatedScriptures: string[];
  keywords: string[];
  sourceFilename?: string;
  sectionHeader?: string;
}

export {
  UNABRIDGED_CATHOLIC_CORPUS as CATHOLIC_CONFESSIONAL_CORPUS,
  UNABRIDGED_ORTHODOX_CORPUS as ORTHODOX_CONFESSIONAL_CORPUS,
  UNABRIDGED_REFORMED_CORPUS as REFORMED_CONFESSIONAL_CORPUS,
  UNABRIDGED_LUTHERAN_CORPUS as LUTHERAN_CONFESSIONAL_CORPUS,
  UNABRIDGED_WESLEYAN_CORPUS as WESLEYAN_CONFESSIONAL_CORPUS,
  UNABRIDGED_ANGLICAN_CORPUS as ANGLICAN_CONFESSIONAL_CORPUS,
  UNABRIDGED_BAPTIST_EVANGELICAL_CORPUS as BAPTIST_EVANGELICAL_CONFESSIONAL_CORPUS,
  getUnabridgedConfessionsForLens as getConfessionsForLens,
  MASTER_UNABRIDGED_CONFESSIONAL_CORPUS as ALL_CONFESSIONAL_CORPUS
};

/**
 * The Master Doctrinal & Confessional Corpus for Berea RAG.
 * Contains authentic historical ecumenical council decrees, catechisms, confessions, and articles of faith
 * across Roman Catholic, Eastern Orthodox, Reformed, Lutheran, Wesleyan, Anglican, and Baptist/Evangelical traditions.
 */
export const DOCTRINAL_CORPUS: DoctrinalEntry[] = MASTER_UNABRIDGED_CONFESSIONAL_CORPUS;
