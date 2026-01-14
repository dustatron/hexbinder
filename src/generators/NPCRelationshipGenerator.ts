import type {
  NPC,
  NPCRelationship,
  NPCRelationshipType,
  NPCRelationshipSentiment,
  Settlement,
} from "~/models";
import { SeededRandom, createWeightedTable } from "./SeededRandom";

// === Sentiment Weights ===

const FAMILY_SENTIMENT_WEIGHTS = createWeightedTable<NPCRelationshipSentiment>({
  love: 40,
  respect: 25,
  indifferent: 15,
  resentment: 12,
  hate: 5,
  fear: 3,
});

const NON_FAMILY_SENTIMENT_WEIGHTS = createWeightedTable<NPCRelationshipSentiment>({
  respect: 30,
  indifferent: 25,
  resentment: 20,
  hate: 10,
  love: 10,
  fear: 5,
});

export interface FamilyCluster {
  parentIds: string[];
  childIds: string[];
  siblingGroups: string[][]; // Groups of siblings
}

export interface RelationshipGeneratorOptions {
  seed: string;
  npcs: NPC[];
  settlements: Settlement[];
}

export interface RelationshipGeneratorResult {
  npcs: NPC[]; // NPCs with relationships populated
  families: Map<string, FamilyCluster>; // settlementId -> family clusters
}

/**
 * Generate family clusters and relationships between NPCs.
 * Updates NPCs with relationship data.
 */
export function generateNPCRelationships(
  options: RelationshipGeneratorOptions
): RelationshipGeneratorResult {
  const { seed, npcs, settlements } = options;
  const rng = new SeededRandom(`${seed}-relationships`);
  const families = new Map<string, FamilyCluster>();

  // Create mutable copy (preserve all fields including flavorWant)
  const updatedNPCs = npcs.map((npc) => ({
    ...npc,
    relationships: [...npc.relationships],
    wants: [...npc.wants],
  }));
  const npcMap = new Map(updatedNPCs.map((n) => [n.id, n]));

  // Generate families within each settlement
  for (const settlement of settlements) {
    const settlementNPCs = updatedNPCs.filter((n) => n.locationId === settlement.id);
    if (settlementNPCs.length < 3) continue;

    const cluster = generateFamilyCluster(rng, settlementNPCs, npcMap);
    families.set(settlement.id, cluster);
  }

  // Generate cross-settlement relationships (10% of NPCs have relatives elsewhere)
  generateCrossSettlementRelationships(rng, updatedNPCs, settlements, npcMap);

  // Generate rivalries and friendships within settlements
  generateLocalRivalries(rng, updatedNPCs, settlements, npcMap);

  return { npcs: updatedNPCs, families };
}

/**
 * Generate family clusters within a settlement.
 */
function generateFamilyCluster(
  rng: SeededRandom,
  settlementNPCs: NPC[],
  npcMap: Map<string, NPC>
): FamilyCluster {
  const parentIds: string[] = [];
  const childIds: string[] = [];
  const siblingGroups: string[][] = [];

  // Sort by age to identify potential parents/children
  const byAge = [...settlementNPCs].sort((a, b) => (b.age ?? 40) - (a.age ?? 40));

  // Group into families: older NPCs (40+) can be parents of younger ones
  const potentialParents = byAge.filter((n) => (n.age ?? 40) >= 40);
  const potentialChildren = byAge.filter((n) => (n.age ?? 40) < 40);

  // Create 1-2 family groups
  const familyCount = Math.min(rng.between(1, 2), Math.floor(potentialParents.length / 2));

  for (let i = 0; i < familyCount; i++) {
    if (potentialParents.length < 2) break;

    // Pick a parent couple (spouse relationship)
    const parent1 = potentialParents.shift()!;
    const parent2 = potentialParents.shift()!;
    parentIds.push(parent1.id, parent2.id);

    // Create spouse relationship
    addRelationship(npcMap, parent1.id, parent2.id, "spouse", "love");
    addRelationship(npcMap, parent2.id, parent1.id, "spouse", "love");

    // Find children (age gap 20-40 years)
    const childCandidates = potentialChildren.filter((c) => {
      const parentAge = Math.min(parent1.age ?? 50, parent2.age ?? 50);
      const childAge = c.age ?? 25;
      const gap = parentAge - childAge;
      return gap >= 20 && gap <= 45;
    });

    // 1-3 children per family
    const childCount = Math.min(rng.between(1, 3), childCandidates.length);
    const familyChildren: string[] = [];

    for (let j = 0; j < childCount; j++) {
      const child = childCandidates[j];
      if (!child) break;

      childIds.push(child.id);
      familyChildren.push(child.id);

      // Remove from potential children pool
      const idx = potentialChildren.indexOf(child);
      if (idx > -1) potentialChildren.splice(idx, 1);

      // Parent-child relationships
      const sentiment = rng.pickWeighted(FAMILY_SENTIMENT_WEIGHTS);
      addRelationship(npcMap, parent1.id, child.id, "child", sentiment);
      addRelationship(npcMap, parent2.id, child.id, "child", sentiment);
      addRelationship(npcMap, child.id, parent1.id, "parent", sentiment);
      addRelationship(npcMap, child.id, parent2.id, "parent", sentiment);
    }

    // Sibling relationships
    if (familyChildren.length > 1) {
      siblingGroups.push(familyChildren);
      for (let a = 0; a < familyChildren.length; a++) {
        for (let b = a + 1; b < familyChildren.length; b++) {
          const sentiment = rng.pickWeighted(FAMILY_SENTIMENT_WEIGHTS);
          addRelationship(npcMap, familyChildren[a], familyChildren[b], "sibling", sentiment);
          addRelationship(npcMap, familyChildren[b], familyChildren[a], "sibling", sentiment);
        }
      }
    }
  }

  return { parentIds, childIds, siblingGroups };
}

