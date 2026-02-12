import type { District, DistrictType, Rumor, Notice } from "~/models";
import { SeededRandom } from "../SeededRandom";
import { nanoid } from "nanoid";
import {
  ABANDONED_REASONS,
  ABANDONED_DANGERS,
  ABANDONED_FORMER_PURPOSES,
  DISTRICT_NAME_PREFIXES,
  DISTRICT_NAME_SUFFIXES,
} from "~/data/districts/district-tables";

export interface AbandonedQuarter {
  district: District;
  formerPurpose: DistrictType;
  abandonmentCause: string;
  currentDanger: string;
  treasureRumor: string;
}

/**
 * Generate the ruins district — every city has one.
 */
export function generateAbandonedQuarter(
  rng: SeededRandom,
  settlementId: string,
): AbandonedQuarter {
  const id = `district-${nanoid(8)}`;
  const formerPurpose = rng.pick(ABANDONED_FORMER_PURPOSES);
  const abandonmentCause = rng.pick(ABANDONED_REASONS);
  const currentDanger = rng.pick(ABANDONED_DANGERS);

  const prefix = rng.pick(DISTRICT_NAME_PREFIXES.ruins);
  const suffix = rng.pick(DISTRICT_NAME_SUFFIXES.ruins);
  const name = `${prefix} ${suffix}`;

  const treasureRumors = [
    `They say a vault full of gold was sealed when ${name} was abandoned`,
    `An old-timer claims a dungeon entrance lies beneath the collapsed temple in ${name}`,
    `Scavengers found strange magical artifacts in ${name} last month`,
    `A merchant's fortune in gems was never recovered from the ruins`,
    `The old lord's treasury was buried under rubble — no one's dug it out`,
  ];
  const treasureRumor = rng.pick(treasureRumors);

  const rumorTexts = [
    `Strange lights have been seen in ${name} after midnight`,
    `A scavenger came back from ${name} babbling about voices in the dark`,
    abandonmentCause.replace("A ", "They say a ").replace(" ago", " ago, and it's still not safe"),
    currentDanger.replace("A ", "Folks say a "),
    treasureRumor,
  ];

  const rumors: Rumor[] = rng.sample(rumorTexts, rng.between(2, 3)).map((text, i) => ({
    id: `rumor-${id}-${i}`,
    text,
    isTrue: rng.chance(0.6),
    source: "hushed whispers",
  }));

  const notices: Notice[] = [];
  if (rng.chance(0.5)) {
    notices.push({
      id: `notice-${id}-0`,
      title: `WARNING: ${name} Off Limits`,
      description: `By order of the city watch, entry to ${name} is forbidden. ${currentDanger}.`,
      noticeType: "warning",
    });
  }

  const district: District = {
    id,
    name,
    type: "ruins",
    description: `Once the ${formerPurpose} quarter, now a crumbling ruin. ${abandonmentCause}. ${currentDanger}.`,
    mood: "decaying",
    trouble: currentDanger,
    flavor: "Crumbling walls and collapsed roofs stand as silent monuments to disaster",
    economy: "Nothing legitimate remains — only scavengers and squatters",
    faceNpcId: "", // Will be set by caller
    siteIds: [],
    npcIds: [],
    rumors,
    notices,
    adjacencies: [],
    position: { x: 0, y: 0 },
  };

  return {
    district,
    formerPurpose,
    abandonmentCause,
    currentDanger,
    treasureRumor,
  };
}
