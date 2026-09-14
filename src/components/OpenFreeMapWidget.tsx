import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  ANCIENT_BIBLICAL_REGIONS, 
  ChapterGeoEvent, 
  getChapterGeoData,
  getShortPlaceName
} from '../data/geoData';
import { Maximize2, Minimize2, Compass, Mountain } from 'lucide-react';

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

  // Chapter-specific events for the currently viewed chapter
  const chapterData = getChapterGeoData(currentBook, currentChapter);
  const chapterEvents = chapterData.events;
  const activeEvent = chapterEvents[activeEventIndex] || chapterEvents[0];

  useEffect(() => {
    setActiveEventIndex(0);
  }, [currentBook, currentChapter]);

  // Auto-sync active event index when a specific verse is selected in the chapter
  useEffect(() => {
    if (activeVerseNumber !== undefined && activeVerseNumber > 0) {
      const matchIdx = chapterEvents.findIndex(
        ev => activeVerseNumber >= ev.verseRange[0] && activeVerseNumber <= ev.verseRange[1]
      );
      if (matchIdx !== -1 && matchIdx !== activeEventIndex) {
        setActiveEventIndex(matchIdx);
        if (onEventSelect) onEventSelect(chapterEvents[matchIdx]);
      }
    }
  }, [activeVerseNumber, chapterEvents]);

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

    // 1. Plot Ancient Biblical Territorial Regions (Judea, Samaria, Galilee, etc.)
    ANCIENT_BIBLICAL_REGIONS.forEach((region) => {
      const regionIcon = L.divIcon({
        className: 'ancient-region-label',
        html: `
          <div style="
            color: rgba(120, 71, 31, 0.65);
            font-family: Georgia, 'Times New Roman', serif;
            font-size: ${region.fontSize};
            font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9), 0 -1px 3px rgba(255, 255, 255, 0.9);
            white-space: nowrap;
            pointer-events: none;
            user-select: none;
          ">
            ${region.name}
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
              ${ev.stepNumber}
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
              ${placeLabel}
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
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 800; background: #FAF3E8; color: #78471F; padding: 2px 6px; border-radius: 4px; border: 1px solid #B4793D;">
              Event ${ev.stepNumber} • ${ev.passageRef}
            </span>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #78471F;">${ev.title}</h4>
          <p style="margin: 0 0 4px 0; font-size: 10.5px; color: #78716C; font-weight: 500;">📍 ${ev.locationName}</p>
          <p style="margin: 0 0 6px 0; font-size: 11.5px; line-height: 1.4; color: #44403C;">${ev.description}</p>
          <div style="font-size: 10px; background: #FAF5ED; padding: 5px; border-radius: 6px; border-left: 2px solid #B4793D; color: #57524E;">
            <strong style="color: #78471F;">Theology:</strong> ${ev.theologicalSignificance}
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

  }, [currentBook, currentChapter, activeEventIndex, mapStyle, showJourneys]);

  return (
    <div className={`openfreemap-card relative rounded-2xl overflow-hidden border border-[#EBE5DC] shadow-[0_4px_20px_rgba(180,160,140,0.08)] transition-all duration-300 ${isExpanded ? 'fixed inset-4 z-50 bg-white flex flex-col shadow-2xl' : ''}`}>
      {/* Top Map Control Bar */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-[1000] flex items-center justify-between gap-2 pointer-events-none">
        {/* Active Chapter Badge */}
        <div className="ios-glass-btn !py-1 !px-2.5 flex items-center gap-1.5 shadow-sm bg-white/95 backdrop-blur-md border border-[#EBE5DC] pointer-events-auto">
          <Mountain className="w-3.5 h-3.5 text-[#B4793D]" />
          <span className="font-bold text-xs text-[#26221F] truncate max-w-[130px] sm:max-w-[180px]">
            {currentBook.toUpperCase()} {currentChapter}
          </span>
          <span className="text-[10px] text-[#B4793D] font-medium bg-[#FAF5ED] px-1.5 py-0.2 rounded border border-[#EBE5DC]">
            {chapterEvents.length} Event{chapterEvents.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Roadless Topographic Map Styles & Fullscreen Toggle */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Map style segmented selector (100% Roadless, 0 Buildings) */}
          <div className="ios-segmented-capsule bg-white/95 backdrop-blur-md shadow-sm border border-[#EBE5DC]">
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
            className="ios-icon-btn bg-white/95 backdrop-blur-md shadow-sm border border-[#EBE5DC]"
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
            <span>📜</span> Chapter {currentChapter} Storyline:
          </span>
          <span className="text-[9.5px] text-[#A8A29E]">
            Step {activeEventIndex + 1} of {chapterEvents.length}
          </span>
        </div>

        {/* Step Buttons for Each Event in Chapter */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5">
          {chapterEvents.map((ev, idx) => {
            const isSelected = idx === activeEventIndex;
            return (
              <button
                key={ev.id}
                onClick={() => {
                  setActiveEventIndex(idx);
                  if (onEventSelect) onEventSelect(ev);
                }}
                className={`flex-shrink-0 text-left px-2 py-1 rounded-lg text-xs transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#FAF3E8] border-[#B4793D] text-[#78471F] font-semibold shadow-xs'
                    : 'bg-[#FAF7F2] border-[#EBE5DC] text-[#57524E] hover:bg-[#FAF5ED] hover:border-[#D4A373]'
                }`}
                title={`${ev.passageRef}: ${ev.title}`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isSelected ? 'bg-[#B4793D] text-white' : 'bg-[#EBE5DC] text-[#78716C]'
                }`}>
                  {ev.stepNumber}
                </span>
                <div className="truncate max-w-[140px]">
                  <span className="text-[11px] font-bold block text-[#26221F] truncate leading-tight">
                    {getShortPlaceName(ev)}
                  </span>
                  <span className="text-[9.5px] text-[#78716C] truncate block leading-none mt-0.5">
                    {ev.title}
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
