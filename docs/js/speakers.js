/**
 * KomeKaigi スピーカー管理モジュール
 */

class SpeakerManager {
    constructor() {
        this.sessions = [];
    }

    /**
     * 初期化
     */
    async init() {
        try {
            // スピーカーカードの動的生成
            await this.loadSpeakers();
            this.renderSpeakerCards();
        } catch (error) {
            console.error('Failed to initialize speakers:', error);
            this.handleError('スピーカー情報の読み込みに失敗しました');
        }
    }

    /**
     * スピーカーデータの読み込み
     */
    async loadSpeakers() {
        try {
            const response = await fetch('data/speakers.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.sessions = data.sessions || [];
        } catch (error) {
            console.error('Failed to load speakers data:', error);
            this.sessions = [];
            this.handleError('スピーカー情報の読み込みに失敗しました');
        }
    }

    /**
     * スピーカーカードの動的生成
     */
    renderSpeakerCards() {
        const container = document.querySelector('#speakers .flex');
        if (!container) return;

        // スピーカーがいるセッションのみ表示
        container.innerHTML = this.sessions
            .filter(session => session.speakers && session.speakers.length > 0)
            .flatMap(session =>
                session.speakers.map(speaker =>
                    this.createSpeakerCard(speaker, session.type)
                )
            )
            .join('');
    }

    /**
     * スピーカーカードのHTML生成
     */
    createSpeakerCard(speaker, sessionType) {
        return `
            <div class="speaker-card card p-8 md:p-10">
                <div class="text-center mb-6">
                    <span class="speaker-type text-xl md:text-2xl font-bold uppercase tracking-wider inline-block mb-4">
                        ${this.escapeHtml(sessionType)}
                    </span>
                    <div class="mb-6">
                        <img src="${this.escapeHtml(speaker.image)}" 
                             alt="${this.escapeHtml(speaker.name)}" 
                             class="speaker-image w-36 h-36 mx-auto rounded-full object-cover border-2 border-gray-200"
                             loading="lazy"/>
                    </div>
                    <h3 class="text-2xl font-bold mb-3 text-gray-800">${this.escapeHtml(speaker.name)}</h3>
                    <p class="text-gray-600 mb-6">${this.escapeHtml(speaker.role)}</p>
                </div>
                <div class="text-left px-2">
                    <p class="text-gray-700 leading-loose text-sm">${speaker.description}</p>
                </div>
            </div>
        `;
    }

    /**
     * HTMLエスケープ
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * エラーハンドリング
     */
    handleError(message) {
        console.error(message);
        const container = document.querySelector('#speakers .flex');
        if (container && container.children.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-600">スピーカー情報を読み込めませんでした</p>';
        }
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    const speakerManager = new SpeakerManager();
    speakerManager.init();
});