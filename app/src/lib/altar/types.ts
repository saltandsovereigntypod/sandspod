// Shapes of the altar JSON the website writes (altar/js/core/storage.js,
// createAltarSnapshot). The app reads and writes exactly these fields, and
// keeps any field it does not know about so a save from the app never drops
// something newer website code added.

/** One object on the altar. The website stores most values as strings. */
export type SavedObject = {
  imagePath?: string;
  fallbackSymbol?: string;
  label?: string;
  type?: string; // candle, herb, oil, crystal, tool, deity, vessel, cloth, apothecary...
  entityId?: string;
  instanceId?: string;
  herb?: string;
  form?: string;
  color?: string;
  crystal?: string;
  tool?: string;
  vessel?: string;
  deity?: string;
  apothecaryItemId?: string;
  apothecaryType?: string;
  apothecaryIngredients?: string;
  apothecaryIntention?: string;
  apothecaryNotes?: string;
  apothecaryLogToGrimoire?: string;
  apothecaryGrimoireStatus?: string;
  scale?: string;
  rotation?: string; // degrees, clockwise
  flipped?: string; // "true" | "false"
  locked?: string;
  glowing?: string;
  lit?: string;
  /** JSON string of the Living Object State (candle burns, dressings...). */
  livingState?: string;
  plaqueText?: string;
  altarObjectId?: string;
  groupId?: string;
  /** Centre-ish x as a fraction of stage width (see geometry.ts). */
  leftPercent?: number;
  topPercent?: number;
  /** Visual width as a fraction of stage width. */
  sizePercent?: number;
  zIndex?: string;
  [key: string]: unknown;
};

export type AltarGroup = { id: string; [key: string]: unknown };

/** The `altar_data` column (and each local save). */
export type AltarData = {
  name?: string;
  savedAt?: string;
  background?: string;
  backgroundName?: string;
  groups?: AltarGroup[];
  activeGroupId?: string | null;
  objects?: SavedObject[];
  [key: string]: unknown;
};

/** A saved altar as the website's getSavedAltars() returns it. */
export type SavedAltar = AltarData & {
  id: string;
  name: string;
  savedAt?: string;
  updatedAt?: string;
};

export type SavedAltarRow = {
  id: string;
  name: string;
  altar_data: AltarData | null;
  created_at: string;
  updated_at: string | null;
};

export type CabinetCategoryId = 'backgrounds' | 'candles' | 'herbs' | 'crystals' | 'tools' | 'deities' | 'vessels';

/** One placeable form of a cabinet item (website cabinet.js `forms`). */
export type CabinetForm = {
  label: string;
  image: string;
  type?: string;
  herb?: string;
  form?: string;
  color?: string;
  crystal?: string;
  tool?: string;
  vessel?: string;
  deity?: string;
  entityId?: string;
  custom?: boolean;
};

export type CabinetItem = {
  id: string;
  category: CabinetCategoryId | string;
  name: string;
  keywords: string[];
  forms: CabinetForm[];
  entityId?: string;
  customCabinetItemId?: string;
};

export type AltarBackground = {
  id: string;
  name: string;
  /** Path or URL exactly as the website stores it in altar_data.background. */
  background: string;
  custom?: boolean;
};
