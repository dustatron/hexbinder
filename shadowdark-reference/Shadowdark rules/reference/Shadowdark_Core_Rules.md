# Shadowdark RPG - Core Rules Reference

## The d20 Roll-Over System

Everything in Shadowdark uses a simple formula:
**d20 + ability modifier + bonuses vs DC (Difficulty Class)**

### Difficulty Classes
| Difficulty | DC |
|------------|-----|
| Easy | 9 |
| Normal | 12 |
| Hard | 15 |
| Extreme | 18 |

### When to Roll
Only roll when ALL of these apply:
- The action has potential negative consequences
- The action requires skill
- There is time pressure

If there's no time pressure and no consequence for failure, the character simply succeeds.

### Advantage and Disadvantage
- **Advantage**: Roll 2d20, take the highest
- **Disadvantage**: Roll 2d20, take the lowest
- They cancel each other out if both apply

---

## Ability Scores

Six abilities, each with a modifier from -4 to +4 (typically):

| Score | Modifier |
|-------|----------|
| 3 | -4 |
| 4-5 | -3 |
| 6-7 | -2 |
| 8-9 | -1 |
| 10-11 | +0 |
| 12-13 | +1 |
| 14-15 | +2 |
| 16-17 | +3 |
| 18 | +4 |

### Ability Uses
- **STR**: Melee attacks, climbing, breaking things, carrying capacity
- **DEX**: Ranged attacks, initiative, stealth, AC (if wearing light armor)
- **CON**: Hit points, resisting poison/disease, death saves, endurance
- **INT**: Wizard spells, knowledge, navigation, stabilizing dying creatures
- **WIS**: Priest spells, perception, insight, morale
- **CHA**: Reaction rolls, persuasion, intimidation

---

## Distance Categories

Shadowdark uses abstract distance rather than precise measurements:

| Category | Distance | Movement |
|----------|----------|----------|
| Close | 5 feet | Can reach without moving |
| Near | Within 30 feet | Can move to in one action |
| Far | Beyond 30 feet | Requires multiple moves or ranged attacks |

---

## Combat

### Initiative (EACH ROUND)
**Important**: Initiative is rolled every round, not just at the start of combat!

1. Everyone rolls d20 + DEX modifier
2. Highest goes first
3. Play proceeds clockwise from the winner
4. Re-roll at the start of each new round

### Actions in Combat
On your turn you can:
- Move (near distance)
- Take one action (attack, cast spell, use item, etc.)
- Take one free action (speak briefly, drop item)

### Attack Rolls
- **Melee**: d20 + STR modifier + weapon bonus vs target's AC
- **Ranged**: d20 + DEX modifier + weapon bonus vs target's AC
- **Finesse weapons**: Can use DEX for melee attacks

### Damage
- Roll weapon damage die
- Add STR modifier (melee) or DEX modifier (ranged/finesse)
- Minimum damage is always 1

### Critical Hits (Natural 20)
Double ALL dice rolled for damage (including bonus dice from any source).

### Fumbles (Natural 1)
GM's discretion - could be dropping weapon, hitting ally, or just a miss.

### Surprise
Attackers have **advantage** on attack rolls against surprised creatures.

### Cover
- **Partial Cover**: Attacker has disadvantage
- **Full Cover**: Cannot be targeted

### Rough Terrain
Move at half speed through difficult terrain.

### Morale Checks
When enemies reach **half health** OR **half their original numbers**:
- DC 15 WIS check or they flee
- GM can choose to have intelligent enemies surrender instead

### Knockout
When reducing a creature to 0 HP, you can choose to knock them unconscious instead of killing them.

---

## Death and Dying

### At 0 HP
1. You are **dying** (unconscious)
2. Roll d4 + CON modifier = rounds until death (minimum 1 round)
3. Each round, you can roll a d20:
   - **Natural 20**: Rise with 1 HP
   - Otherwise: Timer continues

### Stabilizing
Another character can attempt to stabilize you:
- **DC 15 INT check**
- Success: You stop dying but remain unconscious at 0 HP
- Failure: Uses their action but doesn't help

### Healing
Any healing (spell, potion, rest) while dying:
- Brings you to the HP healed
- You regain consciousness

