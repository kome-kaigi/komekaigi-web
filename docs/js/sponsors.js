/**
 * KomeKaigi 2026 スポンサー表示
 * data/sponsors.json を読み込み #sponsors セクションに描画する。
 * plans はプラン(ゴールド・個人など)ごとの配列で、JSON の並び順に表示する。
 * layout は "logo"(企業ロゴ) または "avatar"(個人アイコン+名前)。
 * スポンサーが1件も無い・取得に失敗した場合はセクションとメニュー項目を非表示のままにする。
 */
(function () {
    'use strict';

    const DATA_URL = 'data/sponsors.json';

    const section = document.getElementById('sponsors');
    const list = section && section.querySelector('.sponsor-plan-list');
    const menuItem = document.querySelector('[data-sponsors-menu]');

    if (!section || !list) {
        return;
    }

    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    };

    const createSponsor = (sponsor, layout, showName) => {
        // url が空ならリンクにしない
        const hasLink = typeof sponsor.url === 'string' && sponsor.url.trim() !== '';
        const item = hasLink ? el('a', 'sponsor') : el('div', 'sponsor');
        if (hasLink) {
            item.href = sponsor.url;
            item.target = '_blank';
            item.rel = 'noopener';
        }

        const media = el('div', 'sponsor-media');
        const img = el('img');
        if (sponsor.image) img.src = sponsor.image;
        img.alt = sponsor.name || '';
        img.loading = 'lazy';
        media.appendChild(img);
        item.appendChild(media);

        // 企業ロゴは画像内に社名が含まれるため、名前はアイコン表示のときだけ出す。
        // プランに showName: true を指定すると、ロゴ表示でも名前を添える。
        if (layout === 'avatar' || showName) {
            item.appendChild(el('span', 'sponsor-name', sponsor.name));
        }

        return item;
    };

    const createPlan = (plan) => {
        const sponsors = (plan.sponsors || []).filter((sponsor) => sponsor && sponsor.name);
        if (sponsors.length === 0) {
            return null;
        }

        const layout = plan.layout === 'logo' ? 'logo' : 'avatar';
        const className = ['sponsor-plan', `sponsor-plan-${layout}`];
        if (plan.id) className.push(`sponsor-plan-${plan.id}`);
        const block = el('div', className.join(' '));

        const heading = el('h3', 'sponsor-plan-heading');
        if (plan.typeEn) heading.appendChild(el('span', 'sponsor-plan-heading-en', plan.typeEn));
        if (plan.type) heading.appendChild(el('span', 'sponsor-plan-heading-ja', plan.type));
        block.appendChild(heading);

        const grid = el('div', 'sponsor-grid');
        sponsors.forEach((sponsor) => grid.appendChild(createSponsor(sponsor, layout, plan.showName === true)));
        block.appendChild(grid);

        return block;
    };

    const render = (plans) => {
        const blocks = plans.map(createPlan).filter(Boolean);

        if (blocks.length === 0) {
            return;
        }

        list.replaceChildren(...blocks);
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
        .then((data) => render(data.plans || []))
        .catch((error) => {
            console.error('スポンサーデータの取得エラー:', error);
        });
})();
