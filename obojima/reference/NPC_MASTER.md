# Obojima NPC Master Reference

Definitive NPC list for generation. Each entry has all fields needed by the TypeScript `NPC` interface.
Cross-referenced from: `obojima_raw.txt`, `npcs.md`, `FACTIONS.md`.

---

## Model Gap Analysis

### TypeScript Changes Required Before Generation

**`NPCRace` — add Obojima species:**
```typescript
export type NPCRace =
  | "human" | "elf" | "nakudama" | "dara"
  | "spirit" | "oni" | "fish_folk" | "awakened_animal";
```

**`NPCGender` — add nonbinary:**
```typescript
export type NPCGender = "male" | "female" | "nonbinary";
```

**`CreatureArchetype` — expand or use string:**
Current enum (commoner/bandit/guard/knight/assassin/witch/priest/noble/merchant/scholar/thief/cultist) is too narrow. The existing JSON already uses non-standard values (warrior, sage, guardian, villain, trickster, scout, artisan, healer). Recommend changing to `string` with documented conventions, or expand the enum.

**`NPCRole` — change to `string`:**
Current enum has 19 values. Obojima uses 80+ unique roles (ramen chef, truffle hunter, sand witch, rockwinder, etc.). Make it a free string.

**Add companion spirit field:**
```typescript
export interface CompanionSpirit {
  name: string;
  species: string; // "pelican", "crab", "octopus", "cat", etc.
  description: string;
}
```

**Add to NPC interface:**
```typescript
companion?: CompanionSpirit;
aliases?: string[];      // ["Grimcloak"] for Nuharo
trueIdentity?: string;   // "oni sorcerer" for Chisuay
```

---

## Field Key

Each NPC entry uses this format:
```
### Name
species gender | archetype | TL# | status
Faction: Name (role) | Location: Place — Region
Feature: visual identifier
Companion: spirit name (species) — description
Role: functional role in world
Want: motivation/desire
Secret: hidden info (if any)
Relationships: named connections
Tags: keywords
> Description (1-3 sentences from source)
```

---

## 1. Mariners' Guild

### Captain Clintock
human male | knight | TL3 | alive
**Faction:** Mariners' Guild (leader) | **Location:** Coastal Divers' Lodge (South) — Gift of Shuritashi
**Feature:** Uniform tailored to match a First Age action figure ship captain
**Companion:** —
**Role:** guild founder, Pointue captain
**Want:** Recover the Aquatic Stabilizer; find Corruption's origin point
**Secret:** —
**Relationships:** Father→Paloma, Father→Holly, Widower (Kara, deceased), Friend→Leobini
**Tags:** founder, captain, explorer, family-man, Corruption-researcher
> Guild founder. Man of few words but commanding presence. Insatiably curious, driven, introspective. Currently stranded at southern lodge researching Corruption samples. Loves his daughters more than anything except the sea.

### Paloma Clintock
human female | knight | TL3 | alive
**Faction:** Mariners' Guild (lieutenant) | **Location:** Coastal Divers' Lodge (South) — Gift of Shuritashi
**Feature:** Wears a magical cloak of mist; built her own catamaran the Shrike
**Companion:** —
**Role:** lodge caretaker, solo raider
**Want:** Destroy the Lionfish King's hold on the Shallows
**Secret:** Recently infected with Corruption from a fish folk dart — hasn't told anyone
**Relationships:** Daughter→Captain Clintock, Sister→Holly
**Tags:** fearless, reckless, diver, infected, catamaran
> Captain's eldest daughter, caretaker of southern lodge. Fearless bordering on reckless. Values lodge members as closer than family. Launching solo raids into Lionfish King's domain.

### Holly Clintock
human female | scholar | TL3 | alive
**Faction:** Mariners' Guild (lieutenant) | **Location:** Pelican's Nest Lighthouse (Northern Lodge) — Land of Hot Water
**Feature:** Always has useful tools hanging from her belt, talks to them like old friends
**Companion:** —
**Role:** engineer, shipwright, northern lodge head
**Want:** Finish hull patch for the Pointue; complete the new ship Windward
**Secret:** —
**Relationships:** Daughter→Captain Clintock, Sister→Paloma, Familial→Marcel
**Tags:** engineer, inventor, optimistic, Lionfish-King-target
> Captain's younger daughter. Gifted engineer and shipwright. Optimistic, sense of wonder, prefers workshop work to people. Designed the current Pointue and diving suits. Lionfish King's #1 target.

### Figby
nakudama male | commoner | TL2 | alive
**Faction:** Mariners' Guild (member) | **Location:** Coastal Divers' Lodge (South) — Gift of Shuritashi
**Feature:** Boisterous, quick to laugh
**Companion:** —
**Role:** naturalist, musician, chef, freediver
**Want:** Track the rare "strobe fish"
**Secret:** Discovered that the spirit Ogo Mo Vogo will transport trusted people to the seafloor
**Relationships:** —
**Tags:** glue, accordion, cook, naturalist
> Naturalist, musician, chef, and freediver extraordinaire. "The glue that keeps the lodge together." Morning dives for fish, cooks meals, plays accordion.

### Leobini
human male | commoner | TL1 | alive
**Faction:** Mariners' Guild (member) | **Location:** Coastal Divers' Lodge (South) — Gift of Shuritashi
**Feature:** Moves with help of a crab spirit who carries him
**Companion:** Mr. Tamlin (crab spirit) — carries Leobini on its back
**Role:** navigator, storyteller
**Want:** Share his thousand stories before he dies
**Secret:** —
**Relationships:** Friend→Captain Clintock
**Tags:** ancient, storyteller, sea-lore, crab-rider
> Ancient navigator, Captain's closest friend. Has a thousand stories about sea monsters, brave sailors, and foolish captains. Lived at the lodge longer than anyone.

### Dahlia
elf female | scholar | TL1 | alive
**Faction:** Mariners' Guild (member) | **Location:** Coastal Divers' Lodge (South) — Gift of Shuritashi
**Feature:** Owns the island's largest action figure collection
**Companion:** —
**Role:** apprentice diver, researcher
**Want:** Understand First Age objects from the Shallows
**Secret:** —
**Relationships:** Orphan (father died on expedition, mother died months prior)
**Tags:** bookworm, action-figures, Corruption-research, orphan
> Elf apprentice diver. Orphaned. Bookworm who investigates First Age objects from the Shallows. Assisting Captain Clintock with Corruption research.

### Marcel
human male | commoner | TL2 | alive
**Faction:** Mariners' Guild (member) | **Location:** Pelican's Nest Lighthouse (Northern Lodge) — Land of Hot Water
**Feature:** Broad-shouldered, tall, thick mustache, blind; tattooed arms depicting mythical marine life
**Companion:** Disaster (pelican spirit) — prideful, claims Pelican's Nest named for it
**Role:** lighthouse keeper
**Want:** Keep the lighthouse running and Holly safe
**Secret:** —
**Relationships:** Familial→Holly (unspoken mutual bond)
**Tags:** blind, lighthouse, sonar, tattooed
> Blind lighthouse keeper at Pelican's Nest. Navigates using Holly's modified First Age fish finder (sonar rig). Accompanied by pelican spirit Disaster.

---

## 2. The Lionfish King's Domain

### The Lionfish King
fish_folk male | noble | TL5 | alive
**Faction:** Lionfish King (leader) | **Location:** Coral Castle — The Shallows
**Feature:** Bristling mane of spines that betrays his mood
**Companion:** —
**Role:** self-proclaimed monarch of Western Shallows
**Want:** Marry a nakudama royal descendant for legitimacy; destroy Captain Clintock
**Secret:** Fearful of the Corruption encroaching on his reef
**Relationships:** Enemy→Captain Clintock, Enemy→Holly, Lord→Sleethar, Lord→Bloodfin
**Tags:** vain, pompous, paranoid, tyrant, feud
> Self-proclaimed monarch. Pompous, moody, vain, egotistical — but not a psychopath. Can be reasoned with if skewed in his favor. Rules by bullying and guile.

### Sleethar
spirit male | witch | TL3 | alive
**Faction:** Lionfish King (lieutenant) | **Location:** Coral Castle — The Shallows
**Feature:** Moray eel form, shrewd eyes
**Companion:** —
**Role:** royal consigliere, ocean mage
**Want:** Crack the Royal Lineages code before the King executes him
**Secret:** Could be turned into an ally if approached carefully
**Relationships:** Serves→Lionfish King (fearfully)
**Tags:** moray-eel, mage, cowardly, shrewd, potential-ally
> Moray eel royal consigliere and ocean mage. Fears his lord, under constant pressure to crack the Royal Lineages. Cowardly but shrewd and cunning.

### Bloodfin the Foul
fish_folk female | knight | TL4 | alive
**Faction:** Lionfish King (agent, exiled) | **Location:** Sunken First Age Town — The Shallows
**Feature:** Battle-scarred, commands a pirate band
**Companion:** Borisss (sea snake spirit) — fiercely loyal, coiled around a teddy bear
**Role:** pirate captain (exiled)
**Want:** Get back into the King's good graces
**Secret:** Being manipulated by sea hag Slurpgill who wants to turn her into a hag
**Relationships:** Controls→Lucinda (hostage), Manipulated-by→Slurpgill
**Tags:** pirate, exile, wild-card, hag-target
> Exiled female fish folk captain. Leads a pirate band from a sunken First Age town. Desperately wants back into the King's good graces. Could rejoin King or defect to Venomous Rex.

