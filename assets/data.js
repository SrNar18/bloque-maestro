/* =========================================================
   BLOQUE MAESTRO · Datos de muestra
   Cada proyecto alimenta la portada, el listado y su ficha.
   ========================================================= */
window.BM = window.BM || {};

BM.PHOTOS = `photo-1486718448742-163732cd1544 photo-1580587771525-78b9dba3b914 photo-1504307651254-35680f356dfd photo-1618221195710-dd6b41faaea6 photo-1579724175242-0204ecac28cb photo-1460574283810-2aab119d8511 photo-1613490493576-7fde63acd811 photo-1599707254554-027aeb4deacd photo-1618220179428-22790b461013 photo-1565626424178-c699f6601afd photo-1551038247-3d9af20df552 photo-1670589953882-b94c9cb380f5 photo-1575281923032-f40d94ef6160 photo-1586023492125-27b2c045efd7 photo-1569258592171-357ea26da4df photo-1433832597046-4f10e10ac764 photo-1628012209120-d9db7abf7eab photo-1527335988388-b40ee248d80c photo-1606744837616-56c9a5c6a6eb photo-1546414701-81cc6963c67f photo-1483366774565-c783b9f70e2c photo-1600596542815-ffad4c1539a9 photo-1610459716431-e07abcf74230 photo-1616046229478-9901c5536a45 photo-1616577711667-3da65b20c36a photo-1522743791393-522312deeebf photo-1627141234469-24711efb373c photo-1602757115429-b4190ae087be photo-1583847268964-b28dc8f51f92 photo-1496236436299-cde70e3587cf photo-1481253127861-534498168948 photo-1628745277862-bc0b2d68c50c photo-1623489254637-a2dd8375243d photo-1564078516393-cf04bd966897 photo-1635074155443-6cbf74711dd2 photo-1456930266018-fda42f7404a7 photo-1628744448840-55bdb2497bd4 photo-1621511075938-f03482369feb photo-1606744888344-493238951221 photo-1586871608370-4adee64d1794 photo-1611816055460-618287c870bd photo-1721815693498-cc28507c0ba2 photo-1644221150167-fb4fafa7f411 photo-1606744824163-985d376605aa photo-1563891925196-a3e34f6d869c photo-1598818384697-62330d600309 photo-1698994705178-d244d73ea573 photo-1664662568348-24b1482b6354 photo-1618219908412-a29a1bb7b86e photo-1614595737476-42487331b8a1 photo-1567943183748-3a7542120c90`.split(' ');
BM.img = (i, w = 800, h = 600) => `https://images.unsplash.com/${BM.PHOTOS[i % BM.PHOTOS.length]}?w=${w}&h=${h}&fit=crop&auto=format&q=72`;

/* Secciones del menú "Explora" */
BM.CATS = [
  { id: 'residencial',     name: 'Residencial',      icon: 'fa-house-chimney',   desc: 'Viviendas y edificios' },
  { id: 'comercial',       name: 'Comercial',        icon: 'fa-store',           desc: 'Oficinas y retail' },
  { id: 'industrial',      name: 'Industrial',       icon: 'fa-industry',        desc: 'Naves y logística' },
  { id: 'infraestructura', name: 'Infraestructura',  icon: 'fa-bridge',          desc: 'Vías, puentes y redes' },
  { id: 'rehabilitacion',  name: 'Rehabilitación',   icon: 'fa-trowel-bricks',   desc: 'Reforma y restauración' },
  { id: 'equipamiento',    name: 'Equipamiento',     icon: 'fa-school',          desc: 'Educación, salud, cultura' },
  { id: 'sostenible',      name: 'Sostenible',       icon: 'fa-leaf',            desc: 'Eficiencia y bajo carbono' },
  { id: 'interiorismo',    name: 'Interiorismo',     icon: 'fa-couch',           desc: 'Espacios interiores' },
];
BM.STATUS = { obra: ['En obra', 'st-obra'], fin: ['Finalizado', 'st-fin'], dis: ['En diseño', 'st-dis'] };

