// ==UserScript==
// @name         D&D Beyond - Inline Spell Material Components
// @namespace    http://tampermonkey.net/
// @version      7.1
// @description  Reads spell material components directly from D&D Beyond's internal React state with strict deduplication.
// @author       Matt
// @match        https://www.dndbeyond.com/characters/*
// @grant        none
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/mekimball/tampermonkey-scripts/main/dnd-inline-materials/dnd-inline-materials.user.js
// @downloadURL  https://raw.githubusercontent.com/mekimball/tampermonkey-scripts/main/dnd-inline-materials/dnd-inline-materials.user.js
// ==/UserScript==

(function() {
    'use strict';

    function getSpellDefinitionFromElement(el) {
        if (!el) return null;
        const fiberKey = Object.keys(el).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactProps$'));
        if (!fiberKey) return null;

        let fiber = el[fiberKey];
        let depth = 0;

        while (fiber && depth < 25) {
            const props = fiber.memoizedProps || fiber;
            if (props) {
                if (props.spell?.definition) return props.spell.definition;
                if (props.spell?.componentsDescription !== undefined) return props.spell;
                if (props.definition?.componentsDescription !== undefined) return props.definition;
                if (props.componentsDescription !== undefined) return props;
                if (props.data?.definition) return props.data.definition;
            }
            fiber = fiber.return;
            depth++;
        }
        return null;
    }

    function injectMaterialComponents() {
        // Target ONLY the primary spell name container (strictly 1 per row)
        const nameContainers = document.querySelectorAll('.ct-spells-spell__name');

        nameContainers.forEach(nameContainer => {
            // HARD STOP: If a badge already exists inside this name container, skip immediately
            if (nameContainer.querySelector('.dndb-material-tag')) return;

            const parentRow = nameContainer.closest('.ct-spells-spell') || nameContainer;
            const spellDef = getSpellDefinitionFromElement(nameContainer) || getSpellDefinitionFromElement(parentRow);

            if (!spellDef) return;

            const desc = (spellDef.componentsDescription || '').trim();

            if (desc.length > 0) {
                const isConsumed = desc.toLowerCase().includes('consume');
                const hasCost = /\b\d+\s*(gp|pp|sp|cp)\b/i.test(desc) || desc.toLowerCase().includes('worth');

                const matBadge = document.createElement('div');
                matBadge.className = 'dndb-material-tag';
                matBadge.textContent = `📦 ${desc}`;

                let bgColor = 'rgba(255, 255, 255, 0.08)';
                let textColor = '#c0c0c0';
                let borderColor = 'rgba(255, 255, 255, 0.2)';

                if (hasCost || isConsumed) {
                    bgColor = 'rgba(212, 175, 55, 0.25)';
                    textColor = '#f39c12';
                    borderColor = 'rgba(212, 175, 55, 0.6)';
                }

                matBadge.style.cssText = `
                    font-size: 11px;
                    line-height: 1.25;
                    margin-top: 4px;
                    padding: 2px 6px;
                    border-radius: 4px;
                    background: ${bgColor};
                    color: ${textColor};
                    border: 1px solid ${borderColor};
                    font-style: italic;
                    word-break: break-word;
                    display: block;
                    width: fit-content;
                `;

                nameContainer.appendChild(matBadge);
            }
        });
    }

    // Throttled observer to prevent rapid-fire injection loops
    let timeout = null;
    const observer = new MutationObserver(() => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(injectMaterialComponents, 100);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(injectMaterialComponents, 500);
})();
