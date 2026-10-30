/* =========================================================
   BLOQUE MAESTRO · Panel de administración
   Edita assets/content.js y sube imágenes a assets/uploads/
   haciendo commits en GitHub con la API (no hay servidor propio).
   El token de GitHub se guarda cifrado (AES-GCM + PBKDF2) en
   admin/config.json: solo se descifra con usuario y contraseña.
   ========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const clone = o => JSON.parse(JSON.stringify(o));
  const API = 'https://api.github.com';
  const HEADER = `/* =========================================================
   BLOQUE MAESTRO · Contenido editable de la web
   Este archivo lo genera el panel /admin: no lo edites a mano
   salvo que sepas lo que haces (debe seguir siendo JSON válido).
   ========================================================= */
window.BM_CONTENT = `;

  let CFG, TOKEN, STATE, ORIG, SHA;
  const UPLOADS = {};            // ruta → { b64, url, done }

  /* ---------- Utilidades DOM ---------- */
  function h(tag, attrs = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else if (k in el && k !== 'list' && k !== 'style') el[k] = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c));
    return el;
  }
  const ic = n => h('i', { className: n.includes(' ') ? n : `fa-solid ${n}` });
  let toastT;
  function toast(msg, bad) {
    const t = $('#toast'); t.textContent = msg; t.className = `toast on ${bad ? 'bad' : ''}`;
    clearTimeout(toastT); toastT = setTimeout(() => t.className = 'toast', bad ? 6000 : 3500);
  }
  const slug = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'item';

  /* ---------- Base64 y cifrado ---------- */
  const enc = new TextEncoder(), dec = new TextDecoder();
  const bytesToB64 = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); };
  const b64ToBytes = s => Uint8Array.from(atob(s.replace(/\s/g, '')), c => c.charCodeAt(0));
  const utf8ToB64 = s => bytesToB64(enc.encode(s));
  const b64ToUtf8 = s => dec.decode(b64ToBytes(s));
  async function keyFrom(pass, salt) {
    const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function seal(secret, pass) {
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await keyFrom(pass, salt), enc.encode(secret));
    return { salt: bytesToB64(salt), iv: bytesToB64(iv), data: bytesToB64(new Uint8Array(data)) };
  }
  async function unseal(u, pass) {
    const data = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64ToBytes(u.iv) }, await keyFrom(pass, b64ToBytes(u.salt)), b64ToBytes(u.data));
    return dec.decode(data);
  }

  /* ---------- GitHub ---------- */
  async function gh(path, opts = {}, token = TOKEN) {
    const r = await fetch(API + path, { ...opts, cache: 'no-store', headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', ...(opts.body ? { 'Content-Type': 'application/json' } : {}) } });
    if (!r.ok) {
      const e = new Error((await r.json().catch(() => ({}))).message || r.statusText); e.status = r.status;
      if (r.status === 401) e.message = 'El token de GitHub no es válido o ha caducado. Vuelve a configurar el acceso.';
      if (r.status === 403 || r.status === 404) e.message = 'El token no tiene permiso de escritura sobre el repositorio (Contents: Read and write).';
      throw e;
    }
    return r.status === 204 ? null : r.json();
  }
  const repo = () => `/repos/${CFG.repo}`;
  const readFile = async (path, token) => gh(`${repo()}/contents/${path}?ref=${CFG.branch}`, {}, token);
  /* Un solo commit con varios archivos (contenido + imágenes) */
  async function commitFiles(files, message, token = TOKEN) {
    const ref = await gh(`${repo()}/git/ref/heads/${CFG.branch}`, {}, token);
    const base = await gh(`${repo()}/git/commits/${ref.object.sha}`, {}, token);
    const tree = [];
    for (const f of files) {
      const blob = await gh(`${repo()}/git/blobs`, { method: 'POST', body: JSON.stringify({ content: f.b64, encoding: 'base64' }) }, token);
      tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    const t = await gh(`${repo()}/git/trees`, { method: 'POST', body: JSON.stringify({ base_tree: base.tree.sha, tree }) }, token);
    const c = await gh(`${repo()}/git/commits`, { method: 'POST', body: JSON.stringify({ message, tree: t.sha, parents: [ref.object.sha] }) }, token);
    await gh(`${repo()}/git/refs/heads/${CFG.branch}`, { method: 'PATCH', body: JSON.stringify({ sha: c.sha }) }, token);
  }

  /* ---------- Contenido ---------- */
  const parseContent = txt => JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
  const serialize = () => `${HEADER}${JSON.stringify(STATE, null, 1)};\n`;
  /* Modo demo (?demo): enseña el panel con el contenido local, sin GitHub y sin poder publicar */
  const DEMO = /[?&]demo/.test(location.search);
  async function loadContent() {
    if (DEMO) { STATE = parseContent(await (await fetch(`../assets/content.js?t=${Date.now()}`)).text()); ORIG = clone(STATE); return; }
    const f = await readFile('assets/content.js');
    SHA = f.sha; STATE = parseContent(b64ToUtf8(f.content)); ORIG = clone(STATE);
  }
  const isDirty = () => JSON.stringify(STATE) !== JSON.stringify(ORIG);
  function dirty() {
    const d = isDirty();
    $('#publish').disabled = !d; $('#discard').hidden = !d; $('#pending').hidden = !d;
    $('#pending').textContent = 'Cambios sin publicar';
    $('#pvpending').hidden = !d || !pvEdit; $('#pvpub').disabled = !d;
  }
  addEventListener('beforeunload', e => { if (STATE && isDirty()) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- Imágenes ---------- */
  const imgUrl = (v, w = 400, hh = 300) => !v ? '' : UPLOADS[v] ? UPLOADS[v].url : /^photo-/.test(v)
    ? `https://images.unsplash.com/${v}?w=${w}&h=${hh}&fit=crop&auto=format&q=60` : /^(https?:|data:)/.test(v) ? v : `../${v}`;
  const toBlob = (c, type, q) => new Promise(r => c.toBlob(r, type, q));
  const readURL = blob => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
  /* Reduce a 2000 px como máximo y convierte a WebP (o JPG) antes de subir */
  async function processImage(file) {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const c = Object.assign(document.createElement('canvas'), { width: Math.round(bmp.width * k), height: Math.round(bmp.height * k) });
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    let blob = await toBlob(c, 'image/webp', .82), ext = 'webp';
    if (!blob || blob.type !== 'image/webp') { blob = await toBlob(c, 'image/jpeg', .85); ext = 'jpg'; }
    const url = await readURL(blob);
    const path = `assets/uploads/${slug(file.name.replace(/\.[^.]+$/, ''))}-${Date.now().toString(36)}.${ext}`;
    UPLOADS[path] = { b64: url.split(',')[1], url };
    return path;
  }
  function pickFiles(multiple) {
    return new Promise(res => {
      const inp = h('input', { type: 'file', accept: 'image/*', multiple });
      inp.onchange = async () => {
        if (!inp.files.length) return res([]);
        toast('Preparando imagen…');
        try { res(await Promise.all([...inp.files].map(processImage))); }
        catch { toast('No se pudo leer la imagen. Prueba con un JPG o PNG.', true); res([]); }
      };
      inp.click();
    });
  }
  const askUrl = () => { const u = prompt('Pega la dirección (URL) de la imagen:'); return u && /^https?:\/\//.test(u.trim()) ? u.trim() : null; };
  const thumb = v => h('div', { className: 'thumb', style: `background-image:url("${imgUrl(v)}")` }, UPLOADS[v] && !UPLOADS[v].done ? h('span', { className: 'new' }, 'Nueva') : null);

  /* ---------- Campos ---------- */
  const projOpts = () => STATE.projects.map(p => [p.id, `${p.short}${p.hidden ? ' (oculto)' : ''}`]);
  const catOpts = () => STATE.cats.map(c => [c.id, c.name]);
  const STATUS = [['obra', 'En obra'], ['fin', 'Finalizado'], ['dis', 'En diseño']];

  /* Pinta un campo enlazado a obj[d.k]. Tipos: text, textarea, html, number, date, color, url, check,
     select, project, icon, image, gallery, strings, list, group, cats */
  function field(d, obj, rerender) {
    const set = v => { obj[d.k] = v; d.change && d.change(v, obj); dirty(); };
    const v = obj[d.k];
    const lab = (...kids) => h('label', { className: `fld ${d.full ? 'full' : ''} ${d.wide ? 'wide' : ''}` }, d.label, ...kids, d.help ? h('span', { className: 'help', html: d.help }) : null);
    switch (d.type || 'text') {
      case 'textarea': case 'html':
        return lab(h('textarea', { rows: d.rows || 3, value: v ?? '', oninput: e => set(e.target.value) }));
      case 'number':
        return lab(h('input', { type: 'number', value: v ?? '', min: d.min, max: d.max, oninput: e => set(e.target.value === '' ? 0 : +e.target.value) }));
      case 'date': return lab(h('input', { type: 'date', value: v ?? '', oninput: e => set(e.target.value) }));
      case 'url': return lab(h('input', { type: 'url', value: v ?? '', placeholder: 'https://…', oninput: e => set(e.target.value || '#') }));
      case 'color': return lab(h('div', { className: 'ico-in' }, h('input', { type: 'color', value: v || '#10a8e8', oninput: e => set(e.target.value) })));
      case 'check': return h('label', { className: `check-row ${d.full ? 'full' : ''}` }, h('input', { type: 'checkbox', checked: d.invert ? !v : !!v, onchange: e => set(d.invert ? !e.target.checked : e.target.checked) }), d.label);
      case 'select': case 'project': {
        const opts = d.type === 'project' ? projOpts() : typeof d.opts === 'function' ? d.opts() : d.opts;
        return lab(h('select', { onchange: e => set(e.target.value) }, ...opts.map(([val, t]) => h('option', { value: val, selected: val === v }, t))));
      }
      case 'icon': {
        const i = ic(v || 'fa-circle');
        return lab(h('div', { className: 'ico-in' }, i, h('input', { value: v ?? '', placeholder: 'fa-house', oninput: e => { set(e.target.value.trim()); i.className = `fa-solid ${e.target.value.trim()}`; } })));
      }
      case 'image': {
        const box = h('div', { className: 'img-f' });
        const draw = () => box.replaceChildren(thumb(obj[d.k]), h('div', { className: 'acts' },
          h('button', { type: 'button', className: 'btn-sec btn-sm', onclick: async () => { const [p] = await pickFiles(false); if (p) { set(p); draw(); } } }, ic('fa-upload'), 'Subir imagen'),
          h('button', { type: 'button', className: 'btn-sec btn-sm', onclick: () => { const u = askUrl(); if (u) { set(u); draw(); } } }, ic('fa-link'), 'Usar URL')));
        draw();
        return h('div', { className: `fld ${d.full ? 'full' : ''} ${d.wide ? 'wide' : ''}` }, h('label', {}, d.label), box, d.help ? h('span', { className: 'help muted small', html: d.help }) : null);
      }
      case 'gallery': {
        const box = h('div', { className: 'gal' });
        const arr = obj[d.k];
        const draw = () => box.replaceChildren(...arr.map((src, i) => h('div', { className: 'gi' }, thumb(src),
          h('div', { className: 'bar' }, h('span', {}, i ? '' : 'Portada'), h('div', {},
            h('button', { type: 'button', className: 'icon', title: 'Mover a la izquierda', disabled: !i, onclick: () => { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; dirty(); draw(); } }, ic('fa-arrow-left')),
            h('button', { type: 'button', className: 'icon', title: 'Mover a la derecha', disabled: i === arr.length - 1, onclick: () => { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; dirty(); draw(); } }, ic('fa-arrow-right')),
            h('button', { type: 'button', className: 'icon', title: 'Cambiar', onclick: async () => { const [p] = await pickFiles(false); if (p) { arr[i] = p; dirty(); draw(); } } }, ic('fa-pen')),
            h('button', { type: 'button', className: 'icon', title: 'Quitar', onclick: () => { if (arr.length > 1 || confirm('¿Quitar la única imagen?')) { arr.splice(i, 1); dirty(); draw(); } } }, ic('fa-trash')))))),
          h('div', { className: 'gi add-tile', onclick: async () => { const ps = await pickFiles(true); if (ps.length) { arr.push(...ps); dirty(); draw(); } } }, h('div', {}, ic('fa-images'), 'Añadir imágenes')),
          h('div', { className: 'gi add-tile', onclick: () => { const u = askUrl(); if (u) { arr.push(u); dirty(); draw(); } } }, h('div', {}, ic('fa-link'), 'Añadir desde URL')));
        draw();
        return h('div', { className: 'fld full' }, d.label ? h('label', {}, d.label) : null, d.help ? h('span', { className: 'help muted small', html: d.help }) : null, box);
      }
      case 'cats': {
        const arr = obj[d.k];
        return h('div', { className: `fld ${d.full ? 'full' : ''} wide` }, h('label', {}, d.label), h('div', { className: 'chips' }, ...STATE.cats.map(c => h('label', {},
          h('input', { type: 'checkbox', checked: arr.includes(c.id), onchange: e => { const i = arr.indexOf(c.id); if (e.target.checked && i < 0) arr.push(c.id); if (!e.target.checked && i >= 0) arr.splice(i, 1); dirty(); } }), c.name))));
      }
      case 'group':
        return h('div', { className: `fld ${d.full !== false ? 'full' : ''}` }, d.label ? h('label', { style: 'margin-bottom:6px' }, d.label) : null,
          h('div', { className: 'fields' }, ...d.fields.map(f => field(f, obj[d.k], rerender))));
      case 'strings': case 'list': {
        const arr = obj[d.k], wrap = h('div', { className: 'list' });
        const strings = d.type === 'strings';
        const fields = strings ? [{ k: 0, ...(d.item || {}) }] : d.fields;
        const draw = () => wrap.replaceChildren(...arr.map((item, i) => {
          const holder = strings ? { 0: item } : item;
          const fs = fields.map(f => {
            const el = field(strings ? { ...f, label: '', change: val => { arr[i] = val; } } : f, holder, draw);
            return el;
          });
          return h('div', { className: 'li' }, h('span', { className: 'li-n' }, i + 1),
            h('div', { className: 'li-f', style: `--cols:${strings ? 1 : d.cols || fields.length}` }, ...fs),
            h('div', { className: 'li-a' },
              h('button', { type: 'button', className: 'icon', title: 'Subir', disabled: !i, onclick: () => { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; dirty(); draw(); } }, ic('fa-chevron-up')),
              h('button', { type: 'button', className: 'icon', title: 'Bajar', disabled: i === arr.length - 1, onclick: () => { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; dirty(); draw(); } }, ic('fa-chevron-down')),
              d.fixed ? null : h('button', { type: 'button', className: 'icon', title: 'Eliminar', onclick: () => { arr.splice(i, 1); dirty(); draw(); } }, ic('fa-trash'))));
        }));
        draw();
        return h('div', { className: 'fld full' }, d.label ? h('label', {}, d.label) : null, d.help ? h('span', { className: 'help muted small', html: d.help }) : null, wrap,
          d.fixed || (d.max && arr.length >= d.max) ? null : h('button', { type: 'button', className: 'btn-sec btn-sm add', onclick: () => { arr.push(strings && d.make == null ? '' : typeof d.make === 'function' ? d.make() : clone(d.make)); dirty(); draw(); } }, ic('fa-plus'), d.addLabel || 'Añadir'));
      }
      default:
        return lab(h('input', { value: v ?? '', readOnly: !!d.readonly, oninput: d.nolive ? null : e => set(e.target.value) }));
    }
  }
  const card = (title, hint, fields, obj) => h('section', { className: 'card' }, h('h3', {}, title), h('p', { className: 'hint', html: hint || '' }),
    h('div', { className: 'fields' }, ...fields.map(f => field(f, obj))));

  /* ---------- Esquemas de páginas ---------- */
  const HTML_HELP = 'Escribe <code>&lt;em&gt;texto&lt;/em&gt;</code> para resaltar palabras en color.';
  const ICON_HELP = 'Nombre de icono de <a href="https://fontawesome.com/search?o=r&m=free&s=solid" target="_blank" rel="noopener">Font Awesome</a>, p. ej. <code>fa-house</code>.';
  const T = (k, label, extra = {}) => ({ k, label, ...extra });
  const PAGES = {
    global: {
      name: 'General y contacto', icon: 'fa-sliders', page: 'index.html',
      cards: [
        ['Cabecera y pie de página', 'Aparecen en todas las páginas.', [
          T('headerCta', 'Botón de la cabecera'), T('newsletterText', 'Texto del newsletter'),
          T('tagline', 'Descripción bajo el logo (pie)', { type: 'textarea', full: true }),
          T('footerCtaTitle', 'Título del bloque final', { type: 'html', rows: 2, help: HTML_HELP }),
          T('footerCtaText', 'Texto del bloque final', { type: 'textarea', rows: 2 }),
          T('stats', 'Cifras del pie', { type: 'list', fields: [T(0, 'Cifra'), T(1, 'Texto')], make: ['', ''], addLabel: 'Añadir cifra' }),
          T('copyright', 'Texto legal (abajo del todo)', { full: true }),
          T('searchTags', 'Sugerencias del buscador', { type: 'strings', addLabel: 'Añadir sugerencia' }),
        ]],
        ['Datos de contacto', 'Se usan en la página de contacto y en el pie.', [
          T('email', 'Email general'), T('emailProyectos', 'Email de proyectos'), T('emailPrensa', 'Email de prensa'),
          T('phone', 'Teléfono'), T('whatsapp', 'WhatsApp'), T('hours', 'Horario'), T('address', 'Dirección', { full: true }),
        ]],
        ['Redes sociales', 'Deja <code>#</code> si todavía no hay perfil.', [
          T('instagram', 'Instagram', { type: 'url' }), T('linkedin', 'LinkedIn', { type: 'url' }), T('youtube', 'YouTube', { type: 'url' }), T('x', 'X (Twitter)', { type: 'url' }),
        ]],
        ['Imágenes de fondo', '', [T('bandPhoto', 'Fondo del testimonio (Para promotores)', { type: 'image', full: true })]],
      ],
    },
    home: {
      name: 'Inicio', icon: 'fa-house', page: 'index.html',
      cards: [
        ['Portada', 'La galería grande del principio de la web.', [
          T('heroProjects', 'Proyectos de la galería (en orden)', { type: 'strings', item: { type: 'project' }, make: () => STATE.projects[0].id, addLabel: 'Añadir proyecto' }),
          T('kick', 'Antetítulo'), T('titleA', 'Título (antes de la palabra que cambia)'),
          T('words', 'Palabras que van cambiando', { type: 'strings', addLabel: 'Añadir palabra' }),
          T('titleB', 'Título (segunda línea)', { full: true }),
          T('lead', 'Texto de la portada', { type: 'textarea', full: true }),
          T('stats', 'Cifras', { type: 'list', fields: [T(0, 'Número'), T(1, 'Sufijo (+, K, %)'), T(2, 'Texto')], make: ['', '', ''], addLabel: 'Añadir cifra' }),
        ]],
        ['Franja de logos', 'Las empresas que aparecen desfilando bajo la portada.', [
          T('trustTitle', 'Título', { full: true }),
          T('logos', 'Empresas', { type: 'list', fields: [T(0, 'Icono', { type: 'icon' }), T(1, 'Nombre'), T(2, 'Etiqueta pequeña')], make: ['fa-building', '', ''], help: ICON_HELP, addLabel: 'Añadir empresa' }),
        ]],
        ['Qué es Bloque Maestro', '', [
          T('whatKick', 'Antetítulo'), T('whatTitle', 'Título', { type: 'html', rows: 2, help: HTML_HELP }),
          T('whatText', 'Texto', { type: 'textarea', full: true }),
          T('aud', 'Tarjetas por público', { type: 'list', cols: 2, fields: [T(0, 'Título'), T(1, 'Icono', { type: 'icon' }), T(2, 'Color', { type: 'color' }), T(6, 'Texto del enlace'), T(4, 'Descripción', { type: 'textarea', rows: 2, wide: true }), T(5, 'Enlace (página)', { wide: true }), T(3, 'Imagen', { type: 'image', wide: true })], make: ['', 'fa-user', '#10A8E8', '', '', 'proyectos.html', 'Ver más'], addLabel: 'Añadir tarjeta' }),
        ]],
        ['Proyectos en portada', 'El mosaico de 5 proyectos y la cifra destacada.', [
          T('featuredTitle', 'Título de la sección', { full: true }),
          T('bento', 'Proyectos del mosaico (el 1.º es el grande)', { type: 'strings', fixed: true, item: { type: 'project' } }),
          T('bentoStat', 'Cifra destacada', { type: 'group', fields: [T(0, 'Número'), T(1, 'Sufijo'), T(2, 'Título'), T(3, 'Texto', { type: 'textarea', rows: 2 })] }),
        ]],
        ['Títulos de las secciones', '', [
          T('sectorsTitle', 'Proyectos por sector'), T('statusTitle', 'Según su estado'), T('recentTitle', 'Recién publicados'), T('howTitle', 'Cómo funciona'),
          T('howSteps', 'Pasos de “Cómo funciona”', { type: 'list', fixed: true, fields: [T(0, 'Título'), T(1, 'Texto', { type: 'textarea', rows: 2 })] }),
        ]],
        ['Bloque para promotores', 'Al final de la página de inicio.', [
          T('adKick', 'Antetítulo'), T('adTitle', 'Título'), T('adText', 'Texto', { type: 'textarea', full: true }),
          T('adList', 'Puntos', { type: 'strings', addLabel: 'Añadir punto' }), T('adImg', 'Imagen', { type: 'image', full: true }),
        ]],
      ],
    },
    proyectos: {
      name: 'Listado de proyectos', icon: 'fa-table-cells-large', page: 'proyectos.html',
      cards: [
        ['Cabecera', '', [T('kick', 'Antetítulo'), T('title', 'Título'), T('lead', 'Texto', { type: 'textarea', full: true })]],
        ['Bloque para promotores', '', [T('adKick', 'Antetítulo'), T('adTitle', 'Título'), T('adText', 'Texto', { type: 'textarea', full: true }), T('adImg', 'Imagen', { type: 'image', full: true })]],
      ],
    },
    proyecto: {
      name: 'Ficha de proyecto', icon: 'fa-file-lines', page: 'proyecto.html',
      cards: [['Textos comunes a todas las fichas', 'Los datos de cada obra se editan en <a href="#proyectos">Proyectos</a>.', [
        T('leadTitle', 'Título de la caja lateral'), T('leadText', 'Texto de la caja lateral', { type: 'textarea', rows: 2 }),
        T('formTitle', 'Título del formulario', { full: true }),
        T('formBullets', 'Puntos junto al formulario', { type: 'strings', addLabel: 'Añadir punto' }),
        T('profiles', 'Opciones de “Me interesa como…”', { type: 'strings', addLabel: 'Añadir opción' }),
      ]]],
    },
    destacados: {
      name: 'Destacados', icon: 'fa-trophy', page: 'destacados.html',
      cards: [
        ['Cabecera', '', [T('kick', 'Antetítulo'), T('title', 'Título', { type: 'html', rows: 2, help: HTML_HELP }), T('lead', 'Texto', { type: 'textarea', full: true })]],
        ['Proyecto del mes y ranking', '', [
          T('month', 'Proyecto del mes', { type: 'project', full: true }),
          T('top', 'Los más consultados', { type: 'list', fields: [T(0, 'Proyecto', { type: 'project' }), T(1, 'Visitas', { type: 'number' })], make: () => [STATE.projects[0].id, 1000], addLabel: 'Añadir al ranking' }),
        ]],
        ['Colecciones', 'Cada colección muestra hasta 3 proyectos de los sectores marcados.', [
          T('cols', '', { type: 'list', cols: 2, fields: [T(0, 'Título'), T(2, 'Icono', { type: 'icon' }), T(1, 'Texto', { type: 'textarea', rows: 2, wide: true }), T(3, 'Sectores', { type: 'cats' })], make: () => ['', '', 'fa-star', []], addLabel: 'Añadir colección' }),
        ]],
        ['Llamada final', '', [T('ctaTitle', 'Título', { type: 'html', rows: 2, help: HTML_HELP }), T('ctaText', 'Texto', { type: 'textarea', rows: 2 })]],
      ],
    },
    anunciate: {
      name: 'Para promotores', icon: 'fa-bullhorn', page: 'anunciate.html',
      cards: [
        ['Cabecera', '', [T('kick', 'Antetítulo'), T('title', 'Título', { type: 'html', rows: 2, help: HTML_HELP }), T('lead', 'Texto', { type: 'html', full: true }),
          T('trust', 'Ventajas bajo los botones', { type: 'strings' }), T('sample', 'Proyecto de ejemplo', { type: 'project' })]],
        ['Cifras', '', [T('nums', '', { type: 'list', fields: [T(0, 'Número'), T(1, 'Sufijo'), T(2, 'Texto')], make: ['', '', ''], addLabel: 'Añadir cifra' })]],
        ['Cómo funciona', '', [T('flowTitle', 'Título', { full: true }), T('flow', 'Pasos', { type: 'list', fields: [T(0, 'Icono', { type: 'icon' }), T(1, 'Título'), T(2, 'Texto')], make: ['fa-check', '', ''], addLabel: 'Añadir paso' })]],
        ['Planes y precios', 'El nombre de cada plan no se cambia porque lo usa el formulario de solicitud. Los precios también aparecen en la solicitud.', [
          T('plans', '', { type: 'list', fixed: true, cols: 2, fields: [T('id', 'Plan', { readonly: true }), T('price', 'Precio al mes (USD)'), T('tag', 'Etiqueta'), T('short', 'Resumen corto (solicitud)'), T('hi', 'Marcar como “el más elegido”', { type: 'check' }), T('items', 'Qué incluye', { type: 'strings', wide: true })] }),
          T('plansNote', 'Nota bajo los planes', { full: true }),
        ]],
        ['Testimonio', 'La imagen de fondo se cambia en “General y contacto”.', [T('testimonial', '', { type: 'group', fields: [T(0, 'Cita', { type: 'textarea', full: true }), T(1, 'Nombre'), T(2, 'Cargo y empresa')] })]],
        ['Preguntas frecuentes', '', [T('faq', '', { type: 'list', fields: [T(0, 'Pregunta'), T(1, 'Respuesta', { type: 'textarea', rows: 2 })], make: ['', ''], addLabel: 'Añadir pregunta' })]],
        ['Llamada final', '', [T('finalTitle', 'Título', { type: 'html', rows: 2, help: HTML_HELP, full: true })]],
      ],
    },
    contacto: {
      name: 'Contacto', icon: 'fa-envelope', page: 'contacto.html',
      cards: [
        ['Cabecera', 'Los emails, teléfonos y la dirección están en “General y contacto”.', [T('title', 'Título', { type: 'html', rows: 2, help: HTML_HELP }), T('lead', 'Texto', { type: 'textarea' }), T('availability', 'Horario de atención'), T('response', 'Tiempo de respuesta')]],
        ['Preguntas rápidas', 'Puedes poner enlaces con HTML.', [T('faq', '', { type: 'list', fields: [T(0, 'Pregunta'), T(1, 'Respuesta', { type: 'textarea', rows: 2 })], make: ['', ''], addLabel: 'Añadir pregunta' })]],
      ],
    },
    solicitud: {
      name: 'Solicitud', icon: 'fa-pen-to-square', page: 'solicitud.html',
      cards: [['Cabecera', 'Los planes y precios se editan en “Para promotores”.', [T('title', 'Título', { type: 'html', rows: 2, help: HTML_HELP }), T('lead', 'Texto', { type: 'textarea' })]]],
    },
  };

  /* ---------- Proyectos ---------- */
  const PROJECT = [
    ['Datos principales', '', [
      T('title', 'Título completo', { full: true }), T('short', 'Nombre corto'),
      T('id', 'Identificador en la dirección web', { nolive: true, help: 'Aparece en <code>proyecto.html?id=…</code>. Solo letras, números y guiones.' }),
      T('cat', 'Sector', { type: 'select', opts: catOpts }), T('status', 'Estado', { type: 'select', opts: STATUS }),
      T('city', 'Ciudad y país'), T('year', 'Año de entrega', { type: 'number' }),
      T('area', 'Superficie'), T('floors', 'Altura / plantas'), T('budget', 'Inversión estimada'), T('progress', 'Avance (%)', { type: 'number', min: 0, max: 100 }),
      T('pub', 'Fecha de publicación', { type: 'date', help: 'Ordena los “Recién publicados”.' }),
      T('hidden', 'Visible en la web', { type: 'check', invert: true }),
    ]],
    ['Promotor', 'Quien recibe las solicitudes de información.', [T('owner', '', { type: 'group', fields: [T('name', 'Nombre', { change: (v, o) => delete o.initials }), T('type', 'Tipo (promotora, particular…)')] })]],
    ['Imágenes', 'La primera es la portada del proyecto. Las imágenes se reducen automáticamente antes de subirlas.', [T('img', '', { type: 'gallery' })]],
    ['Resumen', '', [T('summary', 'Resumen', { type: 'textarea', rows: 4, full: true }), T('quote', 'Cita destacada', { type: 'group', fields: [T(0, 'Cita', { type: 'textarea', rows: 2 }), T(1, 'Autor')] })]],
    ['Análisis del terreno', '', [T('terrain', 'Texto', { type: 'textarea', rows: 4, full: true }), T('terrainSpec', 'Datos clave', { type: 'list', fields: [T(0, 'Dato'), T(1, 'Valor')], make: ['', ''], addLabel: 'Añadir dato' })]],
    ['Materiales', '', [T('materials', '', { type: 'list', fields: [T(0, 'Elemento'), T(1, 'Especificación'), T(2, 'Proveedor')], make: ['', '', ''], addLabel: 'Añadir material' })]],
    ['Equipos y maquinaria', ICON_HELP, [T('equipment', '', { type: 'list', fields: [T(0, 'Icono', { type: 'icon' }), T(1, 'Equipo'), T(2, 'Detalle')], make: ['fa-truck-moving', '', ''], addLabel: 'Añadir equipo' })]],
    ['Iluminación y sostenibilidad', '', [T('lighting', 'Proyecto lumínico', { type: 'textarea', rows: 3, full: true }), T('sustain', 'Sostenibilidad', { type: 'textarea', rows: 3, full: true })]],
    ['Avance de obra', '', [T('phases', '', { type: 'list', fields: [T(0, 'Fase'), T(1, '% completado', { type: 'number', min: 0, max: 100 })], make: ['', 0], addLabel: 'Añadir fase' })]],
    ['Quién lo hace', '', [T('team', '', { type: 'list', fields: [T(0, 'Rol'), T(1, 'Empresa o persona')], make: ['', ''], addLabel: 'Añadir integrante' })]],
  ];
  const today = () => new Date().toISOString().slice(0, 10);
  const newProject = () => ({
    id: `nuevo-proyecto-${Date.now().toString(36).slice(-4)}`, title: 'Nuevo proyecto', short: 'Nuevo proyecto',
    cat: STATE.cats[0].id, status: 'obra', city: '', year: new Date().getFullYear(), area: '', floors: '', budget: '', progress: 0,
    owner: { name: '', type: 'Promotora' }, img: [], summary: '', quote: ['', ''], terrain: '', terrainSpec: [], materials: [], equipment: [],
    lighting: '', sustain: '', phases: [], team: [], pub: today(), hidden: true,
  });
  /* Al cambiar el id, actualiza las referencias en las páginas */
  function renameRefs(from, to) {
    const walk = o => { for (const k in o) { if (o[k] === from) o[k] = to; else if (o[k] && typeof o[k] === 'object') walk(o[k]); } };
    ['home', 'destacados', 'anunciate'].forEach(s => walk(STATE[s]));
  }

  /* ---------- Vistas ---------- */
  const view = () => $('#view');
  const setTitle = t => { $('#title').textContent = t; document.title = `${t} · Panel Bloque Maestro`; };
  let currentPage = 'index.html';

  function viewProjects() {
    setTitle('Proyectos'); currentPage = 'proyectos.html';
    let q = '', st = '';
    const list = h('div', { className: 'plist' });
    const draw = () => list.replaceChildren(...[...STATE.projects].sort((a, b) => b.pub.localeCompare(a.pub))
      .filter(p => (!st || (st === 'oculto' ? p.hidden : p.cat === st)) && (!q || `${p.title} ${p.city} ${p.owner.name}`.toLowerCase().includes(q)))
      .map(p => h('div', { className: `pr ${p.hidden ? 'off' : ''}`, onclick: () => location.hash = `#proyecto/${p.id}` }, thumb(p.img[0]),
        h('div', {}, h('b', {}, p.short), h('small', {}, `${p.city || 'Sin ciudad'} · ${p.owner.name || 'Sin promotor'} · ${p.pub}`), h('div', {},
          h('span', { className: 'tag' }, (STATE.cats.find(c => c.id === p.cat) || {}).name || p.cat), h('span', { className: 'tag' }, Object.fromEntries(STATUS)[p.status]),
          p.hidden ? h('span', { className: 'tag hid' }, 'Oculto') : null)),
        h('div', { className: 'pr-act' }, h('button', { className: 'icon', title: 'Editar' }, ic('fa-pen'))))));
    view().replaceChildren(
      h('div', { className: 'tools' },
        h('input', { placeholder: 'Buscar proyecto…', oninput: e => { q = e.target.value.toLowerCase(); draw(); } }),
        h('select', { onchange: e => { st = e.target.value; draw(); } }, h('option', { value: '' }, 'Todos los sectores'), ...catOpts().map(([v, t]) => h('option', { value: v }, t)), h('option', { value: 'oculto' }, 'Solo ocultos')),
        h('button', { className: 'btn', onclick: () => { const p = newProject(); STATE.projects.push(p); dirty(); location.hash = `#proyecto/${p.id}`; } }, ic('fa-plus'), 'Nuevo proyecto')),
      list);
    draw();
  }

  function viewProject(id) {
    const p = STATE.projects.find(x => x.id === id);
    if (!p) { location.hash = '#proyectos'; return; }
    setTitle(p.short || 'Proyecto'); currentPage = `proyecto.html?id=${p.id}`;
    const cards = PROJECT.map(([t, hint, fs]) => card(t, hint, fs, p));
    /* El id se valida al salir del campo */
    const idInput = cards[0].querySelectorAll('input')[2];
    idInput.addEventListener('change', () => {
      const nv = slug(idInput.value);
      if (nv === p.id) { idInput.value = nv; return; }
      if (STATE.projects.some(x => x.id === nv)) { toast('Ya existe un proyecto con ese identificador.', true); idInput.value = p.id; return; }
      renameRefs(p.id, nv); p.id = nv; idInput.value = nv; dirty(); history.replaceState(null, '', `#proyecto/${nv}`); currentPage = `proyecto.html?id=${nv}`;
    });
    view().replaceChildren(
      h('a', { className: 'back', href: '#proyectos' }, ic('fa-arrow-left'), 'Todos los proyectos'),
      p.hidden ? h('div', { className: 'note' }, ic('fa-eye-slash'), h('span', { html: 'Este proyecto está <b>oculto</b>. Marca <b>“Visible en la web”</b> cuando esté listo y pulsa <b>Publicar</b>.' })) : '',
      ...cards,
      h('section', { className: 'card' }, h('h3', {}, 'Acciones'), h('p', { className: 'hint' }, 'Duplicar crea una copia oculta para usarla como plantilla.'),
        h('div', { className: 'danger-zone' },
          h('button', { className: 'btn-sec', onclick: () => { const c = clone(p); c.id = `${p.id}-copia-${Date.now().toString(36).slice(-3)}`; c.title += ' (copia)'; c.short += ' (copia)'; c.hidden = true; c.pub = today(); STATE.projects.push(c); dirty(); location.hash = `#proyecto/${c.id}`; } }, ic('fa-copy'), 'Duplicar'),
          h('button', { className: 'btn-sec btn-danger', onclick: () => {
            if (!confirm(`¿Eliminar “${p.short}”? Podrás recuperarlo con “Descartar” mientras no publiques.`)) return;
            STATE.projects.splice(STATE.projects.indexOf(p), 1); dirty(); location.hash = '#proyectos';
          } }, ic('fa-trash'), 'Eliminar proyecto'))));
  }

  function viewCats() {
    setTitle('Sectores'); currentPage = 'index.html';
    const counts = id => STATE.projects.filter(p => p.cat === id).length;
    const c0 = card('Sectores', `Aparecen en el menú “Proyectos”, en los filtros y en la portada. ${ICON_HELP}`, [
      T('cats', '', { type: 'list', cols: 2, fields: [T('name', 'Nombre', { change: (v, o) => { if (o.id.startsWith('nuevo-')) o.id = `nuevo-${slug(v)}`; } }), T('desc', 'Descripción'), T('icon', 'Icono', { type: 'icon' }), T('color', 'Color', { type: 'color' })],
        make: () => ({ id: `nuevo-${Date.now().toString(36).slice(-4)}`, name: '', icon: 'fa-building', desc: '', color: '#10A8E8' }), addLabel: 'Añadir sector' }),
    ], STATE);
    view().replaceChildren(c0);
    /* Avisa antes de borrar un sector con proyectos */
    c0.addEventListener('click', e => {
      const b = e.target.closest('button[title="Eliminar"]'); if (!b) return;
      const i = [...c0.querySelectorAll('.li')].indexOf(b.closest('.li')), c = STATE.cats[i];
      if (c && counts(c.id) && !confirm(`El sector “${c.name}” tiene ${counts(c.id)} proyecto(s). Si lo eliminas, esos proyectos quedarán sin sector visible. ¿Seguir?`)) e.stopImmediatePropagation();
    }, true);
  }

  function viewPage(key) {
    const P = PAGES[key]; if (!P) { location.hash = '#proyectos'; return; }
    setTitle(P.name); currentPage = P.page;
    view().replaceChildren(...P.cards.map(([t, hint, fs]) => card(t, hint, fs, STATE[key])));
  }

  function viewHelp() {
    setTitle('Ayuda'); currentPage = 'index.html';
    view().replaceChildren(h('section', { className: 'card', html: `
      <h3>Cómo funciona el panel</h3>
      <ol class="steps" style="margin-top:12px;line-height:1.7">
        <li>Elige en el menú lo que quieres cambiar: un <b>proyecto</b>, los <b>sectores</b> o los textos de una <b>página</b>.</li>
        <li>Edita los textos e imágenes. Los cambios se guardan como borrador en este navegador mientras tengas el panel abierto.</li>
        <li>Pulsa <b>Vista previa</b> para ver cómo quedará la web antes de publicar.</li>
        <li>Pulsa <b>Publicar</b>. La web se actualiza sola en <b>1 o 2 minutos</b> (si no lo ves, recarga la página).</li>
      </ol>
      <h3 style="margin-top:22px">Consejos</h3>
      <ul class="steps" style="margin-top:12px;line-height:1.7">
        <li>Las imágenes se reducen y comprimen automáticamente. Usa fotos horizontales de buena calidad.</li>
        <li>Un proyecto nuevo empieza <b>oculto</b>. Márcalo como visible cuando esté completo.</li>
        <li>En los títulos puedes escribir <code>&lt;em&gt;palabra&lt;/em&gt;</code> para resaltar en color.</li>
        <li>Si te equivocas antes de publicar, pulsa <b>Descartar</b>. Si ya publicaste, cada cambio queda guardado en el historial de GitHub y se puede recuperar.</li>
      </ul>` }));
  }

  /* ---------- Navegación ---------- */
  function nav() {
    const hash = location.hash;
    const a = (href, icon, t, extra) => h('a', { href, className: hash === href || (href === '#proyectos' && hash.startsWith('#proyecto/')) ? 'on' : '' }, ic(icon), t, extra);
    $('#nav').replaceChildren(
      h('small', {}, 'Contenido'),
      a('#proyectos', 'fa-building', 'Proyectos', h('em', {}, STATE.projects.length)), a('#sectores', 'fa-layer-group', 'Sectores'),
      h('small', {}, 'Páginas'),
      ...Object.entries(PAGES).map(([k, p]) => a(`#pagina/${k}`, p.icon, p.name)),
      h('small', {}, 'Panel'), a('#ayuda', 'fa-circle-question', 'Ayuda'));
  }
  function route() {
    if (!STATE) return;
    const [r, arg] = location.hash.slice(1).split('/');
    $('#app').classList.remove('menu');
    if (r === 'proyecto') viewProject(decodeURIComponent(arg));
    else if (r === 'sectores') viewCats();
    else if (r === 'pagina') viewPage(arg);
    else if (r === 'ayuda') viewHelp();
    else viewProjects();
    nav(); scrollTo(0, 0);
  }

  /* ---------- Vista previa ---------- */
  function draftForPreview() {
    let s = JSON.stringify(STATE);
    for (const [p, u] of Object.entries(UPLOADS)) s = s.split(`"${p}"`).join(`"${u.url}"`);
    return s;
  }
  const PV_PAGES = [['index.html', 'Inicio'], ['proyectos.html', 'Proyectos'], ['destacados.html', 'Destacados'], ['anunciate.html', 'Para promotores'], ['contacto.html', 'Contacto'], ['solicitud.html', 'Solicitud']];
  let pvEdit = false, saveT;
  const saveDraft = () => {
    try { localStorage.setItem('bm_preview', draftForPreview()); return true; }
    catch { try { localStorage.setItem('bm_preview', JSON.stringify(STATE)); toast('Las imágenes nuevas son demasiado grandes para la vista previa: se verán al publicar.'); return true; } catch { toast('No se pudo preparar la vista previa.', true); return false; } }
  };
  /* Vista previa (solo mirar) o editor visual (clic en un texto para cambiarlo) */
  function openPreview(edit) {
    if (!saveDraft()) return;
    pvEdit = edit;
    $('#pvtitle').textContent = edit ? 'Editor visual' : 'Vista previa (sin publicar)';
    $('#pvhint').hidden = !edit; $('#pvpub').hidden = !edit;
    const sel = $('#pvpage'), pages = [...PV_PAGES];
    if (currentPage.startsWith('proyecto.html')) { const p = STATE.projects.find(x => currentPage.endsWith(`=${x.id}`)); pages.unshift([currentPage, `Ficha: ${p ? p.short : ''}`]); }
    sel.replaceChildren(...pages.map(([v, t]) => h('option', { value: v, selected: v === currentPage }, t)));
    const go = () => $('#pvf').src = `../${sel.value}${sel.value.includes('?') ? '&' : '?'}${edit ? 'edit' : 'preview'}=1`;
    sel.onchange = go; go(); $('#pv').hidden = false; dirty();
  }
  $('#preview').onclick = () => openPreview(false);
  $('#visual').onclick = () => openPreview(true);
  $('#pvpub').onclick = () => $('#publish').click();
  /* Cambios que llegan desde el editor visual */
  addEventListener('message', e => {
    if (e.origin !== location.origin || !e.data || !STATE) return;
    if (e.data.type === 'bm-edit' && pvEdit) {
      const path = e.data.path; let o = STATE;
      for (const k of path.slice(0, -1)) { o = o[k]; if (o == null) return; }
      o[path.at(-1)] = e.data.value; dirty();
      clearTimeout(saveT); saveT = setTimeout(saveDraft, 300);
    }
    if (e.data.type === 'bm-page') {
      const sel = $('#pvpage'), v = e.data.page || 'index.html';
      if (![...sel.options].some(o => o.value === v)) {
        const id = new URLSearchParams(v.split('?')[1] || '').get('id'), p = STATE.projects.find(x => x.id === id);
        sel.prepend(h('option', { value: v }, p ? `Ficha: ${p.short}` : v));
      }
      sel.value = v;
    }
  });
  $('#pvx').onclick = () => { $('#pv').hidden = true; $('#pvf').src = 'about:blank'; try { localStorage.removeItem('bm_preview'); } catch {} if (pvEdit) route(); pvEdit = false; };
  document.querySelectorAll('.pv-dev .icon').forEach(b => b.onclick = () => {
    document.querySelectorAll('.pv-dev .icon').forEach(x => x.classList.toggle('on', x === b)); $('#pvf').style.width = b.dataset.w;
  });

  /* ---------- Publicar ---------- */
  function validate() {
    for (const p of STATE.projects) {
      if (!p.title.trim() || !p.short.trim()) return `Al proyecto “${p.id}” le falta el título o el nombre corto.`;
      if (!p.hidden && !p.img.length) return `El proyecto “${p.short}” es visible pero no tiene imágenes.`;
      if (!p.hidden && !STATE.cats.some(c => c.id === p.cat)) return `El proyecto “${p.short}” es visible pero su sector ya no existe.`;
    }
    if (!STATE.cats.length) return 'Tiene que haber al menos un sector.';
    if (!STATE.projects.some(p => !p.hidden)) return 'Tiene que haber al menos un proyecto visible.';
    if (!STATE.cats.every(c => c.name.trim())) return 'Hay un sector sin nombre.';
  }
  $('#publish').onclick = async () => {
    if (DEMO) return toast('Modo demo: aquí no se publica. Entra con usuario y contraseña para guardar cambios.', true);
    const err = validate(); if (err) return toast(err, true);
    const btn = $('#publish'); btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publicando…';
    try {
      const cur = await readFile('assets/content.js');
      if (cur.sha !== SHA && !confirm('Alguien ha publicado cambios desde que abriste el panel. Si continúas, se sustituirán por los tuyos. ¿Publicar igualmente?')) throw new Error('Publicación cancelada.');
      const json = JSON.stringify(STATE);
      const imgs = Object.entries(UPLOADS).filter(([p, u]) => !u.done && json.includes(`"${p}"`));
      await commitFiles([{ path: 'assets/content.js', b64: utf8ToB64(serialize()) }, ...imgs.map(([path, u]) => ({ path, b64: u.b64 }))],
        `Panel: actualizar contenido (${sessionStorage.getItem('bm_user') || 'admin'})`);
      imgs.forEach(([, u]) => u.done = true);
      SHA = (await readFile('assets/content.js')).sha; ORIG = clone(STATE);
      toast('¡Publicado! La web se actualizará en 1–2 minutos.');
      route();
    } catch (e) { toast(e.message, true); }
    btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Publicar'; dirty();
  };
  $('#discard').onclick = () => { if (confirm('¿Descartar todos los cambios sin publicar?')) { STATE = clone(ORIG); dirty(); route(); } };

  /* ---------- Acceso ---------- */
  const show = id => ['login', 'setup', 'app'].forEach(x => $('#' + x).hidden = x !== id);
  async function loadConfig() { CFG = await (await fetch(`config.json?t=${Date.now()}`, { cache: 'no-store' })).json(); }
  async function startApp() {
    show('app'); $('#view').innerHTML = '<p class="muted">Cargando contenido…</p>';
    $('#who').textContent = sessionStorage.getItem('bm_user') || '';
    try { await loadContent(); } catch (e) {
      if (e.status === 401) { sessionStorage.clear(); show('login'); $('#loginerr').textContent = e.message; return; }
      $('#view').innerHTML = `<div class="note"><i class="fa-solid fa-triangle-exclamation"></i><span>No se pudo cargar el contenido: ${e.message}</span></div>`; return;
    }
    dirty(); route();
  }
  $('#loginf').onsubmit = async e => {
    e.preventDefault(); const f = e.target, err = $('#loginerr'); err.textContent = '';
    const btn = f.querySelector('button'); btn.disabled = true;
    try {
      await loadConfig();
      const u = CFG.users.find(x => x.user.toLowerCase() === f.user.value.trim().toLowerCase());
      if (!u) throw new Error('Usuario o contraseña incorrectos.');
      const tok = await unseal(u, f.pass.value).catch(() => { throw new Error('Usuario o contraseña incorrectos.'); });
      TOKEN = tok; sessionStorage.setItem('bm_tok', tok); sessionStorage.setItem('bm_user', u.user);
      if (!location.hash || location.hash === '#setup') location.hash = '#proyectos';
      await startApp();
    } catch (x) { err.textContent = x.message; }
    btn.disabled = false;
  };
  $('#setupf').onsubmit = async e => {
    e.preventDefault(); const f = e.target, err = $('#setuperr'); err.textContent = '';
    if (f.pass.value !== f.pass2.value) return err.textContent = 'Las contraseñas no coinciden.';
    const btn = f.querySelector('button'); btn.disabled = true;
    try {
      const tok = f.token.value.trim();
      const r = await gh(`${repo()}`, {}, tok);
      if (!r.permissions || !r.permissions.push) throw new Error('El token no tiene permiso de escritura sobre el repositorio.');
      const cur = JSON.parse(b64ToUtf8((await readFile('admin/config.json', tok)).content));
      const user = f.user.value.trim();
      cur.users = cur.users.filter(x => x.user.toLowerCase() !== user.toLowerCase());
      cur.users.push({ user, ...(await seal(tok, f.pass.value)) });
      await commitFiles([{ path: 'admin/config.json', b64: utf8ToB64(JSON.stringify(cur, null, 1) + '\n') }], `Panel: configurar acceso para ${user}`, tok);
      CFG = cur; TOKEN = tok; sessionStorage.setItem('bm_tok', tok); sessionStorage.setItem('bm_user', user);
      f.reset(); location.hash = '#proyectos'; toast('Acceso guardado. Ya puedes entrar con ese usuario y contraseña.');
      await startApp();
    } catch (x) { err.textContent = x.message; }
    btn.disabled = false;
  };
  $('#logout').onclick = () => { if (STATE && isDirty() && !confirm('Tienes cambios sin publicar. ¿Salir igualmente?')) return; sessionStorage.clear(); STATE = null; location.hash = ''; location.reload(); };
  $('#burger').onclick = () => $('#app').classList.toggle('menu');
  $('.side').addEventListener('click', e => { if (e.target === $('.side')) $('#app').classList.remove('menu'); });

  addEventListener('hashchange', () => {
    if (location.hash === '#setup') { if (!STATE) { show('setup'); $('#repoName').textContent = CFG ? CFG.repo : ''; } return; }
    if (!STATE) { show('login'); return; }
    route();
  });

  (async () => {
    await loadConfig();
    if (DEMO) { sessionStorage.setItem('bm_user', 'demo'); if (!location.hash) location.hash = '#proyectos'; return startApp(); }
    TOKEN = sessionStorage.getItem('bm_tok');
    if (TOKEN) return startApp();
    if (location.hash === '#setup' || !CFG.users.length) { show('setup'); $('#repoName').textContent = CFG.repo; history.replaceState(null, '', '#setup'); }
    else show('login');
  })();
})();