/* Proyectos de muestra */
BM.PROJECTS = [
  {
    id: 'torre-alameda', title: 'Torre Alameda: 22 plantas de vivienda con estructura mixta', short: 'Torre Alameda',
    cat: 'residencial', status: 'obra', city: 'Medellín, Colombia', year: 2026, area: '18.400 m²', floors: '22 + 3 sótanos', budget: 'USD 24 M', progress: 64,
    owner: { name: 'Grupo Inmobiliario Altavista', type: 'Promotora', initials: 'GA' },
    img: [0, 5, 2, 7, 19],
    summary: 'Torre residencial de 186 viviendas en el corredor de El Poblado. Combina núcleo de hormigón armado con forjados colaborantes de acero para reducir plazos y peso propio, y una fachada ventilada cerámica que mejora el comportamiento térmico.',
    quote: ['Elegimos una estructura mixta para ganar cuatro meses de obra sin renunciar a la rigidez que exige la zona sísmica.', 'Ing. Marcela Restrepo, directora de obra'],
    terrain: 'El estudio geotécnico, con 14 sondeos a 35 m, identificó limos arcillosos sobre roca meteorizada a 18 m. Se resolvió con pantallas de pilotes de 80 cm y una losa de cimentación de 1,6 m, con drenaje perimetral y control piezométrico durante la excavación.',
    terrainSpec: [['Sondeos', '14 a 35 m'], ['Cimentación', 'Pilotes Ø80 + losa'], ['Nivel freático', '−9,5 m']],
    materials: [
      ['Hormigón', 'HA-35 en núcleo y pantallas · HA-30 en losas', 'Cementos Andinos'],
      ['Acero estructural', 'Perfiles S355 y chapa colaborante 1,2 mm', 'Aceros del Valle'],
      ['Fachada', 'Cerámica ventilada 120×60 sobre subestructura de aluminio', 'Fachadas Técnicas SAS'],
      ['Carpintería', 'Aluminio RPT con vidrio de control solar 6/16/6', 'Ventanal Pro'],
      ['Aislamiento', 'Lana de roca 80 mm en fachada', 'Rockwool'],
    ],
    equipment: [
      ['fa-tower-cell', 'Grúa torre Liebherr 280 EC-H', 'Pluma de 60 m · 12 t de carga máxima'],
      ['fa-truck-moving', 'Bomba de hormigón 42 m', 'Hasta 160 m³/h en losas'],
      ['fa-screwdriver-wrench', 'Pilotadora rotativa Bauer BG 28', 'Pilotes de hasta 40 m'],
      ['fa-elevator', 'Montacargas de obra doble cabina', '2 × 2.000 kg a 70 m/min'],
    ],
    lighting: 'Iluminación LED 3.000 K en zonas comunes con sensores de presencia y regulación por luz natural (DALI). En fachada, bañadores lineales ocultos en el canto de los forjados para marcar la horizontalidad del edificio sin contaminación lumínica.',
    sustain: 'Recuperación de aguas pluviales para riego (120 m³), paneles fotovoltaicos de 60 kWp en cubierta y preinstalación de carga para vehículos eléctricos en el 100 % de las plazas.',
    phases: [['Cimentación', 100], ['Estructura', 85], ['Fachada', 45], ['Instalaciones', 30], ['Acabados', 10]],
    team: [['Arquitectura', 'Estudio Vértice Arquitectos'], ['Estructura', 'Cálculo & Forma Ingenieros'], ['Constructora', 'Constructora Andes SAS'], ['Geotecnia', 'GeoSuelos Consultores'], ['Iluminación', 'Lumen Lab'], ['Dirección de obra', 'Ing. Marcela Restrepo']],
  },
  {
    id: 'casa-patio-lomas', title: 'Casa Patio Lomas: hormigón visto y madera alrededor de un patio', short: 'Casa Patio Lomas',
    cat: 'residencial', status: 'fin', city: 'Valencia, España', year: 2025, area: '420 m²', floors: '2 plantas', budget: '€ 850 K', progress: 100,
    owner: { name: 'Familia Ortega-Lluch', type: 'Propietario particular', initials: 'OL' },
    img: [1, 6, 11, 3, 8],
    summary: 'Vivienda unifamiliar organizada en torno a un patio central que ventila e ilumina todas las estancias. El hormigón visto encofrado con tabla de pino contrasta con carpinterías y celosías de madera de iroko.',
    quote: ['El patio es el motor climático de la casa: en verano baja la temperatura interior hasta 4 °C.', 'Arq. Joan Ferrer, autor del proyecto'],
    terrain: 'Parcela en ladera con un 12 % de pendiente. El estudio geotécnico confirmó margas compactas a 2 m, lo que permitió zapatas corridas y un muro de contención de hormigón que se integra como zócalo de la vivienda.',
    terrainSpec: [['Pendiente', '12 %'], ['Cimentación', 'Zapatas corridas'], ['Contención', 'Muro HA 3,2 m']],
    materials: [
      ['Hormigón visto', 'HA-30 blanco con encofrado de tabla de pino', 'Hormigones Turia'],
      ['Madera', 'Iroko en celosías y carpinterías', 'Maderas Nobles Levante'],
      ['Pavimento', 'Microcemento continuo interior–exterior', 'Topciment'],
      ['Cubierta', 'Cubierta invertida ajardinada', 'Danosa'],
    ],
    equipment: [
      ['fa-truck-moving', 'Autobomba de 28 m', 'Hormigonado de muros vistos'],
      ['fa-cubes', 'Encofrado modular fenólico + tabla', 'Acabado texturizado'],
      ['fa-person-digging', 'Miniexcavadora 5 t', 'Excavación en ladera'],
    ],
    lighting: 'Proyecto lumínico basado en luz indirecta: tiras LED 2.700 K en fosas perimetrales del techo y balizas empotradas en el patio. Domótica KNX con escenas para cada momento del día.',
    sustain: 'Aerotermia con suelo radiante, ventilación cruzada natural gracias al patio y orientación sur con voladizos calculados para bloquear el sol de verano.',
    phases: [['Cimentación', 100], ['Estructura', 100], ['Fachada', 100], ['Instalaciones', 100], ['Acabados', 100]],
    team: [['Arquitectura', 'Ferrer + Soler Arquitectes'], ['Constructora', 'Obras Mediterráneo'], ['Paisajismo', 'Verde Lateral'], ['Iluminación', 'Estudio Penumbra']],
  },
  {
    id: 'hub-logistico-norte', title: 'Hub Logístico Norte: 40.000 m² de nave con cubierta solar', short: 'Hub Logístico Norte',
    cat: 'industrial', status: 'obra', city: 'Bogotá, Colombia', year: 2026, area: '40.000 m²', floors: 'Nave + entreplanta', budget: 'USD 31 M', progress: 48,
    owner: { name: 'LogiPark Inversiones', type: 'Fondo inmobiliario', initials: 'LP' },
    img: [2, 12, 17, 22, 7],
    summary: 'Centro de distribución de última generación con 62 muelles de carga, altura libre de 12 m y la mayor cubierta fotovoltaica de la región sobre una nave logística.',
    quote: ['La nave estará operativa en 14 meses gracias a la estructura prefabricada y al montaje en paralelo de cubierta e instalaciones.', 'Ing. Andrés Peña, gerente de proyecto'],
    terrain: 'Suelo de relleno heterogéneo hasta 4 m. Se aplicó mejora del terreno con columnas de grava vibradas y una solera de 22 cm reforzada con fibras de acero para soportar cargas de estanterías de 6 t/m².',
    terrainSpec: [['Mejora', 'Columnas de grava'], ['Solera', '22 cm con fibras'], ['Carga admisible', '6 t/m²']],
    materials: [
      ['Estructura', 'Pilares y vigas prefabricados de hormigón pretensado', 'Prefabricados Sabana'],
      ['Cubierta', 'Panel sándwich PIR 80 mm', 'Panelco'],
      ['Solera', 'Hormigón con fibras de acero 30 kg/m³', 'Concretos del Norte'],
      ['Fachada', 'Panel metálico microperfilado', 'Metalúrgica Andina'],
    ],
    equipment: [
      ['fa-truck-moving', 'Grúas autopropulsadas 220 t', 'Montaje de vigas de 30 m'],
      ['fa-road', 'Láser screed Somero S-22E', 'Planeidad FM2 en solera'],
      ['fa-solar-panel', 'Plataformas elevadoras 26 m', 'Montaje de cubierta solar'],
      ['fa-helmet-safety', 'Vibroflotador de columnas de grava', 'Mejora del terreno'],
    ],
    lighting: 'Luminarias LED de alta bahía 150 lm/W con sensores de presencia por pasillo y lucernarios policarbonato al 8 % de la cubierta, que permiten trabajar sin luz artificial gran parte del día.',
    sustain: 'Planta fotovoltaica de 3,2 MWp en cubierta, depósitos de pluviales de 600 m³ y objetivo de certificación LEED Gold.',
    phases: [['Movimiento de tierras', 100], ['Estructura', 70], ['Cubierta', 40], ['Instalaciones', 25], ['Urbanización', 5]],
    team: [['Arquitectura', 'Taller Industrial Arquitectura'], ['Ingeniería', 'Ingetec Estructuras'], ['Constructora', 'Constructora Meridiano'], ['Energía', 'Sol Andino Energía']],
  },
  {
    id: 'puente-rio-claro', title: 'Puente Río Claro: 180 m de vano atirantado', short: 'Puente Río Claro',
    cat: 'infraestructura', status: 'obra', city: 'Antioquia, Colombia', year: 2027, area: '180 m de vano', floors: 'Pilono de 72 m', budget: 'USD 46 M', progress: 35,
    owner: { name: 'Concesión Vías del Oriente', type: 'Concesionaria', initials: 'VO' },
    img: [20, 15, 24, 28, 31],
    summary: 'Puente atirantado de dos carriles por sentido que sustituye un paso existente con limitación de carga. Se construye por voladizos sucesivos desde un único pilono en forma de A.',
    quote: ['Cada dovela se ajusta con topografía de alta precisión: el margen de error al cierre del vano es de 2 cm.', 'Ing. Camilo Duarte, jefe de topografía'],
    terrain: 'Cimentación del pilono en roca sana a 26 m mediante 16 pilotes de 1,5 m de diámetro. Se realizaron ensayos de integridad cross-hole en todos los pilotes y un estudio hidráulico de socavación para la avenida de 500 años.',
    terrainSpec: [['Pilotes', '16 × Ø1,5 m'], ['Profundidad', '26 m en roca'], ['Estudio', 'Socavación 500 años']],
    materials: [
      ['Hormigón', 'HA-50 autocompactante en pilono', 'Argos'],
      ['Tirantes', '48 tirantes de cordones paralelos', 'VSL'],
      ['Tablero', 'Sección cajón de hormigón postensado', 'Postensa'],
      ['Apoyos', 'Neopreno zunchado y amortiguadores sísmicos', 'Maurer'],
    ],
    equipment: [
      ['fa-tower-cell', 'Encofrado trepante autoportante', 'Pilono de 72 m de altura'],
      ['fa-bridge', 'Carros de avance para voladizos', 'Dovelas de 5 m'],
      ['fa-satellite-dish', 'Estación total robótica + GNSS', 'Control geométrico continuo'],
    ],
    lighting: 'Iluminación funcional LED en calzada y proyectores ornamentales RGBW en el pilono, programables para eventos y con apagado nocturno para proteger la fauna del río.',
    sustain: 'Plan de manejo ambiental del cauce, reutilización del 70 % del material de excavación y monitorización estructural permanente con 120 sensores.',
    phases: [['Cimentación', 100], ['Pilono', 60], ['Tablero', 20], ['Tirantes', 5], ['Acabados', 0]],
    team: [['Diseño', 'Puentes & Estructuras Ingeniería'], ['Constructora', 'Consorcio Río Claro'], ['Interventoría', 'Supervisión Técnica Andina'], ['Geotecnia', 'GeoSuelos Consultores']],
  },
  {
    id: 'edificio-1928', title: 'Edificio 1928: rehabilitación integral de un inmueble patrimonial', short: 'Edificio 1928',
    cat: 'rehabilitacion', status: 'fin', city: 'Madrid, España', year: 2025, area: '3.200 m²', floors: '6 plantas', budget: '€ 5,4 M', progress: 100,
    owner: { name: 'Patrimonia Real Estate', type: 'Promotora', initials: 'PR' },
    img: [25, 29, 13, 23, 18],
    summary: 'Recuperación de un edificio de viviendas de 1928 con fachada protegida. Se mantuvo la piel original y se reconstruyó el interior con estructura de madera contralaminada, ganando una planta sin aumentar cargas.',
    quote: ['Rehabilitar ahorró el 68 % del carbono que habría supuesto demoler y construir de nuevo.', 'Arq. Lucía Martín, Estudio Palimpsesto'],
    terrain: 'Inspección de la cimentación existente de mampostería mediante catas y georradar. Se recalzaron dos medianeras con micropilotes y se reforzaron los muros de carga con inyecciones de cal hidráulica.',
    terrainSpec: [['Diagnóstico', 'Catas + georradar'], ['Recalce', 'Micropilotes Ø150'], ['Refuerzo', 'Inyección de cal']],
    materials: [
      ['Madera CLT', 'Forjados y núcleos de 5 capas', 'Egoin'],
      ['Morteros', 'Cal hidráulica natural NHL 3.5', 'Calcinor'],
      ['Carpintería', 'Réplica en madera de pino tratada con vidrio bajo emisivo', 'Carpintería Histórica'],
      ['Cubierta', 'Teja árabe recuperada + aislamiento de fibra de madera', 'Steico'],
    ],
    equipment: [
      ['fa-tower-cell', 'Grúa autodesplegable', 'Montaje de paneles CLT por patio'],
      ['fa-screwdriver-wrench', 'Micropilotadora compacta', 'Trabajo en sótano de 2,2 m'],
      ['fa-wind', 'Andamio con estabilizador de fachada', 'Fachada protegida'],
    ],
    lighting: 'Recuperación de las lámparas originales del portal con tecnología LED y un sistema de luz cálida 2.700 K que respeta molduras y artesonados restaurados.',
    sustain: 'Calificación energética A partiendo de G, bomba de calor centralizada y ventilación mecánica con recuperación de calor en todas las viviendas.',
    phases: [['Diagnóstico', 100], ['Refuerzo', 100], ['Estructura CLT', 100], ['Instalaciones', 100], ['Acabados', 100]],
    team: [['Arquitectura', 'Estudio Palimpsesto'], ['Restauración', 'Restaura Patrimonio'], ['Estructura', 'Madera Estructural Ingenieros'], ['Constructora', 'Rehabilitaciones Centro']],
  },
  {
    id: 'colegio-bosque', title: 'Colegio del Bosque: aulas de madera abiertas al paisaje', short: 'Colegio del Bosque',
    cat: 'equipamiento', status: 'dis', city: 'Santiago, Chile', year: 2027, area: '6.800 m²', floors: '2 plantas', budget: 'USD 9 M', progress: 15,
    owner: { name: 'Fundación Educar Futuro', type: 'Fundación', initials: 'EF' },
    img: [26, 32, 9, 14, 30],
    summary: 'Escuela para 900 alumnos con pabellones de madera conectados por patios cubiertos. Cada aula tiene salida directa al exterior y luz natural bilateral.',
    quote: ['Diseñamos para que el edificio enseñe: estructura vista, consumos visibles y huertos en cubierta.', 'Arq. Valentina Rojas, Taller Raíz'],
    terrain: 'Campaña geotécnica en curso. Los primeros sondeos indican gravas arenosas con buena capacidad portante; se prevé cimentación superficial con zapatas aisladas y análisis sísmico específico.',
    terrainSpec: [['Estado', 'Campaña en curso'], ['Suelo', 'Gravas arenosas'], ['Zona sísmica', 'Alta']],
    materials: [
      ['Madera laminada', 'Pórticos de pino radiata GL24h', 'Arauco'],
      ['CLT', 'Muros y forjados', 'Por definir'],
      ['Fachada', 'Listones de madera termotratada', 'Por definir'],
    ],
    equipment: [
      ['fa-tower-cell', 'Grúa móvil 60 t', 'Montaje de pórticos'],
      ['fa-cubes', 'Prefabricación en taller', 'Módulos de aula completos'],
    ],
    lighting: 'Estudio de luz natural con simulaciones anuales para garantizar 300 lux en el 80 % de las aulas sin iluminación artificial. Complemento LED regulable con temperatura de color dinámica.',
    sustain: 'Objetivo de edificio de energía casi nula: geotermia, fotovoltaica y madera certificada FSC como material principal.',
    phases: [['Anteproyecto', 100], ['Proyecto básico', 60], ['Proyecto ejecutivo', 10], ['Licitación', 0], ['Obra', 0]],
    team: [['Arquitectura', 'Taller Raíz'], ['Estructura', 'Ingeniería en Madera Sur'], ['Sostenibilidad', 'EcoConsulta']],
  },
  {
    id: 'oficinas-prisma', title: 'Oficinas Prisma: fachada de vidrio con lamas solares móviles', short: 'Oficinas Prisma',
    cat: 'comercial', status: 'fin', city: 'Ciudad de México, México', year: 2025, area: '12.600 m²', floors: '14 plantas', budget: 'USD 19 M', progress: 100,
    owner: { name: 'Prisma Corporativo', type: 'Promotora', initials: 'PC' },
    img: [10, 4, 35, 16, 21],
    summary: 'Edificio de oficinas de planta libre con una doble piel de vidrio y lamas de aluminio motorizadas que siguen el recorrido del sol, reduciendo un 35 % la carga de climatización.',
    quote: ['Las lamas se recolocan cada 15 minutos según la radiación medida en cubierta.', 'Ing. Sofía Navarro, ingeniería de fachadas'],
    terrain: 'Suelo lacustre de alta compresibilidad. Se diseñó una cimentación compensada con cajón de 3 sótanos y pilotes de fricción para controlar asentamientos diferenciales.',
    terrainSpec: [['Suelo', 'Lacustre blando'], ['Cimentación', 'Cajón compensado'], ['Pilotes', 'Fricción, 30 m']],
    materials: [
      ['Vidrio', 'Doble acristalamiento bajo emisivo con cámara de argón', 'Vitro'],
      ['Lamas', 'Aluminio extruido anodizado, motorizadas', 'Hunter Douglas'],
      ['Estructura', 'Hormigón postensado con losas de 30 cm', 'Cemex'],
      ['Pavimento', 'Suelo técnico registrable', 'Kingspan'],
    ],
    equipment: [
      ['fa-tower-cell', 'Grúa torre 12 t', 'Montaje de módulos de fachada'],
      ['fa-gears', 'Sistema BMS Siemens Desigo', 'Control de lamas y clima'],
      ['fa-elevator', 'Ascensores de alta velocidad', '6 cabinas a 4 m/s'],
    ],
    lighting: 'Iluminación de oficinas con luminarias lineales de bajo deslumbramiento (UGR<16) y control por estación de trabajo vía app. Fachada nocturna con iluminación rasante en las lamas.',
    sustain: 'Certificación LEED Platinum, recuperación de aguas grises para inodoros y cubierta verde de 800 m² accesible para los usuarios.',
    phases: [['Cimentación', 100], ['Estructura', 100], ['Fachada', 100], ['Instalaciones', 100], ['Acabados', 100]],
    team: [['Arquitectura', 'Prisma Arquitectura'], ['Fachadas', 'Envolvente Ingeniería'], ['Constructora', 'Grupo Constructor Azteca'], ['Iluminación', 'Lux Diseño']],
  },
  {
    id: 'ecobarrio-la-huerta', title: 'Ecobarrio La Huerta: 120 viviendas pasivas en madera', short: 'Ecobarrio La Huerta',
    cat: 'sostenible', status: 'obra', city: 'Lima, Perú', year: 2026, area: '14.200 m²', floors: '4 bloques de 5 plantas', budget: 'USD 15 M', progress: 52,
    owner: { name: 'Cooperativa Habitar Verde', type: 'Cooperativa', initials: 'HV' },
    img: [27, 33, 39, 36, 34],
    summary: 'Conjunto de vivienda cooperativa con estándar Passivhaus, estructura de madera y huertos comunitarios. El consumo energético previsto es un 85 % inferior a una promoción convencional.',
    quote: ['La estanqueidad se ensaya vivienda por vivienda: 0,6 renovaciones/hora o se repite.', 'Ing. Diego Salas, consultor Passivhaus'],
    terrain: 'Suelo granular denso apto para cimentación superficial. El estudio incluyó análisis de licuefacción y se proyectaron zapatas combinadas con vigas de atado sísmico.',
    terrainSpec: [['Suelo', 'Grava densa'], ['Cimentación', 'Zapatas combinadas'], ['Análisis', 'Licuefacción OK']],
    materials: [
      ['Madera', 'Entramado ligero + forjados CLT', 'Maderas del Pacífico'],
      ['Aislamiento', 'Fibra de madera 200 mm', 'Gutex'],
      ['Ventanas', 'Triple vidrio con marco de madera-aluminio', 'Internorm'],
      ['Membranas', 'Barrera de vapor inteligente', 'Pro Clima'],
    ],
    equipment: [
      ['fa-wind', 'Equipo Blower Door', 'Ensayos de estanqueidad'],
      ['fa-cubes', 'Paneles prefabricados en taller', 'Montaje de una planta por semana'],
      ['fa-tower-cell', 'Grúa móvil 50 t', 'Izado de paneles'],
    ],
    lighting: 'Luz natural optimizada con ventanas de gran formato al norte y protección solar fija. LED 3.000 K de bajo consumo en zonas comunes con temporizador astronómico.',
    sustain: 'Ventilación con recuperación de calor del 90 %, fotovoltaica comunitaria y compostaje para los huertos del patio central.',
    phases: [['Cimentación', 100], ['Estructura', 75], ['Envolvente', 50], ['Instalaciones', 30], ['Urbanización', 10]],
    team: [['Arquitectura', 'Colectivo Habitar'], ['Passivhaus', 'Energía Pasiva Consultores'], ['Constructora', 'Madera Viva Construcciones'], ['Paisajismo', 'Huerta Urbana Lab']],
  },
  {
    id: 'loft-taller', title: 'Loft Taller: interiorismo industrial en una antigua imprenta', short: 'Loft Taller',
    cat: 'interiorismo', status: 'fin', city: 'Barcelona, España', year: 2025, area: '380 m²', floors: 'Doble altura', budget: '€ 410 K', progress: 100,
    owner: { name: 'Estudio Nómada', type: 'Estudio de diseño', initials: 'EN' },
    img: [3, 8, 23, 13, 18],
    summary: 'Transformación de una imprenta de 1950 en vivienda-taller. Se conservaron cerchas metálicas, ladrillo y pavimento hidráulico, y se insertó una caja de madera que contiene dormitorios y baños.',
    quote: ['La caja de madera es un mueble a escala arquitectónica: ordena sin tocar la nave original.', 'Interiorista Clara Vidal'],
    terrain: 'Sin intervención en cimentación. Se realizó un estudio de cargas del forjado existente y se reforzó con perfiles metálicos para soportar la nueva entreplanta.',
    terrainSpec: [['Intervención', 'Refuerzo de forjado'], ['Carga añadida', '250 kg/m²'], ['Estructura', 'Cerchas originales']],
    materials: [
      ['Madera', 'Tablero de abedul contrachapado', 'Garnica'],
      ['Acero', 'Pletinas y escalera de acero negro', 'Taller Ferro'],
      ['Pavimento', 'Hidráulico original restaurado', 'Mosaics Martí'],
      ['Textiles', 'Cortinas acústicas de lino', 'Kvadrat'],
    ],
    equipment: [
      ['fa-cubes', 'CNC de 5 ejes', 'Mecanizado de la caja de madera'],
      ['fa-screwdriver-wrench', 'Andamio rodante', 'Trabajos en doble altura'],
    ],
    lighting: 'Carriles electrificados con proyectores orientables para el taller y lámparas colgantes de gran formato en la zona social. Todo regulable para pasar de espacio de trabajo a vivienda.',
    sustain: 'Reutilización del 90 % de la estructura y materiales existentes; carpintería de madera certificada PEFC.',
    phases: [['Proyecto', 100], ['Refuerzo', 100], ['Carpintería', 100], ['Instalaciones', 100], ['Acabados', 100]],
    team: [['Interiorismo', 'Estudio Nómada'], ['Carpintería', 'Fusta Lab'], ['Iluminación', 'Llum Studio']],
  },
];
BM.byId = id => BM.PROJECTS.find(p => p.id === id);
BM.catName = id => (BM.CATS.find(c => c.id === id) || {}).name || id;

