% # Capi, a capivara do Trace. Desenho original em SVG (sem imagens externas).
% # Uso: % include('app/views/html/_capi', pose='fatura')
% # Poses: acena, fatura, parcelas, painel, porquinho, investimento, olhos
<svg class="capi capi-{{pose}}" viewBox="0 0 320 360" role="img" aria-label="Capi, a capivara do Trace{{rotulo if defined('rotulo') else ''}}">
    <g class="capi-corpo">
        <!-- pés -->
        <ellipse cx="126" cy="346" rx="26" ry="10" fill="#6B3B22"/>
        <ellipse cx="194" cy="346" rx="26" ry="10" fill="#6B3B22"/>
        <!-- corpo -->
        <path d="M84 258 C82 196 238 196 236 258 C240 322 206 348 160 348 C114 348 80 322 84 258 Z" fill="#A8663E"/>
        <path d="M84 258 C82 222 108 204 128 200 C104 222 98 262 112 330 C92 316 82 292 84 258 Z" fill="#94572F" opacity=".7"/>
        <ellipse cx="160" cy="284" rx="50" ry="54" fill="#C68A5B"/>
        % if pose != 'porquinho' and pose != 'parcelas' and pose != 'painel':
        <path d="M148 300 q12 8 24 0" stroke="#A8663E" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>
        % end
    </g>

    <!-- cachecol -->
    <path d="M94 186 Q160 212 226 186 L230 204 Q160 232 90 204 Z" fill="#3DDC97"/>
    <path d="M94 196 Q160 220 228 196" stroke="#1FA371" stroke-width="3" fill="none" opacity=".7"/>
    <path class="capi-ponta" d="M192 208 L214 254 L196 260 L180 212 Z" fill="#2BC384"/>

    <g class="capi-cabeca">
        <!-- orelhas -->
        <g class="capi-orelha e"><ellipse cx="100" cy="70" rx="17" ry="14" fill="#7E4527"/><ellipse cx="101" cy="72" rx="8" ry="6" fill="#C9776A"/></g>
        <g class="capi-orelha d"><ellipse cx="220" cy="70" rx="17" ry="14" fill="#7E4527"/><ellipse cx="219" cy="72" rx="8" ry="6" fill="#C9776A"/></g>
        <!-- cabeça -->
        <rect x="86" y="56" width="148" height="134" rx="60" fill="#A8663E"/>
        <path d="M150 56 q5 -14 11 -3 q5 -13 11 1" stroke="#7E4527" stroke-width="5" fill="none" stroke-linecap="round"/>
        <!-- focinho -->
        <rect x="110" y="120" width="100" height="68" rx="32" fill="#8E5331"/>
        <ellipse cx="146" cy="142" rx="6" ry="4.5" fill="#3A1F12"/>
        <ellipse cx="174" cy="142" rx="6" ry="4.5" fill="#3A1F12"/>
        <path d="M150 164 Q160 172 170 164" stroke="#3A1F12" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <!-- bochechas -->
        <ellipse cx="104" cy="138" rx="12" ry="7" fill="#F08A73" opacity=".55"/>
        <ellipse cx="216" cy="138" rx="12" ry="7" fill="#F08A73" opacity=".55"/>
        <!-- olhos -->
        <g class="capi-olhos">
            <ellipse cx="124" cy="104" rx="8" ry="9.5" fill="#1A1210"/>
            <ellipse cx="196" cy="104" rx="8" ry="9.5" fill="#1A1210"/>
            <circle cx="127" cy="100" r="3" fill="#fff"/>
            <circle cx="199" cy="100" r="3" fill="#fff"/>
        </g>
        <path d="M112 86 q12 -7 24 -1" stroke="#7E4527" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M184 85 q12 -6 24 1" stroke="#7E4527" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>

    % if pose == 'acena':
    <path d="M100 224 Q78 256 98 292" stroke="#A8663E" stroke-width="24" fill="none" stroke-linecap="round"/>
    <circle cx="99" cy="294" r="14" fill="#8E5331"/>
    <g class="capi-aceno">
        <path d="M220 222 Q256 206 258 164" stroke="#A8663E" stroke-width="24" fill="none" stroke-linecap="round"/>
        <circle cx="258" cy="158" r="15" fill="#8E5331"/>
        <path d="M250 146 l-3 -7 M258 143 l0 -8 M266 146 l3 -7" stroke="#8E5331" stroke-width="5" stroke-linecap="round"/>
    </g>

    % elif pose == 'fatura':
    <g class="capi-papel">
        <rect x="52" y="214" width="84" height="112" rx="10" fill="#F4F7F5" transform="rotate(-7 94 270)"/>
        <g transform="rotate(-7 94 270)">
            <rect x="64" y="230" width="44" height="7" rx="3.5" fill="#3DDC97"/>
            <rect x="64" y="248" width="58" height="5" rx="2.5" fill="#C9D3CE"/>
            <rect x="64" y="262" width="50" height="5" rx="2.5" fill="#C9D3CE"/>
            <rect x="64" y="276" width="58" height="5" rx="2.5" fill="#C9D3CE"/>
            <rect x="64" y="290" width="40" height="5" rx="2.5" fill="#C9D3CE"/>
            <rect x="64" y="306" width="58" height="8" rx="4" fill="#F5B84B"/>
        </g>
    </g>
    <path d="M104 226 Q86 250 112 272" stroke="#A8663E" stroke-width="24" fill="none" stroke-linecap="round"/>
    <circle cx="114" cy="274" r="14" fill="#8E5331"/>
    <g class="capi-lupa">
        <path d="M218 226 Q246 252 214 270" stroke="#A8663E" stroke-width="24" fill="none" stroke-linecap="round"/>
        <line x1="190" y1="262" x2="160" y2="236" stroke="#5B3A28" stroke-width="10" stroke-linecap="round"/>
        <circle cx="140" cy="220" r="27" fill="rgba(125,211,252,.25)" stroke="#E8F0EC" stroke-width="7"/>
        <path d="M128 208 q8 -6 18 -3" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
        <circle cx="210" cy="270" r="14" fill="#8E5331"/>
    </g>

    % elif pose == 'parcelas':
    <g class="capi-calendario">
        <rect x="100" y="226" width="120" height="104" rx="14" fill="#F4F7F5"/>
        <rect x="100" y="226" width="120" height="28" rx="14" fill="#F5B84B"/>
        <rect x="100" y="240" width="120" height="14" fill="#F5B84B"/>
        <circle cx="126" cy="224" r="5" fill="#5B3A28"/><circle cx="194" cy="224" r="5" fill="#5B3A28"/>
        <text x="160" y="295" text-anchor="middle" font-family="Space Grotesk, Inter, sans-serif" font-weight="700" font-size="38" fill="#121917">3/6</text>
        <g class="capi-marcas">
            <rect x="114" y="310" width="13" height="7" rx="3.5" fill="#3DDC97"/>
            <rect x="130" y="310" width="13" height="7" rx="3.5" fill="#3DDC97"/>
            <rect x="146" y="310" width="13" height="7" rx="3.5" fill="#3DDC97"/>
            <rect x="162" y="310" width="13" height="7" rx="3.5" fill="#C9D3CE"/>
            <rect x="178" y="310" width="13" height="7" rx="3.5" fill="#C9D3CE"/>
            <rect x="194" y="310" width="13" height="7" rx="3.5" fill="#C9D3CE"/>
        </g>
    </g>
    <path d="M100 224 Q80 256 100 282" stroke="#A8663E" stroke-width="24" fill="none" stroke-linecap="round"/>
    <circle cx="102" cy="284" r="14" fill="#8E5331"/>
    <path d="M220 224 Q240 256 220 282" stroke="#A8663E" stroke-width="24" fill="none" stroke-linecap="round"/>
    <circle cx="218" cy="284" r="14" fill="#8E5331"/>

    % elif pose == 'painel':
    <g class="capi-tablet">
        <rect x="92" y="226" width="136" height="100" rx="14" fill="#121917" stroke="#3B4A44" stroke-width="5"/>
        <circle class="capi-rosca" cx="132" cy="276" r="24" fill="none" stroke="#26332E" stroke-width="12"/>
        <circle class="capi-rosca-a" cx="132" cy="276" r="24" fill="none" stroke="#3DDC97" stroke-width="12" stroke-dasharray="55 151" transform="rotate(-90 132 276)"/>
        <circle class="capi-rosca-b" cx="132" cy="276" r="24" fill="none" stroke="#5B9DFF" stroke-width="12" stroke-dasharray="32 151" stroke-dashoffset="-55" transform="rotate(-90 132 276)"/>
        <circle class="capi-rosca-c" cx="132" cy="276" r="24" fill="none" stroke="#E879F9" stroke-width="12" stroke-dasharray="22 151" stroke-dashoffset="-87" transform="rotate(-90 132 276)"/>
        <rect class="capi-barra b1" x="170" y="252" width="44" height="8" rx="4" fill="#3DDC97"/>
        <rect class="capi-barra b2" x="170" y="270" width="32" height="8" rx="4" fill="#5B9DFF"/>
        <rect class="capi-barra b3" x="170" y="288" width="22" height="8" rx="4" fill="#E879F9"/>
    </g>
    <path d="M100 224 Q78 254 96 282" stroke="#A8663E" stroke-width="24" fill="none" stroke-linecap="round"/>
    <circle cx="96" cy="284" r="14" fill="#8E5331"/>
    <path d="M220 224 Q242 254 224 282" stroke="#A8663E" stroke-width="24" fill="none" stroke-linecap="round"/>
    <circle cx="224" cy="284" r="14" fill="#8E5331"/>

    % elif pose == 'porquinho':
    <g class="capi-moeda">
        <circle cx="198" cy="190" r="13" fill="#F5B84B" stroke="#D9952B" stroke-width="3"/>
        <text x="198" y="195" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="14" fill="#8A5A12">$</text>
    </g>
    <g class="capi-porco">
        <ellipse cx="160" cy="286" rx="62" ry="46" fill="#FF8FB1"/>
        <ellipse cx="150" cy="270" rx="34" ry="16" fill="#FFB3CA" opacity=".7"/>
        <rect x="174" y="244" width="30" height="7" rx="3.5" fill="#C9537A"/>
        <path d="M112 252 l-6 -20 l20 10 Z" fill="#F0759D"/>
        <ellipse cx="102" cy="290" rx="16" ry="13" fill="#F0759D"/>
        <circle cx="97" cy="290" r="3" fill="#A8385E"/><circle cx="107" cy="290" r="3" fill="#A8385E"/>
        <circle cx="122" cy="272" r="4" fill="#3A1F12"/>
        <rect x="126" y="322" width="16" height="18" rx="6" fill="#F0759D"/>
        <rect x="178" y="322" width="16" height="18" rx="6" fill="#F0759D"/>
        <path d="M222 278 q14 -4 10 10 q-4 10 8 6" stroke="#F0759D" stroke-width="5" fill="none" stroke-linecap="round"/>
    </g>
    <path d="M98 226 Q70 270 104 300" stroke="#A8663E" stroke-width="24" fill="none" stroke-linecap="round"/>
    <circle cx="106" cy="302" r="14" fill="#8E5331"/>
    <path d="M222 226 Q252 270 214 302" stroke="#A8663E" stroke-width="24" fill="none" stroke-linecap="round"/>
    <circle cx="212" cy="303" r="14" fill="#8E5331"/>

    % elif pose == 'investimento':
    <path d="M220 224 Q240 256 222 290" stroke="#A8663E" stroke-width="24" fill="none" stroke-linecap="round"/>
    <circle cx="221" cy="292" r="14" fill="#8E5331"/>
    <g class="capi-planta">
        <path d="M14 302 h56 l-8 44 h-40 Z" fill="#E8A06B"/>
        <rect x="10" y="296" width="64" height="12" rx="6" fill="#D2884F"/>
        <path class="capi-caule" d="M42 298 C42 276 46 262 40 240" stroke="#2BC384" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M42 280 q-20 -2 -26 -16 q18 -2 26 12 Z" fill="#3DDC97"/>
        <path d="M43 266 q18 -6 24 -20 q-18 0 -24 16 Z" fill="#3DDC97"/>
        <g class="capi-moedinhas">
            <circle cx="40" cy="234" r="11" fill="#F5B84B" stroke="#D9952B" stroke-width="3"/>
            <circle cx="20" cy="256" r="8" fill="#F5B84B" stroke="#D9952B" stroke-width="2.5"/>
            <circle cx="66" cy="250" r="8" fill="#F5B84B" stroke="#D9952B" stroke-width="2.5"/>
        </g>
    </g>
    <g class="capi-regador">
        <g class="capi-gotas" fill="#7DD3FC">
            <ellipse cx="22" cy="198" rx="3" ry="5"/>
            <ellipse cx="30" cy="212" rx="3" ry="5"/>
            <ellipse cx="16" cy="214" rx="3" ry="5"/>
        </g>
        <path d="M40 166 L14 182 L19 189 L45 175 Z" fill="#4A86E6"/>
        <rect x="38" y="146" width="48" height="36" rx="10" fill="#5B9DFF"/>
        <path d="M50 146 q12 -20 26 0" stroke="#4A86E6" stroke-width="6" fill="none"/>
        <path d="M102 222 Q78 214 78 184" stroke="#A8663E" stroke-width="24" fill="none" stroke-linecap="round"/>
        <circle cx="80" cy="178" r="14" fill="#8E5331"/>
    </g>

    % elif pose == 'olhos':
    <g class="capi-bracos-baixo">
        <path d="M100 224 Q80 256 98 290" stroke="#A8663E" stroke-width="24" fill="none" stroke-linecap="round"/>
        <circle cx="99" cy="292" r="14" fill="#8E5331"/>
        <path d="M220 224 Q240 256 222 290" stroke="#A8663E" stroke-width="24" fill="none" stroke-linecap="round"/>
        <circle cx="221" cy="292" r="14" fill="#8E5331"/>
    </g>
    <g class="capi-bracos-olhos">
        <g class="capi-pata-e">
            <path d="M104 214 Q94 162 120 118" stroke="#A8663E" stroke-width="24" fill="none" stroke-linecap="round"/>
            <ellipse cx="124" cy="106" rx="23" ry="19" fill="#8E5331"/>
            <path d="M110 96 v-8 M122 92 v-9 M134 94 v-8" stroke="#7A4528" stroke-width="3" stroke-linecap="round"/>
        </g>
        <g class="capi-pata-d">
            <path d="M216 214 Q226 162 200 118" stroke="#A8663E" stroke-width="24" fill="none" stroke-linecap="round"/>
            <ellipse cx="196" cy="106" rx="23" ry="19" fill="#8E5331"/>
            <path d="M186 94 v-8 M198 92 v-9 M210 96 v-8" stroke="#7A4528" stroke-width="3" stroke-linecap="round"/>
        </g>
    </g>
    % end
</svg>