### Morris
spirit male | commoner | TL1 | alive
**Faction:** Lionfish King (member) | **Location:** Moxy's Music Grotto (sunken) — The Shallows
**Feature:** Giant seahorse form
**Companion:** —
**Role:** cowardly servant
**Want:** Survive
**Secret:** Will lie to or tattle on outsiders to save himself
**Relationships:** Serves→Bloodfin, Fears→Slurpgill
**Tags:** seahorse, cowardly, informant
> Giant seahorse spirit. Cowardly, intimidated into serving Bloodfin. Terrified of Slurpgill. Hangs out in a sunken First Age music store.

### Lucinda
awakened_animal female | commoner | TL3 | captured
**Faction:** — | **Location:** Sunken First Age Town — The Shallows
**Feature:** Giant octopus, gentle nature
**Companion:** —
**Role:** forced guard (eggs held hostage)
**Want:** Free her eggs from Bloodfin's giant clam
**Secret:** —
**Relationships:** Captive-of→Bloodfin
**Tags:** octopus, hostage, rescue-target, gentle
> Awakened giant octopus, gentle creature. Bloodfin holds her eggs hostage in a giant clam, forcing Lucinda to act as junkyard dog.

### Slurpgill
spirit female | witch | TL5 | alive
**Faction:** — | **Location:** Unknown — The Shallows
**Feature:** Sea hag form; all water spirits tremble at her name
**Companion:** —
**Role:** shadow power, hag recruiter
**Want:** Build a coven by turning Bloodfin into a hag
**Secret:** Lair location unknown
**Relationships:** Manipulates→Bloodfin
**Tags:** sea-hag, recurring-nemesis, coven-builder, terrifying
> Sea hag, shadow power over Bloodfin's exile band. All water spirits tremble at her name. Designed as a recurring underwater nemesis.

### The Venomous Rex
fish_folk male | knight | TL5 | alive
**Faction:** — (rival to Lionfish King) | **Location:** Eastern Deep Sea — The Shallows
**Feature:** Commands corrupted fish folk
**Companion:** —
**Role:** deep-sea warlord
**Want:** Encroach on Lionfish King's territory
**Secret:** Forces corrupted by the Corruption
**Relationships:** Enemy→Lionfish King
**Tags:** corrupted, deep-sea, warlord, eastern-threat
> Commands corrupted fish folk from the deep east. Pressures Lionfish King from the opposite side of the Corruption front.

---

## 3. AHA (Archaeologists, Historians & Archivists)

### Uba
dara male | scholar | TL2 | alive
**Faction:** AHA (leader — Asloh) | **Location:** AHA HQ Observatory — Coastal Highlands
**Feature:** Towering blue dara
**Companion:** —
**Role:** Chief Archivist
**Want:** Share knowledge with genuinely interested visitors
**Secret:** Once let a charlatan scholar steal a tome detailing Mount Arbora cave networks
**Relationships:** Co-leader→Gurriko, Co-leader→Loninni
**Tags:** archivist, teacher, blue-dara, shame
> Chief Archivist. Stays at HQ overseeing the Archive. Teacher mentality, believes everyone can contribute worthy ideas.

### Gurriko
nakudama nonbinary | scholar | TL2 | alive
**Faction:** AHA (leader — Asloh) | **Location:** AHA HQ Observatory — Coastal Highlands
**Feature:** —
**Companion:** —
**Role:** archaeologist, ancient building techniques specialist
**Want:** Understand First Age construction methods
**Secret:** —
**Relationships:** Co-leader→Uba, Co-leader→Loninni
**Tags:** archaeologist, nakudama, building-techniques
> Archaeologist of the Asloh. Interested in ancient building techniques.

### Loninni
human nonbinary | scholar | TL2 | alive
**Faction:** AHA (leader — Asloh) | **Location:** AHA HQ Observatory — Coastal Highlands
**Feature:** —
**Companion:** —
**Role:** historian, Mount Arbora foothills specialist
**Want:** Document pre-First Age history
**Secret:** —
**Relationships:** Co-leader→Uba, Co-leader→Gurriko
**Tags:** historian, foothills
> Historian of the Asloh. From Mount Arbora foothills.

### Lonzo
human male | commoner | TL1 | alive
**Faction:** AHA (member) | **Location:** AHA HQ Observatory — Coastal Highlands
**Feature:** Grizzled, voice like gravel
**Companion:** —
**Role:** telescope operator
**Want:** Decode the mysterious radio "war dispatches"
**Secret:** A First Age radio he keeps emits white noise interrupted by garbled language snippets he claims are "dispatches about some war"
**Relationships:** —
**Tags:** telescope, grizzled, old, radio-mystery
> Grizzled, grumbly, oldest AHA member. Spends time alone at the telescope, nodding off occasionally. Keeps a First Age radio that emits mysterious war dispatches.

### Chloe
elf female | scholar | TL2 | alive
**Faction:** AHA (member) | **Location:** AHA HQ Observatory — Coastal Highlands
**Feature:** Workshop full of partially assembled devices and scattered tools
**Companion:** Half a dozen companion spirits (unnamed)
**Role:** wizard-archaeologist, cassette player specialist
**Want:** Collect more First Age music (louder = better)
**Secret:** —
**Relationships:** —
**Tags:** wizard, cassette-player, music, elf, First-Age-tech
> Wizard obsessed with First Age technology. Specialty: cassette players. Avid collector of First Age music — the louder, the better.

### Vutochi
spirit male | witch | TL3 | alive
**Faction:** AHA (member) | **Location:** Various (eastern coastline, Brackwater) — Island-wide
**Feature:** Dispassionate air, enters trances; cat form in Physical Realm, tall imposing mage in Spirit Realm
**Companion:** —
**Role:** Corruption researcher
**Want:** Find fish that escaped skeletonization from the Corruption
**Secret:** Exists simultaneously in both Physical and Spirit Realm
**Relationships:** —
**Tags:** cat-spirit, dual-realm, Corruption-expert, foremost-researcher
> Foremost expert on the Corruption. Appears as a cat spirit but transforms into a tall imposing mage in the Spirit Realm. Searches the eastern coastline for surviving fish.

### Mortimus Fids
human male | noble | TL2 | alive
**Faction:** AHA (member) | **Location:** Yatamon Library Outpost — Gift of Shuritashi
**Feature:** Pompous demeanor, makes people grovel
**Companion:** —
**Role:** head curator, Yatamon outpost
**Want:** Be respected and deferred to
**Secret:** —
**Relationships:** Commands→~20 AHA library staff
**Tags:** snob, self-important, gatekeeper, library
> Head Curator of the Yatamon library outpost. Rules with self-importance and snobbery. Will make adventurers grovel and ego-stroke before sharing information.

### Dr. Zalia Frond
human female | scholar | TL2 | alive
**Faction:** AHA (member) | **Location:** Yatamon Undercity — Gift of Shuritashi
**Feature:** Affable, enthusiastic
**Companion:** —
**Role:** archaeologist, undercity excavation lead
**Want:** Map the ancient subway tunnels beneath Yatamon
**Secret:** Being manipulated by Krocius to dig toward Oghmai's prison
**Relationships:** Partner→Krocius (unknowingly used)
**Tags:** archaeologist, undercity, subway, affable
> Leads the ongoing underground excavation beneath Yatamon's undercity. Affable, enthusiastic.

### Krocius
nakudama male | scholar | TL3 | alive
**Faction:** AHA (member) / Deep Current (operative) | **Location:** Yatamon Undercity — Gift of Shuritashi
**Feature:** Reserved, soft-spoken, lets Dr. Frond do the talking
**Companion:** —
**Role:** claimed Second Age scholar (cover); Deep Current primary operative (true)
**Want:** Find the lost prison of ancient nakudama emperor Oghmai
**Secret:** Using Frond and AHA to delve toward passages leading to Mount Arbora's core — the prison
**Relationships:** Partner→Dr. Frond (manipulating), Agent→Deep Current "the Voice"
**Tags:** spy, Deep-Current, Oghmai, double-agent, nakudama
> Posing as a Second Age scholar. Reserved, soft-spoken. Secretly steering AHA dig toward dangerous areas searching for Oghmai's prison.

### Isabel Skiff
human female | scholar | TL2 | alive
**Faction:** AHA (member) | **Location:** Toggle — Mount Arbora
**Feature:** Well-funded, dapper clothes that stick out among miners
**Companion:** —
**Role:** field researcher, gemstone hunter
**Want:** Find a rare gemstone called a dragon's fist
**Secret:** —
**Relationships:** —
**Tags:** high-society, earnest, gemstone, Toggle
> High-society AHA member stationed at Toggle. Hunting for a rare gemstone called a dragon's fist. Sticks out among miners but earnest about rolling up her sleeves.

### Dini
nakudama nonbinary | scholar | TL2 | alive
**Faction:** AHA (member) | **Location:** Temple of Shoom — Gift of Shuritashi
**Feature:** —
**Companion:** —
**Role:** field researcher, Shoom expedition leader
**Want:** Document the abandoned Nakudama Age site
**Secret:** —
**Relationships:** —
**Tags:** Shoom, expedition, nakudama-age
> Field researcher. Leads expeditions to Shoom, an abandoned Nakudama Age site.

---

## 4. Fish Head Coven

