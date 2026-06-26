'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

interface DropdownOption {
  id: string;
  label: string;
  sublabel?: string;
  badge?: string;
  badgeColor?: string;
}

interface SearchableDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  renderSelected?: (option: DropdownOption) => React.ReactNode;
  getOptionBadgeColor?: (option: DropdownOption) => string;
}

export function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  renderSelected,
  getOptionBadgeColor,
}: SearchableDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  const filteredOptions = options.filter(option => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      option.label.toLowerCase().includes(query) ||
      option.sublabel?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const clearSelection = () => {
    onChange('');
    setSearchQuery('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {selectedOption ? (
        renderSelected ? (
          <div className="relative">
            {renderSelected(selectedOption)}
            <button
              onClick={clearSelection}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 border-2 border-emerald-500 bg-emerald-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                {selectedOption.label.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{selectedOption.label}</p>
                {selectedOption.sublabel && (
                  <p className="text-sm text-slate-600">{selectedOption.sublabel}</p>
                )}
              </div>
            </div>
            <button
              onClick={clearSelection}
              className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        )
      ) : (
        <div
          className="relative cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full pl-12 pr-10 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
          <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      )}

      {isOpen && !selectedOption && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <div
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {option.label.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{option.label}</p>
                  {option.sublabel && (
                    <p className="text-sm text-slate-500 truncate">{option.sublabel}</p>
                  )}
                </div>
                {option.badge && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                    getOptionBadgeColor ? getOptionBadgeColor(option) : 'bg-slate-100 text-slate-700'
                  }`}>
                    {option.badge}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-slate-500">
              {searchQuery ? (
                <p>No results found for &quot;{searchQuery}&quot;</p>
              ) : (
                <p>No options available</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
