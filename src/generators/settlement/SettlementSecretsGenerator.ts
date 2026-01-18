/**
 * SettlementSecretsGenerator - Creates town-wide secrets with entity connections.
 * Secrets scale by settlement size and can link to NPCs, factions, and sites.
 */

import { nanoid } from "nanoid";
import type {
  SettlementSize,
  SettlementSecret,
  SecretSeverity,
  SettlementSite,
} from "~/models";
import { SeededRandom } from "../SeededRandom";
import {
  SECRET_COUNT,
  SEVERITY_DISTRIBUTION,
  getSecretsBySeverity,
  type SecretEntry,
} from "~/data/settlements/secret-tables";

export interface SettlementSecretsOptions {
  seed: string;
  size: SettlementSize;
  npcIds: string[];
  factionIds: string[];
  sites: SettlementSite[];
  mayorNpcId?: string;
  /** Secrets already used in other settlements (to avoid world-wide duplicates) */
  existingSecretTexts?: string[];
}

/**
 * Pick a weighted entry from a table.
 */
function pickWeighted<T extends { weight: number }>(rng: SeededRandom, table: T[]): T {
  const totalWeight = table.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = rng.next() * totalWeight;

  for (const entry of table) {
    roll -= entry.weight;
    if (roll <= 0) return entry;
  }

  return table[table.length - 1];
}

/**
 * Determine secret severity based on settlement size.
 */
function pickSeverity(rng: SeededRandom, size: SettlementSize): SecretSeverity {
  const severityTable = SEVERITY_DISTRIBUTION[size];
  return pickWeighted(rng, severityTable).severity;
}

/**
 * Generate a single secret with entity connections.
 */
function generateSecret(
  rng: SeededRandom,
  severity: SecretSeverity,
  usedSecrets: Set<string>,
  npcIds: string[],
  factionIds: string[],
  sites: SettlementSite[],
  mayorNpcId?: string
): SettlementSecret | null {
  const secretTable = getSecretsBySeverity(severity);

  // Filter out already-used secrets
  const availableSecrets = secretTable.filter(s => !usedSecrets.has(s.text));
  if (availableSecrets.length === 0) return null;

  const entry = pickWeighted(rng, availableSecrets);
  usedSecrets.add(entry.text);

  const secret: SettlementSecret = {
    id: `secret-${nanoid(8)}`,
    text: entry.text,
    severity,
    discovered: false,
  };

  // Link to NPCs (60% chance if secret involves NPCs or leader)
  if (npcIds.length > 0) {
    if (entry.involvesLeader && mayorNpcId) {
      // Leader-specific secrets involve the mayor
      secret.involvedNpcIds = [mayorNpcId];
    } else if (rng.chance(0.6)) {
      // Pick 1-2 random NPCs
      const count = rng.between(1, Math.min(2, npcIds.length));
      secret.involvedNpcIds = rng.sample(npcIds, count);
    }
  }

  // Link to factions (40% chance if secret involves factions)
  if (factionIds.length > 0 && (entry.involvesFaction || rng.chance(0.4))) {
    const count = rng.between(1, Math.min(2, factionIds.length));
    secret.involvedFactionIds = rng.sample(factionIds, count);
  }

  // Link to sites (30% chance if secret involves sites)
  if (sites.length > 0 && (entry.involvesSite || rng.chance(0.3))) {
    const site = rng.pick(sites);
    secret.involvedSiteIds = [site.id];
  }

  return secret;
}

/**
 * Generate all secrets for a settlement.
 */
export function generateSettlementSecrets(options: SettlementSecretsOptions): SettlementSecret[] {
  const { seed, size, npcIds, factionIds, sites, mayorNpcId, existingSecretTexts = [] } = options;
  const rng = new SeededRandom(`${seed}-settlement-secrets`);

  const { min, max } = SECRET_COUNT[size];
  const secretCount = rng.between(min, max);

  const secrets: SettlementSecret[] = [];
  // Start with existing secrets from other settlements to avoid world-wide duplicates
  const usedSecrets = new Set<string>(existingSecretTexts);

  for (let i = 0; i < secretCount; i++) {
    const severity = pickSeverity(rng, size);
    const secret = generateSecret(
      rng,
      severity,
      usedSecrets,
      npcIds,
      factionIds,
      sites,
      mayorNpcId
    );

    if (secret) {
      secrets.push(secret);
    }
  }

  return secrets;
}
