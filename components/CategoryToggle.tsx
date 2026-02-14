import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface CategoryToggleProps {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const CategoryToggle: React.FC<CategoryToggleProps> = ({ categories, selectedId, onSelect }) => {
  return (
    <div className="flex justify-center w-full mb-3 xs:mb-4 sm:mb-6 px-2 xs:px-0">
      {/* Scrollable container for small screens */}
      <div className="
        relative flex w-full max-w-[280px] xs:max-w-sm sm:max-w-lg items-center p-1 xs:p-1.5 gap-0.5 xs:gap-1
        bg-black/[0.02] dark:bg-white/[0.04]
        rounded-full border border-black/[0.04] dark:border-white/[0.04]
        shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]
        overflow-x-auto scrollbar-hide
        snap-x snap-mandatory
      " style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {categories.map((cat) => {
          const isSelected = selectedId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`
                        relative z-10 flex-1 min-w-[44px] xs:min-w-[52px] sm:min-w-0 flex flex-col items-center justify-center 
                        py-1.5 xs:py-2 px-1 xs:px-2 rounded-full transition-all duration-300 select-none cursor-pointer group
                        snap-center
                        ${isSelected ? 'text-ink' : 'text-subtle/50 hover:text-subtle/80'}
                    `}
            >
              {isSelected && (
                <motion.div
                  layoutId="toggle-pill"
                  className="absolute inset-0 bg-white dark:bg-white/[0.1] shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] rounded-full border border-black/[0.04] dark:border-white/[0.05]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}

              <div className="relative z-20 mb-0.5 xs:mb-1 transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
                <cat.icon className={`w-4 h-4 xs:w-5 xs:h-5 ${isSelected ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
              </div>

              <span className={`relative z-20 text-[9px] xs:text-[10px] sm:text-xs font-medium tracking-wide leading-none transition-all duration-300 whitespace-nowrap ${isSelected ? 'opacity-100 font-semibold' : 'opacity-70'}`}>
                {cat.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  );
};

export default CategoryToggle;