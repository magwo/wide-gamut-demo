(() => {
    const TOAST_TEXT = 'Ej tillgängligt i prototypen';
    const INTERACTIVE =
        'a, button, input, select, textarea, label, summary, [role="button"], [role="link"], [role="tab"], [role="switch"], [role="checkbox"], [role="radio"], [role="menuitem"], [tabindex]:not([tabindex="-1"]), [onclick]';

    const state = {
        theme: 'dark',
        justNu: false,
        p3: false,
        p3Variant: 'keep-greys',
    };

    function render() {
        document.body.dataset.theme = state.theme;
        document.documentElement.style.colorScheme = state.theme;

        panel.querySelectorAll('[role="switch"]').forEach((button) => {
            button.setAttribute('aria-checked', String(state[button.dataset.protoSwitch]));
        });
        variantSelect.value = state.p3Variant;
        variantSelect.hidden = !state.justNu;

        if (!state.justNu && !colorsFrame.src) {
            colorsFrame.src = 'colors.html';
        }
        colorsFrame.hidden = state.justNu;
        document.documentElement.classList.toggle('proto-colors-active', !state.justNu);
        applyGamut();
    }

    const toast = document.createElement('div');
    toast.className = 'proto-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    let toastTimer;

    function showToast() {
        toast.textContent = TOAST_TEXT;
        toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1800);
    }

    function shake(target) {
        const el = (target instanceof Element && target.closest(INTERACTIVE)) || target;
        if (!(el instanceof Element)) {
            return;
        }
        el.classList.remove('proto-shake');
        void el.getBoundingClientRect();
        el.classList.add('proto-shake');
        el.addEventListener('animationend', () => el.classList.remove('proto-shake'), { once: true });
    }

    const SWITCHES = [
        { key: 'justNu', label: 'Just nu' },
        { key: 'p3', label: 'Display P3' },
    ];

    const panel = document.createElement('div');
    panel.className = 'proto-panel';
    panel.setAttribute('role', 'group');
    panel.setAttribute('aria-label', 'Prototypinställningar');
    for (const { key, label: text } of SWITCHES) {
        const label = document.createElement('label');
        label.id = `proto-switch-${key}-label`;
        label.htmlFor = `proto-switch-${key}`;
        label.setAttribute('aria-hidden', 'true');
        label.dataset.protoSwitch = key;
        label.textContent = text;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'proto-switch';
        button.id = `proto-switch-${key}`;
        button.setAttribute('role', 'switch');
        button.setAttribute('aria-labelledby', label.id);
        button.dataset.protoSwitch = key;
        const indicator = document.createElement('span');
        indicator.className = 'indicator';
        button.append(indicator);
        panel.append(label, button);
    }

    const P3_VARIANTS = [
        { value: 'max-all', label: 'Max all' },
        { value: 'keep-greys', label: 'Keep greys' },
        { value: 'scaled', label: 'Scaled' },
    ];

    const variantSelect = document.createElement('select');
    variantSelect.className = 'proto-select';
    variantSelect.setAttribute('aria-label', 'Display P3-variant');
    for (const { value, label } of P3_VARIANTS) {
        variantSelect.add(new Option(label, value));
    }
    variantSelect.addEventListener('change', () => {
        state.p3Variant = variantSelect.value;
        render();
    });

    const dock = document.createElement('div');
    dock.className = 'proto-dock';
    dock.append(variantSelect, panel);

    const colorsFrame = document.createElement('iframe');
    colorsFrame.className = 'proto-colors-frame';
    colorsFrame.title = 'Colors';
    colorsFrame.hidden = true;
    colorsFrame.addEventListener('load', applyGamut);

    function applyGamut() {
        document.documentElement.dataset.gamut = state.p3 ? 'p3' : 'srgb';
        document.documentElement.dataset.p3Variant = state.p3Variant;
        const colorsDocument = colorsFrame.contentDocument;
        if (colorsDocument) {
            colorsDocument.documentElement.dataset.gamut = state.p3 ? 'p3' : 'srgb';
        }
    }

    function toggleSwitch(event) {
        const toggle = event.target instanceof Element && event.target.closest('[data-proto-switch]');
        if (!toggle) {
            return;
        }
        event.preventDefault();
        const key = toggle.dataset.protoSwitch;
        state[key] = !state[key];
        if (key === 'justNu' && state.justNu) {
            state.p3 = false;
        }
        render();
    }

    function block(event) {
        if (event.target instanceof Element && event.target.closest('.proto-dock')) {
            if (event.type === 'click') {
                toggleSwitch(event);
            }
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        shake(event.target);
        showToast();
    }

    document.addEventListener('click', block, true);
    document.addEventListener('auxclick', block, true);
    document.addEventListener('submit', block, true);
    document.addEventListener('beforeinput', block, true);

    function init() {
        document.body.append(colorsFrame, dock, toast);
        render();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
