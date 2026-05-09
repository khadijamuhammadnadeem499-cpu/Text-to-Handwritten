/**
 * HandWrite Studio Pro — script.js
 * Full application logic: rendering, UI, controls, export
 */

// ============================================================
//  STATE
// ============================================================
const canvas = document.getElementById('mainCanvas');
const ctx    = canvas.getContext('2d');

const docState = {
    text:          "The Art of Handwriting\n\nIn a digital era, handwritten notes carry\nwarmth that no font can replicate.\n\nEach imperfect stroke tells a story.\n\n\"Crafted by hand, remembered by heart.\"",
    font:          'Caveat',
    fontSize:      32,
    bold:          false,
    italic:        false,
    underline:     false,
    align:         'center',
    color:         '#1a0a05',
    paperStyle:    'lined',
    showMargin:    true,
    letterSpacing: 0,
    lineHeight:    1.6,
    slant:         0,
    opacity:       1,
    backgroundColor: '#ffffff',
    effects:       { shadow: false, bleed: false, worn: false, highlight: false },
    pageWidth:     794,
    pageHeight:    1123,
    zoom:          1,
    createdAt:     new Date(),
    modifiedAt:    new Date()
};

// ============================================================
//  INIT
// ============================================================
function init() {
    buildFontGrid();
    document.getElementById('inputText').value = docState.text;
    renderCanvas();
    updateStats();
    updateDocMeta();
    setupTabs();
    setupKeyboardShortcuts();
    setupNavbar();
    setupScrollReveal();
    setupHeroSampleRotation();

    // Sync textarea live
    document.getElementById('inputText').addEventListener('input', (e) => {
        docState.text = e.target.value;
        renderCanvas();
        updateStats();
    });

    // Default active size btn
    document.querySelector('.size-btn').classList.add('active');
}

// ============================================================
//  NAVBAR
// ============================================================
function setupNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    // Scroll state
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    });

    // Hamburger toggle
    hamburger.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen);
        mobileMenu.setAttribute('aria-hidden', !isOpen);
    });
}

function closeMobileMenu() {
    document.getElementById('mobileMenu').classList.remove('open');
    document.getElementById('hamburger').classList.remove('open');
}

function scrollToStudio() {
    document.getElementById('studio').scrollIntoView({ behavior: 'smooth' });
}

// ============================================================
//  SCROLL REVEAL
// ============================================================
function setupScrollReveal() {
    const targets = document.querySelectorAll('.reveal-fade, .reveal-up, .reveal-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
}

// ============================================================
//  HERO SAMPLE ROTATION
// ============================================================
const sampleTexts = [
    "The art of handwriting is the art of showing one's character...",
    "Write it on your heart that every day is the best day of the year.",
    "A letter always seems to me like immortality.",
    "In the beginning was the Word, and it was written by hand.",
    "Your handwriting is a fingerprint of your soul."
];

function setupHeroSampleRotation() {
    const el = document.getElementById('heroSampleText');
    if (!el) return;
    let idx = 0;
    setInterval(() => {
        el.style.opacity = '0';
        setTimeout(() => {
            idx = (idx + 1) % sampleTexts.length;
            el.textContent = sampleTexts[idx];
            el.style.opacity = '1';
        }, 500);
    }, 4000);
    el.style.transition = 'opacity 0.5s ease';
}

// ============================================================
//  TAB SWITCHING
// ============================================================
function setupTabs() {
    document.querySelectorAll('.tab-pill').forEach(btn => {
        btn.addEventListener('click', function () {
            const tabId = this.dataset.tab;

            document.querySelectorAll('.tab-pill').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');

            document.querySelectorAll('.ribbon-panel').forEach(p => p.classList.remove('active'));
            const panel = document.querySelector(`.ribbon-panel[data-ribbon="${tabId}"]`);
            if (panel) panel.classList.add('active');
        });
    });
}

// ============================================================
//  KEYBOARD SHORTCUTS
// ============================================================
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b': e.preventDefault(); toggleBold();       break;
                case 'i': e.preventDefault(); toggleItalic();     break;
                case 'u': e.preventDefault(); toggleUnderline();  break;
                case 's': e.preventDefault(); exportAsPNG();       break;
                case 'p': e.preventDefault(); printDocument();    break;
                case '=':
                case '+': e.preventDefault(); zoomIn();           break;
                case '-': e.preventDefault(); zoomOut();          break;
                case '0': e.preventDefault(); zoomReset();        break;
            }
        }
        if (e.key === 'Escape') closeAllPanels();
    });
}

