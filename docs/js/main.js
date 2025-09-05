/**
 * KomeKaigi メイン JavaScript
 * モバイルメニューや共通機能を管理
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
});


/**
 * モバイルメニューの初期化
 */
function initializeMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!mobileMenuButton || !mobileMenu) {
        return;
    }
    mobileMenuButton.addEventListener('click', () => {
        toggleMobileMenu(mobileMenu, mobileMenuButton);
    });
    const menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu(mobileMenu, mobileMenuButton);
        });
    });
}

/**
 * モバイルメニューのトグル
 * @param {HTMLElement} menu - メニュー要素
 * @param {HTMLElement} button - メニューボタン要素
 */
function toggleMobileMenu(menu, button) {
    menu.classList.toggle('hidden');
    
    const isOpen = !menu.classList.contains('hidden');
    updateMenuButtonIcon(button, isOpen);
    updateMenuButtonAria(button, isOpen);
}

/**
 * モバイルメニューを閉じる
 * @param {HTMLElement} menu - メニュー要素
 * @param {HTMLElement} button - メニューボタン要素
 */
function closeMobileMenu(menu, button) {
    menu.classList.add('hidden');
    updateMenuButtonIcon(button, false);
    updateMenuButtonAria(button, false);
}

/**
 * メニューボタンのアイコンを更新
 * @param {HTMLElement} button - メニューボタン要素
 * @param {boolean} isOpen - メニューが開いているかどうか
 */
function updateMenuButtonIcon(button, isOpen) {
    const openIcon = '<svg class="w-6 h-6 text-[#fabe00] fill-none stroke-current" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
    const closeIcon = '<svg class="w-6 h-6 text-[#fabe00] fill-none stroke-current" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>';
    
    button.innerHTML = isOpen ? openIcon : closeIcon;
}

/**
 * メニューボタンのARIA属性を更新
 * @param {HTMLElement} button - メニューボタン要素
 * @param {boolean} isOpen - メニューが開いているかどうか
 */
function updateMenuButtonAria(button, isOpen) {
    button.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
    button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

