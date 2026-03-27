import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Search, Clock, Leaf, Zap, Target, Car, Bus, Users, Train, Bike, AlertCircle } from 'lucide-react';
import { COST_PER_KM_USD, EMISSION_FACTORS_KG_PER_KM, TravelMode } from '../types';
import { awardPointsForDistance } from '../services/gamification';
import { saveJourney } from '../services/journeys';
import { useAuth } from './AuthContext';

const GMAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
const ORS_KEY   = import.meta.env.VITE_ORS_API_KEY as string;
const ORS_BASE  = 'https://api.openrouteservice.org';
const USD_TO_INR = 83;

// ── Google Maps loader (display only) ─────────────────────────────────────────
let gmapsPromise: Promise<void> | null = null;
function loadGoogleMaps(): Promise<void> {
  if ((window as any).google?.maps?.Map) return Promise.resolve();
  if (gmapsPromise) return gmapsPromise;
  gmapsPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&region=IN&language=en`;
    s.onload = () => resolve();
    s.onerror = () => { gmapsPromise = null; reject(new Error('Google Maps failed to load.')); };
    document.head.appendChild(s);
  });
  return gmapsPromise;
}

// ── ORS geocode ───────────────────────────────────────────────────────────────
async function geocode(query: string): Promise<[number, number]> {
  const text = query.toLowerCase().includes('india') ? query : `${query}, India`;
  const url = `${ORS_BASE}/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(text)}&boundary.country=IND&focus.point.lon=77.5946&focus.point.lat=12.9716&size=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  const coords = data.features?.[0]?.geometry?.coordinates;
  if (!coords) throw new Error(`Location not found: "${query}". Try adding city name.`);
  return [coords[0], coords[1]]; // [lng, lat]
}

// ── ORS routing ───────────────────────────────────────────────────────────────
interface RouteResult {
  coords: [number, number][]; // [lat, lng] for Google Maps
  distanceM: number;
  durationS: number;
  label: string;
  tag: 'eco' | 'balanced' | 'fast';
  color: string;
  summary: string;
}