// ============================================================
//  RENDERING ENGINE
// ============================================================
function renderCanvas() {
    canvas.width  = docState.pageWidth;
    canvas.height = docState.pageHeight;

    // ── Background ──
    if (docState.effects.worn) {
        ctx.fillStyle = '#fdf0d5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Aged texture blotches
        for (let i = 0; i < 120; i++) {
            ctx.fillStyle = `rgba(140,100,50,${Math.random() * 0.035})`;
            ctx.fillRect(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 120 + 20,
                Math.random() * 70 + 10
            );
        }
        // Corner aging
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(160,110,50,0.12)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = docState.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // ── Paper Lines ──
    const lineSpacing = docState.fontSize * docState.lineHeight;

    if (docState.paperStyle === 'lined') {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(90,130,200,0.22)';
        ctx.lineWidth = 0.7;
        for (let y = 80; y < canvas.height - 50; y += lineSpacing) {
            ctx.moveTo(48, y);
            ctx.lineTo(canvas.width - 48, y);
            ctx.stroke();
        }
    } else if (docState.paperStyle === 'grid') {
        const gs = 28;
        ctx.strokeStyle = 'rgba(90,130,200,0.14)';
        ctx.lineWidth = 0.5;
        for (let x = 48; x < canvas.width - 48; x += gs) {
            ctx.beginPath(); ctx.moveTo(x, 38); ctx.lineTo(x, canvas.height - 38); ctx.stroke();
        }
        for (let y = 38; y < canvas.height - 38; y += gs) {
            ctx.beginPath(); ctx.moveTo(48, y); ctx.lineTo(canvas.width - 48, y); ctx.stroke();
        }
    }

    // ── Margin Line ──
    if (docState.showMargin && docState.paperStyle === 'lined') {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(200,80,60,0.35)';
        ctx.lineWidth = 1.2;
        ctx.moveTo(88, 38);
        ctx.lineTo(88, canvas.height - 38);
        ctx.stroke();
    }

    // ── Text ──
    drawHandwrittenText();

    // Update meta
    docState.modifiedAt = new Date();
    updateDocMeta();
}

function drawHandwrittenText() {
    if (!docState.text.trim()) return;

    const marginLeft  = 110;
    const marginRight = 58;
    const maxWidth    = canvas.width - marginLeft - marginRight;
    const lineHeight  = docState.fontSize * docState.lineHeight;

    // Build font string
    let fontStyle = '';
    if (docState.italic) fontStyle += 'italic ';
    if (docState.bold)   fontStyle += 'bold ';
    fontStyle += `${docState.fontSize}px '${docState.font}', cursive`;

    ctx.font       = fontStyle;
    ctx.fillStyle  = docState.color;
    ctx.globalAlpha = docState.opacity;

    // Shadow effect
    if (docState.effects.shadow) {
        ctx.shadowColor   = 'rgba(0,0,0,0.22)';
        ctx.shadowBlur    = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
    } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur  = 0;
    }

    const paragraphs = docState.text.split('\n');
    let y = 90 + docState.fontSize;

    for (const para of paragraphs) {
        if (!para.trim()) {
            y += lineHeight * 0.55;
            continue;
        }

        const words = para.split(' ');
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            const width    = ctx.measureText(testLine).width;

            if (width > maxWidth && currentLine) {
                drawLine(currentLine, marginLeft, maxWidth, y, lineHeight);
                currentLine = word;
                y += lineHeight;
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine) {
            drawLine(currentLine, marginLeft, maxWidth, y, lineHeight);
            y += lineHeight;
        }
    }

    ctx.globalAlpha = 1;
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur  = 0;
}

