/**
 * スポンサー表示システム
 * APIからスポンサー情報を取得し、動的に表示
 */

(function(window) {
    'use strict';

    const CONFIG = {
        // API設定
        API: {
            URL: 'https://fortee.jp/komekaigi-2025/api/sponsors',
            TIMEOUT: 10000,       // APIタイムアウト（10秒）
            RETRY_COUNT: 3,       // リトライ回数
            RETRY_DELAY: 1000     // リトライ間隔（ミリ秒）
        },
        
        // コンテンツ設定
        CONTENT: {
            MIN_PR_LENGTH: 20,    // PR文の最小文字数
            ERROR_MESSAGE: 'スポンサー情報の読み込みに失敗しました。',
            RELOAD_BUTTON_TEXT: 'ページを再読み込み'
        },
        
        // スポンサータイプ
        SPONSOR_TYPES: {
            GOLD: { key: 'gold', label: 'GOLD', labelJp: 'ゴールドスポンサー' },
            SILVER: { key: 'silver', label: 'SILVER', labelJp: 'シルバースポンサー' },
            VENUE: { key: 'venue', label: 'VENUE', labelJp: '会場提供' }
        },
        
        // モーダル設定
        MODAL: {
            LOGO_SIZE: 250,        // モーダル内ロゴサイズ
            WRAPPER_WIDTH: 250     // モーダル内ロゴラッパー幅
        }
    };

    let sponsorsData = [];

    /**
     * スポンサー情報を取得して表示（リトライ機能付き）
     * @param {number} retryCount - リトライ回数
     */
    async function loadSponsors(retryCount = 0) {
        const sponsorSection = document.getElementById('sponsors-content');
        let shouldRetry = false;
        let errorMessage = '';
        
        try {
            // タイムアウト設定付きfetch
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT);
            
            const response = await fetch(CONFIG.API.URL, { 
                signal: controller.signal 
            });
            clearTimeout(timeout);
            
            if (!response.ok) {
                errorMessage = `HTTP error! status: ${response.status}`;
                shouldRetry = true;
            } else {
                const data = await response.json();
                
                if (!data || !data.sponsor_plans) {
                    errorMessage = 'Invalid sponsor data format';
                    shouldRetry = true;
                } else {
                    // 正常にデータを取得できた場合
                    const sponsorsByType = categorizeSponsors(data.sponsor_plans);
                    renderSponsors(sponsorsByType);
                    return; // 成功したので終了
                }
            }
            
        } catch (error) {
            // ネットワークエラーやタイムアウトなど
            errorMessage = error.message;
            shouldRetry = true;
        }
        
        // エラー処理
        if (shouldRetry) {
            // リトライ処理
            if (retryCount < CONFIG.API.RETRY_COUNT - 1) {
                setTimeout(() => loadSponsors(retryCount + 1), CONFIG.API.RETRY_DELAY);
            } else {
                // リトライ回数超過時のフォールバック表示
                renderErrorMessage(sponsorSection, CONFIG.CONTENT.ERROR_MESSAGE);
            }
        }
    }

    /**
     * エラーメッセージを表示
     * @param {HTMLElement} container - 表示先の要素
     * @param {string} message - エラーメッセージ
     */
    function renderErrorMessage(container, message) {
        if (!container) return;
        
        container.innerHTML = `
            <div class="text-center py-8">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                    <svg class="w-8 h-8 text-amber-600" fill-none stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z">
                        </path>
                    </svg>
                </div>
                <p class="text-gray-600 mb-4">${message}</p>
                <button id="errorReloadButton" class="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors">
                    ${CONFIG.CONTENT.RELOAD_BUTTON_TEXT}
                </button>
            </div>
        `;
        
        // リロードボタンのイベントリスナーを追加
        const reloadButton = document.getElementById('errorReloadButton');
        if (reloadButton) {
            reloadButton.addEventListener('click', () => location.reload());
        }
    }

/**
 * スポンサーをタイプ別に分類
 * @param {Array} sponsorPlans - APIから取得したスポンサープラン
 * @returns {Object} タイプ別に分類されたスポンサー
 */
function categorizeSponsors(sponsorPlans) {
    const sponsorsByType = {
        gold: [],
        silver: [],
        venue: []
    };

    sponsorPlans.forEach(plan => {
        const planName = plan.name?.toLowerCase() || '';
        const type = determineSponsorType(planName);
        
        if (type) {
            const filteredSponsors = filterValidSponsors(plan.sponsors || []);
            filteredSponsors.forEach(sponsor => {
                sponsor.sponsorType = type;
                sponsor.sponsorTypeName = getSponsorTypeName(type);
                sponsorsByType[type].push(sponsor);
                sponsorsData.push(sponsor);
            });
        }
    });

    return sponsorsByType;
}

/**
 * プラン名からスポンサータイプを判定
 * @param {string} planName - プラン名
 * @returns {string|null} スポンサータイプ
 */
function determineSponsorType(planName) {
    if (planName.includes('ゴールド')) return 'gold';
    if (planName.includes('シルバー')) return 'silver';
    if (planName.includes('会場')) return 'venue';
    return null;
}

/**
 * スポンサータイプから日本語名を取得
 * @param {string} type - スポンサータイプ
 * @returns {string} 日本語名
 */
function getSponsorTypeName(type) {
    const typeMap = {
        gold: 'ゴールドスポンサー',
        silver: 'シルバースポンサー',
        venue: '会場提供'
    };
    return typeMap[type] || '';
}

/**
 * 有効なスポンサーのみをフィルタリング
 * @param {Array} sponsors - スポンサーリスト
 * @returns {Array} フィルタリング済みスポンサーリスト
 */
function filterValidSponsors(sponsors) {
    return sponsors.filter(sponsor => {
        // ロゴとPR文の両方が必要
        const hasLogo = sponsor.avatar || sponsor.logo;
        const hasValidPR = sponsor.pr && sponsor.pr.length >= CONFIG.CONTENT.MIN_PR_LENGTH;
        return hasLogo && hasValidPR;
    });
}

/**
 * スポンサーセクションをレンダリング
 * @param {Object} sponsorsByType - タイプ別スポンサー
 */
function renderSponsors(sponsorsByType) {
    const sponsorSection = document.getElementById('sponsors-content');
    if (!sponsorSection) return;

    let html = '';

    // 各タイプのスポンサーをレンダリング
    Object.values(CONFIG.SPONSOR_TYPES).forEach(config => {
        const type = config.key;
        const sponsors = sponsorsByType[type];
        
        if (sponsors && sponsors.length > 0) {
            html += renderSponsorSection(type, config, sponsors);
        }
    });

    sponsorSection.innerHTML = html;
}

/**
 * スポンサーセクションのHTMLを生成
 * @param {string} type - スポンサータイプ
 * @param {Object} config - タイプ設定
 * @param {Array} sponsors - スポンサーリスト
 * @returns {string} HTML文字列
 */
function renderSponsorSection(type, config, sponsors) {
    const cards = sponsors
        .map(sponsor => createSponsorCard(sponsor, type))
        .filter(card => card !== null)
        .map(card => `<div class="sponsor-card-wrapper sponsor-card-${type}">${card}</div>`);
    
    if (cards.length === 0) return '';
    
    return `
        <div class="sponsor-section-${type}">
            <div class="container mx-auto px-4${type !== 'silver' ? ' max-w-6xl' : ''}">
                <div class="text-center mb-8">
                    <h4 class="text-2xl font-semibold text-[#fabe00]">
                        ${config.labelJp}
                    </h4>
                </div>
                <div class="sponsor-cards-container sponsor-cards-${type}">
                    ${cards.join('')}
                </div>
            </div>
        </div>
    `;
}

/**
 * スポンサーカードを作成
 * @param {Object} sponsor - スポンサー情報
 * @param {string} type - スポンサータイプ
 * @returns {string|null} カードHTML
 */
function createSponsorCard(sponsor, type) {
    const name = sponsor.name || '';
    const logoUrl = sponsor.avatar || sponsor.logo || '';
    const sponsorId = sponsor.id || generateRandomId();
    
    // ロゴがない場合は表示しない
    if (!logoUrl) {
        return null;
    }

    // カードのサイズはCSSクラスで制御
    
    return `
        <div class="sponsor-card sponsor-card-${type}" data-sponsor-id="${sponsorId}">
            <div class="sponsor-logo-wrapper overflow-container">
                <img src="${logoUrl}" alt="${name}" loading="lazy" 
                     class="image-border-fix sponsor-logo-img"
                     data-sponsor-name="${name.replace(/"/g, '&quot;')}"
                     data-sponsor-type="${type}">
            </div>
        </div>
    `;
}

/**
 * ランダムIDを生成
 * @returns {string} ランダムID
 */
function generateRandomId() {
    return Math.random().toString(36).substr(2, 9);
}

// ==========================================
// モーダル関連
// ==========================================

/**
 * スポンサーモーダルを開く
 * @param {string} sponsorId - スポンサーID
 */
function openSponsorModal(sponsorId) {
    const sponsor = sponsorsData.find(s => s.id === sponsorId);
    if (!sponsor) return;
    
    const modal = document.getElementById('sponsorModal');
    const modalLogo = document.getElementById('modalLogo');
    const modalInfo = document.getElementById('modalInfo');
    
    // ロゴの表示
    renderModalLogo(modalLogo, sponsor);
    
    // 情報の表示
    renderModalInfo(modalInfo, sponsor);
    
    // モーダルを表示
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * モーダルのロゴをレンダリング
 * @param {HTMLElement} element - ロゴ表示要素
 * @param {Object} sponsor - スポンサー情報
 */
function renderModalLogo(element, sponsor) {
    const logoUrl = sponsor.avatar || sponsor.logo || '';
    const logoHtml = logoUrl
        ? `<img src="${logoUrl}" alt="${sponsor.name}" class="image-border-fix">`
        : `<div class="modal-logo-fallback">${sponsor.name}</div>`;
    
    element.innerHTML = `
        <div class="modal-logo-inner overflow-container">
            ${logoHtml}
        </div>
    `;
}

/**
 * モーダルの情報をレンダリング
 * @param {HTMLElement} element - 情報表示要素
 * @param {Object} sponsor - スポンサー情報
 */
function renderModalInfo(element, sponsor) {
    const links = getSponsorLinks(sponsor);
    
    element.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%; min-height: 300px;">
            <div style="flex: 1;">
                <h4 style="margin-bottom: 1.5rem;">
                    ${sponsor.name}
                </h4>
                ${sponsor.pr && sponsor.pr !== '-' ? `
                    <div>
                        <p class="text-gray-700 leading-relaxed">${sponsor.pr}</p>
                    </div>
                ` : ''}
            </div>
            ${links ? `
                <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
                    <div class="flex gap-3 justify-start">
                        ${links}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * スポンサーリンクを生成
 * @param {Object} sponsor - スポンサー情報
 * @returns {string} リンクHTML
 */
function getSponsorLinks(sponsor) {
    const links = [];
    
    if (sponsor.url) {
        links.push(`
            <a href="${sponsor.url}" target="_blank" rel="noopener noreferrer" 
               class="inline-flex items-center px-4 py-2 bg-[#fabe00] text-white font-medium rounded-lg hover:bg-amber-600 transition-colors">
                <svg class="w-5 h-5 mr-2 fill-none stroke-current" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                スポンサーページへ
            </a>
        `);
    }
    
    if (sponsor.twitter) {
        const twitterUrl = sponsor.twitter.startsWith('http') 
            ? sponsor.twitter 
            : `https://x.com/${sponsor.twitter}`;
        links.push(`
            <a href="${twitterUrl}" target="_blank" rel="noopener noreferrer" 
               class="inline-flex items-center px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
            </a>
        `);
    }
    
    return links.join('');
}

/**
 * スポンサーモーダルを閉じる
 */
function closeSponsorModal() {
    const modal = document.getElementById('sponsorModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ==========================================
// イベントリスナー
// ==========================================

// モーダルの外側をクリックしたら閉じる
window.addEventListener('click', function(event) {
    const modal = document.getElementById('sponsorModal');
    if (event.target === modal) {
        closeSponsorModal();
    }
});

// ESCキーでモーダルを閉じる
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeSponsorModal();
    }
});

    // ==========================================
    // 画像エラーハンドリング
    // ==========================================
    
    /**
     * 画像読み込みエラー時のハンドリング
     */
    function handleImageErrors() {
        document.addEventListener('error', function(e) {
            if (e.target.classList && e.target.classList.contains('sponsor-logo-img')) {
                const img = e.target;
                const wrapper = img.parentElement;
                const name = img.getAttribute('data-sponsor-name');
                const type = img.getAttribute('data-sponsor-type');
                
                // 画像を非表示にしてフォールバック表示
                img.style.display = 'none';
                wrapper.innerHTML = `<div class="sponsor-card-fallback sponsor-card-fallback-${type}">${name}</div>`;
            }
        }, true); // キャプチャリングフェーズで処理
    }
    
    // ==========================================
    // 初期化処理
    // ==========================================
    
    // ページ読み込み時の初期化
    document.addEventListener('DOMContentLoaded', function() {
        loadSponsors();
        handleImageErrors();
        
        // スポンサーカードのクリックイベント（イベント委譲）
        document.addEventListener('click', function(e) {
            const card = e.target.closest('.sponsor-card');
            if (card && card.dataset.sponsorId) {
                openSponsorModal(card.dataset.sponsorId);
            }
        });
        
        // モーダルの閉じるボタンのイベントリスナー
        const modalCloseButton = document.getElementById('modalCloseButton');
        if (modalCloseButton) {
            modalCloseButton.addEventListener('click', closeSponsorModal);
        }
    });
    
    // ==========================================
    // グローバルAPI公開
    // ==========================================
    // イベント委譲を使用するため、グローバル関数の公開は不要
    
})(window);