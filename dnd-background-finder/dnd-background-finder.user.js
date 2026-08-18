// ==UserScript==
// @name         D&D 2024 Background Finder
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Filter backgrounds by Attributes, Origin Feats, and Search Keywords.
// @author       Matt
// @match        https://www.dndbeyond.com/*
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/mekimball/tampermonkey-scripts/main/dnd-background-finder/dnd-background-finder.user.js
// @downloadURL  https://raw.githubusercontent.com/mekimball/tampermonkey-scripts/main/dnd-background-finder/dnd-background-finder.user.js
// ==/UserScript==

(function () {
    'use strict';

    const BACKGROUNDS = [
      { id: "acolyte", name: "Acolyte", attributes: ["INT", "WIS", "CHA"], feat: "Magic Initiate (Cleric)", description: "Devoted to a temple or deity, learning divine rituals and faith." },
      { id: "agent-of-the-augustine", name: "Agent of the Augustine", attributes: ["INT", "WIS", "CHA"], feat: "Insightful Collector", description: "Used education and knowledge working on behalf of the Augustine Trading Company as a versatile problem-solver." },
      { id: "amnesiac", name: "Amnesiac", attributes: ["STR", "DEX", "CON", "INT", "WIS", "CHA"], feat: "Memory Starved", description: "Awakened with lost memories, slowly piecing together a mysterious past." },
      { id: "antiquarian", name: "Antiquarian", attributes: ["DEX", "CON", "INT"], feat: "Skilled", description: "Fascinated with studying history and identifying ancient artifacts, relics, lost texts, and languages." },
      { id: "artisan", name: "Artisan", attributes: ["STR", "DEX", "INT"], feat: "Crafter", description: "Apprenticed in a trade, creating crafts and managing business." },
      { id: "beast-hunter", name: "Beast Hunter", attributes: ["STR", "DEX", "INT"], feat: "Blood Hound", description: "Tracks down terrifying beasts and nocturnal threats in grim lands." },
      { id: "beast-hunter-scourge", name: "Beast Hunter (Scourge)", attributes: ["STR", "DEX", "WIS"], feat: "Grizzled", description: "Driven by vengeance or justice to defend the city against the looming presence of the Scourge." },
      { id: "beggar", name: "Beggar", attributes: ["STR", "DEX", "WIS"], feat: "Survivor", description: "Fallen on hard times and observing society from its lowest rung, often acting as a spy or informant." },
      { id: "carouser", name: "Carouser", attributes: ["DEX", "INT", "CHA"], feat: "Tireless Reveler", description: "Grew up in the heart of a large city, navigating taverns, parlors, and high-stakes social circles." },
      { id: "chapter-knight", name: "Chapter Knight", attributes: ["STR", "WIS", "CHA"], feat: "Savage Attacker", description: "Dedicated to upholding noble virtues, strength, and knightly traditions in the Charneault Kingdom." },
      { id: "charlatan", name: "Charlatan", attributes: ["DEX", "CON", "CHA"], feat: "Skilled", description: "A master of manipulation and deception, seeking out marks in taverns and markets." },
      { id: "chondathan-freebooter", name: "Chondathan Freebooter", attributes: ["STR", "DEX", "CON"], feat: "Skilled", description: "A privateer and rover hailing from the waterways and forests of Chondath." },
      { id: "courtier", name: "Courtier", attributes: ["INT", "WIS", "CHA"], feat: "Skilled", description: "Navigates high courts and power structures through perseverance, skill, or trickery." },
      { id: "criminal", name: "Criminal", attributes: ["DEX", "CON", "INT"], feat: "Alert", description: "Experienced in surviving outside the law and navigating the urban underbelly." },
      { id: "crimson-aspirant", name: "Crimson Aspirant", attributes: ["STR", "DEX", "CON", "INT", "WIS", "CHA"], feat: "Crimson Ritualist", description: "Studied forbidden hemomancy and the vitality-manipulating arts of blood." },
      { id: "crossroads-gambler", name: "Crossroads Gambler", attributes: ["STR", "DEX", "CON", "INT", "WIS", "CHA"], feat: "Fate Gambler", description: "Pledged a midnight wager at a lonely crossroads and walked away alive." },
      { id: "cultist", name: "Cultist", attributes: ["STR", "DEX", "CON", "INT", "WIS", "CHA"], feat: "Cult Initiate", description: "Indoctrinated into dark rites and sworn to the service of eldritch entities." },
      { id: "dead-magic-dweller", name: "Dead Magic Dweller", attributes: ["CON", "WIS", "CHA"], feat: "Healer", description: "Accustomed to surviving in desolate zones where magic fails or behaves wildly." },
      { id: "disgraced-raider", name: "Disgraced Raider", attributes: ["STR", "CON", "WIS"], feat: "Savage Attacker", description: "Cast out from a feared Valikan raiding clan after a mission or moral crisis went wrong." },
      { id: "disinherited-noble", name: "Disinherited Noble", attributes: ["STR", "INT", "CHA"], feat: "Skilled", description: "Stripped of title, land, and wealth, driven to reclaim lost birthrights." },
      { id: "dragon-cultist", name: "Dragon Cultist", attributes: ["INT", "WIS", "CHA"], feat: "Cult of the Dragon Initiate", description: "Infiltrated or served within secretive cults dedicated to draconic overlords." },
      { id: "druskenvald-dweller", name: "Druskenvald Dweller", attributes: ["STR", "DEX", "CON", "INT", "WIS", "CHA"], feat: "Any Origin Feat", description: "A native to the horror-ridden lands of Druskenvald, attuned to local dangers." },
      { id: "emerald-enclave-caretaker", name: "Emerald Enclave Caretaker", attributes: ["DEX", "CON", "WIS"], feat: "Emerald Enclave Fledgling", description: "Sworn to protect wild sanctuaries and preserve natural harmony." },
      { id: "entertainer", name: "Entertainer", attributes: ["STR", "DEX", "CHA"], feat: "Musician", description: "Thrives on performance and showmanship to captivate and inspire audiences." },
      { id: "envoy", name: "Envoy", attributes: ["STR", "CON", "CHA"], feat: "Skilled", description: "Official representative of a government traveling to forge alliances and secure international ties." },
      { id: "executioner", name: "Executioner", attributes: ["STR", "CON", "INT"], feat: "Deathbound", description: "Formerly employed delivering legally sanctioned death for powerful organizations." },
      { id: "expelled-academy-member", name: "Expelled Academy Member", attributes: ["INT", "WIS", "CHA"], feat: "Magic Initiate", description: "Cast out from magical institutions for pursuing dangerous or unethical research." },
      { id: "experiment", name: "Experiment", attributes: ["STR", "DEX", "CON", "INT", "WIS", "CHA"], feat: "Altered", description: "Physically transformed by strange alchemy, arcane science, or monstrous influence." },
      { id: "explorer", name: "Explorer", attributes: ["STR", "CON", "WIS"], feat: "Alert", description: "Traverses the wilderness driven by wanderlust to discover unseen reaches of the world." },
      { id: "exterminator", name: "Exterminator", attributes: ["DEX", "CON", "INT"], feat: "Magic Initiate (Druid)", description: "Trained in clearing settlements and countryside of dangerous four-legged pests and vermin." },
      { id: "farmer", name: "Farmer", attributes: ["STR", "CON", "WIS"], feat: "Tough", description: "Cultivated the land and tended animals, gaining a deep respect for nature." },
      { id: "fey-blessed", name: "Fey-Blessed", attributes: ["DEX", "CON", "CHA"], feat: "Magic Initiate (Wizard)", description: "Favored by powerful faerie-folk with small boons, trinkets, and a radiant aura." },
      { id: "flaming-fist-mercenary", name: "Flaming Fist Mercenary", attributes: ["STR", "DEX", "CON"], feat: "Alert", description: "A battle-tested veteran of Baldur's Gate's fierce mercenary company." },
      { id: "free-enterprise-infiltrator", name: "Free Enterprise Infiltrator", attributes: ["DEX", "INT", "CHA"], feat: "Alert", description: "Navigates corporate cartels, crime syndicates, and black-market intrigue." },
      { id: "free-swords-mercenary", name: "Free Swords Mercenary", attributes: ["STR", "DEX", "CON"], feat: "Free Sword Mercenary's Will", description: "Hardened by mud, blood, and coin serving within the Company of Free Swords." },
      { id: "genie-touched", name: "Genie Touched", attributes: ["DEX", "INT", "CHA"], feat: "Magic Initiate", description: "Marked by planar energy or ancestral pacts with elemental genies." },
      { id: "ghostlight-passenger", name: "Ghostlight Passenger", attributes: ["STR", "DEX", "CON", "INT", "WIS", "CHA"], feat: "Ghostlight Medium", description: "Rode the phantom Ghostlight Express, forming a link with departed souls." },
      { id: "guard", name: "Guard", attributes: ["STR", "INT", "WIS"], feat: "Alert", description: "Spent time standing watch, trained to spot danger and protect city gates." },
      { id: "guide", name: "Guide", attributes: ["DEX", "CON", "WIS"], feat: "Magic Initiate (Druid)", description: "Explored the outdoors and natural wilderness, channeling primal magic." },
      { id: "harper", name: "Harper", attributes: ["DEX", "INT", "CHA"], feat: "Harper Agent", description: "A covert agent dedicated to thwarting tyranny and safeguarding secret lore." },
      { id: "haunted-one", name: "Haunted One", attributes: ["CON", "WIS", "CHA"], feat: "Survivor or Dark Gift", description: "Bears the unshakable, painful weight of past tragic events that cannot be buried, slain, or banished." },
      { id: "heretic", name: "Heretic", attributes: ["STR", "DEX", "WIS"], feat: "Magic Initiate (Cleric)", description: "Uncovered dark truths behind dominant religious powers and lives on the run." },
      { id: "hermit", name: "Hermit", attributes: ["CON", "WIS", "CHA"], feat: "Healer", description: "Lived in solitude outside society, contemplating creation and spiritual arts." },
      { id: "ice-fisher", name: "Ice Fisher", attributes: ["STR", "DEX", "CON"], feat: "Alert", description: "A hardened survivalist from frozen northern lakes and icy mountain wastes." },
      { id: "inquisitor", name: "Inquisitor", attributes: ["STR", "WIS", "CHA"], feat: "Faithful", description: "A steadfast disciple of the Radiant Church, rooting out heresy, corruption, and enemies of the faith." },
      { id: "inquisitor-apprentice", name: "Inquisitor Apprentice", attributes: ["STR", "INT", "WIS"], feat: "Convincing Inquisitor", description: "Trained under zealous inquisitors to purge heresy and demonic taint." },
      { id: "inquisitor-of-the-faithful", name: "Inquisitor of the Faithful", attributes: ["STR", "WIS", "CHA"], feat: "Convincing Inquisitor", description: "Servant of the Watchers of the Faithful hunting down heretics and cultists without mercy." },
      { id: "investigator", name: "Investigator", attributes: ["INT", "WIS", "CHA"], feat: "Sharp Eye or Dark Gift", description: "Relentlessly seeks truth and unravels local crimes or eldritch conspiracies others wish to keep hidden." },
      { id: "knight-of-the-gauntlet", name: "Knight of the Gauntlet", attributes: ["STR", "INT", "WIS"], feat: "Tyro of the Gauntlet", description: "A holy warrior aligned with the Order of the Gauntlet to root out evil." },
      { id: "lapsed-inquisitor", name: "Lapsed Inquisitor", attributes: ["STR", "WIS", "CHA"], feat: "Convincing Inquisitor", description: "Left the Arcanist Inquisition after a crisis of conscience, now living with a target on their back." },
      { id: "lords-alliance-vassal", name: "Lords' Alliance Vassal", attributes: ["INT", "WIS", "CHA"], feat: "Lords' Alliance Agent", description: "A diplomatic representative working to maintain harmony between allied city-states." },
      { id: "lorwyn-expert", name: "Lorwyn Expert", attributes: ["STR", "CON", "WIS"], feat: "Child of the Sun", description: "Hails from Lorwyn or studied its eternal sunshine, embarking on whimsical adventures and holding loved ones close." },
      { id: "marked-for-death", name: "Marked for Death", attributes: ["STR", "DEX", "CON"], feat: "Grizzled", description: "Resurrected by the Blood Moon of Rebirth, bearing a Sacrificial Brand that marks you for future violent struggles." },
      { id: "merchant", name: "Merchant", attributes: ["CON", "INT", "CHA"], feat: "Lucky", description: "Traded goods and managed commerce, possessing keen business instincts." },
      { id: "mist-wanderer", name: "Mist Wanderer", attributes: ["DEX", "CON", "WIS"], feat: "Dark Gift (Mist Walker recommended)", description: "Drawn by the Mists into a Domain of Dread, wandering between cursed realms in search of a way home." },
      { id: "moonwell-pilgrim", name: "Moonwell Pilgrim", attributes: ["CON", "WIS", "CHA"], feat: "Magic Initiate (Druid)", description: "Bound to the mystical waters and natural guardian spirits of the Moonshae Isles." },
      { id: "mulhorandi-tomb-raider", name: "Mulhorandi Tomb Raider", attributes: ["STR", "DEX", "INT"], feat: "Tough", description: "An adventurer who braves ancient desert tombs and crypts in search of ancient relics." },
      { id: "mythalkeeper", name: "Mythalkeeper", attributes: ["INT", "WIS", "CHA"], feat: "Magic Initiate (Wizard)", description: "A scholar dedicated to studying, maintaining, and protecting ancient high-elven mythals." },
      { id: "night-stalker", name: "Night Stalker", attributes: ["STR", "DEX", "CON", "INT", "WIS", "CHA"], feat: "Hunter of Hunters", description: "Stalks creatures of darkness in misty woods and shadowed ruins." },
      { id: "noble", name: "Noble", attributes: ["STR", "INT", "CHA"], feat: "Skilled", description: "Raised in high society, well-versed in diplomacy, history, and courtly customs." },
      { id: "one-of-the-taken", name: "One of the Taken", attributes: ["DEX", "WIS", "CHA"], feat: "Magic Initiate (Druid)", description: "Strayed into the dark as a child and mysteriously returned months or years later, forever changed." },
      { id: "physician", name: "Physician", attributes: ["DEX", "INT", "WIS"], feat: "Triage Expert", description: "Treats the sick and injured using advanced science, remedies, and experimental theories." },
      { id: "pioneer", name: "Pioneer", attributes: ["STR", "CON", "WIS"], feat: "Survivor", description: "Hardy explorer who sets out to tame uncharted lands and build new settlements." },
      { id: "pit-fighter", name: "Pit Fighter", attributes: ["STR", "DEX", "CHA"], feat: "Savage Attacker", description: "Fought in underground blood-sport arenas, navigating the Pit Fighter's Guild network." },
      { id: "pox-doctor", name: "Pox Doctor", attributes: ["CON", "INT", "WIS"], feat: "Healer", description: "Treats plague victims and handles morbid afflictions using grim medical methods." },
      { id: "pox-touched", name: "Pox-Touched", attributes: ["CON", "INT", "WIS"], feat: "Triage Expert", description: "Survived the deadly Weeping Pox thanks to a stranger's elixirs, bearing lasting scars." },
      { id: "prisoner", name: "Prisoner", attributes: ["DEX", "CON", "CHA"], feat: "Alert", description: "Learned to survive harsh incarceration, deal with guards, and craft hidden tools." },
      { id: "purple-dragon-squire", name: "Purple Dragon Squire", attributes: ["STR", "DEX", "CHA"], feat: "Savage Attacker", description: "Trained in the honorable martial traditions and knightly discipline of Cormyr." },
      { id: "rashemi-wanderer", name: "Rashemi Wanderer", attributes: ["STR", "CON", "WIS"], feat: "Tough", description: "A tough traveler steeped in the ancestral spirit magic and rugged traditions of Rashemen." },
      { id: "reflected-wanderer", name: "Reflected Wanderer", attributes: ["STR", "DEX", "CON", "INT", "WIS", "CHA"], feat: "Unreflected", description: "Separated from your own shadow or mirror image, living a fractured life." },
      { id: "released-thrall", name: "Released Thrall", attributes: ["CON", "INT", "WIS"], feat: "Survivor", description: "Captured by Valikan raiders for key skills, eventually finding or earning a way back home." },
      { id: "rest-warden", name: "Rest Warden", attributes: ["STR", "DEX", "CON", "INT", "WIS", "CHA"], feat: "Grave Keeper", description: "A gravedigger or undertaker who ensures the dead stay peacefully buried." },
      { id: "reveler", name: "Reveler", attributes: ["STR", "DEX", "CON", "INT", "WIS", "CHA"], feat: "Reveling Fool", description: "A traveler of wild nocturnal festivals and eerie, forgotten carnivals." },
      { id: "sage", name: "Sage", attributes: ["CON", "INT", "WIS"], feat: "Magic Initiate (Wizard)", description: "Studied in great libraries and archives, learning magic and historical lore." },
      { id: "sailor", name: "Sailor", attributes: ["STR", "DEX", "WIS"], feat: "Tavern Brawler", description: "Called the open water home, surviving harsh storms and rough harbor life." },
      { id: "scholar-of-the-forbidden", name: "Scholar of the Forbidden", attributes: ["STR", "DEX", "CON", "INT", "WIS", "CHA"], feat: "Dread Speech", description: "Uncovered taboo occult texts and lore that traditional academies shun." },
      { id: "scion-of-the-thaumaturge", name: "Scion of the Thaumaturge", attributes: ["INT", "WIS", "CHA"], feat: "Fortune of the Thaumaturge", description: "Served the secret organization known as the Thaumaturge, executing inscrutable orders." },
      { id: "scribe", name: "Scribe", attributes: ["DEX", "INT", "WIS"], feat: "Skilled", description: "Focused on copying texts and documents with a finely honed eye for detail." },
      { id: "shadowmasters-exile", name: "Shadowmasters Exile", attributes: ["DEX", "INT", "CHA"], feat: "Alert", description: "A rogue or survivor on the run from Telflamme's notorious shadow guild." },
      { id: "shadowmoor-expert", name: "Shadowmoor Expert", attributes: ["DEX", "INT", "CHA"], feat: "Shadowmoor Hexer", description: "Survives or studies the gloomy, moonlight-lit realm of Shadowmoor using wit, cunning, or brawn while carefully choosing whom to trust." },
      { id: "soldier", name: "Soldier", attributes: ["STR", "DEX", "CON"], feat: "Savage Attacker", description: "Trained in battle and warfare, built on physical strength and combat experience." },
      { id: "spirit-medium", name: "Spirit Medium", attributes: ["CON", "INT", "WIS"], feat: "Dark Gift (Gathered Whispers recommended)", description: "Serves as a conduit for spirits of the dead and damned, drawing prescient insight that comes at a haunting cost." },
      { id: "syndicate-smuggler", name: "Syndicate Smuggler", attributes: ["DEX", "INT", "CHA"], feat: "Resolution of the Syndicate", description: "Operative for the Ebon Syndicate skilled at moving contraband across guarded borders." },
      { id: "vampire-devotee", name: "Vampire Devotee", attributes: ["STR", "CON", "CHA"], feat: "Vampire's Plaything", description: "Served in a lair of vampires, repeatedly fed upon as a familiar or aspiring undead." },
      { id: "vampire-survivor", name: "Vampire Survivor", attributes: ["DEX", "CON", "WIS"], feat: "Vampire Hunter", description: "Lived through a horrific vampire encounter, keeping a vigilant watch against monster attacks." },
      { id: "wayfarer", name: "Wayfarer", attributes: ["DEX", "WIS", "CHA"], feat: "Lucky", description: "Wandered street corners or distant roads, relying on stealth, insight, and luck." },
      { id: "wicker-weaver", name: "Wicker Weaver", attributes: ["STR", "DEX", "CON", "INT", "WIS", "CHA"], feat: "Charm Twister", description: "Crafts effigies, pagan icons, and wicker talismans to ward off dark spirits." },
      { id: "zhentarim-mercenary", name: "Zhentarim Mercenary", attributes: ["STR", "DEX", "CHA"], feat: "Zhentarim Ruffian", description: "An operative connected to the Black Network, balancing ruthlessness and profit." }
    ];

    // Inject Styles
    GM_addStyle(`
        #dndb-bg-trigger-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999999;
            background: #822000;
            color: #fff;
            border: 2px solid #e2bc68;
            border-radius: 30px;
            padding: 10px 18px;
            font-family: 'Roboto Condensed', Roboto, sans-serif;
            font-weight: bold;
            font-size: 13px;
            letter-spacing: 1px;
            text-transform: uppercase;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            transition: all 0.2s ease-in-out;
        }
        #dndb-bg-trigger-btn:hover {
            background: #a32800;
            transform: scale(1.05);
        }

        #dndb-bg-overlay {
            position: fixed;
            top: 0; right: 0; bottom: 0; left: 0;
            background: rgba(0, 0, 0, 0.85);
            z-index: 1000000;
            display: none;
            justify-content: center;
            align-items: center;
            font-family: 'Roboto', sans-serif;
        }

        #dndb-bg-modal {
            background: #12181c;
            border: 2px solid #e2bc68;
            border-radius: 8px;
            width: 92%;
            max-width: 1050px;
            height: 88vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 30px rgba(0,0,0,0.85);
            color: #f0f0f0;
            overflow: hidden;
        }

        .dndb-bg-header {
            background: #1a2328;
            padding: 16px 20px;
            border-bottom: 1px solid #2d383f;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .dndb-bg-header h2 {
            margin: 0;
            color: #e2bc68;
            font-size: 18px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .dndb-bg-close-btn {
            background: none;
            border: none;
            color: #999;
            font-size: 24px;
            cursor: pointer;
            line-height: 1;
        }
        .dndb-bg-close-btn:hover { color: #fff; }

        .dndb-bg-filter-bar {
            background: #182026;
            padding: 16px 20px;
            border-bottom: 1px solid #2d383f;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .dndb-bg-filter-row {
            display: flex;
            flex-wrap: wrap;
            gap: 14px;
            align-items: center;
        }

        .dndb-bg-filter-label {
            font-size: 11px;
            font-weight: bold;
            color: #a3b2b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .dndb-bg-chip {
            display: flex;
            align-items: center;
            gap: 6px;
            background: #222d35;
            padding: 5px 10px;
            border-radius: 4px;
            border: 1px solid #36454f;
            font-size: 12px;
            font-weight: bold;
            color: #e1e8ed;
            cursor: pointer;
            user-select: none;
        }
        .dndb-bg-chip input { accent-color: #822000; cursor: pointer; }

        .dndb-bg-input, .dndb-bg-select {
            background: #222d35;
            border: 1px solid #36454f;
            color: #fff;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 13px;
            outline: none;
        }
        .dndb-bg-input:focus, .dndb-bg-select:focus {
            border-color: #e2bc68;
        }

        .dndb-bg-reset-btn {
            background: #36454f;
            color: #fff;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
        }
        .dndb-bg-reset-btn:hover { background: #4f5d68; }

        .dndb-bg-body {
            padding: 20px;
            overflow-y: auto;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
            gap: 16px;
        }

        .dndb-bg-card {
            background: #1a2328;
            border: 1px solid #2d383f;
            border-radius: 6px;
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .dndb-bg-card-title {
            font-size: 15px;
            font-weight: bold;
            color: #fff;
            border-bottom: 1px solid #2d383f;
            padding-bottom: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .dndb-bg-card-attrs {
            color: #e2bc68;
            font-size: 10px;
            font-weight: bold;
            background: #222d35;
            padding: 3px 6px;
            border-radius: 3px;
            letter-spacing: 0.5px;
        }
        .dndb-bg-card-feat {
            font-size: 12px;
            color: #a0e0ff;
            font-weight: bold;
        }
        .dndb-bg-card-desc {
            font-size: 12px;
            color: #90a4ae;
            line-height: 1.4;
        }
    `);

    // Extract unique feats excluding wildcard descriptors
    const uniqueFeats = Array.from(new Set(
        BACKGROUNDS
            .map(b => b.feat)
            .filter(f => !f.toLowerCase().includes("any"))
    )).sort();

    // Trigger Button
    const btn = document.createElement("button");
    btn.id = "dndb-bg-trigger-btn";
    btn.innerHTML = `📜 Background Finder (${BACKGROUNDS.length})`;
    document.body.appendChild(btn);

    // Modal
    const overlay = document.createElement("div");
    overlay.id = "dndb-bg-overlay";
    overlay.innerHTML = `
        <div id="dndb-bg-modal">
            <div class="dndb-bg-header">
                <h2>Background Matrix (${BACKGROUNDS.length} Options)</h2>
                <button class="dndb-bg-close-btn" id="dndb-bg-close">&times;</button>
            </div>
            <div class="dndb-bg-filter-bar">
                <div class="dndb-bg-filter-row">
                    <span class="dndb-bg-filter-label">Required Stats:</span>
                    ${["STR", "DEX", "CON", "INT", "WIS", "CHA"].map(attr => `
                        <label class="dndb-bg-chip">
                            <input type="checkbox" value="${attr}" class="dndb-bg-attr-filter">
                            ${attr}
                        </label>
                    `).join('')}
                </div>
                <div class="dndb-bg-filter-row">
                    <span class="dndb-bg-filter-label">Filter Feat:</span>
                    <select id="dndb-bg-feat-select" class="dndb-bg-select">
                        <option value="">All Origin Feats</option>
                        ${uniqueFeats.map(f => `<option value="${f}">${f}</option>`).join('')}
                    </select>

                    <span class="dndb-bg-filter-label" style="margin-left: 10px;">Search:</span>
                    <input type="text" id="dndb-bg-search-input" class="dndb-bg-input" placeholder="Search name or description..." style="flex-grow: 1;">

                    <button id="dndb-bg-reset" class="dndb-bg-reset-btn">Reset</button>
                </div>
            </div>
            <div class="dndb-bg-body" id="dndb-bg-cards-container"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    const cardsContainer = document.getElementById("dndb-bg-cards-container");
    const filterCheckboxes = document.querySelectorAll(".dndb-bg-attr-filter");
    const featSelect = document.getElementById("dndb-bg-feat-select");
    const searchInput = document.getElementById("dndb-bg-search-input");
    const resetBtn = document.getElementById("dndb-bg-reset");

    function renderCards() {
        const selectedAttrs = Array.from(filterCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        const selectedFeat = featSelect.value;
        const query = searchInput.value.toLowerCase().trim();

        const filtered = BACKGROUNDS.filter(bg => {
            // 1. Attribute Filter
            if (selectedAttrs.length > 0) {
                const hasAllAttrs = selectedAttrs.every(attr => bg.attributes.includes(attr));
                if (!hasAllAttrs) return false;
            }

            // 2. Feat Filter (Wildcard check for "Any Origin Feat")
            if (selectedFeat) {
                const isWildcardFeat = bg.feat.toLowerCase().includes("any");
                if (!isWildcardFeat && bg.feat !== selectedFeat) {
                    return false;
                }
            }

            // 3. Search Query Filter
            if (query) {
                const nameMatch = bg.name.toLowerCase().includes(query);
                const descMatch = bg.description.toLowerCase().includes(query);
                const featMatch = bg.feat.toLowerCase().includes(query);
                if (!nameMatch && !descMatch && !featMatch) return false;
            }

            return true;
        });

        if (filtered.length === 0) {
            cardsContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px;">No backgrounds match your selected filters.</div>`;
            return;
        }

        cardsContainer.innerHTML = filtered.map(bg => `
            <div class="dndb-bg-card">
                <div class="dndb-bg-card-title">
                    <span>${bg.name}</span>
                    <span class="dndb-bg-card-attrs">${bg.attributes.join(", ")}</span>
                </div>
                <div class="dndb-bg-card-feat">⚡ Feat: ${bg.feat}</div>
                <div class="dndb-bg-card-desc">${bg.description}</div>
            </div>
        `).join('');
    }

    btn.addEventListener("click", () => {
        overlay.style.display = "flex";
        renderCards();
    });

    document.getElementById("dndb-bg-close").addEventListener("click", () => {
        overlay.style.display = "none";
    });

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.style.display = "none";
    });

    filterCheckboxes.forEach(cb => cb.addEventListener("change", renderCards));
    featSelect.addEventListener("change", renderCards);
    searchInput.addEventListener("input", renderCards);

    resetBtn.addEventListener("click", () => {
        filterCheckboxes.forEach(cb => cb.checked = false);
        featSelect.value = "";
        searchInput.value = "";
        renderCards();
    });
})();
