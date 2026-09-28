import { DenominationalLens, DenominationConfig } from '../data/theologyData';
import { SupportedLanguage } from './types';

export interface LocalizedDenomination {
  name: string;
  tagline: string;
  traditionGroup: string;
}

export const LOCALIZED_DENOMINATIONS: Record<string, Record<DenominationalLens, LocalizedDenomination>> = {
  en: {
    catholic: {
      name: 'Roman Catholic',
      tagline: 'Sacred Tradition & Magisterium',
      traditionGroup: 'Catholic'
    },
    orthodox: {
      name: 'Eastern Orthodox',
      tagline: 'Holy Fathers & Theosis',
      traditionGroup: 'Orthodox'
    },
    reformed: {
      name: 'Reformed & Presbyterian',
      tagline: 'Sovereign Grace & Divine Covenants',
      traditionGroup: 'Reformed'
    },
    lutheran: {
      name: 'Lutheran',
      tagline: 'Law & Gospel / Sola Fide',
      traditionGroup: 'Lutheran'
    },
    wesleyan: {
      name: 'Wesleyan & Methodist',
      tagline: 'Prevenient Grace & Holy Love',
      traditionGroup: 'Wesleyan'
    },
    anglican: {
      name: 'Anglican',
      tagline: 'Via Media & Liturgical Prayer',
      traditionGroup: 'Anglican'
    },
    baptist_evangelical: {
      name: 'Baptist & Evangelical',
      tagline: 'Believer’s Faith & Scripture Inerrancy',
      traditionGroup: 'Evangelical'
    }
  }
};

export function getLocalizedDenomination(
  denom: DenominationConfig,
  language: SupportedLanguage = 'en'
): DenominationConfig {
  const langTable = LOCALIZED_DENOMINATIONS[language] || LOCALIZED_DENOMINATIONS.en;
  const localized = langTable[denom.id] || LOCALIZED_DENOMINATIONS.en[denom.id];
  if (!localized) return denom;
  return {
    ...denom,
    name: localized.name,
    tagline: localized.tagline,
    traditionGroup: localized.traditionGroup
  };
}
