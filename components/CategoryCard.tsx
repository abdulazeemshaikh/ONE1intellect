import React from 'react';
import { CategoryCardProps } from '../types';

const CategoryCard: React.FC<CategoryCardProps> = ({ icon, label, description, className = '' }) => {
  return (
    <div className={`
      group relative flex flex-col justify-center
      w-full h-full p-3 xs:p-4 sm:p-5 md:p-6 -mt-1 xs:-mt-2 sm:-mt-[14px]
      bg-surface
      rounded-xl xs:rounded-2xl sm:rounded-[2rem]
      border border-black/[0.04] dark:border-white/[0.06]
      shadow-[0_4px_24px_rgba(0,0,0,0.02)]
      transition-all duration-500 ease-out
      cursor-default
      overflow-hidden
      ${className}
    `}>

      {/* Subtle Background Decor - Static/Hidden */}
      <div className="absolute top-0 right-0 w-16 xs:w-20 sm:w-24 h-16 xs:h-20 sm:h-24 bg-gradient-to-br from-black/[0.02] to-transparent dark:from-white/[0.02] rounded-bl-full opacity-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-2 xs:gap-3">
        <div className="flex items-start justify-between">
          <div className="p-2 xs:p-2.5 sm:p-3 rounded-xl xs:rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] text-ink border border-black/[0.02] dark:border-white/[0.02] transition-transform duration-500 origin-top-left">
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4 xs:w-5 xs:h-5 stroke-[1.5]" }) : icon}
          </div>
        </div>

        <div>
          <h3 className="font-sans text-base xs:text-lg font-medium text-ink tracking-tight mb-0.5 xs:mb-1">
            {label}
          </h3>
          <p className="text-xs xs:text-sm text-subtle/80 leading-relaxed font-light pr-2 xs:pr-4 line-clamp-3">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;