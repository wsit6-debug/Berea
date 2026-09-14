import { DoctrinalEntry } from '../doctrinalCorpus';
import { DenominationalLens } from '../theologyData';

import { UNABRIDGED_CATHOLIC_CORPUS } from './catholic';
import { UNABRIDGED_ORTHODOX_CORPUS } from './orthodox';
import { UNABRIDGED_REFORMED_CORPUS } from './reformed';
import { UNABRIDGED_LUTHERAN_CORPUS } from './lutheran';
import { UNABRIDGED_WESLEYAN_CORPUS } from './wesleyan';
import { UNABRIDGED_ANGLICAN_CORPUS } from './anglican';
import { UNABRIDGED_BAPTIST_EVANGELICAL_CORPUS } from './baptist_evangelical';

export {
  UNABRIDGED_CATHOLIC_CORPUS,
  UNABRIDGED_ORTHODOX_CORPUS,
  UNABRIDGED_REFORMED_CORPUS,
  UNABRIDGED_LUTHERAN_CORPUS,
  UNABRIDGED_WESLEYAN_CORPUS,
  UNABRIDGED_ANGLICAN_CORPUS,
  UNABRIDGED_BAPTIST_EVANGELICAL_CORPUS
};

/**
 * MASTER UNABRIDGED OFFICIAL CONFESSIONAL CORPUS ACROSS ALL 7 HISTORICAL TRADITIONS
 */
export const MASTER_UNABRIDGED_CONFESSIONAL_CORPUS: DoctrinalEntry[] = [
  ...UNABRIDGED_CATHOLIC_CORPUS,
  ...UNABRIDGED_ORTHODOX_CORPUS,
  ...UNABRIDGED_REFORMED_CORPUS,
  ...UNABRIDGED_LUTHERAN_CORPUS,
  ...UNABRIDGED_WESLEYAN_CORPUS,
  ...UNABRIDGED_ANGLICAN_CORPUS,
  ...UNABRIDGED_BAPTIST_EVANGELICAL_CORPUS
];

/**
 * Retrieves the full unabridged confessional documents strictly matching an active tradition lens.
 */
export function getUnabridgedConfessionsForLens(lens: DenominationalLens): DoctrinalEntry[] {
  switch (lens) {
    case 'catholic':
      return UNABRIDGED_CATHOLIC_CORPUS;
    case 'orthodox':
      return UNABRIDGED_ORTHODOX_CORPUS;
    case 'reformed':
      return UNABRIDGED_REFORMED_CORPUS;
    case 'lutheran':
      return UNABRIDGED_LUTHERAN_CORPUS;
    case 'wesleyan':
      return UNABRIDGED_WESLEYAN_CORPUS;
    case 'anglican':
      return UNABRIDGED_ANGLICAN_CORPUS;
    case 'baptist_evangelical':
      return UNABRIDGED_BAPTIST_EVANGELICAL_CORPUS;
    default:
      return MASTER_UNABRIDGED_CONFESSIONAL_CORPUS;
  }
}
