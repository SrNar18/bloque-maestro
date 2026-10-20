/* =========================================================
   BLOQUE MAESTRO · Header, footer y utilidades compartidas
   ========================================================= */
(function () {
  const LOGO = 'assets/logo_oscuro_horizontal.png';
  const page = document.body.dataset.page || '';

  /* ---------- Header (sticky) con desplegable de categorías ---------- */
  const dd = BM.CATS.map(c => `<a href="proyectos.html?cat=${c.id}"><i class="fa-solid ${c.icon}"></i><span><b>${c.name}</b><small>${c.desc}</small></span></a>`).join('');
  const header = `
  <header class="bar" id="bar">
    <a class="logo" href="index.html" title="Ir al inicio"><img src="${LOGO}" alt="Bloque Maestro"></a>
    <nav>
      <a href="index.html" class="${page === 'home' ? 'cur' : ''}">Inicio</a>
      <div class="dd">
        <a href="proyectos.html" class="${page === 'proyectos' || page === 'proyecto' ? 'cur' : ''}">Proyectos <i class="fa-solid fa-chevron-down"></i></a>
        <div class="dd-menu"><div class="dd-grid">${dd}</div>
          <div class="dd-foot"><a class="link" href="proyectos.html">Ver todos los proyectos <i class="fa-solid fa-arrow-right"></i></a></div></div>
      </div>
      <a href="destacados.html" class="${page === 'destacados' ? 'cur' : ''}">Destacados</a>
      <a href="anunciate.html" class="${page === 'anunciate' ? 'cur' : ''}">Para promotores</a>
    </nav>
    <div class="bar-actions">
      <button class="icon-btn" id="so-open" aria-label="Buscar proyectos" title="Buscar (Ctrl+K)"><i class="fa-solid fa-magnifying-glass"></i></button>
      <a href="solicitud.html" class="btn btn-sm">Anuncia tu proyecto</a>
    </div>
    <button class="burger" aria-label="Menú"><i class="fa-solid fa-bars"></i></button>
  </header>`;

  const footer = `
  <footer class="site"><div class="w">
    <div class="footer-cta">
      <h3>¿Tienes una obra que <em>merece ser vista</em>?</h3>
      <div class="r"><p>Publícala en Bloque Maestro y recibe contactos de inversores, proveedores y profesionales.</p>
        <div class="ctas" style="margin:0"><a href="solicitud.html" class="btn">Anunciar mi proyecto <i class="fa-solid fa-arrow-right"></i></a><a href="anunciate.html" class="btn-sec">Cómo funciona</a></div></div>
    </div>
    <div class="g">
      <div><a class="logo" href="index.html"><img src="${LOGO}" alt="Bloque Maestro"></a><p>La revista de proyectos de construcción: quién construye qué, cómo y con qué.</p>
        <div class="footer-big"><span><b>${BM.PROJECTS.length * 6}+</b><small>proyectos</small></span><span><b>31K</b><small>lectores/mes</small></span><span><b>14</b><small>países</small></span></div></div>
      <div><h5>Proyectos</h5>${BM.CATS.slice(0, 6).map(c => `<a href="proyectos.html?cat=${c.id}">${c.name}</a>`).join('')}</div>
      <div><h5>Revista</h5><a href="proyectos.html">Todos los proyectos</a><a href="destacados.html">Destacados</a><a href="destacados.html#ds1">Más consultados</a><a href="index.html#recientes">Recién publicados</a></div>
      <div><h5>Promotores</h5><a href="anunciate.html">Cómo funciona</a><a href="anunciate.html#planes">Planes y precios</a><a href="solicitud.html">Solicitar publicación</a><a href="contacto.html">Contacto</a></div>
      <div><h5>Newsletter</h5><p style="line-height:1.6;margin-bottom:12px">Los nuevos proyectos, cada lunes.</p>
        <form class="f-nl nlf"><input type="email" placeholder="tu@correo.com" required aria-label="Correo"><button class="btn btn-sm">OK</button></form>
        <div class="f-social" style="margin-top:16px"><a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a><a href="#" aria-label="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a><a href="#" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a><a href="mailto:hola@bloquemaestro.com" aria-label="Email"><i class="fa-regular fa-envelope"></i></a></div></div>
    </div>
    <div class="bt"><span>© 2026 Bloque Maestro · Construcción · Técnica · Innovación</span><span>Aviso legal · Privacidad · Cookies</span></div>
  </div></footer>
  <div class="lightbox" id="lb"><img alt=""></div>
  <div class="search-ov" id="so" role="dialog" aria-label="Buscar proyectos"><div class="so-box">
    <div class="so-in"><i class="fa-solid fa-magnifying-glass"></i><input id="so-q" placeholder="Busca por proyecto, ciudad, material o empresa…" autocomplete="off"><button class="icon-btn" id="so-x" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="so-tags">${['Madera', 'Hormigón', 'Medellín', 'Rehabilitación', 'Puente', 'Fachada'].map(t => `<button class="btn-sec btn-sm" data-t="${t}">${t}</button>`).join('')}</div>
    <div class="so-res" id="so-res" hidden></div>
  </div></div>`;

  document.body.insertAdjacentHTML('afterbegin', header);
  document.body.insertAdjacentHTML('beforeend', footer);

  const bar = document.getElementById('bar');
  bar.querySelector('.burger').onclick = () => bar.classList.toggle('open');
  /* En móvil, el primer toque en "Proyectos" abre el desplegable */
  bar.querySelector('.dd>a').addEventListener('click', e => {
    if (innerWidth <= 900) { e.preventDefault(); e.currentTarget.parentNode.classList.toggle('open'); }
  });

  /* ---------- Helpers de render ---------- */
  BM.ph = (i, w, h) => `<div class="ph"><img loading="lazy" src="${BM.img(i, w, h)}" alt=""></div>`;

  /* ---------- Búsqueda global (Ctrl+K) ---------- */
  const so = document.getElementById('so'), sq = document.getElementById('so-q'), sr = document.getElementById('so-res');
  let sel = 0;
  const openS = () => { so.classList.add('on'); sq.value = ''; sr.hidden = true; setTimeout(() => sq.focus(), 30); };
  const closeS = () => so.classList.remove('on');
  const searchS = () => {
    const q = sq.value.trim().toLowerCase();
    if (!q) { sr.hidden = true; return; }
    const hits = BM.PROJECTS.filter(p => JSON.stringify([p.title, p.city, p.owner.name, p.cat, p.materials, p.team]).toLowerCase().includes(q)).slice(0, 7);
    sel = 0; sr.hidden = false;
    sr.innerHTML = (hits.length ? hits.map((p, i) => `<a href="${BM.url(p)}" class="${i ? '' : 'on'}"><div class="ph"><img src="${BM.img(p.img[0], 160, 120)}" alt=""></div><span><b>${p.title}</b><small>${BM.catName(p.cat)} · ${p.city}</small></span><span>${BM.status(p.status)}</span></a>`).join('')
      : '<div class="so-hint">Sin resultados para esa búsqueda.</div>')
      + `<div class="so-hint"><span>↑ ↓ para moverte · Enter para abrir</span><a class="link" href="proyectos.html?q=${encodeURIComponent(sq.value)}">Ver todos los resultados <i class="fa-solid fa-arrow-right"></i></a></div>`;
  };
  document.getElementById('so-open').onclick = openS;
  document.getElementById('so-x').onclick = closeS;
  so.addEventListener('click', e => { if (e.target === so) closeS(); const t = e.target.closest('[data-t]'); if (t) { sq.value = t.dataset.t; searchS(); sq.focus(); } });
  sq.addEventListener('input', searchS);
  sq.addEventListener('keydown', e => {
    const items = [...sr.querySelectorAll('a[class]')].filter(a => a.closest('#so-res') && a.querySelector('.ph'));
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!items.length) return; sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items.forEach((a, i) => a.classList.toggle('on', i === sel)); }
    if (e.key === 'Enter') { e.preventDefault(); location.href = items[sel] ? items[sel].href : `proyectos.html?q=${encodeURIComponent(sq.value)}`; }
  });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openS(); }
    if (e.key === 'Escape') closeS();
  });
  document.querySelectorAll('.nlf').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); f.innerHTML = '<span style="padding:8px 14px;color:var(--ok);font-size:14px"><i class="fa-solid fa-check"></i> ¡Suscrito!</span>'; }));
  BM.status = s => `<span class="status ${BM.STATUS[s][1]}">${BM.STATUS[s][0]}</span>`;
  BM.url = p => `proyecto.html?id=${p.id}`;

  /* Tarjeta bento (portada) */
  BM.bentoCard = (p, cls = '', w = 800, h = 600) => `
    <a class="card ${cls} rv" href="${BM.url(p)}">${BM.ph(p.img[0], w, h)}
      <div class="top"><span class="chip">${BM.catName(p.cat)}</span><span class="chip">${BM.status(p.status)}</span></div>
      <span class="go"><i class="fa-solid fa-arrow-right"></i></span>
      <div class="in"><h3>${cls.includes('xl') ? p.title : p.short}</h3><div class="loc"><i class="fa-solid fa-location-dot"></i> ${p.city} · ${p.area}</div></div></a>`;

  /* Tarjeta de rejilla (listado / relacionados) */
  BM.gridCard = p => `
    <a class="pcard rv" href="${BM.url(p)}">${BM.ph(p.img[0], 700, 460).replace('</div>', `<span class="chip">${BM.catName(p.cat)}</span></div>`)}
      <div class="body">${BM.status(p.status)}<h3>${p.title}</h3><div class="loc"><i class="fa-solid fa-location-dot"></i> ${p.city}</div>
        <div class="facts"><span><b>${p.area}</b>Superficie</span><span><b>${p.year}</b>Año</span><span><b>${p.owner.type}</b>Promotor</span></div>
        <span class="link">Ver ficha del proyecto <i class="fa-solid fa-arrow-right"></i></span></div></a>`;

  /* ---------- Formularios (maqueta: sin envío real) ---------- */
  ['input', 'change'].forEach(ev => document.addEventListener(ev, e => e.target.closest?.('.err')?.classList.remove('err')));
  BM.initForms = () => document.querySelectorAll('form.lead').forEach(f => {
    f.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      f.querySelectorAll('[required]').forEach(el => {
        const bad = el.type === 'checkbox' ? !el.checked : !el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value));
        (el.closest('.f') || el.closest('.check')).classList.toggle('err', bad);
        if (bad) ok = false;
      });
      if (!ok) { f.querySelector('.err input,.err select,.err textarea')?.focus(); return; }
      const name = (f.querySelector('[name=nombre]') || {}).value || '';
      const msg = f.querySelector('.sent p');
      if (msg && name) msg.innerHTML = msg.innerHTML.replace('{nombre}', name.split(' ')[0]);
      f.classList.add('done');
      f.closest('.formbox')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
  document.querySelectorAll('.nl form').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault(); f.innerHTML = '<p style="padding:10px 18px;width:100%;color:var(--ok)"><i class="fa-solid fa-check"></i> ¡Listo! Te escribiremos cada lunes.</p>';
  }));

  /* ---------- Animación de entrada + contadores ---------- */
  BM.reveal = () => {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('vis');
      e.target.querySelectorAll('[data-n]').forEach(b => {
        const to = +b.dataset.n, suf = b.dataset.suf || '', s = performance.now();
        const f = n => { const p = Math.min((n - s) / 1400, 1); b.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(f); };
        requestAnimationFrame(f);
      });
      io.unobserve(e.target);
    }), { threshold: .12 });
    document.querySelectorAll('.rv:not(.vis)').forEach(e => io.observe(e));
  };

  /* ---------- Lightbox de galería ---------- */
  const lb = document.getElementById('lb');
  document.addEventListener('click', e => {
    const g = e.target.closest('.gal .ph');
    if (g) { lb.querySelector('img').src = g.querySelector('img').src.replace(/w=\d+&h=\d+/, 'w=1600&h=1100'); lb.classList.add('on'); }
    else if (e.target.closest('#lb')) lb.classList.remove('on');
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('on'); });
})();