### Yolikanter Crogiss
nakudama female | witch | TL4 | alive
**Faction:** Fish Head Coven (leader — Council of Three) | **Location:** Witching Tower — Gale Fields
**Feature:** Paranoid, almost always at the Witches' Bridge
**Companion:** —
**Role:** Council Witch, warding magic specialist
**Want:** Locate the 5 remaining Almanac volumes
**Secret:** —
**Relationships:** Co-leader→Bim, Co-leader→Brass Eyes
**Tags:** paranoid, warding, council, Witches-Bridge
> Council Witch. Paranoid, specializes in warding magic. "It's easier to catch a wandering door than to catch Yolikanter by surprise."

### Bim of the Beasts
human female | witch | TL4 | alive
**Faction:** Fish Head Coven (leader — Council of Three) | **Location:** Witching Tower — Gale Fields
**Feature:** Speaks ONLY through animals — never uses her own voice
**Companion:** Various animals (speaks through them)
**Role:** Council Witch, enigmatic
**Want:** —
**Secret:** Unknown age
**Relationships:** Co-leader→Yolikanter, Co-leader→Brass Eyes
**Tags:** enigmatic, animal-speech, council
> Council Witch. Enigmatic. Speaks only through animals — never her own voice. Almost always at the Witches' Bridge.

### Brass Eyes
human male | witch | TL5 | alive
**Faction:** Fish Head Coven (leader — Council of Three) | **Location:** Witching Tower — Gale Fields
**Feature:** Tiny, withered; eyes replaced with brass orbs
**Companion:** —
**Role:** Council Witch, dual-realm presence
**Want:** —
**Secret:** Said to live simultaneously in both Physical and Spirit Realm. No living witch knows his real name
**Relationships:** Co-leader→Yolikanter, Co-leader→Bim
**Tags:** ancient, brass-eyes, dual-realm, mysterious, council
> Council Witch. Tiny, withered. Eyes replaced with brass orbs. Often unclear if he's talking to you or to unseen spirits.

### Tan the Apprentice
human male | commoner | TL1 | alive
**Faction:** Fish Head Coven (member) | **Location:** Witching Tower — Gale Fields
**Feature:** 13 years old; appears to talk to himself (actually talking to invisible Abi)
**Companion:** Abi (invisible spirit) — very protective of Tan
**Role:** apprentice spirit medium
**Want:** Learn to be a spirit medium; explore at night
**Secret:** Sneaks out at night; has a trinket stash at a serpent standing stone
**Relationships:** Apprentice→Ognev
**Tags:** child, spirit-medium, awkward, sneaky, trinket-stash
> Newcomer apprentice (13). Apprentices for renowned Witch Ognev. Awkward kid who appears to talk to himself — actually speaking to invisible spirit companion Abi.

### Ognev
human male | witch | TL3 | alive
**Faction:** Fish Head Coven (member) | **Location:** Witching Tower — Gale Fields
**Feature:** —
**Companion:** —
**Role:** renowned Witch, Tan's master
**Want:** —
**Secret:** —
**Relationships:** Master→Tan
**Tags:** witch, renowned, teacher
> Renowned Witch. Recognized Tan's gift when everyone else thought he was just a weird kid.

### Ermy Flower
human female | witch | TL2 | alive
**Faction:** Fish Head Coven (member) | **Location:** Witching Tower (kiosk below lowest bridge) — Gale Fields
**Feature:** Personable, chatty
**Companion:** Licorice, Sugar, Molasses (three magpies)
**Role:** ingredient kiosk vendor
**Want:** Talk about the best places to eat on the island
**Secret:** —
**Relationships:** —
**Tags:** chatty, ingredients, foodie, magpies
> Runs ingredient kiosk cart below the Witching Tower's lowest bridge. Personable, chatty, loves talking about the best places to eat.

### Alkun
human nonbinary | witch | TL2 | alive
**Faction:** Fish Head Coven (member) | **Location:** Witching Tower — Gale Fields
**Feature:** —
**Companion:** —
**Role:** resident Witch, connected to elder spirit Sorolu
**Want:** Heal the elder spirit Sorolu from its unknown malady
**Secret:** —
**Relationships:** Connected→Sorolu (elder earth/vine spirit)
**Tags:** Sorolu, healing, elder-spirit, desperate
> Has connections to elder spirit Sorolu (made of earth and vines) — would seek help healing it from unknown malady.

### Miss Lindley (retired)
human female | witch | TL3 | alive
**Faction:** Fish Head Coven (ex-member, retired) | **Location:** Okiri Village — Gift of Shuritashi
**Feature:** Accepts odd payment ("a piece of blue glass and a turnip")
**Companion:** —
**Role:** repair specialist, transmutation magic
**Want:** Live quietly in Okiri
**Secret:** Former Council of Three and Thirty member, once one of the most powerful Fish Head witches. Locals don't know she's a witch.
**Relationships:** —
**Tags:** retired, hidden-identity, transmutation, repairs, powerful
> Former Council member, once one of the most powerful Fish Head witches. Retired to Okiri, runs a repair shop using transmutation magic. Locals don't know she's a witch.

---

## 5. Courier Brigade

### Postmaster General Miranda Escalante
human female | knight | TL3 | alive
**Faction:** Courier Brigade (leader) | **Location:** First Age Bank HQ, Yatamon — Gift of Shuritashi
**Feature:** —
**Companion:** —
**Role:** Postmaster General, trains all knights
**Want:** Restore full delivery service to eastern settlements; earn recognition as civil defense force
**Secret:** —
**Relationships:** Commands→Gomber & Beeks, Commands→all postal knights
**Tags:** dutiful, honest, forthcoming, postal-oath, elite-squad
> Oversees training of every knight. Honest, forthcoming. Personally leads an elite squad dispatched to relieve imperiled couriers. "A letter isn't just a piece of paper... these things bind the island."

### Gomber
human male | thief | TL2 | alive
**Faction:** Courier Brigade (member) | **Location:** Yatamon — Gift of Shuritashi
**Feature:** Hard-boiled, straight-shooting
**Companion:** Beeks (paunchy humanoid bird spirit) — only says "Beek!" but Gomber understands perfectly
**Role:** private eye, mail fraud detective
**Want:** Catch package thief Imelda
**Secret:** —
**Relationships:** Partner→Beeks, Hunting→Imelda
**Tags:** detective, hard-boiled, investigator, duo
> Hard-boiled, straight-shooting detective. Part of the Brigade — tracks down mail fraud, apprehends package thieves.

### Wayla
elf female | commoner | TL2 | alive
**Faction:** Courier Brigade (member) | **Location:** Opal Falls — Coastal Highlands
**Feature:** Proudly tells everyone the very first postal box was established at the falls
**Companion:** —
**Role:** River Master, toll collector, dock overseer
**Want:** Honor the legacy of the first postal box
**Secret:** —
**Relationships:** —
**Tags:** river-master, tolls, docks, postal-history
> River Master at Opal Falls. Oversees boat traffic and toll collection. Runs two gangs of dockworkers operating water-powered elevators.

### Lomi
human male | commoner | TL1 | alive
**Faction:** Courier Brigade (aspirant) | **Location:** Yatamon — Gift of Shuritashi
**Feature:** 13 years old, eager but accident-prone
**Companion:** —
**Role:** aspiring postal knight
**Want:** Fix a mis-delivered letter before his sister Ashi finds out
**Secret:** Delivered a letter to the wrong address
**Relationships:** Sibling→Ashi (Courier Brigade knight)
**Tags:** child, eager, accident-prone, aspirant
> 13-year-old boy, younger brother of Ashi (a knight). Dreams of being a postal knight. Delivered a letter to the wrong address and is desperate to fix it.

---

## 6. Cloud Cap Coven

### Nuharo / "Grimcloak"
human female | witch | TL2 | alive
**Faction:** Cloud Cap Coven (agent) | **Location:** The Graysteps / Mount Arbora
**Feature:** 14 years old; disguised as an old Wizard named Grimcloak
**Companion:** —
**Role:** disguised operative, curse/hex reversal specialist
**Want:** Intercept and decode Mount Arbora peak signals
**Secret:** Nobody knows Grimcloak is a Cloud Cap witch — or a 14-year-old girl
**Relationships:** —
**Tags:** disguised, young, Cloud-Cap, curses, hexes, undercover
**Aliases:** Grimcloak
> 14-year-old disguised as old Wizard. Cloud Cap Coven apprentice, reverses curses/hexes. Nobody knows Grimcloak is a Cloud Cap witch.

### Root
human nonbinary | commoner | TL1 | alive
**Faction:** Cloud Cap Coven (member) | **Location:** Mount Arbora high trails
**Feature:** Cheerful but evasive about coven matters
**Companion:** —
**Role:** herb gatherer, trader
**Want:** Tend the high-altitude gardens
**Secret:** —
**Relationships:** —
**Tags:** herbs, fungi, cheerful, evasive, mountain
> Herb gatherer who tends the high-altitude gardens. Trades rare mountain fungi with travelers. Cheerful but evasive about coven matters.

---

## 7. Rangers of the Greenward Path

### Warden Ashka
human female | knight | TL3 | alive
**Faction:** Rangers (leader) | **Location:** Brackwater Wetlands — Brackwater
**Feature:** Half her squad is infected
**Companion:** —
**Role:** field commander, eastern Corruption front
**Want:** Cure infected rangers; push Corruption boundary back
**Secret:** Hiding the true casualty count from island leadership
**Relationships:** Trusted-by→Toraf & Boulder
**Tags:** grim, triage, infected-squad, eastern-front, hiding-truth
> Field commander, eastern Corruption front. Makes brutal triage decisions daily. Trusted by Toraf & Boulder but hiding the true casualty count.

