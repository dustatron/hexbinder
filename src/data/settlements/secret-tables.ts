/**
 * Settlement secrets tables for procedural intrigue generation
 */

import type { SettlementSize } from "~/models";

export type SecretSeverity = "minor" | "major" | "catastrophic";

export interface SecretEntry {
  text: string;
  severity: SecretSeverity;
  weight: number;
  // Hints for entity linking
  involvesFaction?: boolean;  // Likely involves a faction
  involvesSite?: boolean;     // Likely involves a site
  involvesLeader?: boolean;   // Likely involves settlement leader
}

// Secret count range by settlement size
export const SECRET_COUNT: Record<SettlementSize, { min: number; max: number }> = {
  thorpe: { min: 1, max: 1 },
  hamlet: { min: 1, max: 2 },
  village: { min: 1, max: 2 },
  town: { min: 2, max: 3 },
  city: { min: 3, max: 4 },
};

// Severity distribution by settlement size
export const SEVERITY_DISTRIBUTION: Record<SettlementSize, { severity: SecretSeverity; weight: number }[]> = {
  thorpe: [
    { severity: "minor", weight: 10 },
  ],
  hamlet: [
    { severity: "minor", weight: 8 },
    { severity: "major", weight: 2 },
  ],
  village: [
    { severity: "minor", weight: 8 },
    { severity: "major", weight: 2 },
  ],
  town: [
    { severity: "minor", weight: 6 },
    { severity: "major", weight: 3 },
    { severity: "catastrophic", weight: 1 },
  ],
  city: [
    { severity: "minor", weight: 4 },
    { severity: "major", weight: 4 },
    { severity: "catastrophic", weight: 2 },
  ],
};

// Minor secrets - everyday scandals and small corruptions
export const MINOR_SECRETS: SecretEntry[] = [
  {
    text: "The tavern keeper waters down the ale",
    severity: "minor",
    weight: 3,
    involvesSite: true,
  },
  {
    text: "A respected merchant cheats on weights and measures",
    severity: "minor",
    weight: 3,
  },
  {
    text: "The blacksmith's apprentice is stealing materials",
    severity: "minor",
    weight: 2,
    involvesSite: true,
  },
  {
    text: "Two prominent families are feuding over a land dispute",
    severity: "minor",
    weight: 3,
  },
  {
    text: "The healer is actually a charlatan with no real training",
    severity: "minor",
    weight: 2,
  },
  {
    text: "Someone is spreading malicious rumors about the priest",
    severity: "minor",
    weight: 2,
  },
  {
    text: "A local youth has been vandalizing property at night",
    severity: "minor",
    weight: 2,
  },
  {
    text: "The miller takes more than his fair share of grain",
    severity: "minor",
    weight: 3,
    involvesSite: true,
  },
  {
    text: "A married couple are secretly planning to abandon the settlement",
    severity: "minor",
    weight: 2,
  },
  {
    text: "The local drunk is actually a disgraced noble in hiding",
    severity: "minor",
    weight: 1,
  },
  {
    text: "Someone has been poaching from the lord's hunting grounds",
    severity: "minor",
    weight: 2,
  },
  {
    text: "A resident is maintaining a secret correspondence with a rival settlement",
    severity: "minor",
    weight: 2,
    involvesFaction: true,
  },
  {
    text: "The well water has gone slightly foul but no one wants to admit it",
    severity: "minor",
    weight: 2,
  },
  {
    text: "A shopkeeper is selling stolen goods",
    severity: "minor",
    weight: 2,
    involvesSite: true,
  },
  {
    text: "The guard captain accepts bribes to look the other way",
    severity: "minor",
    weight: 2,
    involvesLeader: true,
  },
];

