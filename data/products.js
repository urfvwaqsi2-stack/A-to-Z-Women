const COLORS = [
  { id: 'rani', name: 'Rani Pink Silk', hex: '#D9266B', sheen: '#FF99C8', aura: 'rgba(217, 38, 107, 0.24)' },
  { id: 'maroon', name: 'Shahi Maroon', hex: '#8E1632', sheen: '#F48FA3', aura: 'rgba(142, 22, 50, 0.24)' },
  { id: 'mehndi', name: 'Mehndi Emerald', hex: '#148F6E', sheen: '#9BF0D6', aura: 'rgba(20, 143, 110, 0.22)' },
  { id: 'ferozi', name: 'Ferozi Turquoise', hex: '#0891B2', sheen: '#99F6E4', aura: 'rgba(8, 145, 178, 0.22)' },
  { id: 'jamun', name: 'Jamun Orchid', hex: '#7E22CE', sheen: '#E9D5FF', aura: 'rgba(126, 34, 206, 0.22)' },
  { id: 'haldi', name: 'Marigold Gold', hex: '#F49D60', sheen: '#FFE3C6', aura: 'rgba(244, 157, 96, 0.24)' },
  { id: 'sapphire', name: 'Neelam Sapphire', hex: '#2563EB', sheen: '#A5C8FF', aura: 'rgba(37, 99, 235, 0.22)' },
  { id: 'ivory', name: 'Nikkah Ivory', hex: '#F3ECE2', sheen: '#FFFFFF', aura: 'rgba(224, 186, 115, 0.24)' }
];

const FABRICS = [
  {
    id: 'mulberry-silk',
    name: 'Pure Katan Silk',
    shortName: 'Katan Silk',
    description: 'Luminous liquid drape crafted for bridal & evening luxury.',
    roughness: 0.22,
    metalness: 0.06,
    sheen: 1.0,
    sheenRoughness: 0.25,
    iridescence: 0.42,
    transmission: 0.0,
    opacity: 1.0,
    pattern: 'silk'
  },
  {
    id: 'chantilly-lace',
    name: 'Zardozi & Chantilly Lace',
    shortName: 'Bridal Lace',
    description: 'Delicate floral lattice weave with scalloped edges.',
    roughness: 0.54,
    metalness: 0.02,
    sheen: 0.65,
    sheenRoughness: 0.55,
    iridescence: 0.15,
    transmission: 0.08,
    opacity: 0.94,
    pattern: 'lace'
  },
  {
    id: 'micro-modal',
    name: 'Breathable Cotton-Modal',
    shortName: 'Summer Modal',
    description: 'Featherweight cooling knit engineered for Pakistani summers.',
    roughness: 0.64,
    metalness: 0.0,
    sheen: 0.42,
    sheenRoughness: 0.68,
    iridescence: 0.05,
    transmission: 0.0,
    opacity: 1.0,
    pattern: 'rib'
  },
  {
    id: 'sheer-tulle',
    name: 'Sheer Organza Tulle',
    shortName: 'Organza Tulle',
    description: 'Ultra-fine breathable mesh engineered for weightless lift.',
    roughness: 0.38,
    metalness: 0.04,
    sheen: 0.85,
    sheenRoughness: 0.35,
    iridescence: 0.32,
    transmission: 0.32,
    opacity: 0.8,
    pattern: 'mesh'
  }
];

const HARDWARE_FINISHES = [
  { id: 'champagne-gold', name: 'Antique Gold', hex: '#E0BA73' },
  { id: 'rose-gold', name: 'Rose Copper Gold', hex: '#E39784' },
  { id: 'matte-onyx', name: 'Matte Surma Black', hex: '#262426' }
];

