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
import { Maximize2, Minimize2, Compass, Mountain, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

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
  const storylineButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const activeDragElement = useRef<HTMLElement | null>(null);

  // Default to pure Ancient Shaded Relief (100% roadless, 0 modern buildings)
  const [mapStyle, setMapStyle] = useState<'relief' | 'physical' | 'satellite'>('relief');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeEventIndex, setActiveEventIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'chapter' | 'book'>('chapter');
  const [showMentions, setShowMentions] = useState(false);
  const [showMentionedPins, setShowMentionedPins] = useState(true);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsExpanded(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await widgetRef.current?.requestFullscreen();
      } catch (err) {
        console.warn("Fullscreen API failed, falling back to CSS pseudo-fullscreen.");
        setIsExpanded(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsExpanded(false);
    }
  };

  // Fetch either the specific chapter or the aggregated book data
  const chapterData = viewMode === 'book'
    ? getBookGeoData(currentBook) || getChapterGeoData(currentBook, currentChapter)
    : getChapterGeoData(currentBook, currentChapter);

  const chapterEvents = chapterData.events;
  const activeEvent = chapterEvents[activeEventIndex] || chapterEvents[0];

  useEffect(() => {
    const activeEv = chapterEvents[activeEventIndex];
    if (activeEv?.isReferencedOnly) {
      setShowMentions(true);
    }
  }, [activeEventIndex, chapterEvents]);

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

  // Scroll active storyline button into view
  useEffect(() => {
    const activeBtn = storylineButtonsRef.current[activeEventIndex];
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeEventIndex]);

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

    chapterEvents.forEach((ev, idx) => {
      const isCurrent = idx === activeEventIndex;
      const placeLabel = getShortPlaceName(ev);
      const isRef = ev.isReferencedOnly;

      if (isRef && !showMentionedPins) return;

      // Step badge numbers (1, 2, 3...) or small dots for references
      const eventIcon = L.divIcon({
        className: 'chapter-event-marker',
        html: `
          <div style="
            position: relative;
            width: ${isCurrent ? '36px' : isRef ? '20px' : '28px'};
            height: ${isCurrent ? '36px' : isRef ? '20px' : '28px'};
            background: ${isCurrent ? '#B4793D' : isRef ? '#EBE5DC' : '#FAF7F2'};
            border: ${isRef ? '1.5px' : '2.5px'} solid ${isCurrent ? '#FFFFFF' : isRef ? '#D4A373' : '#B4793D'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: ${isRef ? '0 2px 4px rgba(0,0,0,0.05)' : '0 4px 14px rgba(38,34,31,0.3)'};
            cursor: pointer;
            transition: all 0.25s ease;
            opacity: ${isRef && !isCurrent ? 0.75 : 1};
          ">
            <span style="
              font-size: ${isCurrent ? '13px' : isRef ? '9px' : '11px'};
              color: ${isCurrent ? '#FFFFFF' : isRef ? '#78471F' : '#78471F'};
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
              bottom: ${isRef ? '-18px' : '-22px'};
              left: 50%;
              transform: translateX(-50%);
              background: rgba(255, 255, 255, 0.96);
              color: ${isCurrent ? '#78471F' : isRef ? '#78716C' : '#26221F'};
              padding: ${isRef ? '1px 4px' : '2px 7px'};
              border-radius: 6px;
              font-size: ${isRef ? '9px' : '10px'};
              font-weight: ${isRef ? '600' : '700'};
              white-space: nowrap;
              border: 1px solid ${isCurrent ? '#B4793D' : isRef ? 'transparent' : '#EBE5DC'};
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
      const zoom = viewMode === 'book' ? 6 : (chapterEvents.length > 1 ? chapterData.defaultZoom : 11);
      map.flyTo([activeEvent.lat, activeEvent.lng], zoom, {
        duration: 1.1,
        easeLinearity: 0.25
      });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [currentBook, currentChapter, activeEventIndex, mapStyle, showJourneys, viewMode, showMentionedPins]);



  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    const el = e.currentTarget;
    activeDragElement.current = el;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeft.current = el.scrollLeft;
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';
  };

  const handleMouseLeaveOrUp = () => {
    isDragging.current = false;
    if (activeDragElement.current) {
      activeDragElement.current.style.cursor = 'grab';
      activeDragElement.current.style.userSelect = 'auto';
      activeDragElement.current = null;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !activeDragElement.current) return;
    e.preventDefault();
    const el = activeDragElement.current;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    el.scrollLeft = scrollLeft.current - walk;
  };

  const renderStorylineButton = (ev: typeof chapterEvents[0], idx: number) => {
    const isCurrent = idx === activeEventIndex;
    const isRef = ev.isReferencedOnly;
    const distanceStr = ev.distanceFromPrevious ? ` (+${ev.distanceFromPrevious} mi)` : '';

    return (
      <button
        key={ev.id}
        ref={(el) => { storylineButtonsRef.current[idx] = el; }}
        onClick={() => {
          setActiveEventIndex(idx);
          if (onEventSelect) onEventSelect(ev);
        }}
        className={`flex-shrink-0 flex items-center gap-2 p-1.5 pr-3 rounded-lg border text-left transition-all ${
          isCurrent 
            ? 'bg-white border-[#B4793D] shadow-md ring-1 ring-[#B4793D]/20 z-10 scale-100' 
            : isRef
              ? 'bg-[#FAF5ED]/50 border-transparent hover:bg-white hover:border-[#EBE5DC] opacity-75 hover:opacity-100 scale-95 hover:scale-100'
              : 'bg-[#FAF7F2] border-transparent hover:bg-white hover:border-[#EBE5DC] opacity-85 hover:opacity-100 scale-95 hover:scale-100'
        }`}
      >
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
          isCurrent ? 'bg-[#B4793D] text-white' : isRef ? 'bg-[#EBE5DC] text-[#78471F]' : 'bg-[#EBE5DC] text-[#78471F]'
        }`}>
          {ev.stepNumber}
        </div>
        <div>
          <span className={`block text-[11px] font-bold flex items-center gap-1 leading-tight ${isCurrent ? 'text-[#78471F]' : isRef ? 'text-[#78716C]' : 'text-[#26221F]'}`}>
            <span className="truncate">{getShortPlaceName(ev)}</span>
            {ev.isEducatedGuess && (
              <span className="text-[8px] font-bold bg-[#FFF3CD] text-[#856404] px-1 py-px rounded border border-[#FFEEBA] flex-shrink-0" title="Educated Guess">
                Estimate
              </span>
            )}
          </span>
          <span className="text-[9.5px] text-[#78716C] truncate block leading-none mt-0.5">
            {ev.title}
            <span className="text-[#A8A29E]">{distanceStr}</span>
          </span>
        </div>
      </button>
    );
  };

  return (
    <div ref={widgetRef} className={`openfreemap-card relative rounded-2xl overflow-hidden border border-[#EBE5DC] shadow-[0_4px_20px_rgba(180,160,140,0.08)] transition-all duration-300 ${isExpanded ? 'fixed inset-4 z-50 bg-white flex flex-col shadow-2xl' : ''}`}>
      {/* Top Map Control Bar */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none" style={{ zIndex: 1000 }}>
        {/* Active Chapter Badge */}
        <div className="ios-glass-btn !py-1 !px-2.5 flex items-center gap-1.5 shadow-sm bg-white/95 border border-[#EBE5DC] pointer-events-auto">
          <Mountain className="w-3.5 h-3.5 text-[#B4793D]" />
          <span className="font-bold text-xs text-[#26221F] truncate max-w-[130px] sm:max-w-[180px]">
            {viewMode === 'book' ? currentBook.toUpperCase() : `${currentBook.toUpperCase()} ${currentChapter}`}
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
          <div className="ios-segmented-capsule bg-white/95 shadow-sm border border-[#EBE5DC]">
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

          {chapterEvents.some(ev => ev.isReferencedOnly) && (
            <button
              onClick={() => setShowMentionedPins(!showMentionedPins)}
              className={`flex items-center gap-1 h-[26px] px-2.5 rounded-full border shadow-sm transition-all text-[10px] font-bold tracking-wider ${
                showMentionedPins 
                  ? 'bg-[#B4793D] border-[#B4793D] text-white hover:bg-[#9A632E]' 
                  : 'bg-white/95 border-[#EBE5DC] text-[#78716C] hover:bg-[#FAF5ED] hover:text-[#26221F]'
              }`}
              title={showMentionedPins ? "Hide Mentioned Pins" : "Show Mentioned Pins"}
            >
              {showMentionedPins ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline uppercase">{showMentionedPins ? 'Pins On' : 'Pins Off'}</span>
            </button>
          )}

          <button
            onClick={handleToggleFullscreen}
            className="ios-icon-btn bg-white/95 shadow-sm border border-[#EBE5DC]"
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
        className="z-0 rounded-2xl bg-[#D8D2C5]"
      />

      {/* Chapter Event Sequence Timeline Bar (Shows ONLY events in this chapter) */}
      <div className="bg-white/95 p-2 border-t border-[#EBE5DC] z-20 space-y-1.5 relative">
        <div className="flex items-center justify-between text-[10px] text-[#78716C] px-1 font-medium">
          <span className="flex items-center gap-1 font-bold text-[#78471F]">
            <span>📜</span> {viewMode === 'book' ? `All Places in Book` : `Chapter ${currentChapter} Storyline:`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setViewMode(viewMode === 'chapter' ? 'book' : 'chapter');
                setActiveEventIndex(0);
              }}
              className="text-[#B4793D] hover:text-[#78716C] underline transition-colors px-1 border-r border-[#D4A373]/30 mr-1 pr-2 text-[9.5px]"
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
        <div className="flex flex-col gap-1.5 w-full">
          {/* Main Physical Storyline Row */}
          <div className="flex items-center w-full">
            <div 
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeaveOrUp}
              onMouseUp={handleMouseLeaveOrUp}
              onMouseMove={handleMouseMove}
              className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5 cursor-grab flex-1"
            >
              {chapterEvents.map((ev, idx) => ({ ev, idx }))
                .filter(item => !item.ev.isReferencedOnly)
                .map(item => renderStorylineButton(item.ev, item.idx))}
            </div>
          </div>

          {/* Secondary Mentioned Places Row */}
          {chapterEvents.some(ev => ev.isReferencedOnly) && (
            <div className="flex flex-col gap-1.5 pt-2 mt-0.5 border-t border-dashed border-[#EBE5DC] w-full">
              <div className="flex items-center justify-between px-1">
                <button
                  onClick={() => setShowMentions(!showMentions)}
                  className="flex items-center gap-1 text-[10px] font-bold text-[#B4793D] hover:text-[#78471F] uppercase tracking-wider transition-colors"
                  title={showMentions ? "Hide Mentioned Places" : "Show Mentioned Places"}
                >
                  <span>🔗 Mentioned Places</span>
                  {showMentions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>

              {showMentions && (
                <div 
                  onMouseDown={handleMouseDown}
                  onMouseLeave={handleMouseLeaveOrUp}
                  onMouseUp={handleMouseLeaveOrUp}
                  onMouseMove={handleMouseMove}
                  className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5 cursor-grab"
                >
                  {chapterEvents.map((ev, idx) => ({ ev, idx }))
                    .filter(item => item.ev.isReferencedOnly)
                    .map(item => renderStorylineButton(item.ev, item.idx))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
