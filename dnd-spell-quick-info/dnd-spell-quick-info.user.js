// ==UserScript==
// @name         D&D Beyond Character Sheet Spell Quick-Info
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Injects Casting Time, Range/Area, and Components directly into collapsed spell headers on D&D Beyond.
// @author       Matt
// @match        https://www.dndbeyond.com/characters/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dndbeyond.com
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/mekimball/tampermonkey-scripts/main/dnd-spell-quick-info/dnd-spell-quick-info.user.js
// @downloadURL  https://raw.githubusercontent.com/mekimball/tampermonkey-scripts/main/dnd-spell-quick-info/dnd-spell-quick-info.user.js
// ==/UserScript==

(function () {
    'use strict';

    // Inject styles for badges matching D&D Beyond's dark/light interface theme
    GM_addStyle(`
        .dndb-inline-spell-info {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-left: 10px;
            vertical-align: middle;
        }

        .dndb-inline-badge {
            background: rgba(36, 37, 40, 0.06);
            color: #4b5563;
            border: 1px solid rgba(0, 0, 0, 0.12);
            padding: 1px 6px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            line-height: 1.4;
            letter-spacing: 0.2px;
            white-space: nowrap;
        }

        /* Subtle color accents for visual distinction */
        .dndb-inline-badge.time { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
        .dndb-inline-badge.range { background: #fefce8; color: #a16207; border-color: #fef08a; }
        .dndb-inline-badge.comp { background: #f8fafc; color: #334155; border-color: #e2e8f0; }

        /* Dark mode compatibility */
        .ct-character-sheet--dark-mode .dndb-inline-badge.time { background: #1e3a8a; color: #bfdbfe; border-color: #1d4ed8; }
        .ct-character-sheet--dark-mode .dndb-inline-badge.range { background: #713f12; color: #fef08a; border-color: #a16207; }
        .dndb-inline-badge.comp { background: #1e293b; color: #cbd5e1; border-color: #334155; }
    `);

    // Helper map for standard 2024 / Core Spells to display instantly before drop-down load
    const QUICK_LOOKUP = {
        "guidance": { time: "1 A", range: "Touch", comp: "V, S" },
        "light": { time: "1 A", range: "Touch", comp: "V, M" },
        "spare the dying": { time: "1 A", range: "Touch", comp: "V, S" },
        "thaumaturgy": { time: "1 A", range: "30 ft", comp: "V" },
        "toll the dead": { time: "1 A", range: "60 ft", comp: "V, S" },
        "bless": { time: "1 A", range: "30 ft", comp: "V, S, M" },
        "command": { time: "1 A", range: "60 ft", comp: "V" },
        "cure wounds": { time: "1 A", range: "Touch", comp: "V, S" }
    };

    function formatCastingTime(timeStr) {
        if (!timeStr) return "1 A";
        if (timeStr.toLowerCase().includes("bonus")) return "1 B";
        if (timeStr.toLowerCase().includes("reaction")) return "1 R";
        if (timeStr.toLowerCase().includes("action")) return "1 A";
        return timeStr;
    }

    function processSpellHeader(headerEl) {
        if (headerEl.dataset.dndbProcessed === "true") return;

        // Locate the summary container (styles_summaryContent...)
        const summaryContent = headerEl.querySelector('[class*="summaryContent"]');
        if (!summaryContent) return;

        // Locate the metaItems block where "Cantrip" and "Concentration" live
        const metaItems = summaryContent.querySelector('[class*="metaItems"]');
        if (!metaItems) return;

        // Extract Spell Name
        const nameEl = summaryContent.querySelector('[class*="spellName"]');
        if (!nameEl) return;

        // Clone node & strip child elements (like the SVG concentration diamond) to get clean text
        const cleanName = nameEl.cloneNode(true);
        Array.from(cleanName.children).forEach(child => child.remove());
        const spellKey = cleanName.textContent.trim().toLowerCase();

        let info = QUICK_LOOKUP[spellKey];

        // Check if the dropdown drawer container exists in the parent tree to extract live values
        const parentRow = headerEl.closest('[class*="spell"], [class*="item"], [role="listitem"]') || headerEl.parentElement;
        if (parentRow) {
            const detailProps = parentRow.querySelectorAll('[class*="styles_item"]');
            if (detailProps.length > 0) {
                let liveTime, liveRange, liveComp;

                detailProps.forEach(prop => {
                    const label = prop.querySelector('[class*="label"]')?.textContent;
                    const val = prop.querySelector('[class*="value"]')?.textContent;

                    if (label && val) {
                        if (label.includes("Casting Time")) liveTime = formatCastingTime(val);
                        if (label.includes("Range")) liveRange = val.trim();
                        if (label.includes("Components")) liveComp = val.trim();
                    }
                });

                if (liveTime || liveRange || liveComp) {
                    info = { time: liveTime, range: liveRange, comp: liveComp };
                }
            }
        }

        // Render Badges
        if (info) {
            const container = document.createElement("span");
            container.className = "dndb-inline-spell-info";

            if (info.time) {
                const timeBadge = document.createElement("span");
                timeBadge.className = "dndb-inline-badge time";
                timeBadge.title = "Casting Time";
                timeBadge.textContent = `⏱ ${info.time}`;
                container.appendChild(timeBadge);
            }

            if (info.range) {
                const rangeBadge = document.createElement("span");
                rangeBadge.className = "dndb-inline-badge range";
                rangeBadge.title = "Range / Area";
                rangeBadge.textContent = `🎯 ${info.range}`;
                container.appendChild(rangeBadge);
            }

            if (info.comp) {
                const compBadge = document.createElement("span");
                compBadge.className = "dndb-inline-badge comp";
                compBadge.title = "Components";
                compBadge.textContent = `📜 ${info.comp}`;
                container.appendChild(compBadge);
            }

            metaItems.appendChild(container);
            headerEl.dataset.dndbProcessed = "true";
        }
    }

    function scanForSpells() {
        // Query for elements matching the class structure provided
        const headers = document.querySelectorAll('[class*="styles_heading"]');
        headers.forEach(processSpellHeader);
    }

    // MutationObserver to capture dynamically mounted elements as you scroll or toggle filters
    const observer = new MutationObserver(() => {
        scanForSpells();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial Scan
    scanForSpells();
})();
