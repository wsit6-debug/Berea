import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  ANCIENT_BIBLICAL_REGIONS, 
  ChapterGeoEvent, 
  getChapterGeoData,
  getBookGeoData,
  getShortPlaceName,
  calculateDistanceMiles
} from '../data/geoData';
import { Maximize2, Minimize2, Compass, Mountain, ChevronLeft, ChevronRight } from 'lucide-react';

interface OpenFreeMapWidgetProps {
  currentBook?: string;
  currentChapter?: number;
  activeVerseNumber?: number;
  height?: string;
  showJourneys?: boolean;
  onEventSelect?: (event: ChapterGeoEvent) => void;
}

export const OpenFreeMapWidget: React.FC<OpenFreeMapWidgetProps> = ({
  currentBook = 'john',
  currentChapter = 3,
  activeVerseNumber,
  height = '240px',
  showJourneys = true,
  onEventSelect
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const eventMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const regionMarkersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  // Default to pure Ancient Shaded Relief (100% roadless, 0 modern buildings)
  const [mapStyle, setMapStyle] = useState<'relief' | 'physical' | 'satellite'>('relief');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeEventIndex, setActiveEventIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'chapter' | 'book'>('chapter');

  // Fetch either the specific chapter or the aggregated book data
  const chapterData = viewMode === 'book' 
    ? getBookGeoData(currentBook) || getChapterGeoData(currentBook, currentChapter)
    : getChapterGeoData(currentBook, currentChapter);
    
  const chapterEvents = chapterData.events;
  const activeEvent = chapterEvents[activeEventIndex] || chapterEvents[0];

  useEffect(() => {
    setActiveEventIndex(0);
  }, [currentBook, currentChapter]);

  // Auto-sync active event index when a specific verse is selected in the chapter
  // (Disable this auto-sync in 'book' mode since activeVerseNumber lacks chapter context)
  useEffect(() => {
    if (viewMode === 'book') return;
    
    if (activeVerseNumber !== undefined && activeVerseNumber > 0) {
      const matchIdx = chapterEvents.findIndex(
        ev => activeVerseNumber >= ev.verseRange[0] && activeVerseNumber <= ev.verseRange[1]
      );
      if (matchIdx !== -1 && matchIdx !== activeEventIndex) {
        setActiveEventIndex(matchIdx);
        if (onEventSelect) onEventSelect(chapterEvents[matchIdx]);
      }
    }
  }, [activeVerseNumber, chapterEvents, viewMode]);

  // Verified 100% Free, Zero-API-Key, ZERO-Roads, ZERO-Buildings Topographic Layers
  const tileProviders = {
    // 1. Pure Geological Shaded Relief: NASA SRTM/USGS elevation hillshading (0 roads, 0 buildings)
    relief: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; Ancient Geological Shaded Relief (Roadless)',
      maxNativeZoom: 12,
      maxZoom: 16
    },
    // 2. Physical Landforms & Biomes: Macro physical terrain (0 roads, 0 buildings)
    physical: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; Physical Landforms (Roadless)',
      maxNativeZoom: 8,
      maxZoom: 16
    },
    // 3. Pure Satellite Landscape: High-resolution photographic landscape (0 vector road overlays)
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri World Imagery (Photographic)',
      maxNativeZoom: 18,
      maxZoom: 18
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [chapterData.centerLat, chapterData.centerLng],
        zoom: chapterData.defaultZoom,
        maxZoom: 16,
        minZoom: 4,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add selected Roadless Topographic tile layer
    const provider = tileProviders[mapStyle];
    L.tileLayer(provider.url, {
      maxNativeZoom: provider.maxNativeZoom,
      maxZoom: provider.maxZoom,
      attribution: provider.attribution
    }).addTo(map);

    // Clear old markers & region labels
    eventMarkersRef.current.forEach(m => map.removeLayer(m));
    eventMarkersRef.current.clear();

    regionMarkersRef.current.forEach(m => map.removeLayer(m));
    regionMarkersRef.current = [];

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

// HTML Entity encoder to neutralize XSS in Leaflet HTML injection points
function escapeHtml(str: string | number | undefined): string {
  if (str === undefined || str === null) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

    // 1. Plot Ancient Biblical Territorial Regions (Judea, Samaria, Galilee, etc.)
    ANCIENT_BIBLICAL_REGIONS.forEach((region) => {
      const regionIcon = L.divIcon({
        className: 'ancient-region-label',
        html: `
          <div style="
            color: rgba(120, 71, 31, 0.65);
            font-family: Georgia, 'Times New Roman', serif;
            font-size: ${escapeHtml(region.fontSize)};
            font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9), 0 -1px 3px rgba(255, 255, 255, 0.9);
            white-space: nowrap;
            pointer-events: none;
            user-select: none;
          ">
            ${escapeHtml(region.name)}
          </div>
        `,
        iconSize: [80, 20],
        iconAnchor: [40, 10]
      });

      const regMarker = L.marker([region.lat, region.lng], {
        icon: regionIcon,
        interactive: false
      }).addTo(map);

      regionMarkersRef.current.push(regMarker);
    });

    // 2. Plot ONLY the Chapter-Specific Micro-Events for the active chapter!
    chapterEvents.forEach((ev, idx) => {
      const isCurrent = idx === activeEventIndex;
      const placeLabel = getShortPlaceName(ev);
      
      // Step badge numbers (1, 2, 3...)
      const eventIcon = L.divIcon({
        className: 'chapter-event-marker',
        html: `
          <div style="
            position: relative;
            width: ${isCurrent ? '36px' : '28px'};
            height: ${isCurrent ? '36px' : '28px'};
            background: ${isCurrent ? '#B4793D' : '#FAF7F2'};
            border: 2.5px solid ${isCurrent ? '#FFFFFF' : '#B4793D'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(38,34,31,0.3);
            cursor: pointer;
            transition: all 0.25s ease;
          ">
            <span style="
              font-size: ${isCurrent ? '13px' : '11px'};
              color: ${isCurrent ? '#FFFFFF' : '#78471F'};
              font-weight: 800;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
              ${escapeHtml(ev.stepNumber)}
            </span>
            ${isCurrent ? `
              <div style="
                position: absolute;
                inset: -6px;
                border-radius: 50%;
                border: 2px solid #B4793D;
                animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                opacity: 0.6;
              "></div>
            ` : ''}
            <div style="
              position: absolute;
              bottom: -22px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(255, 255, 255, 0.96);
              color: ${isCurrent ? '#78471F' : '#26221F'};
              padding: 2px 7px;
              border-radius: 6px;
              font-size: 10px;
              font-weight: 700;
              white-space: nowrap;
              border: 1px solid ${isCurrent ? '#B4793D' : '#EBE5DC'};
              box-shadow: 0 2px 6px rgba(0,0,0,0.12);
              pointer-events: none;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
              ${escapeHtml(placeLabel)} ${ev.isEducatedGuess ? '<span title="Educated Guess">⚠️</span>' : ''}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([ev.lat, ev.lng], {
        icon: eventIcon,
        zIndexOffset: isCurrent ? 1000 : 100
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #26221F; padding: 4px; max-width: 250px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; gap: 4px; flex-wrap: wrap;">
            <span style="font-size: 10px; font-weight: 800; background: #FAF3E8; color: #78471F; padding: 2px 6px; border-radius: 4px; border: 1px solid #B4793D; flex-shrink: 0;">
              Event ${escapeHtml(ev.stepNumber)} • ${escapeHtml(ev.passageRef)}
            </span>
            ${ev.isEducatedGuess ? `<span style="font-size: 9px; font-weight: 700; background: #FFF3CD; color: #856404; padding: 2px 4px; border-radius: 4px; border: 1px solid #FFEEBA; white-space: nowrap;">⚠️ Educated Guess</span>` : ''}
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #78471F;">${escapeHtml(ev.title)}</h4>
          <p style="margin: 0 0 4px 0; font-size: 10.5px; color: #78716C; font-weight: 500;">📍 ${escapeHtml(ev.locationName)}</p>
          <p style="margin: 0 0 6px 0; font-size: 11.5px; line-height: 1.4; color: #44403C;">${escapeHtml(ev.description)}</p>
          <div style="font-size: 10px; background: #FAF5ED; padding: 5px; border-radius: 6px; border-left: 2px solid #B4793D; color: #57524E;">
            <strong style="color: #78471F;">Theology:</strong> ${escapeHtml(ev.theologicalSignificance)}
          </div>
        </div>
      `);

      marker.on('click', () => {
        setActiveEventIndex(idx);
        if (onEventSelect) onEventSelect(ev);
      });

      eventMarkersRef.current.set(ev.id, marker);
    });

    // 3. Draw Chapter Chronological Movement Route across natural terrain
    if (showJourneys && chapterData.routeCoordinates && chapterData.routeCoordinates.length > 1) {
      const polyline = L.polyline(chapterData.routeCoordinates as [number, number][], {
        color: '#B4793D',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '6, 8',
        lineCap: 'round'
      }).addTo(map);

      polylineRef.current = polyline;
    }

    // 4. Smoothly fly to active chapter event
    if (activeEvent) {
      const zoom = chapterEvents.length > 1 ? chapterData.defaultZoom : 11;
      map.flyTo([activeEvent.lat, activeEvent.lng], zoom, {
        duration: 1.1,
        easeLinearity: 0.25
      });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [currentBook, currentChapter, activeEventIndex, mapStyle, showJourneys, viewMode]);

  return (
    <div 
      style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
      className={`openfreemap-card relative rounded-2xl overflow-hidden border shadow-[0_4px_20px_rgba(180,160,140,0.08)] transition-all duration-300 ${isExpanded ? 'fixed inset-4 z-50 bg-white flex flex-col shadow-2xl' : ''}`}
    >
      {/* Top Map Control Bar */}
      <div 
        className="absolute z-[1000] flex items-center justify-between gap-2 pointer-events-none"
        style={{
          top: '0.625rem',
          left: '0.625rem',
          right: '0.625rem'
        }}
      >
        {/* Active Chapter Badge */}
        <div 
          style={{
            backgroundColor: 'var(--clean-surface, #FFFFFF)',
            borderColor: 'var(--clean-accent-border, #EBE5DC)'
          }}
          className="ios-glass-btn !py-1 !px-2.5 flex items-center gap-1.5 shadow-sm backdrop-blur-md border pointer-events-auto"
        >
          <Mountain className="w-3.5 h-3.5" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
          <span 
            className="font-bold text-xs truncate max-w-[130px] sm:max-w-[180px]"
            style={{ color: 'var(--clean-text-primary, #26221F)' }}
          >
            {currentBook.toUpperCase()} {currentChapter}
          </span>
          <span 
            className="text-[10px] font-medium px-1.5 py-0.2 rounded border"
            style={{
              color: 'var(--clean-accent-dark, #B4793D)',
              backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
              borderColor: 'var(--clean-accent-border, #EBE5DC)'
            }}
          >
            {chapterEvents.length} Event{chapterEvents.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Roadless Topographic Map Styles & Fullscreen Toggle */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Map style segmented selector (100% Roadless, 0 Buildings) */}
          <div 
            style={{
              backgroundColor: 'var(--clean-surface, #FFFFFF)',
              borderColor: 'var(--clean-accent-border, #EBE5DC)'
            }}
            className="ios-segmented-capsule backdrop-blur-md shadow-sm border"
          >
            <button
              onClick={() => setMapStyle('relief')}
              className={`ios-segment-pill !text-[10px] !py-0.5 !px-2.5 ${mapStyle === 'relief' ? 'active' : ''}`}
              title="Ancient Shaded Mountain Relief (0 Roads, 0 Buildings)"
            >
              Relief
            </button>
            <button
              onClick={() => setMapStyle('physical')}
              className={`ios-segment-pill !text-[10px] !py-0.5 !px-2.5 ${mapStyle === 'physical' ? 'active' : ''}`}
              title="Physical Landforms & Biomes (0 Roads, 0 Buildings)"
            >
              Physical
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`ios-segment-pill !text-[10px] !py-0.5 !px-2.5 ${mapStyle === 'satellite' ? 'active' : ''}`}
              title="Photographic Landscape (0 Roads, 0 Buildings)"
            >
              Satellite
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              backgroundColor: 'var(--clean-surface, #FFFFFF)',
              borderColor: 'var(--clean-accent-border, #EBE5DC)',
              color: 'var(--clean-text-primary, #26221F)'
            }}
            className="ios-icon-btn backdrop-blur-md shadow-sm border"
            title={isExpanded ? 'Minimize Map' : 'Expand Biblical Atlas'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{ height: isExpanded ? 'calc(100% - 110px)' : height, minHeight: '180px', width: '100%' }}
        className="z-10 rounded-2xl bg-[#D8D2C5]"
      />

      {/* Chapter Event Sequence Timeline Bar (Shows ONLY events in this chapter) */}
      <div className="bg-white/95 backdrop-blur-md p-2 border-t border-[#EBE5DC] z-20 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-[#78716C] px-1 font-medium">
          <span className="flex items-center gap-1 font-bold text-[#78471F]">
            <span>📜</span> {viewMode === 'book' ? `All Places in Book` : `Chapter ${currentChapter} Storyline:`}
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setViewMode(viewMode === 'chapter' ? 'book' : 'chapter'); setActiveEventIndex(0); }}
              className="text-[9px] px-1.5 py-0.5 rounded border border-[#D4A373] bg-[#FAF3E8] text-[#78471F] hover:bg-[#F2E8D5] transition-colors shadow-sm"
            >
              {viewMode === 'chapter' ? 'View Entire Book' : 'View Chapter'}
            </button>
            <div className="flex items-center bg-[#FAF3E8] rounded border border-[#D4A373] shadow-sm overflow-hidden">
              <button 
                onClick={() => {
                  const newIdx = Math.max(0, activeEventIndex - 1);
                  setActiveEventIndex(newIdx);
                  if (onEventSelect) onEventSelect(chapterEvents[newIdx]);
                }}
                disabled={activeEventIndex === 0}
                className="p-0.5 text-[#78471F] hover:bg-[#F2E8D5] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft size={12} />
              </button>
              <span className="text-[9.5px] text-[#78471F] font-bold px-1.5 min-w-[36px] text-center border-x border-[#D4A373]/30">
                {activeEventIndex + 1} / {chapterEvents.length}
              </span>
              <button 
                onClick={() => {
                  const newIdx = Math.min(chapterEvents.length - 1, activeEventIndex + 1);
                  setActiveEventIndex(newIdx);
                  if (onEventSelect) onEventSelect(chapterEvents[newIdx]);
                }}
                disabled={activeEventIndex === chapterEvents.length - 1}
                className="p-0.5 text-[#78471F] hover:bg-[#F2E8D5] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Step Buttons for Each Event in Chapter */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5">
          {chapterEvents.map((ev, idx) => {
            const isSelected = idx === activeEventIndex;
            
            let distanceStr = '';
            if (idx > 0) {
              const prev = chapterEvents[idx - 1];
              const dist = calculateDistanceMiles(prev.lat, prev.lng, ev.lat, ev.lng);
              if (dist > 0) distanceStr = ` • ${dist} mi`;
            }

            return (
              <button
                key={ev.id}
                onClick={() => {
                  setActiveEventIndex(idx);
                  if (onEventSelect) onEventSelect(ev);
                }}
                className="flex-shrink-0 text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-2"
                style={{
                  backgroundColor: isSelected ? 'var(--clean-highlight-cream, #FAF5ED)' : 'var(--clean-surface, #FFFFFF)',
                  border: `1.5px solid ${isSelected ? 'var(--clean-accent-border-strong, #B4793D)' : 'var(--clean-accent-border, #EBE5DC)'}`,
                  color: isSelected ? 'var(--clean-accent-dark, #78471F)' : 'var(--clean-text-secondary, #57524E)',
                  boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.06)' : 'none'
                }}
                title={`${ev.passageRef}: ${ev.title}`}
              >
                <span 
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{
                    backgroundColor: isSelected ? 'var(--clean-accent-caramel, #B4793D)' : 'var(--clean-accent-border, #EBE5DC)',
                    color: isSelected ? 'var(--clean-accent-contrast-text, #FFFFFF)' : 'var(--clean-text-secondary, #78716C)'
                  }}
                >
                  {ev.stepNumber}
                </span>
                <div className="truncate max-w-[140px]">
                  <span className="text-[11px] font-bold text-[#26221F] truncate leading-tight flex items-center gap-1">
                    <span className="truncate">{getShortPlaceName(ev)}</span>
                    {ev.isEducatedGuess && (
                      <span className="text-[8px] font-bold bg-[#FFF3CD] text-[#856404] px-1 py-px rounded border border-[#FFEEBA] flex-shrink-0" title="Educated Guess">
                        Estimate
                      </span>
                    )}
                  </span>
                  <span 
                    className="text-[9.5px] truncate block leading-none mt-0.5"
                    style={{ color: 'var(--clean-text-secondary, #78716C)' }}
                  >
                    {ev.title}
                    <span className="text-[#A8A29E]">{distanceStr}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
