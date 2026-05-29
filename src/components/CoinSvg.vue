<script setup lang="ts">
/**
 * Premium Photorealistic Coin SVG Component for NovaBet
 *
 * Props:
 *   side: 0 (Heads / Silver Eagle), 1 (Tails / Gold Ethereum), 2 (Split coin)
 *   size: 'small' (32px), 'medium' (64px), 'large' (160px)
 */
const props = defineProps({
  side: {
    type: Number,
    required: true,
    validator: (val: number) => [0, 1, 2].includes(val),
  },
  size: {
    type: String,
    default: 'medium',
    validator: (val: string) => ['small', 'medium', 'large'].includes(val),
  },
})
</script>

<template>
  <div
    class="coin-wrapper relative select-none flex items-center justify-center"
    :class="{
      'w-8 h-8': size === 'small',
      'w-16 h-16': size === 'medium',
      'w-36 h-36 sm:w-40 sm:h-40': size === 'large',
    }"
  >
    <svg
      viewBox="0 0 200 200"
      class="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <!-- ========== SILVER GRADIENTS ========== -->
        <radialGradient id="silverBody" cx="40%" cy="38%" r="58%">
          <stop offset="0%" stop-color="#f8fafc" />
          <stop offset="22%" stop-color="#e2e8f0" />
          <stop offset="50%" stop-color="#94a3b8" />
          <stop offset="78%" stop-color="#64748b" />
          <stop offset="100%" stop-color="#334155" />
        </radialGradient>
        <linearGradient id="silverRim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f1f5f9" />
          <stop offset="25%" stop-color="#94a3b8" />
          <stop offset="50%" stop-color="#475569" />
          <stop offset="75%" stop-color="#94a3b8" />
          <stop offset="100%" stop-color="#cbd5e1" />
        </linearGradient>
        <radialGradient id="silverHighlight" cx="35%" cy="30%" r="45%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>

        <!-- ========== GOLD GRADIENTS ========== -->
        <radialGradient id="goldBody" cx="40%" cy="38%" r="58%">
          <stop offset="0%" stop-color="#fef9c3" />
          <stop offset="20%" stop-color="#fde047" />
          <stop offset="48%" stop-color="#eab308" />
          <stop offset="75%" stop-color="#a16207" />
          <stop offset="100%" stop-color="#451a03" />
        </radialGradient>
        <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef9c3" />
          <stop offset="25%" stop-color="#eab308" />
          <stop offset="50%" stop-color="#78350f" />
          <stop offset="75%" stop-color="#ca8a04" />
          <stop offset="100%" stop-color="#fde047" />
        </linearGradient>
        <radialGradient id="goldHighlight" cx="35%" cy="30%" r="45%">
          <stop offset="0%" stop-color="#fefce8" stop-opacity="0.55" />
          <stop offset="100%" stop-color="#fefce8" stop-opacity="0" />
        </radialGradient>

        <!-- ========== EMBOSS FILTER ========== -->
        <filter id="emboss" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
          <feSpecularLighting
            in="blur"
            surfaceScale="5"
            specularConstant="0.75"
            specularExponent="20"
            result="specOut"
          >
            <fePointLight x="60" y="40" z="120" />
          </feSpecularLighting>
          <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut2" />
          <feComposite in="SourceGraphic" in2="specOut2" operator="arithmetic"
            k1="0" k2="1" k3="1" k4="0" />
        </filter>

        <!-- ========== COIN SHADOW ========== -->
        <filter id="coinShadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.5" />
        </filter>

        <!-- ========== SPLIT CLIP PATHS ========== -->
        <clipPath id="leftHalf">
          <rect x="0" y="0" width="100" height="200" />
        </clipPath>
        <clipPath id="rightHalf">
          <rect x="100" y="0" width="100" height="200" />
        </clipPath>

        <!-- ========== KNURLING PATTERN ========== -->
        <pattern id="knurl" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="0.8" fill="#ffffff" opacity="0.15" />
        </pattern>
      </defs>

      <!-- ============================================ -->
      <!--           HEADS: SILVER EAGLE COIN           -->
      <!-- ============================================ -->
      <g v-if="side === 0" filter="url(#coinShadow)">
        <!-- Outer rim -->
        <circle cx="100" cy="100" r="94" fill="url(#silverRim)" />
        <!-- Main body -->
        <circle cx="100" cy="100" r="88" fill="url(#silverBody)" />
        <!-- Knurled edge ring -->
        <circle cx="100" cy="100" r="91" fill="url(#knurl)" stroke="none" />
        <!-- Inner decorative ring -->
        <circle
          cx="100" cy="100" r="80"
          fill="none"
          stroke="#94a3b8"
          stroke-width="1.8"
          stroke-dasharray="4,3"
          opacity="0.5"
        />
        <!-- Second inner ring -->
        <circle
          cx="100" cy="100" r="76"
          fill="none"
          stroke="#64748b"
          stroke-width="0.8"
          opacity="0.35"
        />

        <!-- Embossed Eagle (heraldic style using paths) -->
        <g filter="url(#emboss)" opacity="0.9">
          <!-- Eagle body -->
          <path
            d="M100 55 L85 78 L75 72 L80 90 L68 95 L82 100 L75 115 L90 108 L100 125 L110 108 L125 115 L118 100 L132 95 L120 90 L125 72 L115 78 Z"
            fill="#475569"
            stroke="#334155"
            stroke-width="1"
          />
          <!-- Eagle head -->
          <circle cx="100" cy="62" r="8" fill="#64748b" stroke="#475569" stroke-width="1" />
          <!-- Eagle beak -->
          <path d="M100 67 L96 72 L104 72 Z" fill="#94a3b8" />
          <!-- Wing feathers left -->
          <path d="M75 72 L62 65 L68 80 Z" fill="#64748b" opacity="0.8" />
          <path d="M68 80 L55 78 L63 88 Z" fill="#475569" opacity="0.7" />
          <!-- Wing feathers right -->
          <path d="M125 72 L138 65 L132 80 Z" fill="#64748b" opacity="0.8" />
          <path d="M132 80 L145 78 L137 88 Z" fill="#475569" opacity="0.7" />
          <!-- Tail feathers -->
          <path d="M90 108 L85 120 L95 115 Z" fill="#475569" opacity="0.6" />
          <path d="M110 108 L115 120 L105 115 Z" fill="#475569" opacity="0.6" />
        </g>

        <!-- Top text arc "NOVABET" -->
        <g opacity="0.4">
          <path id="topArc" d="M 40 100 A 60 60 0 0 1 160 100" fill="none" />
          <text font-size="9" fill="#475569" font-family="system-ui" font-weight="700" letter-spacing="5">
            <textPath href="#topArc" startOffset="25%" text-anchor="middle">NOVABET</textPath>
          </text>
        </g>

        <!-- Bottom text arc "HEADS" -->
        <g opacity="0.35">
          <path id="bottomArc" d="M 45 110 A 55 55 0 0 0 155 110" fill="none" />
          <text font-size="8" fill="#475569" font-family="system-ui" font-weight="600" letter-spacing="3">
            <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">HEADS</textPath>
          </text>
        </g>

        <!-- Specular highlight -->
        <circle cx="100" cy="100" r="88" fill="url(#silverHighlight)" />
        <!-- Subtle edge sheen -->
        <circle
          cx="100" cy="100" r="94"
          fill="none"
          stroke="#ffffff"
          stroke-width="0.6"
          opacity="0.3"
        />
      </g>

      <!-- ============================================ -->
      <!--         TAILS: GOLD ETHEREUM COIN            -->
      <!-- ============================================ -->
      <g v-else-if="side === 1" filter="url(#coinShadow)">
        <!-- Outer rim -->
        <circle cx="100" cy="100" r="94" fill="url(#goldRim)" />
        <!-- Main body -->
        <circle cx="100" cy="100" r="88" fill="url(#goldBody)" />
        <!-- Knurled edge ring -->
        <circle cx="100" cy="100" r="91" fill="url(#knurl)" stroke="none" />
        <!-- Inner decorative ring -->
        <circle
          cx="100" cy="100" r="80"
          fill="none"
          stroke="#ca8a04"
          stroke-width="1.8"
          stroke-dasharray="4,3"
          opacity="0.5"
        />
        <!-- Second inner ring -->
        <circle
          cx="100" cy="100" r="76"
          fill="none"
          stroke="#a16207"
          stroke-width="0.8"
          opacity="0.35"
        />

        <!-- Embossed Ethereum Diamond -->
        <g filter="url(#emboss)" opacity="0.92">
          <!-- Top left facet -->
          <path
            d="M100 48 L72 100 L100 116 Z"
            fill="#fde047"
            stroke="#ca8a04"
            stroke-width="0.5"
          />
          <!-- Top right facet -->
          <path
            d="M100 48 L128 100 L100 116 Z"
            fill="#eab308"
            stroke="#a16207"
            stroke-width="0.5"
          />
          <!-- Bottom left facet -->
          <path
            d="M100 122 L72 100 L100 152 Z"
            fill="#ca8a04"
            stroke="#92400e"
            stroke-width="0.5"
          />
          <!-- Bottom right facet -->
          <path
            d="M100 122 L128 100 L100 152 Z"
            fill="#a16207"
            stroke="#78350f"
            stroke-width="0.5"
          />
          <!-- Center divider line for facet depth -->
          <line x1="72" y1="100" x2="128" y2="100" stroke="#78350f" stroke-width="0.8" opacity="0.4" />
          <!-- Top vertex highlight -->
          <path d="M100 48 L96 58 L104 58 Z" fill="#fef9c3" opacity="0.6" />
        </g>

        <!-- Top text arc "NOVABET" -->
        <g opacity="0.35">
          <path id="topArcGold" d="M 40 100 A 60 60 0 0 1 160 100" fill="none" />
          <text font-size="9" fill="#78350f" font-family="system-ui" font-weight="700" letter-spacing="5">
            <textPath href="#topArcGold" startOffset="25%" text-anchor="middle">NOVABET</textPath>
          </text>
        </g>

        <!-- Bottom text arc "TAILS" -->
        <g opacity="0.3">
          <path id="bottomArcGold" d="M 45 110 A 55 55 0 0 0 155 110" fill="none" />
          <text font-size="8" fill="#78350f" font-family="system-ui" font-weight="600" letter-spacing="3">
            <textPath href="#bottomArcGold" startOffset="50%" text-anchor="middle">TAILS</textPath>
          </text>
        </g>

        <!-- Specular highlight -->
        <circle cx="100" cy="100" r="88" fill="url(#goldHighlight)" />
        <!-- Subtle edge sheen -->
        <circle
          cx="100" cy="100" r="94"
          fill="none"
          stroke="#fef9c3"
          stroke-width="0.6"
          opacity="0.25"
        />
      </g>

      <!-- ============================================ -->
      <!--        SPLIT COIN (IDLE DEFAULT STATE)       -->
      <!-- ============================================ -->
      <g v-else filter="url(#coinShadow)">
        <!-- LEFT HALF: Silver -->
        <g clip-path="url(#leftHalf)">
          <circle cx="100" cy="100" r="94" fill="url(#silverRim)" />
          <circle cx="100" cy="100" r="88" fill="url(#silverBody)" />
          <circle cx="100" cy="100" r="91" fill="url(#knurl)" />
          <circle cx="100" cy="100" r="80" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="4,3" opacity="0.5" />
          <circle cx="100" cy="100" r="76" fill="none" stroke="#64748b" stroke-width="0.8" opacity="0.35" />

          <!-- Left half of eagle emblem -->
          <g filter="url(#emboss)" opacity="0.85">
            <path
              d="M100 55 L85 78 L75 72 L80 90 L68 95 L82 100 L75 115 L90 108 L100 125 L100 55 Z"
              fill="#475569"
              stroke="#334155"
              stroke-width="1"
            />
            <!-- Left wing feathers -->
            <path d="M75 72 L62 65 L68 80 Z" fill="#64748b" opacity="0.8" />
            <path d="M68 80 L55 78 L63 88 Z" fill="#475569" opacity="0.7" />
          </g>

          <circle cx="100" cy="100" r="88" fill="url(#silverHighlight)" />
        </g>

        <!-- RIGHT HALF: Gold -->
        <g clip-path="url(#rightHalf)">
          <circle cx="100" cy="100" r="94" fill="url(#goldRim)" />
          <circle cx="100" cy="100" r="88" fill="url(#goldBody)" />
          <circle cx="100" cy="100" r="91" fill="url(#knurl)" />
          <circle cx="100" cy="100" r="80" fill="none" stroke="#ca8a04" stroke-width="1.8" stroke-dasharray="4,3" opacity="0.5" />
          <circle cx="100" cy="100" r="76" fill="none" stroke="#a16207" stroke-width="0.8" opacity="0.35" />

          <!-- Right half of Ethereum diamond -->
          <g filter="url(#emboss)" opacity="0.88">
            <path d="M100 48 L128 100 L100 116 Z" fill="#eab308" stroke="#a16207" stroke-width="0.5" />
            <path d="M100 122 L128 100 L100 152 Z" fill="#a16207" stroke="#78350f" stroke-width="0.5" />
            <line x1="100" y1="100" x2="128" y2="100" stroke="#78350f" stroke-width="0.8" opacity="0.4" />
          </g>

          <circle cx="100" cy="100" r="88" fill="url(#goldHighlight)" />
        </g>

        <!-- Center divider line (the split seam) -->
        <line
          x1="100" y1="6" x2="100" y2="194"
          stroke="#1e293b"
          stroke-width="1.5"
          opacity="0.7"
        />
        <!-- Subtle metallic divider highlight -->
        <line
          x1="101" y1="8" x2="101" y2="192"
          stroke="#94a3b8"
          stroke-width="0.5"
          opacity="0.3"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.coin-wrapper {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