/* ---------- Más proyectos de muestra ----------
   Reutilizan la ficha técnica de un proyecto base del mismo sector
   (solo para la maqueta) y cambian nombre, ciudad, promotor e imágenes. */
[
  ['residencial-mirador', 'Residencial Mirador: 64 viviendas con terrazas escalonadas', 'Residencial Mirador', 'residencial', 'obra', 'Cali, Colombia', 2026, '7.900 m²', 'Constructora Pacífico', 'Constructora', [21, 16, 6], 'torre-alameda'],
  ['casa-roca', 'Casa Roca: vivienda de piedra y vidrio frente al mar', 'Casa Roca', 'residencial', 'fin', 'Cartagena, Colombia', 2025, '510 m²', 'Familia Duarte', 'Propietario particular', [11, 26, 1], 'casa-patio-lomas'],
  ['centro-comercial-nogal', 'Centro Nogal: retail de baja altura con cubierta de madera', 'Centro Nogal', 'comercial', 'obra', 'Quito, Ecuador', 2026, '22.000 m²', 'Nogal Desarrollos', 'Promotora', [35, 4, 10], 'oficinas-prisma'],
  ['coworking-fabrica', 'La Fábrica: coworking en una antigua textil', 'La Fábrica', 'comercial', 'fin', 'Buenos Aires, Argentina', 2025, '3.400 m²', 'Espacios Urbanos SA', 'Promotora', [23, 18, 13], 'oficinas-prisma'],
  ['planta-agroindustrial', 'Planta Agroindustrial del Sur: proceso y frío en una sola nave', 'Planta del Sur', 'industrial', 'dis', 'Arequipa, Perú', 2027, '15.600 m²', 'AgroSur Holding', 'Empresa privada', [12, 22, 7], 'hub-logistico-norte'],
  ['tunel-cordillera', 'Túnel La Cordillera: 3,2 km bajo la montaña', 'Túnel La Cordillera', 'infraestructura', 'obra', 'Caldas, Colombia', 2027, '3,2 km', 'Concesión Andina Centro', 'Concesionaria', [28, 31, 24], 'puente-rio-claro'],
  ['estacion-intermodal', 'Estación Intermodal Norte: tren, bus y bici en un solo edificio', 'Estación Intermodal', 'infraestructura', 'dis', 'Monterrey, México', 2028, '28.000 m²', 'Gobierno de Nuevo León', 'Entidad pública', [15, 20, 5], 'puente-rio-claro'],
  ['mercado-central', 'Mercado Central: restauración de una nave de hierro de 1910', 'Mercado Central', 'rehabilitacion', 'obra', 'Sevilla, España', 2026, '4.100 m²', 'Ayuntamiento de Sevilla', 'Entidad pública', [29, 25, 13], 'edificio-1928'],
  ['hospital-valle', 'Hospital del Valle: ampliación con 120 camas modulares', 'Hospital del Valle', 'equipamiento', 'obra', 'Pereira, Colombia', 2026, '11.500 m²', 'Red de Salud del Valle', 'Entidad pública', [32, 9, 30], 'colegio-bosque'],
  ['biblioteca-parque', 'Biblioteca Parque: lectura bajo una cubierta verde', 'Biblioteca Parque', 'equipamiento', 'fin', 'Montevideo, Uruguay', 2025, '2.900 m²', 'Intendencia de Montevideo', 'Entidad pública', [14, 26, 9], 'colegio-bosque'],
  ['torre-madera', 'Torre Pino: 12 plantas de madera maciza', 'Torre Pino', 'sostenible', 'dis', 'Concepción, Chile', 2027, '9.800 m²', 'Bosque Vivo Inmobiliaria', 'Promotora', [39, 33, 27], 'ecobarrio-la-huerta'],
  ['hotel-boutique', 'Hotel Aljibe: interiorismo artesanal en un patio colonial', 'Hotel Aljibe', 'interiorismo', 'fin', 'Oaxaca, México', 2025, '1.600 m²', 'Grupo Hotelero Aljibe', 'Empresa privada', [8, 3, 18], 'loft-taller'],
].forEach(([id, title, short, cat, status, city, year, area, owner, type, img, base]) => {
  const b = BM.byId(base);
  BM.PROJECTS.push({ ...b, id, title, short, cat, status, city, year, area,
    owner: { name: owner, type, initials: owner.split(' ').filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join('').toUpperCase() },
    img: [...img, ...b.img.slice(3)],
    progress: status === 'fin' ? 100 : status === 'dis' ? 12 : b.progress });
});

/* Fecha de publicación (más reciente primero) */
BM.PROJECTS.forEach((p, i) => { const d = new Date(2026, 9, 18); d.setDate(d.getDate() - i * 4 - (i % 3)); p.pub = d; });
BM.PROJECTS_BY_DATE = [...BM.PROJECTS].sort((a, b) => b.pub - a.pub);

/* Color de acento por sector */
BM.CAT_COLOR = { residencial: '#10A8E8', comercial: '#8b5cf6', industrial: '#f59e0b', infraestructura: '#ef6b4a', rehabilitacion: '#c2853d', equipamiento: '#22b573', sostenible: '#14b8a6', interiorismo: '#e0559b' };