function drawLine(line, marginLeft, maxWidth, y, lineHeight) {
    const lineWidth = ctx.measureText(line).width;
    let x = marginLeft;

    if (docState.align === 'center') {
        x = marginLeft + (maxWidth - lineWidth) / 2;
    } else if (docState.align === 'right') {
        x = canvas.width - 58 - lineWidth;
    }

    ctx.save();

    // Slant
    if (docState.slant !== 0) {
        ctx.translate(x, y);
        ctx.rotate(docState.slant * Math.PI / 180);
        ctx.translate(-x, -y);
    }

    // Highlight
    if (docState.effects.highlight) {
        const prevFill = ctx.fillStyle;
        ctx.fillStyle = 'rgba(255,228,60,0.38)';
        ctx.fillRect(x - 4, y - docState.fontSize * 0.82, lineWidth + 8, docState.fontSize * 1.05);
        ctx.fillStyle = prevFill;
    }

    // Ink bleed
    if (docState.effects.bleed) {
        const prevFill = ctx.fillStyle;
        const r = parseInt(docState.color.slice(1,3), 16);
        const g = parseInt(docState.color.slice(3,5), 16);
        const b = parseInt(docState.color.slice(5,7), 16);
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = `rgba(${r},${g},${b},0.07)`;
            ctx.fillText(line,
                x + (Math.random() - 0.5) * 2.5,
                y + (Math.random() - 0.5) * 2.5
            );
        }
        ctx.fillStyle = prevFill;
    }

    // Main text — with or without letter spacing
    if (docState.letterSpacing !== 0) {
        let cx = x;
        for (const char of line) {
            ctx.fillText(char, cx, y);
            cx += ctx.measureText(char).width + docState.letterSpacing;
        }
    } else {
        ctx.fillText(line, x, y);
    }

    // Underline
    if (docState.underline) {
        ctx.beginPath();
        ctx.strokeStyle = docState.color;
        ctx.lineWidth   = Math.max(1, docState.fontSize * 0.04);
        ctx.moveTo(x, y + 5);
        ctx.lineTo(x + lineWidth, y + 5);
        ctx.stroke();
    }

    ctx.restore();
}

// ============================================================
//  FONT GRID
// ============================================================
function buildFontGrid() {
    const fonts = [
        'Caveat', 'Dancing Script', 'Indie Flower', 'Kalam',
        'Patrick Hand', 'Pacifico', 'Satisfy', 'Shadows Into Light'
    ];
    const container = document.getElementById('fontGrid');
    container.innerHTML = '';

    fonts.forEach(f => {
        const card = document.createElement('div');
        card.className = 'font-card' + (f === docState.font ? ' sel' : '');
        card.setAttribute('role', 'option');
        card.setAttribute('aria-selected', f === docState.font);
        card.setAttribute('aria-label', `Select ${f} font`);
        card.tabIndex = 0;
        card.innerHTML = `
            <span class="fc-sample" style="font-family:'${f}',cursive">Aa Zz</span>
            <span class="fc-name">${f}</span>
        `;
        card.addEventListener('click', () => changeHandFont(f));
        card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') changeHandFont(f); });
        container.appendChild(card);
    });
}

// ============================================================
//  FONT SHOWCASE (landing)
// ============================================================
function selectFontFromShowcase(fontName) {
    changeHandFont(fontName);
    // Scroll to studio
    document.getElementById('studio').scrollIntoView({ behavior: 'smooth' });
    // Highlight card
    document.querySelectorAll('.font-showcase-card').forEach(c => {
        c.classList.toggle('selected', c.dataset.font === fontName);
    });
}

// ============================================================
//  CONTROLS
// ============================================================

/** Convert text from textarea → canvas */
function convertText() {
    docState.text = document.getElementById('inputText').value;
    renderCanvas();
    updateStats();
    showToast('✓ Converted to handwriting!');
}

/** Change handwriting font */
function changeHandFont(font) {
    docState.font = font;
    const sel = document.getElementById('fontSelect');
    if (sel) sel.value = font;
    updateDisplay('currentFontDisplay', font);
    updateDisplay('statusFont', font);
    buildFontGrid();
    renderCanvas();
    showToast(`Font: ${font}`);
}

