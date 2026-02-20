import React from "react";

interface DoodleProps {
    className?: string;
    color?: string;
}

// Star Doodle
export const StarDoodle: React.FC<DoodleProps> = ({ className = "", color = "currentColor" }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M50 10 L55 40 L85 45 L60 65 L65 95 L50 80 L35 95 L40 65 L15 45 L45 40 Z"
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

// Heart Doodle
export const HeartDoodle: React.FC<DoodleProps> = ({ className = "", color = "currentColor" }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M50 85 C50 85 15 60 15 35 C15 20 25 15 35 20 C40 22 45 28 50 35 C55 28 60 22 65 20 C75 15 85 20 85 35 C85 60 50 85 50 85 Z"
            stroke={color}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

// Squiggle Doodle
export const SquiggleDoodle: React.FC<DoodleProps> = ({ className = "", color = "currentColor" }) => (
    <svg className={className} viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M5 25 Q25 5, 45 25 T85 25 Q105 5, 125 25 T165 25 Q185 5, 195 25"
            stroke={color}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
        />
    </svg>
);

// Sparkle Doodle
export const SparkleDoodle: React.FC<DoodleProps> = ({ className = "", color = "currentColor" }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 10 L50 90" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M10 50 L90 50" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M25 25 L75 75" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M75 25 L25 75" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// Arrow Doodle
export const ArrowDoodle: React.FC<DoodleProps> = ({ className = "", color = "currentColor" }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M10 50 Q30 45, 50 50 T90 50"
            stroke={color}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
        />
        <path d="M75 35 L90 50 L75 65" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Circle Doodle
export const CircleDoodle: React.FC<DoodleProps> = ({ className = "", color = "currentColor" }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
            cx="50"
            cy="50"
            r="40"
            stroke={color}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="5,5"
        />
    </svg>
);

// Underline Doodle
export const UnderlineDoodle: React.FC<DoodleProps> = ({ className = "", color = "currentColor" }) => (
    <svg className={className} viewBox="0 0 200 20" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path
            d="M5 10 Q50 5, 100 10 T195 10"
            stroke={color}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
        />
    </svg>
);

// Scribble Circle
export const ScribbleCircle: React.FC<DoodleProps> = ({ className = "", color = "currentColor" }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M50 10 C70 10, 90 30, 90 50 C90 70, 70 90, 50 90 C30 90, 10 70, 10 50 C10 30, 30 10, 50 10"
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
        />
        <path
            d="M50 15 C67 15, 85 33, 85 50 C85 67, 67 85, 50 85 C33 85, 15 67, 15 50 C15 33, 33 15, 50 15"
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
        />
    </svg>
);

export default {
    StarDoodle,
    HeartDoodle,
    SquiggleDoodle,
    SparkleDoodle,
    ArrowDoodle,
    CircleDoodle,
    UnderlineDoodle,
    ScribbleCircle,
};
