/**
 * KomeKaigi 個人スポンサー表示機能
 */
(function(window, document) {
    'use strict';

    // 設定
    const CONFIG = {
        JSON_URL: 'data/individual_sponsors.json',
        IMAGE_BASE_PATH: 'assets/images/individual_sponsors/',
        SECTION_ID: 'individual-sponsors',
        CONTENT_ID: 'individual-sponsors-content'
    };

    /**
     * 個人スポンサーセクションを非表示にする
     */
    function hideIndividualSponsorsSection() {
        const section = document.getElementById(CONFIG.SECTION_ID);
        if (section) {
            section.style.display = 'none';
        }
    }

    /**
     * 個人スポンサーデータを取得して表示
     */
    async function loadIndividualSponsors() {
        const contentElement = document.getElementById(CONFIG.CONTENT_ID);
        if (!contentElement) return;

        try {
            const response = await fetch(CONFIG.JSON_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const sponsors = await response.json();

            if (sponsors.length === 0) {
                hideIndividualSponsorsSection();
                return;
            }

            renderIndividualSponsorsList(sponsors, contentElement);

        } catch (error) {
            console.error('個人スポンサーデータの取得エラー:', error);
            contentElement.innerHTML = '';
            hideIndividualSponsorsSection();
        }
    }

    /**
     * 個人スポンサーリストをレンダリング
     * @param {Array} sponsors - 個人スポンサーの配列
     * @param {HTMLElement} container - 表示先のコンテナ要素
     */
    function renderIndividualSponsorsList(sponsors, container) {
        const sectionTitle = `
            <div class="text-center mb-8">
                <h4 class="text-2xl font-semibold text-primary">
                    個人スポンサー
                </h4>
            </div>
        `;

        const sponsorsHTML = `
            <div class="staff-grid">
                ${sponsors.map(sponsor => createIndividualSponsorCard(sponsor)).join('')}
            </div>
        `;

        container.innerHTML = sectionTitle + sponsorsHTML;
    }

    /**
     * 個人スポンサーカードを作成
     * @param {Object} sponsor - 個人スポンサーのデータ
     * @returns {string} HTMLテキスト
     */
    function createIndividualSponsorCard(sponsor) {
        const imagePath = `${CONFIG.IMAGE_BASE_PATH}${sponsor.image}`;
        const hasLink = sponsor.url && sponsor.url.trim() !== '';

        const cardContent = `
            <div class="staff-member">
                <div class="staff-avatar-wrapper">
                    <img src="${escapeHtml(imagePath)}"
                         alt="${escapeHtml(sponsor.name)}"
                         class="staff-avatar"
                         loading="lazy">
                </div>
                <div class="staff-name">
                    ${escapeHtml(sponsor.name)}
                </div>
            </div>
        `;

        return hasLink
            ? `<a href="${escapeHtml(sponsor.url)}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="staff-link">
                  ${cardContent}
               </a>`
            : cardContent;
    }

    // 初期化
    document.addEventListener('DOMContentLoaded', loadIndividualSponsors);

})(window, document);