/* =========================================================
   BLOQUE MAESTRO · Editor visual (se carga dentro del panel)
   Marca cada texto del contenido con un identificador invisible,
   lo convierte en editable al pintarse en la página y envía cada
   cambio al panel (/admin) con postMessage.
   ========================================================= */
(function () {
  /* Solo dentro del panel de la misma web */
  try { if (window.top === window || !/\/admin\//.test(window.parent.location.pathname)) return; } catch (e) { return; }
  const C = window.BM_CONTENT; if (!C) return;

  /* Marcadores en el área de uso privado de Unicode: S id S2 valor E id E2 */
  const S = '', S2 = '', E = '', E2 = '';
  const num = n => String(n).replace(/\d/g, d => String.fromCharCode(0xE010 + +d));
  const unnum = s => +s.replace(/[-]/g, c => c.charCodeAt(0) - 0xE010);
  const MARK = /([-]+)([\s\S]*?)\1/g, ANY = /[-]/g;
  const strip = s => s.replace(new RegExp(MARK.source, 'g'), '$2').replace(ANY, '');   // regex propia: no toca MARK.lastIndex

  /* Qué textos son "copy" editable (no ids, iconos, colores, imágenes, enlaces, cifras…) */
  const SKIP_KEYS = new Set(['id', 'cat', 'status', 'pub', 'img', 'icon', 'color', 'initials', 'adImg', 'bandPhoto', 'heroProjects', 'bento', 'month', 'sample',
    'instagram', 'linkedin', 'youtube', 'x', 'email', 'emailProyectos', 'emailPrensa', 'phone', 'whatsapp', 'searchTags']);
  const ids = new Set([...C.projects.map(p => p.id), ...C.cats.map(c => c.id)]);
  const isCopy = v => v.trim().length >= 3 && !ids.has(v) && !/^(fa-|#[0-9a-f]{3,8}$|photo-|https?:|data:|assets\/|mailto:)/i.test(v) && !/\.html/.test(v) && !/^[\d.,\s%+]*$/.test(v);

  const paths = [], values = [], html = [];
  (function walk(o, path) {
    for (const k of Object.keys(o)) {
      if (typeof k === 'string' && SKIP_KEYS.has(k)) continue;
      const v = o[k], p = [...path, Array.isArray(o) ? +k : k];
      if (typeof v === 'string') {
        if (!isCopy(v)) continue;
        const id = paths.length; paths.push(p); values.push(v); html.push(/<[a-z]/i.test(v));
        o[k] = S + num(id) + S2 + v + E + num(id) + E2;
      } else if (v && typeof v === 'object') walk(v, p);
    }
  })(C, []);

  /* HTML con marcadores → textos envueltos en <bm-e data-bm="id"> (en atributos solo se limpian) */
  function transform(str) {
    if (typeof str !== 'string' || !/[-]/.test(str)) return str;
    let out = '', last = 0, inTag = false, quote = null, m;
    const scan = (from, to) => {
      for (let i = from; i < to; i++) {
        const c = str[i];
        if (!inTag) { if (c === '<' && /[a-z\/!]/i.test(str[i + 1] || '')) inTag = true; }
        else if (quote) { if (c === quote) quote = null; }
        else if (c === '"' || c === "'") quote = c;
        else if (c === '>') inTag = false;
      }
    };
    MARK.lastIndex = 0;
    while ((m = MARK.exec(str))) {
      scan(last, m.index);
      const id = unnum(m[1]);
      out += str.slice(last, m.index) + (inTag ? strip(m[2]) : `<bm-e data-bm="${id}">${values[id]}</bm-e>`);
      scan(m.index, MARK.lastIndex); last = MARK.lastIndex;
    }
    return (out + str.slice(last)).replace(ANY, '');
  }

  /* Intercepta cómo pintan las páginas */
  const ih = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  Object.defineProperty(Element.prototype, 'innerHTML', { get: ih.get, set(v) { ih.set.call(this, transform(v)); }, configurable: true });
  const iah = Element.prototype.insertAdjacentHTML;
  Element.prototype.insertAdjacentHTML = function (pos, v) { return iah.call(this, pos, transform(v)); };
  const tc = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
  Object.defineProperty(Node.prototype, 'textContent', { get: tc.get, set(v) {
    if (typeof v === 'string' && /[-]/.test(v)) {
      MARK.lastIndex = 0; const m = MARK.exec(v);
      if (m && m[0] === v && this.nodeType === 1) { const id = unnum(m[1]); this.setAttribute('data-bm', id); v = html[id] ? strip(values[id]).replace(/<[^>]+>/g, '') : values[id]; }
      else v = strip(v);
    }
    tc.set.call(this, v);
  }, configurable: true });
  const dt = Object.getOwnPropertyDescriptor(Document.prototype, 'title');
  Object.defineProperty(document, 'title', { get: () => dt.get.call(document), set: v => dt.set.call(document, strip(String(v))), configurable: true });

  /* Estilos del modo edición */
  const css = document.createElement('style');
  css.textContent = `[data-bm]{cursor:text;outline:1px dashed transparent;outline-offset:3px;border-radius:3px;transition:outline-color .15s,background .15s}
    [data-bm]:hover{outline:2px dashed #10A8E8}
    [data-bm][contenteditable=true]{outline:2px solid #10A8E8;background:rgba(16,168,232,.14);box-shadow:0 0 0 5px rgba(255,255,255,.35);cursor:text}
    bm-e{display:inline}`;
  document.head.appendChild(css);

  /* Edición en el sitio */
  const valueOf = (el, id) => html[id]
    ? el.innerHTML.replace(/&nbsp;/g, ' ').replace(/<br\s*\/?>/g, '').replace(/\s+data-bm="\d+"/g, '').trim()
    : el.innerText.replace(/\s*\n+\s*/g, ' ').trim();
  document.addEventListener('mousedown', e => {
    const el = e.target.closest('[data-bm]');
    if (el && el.contentEditable !== 'true') { el.contentEditable = 'true'; el.spellcheck = true; }
  }, true);
  document.addEventListener('click', e => {
    if (e.target.closest('[data-bm]')) { e.preventDefault(); e.stopPropagation(); return; }
    /* Navegar entre páginas sin salir del modo edición */
    const a = e.target.closest('a[href]');
    if (a && /\.html/.test(a.getAttribute('href')) && !/^(https?:|mailto:|tel:)/.test(a.getAttribute('href'))) {
      e.preventDefault(); const u = new URL(a.href); u.searchParams.set('edit', '1'); location.href = u;
    }
  }, true);
  document.addEventListener('submit', e => e.preventDefault(), true);
  document.addEventListener('input', e => {
    const el = e.target.closest && e.target.closest('[data-bm]'); if (!el) return;
    const id = +el.dataset.bm, v = valueOf(el, id);
    values[id] = v;
    document.querySelectorAll(`[data-bm="${id}"]`).forEach(x => { if (x !== el) { if (html[id]) x.innerHTML = v; else tc.set.call(x, v); } });
    parent.postMessage({ type: 'bm-edit', path: paths[id], value: v }, location.origin);
  }, true);
  document.addEventListener('keydown', e => {
    const el = e.target.closest && e.target.closest('[data-bm]');
    if (el && (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey))) { e.preventDefault(); el.blur(); }
  }, true);
  document.addEventListener('focusout', e => { const el = e.target.closest && e.target.closest('[data-bm]'); if (el) el.contentEditable = 'false'; }, true);
  /* Pegar siempre como texto plano */
  document.addEventListener('paste', e => {
    if (!e.target.closest || !e.target.closest('[data-bm]')) return;
    e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain').replace(/\s*\n+\s*/g, ' '));
  }, true);
  addEventListener('load', () => parent.postMessage({ type: 'bm-page', page: location.pathname.split('/').pop() + location.search.replace(/[?&]edit=1/, '').replace(/^&/, '?') }, location.origin));
})();
