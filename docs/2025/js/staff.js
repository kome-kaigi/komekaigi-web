/**
 * KomeKaigi スタッフ表示機能
 */
(function(window, document) {
    'use strict';

    // 設定
    const CONFIG = {
        API_URL: 'https://fortee.jp/komekaigi-2025/api/staff?type=structured',
        SECTION_ID: 'staff',
        CONTENT_ID: 'staff-content'
    };

    /**
     * スタッフセクションを非表示にする
     */
    function hideStaffSection() {
        const staffSection = document.getElementById(CONFIG.SECTION_ID);
        if (staffSection) {
            staffSection.style.display = 'none';
        }
    }

    /**
     * スタッフデータを取得して表示
     */
    async function loadStaffMembers() {
        const contentElement = document.getElementById(CONFIG.CONTENT_ID);
        if (!contentElement) return;
        
        try {
            const response = await fetch(CONFIG.API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            renderStaffList(data.staff_types, contentElement);
            
        } catch (error) {
            console.error('スタッフデータの取得エラー:', error);
            contentElement.innerHTML = '';
            hideStaffSection();
        }
    }

    /**
     * スタッフリストをレンダリング
     * @param {Array} staffTypes - スタッフタイプの配列
     * @param {HTMLElement} container - 表示先のコンテナ要素
     */
    function renderStaffList(staffTypes, container) {
        if (!staffTypes || staffTypes.length === 0) {
            container.innerHTML = '';
            hideStaffSection();
            return;
        }
        
        const sectionTitle = `
            <div class="text-center mb-8">
                <h3 class="text-3xl section-title">スタッフ</h3>
            </div>
        `;
        
        const staffHTML = staffTypes.map(type => {
            // アバター画像があるメンバーのみフィルタリング
            const membersWithAvatar = type.staff.filter(member => member.avatar_url);
            
            // アバター画像があるメンバーがいない場合はセクションを表示しない
            if (membersWithAvatar.length === 0) {
                return '';
            }
            
            return `
                <div class="mb-12">
                    <h4 class="text-2xl font-semibold text-center mb-8 text-primary">
                        ${escapeHtml(type.name)}
                    </h4>
                    <div class="staff-grid">
                        ${membersWithAvatar.map(member => createStaffCard(member)).join('')}
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = sectionTitle + staffHTML;
    }

    /**
     * スタッフカードを作成
     * @param {Object} member - スタッフメンバーのデータ
     * @returns {string} HTMLテキスト
     */
    function createStaffCard(member) {
        // アバター画像がない場合は空文字を返す（すでにフィルタリング済みだが念のため）
        if (!member.avatar_url) {
            return '';
        }
        
        const hasLink = member.url && member.url.trim() !== '';
        
        const cardContent = `
            <div class="staff-member">
                <div class="staff-avatar-wrapper">
                    <img src="${escapeHtml(member.avatar_url)}" 
                         alt="${escapeHtml(member.name)}" 
                         class="staff-avatar"
                         loading="lazy">
                </div>
                <div class="staff-name">
                    ${escapeHtml(member.name)}
                </div>
            </div>
        `;
        
        return hasLink 
            ? `<a href="${escapeHtml(member.url)}" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="staff-link">
                  ${cardContent}
               </a>`
            : cardContent;
    }

    // 初期化
    document.addEventListener('DOMContentLoaded', loadStaffMembers);

})(window, document);