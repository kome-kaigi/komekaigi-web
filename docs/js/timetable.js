/**
 * KomeKaigi 2026 タイムテーブル表示
 * data/timetable.json (fortee の API レスポンスをそのまま保存したもの。`make timetable` で更新) を読み込み、
 * #timetable セクションに描画する。
 *
 * 広い画面では「時刻 × トラック」のグリッドに配置する。行は各セッションの開始・終了時刻の境界ごとに切り、
 * セッションは開始〜終了の境界までの行をまたぐ。先頭トラックのセッションで、同じ時間帯に他トラックの
 * セッションが無いもの(オープニング・休憩・LT など)は、空いているトラックの列まで横に広げる。
 * 狭い画面では CSS でグリッド配置を外し、開始時刻ごとのリストとして表示する。
 * データが無い・取得に失敗した場合はセクションとメニュー項目を非表示のままにする。
 */
(function () {
    'use strict';

    const DATA_URL = 'data/timetable.json';

    // トップページのスピーカー紹介へリンクする枠
    const SPEAKER_SLOT_TITLES = ['基調講演', '招待講演'];
    // 休憩系の枠は控えめに表示する
    const BREAK_SLOT_TITLES = ['受付', '休憩', '懇親会'];
    // この長さ以下のトークは LT として詰めて表示する
    const LT_MAX_MINUTES = 5;

    const section = document.getElementById('timetable');
    const grid = section && section.querySelector('.timetable-grid');
    const menuItem = document.querySelector('[data-timetable-menu]');

    if (!section || !grid) {
        return;
    }

    const el = (tag, className, text) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    };

    // BudouX の <budoux-ja> で包み、文節の途中で改行されないようにする。
    const phrase = (text) => el('budoux-ja', null, text);

    // 表示は会場(日本時間)の時刻に揃える
    const timeFormat = new Intl.DateTimeFormat('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Tokyo',
    });
    const formatTime = (ms) => timeFormat.format(new Date(ms));

    // "トラックA / ルームF" を トラック名 と 部屋名 に分ける
    const splitTrackName = (name) => {
        const [track, ...room] = String(name).split('/').map((s) => s.trim());
        return { track, room: room.join(' / ') };
    };

    const overlaps = (a, b) => a.start < b.end && b.start < a.end;

    const createTrackLabel = (track) => {
        const label = el('span', 'timetable-item-track');
        const { track: trackName, room } = splitTrackName(track.name);
        label.textContent = room ? `${trackName} · ${room}` : trackName;
        return label;
    };

    const createSpeaker = (speaker) => {
        const wrap = el('p', 'timetable-speaker');

        const avatar = el('span', 'timetable-speaker-avatar');
        if (speaker.avatar_url) {
            const img = el('img');
            img.src = speaker.avatar_url;
            img.alt = '';
            img.width = 32;
            img.height = 32;
            img.loading = 'lazy';
            avatar.appendChild(img);
        } else {
            avatar.textContent = (speaker.name || '?').trim().charAt(0);
        }
        avatar.setAttribute('aria-hidden', 'true');

        wrap.append(avatar, el('span', 'timetable-speaker-name', speaker.name));
        return wrap;
    };

    const createItem = (item, now) => {
        const isTalk = item.type === 'talk';
        const isLt = isTalk && item.length_min <= LT_MAX_MINUTES;
        const isBreak = !isTalk && BREAK_SLOT_TITLES.includes(item.title);
        const speakerLink = !isTalk && SPEAKER_SLOT_TITLES.includes(item.title) ? '#speakers' : null;
        const href = isTalk ? item.url : speakerLink;

        const classes = ['timetable-item', isTalk ? 'timetable-item-talk' : 'timetable-item-slot'];
        if (isLt) classes.push('timetable-item-lt');
        if (isBreak) classes.push('timetable-item-break');
        if (item.spanned) classes.push('timetable-item-wide');
        if (item.start <= now && now < item.end) classes.push('is-now');

        const node = el(href ? 'a' : 'div', classes.join(' '));
        if (href) {
            node.href = href;
            if (isTalk) {
                node.target = '_blank';
                node.rel = 'noopener';
            }
        }

        node.style.setProperty('--row-start', item.rowStart);
        node.style.setProperty('--row-end', item.rowEnd);
        node.style.setProperty('--col-start', item.colStart);
        node.style.setProperty('--col-end', item.colEnd);

        const meta = el('p', 'timetable-item-meta');
        const time = el('span', 'timetable-item-time');
        time.textContent = `${formatTime(item.start)} – ${formatTime(item.end)}`;
        meta.appendChild(time);
        if (isLt) meta.appendChild(el('span', 'timetable-item-badge', 'LT'));
        meta.appendChild(createTrackLabel(item.track));
        node.appendChild(meta);

        const title = el(isTalk ? 'h3' : 'p', 'timetable-item-title');
        title.appendChild(phrase(item.title));
        node.appendChild(title);

        if (isTalk && item.speaker) {
            node.appendChild(createSpeaker(item.speaker));
        }

        // タグは多いとカードが縦に伸びるので、最初の 1 件だけ表示する
        if (isTalk && !isLt && Array.isArray(item.tags) && item.tags.length > 0) {
            const tags = el('ul', 'timetable-item-tags');
            tags.appendChild(el('li', null, item.tags[0].name));
            node.appendChild(tags);
        }

        return node;
    };

    const render = (entries) => {
        const items = entries
            .filter((entry) => entry && entry.starts_at && entry.track)
            .map((entry) => {
                const start = Date.parse(entry.starts_at);
                return { ...entry, start, end: start + (entry.length_min || 0) * 60 * 1000 };
            })
            .filter((item) => !Number.isNaN(item.start))
            .sort((a, b) => a.start - b.start || a.track.sort - b.track.sort);

        if (items.length === 0) {
            return;
        }

        const tracks = [...new Map(items.map((item) => [item.track.sort, item.track])).values()]
            .sort((a, b) => a.sort - b.sort);
        const trackIndex = new Map(tracks.map((track, i) => [track.sort, i]));

        // 1 行目はトラック名のヘッダー、1 列目は時刻の列
        const boundaries = [...new Set(items.flatMap((item) => [item.start, item.end]))].sort((a, b) => a - b);
        const rowOf = (ms) => boundaries.indexOf(ms) + 2;

        items.forEach((item) => {
            const index = trackIndex.get(item.track.sort);
            let last = index;
            // 先頭トラックのセッションは、重なるセッションが無いトラックの列まで広げる
            if (index === 0) {
                while (
                    last + 1 < tracks.length &&
                    !items.some((other) => trackIndex.get(other.track.sort) === last + 1 && overlaps(item, other))
                ) {
                    last += 1;
                }
            }
            item.rowStart = rowOf(item.start);
            item.rowEnd = rowOf(item.end);
            item.colStart = index + 2;
            item.colEnd = last + 3;
            item.spanned = last > index;
        });

        const nodes = [];

        nodes.push(el('div', 'timetable-corner'));
        tracks.forEach((track, i) => {
            const head = el('div', 'timetable-track-head');
            head.style.setProperty('--col-start', i + 2);
            const { track: trackName, room } = splitTrackName(track.name);
            head.appendChild(el('span', 'timetable-track-name', trackName));
            if (room) head.appendChild(el('span', 'timetable-track-room', room));
            nodes.push(head);
        });

        // 狭い画面でも時系列に並ぶよう、開始時刻ごとに「時刻ラベル → セッション」の順で並べる
        const now = Date.now();
        const starts = [...new Set(items.map((item) => item.start))];
        starts.forEach((start) => {
            const label = el('p', 'timetable-time', formatTime(start));
            label.style.setProperty('--row-start', rowOf(start));
            nodes.push(label);
            items
                .filter((item) => item.start === start)
                .forEach((item) => nodes.push(createItem(item, now)));
        });

        grid.style.setProperty('--track-count', tracks.length);
        grid.replaceChildren(...nodes);
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
        .then((data) => render(data.timetable || []))
        .catch((error) => {
            console.error('タイムテーブルデータの取得エラー:', error);
        });
})();
