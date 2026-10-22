import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, Globe2, X } from 'lucide-react';
import { Language } from '../types';
import { WORLD_LANGUAGES } from '../data/languages';
import { audioSynth } from '../services/audioSynthesizer';

interface SearchableLanguageSelectProps {
  id?: string;
  value: string; // language code
  onChange: (language: Language) => void;
  label?: string;
  placeholder?: string;
  languages?: Language[];
  variant?: 'card' | 'input' | 'compact';
  helperText?: string;
}

export const SearchableLanguageSelect: React.FC<SearchableLanguageSelectProps> = ({
  id = 'searchable-language-select',
  value,
  onChange,
  label,
  placeholder = 'Search language or script...',
  languages = WORLD_LANGUAGES,
  variant = 'card',
  helperText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedLanguage = useMemo(() => {
    return languages.find((l) => l.code === value) || languages[0];
  }, [languages, value]);

  // Filter languages based on search query across name, nativeName, code, family, and script
  const filteredLanguages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return languages;

    return languages.filter((lang) => {
      const matchName = lang.name.toLowerCase().includes(q);
      const matchNative = lang.nativeName.toLowerCase().includes(q);
      const matchCode = lang.code.toLowerCase().includes(q);
      const matchFamily = (lang.family || '').toLowerCase().includes(q);
      const matchScript = (lang.script || '').toLowerCase().includes(q);
      return matchName || matchNative || matchCode || matchFamily || matchScript;
    });
  }, [languages, searchQuery]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto focus search input when opened
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (lang: Language) => {
    audioSynth.playGentleFeedback();
    onChange(lang);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div id={id} ref={containerRef} className="relative w-full text-left">
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}

      {/* Main trigger button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          audioSynth.playGentleFeedback();
        }}
        className={`w-full flex items-center justify-between gap-3 transition-all cursor-pointer ${
          variant === 'card'
            ? 'p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 shadow-xs hover:border-blue-300'
            : variant === 'compact'
            ? 'px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200 text-xs shadow-xs'
            : 'px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-sm shadow-xs hover:border-blue-400'
        } ${isOpen ? 'ring-2 ring-blue-500/20 border-blue-500' : ''}`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-xl sm:text-2xl flex-shrink-0 leading-none" role="img" aria-label={selectedLanguage.name}>
            {selectedLanguage.flag}
          </span>
          <div className="min-w-0 flex-1 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-slate-900 text-sm leading-snug truncate">
                {selectedLanguage.name}
              </span>
              {selectedLanguage.nativeName && 
               selectedLanguage.nativeName.trim().toLowerCase() !== selectedLanguage.name.trim().toLowerCase() && (
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/70 shrink-0">
                  {selectedLanguage.nativeName}
                </span>
              )}
              <span className="text-[11px] font-bold text-slate-400 font-mono shrink-0">
                ({selectedLanguage.code.toUpperCase()})
              </span>
            </div>
            {selectedLanguage.script && selectedLanguage.script !== 'Latin' && (
              <div className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                Script: {selectedLanguage.script}
              </div>
            )}
          </div>
        </div>

        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
      </button>

      {helperText && (
        <p className="mt-1 text-[11px] text-slate-500">{helperText}</p>
      )}

      {/* Searchable Dropdown Popup */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input Bar */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Info Count */}
          <div className="px-3 py-1.5 bg-slate-100/60 border-b border-slate-100 text-[10px] font-bold text-slate-500 flex justify-between items-center uppercase tracking-wider">
            <span>{filteredLanguages.length} Languages Available</span>
            <span>Type name or native script</span>
          </div>

          {/* Filtered Languages List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
            {filteredLanguages.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                <Globe2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No language found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Try searching in English, code, or native script</p>
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = lang.code === value;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelect(lang)}
                    className={`w-full p-2.5 sm:p-3 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 text-blue-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-xl flex-shrink-0 leading-none">{lang.flag}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {lang.name}
                          </span>
                          {lang.nativeName && 
                           lang.nativeName.trim().toLowerCase() !== lang.name.trim().toLowerCase() && (
                            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                              {lang.nativeName}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono">
                            {lang.code.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 truncate mt-0.5">
                          <span className="text-[10px] text-slate-500 truncate font-medium">
                            {lang.family}
                          </span>
                          {lang.script && lang.script !== 'Latin' && (
                            <>
                              <span className="text-[10px] text-slate-400">•</span>
                              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 hidden sm:inline">
                                {lang.script}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mr-1" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
