/**
 * Name data for NPC generation
 * Sources:
 * - bvezilic/DnD-name-generator (curated names)
 * - Snake4life/fantasy-names (syllable combiners)
 * - amazinggameroom.com (goblin names)
 */

import type { NPCRace, NPCGender } from "../models";

export interface RaceNameData {
  male: string[];
  female: string[];
  maleSyllables?: [string[], string[]];
  femaleSyllables?: [string[], string[]];
}

export const NAME_DATA: Record<NPCRace, RaceNameData> = {
  human: {
    male: [
      "Adler", "Admon", "Adolph", "Ahren", "Aimery", "Alard", "Alaric", "Aldous", "Alwyn", "Ambert",
      "An", "Ander", "Anlow", "Anton", "Aoth", "Arando", "Aseir", "Bardeid", "Bareris", "Bedrich",
      "Benvolio", "Bennett", "Bertram", "Blath", "Bor", "Borivik", "Bram", "Bran", "Cale", "Chen",
      "Chi", "Conrad", "Dalkon", "Darvin", "Daylen", "Dedric", "Del", "Derek", "Dexter", "Dian",
      "Diero", "Dirke", "Dodd", "Dorn", "Dungarth", "Dyrk", "Eandro", "Evendur", "Fai", "Falken",
      "Faurgar", "Feck", "Fenton", "Fodel", "Frath", "Gallus", "Garvin", "Geth", "Glar", "Gorstag",
      "Grigor", "Grim", "Griswold", "Gryphero", "Hagar", "Hamlin", "Haseid", "Helm", "Helmut", "Hew",
      "Igan", "Ivor", "Jandar", "Jeras", "Jiang", "Jun", "Kanithar", "Kethoth", "Khemed", "Kosef",
      "Krynt", "Lander", "Lavant", "Leyten", "Lian", "Long", "Luth", "Madian", "Madislak", "Malark",
      "Malcer", "Malfier", "Marcon", "Markus", "Mehmen", "Meklan", "Meng", "Milos", "Mival", "Morn",
      "Mumed", "Namen", "Navaren", "Nerle", "Nilus", "Ningyan", "Norris", "On", "Orel", "Pavel",
      "Pieron", "Quentin", "Raeburn", "Ralmevik", "Ramas", "Randal", "Raynard", "Rimardo", "Ritter",
      "Romero", "Rudolph", "Salazar", "Semil", "Sergor", "Sevenson", "Shan", "Shaumar", "Shui",
      "Stedd", "Steveren", "Stor", "Sudeiman", "Talfen", "Taman", "Tamond", "Taran", "Tavon", "Tegan",
      "Umbero", "Urhur", "Urth", "Vanan", "Vincent", "Vladislak", "Wen", "Wendell", "Wolfram", "Zasheir"
    ],
    female: [
      "Alethra", "Amafrey", "Arizima", "Arveene", "Atala", "Axelle", "Azura", "Bai", "Balama", "Betha",
      "Brey", "Brynna", "Carlen", "Cefrey", "Ceidil", "Chao", "Chathi", "Clotilda", "Dona", "Druella",
      "Eloise", "Eliska", "Enye", "Esvele", "Faila", "Fyevarra", "Giselle", "Hallan", "Hama", "Hulmarra",
      "Immith", "Imzel", "Jalana", "Jasmal", "Jhessail", "Jia", "Kara", "Kasaki", "Katernin", "Kerri",
      "Kethra", "Lei", "Lida", "Lorelei", "Luisa", "Lureene", "Mara", "Marta", "Megan", "Mei",
      "Meilil", "Millicent", "Mirabel", "Miri", "Murithi", "Natali", "Natalie", "Navarra", "Nephis",
      "Nicola", "Nulara", "Nydia", "Olga", "Olma", "Pharana", "Qiao", "Quara", "Remora", "Rolanda",
      "Rosalyn", "Rowan", "Rudelle", "Sachil", "Saidi", "Sefris", "Seipora", "Selise", "Shandri",
      "Shevarra", "Silifrey", "Tai", "Tammith", "Tana", "Tanika", "Tessele", "Thola", "Tura", "Tylsa",
      "Umara", "Vencia", "Veronica", "Vonda", "Westra", "Wilhelmina", "Xandrilla", "Yasheira", "Yuldra",
      "Zasheida", "Zolis", "Zora"
    ],
  },

  dwarf: {
    male: [
      "Adrik", "Agaro", "Alberich", "Arnan", "Arval", "Auxlan", "Avamir", "Baelnar", "Baern", "Balfam",
      "Barendd", "Bariken", "Beloril", "Borkul", "Brottor", "Bruenor", "Dain", "Dalgal", "Darkul",
      "Darrak", "Delg", "Dolmen", "Duergath", "Dworic", "Dyrnar", "Eberk", "Einkil", "Elaim", "Erag",
      "Erias", "Ezegan", "Fallond", "Fargrim", "Ferrek", "Flint", "Gardain", "Garmul", "Ghorvas",
      "Gilthur", "Gimgen", "Gimurt", "Glint", "Grimmalk", "Haeltar", "Hagan", "Halagmar", "Halzar",
      "Harbek", "Hlant", "Kildrak", "Kilvar", "Korlag", "Krag", "Krim", "Kurman", "Lurtrum", "Malagar",
      "Mardam", "Maulnar", "Melgar", "Morak", "Morgran", "Morkral", "Nalral", "Nordak", "Nuraval",
      "Oloric", "Olunt", "Orobok", "Orsik", "Oskar", "Radek", "Rangrim", "Reirak", "Rogath", "Roken",
      "Rozag", "Rurik", "Sabakzar", "Sharak", "Smethykk", "Swargar", "Taklinn", "Thorbalt", "Thoradin",
      "Thorin", "Thradal", "Tordek", "Traubon", "Travok", "Tredigar", "Ulfgar", "Uraim", "Vabul",
      "Veit", "Vistrum", "Vonbin", "Vondal", "Whurbin", "Wolvar"
    ],
    female: [
      "Amber", "Anbera", "Artin", "Audhild", "Balifra", "Barbena", "Bardryn", "Beyla", "Bolhild",
      "Dagnal", "Dariff", "Delre", "Diesa", "Eldeth", "Eridred", "Falkrunn", "Fallthra", "Fenryl",
      "Finellen", "Freyde", "Gillydd", "Grenenzel", "Gunnloda", "Gurdis", "Helgret", "Helja", "Hlin",
      "Ilde", "Jarana", "Kathra", "Kilia", "Kristryd", "Krystolari", "Liftrasa", "Lokara", "Lurka",
      "Marastyr", "Mardred", "Marnia", "Morana", "Nalaed", "Nora", "Nurkara", "Oriff", "Ovina",
      "Praxana", "Riswynn", "Rokel", "Roksana", "Sannl", "Therlin", "Thodris", "Thurlfara", "Torbera",
      "Tordrid", "Torgga", "Urshar", "Valida", "Vauldra", "Veklani", "Vistra", "Vonana", "Vronwe",
      "Werydd", "Whurdred", "Yurgunn", "Zebel"
    ],
  },

  elf: {
    male: [
      "Adran", "Aelar", "Aerdeth", "Ahvain", "Alarcion", "Alathar", "Aramil", "Arannis", "Ariandar",
      "Arromar", "Aust", "Azaki", "Beiro", "Berrian", "Borel", "Bvachan", "Caeldrim", "Callis",
      "Carric", "Carydion", "Cyprian", "Dayereth", "Dreali", "Dusan", "Efferil", "Eiravel", "Elgoth",
      "Enialis", "Erdan", "Erevan", "Farlien", "Ferel", "Fivin", "Gaerlan", "Galinndan", "Gennal",
      "Hadarai", "Halimath", "Heian", "Himo", "Iafalior", "Immeral", "Ivellios", "Kaelthorn", "Korfel",
      "Laethan", "Lamlis", "Laucian", "Leliar", "Leodor", "Lorak", "Lorifir", "Lucan", "Miklos",
      "Mindartis", "Morian", "Naal", "Nutae", "Oleran", "Paelias", "Peren", "Quarion", "Riardon",
      "Rolen", "Rylef", "Savian", "Seylas", "Soveliss", "Suhnae", "Tevior", "Thamior", "Tharivol",
      "Theren", "Theriatis", "Thervan", "Uthemar", "Vanuath", "Varis", "Veyas"
    ],
    female: [
      "Adrie", "Ahinar", "Althaea", "Anastrianna", "Andraste", "Antinua", "Arara", "Aryllan", "Atalya",
      "Ayrthwil", "Baelitae", "Bethrynna", "Birel", "Caelynn", "Chaedi", "Claira", "Clorinda", "Dara",
      "Drusilia", "Elama", "Enna", "Faral", "Felosial", "Hatae", "Ielenia", "Ilanis", "Irann", "Irva",
      "Jarsali", "Jelenneth", "Keyleth", "Leshanna", "Lia", "Lyfalia", "Maiathah", "Malquis", "Meriele",
      "Mialee", "Milena", "Myathethil", "Naivara", "Olethea", "Quelenna", "Quillathe", "Ridaro",
      "Ronefel", "Sariel", "Shanairla", "Shanairra", "Shava", "Shayndel", "Silaqui", "Sumnes",
      "Theirastra", "Thia", "Thiala", "Thirya", "Tiaathque", "Traulam", "Vadania", "Valanthe", "Valna",
      "Velene", "Venefiq", "Xanaphia", "Zereni"
    ],
  },

  halfling: {
    male: [
      "Alton", "Ander", "Arthan", "Bernie", "Bobbin", "Cade", "Callus", "Carvin", "Corby", "Corrin",
      "Cullen", "Dannad", "Danniel", "Eddie", "Egart", "Egen", "Eldon", "Ernest", "Errich", "Fildo",
      "Finnan", "Franklin", "Garret", "Garth", "Gedi", "Gilbert", "Gob", "Harol", "Heron", "Igor",
      "Jasper", "Jeryl", "Keffen", "Keith", "Kevin", "Kylem", "Kynt", "Lazam", "Lerry", "Leskyn",
      "Lindal", "Lyle", "Merric", "Mican", "Milo", "Morrin", "Nebin", "Neff", "Nevil", "Orne",
      "Osborn", "Ostran", "Oswalt", "Perrin", "Poppy", "Quarrel", "Rabbit", "Reed", "Rilkin", "Roscoe",
      "Sam", "Shardon", "Snakebait", "Tarfen", "Titch", "Tuck", "Tye", "Ulmo", "Wellby", "Wendel",
      "Wenner", "Wes", "Whim"
    ],
    female: [
      "Alain", "Andry", "Anne", "Bella", "Blossom", "Bree", "Callie", "Caliope", "Chenna", "Cora",
      "Dee", "Dell", "Eida", "Emily", "Eran", "Euphemia", "Georgina", "Gynnie", "Harriet", "Jasmine",
      "Jillian", "Jo", "Kithri", "Lavinia", "Lidda", "Maegan", "Marigold", "Merla", "Myria", "Nedda",
      "Nikki", "Nora", "Olivia", "Paela", "Pearl", "Pennie", "Philomena", "Piper", "Portia", "Rixi",
      "Robbie", "Rose", "Sabretha", "Saral", "Seraphina", "Shaena", "Stacee", "Tawna", "Teg", "Thea",
      "Tilly", "Toira", "Trym", "Tyna", "Vani", "Verna", "Vexia", "Vil", "Vzani", "Wella", "Willow",
      "Zanthe", "Ziza"
    ],
  },

  "half-orc": {
    male: [
      "Argran", "Braak", "Brug", "Cagak", "Dench", "Dorn", "Dren", "Druuk", "Feng", "Gell", "Gnarsh",
      "Grumbar", "Gubrash", "Hagren", "Henk", "Hogar", "Holg", "Imsh", "Karash", "Karg", "Keth",
      "Korag", "Krusk", "Lubash", "Megged", "Mhurren", "Mord", "Morg", "Nil", "Nybarg", "Odorr",
      "Ohr", "Rendar", "Resh", "Ront", "Rrath", "Sark", "Scrag", "Sheggen", "Shump", "Tanglar",
      "Tarak", "Thar", "Thokk", "Trag", "Ugarth", "Varg", "Vilberg", "Yurk", "Zed"
    ],
    female: [
      "Arha", "Baggi", "Bendoo", "Bilga", "Brakka", "Creega", "Drenna", "Ekk", "Emen", "Engong",
      "Fistula", "Gaaki", "Gorga", "Grai", "Greeba", "Grigi", "Gynk", "Hrathy", "Huru", "Ilga",
      "Kabbarg", "Kansif", "Lagazi", "Lezre", "Murgen", "Murook", "Myev", "Nagrette", "Neega", "Nella",
      "Nogu", "Oolah", "Ootah", "Ovak", "Ownka", "Puyet", "Reeza", "Shautha", "Silgre", "Sutha",
      "Tagga", "Tawar", "Tomph", "Ubada", "Vanchu", "Vola", "Volen", "Vorka", "Yevelda", "Zagga"
    ],
  },

  "half-elf": {
    male: [
      // Curated combinations from syllables
      "Alavor", "Aroben", "Barcoril", "Belfyr", "Corelor", "Crahorn", "Davkas", "Dororin", "Eirfaelor",
      "Elmorn", "Falril", "Frilfinas", "Gaertorin", "Grastaer", "Halvoril", "Hornan", "Ianminar",
      "Ilolumin", "Jamros", "Kevlamir", "Krihorn", "Leokoris", "Lormorn", "Marfyr", "Meielor",
      "Nilparin", "Norfinas", "Orikas", "Osben", "Pantorin", "Petril", "Quostaer", "Rafmorn",
      "Rikoris", "Sarfyr", "Sylelor", "Travoril", "Tyrben", "Uanminar", "Ulhorn", "Vanlamir",
      "Vicros", "Walnan", "Wilfaelor", "Xanmorn", "Xavfinas", "Yenkoris", "Yorelor", "Zanvoril",
      "Zylfyr", "Eldeyr", "Korstaer", "Niltorin"
    ],
    female: [
      // Curated combinations from syllables
      "Aluaerys", "Alylynn", "Arfaen", "Brencharis", "Bynmae", "Carseris", "Cohana", "Darelyn",
      "Delnoa", "Elfine", "Elivyre", "Faegwynn", "Fhalore", "Galthana", "Gifkaen", "Halydove",
      "Hoelyn", "Ileseris", "Irofaen", "Jencharis", "Jillynn", "Krithana", "Kysnoa", "Lesrora",
      "Loramae", "Mafine", "Marvyre", "Maregwynn", "Nerifaen", "Norlynn", "Olhana", "Ophinae",
      "Phayeviel", "Priseris", "Qilynn", "Quecharis", "Relnoa", "Resthana", "Saelfaen", "Saflynn",
      "Sylvyre", "Thergwynn", "Tylmae", "Unafine", "Uriseris", "Venlynn", "Vylfaen", "Winhana",
      "Wolnoa", "Xilvyre", "Xyrgwynn", "Yeslynn", "Yllthana", "Zelfaen", "Zinmae"
    ],
    maleSyllables: [
      ["Al", "Aro", "Bar", "Bel", "Cor", "Cra", "Dav", "Dor", "Eir", "El", "Fal", "Fril", "Gaer", "Gra", "Hal", "Hor", "Ian", "Ilo", "Jam", "Kev", "Kri", "Leo", "Lor", "Mar", "Mei", "Nil", "Nor", "Ori", "Os", "Pan", "Pet", "Quo", "Raf", "Ri", "Sar", "Syl", "Tra", "Tyr", "Uan", "Ul", "Van", "Vic", "Wal", "Wil", "Xan", "Xav", "Yen", "Yor", "Zan", "Zyl"],
      ["avor", "ben", "borin", "coril", "craes", "deyr", "dithas", "elor", "enas", "faelor", "faerd", "finas", "fyr", "gotin", "gretor", "homin", "horn", "kas", "koris", "lamir", "lanann", "lumin", "minar", "morn", "nan", "neak", "neiros", "orin", "ovar", "parin", "phanis", "qarim", "qinor", "reak", "ril", "ros", "sariph", "staer", "torin", "tumil", "valor", "voril", "warith", "word", "xian", "xiron", "yeras", "ynor", "zaphir", "zaren"]
    ],
    femaleSyllables: [
      ["Alu", "Aly", "Ar", "Bren", "Byn", "Car", "Co", "Dar", "Del", "El", "Eli", "Fae", "Fha", "Gal", "Gif", "Haly", "Ho", "Ile", "Iro", "Jen", "Jil", "Kri", "Kys", "Les", "Lora", "Ma", "Mar", "Mare", "Neri", "Nor", "Ol", "Ophi", "Phaye", "Pri", "Qi", "Que", "Rel", "Res", "Sael", "Saf", "Syl", "Ther", "Tyl", "Una", "Uri", "Ven", "Vyl", "Win", "Wol", "Xil", "Xyr", "Yes", "Yll", "Zel", "Zin"],
      ["aerys", "anys", "bellis", "bwynn", "cerys", "charis", "diane", "dove", "elor", "enyphe", "faen", "fine", "galyn", "gwynn", "hana", "hophe", "kaen", "kilia", "lahne", "lynn", "mae", "malis", "mythe", "nalore", "noa", "nys", "ona", "phira", "pisys", "qarin", "qwyn", "rila", "rora", "seris", "stine", "sys", "thana", "theris", "tihne", "trana", "viel", "vyre", "walyn", "waris", "xaris", "xipha", "yaries", "yra", "zenya", "zira"]
    ],
  },

  gnome: {
    male: [
      // Curated combinations from syllables
      "Alben", "Aririn", "Bildon", "Britor", "Calver", "Corwin", "Davros", "Dormin", "Enifiz",
      "Ergrim", "Farlen", "Felbar", "Gaston", "Gralin", "Hisner", "Horben", "Iantor", "Ipafan",
      "Jeryn", "Jorkas", "Kaswin", "Kelmin", "Lanfiz", "Lorick", "Manser", "Mervyn", "Nestor",
      "Nibar", "Orlin", "Orudon", "Panaben", "Pofiz", "Quator", "Quorin", "Rasver", "Ronwin",
      "Saben", "Saltor", "Sinbar", "Tanmin", "Torick", "Traver", "Umbar", "Uriven", "Valros",
      "Vorlin", "Wardon", "Wilben", "Wreton", "Xalver", "Xomin", "Yefiz", "Yosbar", "Zanwin", "Ziltor"
    ],
    female: [
      // Curated combinations from syllables
      "Alubi", "Arila", "Banhana", "Breelyn", "Carli", "Celwyn", "Daphina", "Dolys", "Eilimyn",
      "Elmila", "Faena", "Fenwyn", "Folnoa", "Galfi", "Grenhani", "Hella", "Heslin", "Inabi",
      "Isomyra", "Jelwyn", "Jola", "Klofi", "Krili", "Lillys", "Lorina", "Minhana", "Mywyn",
      "Nina", "Nyla", "Odali", "Orwyn", "Phina", "Prili", "Qila", "Quelyn", "Rena", "Rosina",
      "Sali", "Selwyn", "Spina", "Tala", "Tifana", "Trilyn", "Ufeli", "Urina", "Venwyn", "Vola",
      "Welli", "Wromyn", "Xali", "Xyrofi", "Ylona", "Yoli", "Zaniwyn", "Zinla"
    ],
    maleSyllables: [
      ["Al", "Ari", "Bil", "Bri", "Cal", "Cor", "Dav", "Dor", "Eni", "Er", "Far", "Fel", "Ga", "Gra", "His", "Hor", "Ian", "Ipa", "Je", "Jor", "Kas", "Kel", "Lan", "Lo", "Man", "Mer", "Nes", "Ni", "Or", "Oru", "Pana", "Po", "Qua", "Quo", "Ras", "Ron", "Sa", "Sal", "Sin", "Tan", "To", "Tra", "Um", "Uri", "Val", "Vor", "War", "Wil", "Wre", "Xal", "Xo", "Ye", "Yos", "Zan", "Zil"],
      ["bar", "ben", "bis", "corin", "cryn", "don", "dri", "fan", "fiz", "gim", "grim", "hik", "him", "ji", "jin", "kas", "kur", "len", "lin", "min", "mop", "morn", "nan", "ner", "ni", "pip", "pos", "rick", "ros", "rug", "ryn", "ser", "ston", "tix", "tor", "ver", "vyn", "win", "wor", "xif", "xim", "ybar", "yur", "ziver", "zu"]
    ],
    femaleSyllables: [
      ["Alu", "Ari", "Ban", "Bree", "Car", "Cel", "Daphi", "Do", "Eili", "El", "Fae", "Fen", "Fol", "Gal", "Gren", "Hel", "Hes", "Ina", "Iso", "Jel", "Jo", "Klo", "Kri", "Lil", "Lori", "Min", "My", "Ni", "Ny", "Oda", "Or", "Phi", "Pri", "Qi", "Que", "Re", "Rosi", "Sa", "Sel", "Spi", "Ta", "Tifa", "Tri", "Ufe", "Uri", "Ven", "Vo", "Wel", "Wro", "Xa", "Xyro", "Ylo", "Yo", "Zani", "Zin"],
      ["bi", "bys", "celi", "ci", "dira", "dysa", "fi", "fyx", "gani", "gyra", "hana", "hani", "kasys", "kini", "la", "li", "lin", "lys", "mila", "miphi", "myn", "myra", "na", "niana", "noa", "nove", "phina", "pine", "qaryn", "qys", "rhana", "roe", "sany", "ssa", "sys", "tina", "tra", "wyn", "wyse", "xi", "xis", "yaris", "yore", "za", "zyre"]
    ],
  },

  goblin: {
    male: [
      "Gob", "Zod", "Krag", "Grik", "Drog", "Snarl", "Grizzlek", "Snivit", "Flix", "Zogbug",
      "Krink", "Nixle", "Grishnak", "Snik", "Grommash", "Murg", "Gruumsh", "Mog", "Uzguk", "Skab",
      "Throg", "Blug", "Zog", "Grak", "Rurg", "Snikch", "Huk", "Fizzgig", "Krunk", "Skar", "Zek",
      "Snaggle", "Grot", "Rikkit", "Boggle", "Skrix", "Nazgob", "Grotnik", "Skezz", "Vrax",
      "Blix", "Snot", "Gnarl", "Pix", "Scrub", "Razz", "Gnash", "Spike", "Fang", "Twitch"
    ],
    female: [
      "Grisella", "Snikka", "Grommasha", "Murgette", "Gruumshia", "Snarla", "Zodda", "Kragga",
      "Moggie", "Uzgukka", "Grikka", "Drogga", "Skabba", "Throgga", "Blugga", "Zogga", "Grakka",
      "Rurgia", "Snikchka", "Hukka", "Fizzgigga", "Krunka", "Skarra", "Gobetta", "Zekka",
      "Snaggla", "Grotta", "Rikkita", "Boggla", "Skrixa", "Nazgobba", "Grotnika", "Skezza",
      "Vraxa", "Blixa", "Snotta", "Gnarla", "Pixa", "Scrubba", "Razza", "Gnasha", "Spika",
      "Fanga", "Twitcha", "Nix", "Vex", "Grub", "Mox", "Fizz", "Glitch"
    ],
  },
};

