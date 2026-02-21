import React from 'react';
import { cn } from '@/lib/utils';

export const colorMap: Record<string, string> = {
    "Gold": "#D4AF37",
    "Silver": "#C0C0C0",
    "Rose Gold": "#B76E79",
    "White Gold": "#F5F5F5",
    "Black": "#1A1A1A",
    "White": "#FFFFFF",
    "Champagne": "#F7E7CE",
    "Platinum": "#E5E4E2",
    "Emerald": "#50C878",
    "Ruby": "#E0115F",
    "Sapphire": "#0F52BA",
    "Rose": "#FF007F",
    "Diamond": "#E5E4E2",
    "Navy": "#000080",
    "Beige": "#F5F5DC",
    "Charcoal": "#36454F",
    "Camel": "#C19A6B",
    "Grey": "#808080",
    "Blue": "#0000FF",
    "Olive": "#808000",
    "Cream": "#FFFDD0",
    "Red": "#FF0000",
    "Tan": "#D2B48C",
    "Maroon": "#800000",
    "Multi": "linear-gradient(to right, #ff0000, #00ff00, #0000ff)"
};

interface ColorSwatchProps {
    color: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    className?: string;
}

export function ColorSwatch({ color, size = 'sm', showLabel = false, className }: ColorSwatchProps) {
    if (!color) return null;

    const sizeClasses = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-10 h-10'
    };

    const isHex = color.startsWith('#');
    const bgColor = isHex ? color : (colorMap[color] || "#CCCCCC");
    const isMulti = color === "Multi";

    return (
        <div className="inline-flex items-center gap-1.5" title={color}>
            <div
                className={cn(
                    "rounded-md border border-black/10 shadow-sm",
                    sizeClasses[size],
                    className
                )}
                style={{
                    background: isMulti ? bgColor : (bgColor.startsWith('linear-gradient') ? bgColor : undefined),
                    backgroundColor: (!isMulti && !bgColor.startsWith('linear-gradient')) ? bgColor : undefined
                }}
            />
            {showLabel && <span className="text-xs">{color}</span>}
        </div>
    );
}