async function fetchRoute(from: [number,number], to: [number,number], preference: string, label: string, tag: RouteResult['tag'], color: string): Promise<RouteResult | null> {
  try {
    const url = `${ORS_BASE}/v2/directions/driving-car?api_key=${ORS_KEY}&start=${from[0]},${from[1]}&end=${to[0]},${to[1]}&preference=${preference}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;
    const summary = feature.properties?.summary;
    const rawCoords: [number,number][] = feature.geometry?.coordinates ?? [];
    return {
      coords: rawCoords.map(([lng, lat]) => [lat, lng]),
      distanceM: summary?.distance ?? 0,
      durationS: summary?.duration ?? 0,
      label, tag, color,
      summary: '',
    };
  } catch { return null; }
}

// ── Vehicle suggestions ───────────────────────────────────────────────────────
interface VehicleSuggestion {
  key: string; title: string; available: boolean; reason: string;
  mode: TravelMode; co2Kg: number; costINR: number; durationMin: number; points: number; eco: boolean;
}

function getVehicleSuggestions(distanceM: number, durationS: number): VehicleSuggestion[] {
  const km = distanceM / 1000;
  const drivingMin = Math.round(durationS / 60);
  const fmt = (v: number) => parseFloat(v.toFixed(2));
  return [
    { key: 'walk',  title: 'Walking', mode: 'WALKING', eco: true,
      available: km <= 3, reason: km <= 3 ? 'Perfect for short distances' : 'Too far to walk',
      co2Kg: 0, costINR: 0, durationMin: Math.round(km * 12), points: awardPointsForDistance(km) },
    { key: 'cycle', title: 'Cycling', mode: 'BICYCLING', eco: true,
      available: km <= 20, reason: km <= 20 ? 'Zero emissions, healthy choice' : 'Too far for cycling',
      co2Kg: 0, costINR: 0, durationMin: Math.round(km * 4), points: awardPointsForDistance(km) },
    { key: 'metro', title: 'Metro', mode: 'TRANSIT', eco: true,
      available: km <= 40, reason: km <= 40 ? 'Check local metro availability' : 'Metro covers city routes only',
      co2Kg: fmt(km * EMISSION_FACTORS_KG_PER_KM.TRANSIT * 0.6), costINR: Math.round(km * 2.5),
      durationMin: Math.round(drivingMin * 1.1), points: awardPointsForDistance(km) },
    { key: 'bus',   title: 'City Bus / KSRTC', mode: 'TRANSIT', eco: true,
      available: km <= 80, reason: km <= 80 ? 'Affordable public transit' : 'Consider intercity bus',
      co2Kg: fmt(km * EMISSION_FACTORS_KG_PER_KM.TRANSIT), costINR: Math.round(km * 1.5),
      durationMin: Math.round(drivingMin * 1.3), points: awardPointsForDistance(km) },
    { key: 'intercity_bus', title: 'Intercity Bus (KSRTC)', mode: 'TRANSIT', eco: true,
      available: km > 50 && km <= 600, reason: km > 50 && km <= 600 ? 'Economical intercity travel' : km <= 50 ? 'Too short for intercity bus' : 'Very long — consider train',
      co2Kg: fmt(km * EMISSION_FACTORS_KG_PER_KM.TRANSIT), costINR: Math.round(km * 1.2),
      durationMin: Math.round(drivingMin * 1.4), points: awardPointsForDistance(km) },
    { key: 'train', title: 'Train (Indian Railways)', mode: 'TRANSIT', eco: true,
      available: km >= 30, reason: km >= 30 ? 'Most energy-efficient for medium-long distances' : 'Too short for train',
      co2Kg: fmt(km * 0.041), costINR: Math.round(km * 0.8),
      durationMin: Math.round(drivingMin * 1.5), points: awardPointsForDistance(km) },
    { key: 'carpool', title: 'Carpool (3 passengers)', mode: 'DRIVING', eco: false,
      available: true, reason: 'Share a ride — cut emissions by 66%',
      co2Kg: fmt(km * EMISSION_FACTORS_KG_PER_KM.DRIVING / 3), costINR: Math.round(km * COST_PER_KM_USD.DRIVING * USD_TO_INR / 3),
      durationMin: drivingMin, points: awardPointsForDistance(km) },
    { key: 'car',   title: 'Private Car', mode: 'DRIVING', eco: false,
      available: true, reason: 'Highest emissions — consider greener options',
      co2Kg: fmt(km * EMISSION_FACTORS_KG_PER_KM.DRIVING), costINR: Math.round(km * COST_PER_KM_USD.DRIVING * USD_TO_INR),
      durationMin: drivingMin, points: awardPointsForDistance(km) },
  ];
}

// ── Component ─────────────────────────────────────────────────────────────────
const Maps: React.FC = () => {
  const { user } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylines = useRef<any[]>([]);
  const markersRef = useRef<any[]>([]);
  const trackPolyRef = useRef<any>(null);
  const trackMarkerRef = useRef<any>(null);
  const geoWatchRef = useRef<number | null>(null);
  const trackStartRef = useRef<number | null>(null);
  const lastPointRef = useRef<{ lat: number; lng: number } | null>(null);

  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteResult | null>(null);
  const [vehicles, setVehicles] = useState<VehicleSuggestion[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingMode, setTrackingMode] = useState<TravelMode>('TRANSIT');
  const [trackedKm, setTrackedKm] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => { setIsVisible(true); }, []);

  // Init Google Map (display only — no billing needed for just showing the map)
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then(() => {
      if (cancelled || !mapRef.current || mapInstanceRef.current) return;
      const google = (window as any).google;
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: 12.9716, lng: 77.5946 }, // Bangalore
        zoom: 11,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
    }).catch(err => setError(err.message));
    return () => { cancelled = true; };
  }, []);

  const clearMap = () => {
    polylines.current.forEach(p => p.setMap(null));
    polylines.current = [];
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
  };

  const drawRoutes = (built: RouteResult[], map: any) => {
    const google = (window as any).google;
    const bounds = new google.maps.LatLngBounds();
    // Draw less important routes first, eco on top
    [...built].reverse().forEach((r, ri) => {
      const isTop = ri === built.length - 1;
      const path = r.coords.map(([lat, lng]) => ({ lat, lng }));
      const poly = new google.maps.Polyline({
        path, strokeColor: r.color,
        strokeWeight: isTop ? 7 : 4,
        strokeOpacity: isTop ? 0.9 : 0.45,
        map,
      });
      polylines.current.push(poly);
      path.forEach(pt => bounds.extend(pt));
    });
    map.fitBounds(bounds, { top: 60, right: 40, bottom: 40, left: 40 });

    // Markers
    const start = built[0].coords[0];
    const end   = built[0].coords[built[0].coords.length - 1];
    markersRef.current.push(
      new google.maps.Marker({ position: { lat: start[0], lng: start[1] }, map, label: { text: 'A', color: 'white' }, title: source }),
      new google.maps.Marker({ position: { lat: end[0],   lng: end[1]   }, map, label: { text: 'B', color: 'white' }, title: destination })
    );
  };

  // ── Find routes via ORS, display on Google Map ────────────────────────────
  const handleFindRoutes = async () => {
    if (!source.trim() || !destination.trim()) return;
    setError(null); setIsSearching(true);
    setRoutes([]); setVehicles([]); setSelectedRoute(null);
    clearMap();
    try {
      const [fromCoord, toCoord] = await Promise.all([geocode(source), geocode(destination)]);

      // Fetch recommended + shortest routes in parallel
      const [recommended, shortest] = await Promise.all([
        fetchRoute(fromCoord, toCoord, 'recommended', '⚖️ Recommended', 'balanced', '#2563eb'),
        fetchRoute(fromCoord, toCoord, 'shortest',    '🌿 Eco (Shortest)', 'eco',  '#16a34a'),
      ]);

      const built: RouteResult[] = [shortest, recommended].filter(Boolean) as RouteResult[];
      if (!built.length) throw new Error('No routes found. Try more specific location names.');

      // Deduplicate if same distance
      const unique = built.filter((r, i, arr) =>
        i === 0 || Math.abs(r.distanceM - arr[0].distanceM) > 200
      );

      await loadGoogleMaps();
      drawRoutes(unique, mapInstanceRef.current);

      setRoutes(unique);
      setSelectedRoute(unique[0]);
      setVehicles(getVehicleSuggestions(unique[0].distanceM, unique[0].durationS));
    } catch (err: any) {
      setError(err.message || 'Failed to find routes.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectRoute = (r: RouteResult) => {
    setSelectedRoute(r);
    setVehicles(getVehicleSuggestions(r.distanceM, r.durationS));
    polylines.current.forEach((poly, i) => {
      const isSelected = routes[routes.length - 1 - i]?.tag === r.tag;
      poly.setOptions({ strokeWeight: isSelected ? 7 : 4, strokeOpacity: isSelected ? 0.9 : 0.35 });
    });
  };

  const handleSaveJourney = async (v: VehicleSuggestion) => {
    if (!selectedRoute) return;
    setSaving(v.key);
    try {
      await saveJourney({
        userId: user?.id || 'guest', sourceText: source, destinationText: destination,
        mode: v.mode, routeId: `ors_${selectedRoute.tag}_${v.key}`,
        metrics: { co2Kg: v.co2Kg, monetaryCost: v.costINR / USD_TO_INR, durationSeconds: v.durationMin * 60, distanceKm: selectedRoute.distanceM / 1000 },
        co2SavedKg: v.co2Kg,
      });
      alert(`Journey saved! You earned ${v.points} points.`);
    } catch { alert('Failed to save journey.'); }
    finally { setSaving(null); }
  };

  // ── Live tracking ─────────────────────────────────────────────────────────
  const haversineKm = (a: {lat:number;lng:number}, b: {lat:number;lng:number}) => {
    const R = 6371, r = (v: number) => v * Math.PI / 180;
    const dLat = r(b.lat-a.lat), dLng = r(b.lng-a.lng);
    return 2*R*Math.asin(Math.sqrt(Math.sin(dLat/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(dLng/2)**2));
  };

  const startTracking = async () => {
    if (!('geolocation' in navigator)) { alert('Geolocation not supported.'); return; }
    await loadGoogleMaps();
    const google = (window as any).google;
    const map = mapInstanceRef.current;
    setTrackedKm(0); lastPointRef.current = null;
    trackStartRef.current = Date.now(); setIsTracking(true);
    trackPolyRef.current = new google.maps.Polyline({ path: [], strokeColor: '#7c3aed', strokeWeight: 5, map });
    geoWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const pt = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const latlng = new google.maps.LatLng(pt.lat, pt.lng);
        if (!trackMarkerRef.current) trackMarkerRef.current = new google.maps.Marker({ position: latlng, map, title: 'You' });
        else trackMarkerRef.current.setPosition(latlng);
        trackPolyRef.current.getPath().push(latlng);
        map.panTo(latlng);
        if (lastPointRef.current) setTrackedKm(k => k + haversineKm(lastPointRef.current!, pt));
        lastPointRef.current = pt;
      },
      (err) => alert('Location error: ' + err.message),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
  };

  const stopTracking = async (save: boolean) => {
    if (geoWatchRef.current !== null) { navigator.geolocation.clearWatch(geoWatchRef.current); geoWatchRef.current = null; }
    setIsTracking(false);
    const elapsed = trackStartRef.current ? Math.round((Date.now()-trackStartRef.current)/1000) : 0;
    trackStartRef.current = null;
    if (trackPolyRef.current) { trackPolyRef.current.setMap(null); trackPolyRef.current = null; }
    if (trackMarkerRef.current) { trackMarkerRef.current.setMap(null); trackMarkerRef.current = null; }
    if (save && trackedKm > 0) {
      try {
        const co2 = trackedKm * (EMISSION_FACTORS_KG_PER_KM[trackingMode] ?? 0);
        await saveJourney({
          userId: user?.id || 'guest', sourceText: source || 'Live start', destinationText: destination || 'Live end',
          mode: trackingMode, routeId: 'live_tracking',
          metrics: { co2Kg: co2, monetaryCost: trackedKm*(COST_PER_KM_USD[trackingMode]??0), durationSeconds: elapsed, distanceKm: trackedKm },
          co2SavedKg: co2,
        });
        alert('Live journey saved!');
      } catch { alert('Failed to save.'); }
    }
    setTrackedKm(0);
  };

  const ecoVehicles   = vehicles.filter(v => v.eco && v.available);
  const otherVehicles = vehicles.filter(v => !v.eco || !v.available);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className={`text-center mb-8 ${isVisible ? 'slide-in-up' : 'opacity-0'}`}>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center space-x-3">
            <MapPin className="w-9 h-9 text-green-500" /><span>Find Your Green Route</span>
          </h1>
          <p className="text-gray-500 text-sm">Eco-ranked routing · Vehicle suggestions · Google Maps display</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-green-500" /><span>From</span>
              </label>
              <input type="text" value={source} onChange={e => setSource(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleFindRoutes()}
                placeholder="e.g. BTM Layout, Bangalore"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1">
                <Navigation className="w-4 h-4 text-blue-500" /><span>To</span>
              </label>
              <input type="text" value={destination} onChange={e => setDestination(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleFindRoutes()}
                placeholder="e.g. Majestic, Bangalore"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{error}</span>
            </div>
          )}
          <button onClick={handleFindRoutes} disabled={!source.trim() || !destination.trim() || isSearching}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all">
            {isSearching
              ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Finding routes...</span></>
              : <><Search className="w-5 h-5" /><span>Find Green Routes</span><Zap className="w-5 h-5" /></>}
          </button>
        </div>

        {/* Route tabs */}
        {routes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-4 mb-4">
            <p className="text-xs text-gray-500 mb-3 font-medium">Routes ranked by energy efficiency</p>
            <div className="flex gap-3 flex-wrap">
              {routes.map(r => (
                <button key={r.tag} onClick={() => handleSelectRoute(r)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${selectedRoute?.tag === r.tag ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <span className="w-3 h-3 rounded-full" style={{ background: r.color }} />
                  <span>{r.label}</span>
                  <span className="text-xs text-gray-400">{(r.distanceM/1000).toFixed(1)}km · {Math.round(r.durationS/60)}min</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Map */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-green-500" /><span>Route Map</span>
            </h2>
            {selectedRoute && (
              <div className="flex space-x-3 text-sm text-gray-600">
                <span className="flex items-center space-x-1"><Leaf className="w-4 h-4 text-green-500" /><span>{(selectedRoute.distanceM/1000).toFixed(1)} km</span></span>
                <span className="flex items-center space-x-1"><Clock className="w-4 h-4 text-blue-500" /><span>{Math.round(selectedRoute.durationS/60)} min</span></span>
              </div>
            )}
          </div>
          <div ref={mapRef} className="w-full rounded-xl border border-gray-200" style={{ height: '480px' }} />
          {routes.length > 0 && (
            <div className="mt-2 flex gap-4 text-xs text-gray-500 flex-wrap">
              {routes.map(r => (
                <span key={r.tag} className="flex items-center space-x-1">
                  <span className="w-5 h-1.5 rounded inline-block" style={{ background: r.color }} />
                  <span>{r.label}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Vehicle suggestions */}
        {vehicles.length > 0 && selectedRoute && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center space-x-2">
              <Target className="w-6 h-6 text-green-500" /><span>Vehicle Suggestions</span>
            </h2>
            <p className="text-xs text-gray-500 mb-5">For {(selectedRoute.distanceM/1000).toFixed(1)} km · {selectedRoute.label}</p>
            <h3 className="text-sm font-semibold text-green-700 mb-3 flex items-center space-x-1">
              <Leaf className="w-4 h-4" /><span>Recommended Green Options</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {ecoVehicles.map(v => (
                <div key={v.key} className="rounded-xl border-2 border-green-200 bg-green-50 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{v.title}</span>
                    {v.key === 'walk'          && <span className="text-xl">🚶</span>}
                    {v.key === 'cycle'         && <Bike  className="w-5 h-5 text-green-600" />}
                    {v.key === 'metro'         && <span className="text-xl">🚇</span>}
                    {v.key === 'bus'           && <Bus   className="w-5 h-5 text-blue-600" />}
                    {v.key === 'intercity_bus' && <Bus   className="w-5 h-5 text-sky-600" />}
                    {v.key === 'train'         && <Train className="w-5 h-5 text-indigo-600" />}
                  </div>
                  <p className="text-xs text-green-700 mb-3">{v.reason}</p>
                  <div className="grid grid-cols-3 gap-1 text-xs mb-3">
                    <div className="text-center p-1.5 rounded bg-white"><div className="text-gray-400">CO₂</div><div className="font-semibold text-green-700">{v.co2Kg === 0 ? '0 🌿' : `${v.co2Kg}kg`}</div></div>
                    <div className="text-center p-1.5 rounded bg-white"><div className="text-gray-400">Cost</div><div className="font-semibold text-blue-700">{v.costINR === 0 ? 'Free' : `₹${v.costINR}`}</div></div>
                    <div className="text-center p-1.5 rounded bg-white"><div className="text-gray-400">Time</div><div className="font-semibold text-purple-700">{v.durationMin}min</div></div>
                  </div>
                  <div className="text-xs text-green-600 mb-2 text-right">+{v.points} pts</div>
                  <button onClick={() => handleSaveJourney(v)} disabled={!!saving}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 flex items-center justify-center space-x-1 transition-all">
                    {saving === v.key ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Zap className="w-3 h-3" />}
                    <span>Save Journey</span>
                  </button>
                </div>
              ))}
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center space-x-1">
              <Car className="w-4 h-4" /><span>Other Options</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherVehicles.map(v => (
                <div key={v.key} className={`rounded-xl border-2 p-4 transition-shadow hover:shadow-md ${v.available ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{v.title}</span>
                    {v.key === 'carpool' && <Users className="w-5 h-5 text-purple-500" />}
                    {v.key === 'car'     && <Car   className="w-5 h-5 text-red-500" />}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{v.reason}</p>
                  {v.available && (
                    <>
                      <div className="grid grid-cols-3 gap-1 text-xs mb-3">
                        <div className="text-center p-1.5 rounded bg-gray-50"><div className="text-gray-400">CO₂</div><div className="font-semibold text-red-600">{v.co2Kg}kg</div></div>
                        <div className="text-center p-1.5 rounded bg-gray-50"><div className="text-gray-400">Cost</div><div className="font-semibold text-blue-700">₹{v.costINR}</div></div>
                        <div className="text-center p-1.5 rounded bg-gray-50"><div className="text-gray-400">Time</div><div className="font-semibold text-purple-700">{v.durationMin}min</div></div>
                      </div>
                      <button onClick={() => handleSaveJourney(v)} disabled={!!saving}
                        className="w-full bg-gray-700 hover:bg-gray-800 text-white py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 flex items-center justify-center space-x-1 transition-all">
                        {saving === v.key ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Zap className="w-3 h-3" />}
                        <span>Save Journey</span>
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live tracking */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Target className="w-6 h-6 text-green-500" /><span>Live Journey Tracking</span>
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span>{isTracking ? 'Tracking' : 'Ready'}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
              <select value={trackingMode} onChange={e => setTrackingMode(e.target.value as TravelMode)} disabled={isTracking}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white">
                <option value="TRANSIT">Public Transit</option>
                <option value="DRIVING">Car / Carpool</option>
                <option value="BICYCLING">Cycling</option>
                <option value="WALKING">Walking</option>
              </select>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-blue-50">
              <div className="text-sm text-gray-500 mb-1">Distance tracked</div>
              <div className="text-2xl font-bold text-green-700">{trackedKm.toFixed(2)} km</div>
            </div>
            <div className="flex gap-2">
              {!isTracking
                ? <button onClick={startTracking} className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 flex items-center justify-center space-x-2">
                    <Target className="w-5 h-5" /><span>Start Tracking</span>
                  </button>
                : <>
                    <button onClick={() => stopTracking(true)} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-1">
                      <Zap className="w-4 h-4" /><span>Stop & Save</span>
                    </button>
                    <button onClick={() => stopTracking(false)} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
                  </>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Maps;
