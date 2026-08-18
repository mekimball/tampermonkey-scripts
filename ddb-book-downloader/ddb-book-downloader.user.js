// ==UserScript==
// @name         DDB Book Downloader (Universal Edition - Fixed)
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  Save your DDB books to PDF using a queued, stable fetch method without duplicate pages!
// @author       C T Zaran & Community Fixes
// @match        https://www.dndbeyond.com/sources/*
// @match        https://www.dndbeyond.com/sources/dnd/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/mekimball/tampermonkey-scripts/main/ddb-book-downloader/ddb-book-downloader.user.js
// @downloadURL  https://raw.githubusercontent.com/mekimball/tampermonkey-scripts/main/ddb-book-downloader/ddb-book-downloader.user.js
// ==/UserScript==

(async function() {
    'use strict';

    const tocSelector = $('.compendium-toc-full-text').length ? '.compendium-toc-full-text' : '.source-toc-chapters';
    if ($(tocSelector).length === 0) return;

    localStorage.clear();

    const bookTitle = $(document).attr('title');

    // 1. Convert all hrefs to full, absolute URLs and strip off anchor fragments (#)
    const rawPages = $(tocSelector).find('a').map((i, el) => {
        const href = $(el).attr('href');
        if (!href) return null;

        // Resolve to absolute URL using browser's URL constructor
        const fullUrl = new URL(href, window.location.origin);
        fullUrl.hash = ''; // Remove #anchors to avoid fetching the same page twice
        return fullUrl.href;
    }).get().filter(Boolean);

    // 2. Deduplicate clean URLs
    const pages = Array.from(new Set(rawPages));

    const newbookCons = `<div><button class="doPDF" type="button" disabled style="padding: 12px 24px; margin-bottom: 20px; font-size: 16px; font-weight: bold; background-color: #e31919; color: white; border: none; border-radius: 4px; cursor: pointer;">Loading... (0/${pages.length})</button></div>`;
    $(tocSelector).prepend(newbookCons);

    // Queued fetcher function
    async function downloadChapters() {
        for (let i = 0; i < pages.length; i++) {
            try {
                // Wait 800ms between requests to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 800));

                const response = await fetch(pages[i]);
                const text = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                const content = doc.querySelector('.p-article-content')?.innerHTML || "";

                const formattedChapter = `<div style="page-break-after: always; break-after: page;">${content}</div>`;
                localStorage.setItem(i, formattedChapter);

                $('.doPDF').text(`Loading Book Chapters (${i + 1}/${pages.length})...`);
            } catch (err) {
                console.error("Error loading", pages[i], err);
            }
        }
        $('.doPDF').prop('disabled', false).text('Compile PDF').css('background-color', '#008CBA');
    }

    // Start the download process
    downloadChapters();

    $('.doPDF').on('click', function() {
        // Inject <base> tag so relative CSS/images resolve correctly in the new window
        let bookHTML = `<html><head><title>${bookTitle}</title><base href="${window.location.origin}"></head><body>`;
        for (let i = 0; i < pages.length; i++) {
            bookHTML += localStorage.getItem(i) || "";
        }
        bookHTML += '</body></html>';

        const openBook = window.open();
        if (openBook) {
            openBook.document.write(bookHTML);
            openBook.document.close();
        } else {
            alert('Please allow popups for this site to view the compiled PDF page.');
        }
    });
})();
