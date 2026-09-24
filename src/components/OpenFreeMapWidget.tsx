import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  ANCIENT_BIBLICAL_REGIONS,
  ChapterGeoEvent,
  getChapterGeoData,
  getBookGeoData,
  getShortPlaceName,
  calculateDistanceMiles,
  RouteSegment,
  getRouteJourneyStats
} from '../data/geoData';
import { Maximize2, Minimize2, Compass, Mountain, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

function escapeHtml(str: string | number | undefined): string {
  if (str === undefined || str === null) return '';
  return String(str).replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

function createEventIcon(ev: ChapterGeoEvent, isCurrent: boolean) {
  const isRef = ev.isReferencedOnly;
  const placeLabel = getShortPlaceName(ev);

  return L.divIcon({
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
          ${escapeHtml(placeLabel)}${ev.isDeparturePoint && ev.departureFromChapter ? ` <span style="font-size: 8px; font-weight: 400; color: #8C827A; margin-left: 2px;">• From ${escapeHtml(ev.departureFromChapter)}</span>` : ''} ${ev.isEducatedGuess ? '<span title="Educated Guess" style="font-size: 8px; opacity: 0.6; font-weight: normal;">(est)</span>' : ''}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
}

function bindEventPopup(
  marker: L.Marker,
  ev: ChapterGeoEvent,
  distInfo?: { distanceMiles?: number; travelDays?: number; label?: string; roadName?: string; mode?: string; isOrigin?: boolean } | null
) {
  const daysText = distInfo?.travelDays
    ? (distInfo.travelDays < 1 ? `${Math.round(distInfo.travelDays * 24)}h` : `~${distInfo.travelDays}d`)
    : undefined;

  marker.bindPopup(`
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #26221F; padding: 4px; max-width: 260px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; gap: 4px; flex-wrap: wrap;">
        <span style="font-size: 10px; font-weight: 800; background: #FAF3E8; color: #78471F; padding: 2px 6px; border-radius: 4px; border: 1px solid #B4793D; flex-shrink: 0;">
          ${ev.isReferencedOnly ? 'Reference' : 'Storyline'} ${escapeHtml(ev.stepNumber)} • ${escapeHtml(ev.passageRef)}
        </span>
        ${ev.isDeparturePoint ? `<span style="font-size: 9px; font-weight: 400; color: #8C827A; white-space: nowrap;">From ${escapeHtml(ev.departureFromChapter || 'previous chapter')}</span>` : ''}
        ${ev.isEducatedGuess ? `<span style="font-size: 9px; font-weight: 700; background: #FFF3CD; color: #856404; padding: 2px 4px; border-radius: 4px; border: 1px solid #FFEEBA; white-space: nowrap;">Educated Guess</span>` : ''}
      </div>
      <h4 style="margin: 0 0 3px 0; font-size: 13px; font-weight: 700; color: #78471F;">${escapeHtml(ev.title)}</h4>
      <p style="margin: 0 0 4px 0; font-size: 10.5px; color: #78716C; font-weight: 500;">${escapeHtml(ev.locationName)}${ev.modernLocation ? ` (${escapeHtml(ev.modernLocation)})` : ''}</p>

      ${distInfo && !distInfo.isOrigin && distInfo.distanceMiles ? `
        <div style="display: flex; flex-direction: column; gap: 2px; margin-bottom: 6px; font-size: 9.5px; background: #FAF5ED; padding: 4px 6px; border-radius: 6px; border: 1px solid #EBE5DC;">
          <div style="display: flex; justify-content: space-between; font-weight: 700; color: #B4793D;">
            <span>+${distInfo.distanceMiles} miles</span>
            <span>${daysText || ''}</span>
          </div>
          ${distInfo.roadName ? `<div style="color: #78471F; font-size: 9px;">Road: <strong>${escapeHtml(distInfo.roadName)}</strong></div>` : ''}
        </div>
      ` : ''}

      <p style="margin: 0 0 6px 0; font-size: 11px; line-height: 1.4; color: #44403C;">${escapeHtml(ev.description)}</p>
      ${ev.theologicalSignificance ? `
        <div style="font-size: 10px; background: #FAF5ED; padding: 5px; border-radius: 6px; border-left: 2px solid #B4793D; color: #57524E; line-height: 1.35;">
          <strong style="color: #78471F;">Theology:</strong> ${escapeHtml(ev.theologicalSignificance)}
        </div>
      ` : ''}
    </div>
  `, { maxWidth: 280 });
}

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
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routePolylinesRef = useRef<L.Polyline[]>([]);
  const storylineButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const activeDragElement = useRef<HTMLElement | null>(null);

  // Default to pure Ancient Shaded Relief (100% roadless, 0 modern buildings)
  const [mapStyle, setMapStyle] = useState<'relief' | 'satellite'>('relief');
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'storyline' | 'references'>('storyline');
  const [activeStorylineIndex, setActiveStorylineIndex] = useState<number>(0);
  const [activeReferenceIndex, setActiveReferenceIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'chapter' | 'book'>('chapter');
  const [showMentionedPins, setShowMentionedPins] = useState(true);
  const widgetRef = useRef<HTMLDivElement>(null);

  const prevVerseRef = useRef<number | undefined>(activeVerseNumber);
  const prevChapterKeyRef = useRef<string>(`${currentBook}_${currentChapter}_${viewMode}`);
  const lastLoadedChapterKey = useRef<string>('');

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

  // Fetch either the specific chapter or the aggregated book data (memoized)
  const chapterData = useMemo(() => {
    return viewMode === 'book'
      ? getBookGeoData(currentBook) || getChapterGeoData(currentBook, currentChapter)
      : getChapterGeoData(currentBook, currentChapter);
  }, [currentBook, currentChapter, viewMode]);

  const chapterEvents = chapterData.events;
  const storylineEvents = useMemo(() => chapterEvents.filter(e => !e.isReferencedOnly), [chapterEvents]);
  const referencedEvents = useMemo(() => chapterEvents.filter(e => e.isReferencedOnly), [chapterEvents]);

  // Sync active tab and index on chapter/book change
  useEffect(() => {
    const currentKey = `${currentBook}_${currentChapter}_${viewMode}`;
    if (prevChapterKeyRef.current !== currentKey) {
      prevChapterKeyRef.current = currentKey;
      prevVerseRef.current = activeVerseNumber;
      if (storylineEvents.length > 0) {
        setActiveTab('storyline');
        setActiveStorylineIndex(0);
        setActiveReferenceIndex(0);
      } else {
        setActiveTab('references');
        setActiveStorylineIndex(0);
        setActiveReferenceIndex(0);
      }
    }
  }, [currentBook, currentChapter, viewMode, storylineEvents.length]);

  const currentTabEvents = activeTab === 'storyline' ? storylineEvents : referencedEvents;
  const currentTabIndex = activeTab === 'storyline' ? activeStorylineIndex : activeReferenceIndex;
  const activeEvent = currentTabEvents[currentTabIndex] || currentTabEvents[0] || chapterEvents[0];

  // Auto-sync when activeVerseNumber externally changes
  useEffect(() => {
    if (viewMode === 'book') return;

    if (activeVerseNumber !== undefined && activeVerseNumber > 0 && activeVerseNumber !== prevVerseRef.current) {
      prevVerseRef.current = activeVerseNumber;

      // If active event already covers activeVerseNumber, do not alter selection or jump tabs
      if (activeEvent && activeEvent.verseRange && activeVerseNumber >= activeEvent.verseRange[0] && activeVerseNumber <= activeEvent.verseRange[1]) {
        return;
      }

      // If user is on references tab, check referencedEvents first to avoid abruptly switching them to storyline
      if (activeTab === 'references') {
        const rIdx = referencedEvents.findIndex(
          ev => activeVerseNumber >= ev.verseRange[0] && activeVerseNumber <= ev.verseRange[1]
        );
        if (rIdx !== -1) {
          setActiveReferenceIndex(rIdx);
          if (onEventSelect) onEventSelect(referencedEvents[rIdx]);
          return;
        }
      }

      const sIdx = storylineEvents.findIndex(
        ev => activeVerseNumber >= ev.verseRange[0] && activeVerseNumber <= ev.verseRange[1]
      );
      if (sIdx !== -1) {
        setActiveTab('storyline');
        setActiveStorylineIndex(sIdx);
        if (onEventSelect) onEventSelect(storylineEvents[sIdx]);
        return;
      }
      const rIdx = referencedEvents.findIndex(
        ev => activeVerseNumber >= ev.verseRange[0] && activeVerseNumber <= ev.verseRange[1]
      );
      if (rIdx !== -1) {
        setActiveTab('references');
        setActiveReferenceIndex(rIdx);
        if (onEventSelect) onEventSelect(referencedEvents[rIdx]);
      }
    }
  }, [activeVerseNumber, viewMode, activeEvent, activeTab, storylineEvents, referencedEvents, onEventSelect]);

  // Scroll active storyline button into view
  useEffect(() => {
    const activeBtn = storylineButtonsRef.current[currentTabIndex];
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab, currentTabIndex]);

  const getEventDistanceInfo = (ev: ChapterGeoEvent) => {
    const list = ev.isReferencedOnly ? referencedEvents : storylineEvents;
    const idx = list.findIndex(e => e.id === ev.id);
    if (idx < 0) return null;
    if (idx === 0) {
      return { isOrigin: true, label: ev.isReferencedOnly ? '1st Mention' : 'Origin' };
    }

    const curr = list[idx];
    const prev = list[idx - 1];
    if (!prev) return null;

    // Check if there is a matching segment in routeSegments
    if (chapterData.routeSegments && chapterData.routeSegments.length > 0) {
      const segs = chapterData.routeSegments;
      let seg = segs[idx - 1];
      if (!seg || !seg.toName.toLowerCase().includes(getShortPlaceName(curr).toLowerCase())) {
        const found = segs.find(s =>
          s.toName.toLowerCase().includes(getShortPlaceName(curr).toLowerCase()) ||
          curr.locationName.toLowerCase().includes(s.toName.toLowerCase())
        );
        if (found) seg = found;
      }

      if (seg) {
        const daysLabel = seg.travelDays < 1
          ? `${Math.round(seg.travelDays * 24)}h`
          : `${seg.travelDays}d`;
        return {
          isOrigin: false,
          distanceMiles: seg.distanceMiles,
          travelDays: seg.travelDays,
          label: `+${seg.distanceMiles} mi • ~${daysLabel}`,
          roadName: seg.historicalRoadName,
          mode: seg.mode
        };
      }
    }

    // Fallback: calculate distance from coordinates
    const miles = curr.distanceFromPrevious || calculateDistanceMiles(prev.lat, prev.lng, curr.lat, curr.lng);
    if (miles > 0) {
      const estDays = Math.max(0.1, Number((miles / 20).toFixed(1)));
      const daysLabel = estDays < 1 ? `${Math.round(estDays * 24)}h` : `${estDays}d`;
      return {
        isOrigin: false,
        distanceMiles: miles,
        travelDays: estDays,
        label: `+${miles} mi • ~${daysLabel}`,
        mode: 'land_walking' as const
      };
    }

    return null;
  };

  // Verified 100% Free, Zero-API-Key, ZERO-Roads, ZERO-Buildings Topographic Layers
  const tileProviders = {
    // 1. Pure Geological Shaded Relief: NASA SRTM/USGS elevation hillshading (0 roads, 0 buildings)
    relief: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; Ancient Geological Shaded Relief (Roadless)',
      maxNativeZoom: 12,
      maxZoom: 16
    },
    // 2. Pure Satellite Landscape: Raw high-resolution photographic landscape (0 vector road overlays)
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

    if (routePolylinesRef.current.length > 0) {
      routePolylinesRef.current.forEach(p => {
        try { map.removeLayer(p); } catch { }
      });
      routePolylinesRef.current = [];
    }

    if (routeLayerGroupRef.current) {
      map.removeLayer(routeLayerGroupRef.current);
      routeLayerGroupRef.current = null;
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

    chapterEvents.forEach((ev) => {
      if (ev.isReferencedOnly && !showMentionedPins) return;

      const isCurrent = activeEvent && activeEvent.id === ev.id;
      const eventIcon = createEventIcon(ev, !!isCurrent);

      const marker = L.marker([ev.lat, ev.lng], {
        icon: eventIcon,
        zIndexOffset: isCurrent ? 1000 : 100
      }).addTo(map);

      const distInfo = getEventDistanceInfo(ev);
      bindEventPopup(marker, ev, distInfo);

      marker.on('click', () => {
        if (ev.isReferencedOnly) {
          const rIdx = referencedEvents.findIndex(e => e.id === ev.id);
          setActiveTab('references');
          if (rIdx !== -1) setActiveReferenceIndex(rIdx);
        } else {
          const sIdx = storylineEvents.findIndex(e => e.id === ev.id);
          setActiveTab('storyline');
          if (sIdx !== -1) setActiveStorylineIndex(sIdx);
        }
        marker.openPopup();
        if (onEventSelect) onEventSelect(ev);
      });

      eventMarkersRef.current.set(ev.id, marker);
    });

    // 3. Draw Chapter Chronological Movement Route across natural terrain & Roman roads
    if (showJourneys) {
      const allRoutePoints: [number, number][] = [];

      if (chapterData.routeSegments && chapterData.routeSegments.length > 0) {
        chapterData.routeSegments.forEach((segment: RouteSegment) => {
          const isSea = segment.mode === 'sea_sailing';
          const isCaravan = segment.mode === 'desert_caravan';
          const isFallback = segment.historicalRoadName?.includes('Straight Line') || segment.historicalRoadName?.includes('Direct Path') || segment.historicalRoadName?.includes('No Recorded Road');

          segment.coordinates.forEach(c => allRoutePoints.push(c));

          // A. High-contrast white halo casing so route pops against shaded mountain relief
          const halo = L.polyline(segment.coordinates, {
            color: '#FFFFFF',
            weight: isSea ? 5.5 : (isFallback ? 5.0 : 6.5),
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);
          routePolylinesRef.current.push(halo);

          // B. High-visibility core line (Roman terracotta for land, royal Mediterranean blue for sea, amber for caravan, stone gray for direct path)
          const strokeColor = isFallback ? (isSea ? '#2563EB' : '#78716C') : (isSea ? '#1D4ED8' : (isCaravan ? '#D97706' : '#C05621'));
          const dashStyle = isFallback ? '6, 8' : (isSea ? '6, 6' : (isCaravan ? '4, 6' : undefined));
          const initialWeight = isFallback ? 2.8 : (isSea ? 3.0 : 3.8);

          const polyline = L.polyline(segment.coordinates, {
            color: strokeColor,
            weight: initialWeight,
            opacity: 1.0,
            dashArray: dashStyle,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);

          const daysText = segment.travelDays < 1
            ? `${Math.round(segment.travelDays * 24)} hours`
            : `~${segment.travelDays} ${segment.travelDays === 1 ? 'day' : 'days'}`;

          const modeLabel = isSea ? 'Maritime Sailing' : (isCaravan ? 'Desert Caravan' : (isFallback ? 'Direct Path / No Road' : 'Foot / Roman Road'));

          polyline.bindTooltip(`
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #26221F; max-width: 250px; white-space: normal; word-wrap: break-word; overflow-wrap: break-word;">
              <div style="font-size: 10px; font-weight: 800; color: ${isFallback ? '#78716C' : '#C05621'}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; white-space: normal; word-wrap: break-word;">
                ${escapeHtml(segment.historicalRoadName || (isFallback ? 'Direct Path (No Recorded Road)' : 'Historical Path'))}
              </div>
              <div style="font-size: 12px; font-weight: 700; color: #26221F; margin-bottom: 3px; white-space: normal; word-wrap: break-word; line-height: 1.3;">
                ${escapeHtml(segment.fromName)} → ${escapeHtml(segment.toName)}
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 6px 8px; font-size: 10.5px; color: #57524E; font-weight: 500; margin-bottom: 3px;">
                <span><strong>${segment.distanceMiles} mi</strong></span>
                <span><strong>${daysText}</strong></span>
                <span>(${modeLabel})</span>
              </div>
              ${segment.notes ? `<div style="font-size: 10px; line-height: 1.35; color: #78716C; border-top: 1px solid #EBE5DC; padding-top: 4px; margin-top: 4px; white-space: normal; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(segment.notes)}</div>` : ''}
              ${isFallback ? `<div style="font-size: 9px; color: #44403C; background: #E7E5E4; padding: 2px 5px; border-radius: 4px; display: inline-block; margin-top: 4px; white-space: normal; font-weight: 600;">No Recorded Ancient Road (Direct Line)</div>` : (segment.isScholarlyEstimate ? `<div style="font-size: 9px; color: #856404; background: #FFF3CD; padding: 2px 5px; border-radius: 4px; display: inline-block; margin-top: 4px; white-space: normal;">Scholarly Reconstruction</div>` : '')}
            </div>
          `, { sticky: true, opacity: 0.98, className: 'berea-route-tooltip' });

          polyline.on('mouseover', function () {
            polyline.setStyle({
              weight: initialWeight + 2.5,
              opacity: 1.0,
              color: isSea ? '#1E40AF' : '#9A3412'
            });
            polyline.bringToFront();
          });

          polyline.on('mouseout', function () {
            polyline.setStyle({
              weight: initialWeight,
              opacity: 1.0,
              color: strokeColor
            });
          });

          routePolylinesRef.current.push(polyline);
        });
      } else if (chapterData.routeCoordinates && chapterData.routeCoordinates.length > 1) {
        const coords = chapterData.routeCoordinates as [number, number][];
        coords.forEach(c => allRoutePoints.push(c));

        // High-contrast halo casing
        const halo = L.polyline(coords, {
          color: '#FFFFFF',
          weight: 6.0,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);
        routePolylinesRef.current.push(halo);

        // Core line
        const polyline = L.polyline(coords, {
          color: '#C05621',
          weight: 3.5,
          opacity: 1.0,
          dashArray: '6, 8',
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);
        routePolylinesRef.current.push(polyline);
      }

      // 4. Frame route bounds smoothly for both chapter and whole-book views
      if (allRoutePoints.length > 1) {
        const bounds = L.latLngBounds(allRoutePoints);
        map.fitBounds(bounds, {
          padding: [35, 35],
          maxZoom: viewMode === 'book' ? 7 : (chapterData.defaultZoom || 9)
        });
      } else if (chapterEvents.length > 1) {
        const bounds = L.latLngBounds(chapterEvents.map(e => [e.lat, e.lng]));
        map.fitBounds(bounds, {
          padding: [35, 35],
          maxZoom: viewMode === 'book' ? 7 : (chapterData.defaultZoom || 9)
        });
      } else if (activeEvent) {
        const zoom = viewMode === 'book' ? 6 : (chapterEvents.length > 1 ? chapterData.defaultZoom : 11);
        map.setView([activeEvent.lat, activeEvent.lng], zoom);
      }
    } else if (activeEvent) {
      const zoom = viewMode === 'book' ? 6 : (chapterEvents.length > 1 ? chapterData.defaultZoom : 11);
      map.setView([activeEvent.lat, activeEvent.lng], zoom);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [chapterData, mapStyle, showJourneys, viewMode, showMentionedPins]);

  // Dedicated effect to highlight and pan to activeEvent smoothly without resetting layers
  useEffect(() => {
    chapterEvents.forEach((ev) => {
      const marker = eventMarkersRef.current.get(ev.id);
      if (marker) {
        const isCurrent = activeEvent && activeEvent.id === ev.id;
        marker.setIcon(createEventIcon(ev, !!isCurrent));
        marker.setZIndexOffset(isCurrent ? 1000 : 100);
      }
    });

    const currentKey = `${currentBook}_${currentChapter}_${viewMode}`;
    // If it's a new chapter/viewMode change, the base effect handled framing; do not override
    if (lastLoadedChapterKey.current !== currentKey) {
      lastLoadedChapterKey.current = currentKey;
      return;
    }

    if (activeEvent && mapInstanceRef.current) {
      const map = mapInstanceRef.current;
      const targetZoom = Math.max(map.getZoom(), 11);
      map.flyTo([activeEvent.lat, activeEvent.lng], targetZoom, {
        duration: 0.75,
        easeLinearity: 0.25
      });
    }
  }, [activeEvent, chapterEvents, currentBook, currentChapter, viewMode]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      const timer = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [height, isExpanded]);

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

  const renderStorylineButton = (ev: ChapterGeoEvent, isCurrent: boolean, idx: number, onClick: () => void) => {
    const isRef = ev.isReferencedOnly;
    const distInfo = getEventDistanceInfo(ev);

    return (
      <button
        key={ev.id}
        ref={(el) => { storylineButtonsRef.current[idx] = el; }}
        onClick={onClick}
        className={`flex-shrink-0 flex items-center gap-2 p-1.5 pr-2.5 rounded-lg border text-left transition-all ${isCurrent
          ? 'bg-white border-[#B4793D] shadow-md ring-1 ring-[#B4793D]/20 z-10 scale-100'
          : isRef
            ? 'bg-[#FAF5ED]/50 border-transparent hover:bg-white hover:border-[#EBE5DC] opacity-75 hover:opacity-100 scale-95 hover:scale-100'
            : 'bg-[#FAF7F2] border-transparent hover:bg-white hover:border-[#EBE5DC] opacity-85 hover:opacity-100 scale-95 hover:scale-100'
          }`}
      >
        <div
          style={{ fontSize: '10px' }}
          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${isCurrent ? 'bg-[#B4793D] text-white' : 'bg-[#EBE5DC] text-[#78471F]'
          }`}>
          {ev.stepNumber}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 justify-between">
            <span
              style={{ fontSize: '11px' }}
              className={`block font-bold truncate leading-tight ${isCurrent ? 'text-[#78471F]' : isRef ? 'text-[#78716C]' : 'text-[#26221F]'}`}
            >
              {getShortPlaceName(ev)}
            </span>
            {distInfo && (
              <span
                style={{ fontSize: '8.5px' }}
                className={`font-semibold px-1 py-0.5 rounded border leading-none flex-shrink-0 whitespace-nowrap ${distInfo.isOrigin
                ? 'bg-white text-[#78716C] border-[#EBE5DC]'
                : 'bg-[#FAF5ED] text-[#B4793D] border-[#D4A373]/40'
                }`}>
                {distInfo.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            {ev.isDeparturePoint && ev.departureFromChapter && (
              <span
                style={{ fontSize: '8px', lineHeight: 1 }}
                className="text-[#8C827A] font-normal flex-shrink-0"
              >
                From {ev.departureFromChapter} •
              </span>
            )}
            <span
              style={{ fontSize: '9px' }}
              className="text-[#78716C] truncate block leading-none max-w-[130px]"
            >
              {ev.title}
            </span>
          </div>
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
          <span className="text-[10px] text-[#B4793D] font-medium bg-[#FAF5ED] px-1.5 py-0.2 rounded border border-[#EBE5DC]">
            {storylineEvents.length} Storyline{referencedEvents.length > 0 ? ` • ${referencedEvents.length} Ref${referencedEvents.length === 1 ? '' : 's'}` : ''}
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
              onClick={() => setMapStyle('satellite')}
              className={`ios-segment-pill !text-[10px] !py-0.5 !px-2.5 ${mapStyle === 'satellite' ? 'active' : ''}`}
              title="Photographic Landscape (0 Roads, 0 Buildings)"
            >
              Satellite
            </button>
          </div>

          {referencedEvents.length > 0 && (
            <button
              onClick={() => setShowMentionedPins(!showMentionedPins)}
              className={`flex items-center gap-1 h-[26px] px-2.5 rounded-full border shadow-sm transition-all text-[10px] font-bold tracking-wider ${showMentionedPins
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

      {/* Chapter Event Sequence Timeline Bar */}
      <div className="bg-white/95 p-2 border-t border-[#EBE5DC] z-20 space-y-1.5 relative">
        <div className="flex items-center justify-between text-[10px] text-[#78716C] px-1 font-medium flex-wrap gap-1">
          {/* Tabs: Storyline vs References */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setActiveTab('storyline');
                if (storylineEvents[activeStorylineIndex] && onEventSelect) {
                  onEventSelect(storylineEvents[activeStorylineIndex]);
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-bold transition-all ${activeTab === 'storyline'
                ? 'bg-[#B4793D] text-white shadow-xs'
                : 'bg-[#FAF5ED] text-[#78716C] hover:text-[#26221F] border border-[#EBE5DC]'
                }`}
            >
              <span>Storyline</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${activeTab === 'storyline' ? 'bg-white/20 text-white' : 'bg-[#EBE5DC] text-[#78471F]'}`}>
                {storylineEvents.length}
              </span>
            </button>

            {referencedEvents.length > 0 && (
              <button
                onClick={() => {
                  setActiveTab('references');
                  if (!showMentionedPins) setShowMentionedPins(true);
                  if (referencedEvents[activeReferenceIndex] && onEventSelect) {
                    onEventSelect(referencedEvents[activeReferenceIndex]);
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10.5px] font-bold transition-all ${activeTab === 'references'
                  ? 'bg-[#B4793D] text-white shadow-xs'
                  : 'bg-[#FAF5ED] text-[#78716C] hover:text-[#26221F] border border-[#EBE5DC]'
                  }`}
              >
                <span>References</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${activeTab === 'references' ? 'bg-white/20 text-white' : 'bg-[#EBE5DC] text-[#78471F]'}`}>
                  {referencedEvents.length}
                </span>
              </button>
            )}
          </div>

          {/* Right Navigation & Entire Book Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setViewMode(viewMode === 'chapter' ? 'book' : 'chapter');
                setActiveStorylineIndex(0);
                setActiveReferenceIndex(0);
              }}
              className="text-[#B4793D] hover:text-[#78716C] underline transition-colors px-1 border-r border-[#D4A373]/30 mr-1 pr-2 text-[9.5px]"
            >
              {viewMode === 'chapter' ? 'View Entire Book' : 'View Chapter'}
            </button>

            <div className="flex items-center bg-[#FAF3E8] rounded border border-[#D4A373] shadow-sm overflow-hidden">
              <button
                onClick={() => {
                  if (activeTab === 'storyline') {
                    const newIdx = Math.max(0, activeStorylineIndex - 1);
                    setActiveStorylineIndex(newIdx);
                    if (onEventSelect && storylineEvents[newIdx]) onEventSelect(storylineEvents[newIdx]);
                  } else {
                    const newIdx = Math.max(0, activeReferenceIndex - 1);
                    setActiveReferenceIndex(newIdx);
                    if (onEventSelect && referencedEvents[newIdx]) onEventSelect(referencedEvents[newIdx]);
                  }
                }}
                disabled={currentTabIndex === 0}
                className="p-0.5 text-[#78471F] hover:bg-[#F2E8D5] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title={`Previous ${activeTab === 'storyline' ? 'Storyline' : 'Reference'} place`}
              >
                <ChevronLeft size={12} />
              </button>
              <span className="text-[9.5px] text-[#78471F] font-bold px-1.5 min-w-[36px] text-center border-x border-[#D4A373]/30">
                {currentTabEvents.length > 0 ? `${currentTabIndex + 1} / ${currentTabEvents.length}` : '0 / 0'}
              </span>
              <button
                onClick={() => {
                  if (activeTab === 'storyline') {
                    const newIdx = Math.min(storylineEvents.length - 1, activeStorylineIndex + 1);
                    setActiveStorylineIndex(newIdx);
                    if (onEventSelect && storylineEvents[newIdx]) onEventSelect(storylineEvents[newIdx]);
                  } else {
                    const newIdx = Math.min(referencedEvents.length - 1, activeReferenceIndex + 1);
                    setActiveReferenceIndex(newIdx);
                    if (onEventSelect && referencedEvents[newIdx]) onEventSelect(referencedEvents[newIdx]);
                  }
                }}
                disabled={currentTabEvents.length === 0 || currentTabIndex >= currentTabEvents.length - 1}
                className="p-0.5 text-[#78471F] hover:bg-[#F2E8D5] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title={`Next ${activeTab === 'storyline' ? 'Storyline' : 'Reference'} place`}
              >
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Buttons List for Selected Tab */}
        <div
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
          className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5 cursor-grab w-full"
        >
          {activeTab === 'storyline' ? (
            storylineEvents.length > 0 ? (
              storylineEvents.map((ev, idx) =>
                renderStorylineButton(ev, idx === activeStorylineIndex, idx, () => {
                  setActiveStorylineIndex(idx);
                  if (onEventSelect) onEventSelect(ev);
                })
              )
            ) : (
              <div className="text-[11px] text-[#78716C] italic py-1 px-2">
                No physical storyline journeys in this chapter. See References tab.
              </div>
            )
          ) : (
            referencedEvents.length > 0 ? (
              referencedEvents.map((ev, idx) =>
                renderStorylineButton(ev, idx === activeReferenceIndex, idx, () => {
                  setActiveReferenceIndex(idx);
                  if (onEventSelect) onEventSelect(ev);
                })
              )
            ) : (
              <div className="text-[11px] text-[#78716C] italic py-1 px-2">
                No mentioned places in this chapter.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
