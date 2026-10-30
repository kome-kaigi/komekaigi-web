/**
 * KomeKaigi 2026 スタッフ表示
 * data/staff.json を読み込み #staff セクションに描画する。
 * スタッフが1件も無い・取得に失敗した場合はセクションとメニュー項目を非表示のままにする。
 */
(function () {
    'use strict';

    const DATA_URL = 'data/staff.json';

    const section = document.getElementById('staff');
    const list = section && section.querySelector('.staff-list');
    const menuItem = document.querySelector('[data-staff-menu]');

    if (!section || !list) {
        return;
    }

    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    };

    const createStaff = (staff) => {
        // url が空ならリンクにしない
        const hasLink = typeof staff.url === 'string' && staff.url.trim() !== '';
        const item = hasLink ? el('a', 'staff-person') : el('div', 'staff-person');
        if (hasLink) {
            item.href = staff.url;
            item.target = '_blank';
            item.rel = 'noopener';
        }

        const media = el('div', 'staff-media');
        const img = el('img');
        img.src = staff.image;
        img.alt = staff.name || '';
        img.loading = 'lazy';
        media.appendChild(img);
        item.appendChild(media);

        item.appendChild(el('span', 'staff-name', staff.name));

        return item;
    };

    const render = (staff) => {
        const items = staff.filter((person) => person && person.name).map(createStaff);

        if (items.length === 0) {
            return;
        }

        list.replaceChildren(...items);
        section.hidden = false;
        if (menuItem) menuItem.hidden = false;
    };

    fetch(DATA_URL)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => render(data.staff || []))
        .catch((error) => {
            console.error('スタッフデータの取得エラー:', error);
        });
})();