---

## Armor Class

Base AC = 10 (unarmored)

| Armor | AC | Properties |
|-------|-----|------------|
| Leather | 11 + DEX | - |
| Chainmail | 13 + DEX | Disadvantage on stealth/swimming |
| Plate | 15 (no DEX) | Can't swim, disadvantage on stealth |
| Shield | +2 | Occupies one hand |

---

## Gear Slots

**Carrying Capacity** = 10 + STR modifier slots

- Most items = 1 slot
- Tiny items can bundle (10 coins = 1 slot, 20 arrows = 1 slot)
- First backpack is free
- First pouch of coins is free
- Armor worn doesn't count toward slots

**Over-encumbered**: If carrying more than your limit, you have disadvantage on all physical checks and move at half speed.

---

## Light and Darkness

### Light Sources
| Source | Range | Duration |
|--------|-------|----------|
| Torch | Near (30 ft) | 1 hour (real time) |
| Lantern | Near (30 ft) | 3 hours per oil flask |
| Candle | Close (5 ft) | 1 hour |
| Campfire | Near (30 ft) | 8 hours (attended) |

### Tracking Light
**Real-time tracking**: A torch lasts 1 hour of real play time.

If you need to determine remaining time mid-session: Roll 1d6 × 10 minutes.

### Total Darkness
When the last light goes out:
- **Disadvantage** on all sight-based checks
- Environment becomes **deadly** danger level
- Random encounter checks happen **every round**

This is the core tension of Shadowdark - light is life!

---

## Resting

### Requirements
- Consume 1 ration
- Sleep for 8 uninterrupted hours
- Must be in a safe location

### Benefits
- Regain ALL lost HP
- Recover any stat damage
- Regain all expended spells
- Regain all daily-use abilities

### Interrupted Rest
If interrupted:
- Make DC 12 CON check
- **Failure**: Ration consumed, no benefits gained
- **Success**: Still gain rest benefits

### Campfire
Combine 3 torches to create a campfire:
- Lasts up to 8 hours while someone tends it
- Provides light to near distance
- Can cook food, provide warmth

---

## Random Encounters

### Check Frequency
| Danger Level | Dungeon | Overland |
|--------------|---------|----------|
| Unsafe | Every 3 rounds | Every 3 hours |
| Risky | Every 2 rounds | Every 2 hours |
| Deadly | Every round | Every 1 hour |

Roll d6: Encounter occurs on a 1.

### Starting Distance (d6)
| Roll | Distance |
|------|----------|
| 1 | Close (5 ft) |
| 2-4 | Near (30 ft) |
| 5-6 | Far (beyond 30 ft) |

### Monster Activity (2d6)
| Roll | Activity |
|------|----------|
| 2-4 | Hunting |
| 5-6 | Eating |
| 7-8 | Building/nesting |
| 9-10 | Socializing/playing |
| 11 | Guarding |
| 12 | Sleeping |

### Reaction Roll (2d6 + CHA modifier)
| Roll | Attitude |
|------|----------|
| 2-6 | Hostile |
| 7-8 | Suspicious |
| 9 | Neutral |
| 10-11 | Curious |
| 12+ | Friendly |

### Treasure
50% chance (coin flip) that a random encounter has treasure.

---

## Luck Tokens

- Each player can hold **maximum 1** luck token at a time
- Spend to **re-roll any roll** you just made (must use new result)
- Can give your token to another player
- GM awards for clever play, good roleplay, heroic actions

---

## XP and Advancement

### XP for Gold
**1 XP per 1 GP** of treasure retrieved to a safe haven (town, stronghold, etc.)

The treasure must be:
- Actually returned to safety
- Monetary (gold, gems, art objects, trade goods)
- Not quest rewards or payment for services

### Carousing
Between adventures, spend gold carousing for XP:
- Spend gold in town on revelry
- 1 GP spent = 1 XP gained
- Roll for consequences (see Carousing rules)

### Level Progression
Characters advance when they accumulate enough XP. Each level grants:
- Roll new hit die, add CON modifier (minimum 1)
- Roll on class talent table
- Spellcasters may learn new spells
