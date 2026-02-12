// Obojima NPC Master Index
// Re-exports all regional NPC arrays as a single flat array
import type { NPC } from "~/models";

import { GIFT_NPCS } from "./npcs-gift";
import { HOT_WATER_NPCS } from "./npcs-hot-water";
import { ARBORA_NPCS } from "./npcs-arbora";
import { GALE_NPCS } from "./npcs-gale";
import { BRACKWATER_NPCS } from "./npcs-brackwater";
import { HIGHLANDS_NPCS } from "./npcs-highlands";
import { SHALLOWS_NPCS } from "./npcs-shallows";
import { MOBILE_NPCS } from "./npcs-mobile";

export const OBOJIMA_NPCS: NPC[] = [
  ...GIFT_NPCS,
  ...HOT_WATER_NPCS,
  ...ARBORA_NPCS,
  ...GALE_NPCS,
  ...BRACKWATER_NPCS,
  ...HIGHLANDS_NPCS,
  ...SHALLOWS_NPCS,
  ...MOBILE_NPCS,
];

// Re-export regional arrays for selective use
export {
  GIFT_NPCS,
  HOT_WATER_NPCS,
  ARBORA_NPCS,
  GALE_NPCS,
  BRACKWATER_NPCS,
  HIGHLANDS_NPCS,
  SHALLOWS_NPCS,
  MOBILE_NPCS,
};