### Scout Fennel
human male | thief | TL2 | alive
**Faction:** Rangers (member) | **Location:** Brackwater Wetlands — Brackwater
**Feature:** Fastest scout in the wetlands; carries hand-drawn Corruption spread maps
**Companion:** —
**Role:** scout, message runner
**Want:** Stay alive and uninfected
**Secret:** —
**Relationships:** Runs-between→Rangers, Runs-between→Toraf & Boulder
**Tags:** fast, young, idealistic, not-yet-infected, maps
> Fastest scout in the wetlands. Runs messages between Ranger outposts and Toraf & Boulder's school. Young, idealistic, not yet infected.

---

## 8. Lom & Salt's College of Arms

### Master Lom
human female | knight | TL4 | alive
**Faction:** Lom & Salt (leader) | **Location:** Mount Arbora upper slopes — Mount Arbora
**Feature:** Rough exterior
**Companion:** —
**Role:** sword master, instructor
**Want:** Forge a legendary blade; re-establish school dominance
**Secret:** —
**Relationships:** Co-leader→Master Salt
**Tags:** demanding, traditional, proud, oldest-school
> Rough exterior, demanding instructor. Co-leader of the oldest martial institution on Obojima.

### Master Salt
elf female | knight | TL4 | alive
**Faction:** Lom & Salt (leader) | **Location:** Mount Arbora upper slopes — Mount Arbora
**Feature:** Grim-faced
**Companion:** —
**Role:** sword master, instructor
**Want:** Obtain First Age metallurgy manuals
**Secret:** —
**Relationships:** Co-leader→Master Lom
**Tags:** exacting, grim, elf, traditional
> Grim-faced master, exacting standards. Co-leader of the oldest sword school.

### Forge-Keeper Duro
dara male | commoner | TL2 | alive
**Faction:** Lom & Salt (member) | **Location:** Toggle — Mount Arbora
**Feature:** Always covered in soot
**Companion:** —
**Role:** master smith, geothermal forge keeper
**Want:** Obtain First Age alloy compositions
**Secret:** —
**Relationships:** Brother→Garo
**Tags:** smith, obsessed-metallurgy, soot, forge, dara
> Master smith at the geothermal forge. Obsessed with First Age alloy compositions. Will talk anyone's ear off about metallurgy.

### Garo
dara male | commoner | TL2 | alive
**Faction:** Lom & Salt (member) | **Location:** Toggle — Mount Arbora
**Feature:** —
**Companion:** —
**Role:** master smith, specialized alloys
**Want:** —
**Secret:** —
**Relationships:** Brother→Duro
**Tags:** smith, alloys, dara
> Master smith, works with brother Duro forging specialized alloys.

### Signet-Bearer Hara
human nonbinary | knight | TL2 | alive
**Faction:** Lom & Salt (member) | **Location:** Various (traveling)
**Feature:** Honorable to a fault
**Companion:** —
**Role:** tournament envoy, challenge signet carrier
**Want:** —
**Secret:** Secretly admires Tellu & Scale's philosophy
**Relationships:** —
**Tags:** honorable, envoy, tournament, secret-admirer
> Senior student who carries the school's challenge signet. Travels to other schools delivering formal tournament invitations.

---

## 9. Canden & Moon's School

### Master Canden
human male | knight | TL4 | alive
**Faction:** Canden & Moon (leader) | **Location:** Yatamon — Gift of Shuritashi
**Feature:** Intimidating to new students, stern
**Companion:** —
**Role:** sword master
**Want:** Absorb or marginalize rival schools; expel Goro Goros
**Secret:** —
**Relationships:** Co-leader→Master Moon
**Tags:** ambitious, polished, stern, political
> Intimidating to new students, stern teacher. Co-leader of the largest sword school.

### Master Moon
human female | knight | TL4 | alive
**Faction:** Canden & Moon (leader) | **Location:** Yatamon — Gift of Shuritashi
**Feature:** Counterbalance to Canden
**Companion:** —
**Role:** sword master
**Want:** —
**Secret:** —
**Relationships:** Co-leader→Master Canden
**Tags:** balanced, counterweight
> Co-master, counterbalance to Canden.

### Instructor Venn
human male | merchant | TL2 | alive
**Faction:** Canden & Moon (member) | **Location:** Yatamon — Gift of Shuritashi
**Feature:** Charismatic, politically savvy
**Companion:** —
**Role:** public recruiter, political negotiator
**Want:** Secure Dawn Blossom coin recognition for the school
**Secret:** Secretly negotiating with Dawn Blossom Guild
**Relationships:** —
**Tags:** charismatic, political, recruiter, Dawn-Blossom-contact
> Public face of the school, runs recruitment demonstrations. Charismatic, politically savvy.

### Student Captain Reiko
human female | knight | TL2 | alive
**Faction:** Canden & Moon (member) | **Location:** Yatamon — Gift of Shuritashi
**Feature:** Frustrated, competitive
**Companion:** —
**Role:** patrol squad leader, Goro Goros hunter
**Want:** Catch the Goro Goros taggers; get a real fight
**Secret:** —
**Relationships:** Hunting→Tatsu, Hunting→Mikiko
**Tags:** competitive, frustrated, patrol, wants-action
> Leads the school's patrol squad that "volunteers" for city watch duty. Actually trying to catch Goro Goros taggers.

---

## 10. Toraf & Boulder's School

### Master Toraf
human male | knight | TL4 | alive
**Faction:** Toraf & Boulder (leader) | **Location:** Brackwater Wetlands — Brackwater
**Feature:** Barking teaching style, no-nonsense
**Companion:** —
**Role:** sword master, combat instructor
**Want:** Reinforcements from other factions
**Secret:** —
**Relationships:** Co-leader→Master Boulder
**Tags:** battle-hardened, blunt, barking, eastern-front
> Barking teaching style, no-nonsense. Co-leader of the only school with real monster-fighting experience.

### Master Boulder
human male | knight | TL4 | alive
**Faction:** Toraf & Boulder (leader) | **Location:** Brackwater Wetlands — Brackwater
**Feature:** Enormous; speaks in short sentences
**Companion:** —
**Role:** patrol leader, frontline fighter
**Want:** Hold the line until Rangers find a cure
**Secret:** —
**Relationships:** Co-leader→Master Toraf
**Tags:** enormous, laconic, judges-by-action, frontline
> Enormous, speaks in short sentences, judges people by what they do not what they say. Personally leads patrols into corrupted territory.

### Quartermaster Jig
human nonbinary | commoner | TL2 | alive
**Faction:** Toraf & Boulder (member) | **Location:** Brackwater Wetlands — Brackwater
**Feature:** Practical, never wastes anything
**Companion:** —
**Role:** supply manager, salvager
**Want:** Keep the school supplied
**Secret:** —
**Relationships:** —
**Tags:** scrounger, practical, First-Age-garage, resourceful
> Manages supplies and salvage from a nearby submerged First Age garage. Scrounges everything — wrenches, ratchets, car jacks repurposed as training equipment.

---

## 11. Dawn Blossom Guild

### The Assessor
human nonbinary | noble | TL3 | alive
**Faction:** Dawn Blossom (agent) | **Location:** Various markets — Island-wide
**Feature:** Masked; carries a First Age coin-pressing stamp
**Companion:** —
**Role:** currency circulation evaluator
**Want:** Maintain currency stability
**Secret:** True identity unknown to everyone
**Relationships:** —
**Tags:** masked, mysterious, currency, anonymous
> Masked figure who appears at markets to evaluate currency circulation. No one knows their real identity. Speaks formally, never makes small talk.

### Mint-Keeper Pollu
human male | merchant | TL2 | alive
**Faction:** Dawn Blossom (member) | **Location:** Hidden minting facility — Unknown
**Feature:** Only person who openly admits working for Dawn Blossom
**Companion:** —
**Role:** minting facility overseer
**Want:** Secure ingredient leads through gossip
**Secret:** —
**Relationships:** —
**Tags:** minting, friendly, gossip, open
> Oversees a hidden minting facility. Friendly with merchants, trades gossip for ingredient leads.

---

## 12. Flying Phin's Airship Service

### Phin
human male | scholar | TL2 | alive
**Faction:** Flying Phin (leader) | **Location:** Broken Bird Airfield — Coastal Highlands
**Feature:** Battered flight jacket with faded insignia; lives in the control tower
**Companion:** —
**Role:** pilot, aviation obsessive
**Want:** Achieve powered flight; fly to the Vanishing Mountain
**Secret:** Was once an AHA member — left to pursue flight obsession. Considers the airfield tech archive his personal treasure.
**Relationships:** Ex-member→AHA
**Tags:** dreamy, reckless, flight-jacket, biplanes, obsessive
> Obsessed with First Age aviation. Will talk about biplanes until you physically leave. Reckless but lovable.

### Mechanic Gretta
human female | commoner | TL2 | alive
**Faction:** Flying Phin (member) | **Location:** Broken Bird Airfield — Coastal Highlands
**Feature:** Pragmatic counterweight to Phin's dreams
**Companion:** —
**Role:** mechanic, glider builder
**Want:** Keep the airfield machinery running
**Secret:** Secretly believes powered flight is impossible without First Age spirits
**Relationships:** Partner→Phin (professional)
**Tags:** pragmatic, glider, mechanic, skeptic
> Keeps the airfield's machinery running. Built a working glider from scavenged parts. Pragmatic counterweight to Phin's dreams.