/** Bold */
function toggleBold() {
    docState.bold = !docState.bold;
    document.getElementById('btn-bold')?.classList.toggle('rib-btn-primary', docState.bold);
    renderCanvas();
    showToast(docState.bold ? 'Bold ON' : 'Bold OFF');
}

/** Italic */
function toggleItalic() {
    docState.italic = !docState.italic;
    document.getElementById('btn-italic')?.classList.toggle('rib-btn-primary', docState.italic);
    renderCanvas();
    showToast(docState.italic ? 'Italic ON' : 'Italic OFF');
}

/** Underline */
function toggleUnderline() {
    docState.underline = !docState.underline;
    document.getElementById('btn-underline')?.classList.toggle('rib-btn-primary', docState.underline);
    renderCanvas();
    showToast(docState.underline ? 'Underline ON' : 'Underline OFF');
}

/** Text alignment */
function setAlign(align) {
    docState.align = align;
    renderCanvas();
    showToast(`Align: ${align}`);
}

/** Font size */
function changeFontSize(delta) {
    docState.fontSize = Math.min(72, Math.max(10, docState.fontSize + delta));
    const sz = docState.fontSize + 'px';
    updateDisplay('sizeDisplay', docState.fontSize);
    updateDisplay('currentSizeDisplay', sz);
    updateDisplay('statusSize', sz);
    renderCanvas();
    showToast(`Size: ${sz}`);
}

/** Paper style */
function setPaperStyle(style) {
    docState.paperStyle = style;
    renderCanvas();
    showToast(`Paper: ${style}`);
}

/** Background color */
function setBackgroundColor(color) {
    docState.backgroundColor = color;
    renderCanvas();
    showToast('Background updated');
}

/** Margin line */
function toggleMargin() {
    docState.showMargin = !docState.showMargin;
    renderCanvas();
    showToast(docState.showMargin ? 'Margin line ON' : 'Margin line OFF');
}

/** Ink color */
function setInkColor(color, element) {
    docState.color = color;
    if (element) {
        document.querySelectorAll('.swatch').forEach(d => d.classList.remove('active'));
        element.classList.add('active');
    }
    renderCanvas();
    showToast('Ink color changed');
}

/** Letter spacing */
function updateLetterSpacing(val) {
    docState.letterSpacing = val;
    updateDisplay('lsVal', val + 'px');
    renderCanvas();
}

/** Line height */
function updateLineHeight(val) {
    docState.lineHeight = val;
    updateDisplay('lhVal', val.toFixed(2));
    renderCanvas();
}

/** Slant */
function updateSlant(val) {
    docState.slant = val;
    updateDisplay('tiltVal', val + '°');
    renderCanvas();
}

/** Opacity */
function updateOpacity(val) {
    docState.opacity = val / 100;
    updateDisplay('opVal', val + '%');
    renderCanvas();
}

/** Special effects — handles both ribbon buttons and panel buttons */
function toggleEffect(effect, element) {
    docState.effects[effect] = !docState.effects[effect];
    const isOn = docState.effects[effect];

    // Sync ribbon toggle
    const ribbonBtn = document.getElementById(`eff-${effect}`);
    if (ribbonBtn) ribbonBtn.classList.toggle('on', isOn);

    // Sync panel button
    const panelBtn = document.getElementById(`fx-${effect}`);
    if (panelBtn) panelBtn.classList.toggle('on', isOn);

    // If element is one of the two, sync the other
    if (element) element.classList.toggle('on', isOn);

    renderCanvas();
    showToast(`${effect} ${isOn ? 'ON' : 'OFF'}`);
}

