import React from 'react';

export default function AuthIllustration({ type = 'login' }) {
    const getSvg = () => {
        switch (type) {
            case 'register':
                return (
                    <svg className="w-full max-w-lg" viewBox="0 0 520 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="260" cy="250" r="180" fill="#f0fdf4" opacity="0.6" />
                        <ellipse cx="260" cy="420" rx="160" ry="16" fill="#e8e4f0" opacity="0.5" />
                        <rect x="230" y="180" width="60" height="90" rx="12" fill="#10b981" />
                        <rect x="234" y="185" width="52" height="80" rx="10" fill="#34d399" />
                        <circle cx="260" cy="155" r="38" fill="#fbbf24" />
                        <circle cx="260" cy="155" r="34" fill="#fcd34d" />
                        <circle cx="248" cy="150" r="3" fill="#1e293b" />
                        <circle cx="272" cy="150" r="3" fill="#1e293b" />
                        <path d="M250 162 Q260 170 270 162" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
                        <path d="M225 140 Q230 110 260 108 Q290 110 295 140" fill="#7c2d12" opacity="0.9" />
                        <rect x="195" y="175" width="35" height="12" rx="6" fill="#10b981" transform="rotate(-45 195 175)" />
                        <rect x="290" y="175" width="35" height="12" rx="6" fill="#10b981" transform="rotate(45 325 175)" />
                        <rect x="238" y="270" width="16" height="60" rx="8" fill="#047857" />
                        <rect x="266" y="270" width="16" height="60" rx="8" fill="#047857" />
                        <ellipse cx="246" cy="332" rx="14" ry="8" fill="#3b82f6" />
                        <ellipse cx="274" cy="332" rx="14" ry="8" fill="#3b82f6" />
                        <rect x="120" y="120" width="30" height="30" rx="6" fill="#10b981" opacity="0.2" transform="rotate(15 120 120)" />
                        <rect x="380" y="100" width="24" height="24" rx="5" fill="#7c3aed" opacity="0.25" transform="rotate(-10 380 100)" />
                        <circle cx="150" cy="280" r="8" fill="#fbbf24" opacity="0.4" />
                        <circle cx="390" cy="280" r="6" fill="#ef4444" opacity="0.3" />
                        <path d="M170 100 L173 108 L181 108 L175 113 L177 121 L170 116 L163 121 L165 113 L159 108 L167 108Z" fill="#fbbf24" opacity="0.5" />
                        <path d="M370 300 L372 306 L378 306 L373 310 L375 316 L370 312 L365 316 L367 310 L362 306 L368 306Z" fill="#fbbf24" opacity="0.4" />
                    </svg>
                );
            case 'forgot':
                return (
                    <svg className="w-full max-w-lg" viewBox="0 0 520 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="260" cy="250" r="180" fill="#fef3c7" opacity="0.4" />
                        <ellipse cx="260" cy="420" rx="160" ry="16" fill="#e8e4f0" opacity="0.5" />
                        <rect x="210" y="220" width="100" height="80" rx="16" fill="#7c3aed" />
                        <rect x="215" y="225" width="90" height="70" rx="12" fill="#8b5cf6" />
                        <path d="M235 220 V190 Q235 165 260 165 Q285 165 285 190 V220" stroke="#7c3aed" strokeWidth="12" fill="none" strokeLinecap="round" />
                        <circle cx="260" cy="255" r="12" fill="#e9d5ff" />
                        <rect x="256" y="262" width="8" height="16" rx="4" fill="#e9d5ff" />
                        <circle cx="150" cy="180" r="8" fill="#ef4444" opacity="0.3" />
                        <circle cx="400" cy="320" r="6" fill="#10b981" opacity="0.3" />
                        <path d="M180 130 L183 138 L191 138 L185 143 L187 151 L180 146 L173 151 L175 143 L169 138 L177 138Z" fill="#fbbf24" opacity="0.4" />
                        <path d="M350 350 L352 356 L358 356 L353 360 L355 366 L350 362 L345 366 L347 360 L342 356 L348 356Z" fill="#fbbf24" opacity="0.35" />
                    </svg>
                );
            case 'login':
            default:
                return (
                    <svg className="w-full max-w-lg" viewBox="0 0 520 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Background shapes */}
                        <circle cx="260" cy="250" r="180" fill="#f3f0ff" opacity="0.6" />
                        <ellipse cx="260" cy="420" rx="160" ry="16" fill="#e8e4f0" opacity="0.5" />
                        {/* Person body */}
                        <rect x="230" y="180" width="60" height="90" rx="12" fill="#7c3aed" />
                        <rect x="234" y="185" width="52" height="80" rx="10" fill="#8b5cf6" />
                        {/* Head */}
                        <circle cx="260" cy="155" r="38" fill="#fbbf24" />
                        <circle cx="260" cy="155" r="34" fill="#fcd34d" />
                        {/* Eyes */}
                        <circle cx="248" cy="150" r="3" fill="#1e293b" />
                        <circle cx="272" cy="150" r="3" fill="#1e293b" />
                        {/* Smile */}
                        <path d="M250 162 Q260 170 270 162" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
                        {/* Hair */}
                        <path d="M225 140 Q230 110 260 108 Q290 110 295 140" fill="#92400e" opacity="0.9" />
                        {/* Arms */}
                        <rect x="195" y="200" width="35" height="12" rx="6" fill="#7c3aed" transform="rotate(-15 195 200)" />
                        <rect x="290" y="195" width="40" height="12" rx="6" fill="#7c3aed" transform="rotate(10 290 195)" />
                        {/* Tablet in hand */}
                        <rect x="315" y="185" width="50" height="35" rx="5" fill="#3b82f6" />
                        <rect x="319" y="189" width="42" height="27" rx="3" fill="#93c5fd" />
                        {/* Legs */}
                        <rect x="238" y="270" width="16" height="60" rx="8" fill="#4338ca" />
                        <rect x="266" y="270" width="16" height="60" rx="8" fill="#4338ca" />
                        {/* Shoes */}
                        <ellipse cx="246" cy="332" rx="14" ry="8" fill="#ef4444" />
                        <ellipse cx="274" cy="332" rx="14" ry="8" fill="#ef4444" />
                        {/* Floating elements */}
                        <rect x="120" y="120" width="30" height="30" rx="6" fill="#7c3aed" opacity="0.2" transform="rotate(15 120 120)" />
                        <rect x="380" y="100" width="24" height="24" rx="5" fill="#3b82f6" opacity="0.25" transform="rotate(-10 380 100)" />
                        <circle cx="150" cy="280" r="8" fill="#fbbf24" opacity="0.4" />
                        <circle cx="390" cy="280" r="6" fill="#ef4444" opacity="0.3" />
                        <polygon points="100,200 110,185 120,200" fill="#10b981" opacity="0.3" />
                        <polygon points="400,220 408,205 416,220" fill="#f97316" opacity="0.35" />
                        {/* Stars */}
                        <path d="M170 160 L173 168 L181 168 L175 173 L177 181 L170 176 L163 181 L165 173 L159 168 L167 168Z" fill="#fbbf24" opacity="0.5" />
                        <path d="M360 160 L362 166 L368 166 L363 170 L365 176 L360 172 L355 176 L357 170 L352 166 L358 166Z" fill="#fbbf24" opacity="0.4" />
                        {/* Rocket */}
                        <g transform="translate(140,80) rotate(-30)">
                            <rect x="0" y="0" width="14" height="35" rx="7" fill="#6366f1" />
                            <polygon points="7,-8 0,0 14,0" fill="#ef4444" />
                            <circle cx="7" cy="12" r="3" fill="#bfdbfe" />
                            <polygon points="0,25 -5,35 0,30" fill="#f97316" />
                            <polygon points="14,25 19,35 14,30" fill="#f97316" />
                        </g>
                        {/* Clock */}
                        <circle cx="380" cy="150" r="22" fill="#e0e7ff" stroke="#818cf8" strokeWidth="2" />
                        <line x1="380" y1="150" x2="380" y2="137" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" />
                        <line x1="380" y1="150" x2="390" y2="155" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                );
        }
    };

    return (
        <div className="hidden lg:flex flex-1 bg-purple-50 items-center justify-center relative overflow-hidden">
            {getSvg()}
        </div>
    );
}
