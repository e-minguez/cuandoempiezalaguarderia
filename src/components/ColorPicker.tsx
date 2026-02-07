import React, { useState } from 'react';
import { cn } from '../lib/utils';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

const PASTEL_PALETTE = [
  { name: 'Red', hex: '#fecaca' },       // red-200
  { name: 'Orange', hex: '#fed7aa' },    // orange-200
  { name: 'Amber', hex: '#fde68a' },     // amber-200
  { name: 'Yellow', hex: '#fef08a' },    // yellow-200
  { name: 'Lime', hex: '#d9f99d' },      // lime-200
  { name: 'Green', hex: '#bbf7d0' },     // green-200
  { name: 'Emerald', hex: '#a7f3d0' },   // emerald-200
  { name: 'Teal', hex: '#99f6e4' },      // teal-200
  { name: 'Cyan', hex: '#a5f3fc' },      // cyan-200
  { name: 'Sky', hex: '#bae6fd' },       // sky-200
  { name: 'Blue', hex: '#bfdbfe' },      // blue-200
  { name: 'Indigo', hex: '#c7d2fe' },    // indigo-200
  { name: 'Violet', hex: '#ddd6fe' },    // violet-200
  { name: 'Purple', hex: '#e9d5ff' },    // purple-200
  { name: 'Fuchsia', hex: '#f5d0fe' },   // fuchsia-200
  { name: 'Pink', hex: '#fbcfe8' },      // pink-200
  { name: 'Rose', hex: '#fecdd3' },      // rose-200
  { name: 'Slate', hex: '#e2e8f0' },     // slate-200
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-5 h-5 rounded-full border border-black/10 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary transition-transform active:scale-95"
        style={{ backgroundColor: color }}
        title="Cambiar color"
      />

      {/* Backdrop for click-outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Popover */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 p-2 bg-popover rounded-lg shadow-lg border border-border animate-in fade-in zoom-in-95 duration-100">
          <div className="grid grid-cols-6 gap-1.5">
            {PASTEL_PALETTE.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => {
                  onChange(c.hex);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-6 h-6 rounded-full border border-transparent hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary",
                  color === c.hex && "ring-2 ring-offset-1 ring-primary border-primary/20 scale-105"
                )}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