// Surnames (shared across races, fantasy-style)
export const SURNAMES: string[] = [
  "Blackwood", "Stoneheart", "Ironforge", "Shadowmere", "Brightwater", "Thornwood", "Stormwind",
  "Goldmane", "Silverton", "Ravencrest", "Oakenshield", "Fireforge", "Frostborn", "Nightingale",
  "Greymoor", "Wolfbane", "Starfall", "Deepwell", "Highwind", "Coldbrook", "Darkhollow",
  "Swiftfoot", "Trueshot", "Strongbow", "Battleborn", "Ironside", "Steelhand", "Grimstone",
  "Ashford", "Winterbourne", "Summervale", "Autumnwood", "Springhaven", "Moonrise", "Sunfire",
  "Dawnbreaker", "Duskwalker", "Shadowstep", "Lightheart", "Darkmoor", "Whitecliff", "Redmane",
  "Bluestone", "Greenleaf", "Goldleaf", "Silverleaf", "Bronzewood", "Copperfield", "Tinkerbell",
  "Hammerfall", "Axebreaker", "Swordsworn", "Shieldbearer", "Spearpoint", "Arrowflight",
  "Flameheart", "Frostfang", "Stormrage", "Thunderclaw", "Earthshaker", "Windrunner",
  "Riverdale", "Lakewood", "Hillcrest", "Mountainview", "Valleyborn", "Meadowbrook", "Forestkin",
  "Marshwalker", "Desertwind", "Plainstrider", "Jungleheart", "Tundraborn", "Islekeeper"
];

// Nicknames (fantasy epithets)
export const NICKNAMES: string[] = [
  "the Bold", "the Wise", "the Swift", "the Silent", "the Fierce", "the Cunning", "the Kind",
  "the Grim", "the Lucky", "the Lost", "the Brave", "the Fair", "the Dark", "the Bright",
  "the Strong", "the Quick", "the Steady", "the Wild", "the Calm", "the Sly", "the Honest",
  "the Gentle", "the Stern", "the Merry", "the Somber", "the Young", "the Elder", "the Wanderer",
  "the Hunter", "the Healer", "the Scholar", "the Smith", "the Merchant", "the Sailor"
];

// Emergency title suffixes (when names exhaust)
export const EMERGENCY_TITLES: string[] = [
  "the Younger", "the Elder", "the Second", "the Third", "of the Vale", "of the Hills",
  "of the Forest", "of the River", "of the Mountain", "the Lesser", "the Greater"
];
