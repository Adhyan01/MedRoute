'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import {
  PatientLocation,
  fetchPlaceSuggestions,
  geocodePlaceSuggestion,
  PlaceSuggestion,
  savePatientLocation,
  getStoredPatientLocation,
  loadGoogleMapsScript,
} from '@/lib/googleMaps';

interface PlaceAutocompleteProps {
  onLocationSelected?: (location: PatientLocation) => void;
  placeholder?: string;
  className?: string;
  initialAddress?: string;
}

export default function PlaceAutocomplete({
  onLocationSelected,
  placeholder = 'Search location (e.g. Connaught Place, Noida, Gurugram)',
  className = '',
  initialAddress,
}: PlaceAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loc = getStoredPatientLocation();
    if (initialAddress) {
      setQuery(initialAddress);
    } else if (loc && loc.formattedAddress) {
      setQuery(loc.displayName || loc.formattedAddress);
    }
  }, [initialAddress]);

  // Load Google Maps JS SDK & initialize Places Autocomplete widget if available
  useEffect(() => {
    loadGoogleMapsScript(() => {
      if (
        typeof window !== 'undefined' &&
        (window as any).google?.maps?.places?.Autocomplete &&
        inputRef.current
      ) {
        try {
          const autocomplete = new (window as any).google.maps.places.Autocomplete(
            inputRef.current,
            { fields: ['place_id', 'formatted_address', 'name', 'geometry'] }
          );

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place && place.geometry && place.geometry.location) {
              const selectedLocation: PatientLocation = {
                displayName: place.name || place.formatted_address.split(',')[0],
                formattedAddress: place.formatted_address || place.name,
                latitude: place.geometry.location.lat(),
                longitude: place.geometry.location.lng(),
                placeId: place.place_id || `place-${Date.now()}`,
                source: 'manual',
              };

              setQuery(selectedLocation.displayName);
              setIsOpen(false);
              savePatientLocation(selectedLocation);
              if (onLocationSelected) onLocationSelected(selectedLocation);
            }
          });
        } catch (e) {
          console.warn('Google Places Autocomplete widget init fallback:', e);
        }
      }
    });
  }, [onLocationSelected]);

  // Click outside listener to close suggestion dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
    setSelectedIndex(-1);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!text || text.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimer.current = setTimeout(async () => {
      const results = await fetchPlaceSuggestions(text);
      setSuggestions(results);
      setIsLoading(false);
      setIsOpen(results.length > 0);
    }, 200);
  };

  // Explicit user selection of place suggestion
  const handleSelectSuggestion = async (suggestion: PlaceSuggestion) => {
    setIsOpen(false);
    setIsLoading(true);

    const patientLoc = await geocodePlaceSuggestion(suggestion);
    setQuery(patientLoc.displayName || suggestion.mainText || suggestion.description.split(',')[0]);
    setIsLoading(false);

    // Save canonical location state ONLY upon place selection
    savePatientLocation(patientLoc);

    if (onLocationSelected) {
      onLocationSelected(patientLoc);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#087F8C]" size={20} />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-10 py-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-[#087F8C] focus:ring-2 focus:ring-[#087F8C]/20 outline-none shadow-sm font-medium transition-all"
        />

        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            <Loader2 className="animate-spin" size={18} />
          </div>
        )}
      </div>

      {/* AUTOCOMPLETE SUGGESTION DROPDOWN */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-[100] max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Google Places Suggestions
          </div>

          {suggestions.map((s, index) => {
            const isHighlighted = selectedIndex === index;
            return (
              <div
                key={s.placeId || index}
                onClick={() => handleSelectSuggestion(s)}
                className={`p-3.5 px-4 cursor-pointer flex items-center gap-3 transition-colors ${
                  isHighlighted
                    ? 'bg-[#E6F7F5] dark:bg-teal-950/80 text-[#087F8C] dark:text-teal-300 font-bold'
                    : 'hover:bg-teal-50/60 dark:hover:bg-slate-800/90 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-[#E6F7F5] dark:bg-teal-950 text-[#087F8C] flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ fontFamily: 'Sora' }}>
                    {s.mainText || s.description.split(',')[0]}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {s.secondaryText || s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