---

## 13. Goro Goros

### Tatsu
human male | thief | TL2 | alive
**Faction:** Goro Goros (leader) | **Location:** Yatamon underground/rooftops — Gift of Shuritashi
**Feature:** Charismatic troublemaker; jade-green graffiti style
**Companion:** —
**Role:** gang leader, magical graffiti artist
**Want:** Tag every Canden & Moon building; be taken seriously as a real faction
**Secret:** —
**Relationships:** Leader→Mikiko, Hunted-by→Reiko
**Tags:** defiant, creative, graffiti, subway-tunnels, charismatic
> Charismatic troublemaker with a genuine grudge against Yatamon's elite. Tags buildings with elaborate magical graffiti that tells stories.

### Mikiko
human female | witch | TL2 | alive
**Faction:** Goro Goros (member) / Fish Head Coven (secret trainee) | **Location:** Yatamon — Gift of Shuritashi
**Feature:** Young Steward; creates the magic ink
**Companion:** —
**Role:** witch apprentice, magic ink creator
**Want:** Protect the gang; avoid coven discovery
**Secret:** Secretly a Fish Head Coven trainee — the coven doesn't know she's sharing magic with street kids. Torn between loyalty to gang and fear of coven punishment.
**Relationships:** Member→Goro Goros, Secret-member→Fish Head Coven
**Tags:** double-life, magic-ink, Young-Steward, ticking-bomb, guilt
> Witch apprentice who creates the magic ink. Secretly Fish Head trained. Torn between loyalty to the gang and fear of coven punishment. The gang's power depends entirely on her.

---

## 14. Council of Kroo

### Edgarton Hargreaves III
human male | scholar | TL2 | alive
**Faction:** Council of Kroo (leader) | **Location:** Crawling Canopy / Wicked Wizard Tavern — Gale Fields
**Feature:** Wears seven hats stacked on his head
**Companion:** —
**Role:** self-appointed spokesman
**Want:** Complete the "cosmic calculations"; determine if buried thing is weapon or machine
**Secret:** —
**Relationships:** Leader→Penelope, Leader→Sheldrake, Leader→Thurston
**Tags:** eccentric, seven-hats, riddles, cosmic-truths
> Self-appointed spokesman. Wears seven hats. Speaks in riddles that occasionally contain genuine cosmic truths.

### Penelope Mibblethorpe
human female | witch | TL3 | alive
**Faction:** Council of Kroo (member) | **Location:** Crawling Canopy — Gale Fields
**Feature:** —
**Companion:** —
**Role:** witch member
**Want:** —
**Secret:** —
**Relationships:** —
**Tags:** witch, eccentric
> Council witch member.

### Sheldrake Wobbledrain
human male | witch | TL3 | alive
**Faction:** Council of Kroo (member) | **Location:** Crawling Canopy — Gale Fields
**Feature:** —
**Companion:** —
**Role:** warlock member
**Want:** —
**Secret:** —
**Relationships:** —
**Tags:** warlock, eccentric
> Council warlock member.

### Thurston Smorkwaggle
human male | commoner | TL1 | alive
**Faction:** Council of Kroo (member) | **Location:** Gale Fields (wandering)
**Feature:** Carries a bag of floppy disks he calls "the keys"
**Companion:** —
**Role:** "external affairs minister" (actually just wanders and mutters)
**Want:** —
**Secret:** Accidentally gives useful directions to lost travelers
**Relationships:** —
**Tags:** wandering, floppy-disks, accidental-helper, muttering
> "External affairs minister." Actually just wanders the Gale Fields muttering. Accidentally gives useful directions. Carries floppy disks he calls "the keys."

---

## 15. Tellu & Scale's School

### Master Tellu
nakudama male | knight | TL4 | alive
**Faction:** Tellu & Scale (leader) | **Location:** Western coast (migrating) — Gift of Shuritashi
**Feature:** Stout, wide as tall; carries a First Age stopwatch with undecoded functions
**Companion:** —
**Role:** ancient sword master, philosopher
**Want:** Reach the Lilywin ruins; decode the stopwatch
**Secret:** —
**Relationships:** Co-leader→Master Scale
**Tags:** philosopher, koans, stopwatch, nomadic, nakudama, ancient
> Ancient nakudama swordmaster. Speaks in koans. Trains students while walking — the school literally never stops moving.

### Master Scale
human male | knight | TL4 | alive
**Faction:** Tellu & Scale (leader) | **Location:** Western coast (migrating) — Gift of Shuritashi
**Feature:** Down-to-earth, practical
**Companion:** —
**Role:** sword master
**Want:** —
**Secret:** —
**Relationships:** Co-leader→Master Tellu
**Tags:** practical, down-to-earth
> Down-to-earth, practical teacher. Co-leader of the nomadic school.

### Wanderer Ishi
human female | commoner | TL2 | alive
**Faction:** Tellu & Scale (member) | **Location:** Ahead of the school (scouting) — Gift of Shuritashi
**Feature:** World-weary, excellent cook
**Companion:** —
**Role:** recruiter, advance scout
**Want:** —
**Secret:** Carries oral histories in her memory
**Relationships:** —
**Tags:** world-weary, cook, oral-history, recruiter
> Former student turned recruiter. Travels ahead of the school identifying worthy candidates and safe campgrounds. Carries oral histories in her memory.

---

## 16. Crowsworn Coven

### Crow Mother Vex
human female | witch | TL4 | alive
**Faction:** Crowsworn (leader) | **Location:** Brackwater Wetlands compound — Brackwater
**Feature:** Gaunt, intense; surrounded by a permanent murder of crows
**Companion:** Murder of crows (scouts and messengers)
**Role:** coven leader
**Want:** Brew a reliable Corruption-resistance potion; obtain underwater samples from Mariners' Guild
**Secret:** Hasn't slept properly in months
**Relationships:** Ally→Rangers
**Tags:** desperate, gaunt, crows, Corruption-front, exhausted
> Coven leader. Surrounded by a permanent murder of crows. Gaunt, intense, hasn't slept properly in months.

### Brewer Thistle
human female | witch | TL3 | alive
**Faction:** Crowsworn (member) | **Location:** Brackwater Wetlands — Brackwater
**Feature:** Every batch is slightly different
**Companion:** —
**Role:** potion specialist, Corruption-resistance researcher
**Want:** Perfect the Corruption-resistance brew (current success: ~40%)
**Secret:** Her left arm has a faint dark sheen she hides under long sleeves — partially corrupted from self-testing
**Relationships:** —
**Tags:** brewer, infected, self-tester, desperate, potions
> Potion specialist experimenting with Corruption-resistance brews. Test subjects include herself — left arm has a faint dark sheen she hides.

---

## 17. The Deep Current (Shadow Faction)

### Krocius
*(See AHA section — dual-listed)*

### Morgo
spirit male | scholar | TL3 | missing
**Faction:** Deep Current (operative, lost) | **Location:** Crawling Canopy — Gale Fields
**Feature:** Sage spirit, losing his mind
**Companion:** —
**Role:** field operative, prison seeker
**Want:** Find evidence of where Oghmai was imprisoned
**Secret:** Sent into the Canopy 20 years ago. Never came back. Deep Current doesn't know if he's dead, lost, or swallowed. He's alive, still searching, losing his mind.
**Relationships:** Agent→Deep Current
**Tags:** lost, 20-years, insane, Oghmai, Crawling-Canopy
> Sage spirit sent into the Crawling Canopy 20 years ago. Never came back. Alive, still searching, losing his mind.

### Ermina Flopfoot
nakudama female | witch | TL3 | alive
**Faction:** Deep Current (unwitting asset) / Crowsworn (member) | **Location:** Polewater Village — Brackwater
**Feature:** —
**Companion:** —
**Role:** Crowsworn witch, Oghmai researcher
**Want:** Help Madelaine (believes she has same sickness that turned Oghmai into a demon)
**Secret:** Has independently studied Oghmai texts. Doesn't know the Deep Current exists, but they're watching her research closely.
**Relationships:** Concerned→Madelaine
**Tags:** unwitting-asset, Oghmai-texts, Madelaine, watched
> Crowsworn witch who has independently studied Oghmai texts. Believes Madelaine suffers from the same sickness that turned Oghmai into a demon. Deep Current watches her research.

---

## Factionless NPCs by Location

### Matango Village — Gift of Shuritashi

#### Reheni
human female | noble | TL2 | alive
**Location:** Matango Village
**Feature:** Current Truffle Prince; won the title with piglet Gooma
**Companion:** Gooma (piglet)
**Role:** Truffle Prince
**Want:** Commune with elder pig spirit Roghora
**Tags:** truffle, Roghora, piglet, prince
> Current Truffle Prince, won with piglet Gooma. Can commune with Roghora.

#### Myron
human male | priest | TL3 | alive
**Location:** Matango Village
**Feature:** Bark-like skin patches on his hands
**Role:** Lichen Sage druid
**Want:** Maintain magical balance, appease spirits
**Tags:** druid, lichen-sage, balance, spirits

#### Chogo
human male | noble | TL2 | alive
**Location:** Matango Village
**Feature:** Heavyset, heart of gold
**Role:** Matsutake Gang leader
**Want:** Care for waifs and strays
**Tags:** gang-leader, heart-of-gold, heavyset, waifs
> Matsutake Gang leader. Heavyset, heart of gold, cares for waifs. (NOT a ruthless criminal — source is clear.)

