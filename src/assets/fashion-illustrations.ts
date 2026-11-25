import type { GarmentCategory } from '@/types';

function encodeSvg(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export function createGarmentIllustration(params: {
  category: GarmentCategory;
  subcategory: string;
  colorHex: string;
  secondaryHex?: string;
  pattern?: string;
}): string {
  const { category, subcategory, colorHex, secondaryHex = '#E6E0D6', pattern } = params;
  const sub = subcategory.toLowerCase();

  const patternDef =
    pattern === 'Striped'
      ? `<pattern id="pat" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="${colorHex}"/><line x1="0" y1="0" x2="0" y2="12" stroke="${secondaryHex}" stroke-width="3" opacity="0.55"/></pattern>`
      : pattern === 'Checked'
        ? `<pattern id="pat" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="${colorHex}"/><path d="M16 0H0v16" fill="none" stroke="${secondaryHex}" stroke-width="2.5" opacity="0.45"/></pattern>`
        : '';

  const fillRef = patternDef ? 'url(#pat)' : colorHex;
  const strokeColor = '#2A2623';

  let shape = '';

  if (category === 'TOP') {
    if (sub.includes('tee') || sub.includes('t-shirt') || sub.includes('polo')) {
      shape = `
        <path d="M108 72 L134 62 Q160 76 186 62 L212 72 L248 112 L222 138 L206 120 L206 270 L114 270 L114 120 L98 138 L72 112 Z"
          fill="${fillRef}" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M134 62 Q160 88 186 62" fill="none" stroke="${strokeColor}" stroke-width="2.5"/>
      `;
    } else {
      shape = `
        <path d="M112 72 L136 58 L160 70 L184 58 L208 72 L254 148 L228 164 L206 124 L206 276 L114 276 L114 124 L92 164 L66 148 Z"
          fill="${fillRef}" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M136 58 L160 86 L184 58" fill="none" stroke="${strokeColor}" stroke-width="2.2"/>
        <line x1="160" y1="86" x2="160" y2="274" stroke="${strokeColor}" stroke-width="1.6" opacity="0.45"/>
        <circle cx="160" cy="116" r="2.6" fill="${secondaryHex}" stroke="${strokeColor}" stroke-width="1.2"/>
        <circle cx="160" cy="152" r="2.6" fill="${secondaryHex}" stroke="${strokeColor}" stroke-width="1.2"/>
        <circle cx="160" cy="188" r="2.6" fill="${secondaryHex}" stroke="${strokeColor}" stroke-width="1.2"/>
        <circle cx="160" cy="224" r="2.6" fill="${secondaryHex}" stroke="${strokeColor}" stroke-width="1.2"/>
      `;
    }
  } else if (category === 'BOTTOM') {
    shape = `
      <path d="M106 62 L214 62 L226 286 L176 286 L160 156 L144 286 L94 286 Z"
        fill="${fillRef}" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="106" y1="80" x2="214" y2="80" stroke="${strokeColor}" stroke-width="2"/>
      <path d="M160 80 L160 124" stroke="${strokeColor}" stroke-width="1.8" opacity="0.5"/>
      <path d="M109 102 Q130 108 134 80" fill="none" stroke="${strokeColor}" stroke-width="1.6" opacity="0.55"/>
      <path d="M211 102 Q190 108 186 80" fill="none" stroke="${strokeColor}" stroke-width="1.6" opacity="0.55"/>
    `;
  } else if (category === 'OUTERWEAR') {
    shape = `
      <path d="M106 68 L138 56 L160 78 L182 56 L214 68 L260 176 L232 188 L208 128 L210 282 L110 282 L112 128 L88 188 L60 176 Z"
        fill="${fillRef}" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M138 56 L124 128 L156 144 L160 78 L164 144 L196 128 L182 56" fill="${secondaryHex}" fill-opacity="0.3" stroke="${strokeColor}" stroke-width="2"/>
      <line x1="160" y1="144" x2="160" y2="282" stroke="${strokeColor}" stroke-width="2"/>
    `;
  } else if (category === 'ONE_PIECE') {
    shape = `
      <path d="M126 58 L142 58 Q160 76 178 58 L194 58 L214 98 L194 148 L228 286 L92 286 L126 148 L106 98 Z"
        fill="${fillRef}" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="126" y1="148" x2="194" y2="148" stroke="${strokeColor}" stroke-width="2" opacity="0.65"/>
    `;
  } else if (category === 'TRADITIONAL') {
    shape = `
      <path d="M116 62 L142 52 L160 66 L178 52 L204 62 L248 156 L224 170 L204 122 L208 292 L166 292 L166 254 L154 254 L154 292 L112 292 L116 122 L96 170 L72 156 Z"
        fill="${fillRef}" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="150" y="66" width="20" height="72" rx="4" fill="${secondaryHex}" fill-opacity="0.65" stroke="${strokeColor}" stroke-width="1.8"/>
      <path d="M142 52 L160 74 L178 52" fill="none" stroke="${strokeColor}" stroke-width="2.2"/>
    `;
  } else if (category === 'FOOTWEAR') {
    shape = `
      <path d="M84 196 L126 150 L152 162 Q178 188 228 194 Q248 198 248 220 L248 232 L78 232 L78 210 Z"
        fill="${fillRef}" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="76" y="226" width="174" height="16" rx="6" fill="#FAF8F5" stroke="${strokeColor}" stroke-width="2.2"/>
      <line x1="148" y1="168" x2="174" y2="180" stroke="${secondaryHex}" stroke-width="2.4" stroke-linecap="round"/>
      <line x1="158" y1="176" x2="184" y2="188" stroke="${secondaryHex}" stroke-width="2.4" stroke-linecap="round"/>
    `;
  } else {
    // ACCESSORY
    if (sub.includes('watch')) {
      shape = `
        <rect x="138" y="66" width="44" height="206" rx="10" fill="${fillRef}" stroke="${strokeColor}" stroke-width="2.5"/>
        <circle cx="160" cy="170" r="42" fill="#FAF8F5" stroke="${strokeColor}" stroke-width="3"/>
        <circle cx="160" cy="170" r="33" fill="${secondaryHex}" fill-opacity="0.25" stroke="${strokeColor}" stroke-width="1.5"/>
        <line x1="160" y1="170" x2="160" y2="146" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="160" y1="170" x2="178" y2="178" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round"/>
      `;
    } else if (sub.includes('sunglass') || sub.includes('glasses')) {
      shape = `
        <rect x="68" y="138" width="76" height="52" rx="18" fill="${fillRef}" fill-opacity="0.85" stroke="${strokeColor}" stroke-width="3"/>
        <rect x="176" y="138" width="76" height="52" rx="18" fill="${fillRef}" fill-opacity="0.85" stroke="${strokeColor}" stroke-width="3"/>
        <path d="M144 156 Q160 144 176 156" fill="none" stroke="${strokeColor}" stroke-width="3"/>
        <line x1="52" y1="150" x2="68" y2="152" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round"/>
        <line x1="252" y1="152" x2="268" y2="150" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round"/>
      `;
    } else if (sub.includes('belt')) {
      shape = `
        <ellipse cx="160" cy="170" rx="92" ry="48" fill="none" stroke="${fillRef}" stroke-width="24"/>
        <ellipse cx="160" cy="170" rx="92" ry="48" fill="none" stroke="${strokeColor}" stroke-width="2.5"/>
        <rect x="142" y="198" width="36" height="28" rx="4" fill="#E7D8C5" stroke="${strokeColor}" stroke-width="2.5"/>
      `;
    } else {
      // Tote / Bag / Scarf
      shape = `
        <path d="M126 118 Q160 58 194 118" fill="none" stroke="${strokeColor}" stroke-width="4" stroke-linecap="round"/>
        <path d="M92 118 L228 118 L242 264 L78 264 Z" fill="${fillRef}" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="round"/>
        <line x1="94" y1="146" x2="226" y2="146" stroke="${strokeColor}" stroke-width="1.6" opacity="0.45"/>
      `;
    }
  }

  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 340" width="320" height="340">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FAF7F2"/>
          <stop offset="100%" stop-color="#F0EAE1"/>
        </linearGradient>
        ${patternDef}
      </defs>
      <rect width="320" height="340" rx="20" fill="url(#bg)"/>
      <ellipse cx="160" cy="306" rx="74" ry="10" fill="#1C1917" opacity="0.06"/>
      ${shape}
    </svg>
  `);
}

export function createAvatarIllustration(params?: {
  topColor?: string;
  bottomColor?: string;
  outerwearColor?: string;
  footwearColor?: string;
  onePieceColor?: string;
  label?: string;
  pose?: 'standing' | 'editorial';
}): string {
  const {
    topColor = '#EAE4DC',
    bottomColor = '#344154',
    outerwearColor,
    footwearColor = '#FAF8F5',
    onePieceColor,
    label = 'Personal AI Avatar',
  } = params ?? {};

  const torsoColor = onePieceColor ?? topColor;
  const legsColor = onePieceColor ?? bottomColor;

  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 520" width="360" height="520">
      <defs>
        <linearGradient id="studioBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#F6F2EB"/>
          <stop offset="100%" stop-color="#EAE3D7"/>
        </linearGradient>
      </defs>
      <rect width="360" height="520" rx="24" fill="url(#studioBg)"/>
      <circle cx="180" cy="190" r="130" fill="#FFFFFF" opacity="0.45"/>
      <ellipse cx="180" cy="474" rx="88" ry="14" fill="#1C1917" opacity="0.1"/>

      <!-- Hair & Head -->
      <path d="M150 74 Q180 42 210 74 Q216 96 208 112 L152 112 Q144 96 150 74 Z" fill="#2B2420"/>
      <ellipse cx="180" cy="88" rx="22" ry="26" fill="#D9A88A" stroke="#2B2420" stroke-width="2"/>
      <path d="M158 76 Q180 58 202 76 Q192 68 180 68 Q168 68 158 76 Z" fill="#2B2420"/>
      <rect x="172" y="110" width="16" height="20" rx="6" fill="#D9A88A"/>

      <!-- Arms -->
      <path d="M138 134 L106 238 L122 244 L148 164 Z" fill="${outerwearColor ?? torsoColor}" stroke="#2B2420" stroke-width="2"/>
      <path d="M222 134 L254 238 L238 244 L212 164 Z" fill="${outerwearColor ?? torsoColor}" stroke="#2B2420" stroke-width="2"/>
      <circle cx="112" cy="246" r="8" fill="#D9A88A"/>
      <circle cx="248" cy="246" r="8" fill="#D9A88A"/>

      <!-- Legs / Bottom -->
      <path d="M144 246 L216 246 L224 446 L186 446 L180 326 L174 446 L136 446 Z"
        fill="${legsColor}" stroke="#2B2420" stroke-width="2.2" stroke-linejoin="round"/>

      <!-- Torso / Top -->
      <path d="M136 134 L166 126 Q180 136 194 126 L224 134 L216 254 L144 254 Z"
        fill="${torsoColor}" stroke="#2B2420" stroke-width="2.2" stroke-linejoin="round"/>

      ${
        outerwearColor
          ? `<path d="M134 132 L158 126 L166 266 L138 266 Z" fill="${outerwearColor}" stroke="#2B2420" stroke-width="2"/>
             <path d="M226 132 L202 126 L194 266 L222 266 Z" fill="${outerwearColor}" stroke="#2B2420" stroke-width="2"/>`
          : ''
      }

      <!-- Footwear -->
      <path d="M134 446 L176 446 L176 468 Q154 472 128 466 Z" fill="${footwearColor}" stroke="#2B2420" stroke-width="2"/>
      <path d="M184 446 L226 446 L232 466 Q206 472 184 468 Z" fill="${footwearColor}" stroke="#2B2420" stroke-width="2"/>

      <rect x="20" y="20" width="150" height="26" rx="13" fill="#FFFFFF" fill-opacity="0.82"/>
      <text x="95" y="37" font-family="DM Sans, Arial, sans-serif" font-size="11" font-weight="600" fill="#44403C" text-anchor="middle">${label}</text>
    </svg>
  `);
}