/**
 * Generate relationships between NPCs in different settlements.
 */
function generateCrossSettlementRelationships(
  rng: SeededRandom,
  npcs: NPC[],
  settlements: Settlement[],
  npcMap: Map<string, NPC>
): void {
  if (settlements.length < 2) return;

  // 10% of NPCs have cross-settlement relatives
  const crossCount = Math.max(1, Math.floor(npcs.length * 0.1));

  for (let i = 0; i < crossCount; i++) {
    const npc1 = rng.pick(npcs);
    const otherSettlementNPCs = npcs.filter(
      (n) => n.locationId !== npc1.locationId && !hasRelationship(npc1, n.id)
    );

    if (otherSettlementNPCs.length === 0) continue;

    const npc2 = rng.pick(otherSettlementNPCs);

    // Cross-settlement relations: sibling, former_lover, or friend
    const relType = rng.pick(["sibling", "former_lover", "friend"] as NPCRelationshipType[]);
    const sentiment = rng.pickWeighted(NON_FAMILY_SENTIMENT_WEIGHTS);

    addRelationship(npcMap, npc1.id, npc2.id, relType, sentiment);
    addRelationship(npcMap, npc2.id, npc1.id, relType, sentiment);
  }
}

/**
 * Generate rivalries and friendships within settlements.
 */
function generateLocalRivalries(
  rng: SeededRandom,
  npcs: NPC[],
  settlements: Settlement[],
  npcMap: Map<string, NPC>
): void {
  for (const settlement of settlements) {
    const localNPCs = npcs.filter((n) => n.locationId === settlement.id);
    if (localNPCs.length < 3) continue;

    // 1-2 rivalries per settlement
    const rivalryCount = rng.between(1, 2);
    for (let i = 0; i < rivalryCount; i++) {
      const candidates = localNPCs.filter((n) => {
        // Prefer NPCs with roles (shopkeepers, merchants) for rivalries
        return n.role && ["shopkeeper", "merchant", "innkeeper", "blacksmith"].includes(n.role);
      });

      if (candidates.length < 2) continue;

      const rival1 = rng.pick(candidates);
      const rival2Candidates = candidates.filter(
        (n) => n.id !== rival1.id && !hasRelationship(rival1, n.id)
      );
      if (rival2Candidates.length === 0) continue;

      const rival2 = rng.pick(rival2Candidates);
      const sentiment = rng.pick(["hate", "resentment"] as NPCRelationshipSentiment[]);

      addRelationship(npcMap, rival1.id, rival2.id, "rival", sentiment);
      addRelationship(npcMap, rival2.id, rival1.id, "rival", sentiment);
    }
  }
}

// === Helpers ===

function addRelationship(
  npcMap: Map<string, NPC>,
  sourceId: string,
  targetId: string,
  type: NPCRelationshipType,
  sentiment: NPCRelationshipSentiment
): void {
  const source = npcMap.get(sourceId);
  if (!source) return;

  // Don't add duplicate relationships
  if (source.relationships.some((r) => r.targetNpcId === targetId)) return;

  source.relationships.push({
    targetNpcId: targetId,
    type,
    sentiment,
  });
}

function hasRelationship(npc: NPC, targetId: string): boolean {
  return npc.relationships.some((r) => r.targetNpcId === targetId);
}

/**
 * Get all relatives of an NPC (family relationships).
 */
export function getRelatives(npc: NPC): NPCRelationship[] {
  const familyTypes: NPCRelationshipType[] = ["parent", "child", "sibling", "spouse"];
  return npc.relationships.filter((r) => familyTypes.includes(r.type));
}

/**
 * Get enemies and rivals of an NPC.
 */
export function getEnemies(npc: NPC): NPCRelationship[] {
  return npc.relationships.filter(
    (r) => r.type === "enemy" || r.type === "rival" || r.sentiment === "hate"
  );
}