#### Marvolio Chanterelle
human male | noble | TL2 | alive
**Location:** Matango Village
**Feature:** Fashionable, uncompromising visionary
**Role:** Red Chanterelles majordomo
**Tags:** fashionista, visionary, Red-Chanterelles

#### Mama Amala
human female | priest | TL3 | alive
**Location:** Matango Village
**Feature:** Mid-50s, intense yet gentle
**Role:** Reishi Clan head
**Want:** —
**Secret:** Immense spiritual power
**Tags:** clan-head, spiritual-power, intense, gentle

#### Madame Porcini
human female | merchant | TL2 | alive
**Location:** Matango Village
**Feature:** Stout, friendly, known for singing
**Role:** Porcini household head
**Tags:** innkeeper, singing, friendly, parties

#### Rokoko
spirit nonbinary | merchant | TL2 | alive
**Location:** Matango Village (Moss Boiler)
**Feature:** Large bipedal beetle
**Role:** restaurant owner/chef
**Want:** Collect odd ingredients
**Tags:** beetle-spirit, chef, Moss-Boiler, collector

### Okiri Village — Gift of Shuritashi

#### Broad Naldo
human male | commoner | TL2 | alive
**Location:** Okiri Village
**Feature:** Ox-like build
**Companion:** Block (hound)
**Role:** community helper, chatterbox
**Tags:** strong, friendly, hound, chatterbox

#### Thim Torrelli
human male | commoner | TL1 | alive
**Location:** Okiri Village
**Role:** adventurous shepherd, joke collector, slinger
**Relationships:** Twin→Torrio
**Tags:** twin, shepherd, jokes, slinger

#### Torrio Torrelli
human male | commoner | TL2 | alive
**Location:** Okiri Village
**Role:** adventurous shepherd, joke collector, slinger
**Relationships:** Twin→Thim
**Tags:** twin, shepherd, jokes, slinger, formidable

#### Morna
nakudama female | thief | TL1 | alive
**Location:** Okiri Village
**Feature:** Child; spies on strangers, fearless, best-informed in village
**Role:** village spy
**Tags:** child, spy, fearless, nakudama, informed

#### Wenneth
human female | knight | TL3 | alive
**Location:** Okiri Village
**Feature:** Middle-aged farmer by day
**Role:** sword champion, farmer
**Tags:** farmer, sword-champion, ruthless-with-blade

#### Bree
spirit female | merchant | TL1 | alive
**Location:** Okiri Village
**Feature:** Pyramid Melon-like form
**Role:** runs mercantile, potion ingredients
**Tags:** spirit, merchant, potion-ingredients

### Temple of Shoom — Gift of Shuritashi

#### Zolde
nakudama female | knight | TL3 | alive
**Location:** Temple of Shoom
**Feature:** Broad build, perpetual scowl, ex-adventurer
**Role:** midwives leader
**Want:** —
**Secret:** Can still swing a sword
**Tags:** midwife-leader, ex-adventurer, scowling, nakudama

#### Voraro the Parasite
nakudama male | cultist | TL5 | alive
**Location:** Temple of Shoom (deeper levels)
**Feature:** Bloated, water-bound
**Role:** ancient Warlock
**Want:** Enthrall nakudama for his patron
**Secret:** Ancient, feeds nakudama to patron
**Tags:** warlock, parasite, villain, ancient, enthraller, water-bound

#### Beatri
nakudama female | commoner | TL1 | missing
**Location:** Temple of Shoom (last seen clearing second tier)
**Role:** midwife
**Status:** missing
**Tags:** midwife, missing, rescue-target

### Tidewater — Gift of Shuritashi

#### Vorian
elf male | commoner | TL1 | alive
**Location:** Tidewater
**Feature:** Humble, shy
**Role:** apprentice sand sculptor
**Secret:** True genius behind Great Ferek's fame
**Tags:** sand-sculptor, genius, humble, shy

#### Ulmat
dara female | priest | TL3 | alive
**Location:** Tidewater
**Feature:** Tallest in the Gift; otherworldly voice
**Role:** Pearl's omenspeaker, art lover
**Tags:** omenspeaker, tallest, dara, pearl, otherworldly

#### Gritty Groff
human female | witch | TL2 | alive
**Location:** Tidewater
**Feature:** Lives with giant sand fleas Fleck & Speck
**Companion:** Fleck & Speck (giant sand fleas)
**Role:** Sand Witch, pearl protector
**Tags:** sand-witch, sand-fleas, pearl-guardian, unaffiliated

#### Kenta
human male | commoner | TL1 | alive
**Location:** Tidewater (buried ship)
**Role:** beachcomber kid
**Relationships:** Sibling→Kaz, Sibling→Kersh
**Tags:** child, beachcomber, buried-ship

#### Kaz
human male | commoner | TL1 | alive
**Location:** Tidewater (buried ship)
**Role:** beachcomber kid
**Relationships:** Sibling→Kenta, Sibling→Kersh
**Tags:** child, beachcomber

#### Kersh
human male | witch | TL2 | alive
**Location:** Tidewater (buried ship)
**Feature:** Warlock with puffer-fish spirit patron
**Companion:** Puffer-fish spirit (patron)
**Role:** beachcomber kid, warlock
**Relationships:** Sibling→Kenta, Sibling→Kaz
**Tags:** child, warlock, puffer-fish, beachcomber

#### Harraga
human nonbinary | priest | TL1 | alive
**Location:** Tidewater
**Feature:** Blind; sweet tooth
**Role:** healer acolyte
**Tags:** blind, healer, sweet-tooth, acolyte

#### Eol
human male | priest | TL1 | alive
**Location:** Tidewater
**Feature:** Burly, bald
**Role:** acolyte
**Want:** Keep everything clean
**Tags:** burly, bald, cleanliness-obsessed, acolyte

#### Kem
nakudama female | priest | TL1 | alive
**Location:** Tidewater
**Feature:** Loud, friendly
**Companion:** Boog (black cat spirit)
**Role:** acolyte
**Tags:** loud, friendly, acolyte, cat-spirit

### Uluwa (Spirit Market) — Gift of Shuritashi

#### Master of Ceremonies
spirit male | noble | TL4 | alive
**Location:** Uluwa
**Feature:** Tall, gangly, dancing; large eyebrows; never sleeps
**Companion:** His own shadow (sent on errands)
**Role:** market host/organizer
**Tags:** spirit, host, dancing, never-sleeps, shadow

#### Emille the Busker
dara male | commoner | TL2 | alive
**Location:** Uluwa
**Feature:** Melancholic
**Companion:** Spirit patron (inside his pluckerine instrument)
**Role:** musician (compulsory — bound to patron)
**Want:** Freedom from compulsory playing
**Tags:** dara, busker, pluckerine, bound, melancholic

#### Throth with Eyes Everywhere
spirit nonbinary | guard | TL3 | alive
**Location:** Uluwa
**Feature:** Collective of floating eyes; beams light when spotting violations
**Role:** market constable
**Tags:** eyes, constable, light-beams, collective

#### Humble Utzu
spirit male | thief | TL3 | alive
**Location:** Uluwa
**Feature:** Tiny with black flame head; refers to self in third person
**Role:** smuggler, con artist
**Tags:** smuggler, con-artist, black-flame, third-person

#### The Four Orbles
spirit nonbinary | commoner | TL1 | alive
**Location:** Uluwa
**Feature:** Identical small spirits, nimble tumblers
**Role:** magical fish catchers (with butterfly nets)
**Tags:** identical, four, tumblers, fish-catchers

#### Dapo Dapo
spirit male | commoner | TL1 | alive
**Location:** Uluwa
**Feature:** Two spirits, both named Dapo
**Role:** fish paste masters
**Secret:** Touchy about their craft; secretly resent each other
**Tags:** duo, fish-paste, resentful, touchy

#### Vymm
spirit nonbinary | witch | TL3 | alive
**Location:** Uluwa
**Feature:** Spider-like form
**Companion:** Vigor (small rock spirit assistant)
**Role:** healer (cocoons patients in webbing)
**Secret:** Serves nefarious clients
**Tags:** spider, healer, webbing, nefarious-clients

#### Ferryman
spirit male | commoner | TL2 | alive
**Location:** Uluwa
**Feature:** Stocky, headless; wears fish necklace, fish heads speak
**Role:** ferry operator
**Want:** —
**Tags:** headless, fish-necklace, speaking-fish, bouncer

### Yatamon (Non-Faction) — Gift of Shuritashi

#### Cholly
spirit male | commoner | TL1 | alive
**Location:** Yatamon (trolley)
**Feature:** Pelican spirit; conductor's cap; scatterbrain
**Role:** trolley conductor
**Tags:** pelican, trolley, scatterbrain, enthusiastic

#### Granny Yuzu
human female | scholar | TL2 | alive
**Location:** Yatamon (among yuzu trees)
**Feature:** First Age relic collector
**Companion:** Tibor (spirit mastiff guardian)
**Role:** collector, antiquarian
**Tags:** collector, First-Age, yuzu-trees, mastiff-guardian

#### Imelda
elf female | thief | TL3 | alive
**Location:** Yatamon
**Feature:** Leaves a calling card
**Companion:** Choofi (floating fur-covered spirit) — discerns objects by smell
**Role:** package thief
**Want:** Steal increasingly audacious targets
**Relationships:** Hunted-by→Gomber & Beeks
**Tags:** thief, elf, calling-card, packages, audacious