/** Page size */
function setPageSize(width, height, btn) {
    docState.pageWidth  = width;
    docState.pageHeight = height;
    if (btn) {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    renderCanvas();
    showToast(`Page: ${width}×${height}`);
}

/** Orientation */
function setOrientation(orient) {
    const isPortrait  = docState.pageWidth < docState.pageHeight;
    const isLandscape = !isPortrait;
    if (orient === 'landscape' && isPortrait)  [docState.pageWidth, docState.pageHeight] = [docState.pageHeight, docState.pageWidth];
    if (orient === 'portrait' && isLandscape)  [docState.pageWidth, docState.pageHeight] = [docState.pageHeight, docState.pageWidth];
    renderCanvas();
    showToast(`Orientation: ${orient}`);
}

/** Zoom */
function zoomIn()    { docState.zoom = Math.min(2.5, docState.zoom + 0.1); applyZoom(); }
function zoomOut()   { docState.zoom = Math.max(0.3, docState.zoom - 0.1); applyZoom(); }
function zoomReset() { docState.zoom = 1; applyZoom(); }

function applyZoom() {
    const wrap = document.getElementById('canvasZoomWrap');
    if (wrap) {
        wrap.style.transform       = `scale(${docState.zoom})`;
        wrap.style.transformOrigin = 'top center';
    }
    updateDisplay('zoomDisplay', Math.round(docState.zoom * 100) + '%');
}

// ============================================================
//  INSERTS
// ============================================================
function insertText(text) {
    docState.text += text;
    document.getElementById('inputText').value = docState.text;
    renderCanvas();
    updateStats();
}

function insertHandTable() {
    insertText('\n\n┌─────────┬─────────┬─────────┐\n│  Cell 1 │  Cell 2 │  Cell 3 │\n├─────────┼─────────┼─────────┤\n│  Data A │  Data B │  Data C │\n└─────────┴─────────┴─────────┘\n');
    showToast('Table inserted');
}

function insertSimpleTable() {
    insertText('\n\n+---------+---------+\n|  Col 1  |  Col 2  |\n+---------+---------+\n|  Val A  |  Val B  |\n+---------+---------+\n');
    showToast('Simple table inserted');
}

function insertHorizontalLine() {
    insertText('\n' + '─'.repeat(50) + '\n');
    showToast('Line inserted');
}

function insertDate() {
    const d = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    insertText('\n' + d + '\n');
    showToast('Date inserted');
}

function insertTime() {
    insertText('  ' + new Date().toLocaleTimeString() + '  ');
    showToast('Time inserted');
}

function insertSymbol(sym) {
    insertText(' ' + sym + ' ');
    showToast(`Symbol "${sym}" inserted`);
}

// ============================================================
//  EDITING
// ============================================================
function findReplace() {
    const find = prompt('Find:');
    if (find === null || find === '') return;
    const replace = prompt('Replace with:', '');
    if (replace === null) return;
    const count = (docState.text.match(new RegExp(find, 'g')) || []).length;
    docState.text = docState.text.replaceAll(find, replace);
    document.getElementById('inputText').value = docState.text;
    renderCanvas();
    updateStats();
    showToast(`${count} replacement(s) made`);
}

function clearAllText() {
    if (!confirm('Clear all text? This cannot be undone.')) return;
    docState.text = '';
    document.getElementById('inputText').value = '';
    renderCanvas();
    updateStats();
    showToast('Text cleared');
}

function newDocument() {
    if (!confirm('Start a new document? Current content will be lost.')) return;
    docState.text = '';
    document.getElementById('inputText').value = '';
    renderCanvas();
    updateStats();
    showToast('New document created');
}

// ============================================================
//  CLIPBOARD
// ============================================================
function copyToClipboard() {
    navigator.clipboard.writeText(docState.text)
        .then(() => showToast('Text copied!'))
        .catch(() => showToast('Copy failed — use Ctrl+C'));
}

function cutToClipboard() {
    navigator.clipboard.writeText(docState.text)
        .then(() => {
            docState.text = '';
            document.getElementById('inputText').value = '';
            renderCanvas();
            updateStats();
            showToast('Text cut!');
        })
        .catch(() => showToast('Cut failed'));
}

function pasteFromClipboard() {
    navigator.clipboard.readText()
        .then(text => {
            docState.text += text;
            document.getElementById('inputText').value = docState.text;
            renderCanvas();
            updateStats();
            showToast('Text pasted!');
        })
        .catch(() => showToast('Paste failed — use Ctrl+V'));
}

function copyToClipboardImage() {
    canvas.toBlob(blob => {
        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
            .then(() => showToast('Image copied to clipboard!'))
            .catch(() => showToast('Copy failed — try PNG export'));
    });
}

// ============================================================
//  EXPORT
// ============================================================
function exportAsPNG() {
    const link       = document.createElement('a');
    link.download    = `handwrite-${Date.now()}.png`;
    link.href        = canvas.toDataURL('image/png');
    link.click();
    showToast('PNG exported!');
}

function exportAsJPG() {
    const link       = document.createElement('a');
    link.download    = `handwrite-${Date.now()}.jpg`;
    link.href        = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
    showToast('JPG exported!');
}

function exportAsTXT() {
    const blob       = new Blob([docState.text], { type: 'text/plain' });
    const url        = URL.createObjectURL(blob);
    const link       = document.createElement('a');
    link.href        = url;
    link.download    = `handwrite-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('TXT exported!');
}

function printDocument() {
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head>
        <title>HandWrite Studio — Print</title>
        <style>body{margin:0;padding:0;background:#f5f0e8;display:flex;justify-content:center;}
        img{max-width:100%;box-shadow:0 4px 20px rgba(0,0,0,0.15);}</style>
    </head><body>
        <img src="${canvas.toDataURL()}" onload="window.print(); setTimeout(()=>window.close(),1000)">
    </body></html>`);
    win.document.close();
    showToast('Print dialog opened');
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        showToast('Fullscreen activated');
    } else {
        document.exitFullscreen();
        showToast('Exited fullscreen');
    }
}

