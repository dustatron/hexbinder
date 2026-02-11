/**
 * Corruption zone overlay for Obojima hex map.
 * Source: obojima/reference/corruption.md
 *
 * Corrupted: ground zero, actively dangerous
 * Threatened: adjacent to corruption, seeping in
 */

export type CorruptionLevel = "corrupted" | "threatened";

interface CorruptionZone {
  q: number;
  r: number;
  level: CorruptionLevel;
  note?: string;
}

// Key corrupted locations and their surrounding hexes
export const CORRUPTION_ZONES: CorruptionZone[] = [
  // === Corrupted Coastline (ground zero) ===
  { q: 16, r: -7, level: "corrupted", note: "Corrupted Coastline landmark" },
  { q: 17, r: -7, level: "corrupted" },
  { q: 18, r: -7, level: "corrupted" },
  { q: 17, r: -6, level: "corrupted" },
  { q: 18, r: -6, level: "corrupted" },
  { q: 19, r: -6, level: "corrupted" },
  { q: 19, r: -5, level: "corrupted" },
  { q: 20, r: -6, level: "corrupted" },

  // === Gobo Village (devastated by tsunami + corruption) ===
  { q: 16, r: -8, level: "corrupted", note: "Gobo Village" },
  { q: 17, r: -8, level: "corrupted" },
  { q: 15, r: -7, level: "corrupted" },

  // === Ekmu Village (underwater demon Slaathti) ===
  { q: 16, r: 0, level: "corrupted", note: "Ekmu Village" },
  { q: 17, r: 0, level: "corrupted" },
  { q: 16, r: 1, level: "corrupted" },

  // === Ten Wheels Grove (demon Olundu) ===
  { q: 14, r: -1, level: "corrupted", note: "Ten Wheels Grove" },
  { q: 15, r: -1, level: "corrupted" },
  { q: 14, r: 0, level: "corrupted" },

  // === Shade Wood (corrupted, refugee camp) ===
  { q: 13, r: 1, level: "corrupted", note: "Shade Wood" },
  { q: 14, r: 1, level: "corrupted" },
  { q: 13, r: 2, level: "corrupted" },

  // === Threatened zones (Polewater and broader Brackwater) ===
  { q: 20, r: -4, level: "threatened", note: "Polewater Village" },
  { q: 19, r: -4, level: "threatened" },
  { q: 20, r: -3, level: "threatened" },
  { q: 21, r: -4, level: "threatened" },
  { q: 19, r: -3, level: "threatened" },

  // Broader Brackwater threatened zone
  { q: 15, r: -2, level: "threatened" },
  { q: 16, r: -2, level: "threatened" },
  { q: 17, r: -2, level: "threatened" },
  { q: 18, r: -2, level: "threatened" },
  { q: 15, r: -3, level: "threatened" },
  { q: 16, r: -3, level: "threatened" },
  { q: 17, r: -3, level: "threatened" },
  { q: 18, r: -3, level: "threatened" },

  // Eastern coast threatened
  { q: 20, r: -8, level: "threatened" },
  { q: 21, r: -8, level: "threatened" },
  { q: 20, r: -7, level: "threatened" },
  { q: 21, r: -7, level: "threatened" },

  // AHA basement (infiltrated)
  { q: 4, r: 8, level: "threatened", note: "AHA HQ basement infiltrated" },
];

/**
 * Build a lookup map from hex coords to corruption level
 */
export function buildCorruptionMap(): Map<string, CorruptionLevel> {
  const map = new Map<string, CorruptionLevel>();
  for (const zone of CORRUPTION_ZONES) {
    const key = `${zone.q},${zone.r}`;
    // Corrupted takes priority over threatened
    const existing = map.get(key);
    if (!existing || zone.level === "corrupted") {
      map.set(key, zone.level);
    }
  }
  return map;
}
