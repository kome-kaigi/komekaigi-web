(function () {
    'use strict';

    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('site-menu');

    if (!toggle || !menu) {
        return;
    }

    const setOpen = (open) => {
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
        menu.setAttribute('aria-hidden', String(!open));
        document.body.style.overflow = open ? 'hidden' : '';
    };

    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

    toggle.addEventListener('click', () => {
        setOpen(!isOpen());
    });

    // Close on outside click
    document.addEventListener('click', (event) => {
        if (!isOpen()) return;
        const target = event.target;
        if (target instanceof Node && !menu.contains(target) && !toggle.contains(target)) {
            setOpen(false);
        }
    });

    // Close on Escape
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && isOpen()) {
            setOpen(false);
        }
    });

    // Close when a menu link is clicked (navigation)
    menu.addEventListener('click', (event) => {
        const target = event.target;
        if (target instanceof Element && target.closest('a')) {
            setOpen(false);
        }
    });
})();