#### Master Hu
human male | commoner | TL1 | alive
**Location:** Yatamon (Happy Joy Cake Bakery)
**Feature:** Guru-like
**Companion:** Bokka Bokka (jolly chicken spirit, tour guide, hands out samples)
**Role:** baker, Happy Joy Cake creator
**Want:** Make cakes
**Tags:** baker, guru, Happy-Joy-Cake, famous

#### Mr. Basingstoke
human male | witch | TL4 | alive
**Location:** Yatamon (Witchery)
**Feature:** Intimidating Warlock, unaffiliated with covens
**Companion:** Sorrow (large disturbing octopus spirit) — silent, colorless eyes, drifts through walls, emotionless
**Role:** runs the Witchery (witch academy); intimidating
**Tags:** warlock, Witchery, octopus, unaffiliated, intimidating

#### Lula
spirit female | merchant | TL2 | alive
**Location:** Yatamon (gambling hall/diner)
**Feature:** Freely travels between realms; been in Yatamon for centuries
**Role:** diner/gambling hall owner
**Tags:** spirit, diner, gambling, centuries-old, realm-traveler

#### Bridge Cat
spirit nonbinary | commoner | TL1 | alive
**Location:** Yatamon (under a bridge)
**Feature:** Giant sleeping spirit, eternal slumber
**Role:** mystery
**Secret:** Brings longevity and peace. One of Obojima's great mysteries.
**Tags:** giant-cat, sleeping, eternal, mystery, longevity

