/**
 * KomeKaigi スピーカー表示機能
 */
(function(window, document) {
    'use strict';

    // 設定
    const CONFIG = {
        DATA_URL: 'data/speakers.json',
        SECTION_ID: 'sessions',
        CONTAINER_SELECTOR: '#sessions .flex'
    };

    /**
     * スピーカーセクションを非表示にする
     */
    function hideSpeakersSection() {
        const container = document.querySelector(CONFIG.CONTAINER_SELECTOR);
        if (container) {
            container.innerHTML = '';
        }
        const sessionsSection = document.getElementById(CONFIG.SECTION_ID);
        if (sessionsSection) {
            sessionsSection.style.display = 'none';
        }
    }

    /**
     * スピーカーデータを取得して表示
     */
    async function loadSpeakers() {
        try {
            const response = await fetch(CONFIG.DATA_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            renderSpeakerCards(data.sessions || []);
            
        } catch (error) {
            console.error('スピーカーデータの取得エラー:', error);
            hideSpeakersSection();
        }
    }

    /**
     * スピーカーカードをレンダリング
     * @param {Array} sessions - セッションの配列
     */
    function renderSpeakerCards(sessions) {
        const container = document.querySelector(CONFIG.CONTAINER_SELECTOR);
        if (!container) return;

        // スピーカーがいるセッションのみ表示
        const speakerCards = sessions
            .filter(session => session.speakers && session.speakers.length > 0)
            .flatMap(session =>
                session.speakers.map(speaker =>
                    createSpeakerCard(speaker, session.type)
                )
            )
            .join('');

        if (!speakerCards) {
            hideSpeakersSection();
            return;
        }

        container.innerHTML = speakerCards;
    }

    /**
     * スピーカーカードを作成
     * @param {Object} speaker - スピーカーのデータ
     * @param {string} sessionType - セッションタイプ
     * @returns {string} HTMLテキスト
     */
    function createSpeakerCard(speaker, sessionType) {
        return `
            <div class="speaker-card card p-8 md:p-10">
                <div class="text-center mb-6">
                    <span class="speaker-type text-xl md:text-2xl font-bold uppercase tracking-wider inline-block mb-4">
                        ${escapeHtml(sessionType)}
                    </span>
                    <div class="mb-6">
                        <img src="${escapeHtml(speaker.image)}" 
                             alt="${escapeHtml(speaker.name)}" 
                             class="speaker-image w-36 h-36 mx-auto rounded-full object-cover border-2 border-gray-200"
                             loading="lazy"/>
                    </div>
                    <h3 class="text-2xl font-bold mb-3 text-gray-800">${escapeHtml(speaker.name)}</h3>
                    <p class="text-gray-600 mb-6">${escapeHtml(speaker.role)}</p>
                </div>
                <div class="text-left px-2">
                    <p class="text-gray-700 leading-loose text-sm">${speaker.description}</p>
                </div>
            </div>
        `;
    }

    // 初期化
    document.addEventListener('DOMContentLoaded', loadSpeakers);

})(window, document);