const PRODUCTS = [
  {
    id: 'mehreen-bridal-set',
    name: 'Bridal Jahez Lace Set (Mehreen)',
    subtitle: 'Shahi maroon Chantilly lace balconette & matching panty',
    category: 'sets',
    price: 11800,
    badge: 'Bridal Set',
    image: '/images/mehreen-bridal.jpg',
    modelType: 'balconette-set',
    defaultColor: 'maroon',
    defaultFabric: 'chantilly-lace',
    defaultHardware: 'champagne-gold',
    sizes: ['32B / S', '32C / S', '34B / M', '34C / M', '34D / M', '36C / L', '36D / L'],
    rating: 4.97,
    reviewCount: 284,
    relatedIds: ['zardozi-bridal-lehenga', 'rani-nighty-robe-set', 'bridal-pearl-heels', 'bridal-velvet-potli'],
    description:
      'Flagship Pakistani bridal trousseau (Jahez) balconette bra and matching panty set in deep Shahi Maroon floral lace with breathable cotton gusset.',
    details: [
      'Cushioned flex-channel lift with soft plush lining',
      'Scalloped Chantilly lace & antique gold hardware',
      '100% breathable cotton inner gusset',
      'Complimentary velvet Jahez keepsake box'
    ],
    fitNote: 'True to size with 4-row back hook extension.'
  },
  {
    id: 'zardozi-bridal-lehenga',
    name: 'Bridal Zardozi Lehenga Choli',
    subtitle: 'Hand-embellished Shahi Maroon Baraat bridal dress',
    category: 'bridal-clothes',
    price: 68500,
    badge: 'Bridal Dress',
    image: '/images/bridal-lehenga.jpg',
    modelType: 'bridal-lehenga',
    defaultColor: 'maroon',
    defaultFabric: 'mulberry-silk',
    defaultHardware: 'champagne-gold',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'Custom Fit'],
    rating: 4.99,
    reviewCount: 146,
    relatedIds: ['mehndi-emerald-sharara', 'bridal-zardozi-khussa', 'bridal-pearl-heels', 'bridal-velvet-potli'],
    description:
      'Regal Pakistani Baraat lehenga choli crafted on pure raw silk with heavy antique-gold tilla, dabka, and sequin borders plus a sheer organza bridal dupatta.',
    details: [
      'Pure Katan raw silk 16-panel flared lehenga',
      'Hand-worked antique gold zardozi & gota hem border',
      'Includes matching embroidered choli & 3-yard bridal dupatta',
      'Bespoke tailoring available across Lahore, Karachi & Islamabad'
    ],
    fitNote: 'Tailored to standard Pakistani sizing or custom bridal measurements.'
  },
  {
    id: 'mehndi-emerald-sharara',
    name: 'Mehndi Emerald Sharara Suit',
    subtitle: 'Festive gota & mirror-work gharara with organza dupatta',
    category: 'bridal-clothes',
    price: 34500,
    badge: 'Mehndi Edit',
    image: '/images/mehndi-sharara.svg',
    preferLive3d: true,
    modelType: 'kurta-sharara',
    defaultColor: 'mehndi',
    defaultFabric: 'mulberry-silk',
    defaultHardware: 'champagne-gold',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    rating: 4.96,
    reviewCount: 112,
    relatedIds: ['zardozi-bridal-lehenga', 'bridal-zardozi-khussa', 'bridal-velvet-potli', 'valerie-contour-bodysuit'],
    description:
      'Vibrant Mehndi Emerald embroidered short kurta paired with flowing pleated sharara trousers and shimmering marigold gota trim.',
    details: [
      'Breathable pure silk kurta with gota kinari neckline',
      'Extra-flared pleated sharara for effortless dance movement',
      'Lightweight organza dupatta with scalloped gold edge',
      'Includes inner silk slip lining'
    ],
    fitNote: 'Relaxed festive drape; select your normal kurta size.'
  },
  {
    id: 'rani-nighty-robe-set',
    name: 'Rani Silk Nighty & Robe Set',
    subtitle: '2-piece bridal silk nighty slip with lace-trimmed robe',
    category: 'nighties',
    price: 9400,
    badge: 'Nighty Set',
    image: '/images/bridal-nighty-robe.jpg',
    modelType: 'nighty-robe',
    defaultColor: 'rani',
    defaultFabric: 'mulberry-silk',
    defaultHardware: 'champagne-gold',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    rating: 4.95,
    reviewCount: 238,
    relatedIds: ['noor-nikkah-chemise', 'solene-botanical-slip', 'mehreen-bridal-set', 'lace-hipster-panty-trio'],
    description:
      'A luxurious 2-piece nighty and matching belted bridal robe in luminous Rani Pink silk with delicate French lace cuffs.',
    details: [
      'Includes bias-cut silk nighty + long open-front robe',
      'Detachable silk waist tie sash',
      'Adjustable golden strap sliders',
      'Packed in discreet satin gift box'
    ],
    fitNote: 'Fluid comfortable fit for bridal nights and relaxed lounging.'
  },
  {
    id: 'noor-nikkah-chemise',
    name: 'Nikkah Ivory Silk Nighty',
    subtitle: 'Pearl ivory & antique gold lace bridal nightgown',
    category: 'nighties',
    price: 12500,
    badge: 'Nikkah Nighty',
    image: '/images/noor-chemise.jpg',
    modelType: 'silk-slip',
    defaultColor: 'ivory',
    defaultFabric: 'mulberry-silk',
    defaultHardware: 'champagne-gold',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    rating: 4.98,
    reviewCount: 194,
    relatedIds: ['rani-nighty-robe-set', 'solene-botanical-slip', 'mehreen-bridal-set', 'bridal-pearl-heels'],
    description:
      'Luminous Nikkah-ivory bias-cut pure silk nighty kissed with delicate lace and golden rouleau straps.',
    details: [
      'True 45° bias-cut pure Katan silk drape',
      'French-seamed soft neckline',
      'Adjustable golden strap sliders',
      'Gift-wrapped in satin ribbon box'
    ],
    fitNote: 'Fluid skim drape; choose your regular size.'
  },
  {
    id: 'solene-botanical-slip',
    name: 'Sapphire Satin Sleep Nighty',
    subtitle: 'Cool midnight blue pure silk nightdress',
    category: 'nighties',
    price: 8800,
    badge: 'Nighty',
    image: '/images/solene-slip.jpg',
    modelType: 'silk-slip',
    defaultColor: 'sapphire',
    defaultFabric: 'mulberry-silk',
    defaultHardware: 'champagne-gold',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    rating: 4.94,
    reviewCount: 142,
    relatedIds: ['rani-nighty-robe-set', 'noor-nikkah-chemise', 'lace-hipster-panty-trio', 'haya-cotton-bralette'],
    description:
      'Jewel-toned Neelam Sapphire silk nighty engineered to keep skin cool and comfortable all night.',
    details: [
      'Thermoregulating mulberry silk charmeuse',
      'Hand-rolled bias hem',
      'Includes silk travel pouch',
      'Discreet COD shipping'
    ],
    fitNote: 'Relaxed silhouette; order your usual size.'
  },
  {
    id: 'haya-cotton-bralette',
    name: 'Everyday Cotton-Modal Bra (Haya)',
    subtitle: 'Cooling wire-free bra invisible under lawn kurtas',
    category: 'bras',
    price: 4600,
    badge: 'Everyday Bra',
    image: '/images/celeste-bralette.jpg',
    modelType: 'bralette',
    defaultColor: 'rani',
    defaultFabric: 'micro-modal',
    defaultHardware: 'champagne-gold',
    sizes: ['30A', '30B', '32A', '32B', '32C', '34B', '34C', '34D', '36C', '36D', '38C'],
    rating: 4.92,
    reviewCount: 412,
    relatedIds: ['ayesha-ferozi-bra', 'zoya-organza-bra', 'lace-hipster-panty-trio', 'sana-high-waist-brief'],
    description:
      'Designed for daily wear under Pakistani lawn and chiffon—wire-free, breathable moisture-wicking modal, and smooth edges.',
    details: [
      'Cooling beechwood cotton-modal blend',
      'Seamless flat-lock edges invisible under fitted shirts',
      'Wide soft underband prevents rolling',
      'Discreet unmarked parcel delivery'
    ],
    fitNote: 'True to size. Flexible cups adapt smoothly.'
  },
  {
    id: 'ayesha-ferozi-bra',
    name: 'Ferozi Full-Coverage Bra (Ayesha)',
    subtitle: 'Breathable padded-free support with side smoothing',
    category: 'bras',
    price: 4900,
    badge: 'Full Coverage',
    image: '/images/ayesha-ferozi.jpg',
    modelType: 'demi-bra',
    defaultColor: 'ferozi',
    defaultFabric: 'micro-modal',
    defaultHardware: 'champagne-gold',
    sizes: ['32B', '32C', '32D', '34B', '34C', '34D', '36C', '36D', '38C', '38D'],
    rating: 4.9,
    reviewCount: 239,
    relatedIds: ['haya-cotton-bralette', 'zoya-organza-bra', 'sana-high-waist-brief', 'lace-hipster-panty-trio'],
    description:
      'Smooth full-coverage bra with side-smoothing wings and breathable perforated lining for all-day posture support.',
    details: [
      'Breathable inner cup lining',
      'Non-slip padded shoulder straps',
      'High side wings for smooth silhouette',
      'Nickel-free antique gold clasps'
    ],
    fitNote: 'Ideal for medium to fuller busts.'
  },
  {
    id: 'zoya-organza-bra',
    name: 'Sheer Organza Demi Bra (Zoya)',
    subtitle: 'Weightless unlined lift in Marigold Peach',
    category: 'bras',
    price: 5400,
    badge: 'Demi Bra',
    image: '/images/margaux-demi.jpg',
    modelType: 'demi-bra',
    defaultColor: 'haldi',
    defaultFabric: 'sheer-tulle',
    defaultHardware: 'rose-gold',
    sizes: ['30B', '30C', '32B', '32C', '32D', '34B', '34C', '34D', '36C', '36D'],
    rating: 4.88,
    reviewCount: 165,
    relatedIds: ['haya-cotton-bralette', 'ayesha-ferozi-bra', 'gulabi-bridal-duo', 'lace-hipster-panty-trio'],
    description:
      'Airy 3-part organza tulle seaming shapes and lifts naturally without heavy foam padding.',
    details: [
      '3-part darted cups for natural lift',
      'Double-layer French tulle mesh',
      'Satin-wrapped soft elastic underband',
      'Rose copper-gold hardware'
    ],
    fitNote: 'True to size.'
  },
  {
    id: 'lace-hipster-panty-trio',
    name: 'Silk & Lace Hipster Panty (Set of 3)',
    subtitle: 'Breathable everyday & bridal low-rise panties',
    category: 'briefs',
    price: 3600,
    badge: 'Panty Pack',
    image: '/images/lace-panty-pack.jpg',
    modelType: 'lace-panty',
    defaultColor: 'rani',
    defaultFabric: 'chantilly-lace',
    defaultHardware: 'champagne-gold',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    rating: 4.94,
    reviewCount: 389,
    relatedIds: ['sana-high-waist-brief', 'haya-cotton-bralette', 'mehreen-bridal-set', 'rani-nighty-robe-set'],
    description:
      'Three ultra-soft silk & Chantilly lace hipster panties with 100% organic cotton lining and zero-dig scalloped waistbands.',
    details: [
      'Pack of 3 complementary jewel & blush shades',
      'Soft stretch Chantilly lace waist trim',
      '100% pure organic cotton gusset',
      'Zero visible panty lines under fitted trousers'
    ],
    fitNote: 'True to size; gentle mid-low rise fit.'
  },
  {
    id: 'sana-high-waist-brief',
    name: 'High-Waist Sculpt Panty (Sana)',
    subtitle: 'Tummy-smoothing no-line modal brief in Jamun Orchid',
    category: 'briefs',
    price: 2850,
    badge: 'Sculpt Panty',
    image: '/images/noemi-brief.jpg',
    modelType: 'high-waist-brief',
    defaultColor: 'jamun',
    defaultFabric: 'micro-modal',
    defaultHardware: 'champagne-gold',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    rating: 4.89,
    reviewCount: 367,
    relatedIds: ['lace-hipster-panty-trio', 'valerie-contour-bodysuit', 'ayesha-ferozi-bra', 'haya-cotton-bralette'],
    description:
      'High-waisted gentle smoothing brief engineered to vanish beneath silk shararas, trousers, and bridal dresses.',
    details: [
      'Laser-cut seamless leg openings',
      'Stay-put waistband never rolls down',
      'Cooling summer modal fabric',
      '100% cotton hygienic lining'
    ],
    fitNote: 'True to size with gentle mid-waist smoothing.'
  },
  {
    id: 'gulabi-bridal-duo',
    name: 'Gulabi Coral Trousseau Bra & Panty',
    subtitle: 'Festive coral lace demi-cup set with rose-gold accents',
    category: 'sets',
    price: 9800,
    badge: 'Trousseau Set',
    image: '/images/aurelia-set.jpg',
    modelType: 'balconette-set',
    defaultColor: 'haldi',
    defaultFabric: 'chantilly-lace',
    defaultHardware: 'rose-gold',
    sizes: ['32B / S', '32C / S', '34B / M', '34C / M', '34D / M', '36C / L', '36D / L'],
    rating: 4.95,
    reviewCount: 188,
    relatedIds: ['mehreen-bridal-set', 'rani-nighty-robe-set', 'zoya-organza-bra', 'bridal-pearl-heels'],
    description:
      'Sunlit coral-peach tones paired with rose-copper hardware and intricate floral lace for Mehndi & Mayon trousseau gifting.',
    details: [
      'Scalloped floral lace trim',
      'Rose-gold swan hook & adjustable straps',
      'Organic cotton inner gusset',
      'Includes silk potli wash pouch'
    ],
    fitNote: 'Structured demi lift.'
  },
  {
    id: 'valerie-contour-bodysuit',
    name: 'Emerald Plunge Bridal Bodysuit',
    subtitle: 'Sculpting sheer organza & silk bodysuit',
    category: 'bodysuits',
    price: 8900,
    badge: 'Bodysuit',
    image: '/images/valerie-bodysuit.jpg',
    modelType: 'bodysuit',
    defaultColor: 'mehndi',
    defaultFabric: 'sheer-tulle',
    defaultHardware: 'champagne-gold',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    rating: 4.93,
    reviewCount: 121,
    relatedIds: ['mehndi-emerald-sharara', 'sana-high-waist-brief', 'mehreen-bridal-set', 'bridal-velvet-potli'],
    description:
      'Architectural plunge sculpting in Mehndi Emerald tulle—wearable beneath wedding ensembles or styled with blazers.',
    details: [
      'Convertible cross-back & straight straps',
      'Zoned waist-contouring breathable mesh',
      'Easy 3-snap cotton gusset',
      'Seamless brief back'
    ],
    fitNote: 'Adjustable strap length for petite and tall silhouettes.'
  },
  {
    id: 'bridal-pearl-heels',
    name: 'Champagne Pearl Bridal Sandals',
    subtitle: 'Embellished block-heel wedding sandals & scandel',
    category: 'footwear',
    price: 7800,
    badge: 'Heel Sandals',
    image: '/images/heels-sandals.svg',
    preferLive3d: true,
    modelType: 'bridal-sandal',
    defaultColor: 'haldi',
    defaultFabric: 'mulberry-silk',
    defaultHardware: 'champagne-gold',
    sizes: ['36 / 6', '37 / 7', '38 / 8', '39 / 9', '40 / 10', '41 / 11'],
    rating: 4.96,
    reviewCount: 274,
    relatedIds: ['bridal-zardozi-khussa', 'zardozi-bridal-lehenga', 'bridal-velvet-potli', 'mehreen-bridal-set'],
    description:
      'Cushioned champagne-gold bridal block-heel sandals hand-adorned with lustrous pearls and crystal ankle straps—comfortable enough for an entire Baraat or Walima.',
    details: [
      'Memory-foam cushioned velvet footbed',
      '3-inch stable sculpted gold block heel',
      'Hand-stitched pearl & crystal toe strap',
      'Anti-slip rubberized sole'
    ],
    fitNote: 'True to European/Pakistani footwear sizes (36–41).'
  },
  {
    id: 'bridal-zardozi-khussa',
    name: 'Shahi Zardozi Bridal Khussa Shoes',
    subtitle: 'Handcrafted Pakistani tilla & pearl flat bridal shoes',
    category: 'footwear',
    price: 5200,
    badge: 'Bridal Khussa',
    image: '/images/bridal-khussa.svg',
    preferLive3d: true,
    modelType: 'bridal-khussa',
    defaultColor: 'maroon',
    defaultFabric: 'chantilly-lace',
    defaultHardware: 'champagne-gold',
    sizes: ['36 / 6', '37 / 7', '38 / 8', '39 / 9', '40 / 10', '41 / 11'],
    rating: 4.97,
    reviewCount: 319,
    relatedIds: ['bridal-pearl-heels', 'zardozi-bridal-lehenga', 'mehndi-emerald-sharara', 'bridal-velvet-potli'],
    description:
      'Authentic handmade Multani & Lahori Zardozi khussas featuring rich Shahi Maroon velvet, antique gold dabka embroidery, and soft double-padded leather soles.',
    details: [
      'Double-cushioned bite-free inner lining',
      'Genuine handcrafted tilla & pearl embroidery',
      'Curved traditional bridal khussa toe',
      'Durable stitched sole for indoor & outdoor venues'
    ],
    fitNote: 'Soft-stretch leather lining molds gently to your foot.'
  },
  {
    id: 'bridal-velvet-potli',
    name: 'Emerald Velvet Potli & Kundan Set',
    subtitle: 'Embroidered bridal clutch bag with pearl handle & jhumkas',
    category: 'accessories',
    price: 6400,
    badge: 'Potli & Jewelry',
    image: '/images/bridal-potli-jewelry.svg',
    preferLive3d: true,
    modelType: 'bridal-potli',
    defaultColor: 'mehndi',
    defaultFabric: 'mulberry-silk',
    defaultHardware: 'champagne-gold',
    sizes: ['One Size (With Jhumkas)', 'Potli Bag Only'],
    rating: 4.95,
    reviewCount: 158,
    relatedIds: ['mehndi-emerald-sharara', 'zardozi-bridal-lehenga', 'bridal-pearl-heels', 'bridal-zardozi-khussa'],
    description:
      'Plush emerald velvet drawstring Potli bag embellished with zardozi florals, beaded pearl wrist handle, gold tassels, and matching Kundan pearl jhumkas.',
    details: [
      'Fits smartphone, lipstick, compact & bridal essentials',
      'Hand-beaded pearl carry handle',
      'Antique gold drawstring tassels',
      'Includes matching Kundan jhumka earrings'
    ],
    fitNote: 'Compact handheld bridal clutch with secure drawstring.'
  },
  {
    id: 'zara-satin-blazer-coord',
    name: 'Zara-Inspired Satin Blazer Co-ord',
    subtitle: 'Tailored contemporary blazer & wide-leg trouser suit',
    category: 'clothes',
    price: 16500,
    badge: 'Zara Style Pret',
    image: '/images/zara-blazer.svg',
    preferLive3d: true,
    modelType: 'blazer-coord',
    defaultColor: 'rani',
    defaultFabric: 'mulberry-silk',
    defaultHardware: 'champagne-gold',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    rating: 4.95,
    reviewCount: 204,
    relatedIds: ['j-chikankari-lawn-suit', 'pointed-kitten-mules', 'zarqa-musk-perfume', 'kashmiri-pashmina-shawl'],
    description:
      'Effortless European-cut tailored satin blazer paired with flowing wide-leg trousers—ideal for dinners, office power-dressing, and formal evenings.',
    details: [
      'Structured notched lapels with gold accent buttons',
      'Luminous fluid satin drape',
      'High-waisted wide-leg trouser silhouette',
      'Breathable inner satin lining'
    ],
    fitNote: 'Tailored relaxed Zara-style cut; choose your usual size.'
  },
  {
    id: 'j-chikankari-lawn-suit',
    name: 'J.-Inspired Embroidered Lawn 3-Piece',
    subtitle: 'Pakistani Chikankari kurta, trouser & chiffon dupatta',
    category: 'clothes',
    price: 9600,
    badge: 'J. Style Pret',
    image: '/images/lawn-suit.svg',
    preferLive3d: true,
    modelType: 'kurta-sharara',
    defaultColor: 'ferozi',
    defaultFabric: 'micro-modal',
    defaultHardware: 'champagne-gold',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    rating: 4.94,
    reviewCount: 318,
    relatedIds: ['zara-satin-blazer-coord', 'kashmiri-pashmina-shawl', 'noor-oud-perfume', 'haya-cotton-bralette'],
    description:
      'Signature Pakistani 3-piece unstitched-finish stitched pret suit featuring airy floral Chikankari kurta, straight cambric trousers, and breezy crinkled chiffon dupatta.',
    details: [
      '100% Swiss voile & cooling summer lawn',
      'Fine tonal Chikankari embroidery along front & cuffs',
      'Includes matching dyed trouser & printed chiffon dupatta',
      'Pre-shrunk & colorfast botanical dyes'
    ],
    fitNote: 'Classic Pakistani relaxed kurta fit.'
  },
  {
    id: 'kashmiri-pashmina-shawl',
    name: 'Kashmiri Pashmina Zari Shawl',
    subtitle: 'Ultra-soft winter wool shawl with antique gold pallu',
    category: 'shawls',
    price: 8500,
    badge: 'Winter Shawl',
    image: '/images/kashmiri-shawl.svg',
    preferLive3d: true,
    modelType: 'shawl-drape',
    defaultColor: 'ivory',
    defaultFabric: 'mulberry-silk',
    defaultHardware: 'champagne-gold',
    sizes: ['Full Size (40" x 88")'],
    rating: 4.97,
    reviewCount: 263,
    relatedIds: ['shahi-velvet-shawl', 'j-chikankari-lawn-suit', 'zara-satin-blazer-coord', 'noor-oud-perfume'],
    description:
      'Feather-soft woven Pashmina shawl finished with classic Kashmiri jamawar border motifs and hand-knotted fringes—pairs seamlessly with lawn, khaddar, or formal pret.',
    details: [
      'Generous 40" x 88" winter wrap dimensions',
      'Soft breathable wool-silk blend',
      'Traditional antique gold zari pallu border',
      'Arrives in keepsake cedar-scented gift sleeve'
    ],
    fitNote: 'Free size generous full-length drape.'
  },
  {
    id: 'shahi-velvet-shawl',
    name: 'Shahi Velvet Zardozi Shawl',
    subtitle: 'Plush winter bridal & festive micro-velvet wrap',
    category: 'shawls',
    price: 11400,
    badge: 'Bridal Shawl',
    image: '/images/velvet-shawl.svg',
    preferLive3d: true,
    modelType: 'shawl-drape',
    defaultColor: 'maroon',
    defaultFabric: 'chantilly-lace',
    defaultHardware: 'champagne-gold',
    sizes: ['Bridal Full Size (44" x 92")'],
    rating: 4.98,
    reviewCount: 192,
    relatedIds: ['kashmiri-pashmina-shawl', 'zardozi-bridal-lehenga', 'bridal-zardozi-khussa', 'noor-oud-perfume'],
    description:
      'Rich Shahi Maroon 9000-micro velvet shawl framed with four-sided antique gold tilla border—designed for winter weddings, Nikah, and Walima evenings.',
    details: [
      'Plush 9000-grade Turkish micro-velvet',
      '4-sided gold zardozi & kiran lace edging',
      'Warm yet lightweight evening drape',
      'Matches our Shahi Maroon bridal collection'
    ],
    fitNote: 'Full bridal wrap coverage.'
  },
  {
    id: 'pointed-kitten-mules',
    name: 'Zara-Style Pointed Satin Mules',
    subtitle: 'Contemporary pointed-toe kitten heels with gold buckle',
    category: 'footwear',
    price: 6900,
    badge: 'Zara Style Shoes',
    image: '/images/pointed-mules.svg',
    preferLive3d: true,
    modelType: 'pointed-mule',
    defaultColor: 'jamun',
    defaultFabric: 'mulberry-silk',
    defaultHardware: 'champagne-gold',
    sizes: ['36 / 6', '37 / 7', '38 / 8', '39 / 9', '40 / 10', '41 / 11'],
    rating: 4.93,
    reviewCount: 215,
    relatedIds: ['zara-satin-blazer-coord', 'bridal-pearl-heels', 'bridal-zardozi-khussa', 'zarqa-musk-perfume'],
    description:
      'Sleek European pointed-toe satin mules featuring a sculpted 2.2-inch kitten heel and brushed gold strap hardware—effortless from work to dinner.',
    details: [
      'Cushioned leather-lined footbed',
      'Walkable 2.2-inch sculpted heel',
      'Lustrous jewel-toned satin upper',
      'Slip-on pointed silhouette'
    ],
    fitNote: 'True to size; go one size up for wider feet.'
  },
  {
    id: 'noor-oud-perfume',
    name: 'Noor-e-Jahan Oud & Rose EDP (100ml)',
    subtitle: 'J.-inspired Arabian oud, Taif rose & warm amber perfume',
    category: 'perfumes',
    price: 6500,
    badge: 'Signature Perfume',
    image: '/images/oud-perfume.svg',
    preferLive3d: true,
    modelType: 'perfume-bottle',
    defaultColor: 'maroon',
    defaultFabric: 'mulberry-silk',
    defaultHardware: 'champagne-gold',
    sizes: ['50ml EDP', '100ml EDP', 'Gift Box + Travel Atomizer'],
    rating: 4.98,
    reviewCount: 412,
    relatedIds: ['zarqa-musk-perfume', 'mehreen-bridal-set', 'shahi-velvet-shawl', 'zardozi-bridal-lehenga'],
    description:
      'A long-lasting 12-hour Eau de Parfum crafted with velvety Damask rose, saffron, smoky agarwood (Oud), and creamy sandalwood—made for Pakistani evenings & bridal gift boxes.',
    details: [
      '22% Eau de Parfum oil concentration (12h+ longevity)',
      'Top: Saffron & Bergamot • Heart: Taif Rose • Base: Oud & Amber',
      'Faceted crystal glass flacon with antique gold cap',
      'Safe to mist on silk shawls & bridal attire'
    ],
    fitNote: 'Rich warm floral-oud sillage.'
  },
  {
    id: 'zarqa-musk-perfume',
    name: 'Zarqa White Musk & Jasmine EDP (100ml)',
    subtitle: 'Fresh floral jasmine, motia & soft vanilla mist',
    category: 'perfumes',
    price: 5200,
    badge: 'Floral Perfume',
    image: '/images/musk-perfume.svg',
    preferLive3d: true,
    modelType: 'perfume-bottle',
    defaultColor: 'ferozi',
    defaultFabric: 'sheer-tulle',
    defaultHardware: 'rose-gold',
    sizes: ['50ml EDP', '100ml EDP'],
    rating: 4.94,
    reviewCount: 287,
    relatedIds: ['noor-oud-perfume', 'j-chikankari-lawn-suit', 'zara-satin-blazer-coord', 'pointed-kitten-mules'],
    description:
      'Breezy Pakistani summer signature scent blending fresh Motia (Jasmine), white peach, clean cotton musk, and soft sandalwood.',
    details: [
      '18% Eau de Parfum concentration for warm weather',
      'Top: White Peach & Neroli • Heart: Motia Jasmine • Base: White Musk',
      'Crystal-clear flacon with rose-gold collar',
      'Ideal everyday & office fragrance'
    ],
    fitNote: 'Clean airy floral-musk trail.'
  },
  {
    id: 'fogg-rose-velvet-perfume',
    name: 'Fogg-Style Rose & Velvet Fragrance (120ml)',
    subtitle: 'Long-lasting no-gas body perfume inspired by Fogg Scent',
    category: 'perfumes',
    price: 3800,
    badge: 'Fogg Style',
    image: '/images/fogg-perfume.svg',
    preferLive3d: true,
    modelType: 'perfume-bottle',
    defaultColor: 'rani',
    defaultFabric: 'mulberry-silk',
    defaultHardware: 'champagne-gold',
    sizes: ['100ml Body Spray', '120ml EDP'],
    rating: 4.91,
    reviewCount: 344,
    relatedIds: ['splendor-citrus-perfume', 'janan-inspired-perfume', 'noor-oud-perfume', 'zarqa-musk-perfume'],
    description:
      'Vibrant berry-rose and warm vanilla-musk perfume crafted for all-day freshness across Pakistani summers without fading.',
    details: [
      'Concentrated no-gas long-wear perfume',
      'Top: Wild Berry & Bergamot • Heart: Pink Rose • Base: Musk',
      'Up to 800 sprays per flacon',
      'Ideal everyday handbag scent'
    ],
    fitNote: 'Sweet floral-berry everyday sillage.'
  },
  {
    id: 'splendor-citrus-perfume',
    name: 'Splendor Amber & Blossom EDP (100ml)',
    subtitle: 'Radiant floral-citrus & golden amber perfume',
    category: 'perfumes',
    price: 4900,
    badge: 'Splendor Style',
    image: '/images/splendor-perfume.svg',
    preferLive3d: true,
    modelType: 'perfume-bottle',
    defaultColor: 'haldi',
    defaultFabric: 'mulberry-silk',
    defaultHardware: 'champagne-gold',
    sizes: ['50ml EDP', '100ml EDP'],
    rating: 4.93,
    reviewCount: 256,
    relatedIds: ['fogg-rose-velvet-perfume', 'janan-inspired-perfume', 'zarqa-musk-perfume', 'zara-satin-blazer-coord'],
    description:
      'Sparkling mandarin, white magnolia, and warm golden amber inspired by classic Splendor luxury fragrances.',
    details: [
      'Crisp citrus-floral opening with warm amber dry-down',
      'Faceted sunlit crystal bottle',
      'Great for daytime brunches & office wear',
      '10% off auto-applied for everyone'
    ],
    fitNote: 'Bright sparkling floral-amber aroma.'
  },
  {
    id: 'janan-inspired-perfume',
    name: 'Janan Gold Saffron & Musk EDP (100ml)',
    subtitle: 'J. Janan-inspired signature warm spice & jasmine fragrance',
    category: 'perfumes',
    price: 7200,
    badge: 'Janan Style',
    image: '/images/janan-perfume.svg',
    preferLive3d: true,
    modelType: 'perfume-bottle',
    defaultColor: 'jamun',
    defaultFabric: 'mulberry-silk',
    defaultHardware: 'champagne-gold',
    sizes: ['50ml EDP', '100ml EDP', 'Bridal Gift Set'],
    rating: 4.99,
    reviewCount: 498,
    relatedIds: ['noor-oud-perfume', 'splendor-citrus-perfume', 'fogg-rose-velvet-perfume', 'j-chikankari-lawn-suit'],
    description:
      'Beloved Pakistani signature scent blending Kashmiri saffron, crisp apple-bergamot, soft rose, and creamy cedar-musk.',
    details: [
      'Inspired by classic Pakistani J. Janan heritage blends',
      '24% Extrait-grade longevity (14+ hours on fabric)',
      'Sculpted jewel crystal bottle with gold plaque',
      'Top gifting pick for Eid & weddings'
    ],
    fitNote: 'Warm aristocratic saffron-musk trail.'
  },
  {
    id: 'zara-oversized-poplin-shirt',
    name: 'Zara-Style Oversized Poplin Shirt',
    subtitle: 'Crisp breathable cotton button-down women’s shirt',
    category: 'clothes',
    price: 5800,
    badge: 'Shirts',
    image: '/images/poplin-shirt.svg',
    preferLive3d: true,
    modelType: 'shirt-top',
    defaultColor: 'ivory',
    defaultFabric: 'micro-modal',
    defaultHardware: 'champagne-gold',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    rating: 4.92,
    reviewCount: 289,
    relatedIds: ['baggy-wide-leg-trousers', 'zara-satin-blazer-coord', 'platform-comfort-sneakers', 'pearl-baroque-hoops'],
    description:
      'Relaxed drop-shoulder button-down shirt in crisp combed cotton poplin—pairs effortlessly with baggy trousers, jeans, or silk skirts.',
    details: [
      '100% breathable combed cotton poplin',
      'Relaxed Zara-cut collar & buttoned cuffs',
      'Mother-of-pearl finish buttons',
      'Easy machine-washable everyday staple'
    ],
    fitNote: 'Relaxed oversized fit; size down for a closer cut.'
  },
  {
    id: 'baggy-wide-leg-trousers',
    name: 'High-Waist Baggy Wide-Leg Trousers',
    subtitle: 'Relaxed pleated baggy pants for everyday & Zara-style looks',
    category: 'clothes',
    price: 6200,
    badge: 'Baggy Trouser',
    image: '/images/baggy-trousers.svg',
    preferLive3d: true,
    modelType: 'baggy-trousers',
    defaultColor: 'jamun',
    defaultFabric: 'micro-modal',
    defaultHardware: 'champagne-gold',
    sizes: ['26 / XS', '28 / S', '30 / M', '32 / L', '34 / XL', '36 / XXL'],
    rating: 4.95,
    reviewCount: 376,
    relatedIds: ['zara-oversized-poplin-shirt', 'platform-comfort-sneakers', 'pointed-kitten-mules', 'zara-satin-blazer-coord'],
    description:
      'Ultra-comfortable high-waisted baggy trousers with soft front pleats, deep side pockets, and a fluid wide-leg drape that pairs with shirts, kurtis, or sneakers.',
    details: [
      'High-rise flattering pleated waist with belt loops',
      'Breathable twill-modal fabric with zero cling',
      'Deep functional side pockets',
      'Full-length relaxed baggy leg silhouette'
    ],
    fitNote: 'Relaxed baggy drape through hip and thigh.'
  },
  {
    id: 'platform-comfort-sneakers',
    name: 'Zara-Style Platform Comfort Shoes',
    subtitle: 'Chunky cushioned everyday women’s sneakers',
    category: 'footwear',
    price: 7400,
    badge: 'Casual Shoes',
    image: '/images/platform-sneakers.svg',
    preferLive3d: true,
    modelType: 'sneaker-shoe',
    defaultColor: 'ivory',
    defaultFabric: 'micro-modal',
    defaultHardware: 'champagne-gold',
    sizes: ['36 / 6', '37 / 7', '38 / 8', '39 / 9', '40 / 10', '41 / 11'],
    rating: 4.94,
    reviewCount: 231,
    relatedIds: ['baggy-wide-leg-trousers', 'zara-oversized-poplin-shirt', 'pointed-kitten-mules', 'splendor-citrus-perfume'],
    description:
      'Featherlight cushioned platform sneakers with metallic gold heel accents—built for university campuses, mall walks, and pairing with baggy trousers.',
    details: [
      '1.8-inch cloud-foam comfort platform sole',
      'Breathable perforated vegan-leather & mesh upper',
      'Brushed gold heel tab detail',
      'Anti-slip tread'
    ],
    fitNote: 'True to size.'
  },
  {
    id: 'kundan-chandbali-earrings',
    name: 'Kundan & Pearl Chandbali Earrings',
    subtitle: 'Traditional Pakistani bridal jhumka & pearl earrings',
    category: 'accessories',
    price: 4200,
    badge: 'Earrings',
    image: '/images/jhumka-earrings.svg',
    preferLive3d: true,
    modelType: 'earrings-jhumka',
    defaultColor: 'maroon',
    defaultFabric: 'mulberry-silk',
    defaultHardware: 'champagne-gold',
    sizes: ['Standard Lightweight Pair'],
    rating: 4.98,
    reviewCount: 312,
    relatedIds: ['pearl-baroque-hoops', 'bridal-velvet-potli', 'zardozi-bridal-lehenga', 'mehndi-emerald-sharara'],
    description:
      'Handcrafted antique gold Chandbali jhumka earrings set with uncut Kundan stones and cascading pearl drops—lightweight enough for all-night Mehndi & Baraat wear.',
    details: [
      '24k antique-gold plated brass alloy (nickel-free)',
      'Hand-set Kundan crystals & freshwater pearl drops',
      'Featherlight cushioned push-back clasp',
      'Includes velvet jewelry storage box'
    ],
    fitNote: 'Medium statement drop length (2.6 inches).'
  },
  {
    id: 'pearl-baroque-hoops',
    name: 'Sculpted Gold & Pearl Hoop Earrings',
    subtitle: 'Zara-style modern everyday & party earrings',
    category: 'accessories',
    price: 2950,
    badge: 'Hoops & Pearls',
    image: '/images/pearl-hoops.svg',
    preferLive3d: true,
    modelType: 'earrings-hoop',
    defaultColor: 'ivory',
    defaultFabric: 'mulberry-silk',
    defaultHardware: 'champagne-gold',
    sizes: ['One Size Pair'],
    rating: 4.93,
    reviewCount: 198,
    relatedIds: ['kundan-chandbali-earrings', 'zara-oversized-poplin-shirt', 'zara-satin-blazer-coord', 'zarqa-musk-perfume'],
    description:
      'Sleek 18k gold-toned hoops finished with detachable luminous pearl charms—effortlessly transitions from casual poplin shirts to formal dinners.',
    details: [
      'Hypoallergenic stainless steel with 18k gold plating',
      'Removable baroque pearl drop charm (2 looks in 1)',
      'Tarnish-resistant & featherweight',
      'Includes velvet pouch'
    ],
    fitNote: 'Everyday comfortable 1.4-inch drop.'
  },
  {
    id: 'digital-silk-printed-shawl',
    name: 'Botanical Digital Pure Silk Shawl',
    subtitle: 'Lightweight J.-style floral silk shawl for all seasons',
    category: 'shawls',
    price: 6800,
    badge: 'Silk Shawl',
    image: '/images/silk-shawl.svg',
    preferLive3d: true,
    modelType: 'shawl-drape',
    defaultColor: 'ferozi',
    defaultFabric: 'mulberry-silk',
    defaultHardware: 'champagne-gold',
    sizes: ['Full Wrap (38" x 84")'],
    rating: 4.94,
    reviewCount: 175,
    relatedIds: ['kashmiri-pashmina-shawl', 'shahi-velvet-shawl', 'j-chikankari-lawn-suit', 'janan-inspired-perfume'],
    description:
      'Airy pure silk shawl in jewel Ferozi tones with gold-trimmed edges—drapes fluidly over lawn suits, plain shirts, and evening ensembles.',
    details: [
      'Pure Katan silk lightweight weave',
      'Hand-rolled hem with fine gold lurex border',
      'All-season breathable wrap',
      'Gift-boxed with care card'
    ],
    fitNote: 'Generous 84-inch full shawl wrap.'
  }
];

module.exports = {
  COLORS,
  FABRICS,
  HARDWARE_FINISHES,
  PRODUCTS
};