// Major secrets - serious crimes and dangerous situations
export const MAJOR_SECRETS: SecretEntry[] = [
  {
    text: "The mayor is embezzling from the town treasury",
    severity: "major",
    weight: 2,
    involvesLeader: true,
    involvesSite: true,
  },
  {
    text: "A prominent citizen is actually a spy for a rival power",
    severity: "major",
    weight: 2,
    involvesFaction: true,
  },
  {
    text: "Smugglers use a building as a secret warehouse",
    severity: "major",
    weight: 3,
    involvesSite: true,
    involvesFaction: true,
  },
  {
    text: "The local priest has lost their faith but continues the charade",
    severity: "major",
    weight: 2,
    involvesSite: true,
  },
  {
    text: "A secret cult meets in the basement of a respectable establishment",
    severity: "major",
    weight: 2,
    involvesSite: true,
    involvesFaction: true,
  },
  {
    text: "The settlement's founding charter was forged",
    severity: "major",
    weight: 1,
    involvesLeader: true,
  },
  {
    text: "A serial killer has been operating undetected",
    severity: "major",
    weight: 1,
  },
  {
    text: "The local lord's heir is actually illegitimate",
    severity: "major",
    weight: 2,
    involvesLeader: true,
  },
  {
    text: "A faction is planning to seize control of the settlement",
    severity: "major",
    weight: 2,
    involvesFaction: true,
  },
  {
    text: "The water supply is being slowly poisoned",
    severity: "major",
    weight: 2,
  },
  {
    text: "A respected elder murdered someone years ago and buried the body nearby",
    severity: "major",
    weight: 2,
  },
  {
    text: "The settlement sits on an ancient burial ground that was never properly consecrated",
    severity: "major",
    weight: 2,
  },
  {
    text: "A local merchant is actually a fence for a thieves' guild",
    severity: "major",
    weight: 2,
    involvesSite: true,
    involvesFaction: true,
  },
  {
    text: "Someone important is being blackmailed",
    severity: "major",
    weight: 2,
    involvesLeader: true,
  },
  {
    text: "A dangerous creature lairs nearby and the leaders are keeping it secret",
    severity: "major",
    weight: 2,
    involvesLeader: true,
  },
];

// Catastrophic secrets - world-changing revelations
export const CATASTROPHIC_SECRETS: SecretEntry[] = [
  {
    text: "An ancient evil sleeps beneath the settlement",
    severity: "catastrophic",
    weight: 2,
  },
  {
    text: "The settlement leader is actually a shapeshifter who replaced the real one",
    severity: "catastrophic",
    weight: 2,
    involvesLeader: true,
  },
  {
    text: "A portal to another plane is hidden somewhere in the settlement",
    severity: "catastrophic",
    weight: 2,
    involvesSite: true,
  },
  {
    text: "The entire settlement is built on a sealed demon prison",
    severity: "catastrophic",
    weight: 1,
  },
  {
    text: "A powerful artifact is hidden here, and dark forces seek it",
    severity: "catastrophic",
    weight: 2,
    involvesFaction: true,
  },
  {
    text: "The settlement's prosperity comes from a pact with a dark entity",
    severity: "catastrophic",
    weight: 2,
    involvesFaction: true,
  },
  {
    text: "An undead creature controls the settlement from the shadows",
    severity: "catastrophic",
    weight: 1,
    involvesLeader: true,
  },
  {
    text: "The settlement is actually a lure created by something that feeds on travelers",
    severity: "catastrophic",
    weight: 1,
  },
  {
    text: "A plague is coming that will devastate the region, and only a few know",
    severity: "catastrophic",
    weight: 2,
    involvesFaction: true,
  },
  {
    text: "The settlement's guardian deity has been replaced by something malevolent",
    severity: "catastrophic",
    weight: 1,
    involvesSite: true,
  },
  {
    text: "A war is about to begin and this settlement is directly in the path",
    severity: "catastrophic",
    weight: 2,
    involvesFaction: true,
  },
  {
    text: "The founding family's bloodline carries a terrible curse about to manifest",
    severity: "catastrophic",
    weight: 2,
    involvesLeader: true,
  },
];

// Helper to get secrets by severity
export function getSecretsBySeverity(severity: SecretSeverity): SecretEntry[] {
  switch (severity) {
    case "minor":
      return MINOR_SECRETS;
    case "major":
      return MAJOR_SECRETS;
    case "catastrophic":
      return CATASTROPHIC_SECRETS;
  }
}