#### Gojo
human male | commoner | TL2 | alive
**Location:** Yatamon (Gojo's Ramen Bucket)
**Feature:** Admires but resents Hakumon
**Role:** ramen chef
**Want:** Beat Hakumon; restore wounded pride
**Secret:** Willing to cheat to beat Hakumon
**Tags:** ramen, rival, resentful, wounded-pride

#### Himitsu
spirit nonbinary | witch | TL3 | alive
**Location:** Yatamon (Arcane Izakaya — vanishes during day)
**Feature:** Alters form; tavern vanishes during day
**Role:** izakaya owner, anomalous spirit
**Tags:** shapeshifter, izakaya, vanishing, anomalous

#### Jenni
human female | witch | TL2 | alive
**Location:** Yatamon (general store)
**Feature:** Bosses brothers Hop & Jib; loves adventure stories
**Role:** witch, general store owner, potion ingredient seller
**Tags:** witch, shopkeeper, brothers, adventure-stories

#### Whiskers
spirit male | commoner | TL1 | alive
**Location:** Yatamon
**Feature:** Caramel spirit cat, lost voice
**Role:** lost cat seeking help
**Want:** Needs a chattershroom to restore voice (lost to Witch Meg Wicklowe)
**Tags:** cat, voiceless, chattershroom, quest-hook

### Chisuay's Teahouse — Land of Hot Water

#### Chisuay
oni male | noble | TL4 | alive
**Location:** Chisuay's Teahouse — Land of Hot Water
**Feature:** Slender, dashing; charismatic, pompous
**Role:** Tea Master, oni sorcerer
**Want:** —
**Secret:** Struggles with oni nature
**TrueIdentity:** Oni sorcerer in human guise
**Relationships:** Brother→Hakumon
**Tags:** oni, tea-master, charismatic, pompous, sorcerer

#### Migo
spirit male | commoner | TL1 | alive
**Location:** Chisuay's Teahouse — Land of Hot Water
**Feature:** Six-armed; doesn't speak, uses sign language
**Role:** teahouse helper
**Tags:** six-armed, sign-language, silent, helpful

#### Indigo
awakened_animal male | noble | TL2 | alive
**Location:** Chisuay's Teahouse — Land of Hot Water
**Feature:** Awakened fossa; stuffy, self-important
**Role:** staff majordomo
**Want:** Push weight around when Chisuay is absent
**Tags:** fossa, majordomo, stuffy, self-important

### Hogstone Hot Springs — Land of Hot Water

#### Adira
human female | priest | TL3 | alive
**Location:** Hogstone Hot Springs — Land of Hot Water
**Feature:** Short, calm, intense presence
**Companion:** Mocha (spirit) — enjoys pig guise, provides comfort; takes anthropomorphic pig form when needed
**Role:** master healer/herbalist, runs apothecary
**Tags:** healer, herbalist, apothecary, intense

#### Jollah Everbreeze
human male | commoner | TL1 | alive
**Location:** Hogstone Hot Springs — Land of Hot Water
**Feature:** Plays "numinous groove"
**Companion:** Spirit inside his wind instrument
**Role:** bard
**Tags:** bard, numinous-groove, wind-instrument, spirit-in-instrument

### Sky Kite Valley — Land of Hot Water

#### Rockwell "Rock" Raley
human male | knight | TL3 | alive
**Location:** Sky Kite Valley — Land of Hot Water
**Feature:** Infectious energy, easy charm, simmering ambition
**Role:** consummate aeronaut
**Want:** —
**Secret:** Claims to have met The Sky King
**Tags:** aeronaut, charming, ambitious, Sky-King

#### Councilor Jiko
human female | noble | TL2 | alive
**Location:** Sky Kite Valley — Land of Hot Water
**Feature:** Oldest of five council leaders; hotheaded, brash
**Role:** council leader
**Want:** Stop the aeronauts
**Tags:** council, hotheaded, brash, anti-aeronaut

#### Olaya
spirit female | scholar | TL1 | alive
**Location:** Sky Kite Valley — Land of Hot Water
**Feature:** Small serpentine spirit; transparent, opaque when feeding
**Role:** creative muse, asks right questions
**Tags:** serpentine, transparent, creativity, questions

#### Louise
human female | commoner | TL2 | alive
**Location:** Sky Kite Valley — Land of Hot Water
**Feature:** Master kite maker, unrivaled expertise
**Role:** kite maker
**Secret:** Ex-partner of Rock, abandoned in Crawling Canopy
**Relationships:** Ex-partner→Rock
**Tags:** kite-maker, unrivaled, ex-partner, abandoned

#### Marlon
nakudama male | commoner | TL1 | alive
**Location:** Sky Kite Valley — Land of Hot Water
**Feature:** Exceedingly lazy, grumbles nonstop
**Role:** Warden of Barges, oversees locks
**Tags:** lazy, grumbling, barge-warden, locks

#### Rufus
human male | merchant | TL1 | alive
**Location:** Sky Kite Valley — Land of Hot Water
**Role:** pub co-owner (The Waterline)
**Relationships:** Sibling→Mal
**Tags:** pub, brother, nearly-bankrupt, saved-by-boom

#### Mal
human female | merchant | TL1 | alive
**Location:** Sky Kite Valley — Land of Hot Water
**Role:** pub co-owner (The Waterline)
**Relationships:** Sibling→Rufus
**Tags:** pub, sister

#### Ember
human female | merchant | TL1 | alive
**Location:** Sky Kite Valley — Land of Hot Water
**Feature:** Friendliest kitemonger
**Role:** kite rental, novice teacher
**Tags:** kites, friendly, teacher, closes-shop-to-help

### The Graysteps — Mount Arbora

#### Phent
human male | noble | TL2 | alive
**Location:** The Graysteps — Mount Arbora
**Feature:** Warm folksy manner
**Role:** village elder
**Want:** Campaign against spirit "encroachments"
**Secret:** Keeps a bound corrupted spirit; plans to release it in Toggle
**Tags:** elder, anti-spirit, minor-antagonist, dangerous-secret

#### Stout Crumm
elf female | knight | TL3 | alive
**Location:** The Graysteps — Mount Arbora
**Feature:** Silent; communicates via slate
**Role:** ex-Ranger, first to encounter Corruption
**Secret:** —
**Tags:** silent, slate, ex-ranger, sword-school-champion, First-Corruption

#### Patcher
human male | knight | TL2 | alive
**Location:** The Graysteps — Mount Arbora
**Feature:** Boisterous teller of tall tales
**Companion:** —
**Role:** Watchers captain
**Secret:** Possesses Rod of Awakening
**Tags:** boisterous, tall-tales, Watchers, Rod-of-Awakening

### Jumaga's Roost — Mount Arbora

#### Jeelah
human female | commoner | TL2 | alive
**Location:** Jumaga's Roost — Mount Arbora
**Role:** rockwinder (one of the best climbers)
**Tags:** climber, rockwinder

#### Karmajin
human male | thief | TL2 | alive
**Location:** Jumaga's Roost — Mount Arbora
**Role:** rockwinder (least scrupulous)
**Secret:** Willing to exploit Jumaga
**Tags:** rockwinder, unscrupulous, exploiter

### Toggle — Mount Arbora

#### Johnny One-Eye
human male | commoner | TL2 | alive
**Location:** Toggle — Mount Arbora
**Feature:** Missing one eye
**Companion:** Thugg (spirit) — inseparable duo
**Role:** miner/adventurer
**Tags:** one-eye, inseparable-duo, Toggle

### Crawling Canopy — Gale Fields

#### Zeb
nakudama male | thief | TL1 | alive
**Location:** Crawling Canopy — Gale Fields
**Role:** scavenger/explorer
**Relationships:** Group→Jeb, Group→Dingus
**Tags:** scavenger, nakudama, trio

#### Jeb
nakudama male | thief | TL1 | alive
**Location:** Crawling Canopy — Gale Fields
**Role:** scavenger/explorer
**Tags:** scavenger, nakudama, trio

#### Dingus
nakudama male | thief | TL1 | alive
**Location:** Crawling Canopy — Gale Fields
**Role:** scavenger/explorer
**Tags:** scavenger, nakudama, trio

### Corrupted Coastline — Brackwater

#### Ernest Ebbs
human male | commoner | TL2 | alive
**Location:** Corrupted Coastline — Brackwater
**Role:** reluctant leader
**Tags:** reluctant, leadership

#### Madelaine
human female | commoner | TL2 | alive
**Location:** Corrupted Coastline — Brackwater
**Feature:** Underwent transformation/ordeal with Corruption
**Companion:** Silt (spirit) — saved Madelaine, now companion
**Role:** survivor
**Secret:** Deep Current watches her — Ermina believes she has the same sickness that turned Oghmai into a demon
**Tags:** transformation, Corruption, Oghmai-parallel, watched

### Polewater Village — Brackwater

#### Grifftang Crump
human male | commoner | TL2 | alive
**Location:** Polewater Village — Brackwater
**Role:** village resident
**Tags:** Polewater, Corruption-aftermath

#### Gomura
spirit male | knight | TL5 | alive
**Location:** Polewater (ruined subway) — Brackwater
**Feature:** Monstrous elder spirit, disturbed
**Role:** dungeon boss
**Tags:** elder-spirit, monstrous, subway, disturbed, antagonist

### Hakumon's Ramen Shop — Brackwater

#### Hakumon
oni male | noble | TL4 | alive
**Location:** Hakumon's Ramen Shop — Brackwater
**Feature:** Imposing; embraced oni form; at peace with humanity
**Companion:** Scrublings (small helper spirits)
**Role:** ramen master
**TrueIdentity:** Oni in full oni form (not hiding)
**Relationships:** Brother→Chisuay
**Tags:** oni, ramen, master, at-peace, imposing

#### Mr. Noka Noka
spirit male | thief | TL3 | alive
**Location:** Hakumon's Ramen Shop — Brackwater
**Feature:** Doppelganger
**Role:** notorious character
**Tags:** doppelganger, notorious

### Roa Kala — Brackwater

#### Audok
dara male | noble | TL2 | alive
**Location:** Roa Kala — Brackwater
**Role:** Kohdoi elder, respected leader
**Tags:** dara, elder, Kohdoi

#### Myara
dara female | commoner | TL2 | alive
**Location:** Roa Kala — Brackwater
**Role:** artisan, exceptional works
**Tags:** dara, artisan

#### Joshi
dara male | commoner | TL1 | alive
**Location:** Roa Kala — Brackwater
**Role:** —
**Secret:** Never connected with traditional dara ways
**Tags:** dara, disconnected

#### Poli
dara female | knight | TL2 | alive
**Location:** Roa Kala — Brackwater
**Role:** ranger, grove keeper
**Tags:** dara, ranger, grove-keeper

### Opal Falls — Coastal Highlands

#### Warwick
human male | priest | TL2 | alive
**Location:** Opal Falls — Coastal Highlands
**Role:** spirit whisperer, mediator between realms
**Tags:** spirit-whisperer, mediator

#### Liffi Bolo
human female | noble | TL2 | alive
**Location:** Opal Falls — Coastal Highlands
**Role:** village elder, community leader
**Tags:** elder, community

#### Mazuka Bo
human male | priest | TL2 | alive
**Location:** Opal Falls — Coastal Highlands
**Feature:** Reclusive
**Role:** druid
**Tags:** druid, reclusive

### Broken Bird Airfield — Coastal Highlands

#### Plitsu
spirit nonbinary | commoner | TL1 | alive
**Location:** Broken Bird Airfield — Coastal Highlands
**Feature:** Adorable little spectral spirit
**Role:** airfield guardian/mascot
**Tags:** spectral, adorable, mascot, guardian

### Wandering Line — Various

#### The Conductor
spirit male | noble | TL3 | alive
**Location:** Wandering Line (train)
**Feature:** High-strung, fussy
**Role:** train conductor
**Tags:** conductor, high-strung, fussy

#### The Coal Master
spirit male | witch | TL3 | alive
**Location:** Wandering Line (train)
**Feature:** Enigmatic
**Role:** handles train's power (Spirit Coal)
**Tags:** enigmatic, Spirit-Coal, power-source

#### Salazar Sales
elf male | merchant | TL1 | alive
**Location:** Wandering Line (train)
**Role:** refreshment vendor
**Tags:** vendor, refreshments, elf

#### Montague P. Parrot
spirit male | commoner | TL1 | alive
**Location:** Wandering Line (train)
**Feature:** Anthropomorphic parrot
**Role:** passenger/character
**Tags:** parrot, anthropomorphic

---

## Legendary / Historical Figures (Non-Generatable)

These are not NPCs for the generator but should be in the world reference:

| Name | Type | Notes |
|------|------|-------|
| Queen Okumi | nakudama (legendary) | First queen, swam from cosmic ocean, founded kingdom |
| Shuritashi | great spirit | Gift of Shuritashi named for it |
| Roghora | elder pig spirit | Fought Mu, Matango woods domain, grants Truffle Prince communion |
| Yon | great river spirit | Boar form, associated with Hogstone |
| Mu | great river spirit | Fought and defeated Roghora |
| Shalwin | nakudama sage | Led overthrow of Oghmai, disbanded monarchy |
| Rongol | first pearl caretaker | Pulled pearl that created Tower of Glass |
| The Sky King | spirit ruler | Cloud domain ruler, Rock claims to have met |
| Mr. Hishimoto | awakened cat | First awakened cat, stone statue, honored by vending machine cats |
| Jumaga the Sky Salamander | elder spirit | Mount Arbora guardian |
| Oghmai the Demon Usurper | demon/nakudama | Ancient imprisoned emperor, inside Mount Arbora |
| Malgrotha | demon (twin spirit) | Crow half of split twin, imprisoned in Crawling Canopy |
| The First Dara | dara (historical) | Created the Crawling Canopy 300 years ago |
| The Hunter | great beast | Enormous bird of prey, constantly in flight |
| Rumble Hill | great beast (cat) | Appears as a hill near Broken Bird Airfield, sleeping |
| Kara Clintock | human (deceased) | Captain's wife, comic creator, died mysteriously, created Aquatic Stabilizer |

---

## NPC Count Summary

| Category | Count |
|----------|-------|
| Faction agents (detailed) | ~65 |
| Factionless location NPCs | ~75 |
| Companion spirits (named) | ~25 |
| Legendary/historical | ~16 |
| **Total named characters** | **~180** |

---

## Generation Checklist

When generating NPCs from this file, ensure each entry has:

- [ ] `name` — exact name from source
- [ ] `race` — mapped to extended NPCRace (see gap analysis)
- [ ] `gender` — male / female / nonbinary
- [ ] `description` — 1-3 sentences from source
- [ ] `distinguishingFeature` — visual identifier
- [ ] `archetype` — combat type for stat lookup
- [ ] `threatLevel` — 1-5 scale
- [ ] `age` — number (estimate if not in source)
- [ ] `role` — free string functional role
- [ ] `factionId` — reference to faction (if any)
- [ ] `factionRole` — leader / lieutenant / member / agent / informant
- [ ] `locationId` — reference to settlement/site
- [ ] `companion` — spirit companion (name, species, description)
- [ ] `flavorWant` — background motivation
- [ ] `secret` — hidden knowledge (if any)
- [ ] `status` — alive / dead / missing / captured
- [ ] `relationships` — named NPC connections with type & sentiment
- [ ] `tags` — keyword array for search/filter

### Fields Missing in Source (Need Estimation)

| Field | Notes |
|-------|-------|
| `age` | Most NPCs lack specific ages. Use: child 8-14, young 15-25, adult 26-40, middle-aged 41-55, older 56-65, elderly 66-75, ancient 100+ (spirits often 100-500) |
| `threatLevel` | Estimate from role: commoner=1, skilled=2, experienced=3, master/leader=4, boss/legendary=5 |
| `distinguishingFeature` | ~30% of NPCs have explicit features in source. Rest need creation during generation |
| `flavorWant` | Most faction agents have explicit wants. Location NPCs need creation |

### Existing JSON Issues (Must Fix)

| NPC | Problem |
|-----|---------|
| Paloma Clintock | Listed as "AHA ranger" — she's Mariners' Guild lodge caretaker |
| Hakumon | Placed in Polewater — he's in Brackwater at his ramen shop |
| Holly Clintock | Placed in Toggle — she's at Pelican's Nest Lighthouse (North) |
| Captain Clintock | Placed in Toggle — he's stranded at Southern Lodge |
| Marcel | Placed in Toggle — he's at Pelican's Nest Lighthouse |
| Zolde | Listed as "Polewater village leader" — she's midwives leader at Temple of Shoom |
| Duro & Garo | Listed as human — they're dara |
| Chogo | Described as "ruthless" criminal — source says "heart of gold, cares for waifs" |
| Tatsu | Listed as "Jade Fang gang" — he's Goro Goros leader |
| Lionfish King | Listed as spirit — he's fish folk |
| Indigo | Listed as spirit — he's an awakened fossa |
| Bree | Placed in Matango — she's in Okiri |
| Morna | Says "reports to Zolde in Polewater" — Zolde is at Shoom, Morna is in Okiri |
| ~40 NPCs | Invented by generator (Tanisu, Koru, Weshi, etc.) — not in source |