export function createReferencePhotoPlaceholder(kind: 'face' | 'body'): string {
  if (kind === 'face') {
    return encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" width="280" height="280">
        <rect width="280" height="280" rx="20" fill="#F2ECE3"/>
        <circle cx="140" cy="116" r="46" fill="#D9A88A" stroke="#2B2420" stroke-width="2.5"/>
        <path d="M96 96 Q140 48 184 96 Q168 78 140 78 Q112 78 96 96 Z" fill="#2B2420"/>
        <path d="M74 252 Q84 186 140 186 Q196 186 206 252 Z" fill="#B55D42" stroke="#2B2420" stroke-width="2.5"/>
        <text x="140" y="268" font-family="DM Sans, Arial, sans-serif" font-size="11" fill="#57534E" text-anchor="middle">Face Reference (Demo)</text>
      </svg>
    `);
  }
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 340" width="280" height="340">
      <rect width="280" height="340" rx="20" fill="#F2ECE3"/>
      <circle cx="140" cy="68" r="20" fill="#D9A88A" stroke="#2B2420" stroke-width="2"/>
      <path d="M108 98 L172 98 L166 188 L114 188 Z" fill="#EAE4DC" stroke="#2B2420" stroke-width="2"/>
      <path d="M114 188 L166 188 L172 304 L144 304 L140 232 L136 304 L108 304 Z" fill="#3C4A5E" stroke="#2B2420" stroke-width="2"/>
      <text x="140" y="326" font-family="DM Sans, Arial, sans-serif" font-size="11" fill="#57534E" text-anchor="middle">Full-body Reference (Demo)</text>
    </svg>
  `);
}
