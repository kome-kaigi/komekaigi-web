/**
 * KomeKaigi 2026 スピーカー表示
 * data/speakers.json を読み込み #speakers セクションに描画する。
 * データが無い・取得に失敗した場合はセクションとメニュー項目を非表示のままにする。
 */
(function () {
    'use strict';

    const DATA_URL = 'data/speakers.json';
    const PLACEHOLDER_IMAGE = 'assets/images/speakers/placeholder.svg';

    const section = document.getElementById('speakers');
    const list = section && section.querySelector('.speaker-list');
    const menuItem = document.querySelector('[data-speakers-menu]');

    if (!section || !list) {
        return;
    }

    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    };

    // BudouX の <budoux-ja> で包み、文節の途中で改行されないようにする。
    // BudouX が読み込めなかった場合も通常のテキストとして表示される。
    const phrase = (text) => el('budoux-ja', null, text);

    const createSpeaker = (speaker, session) => {
        const article = el('article', 'speaker');

        const photo = el('div', 'speaker-photo');
        const img = el('img');
        img.src = speaker.image || PLACEHOLDER_IMAGE;
        img.alt = speaker.name || '';
        img.width = 180;
        img.height = 180;
        img.loading = 'lazy';
        img.addEventListener('error', () => {
            img.src = PLACEHOLDER_IMAGE;
        }, { once: true });
        photo.appendChild(img);

        const body = el('div', 'speaker-body');

        const type = el('p', 'speaker-type');
        if (session.typeEn) type.appendChild(el('span', 'speaker-type-en', session.typeEn));
        if (session.type) type.appendChild(el('span', 'speaker-type-ja', session.type));
        body.appendChild(type);

        // nameSub(読み仮名やハンドルネーム)は氏名の横に小さく添え、折り返すときはまとめて次の行へ送る
        const name = el('h3', 'speaker-name');
        name.appendChild(el('span', 'speaker-name-main', speaker.name));
        if (speaker.nameSub) name.appendChild(el('span', 'speaker-name-sub', speaker.nameSub));
        body.appendChild(name);

        if (speaker.role) {
            const role = el('p', 'speaker-role');
            role.appendChild(phrase(speaker.role));
            body.appendChild(role);
        }

        // description は段落ごとの配列(文字列1つでも可)
        const paragraphs = [].concat(speaker.description || []).filter(Boolean);
        if (paragraphs.length > 0) {
            const profile = el('div', 'speaker-profile');
            paragraphs.forEach((text) => {
                const p = el('p');
                p.appendChild(phrase(text));
                profile.appendChild(p);
            });
            body.appendChild(profile);
        }

        article.append(photo, body);
        return article;
    };

    const render = (sessions) => {
        const items = sessions.flatMap((session) =>
            (session.speakers || []).map((speaker) => createSpeaker(speaker, session))
        );

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
        .then((data) => render(data.sessions || []))
        .catch((error) => {
            console.error('スピーカーデータの取得エラー:', error);
        });
})();