// ============================================================
//  MOBILE PANELS
// ============================================================
function toggleLeftPanel() {
    const panel   = document.getElementById('panelLeft');
    const overlay = document.getElementById('fabOverlay');
    const fab     = document.getElementById('fabLeft');
    const isOpen  = panel.classList.toggle('open');
    overlay.classList.toggle('active', isOpen);
    fab.setAttribute('aria-expanded', isOpen);
    if (isOpen) document.getElementById('panelRight').classList.remove('open');
}

function toggleRightPanel() {
    const panel   = document.getElementById('panelRight');
    const overlay = document.getElementById('fabOverlay');
    const fab     = document.getElementById('fabRight');
    const isOpen  = panel.classList.toggle('open');
    overlay.classList.toggle('active', isOpen);
    fab.setAttribute('aria-expanded', isOpen);
    if (isOpen) document.getElementById('panelLeft').classList.remove('open');
}

function closeAllPanels() {
    document.getElementById('panelLeft')?.classList.remove('open');
    document.getElementById('panelRight')?.classList.remove('open');
    document.getElementById('fabOverlay')?.classList.remove('active');
    document.getElementById('fabLeft')?.setAttribute('aria-expanded', 'false');
    document.getElementById('fabRight')?.setAttribute('aria-expanded', 'false');
}

// Close panels when screen grows to desktop
window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeAllPanels();
});

// ============================================================
//  STATS & META
// ============================================================
function updateStats() {
    const words = docState.text.trim().split(/\s+/).filter(w => w.length).length;
    const chars  = docState.text.length;
    const lines  = docState.text.split('\n').length;

    updateDisplay('wordCount', words);
    updateDisplay('charCount', chars);
    updateDisplay('lineCount', lines);
    updateDisplay('statusWords', words);
}

function updateDocMeta() {
    const fmt = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    updateDisplay('docCreated',      fmt(docState.createdAt));
    updateDisplay('docModified',     fmt(docState.modifiedAt));
    updateDisplay('currentFontDisplay', docState.font);
    updateDisplay('currentSizeDisplay', docState.fontSize + 'px');
    updateDisplay('statusFont',      docState.font);
    updateDisplay('statusSize',      docState.fontSize + 'px');
}

// ============================================================
//  TOAST NOTIFICATION
// ============================================================
let _toastTimer = null;

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

// ============================================================
//  UTILITY
// ============================================================
function updateDisplay(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

// ============================================================
//  LAUNCH
// ============================================================
document.addEventListener('DOMContentLoaded', init);
