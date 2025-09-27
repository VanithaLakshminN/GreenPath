import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Search, Route, Clock, Leaf, Zap, Target, Car, Bike, Bus, Users } from 'lucide-react';
import { COST_PER_KM_USD, EMISSION_FACTORS_KG_PER_KM, RouteOption, TravelMode } from '../types';
import { computeRouteMetrics } from '../services/routeMetrics';
import { awardPointsForDistance } from '../services/gamification';
import { saveJourney } from '../services/journeys';
import { useAuth } from './AuthContext';

// Removed unused Route interface and demo routes to satisfy linter

// Minimal globals for Google Maps without installing types
declare global {
  interface Window {
    initMap: () => void;
    // Expose Google Maps object when script loads
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
  }
}

function loadGoogleMapsApi(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const g: any = (window as unknown as { google?: unknown }).google;
    if (g && g.maps) {
      resolve();
      return;
    }

    const existing = document.querySelector('script[data-google-maps]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps script')));
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = 'true';
    const url = new URL('https://maps.googleapis.com/maps/api/js');
    url.searchParams.set('key', apiKey);
    url.searchParams.set('libraries', 'places');
    url.searchParams.set('region', 'IN');
    script.src = url.toString();
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });
}

const Maps: React.FC = () => {
  const { user } = useAuth();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [routeDistance, setRouteDistance] = useState<string>('');
  const [routeDuration, setRouteDuration] = useState<string>('');
  // Travel controls removed; default to Public Transit for greener routing
  const defaultMode: TravelMode = 'TRANSIT';
  const [availableRoutes, setAvailableRoutes] = useState<any[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const directionsRendererRef = useRef<any | null>(null);
  const lastDirectionsResultRef = useRef<any | null>(null);
  // Live tracking refs
  const geoWatchIdRef = useRef<number | null>(null);
  const userMarkerRef = useRef<any | null>(null);
  const polylineRef = useRef<any | null>(null);
  const trackingStartRef = useRef<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingMode, setTrackingMode] = useState<TravelMode>('TRANSIT');
  const [trackedDistanceKm, setTrackedDistanceKm] = useState(0);
  const lastPointRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Load Google Maps
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    if (!apiKey || !mapRef.current || mapInstanceRef.current) return;

    let isMounted = true;
    loadGoogleMapsApi(apiKey)
      .then(() => {
        if (!isMounted || !mapRef.current) return;

        const googleMaps: any = (window as any).google;
        mapInstanceRef.current = new googleMaps.maps.Map(mapRef.current, {
          center: { lat: 21.1458, lng: 79.0882 }, // Center on India
          zoom: 5,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        directionsRendererRef.current = new googleMaps.maps.DirectionsRenderer({
          suppressMarkers: false,
        });
        directionsRendererRef.current.setMap(mapInstanceRef.current);
      })
      .catch((err) => {
        console.error('Google Maps failed to load:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper: Geocode address to lat/lng (avoid google namespace types)
  const geocodeAddress = (address: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const geocoder = new (window as any).google.maps.Geocoder();
      geocoder.geocode({ address }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].geometry.location);
        } else {
          reject(`Geocode failed: ${status}`);
        }
      });
    });
  };

  // Haversine distance in km
  const haversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  };

  const startLiveTracking = async () => {
    if (!mapInstanceRef.current) return;
    if (!('geolocation' in navigator)) {
      alert('Geolocation not supported on this device.');
      return;
    }
    setTrackedDistanceKm(0);
    lastPointRef.current = null;
    trackingStartRef.current = Date.now();
    setIsTracking(true);

    const googleMaps: any = (window as any).google;
    if (!polylineRef.current) {
      polylineRef.current = new googleMaps.maps.Polyline({
        map: mapInstanceRef.current,
        strokeColor: '#22c55e',
        strokeOpacity: 0.9,
        strokeWeight: 4,
        path: [],
      });
    } else {
      polylineRef.current.setPath([]);
    }

    geoWatchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const point = { lat: latitude, lng: longitude };

        if (!userMarkerRef.current) {
          userMarkerRef.current = new googleMaps.maps.Marker({ position: point, map: mapInstanceRef.current });
        } else {
          userMarkerRef.current.setPosition(point);
        }

        // Update path and distance
        const prev = lastPointRef.current;
        if (prev) {
          const inc = haversineKm(prev, point);
          setTrackedDistanceKm((d) => d + inc);
        }
        lastPointRef.current = point;
        const path = (polylineRef.current?.getPath && polylineRef.current.getPath()) || [];
        if (path.push) path.push(point);
      },
      (err) => {
        console.error('Geolocation error', err);
        alert('Unable to get location. Please enable permissions.');
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
  };

  const stopAndSaveLiveTracking = async () => {
    if (geoWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
      geoWatchIdRef.current = null;
    }
    setIsTracking(false);
    const elapsedSeconds = trackingStartRef.current ? Math.round((Date.now() - trackingStartRef.current) / 1000) : 0;
    trackingStartRef.current = null;

    if (trackedDistanceKm <= 0) return;
    try {
      const co2Kg = trackedDistanceKm * (EMISSION_FACTORS_KG_PER_KM[trackingMode] ?? 0);
      const costUsd = trackedDistanceKm * (COST_PER_KM_USD[trackingMode] ?? 0);
      const metrics = { co2Kg, monetaryCost: costUsd, durationSeconds: elapsedSeconds, distanceKm: trackedDistanceKm };
      await saveJourney({
        userId: user?.username || 'guest-user',
        sourceText: source || 'Live start',
        destinationText: destination || 'Live end',
        mode: trackingMode,
        routeId: 'live_tracking',
        metrics,
        co2SavedKg: co2Kg,
      });
      alert('Live journey saved!');
    } catch (e) {
      alert('Failed to save live journey');
    }
  };

  // Main route finding logic
  const handleFindRoutes = async () => {
    if (!source.trim() || !destination.trim() || !mapInstanceRef.current) return;

    setIsSearching(true);
    try {
      const [fromLatLng, toLatLng] = await Promise.all([
        geocodeAddress(source),
        geocodeAddress(destination),
      ]);

      const directionsService = new (window as any).google.maps.DirectionsService();
      const request: any = {
        origin: fromLatLng,
        destination: toLatLng,
        travelMode: (window as any).google.maps.TravelMode[defaultMode],
        provideRouteAlternatives: true,
      };

      directionsService.route(request, (result: any, status: any) => {
        if (status === 'OK') {
          lastDirectionsResultRef.current = result;
          const routes = result?.routes ?? [];
          setAvailableRoutes(routes);

          // Choose greenest = shortest distance
          let bestIndex = 0;
          let bestMeters = Number.POSITIVE_INFINITY;
          routes.forEach((r: any, idx: number) => {
            const leg = r?.legs?.[0];
            const meters = leg?.distance?.value ?? Number.POSITIVE_INFINITY;
            if (meters < bestMeters) {
              bestMeters = meters;
              bestIndex = idx;
            }
          });

          setSelectedRouteIndex(bestIndex);
          directionsRendererRef.current?.setDirections(result);
          if (typeof directionsRendererRef.current?.setRouteIndex === 'function') {
            directionsRendererRef.current.setRouteIndex(bestIndex);
          }

          try {
            const leg = routes?.[bestIndex]?.legs?.[0];
            if (leg?.distance?.text) setRouteDistance(leg.distance.text);
            if (leg?.duration?.text) setRouteDuration(leg.duration.text);
          } catch {
            // ignore parsing errors
          }

          // No additional normalization needed for UI; keep minimal state
        } else {
          alert('Could not find directions: ' + status);
        }
      });
    } catch (err) {
      console.error(err);
      alert('Geocoding failed. Check your input locations.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveJourney = async () => {
    if (!availableRoutes[selectedRouteIndex]) return;
    setSaving(true);
    try {
      const chosen = availableRoutes[selectedRouteIndex];
      const leg = chosen?.legs?.[0];
      const normalized: RouteOption = {
        id: `google_${selectedRouteIndex}`,
        mode: defaultMode,
        legs: [{ distanceMeters: leg?.distance?.value ?? 0, durationSeconds: leg?.duration?.value ?? 0 }],
        provider: 'google',
      };
      const metrics = computeRouteMetrics(normalized);
      const points = awardPointsForDistance(metrics.distanceKm);
      const userId = user?.username || 'guest-user';
      await saveJourney({
        userId,
        sourceText: source,
        destinationText: destination,
        mode: normalized.mode,
        routeId: normalized.id,
        metrics,
        co2SavedKg: metrics.co2Kg, // treat emissions avoided by choosing greener as same for now
      });
      alert(`Journey saved! You earned ${points} points for this distance.`);
    } catch (e) {
      alert('Failed to save journey.');
    } finally {
      setSaving(false);
    }
  };

  // Build scenario cards (Bike, Metro, Private Car)
  const scenarioCards = React.useMemo(() => {
    const chosen = availableRoutes[selectedRouteIndex];
    const leg = chosen?.legs?.[0];
    if (!leg) return [] as {
      key: string; title: string; subtitle: string; color: string; mode: TravelMode; co2Kg: number; cost: number; durationMin: number; points: number
    }[];
    const km = (leg.distance?.value ?? 0) / 1000;
    const min = Math.round((leg.duration?.value ?? 0) / 60);
    const points = awardPointsForDistance(km);

    const fmt = (v: number) => Number(v.toFixed(1));

    const carCo2PerKm = 0.192; // kg/km
    const transitCo2PerKm = 0.065;
    const carCostPerKm = 0.12; // USD per km
    const transitCostPerKm = 0.05; // USD per km
    const USD_TO_INR = 83; // approx conversion; adjust as needed

    // Metro only
    const metroCo2PerKm = transitCo2PerKm;
    const metroCostPerKm = transitCostPerKm;

    return [
      {
        key: 'metro',
        title: 'Metro',
        subtitle: 'Direct bus route with one transfer',
        color: 'border-blue-400',
        mode: 'TRANSIT' as TravelMode,
        co2Kg: fmt(km * metroCo2PerKm),
        cost: Math.round(USD_TO_INR * km * metroCostPerKm),
        durationMin: min,
        points,
      },
      {
        key: 'bus',
        title: 'Bus',
        subtitle: 'City bus route (may include one transfer)',
        color: 'border-sky-400',
        mode: 'TRANSIT' as TravelMode,
        co2Kg: fmt(km * transitCo2PerKm),
        cost: Math.round(USD_TO_INR * km * transitCostPerKm),
        durationMin: min + 3,
        points,
      },
      {
        key: 'carpool',
        title: 'Carpool',
        subtitle: 'Shared ride with 2 other passengers',
        color: 'border-purple-400',
        mode: 'DRIVING' as TravelMode,
        co2Kg: fmt(km * (carCo2PerKm / 3)),
        cost: Math.round(USD_TO_INR * km * (carCostPerKm / 3)),
        durationMin: Math.max(1, min - 2),
        points,
      },
      {
        key: 'car',
        title: 'Private Car',
        subtitle: 'Direct route via highway (for comparison)',
        color: 'border-red-400',
        mode: 'DRIVING' as TravelMode,
        co2Kg: fmt(km * carCo2PerKm),
        cost: Math.round(USD_TO_INR * km * carCostPerKm),
        durationMin: Math.max(1, min - 3),
        points,
      },
    ];
  }, [availableRoutes, selectedRouteIndex]);

  const handleStartScenario = async (cardKey: string, mode: TravelMode) => {
    const chosen = availableRoutes[selectedRouteIndex];
    const leg = chosen?.legs?.[0];
    if (!leg) return;
    setSaving(true);
    try {
      const normalized: RouteOption = {
        id: `scenario_${cardKey}`,
        mode,
        legs: [{ distanceMeters: leg?.distance?.value ?? 0, durationSeconds: leg?.duration?.value ?? 0 }],
        provider: 'google',
      };
      const metrics = computeRouteMetrics(normalized);
      await saveJourney({
        userId: user?.username || 'guest-user',
        sourceText: source,
        destinationText: destination,
        mode: normalized.mode,
        routeId: normalized.id,
        metrics,
        co2SavedKg: metrics.co2Kg,
      });
      alert('Journey saved!');
    } catch {
      alert('Failed to save journey.');
    } finally {
      setSaving(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-green-200 rounded-full opacity-20 blur-3xl float"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full opacity-10 blur-3xl float-slow"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center mb-8 ${isVisible ? 'slide-in-up' : 'opacity-0'}`}>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
            <MapPin className="w-10 h-10 text-green-500 icon-spin" />
            <span>Find Your Green Route</span>
            <Route className="w-10 h-10 text-blue-500 icon-spin" />
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto flex items-center justify-center space-x-2">
            <Leaf className="w-6 h-6 text-green-500 icon-spin" />
            <span>Discover eco-friendly travel options and make every journey count for the planet.</span>
            <Zap className="w-6 h-6 text-yellow-500 icon-spin" />
          </p>
        </div>

        <div className={`bg-white rounded-2xl shadow-xl p-8 mb-8 card-hover neon-glow ${
          isVisible ? 'slide-in-up' : 'opacity-0'
        }`} style={{ animationDelay: '0.2s' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                <span>From</span>
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Enter starting location"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 group-hover:border-green-400"
              />
            </div>
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
                <span>To</span>
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 group-hover:border-green-400"
              />
            </div>
          </div>
          {/* Travel mode and avoid options removed for simplicity; defaulting to Public Transit */}
          <button
            onClick={handleFindRoutes}
            disabled={!source.trim() || !destination.trim() || isSearching}
            className="btn-primary w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 disabled:bg-gray-400 transition-all flex items-center justify-center space-x-2 focus-ring"
          >
            {isSearching ? (
              <>
                <div className="spinner w-5 h-5"></div>
                <span>Finding Routes...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5 icon-spin" />
                <span>Find Green Routes</span>
                <Zap className="w-5 h-5 icon-spin" />
              </>
            )}
          </button>
        </div>

        <div className={`bg-white rounded-2xl shadow-xl p-8 mb-8 card-hover neon-glow ${
          isVisible ? 'slide-in-up' : 'opacity-0'
        }`} style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <MapPin className="w-6 h-6 text-green-500 icon-spin" />
              <span>Interactive Route Map</span>
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
          <div className="rounded-xl h-64 md:h-96 border border-gray-200 overflow-hidden relative">
            <div ref={mapRef} className="w-full h-full"></div>
            {isSearching && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="spinner w-8 h-8 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            )}
          </div>
          {scenarioCards.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center flex items-center justify-center space-x-2">
                <Target className="w-6 h-6 text-green-500 icon-spin" />
                <span>Route Recommendations</span>
                <Zap className="w-6 h-6 text-yellow-500 icon-spin" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scenarioCards.map((card, index) => (
                  <div 
                    key={card.key} 
                    className={`rounded-xl border ${card.color} p-4 bg-white shadow-sm card-hover group cursor-pointer ${
                      isVisible ? 'stagger-item' : 'opacity-0'
                    }`}
                    style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                        {card.title}
                      </div>
                      <div className="flex items-center space-x-1">
                        {card.key === 'metro' && <Bus className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform duration-300" />}
                        {card.key === 'bus' && <Bus className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform duration-300" />}
                        {card.key === 'carpool' && <Users className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform duration-300" />}
                        {card.key === 'car' && <Car className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform duration-300" />}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-3 group-hover:text-gray-700 transition-colors duration-300">
                      {card.subtitle}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm text-gray-700 mb-3">
                      <div className="text-center p-2 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors duration-300">
                        <div className="text-gray-500 flex items-center justify-center space-x-1">
                          <Leaf className="w-3 h-3" />
                          <span>CO₂</span>
                        </div>
                        <div className="font-semibold text-green-700">{card.co2Kg} kg</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
                        <div className="text-gray-500 flex items-center justify-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Cost</span>
                        </div>
                        <div className="font-semibold text-blue-700">₹{card.cost}</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors duration-300">
                        <div className="text-gray-500 flex items-center justify-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Time</span>
                        </div>
                        <div className="font-semibold text-purple-700">{card.durationMin} min</div>
                      </div>
                    </div>
                    <div className="text-right text-green-700 text-xs mb-3 flex items-center justify-end space-x-1">
                      <Star className="w-3 h-3" />
                      <span>+{card.points} points</span>
                    </div>
                    <button
                      onClick={() => handleStartScenario(card.key, card.mode)}
                      disabled={saving}
                      className="btn-primary w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-2 rounded-lg font-semibold disabled:bg-gray-400 flex items-center justify-center space-x-2 focus-ring"
                    >
                      <Target className="w-4 h-4 icon-spin" />
                      <span>Start Journey & Track</span>
                      <Zap className="w-4 h-4 icon-spin" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {availableRoutes.length > 0 && (
            <div className="mt-4">
              <button 
                onClick={handleSaveJourney} 
                disabled={saving} 
                className="btn-primary w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 flex items-center justify-center space-x-2 focus-ring"
              >
                {saving ? (
                  <>
                    <div className="spinner w-5 h-5"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5 icon-spin" />
                    <span>Save Journey & Earn Points</span>
                    <Zap className="w-5 h-5 icon-spin" />
                  </>
                )}
              </button>
            </div>
          )}
          {(routeDistance || routeDuration) && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {routeDistance && (
                <div className="p-3 rounded-lg bg-green-50 text-green-800 text-sm card-hover group cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <Leaf className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    <span>Distance: <span className="font-semibold">{routeDistance}</span></span>
                  </div>
                </div>
              )}
              {routeDuration && (
                <div className="p-3 rounded-lg bg-blue-50 text-blue-800 text-sm card-hover group cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    <span>Duration: <span className="font-semibold">{routeDuration}</span></span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live tracking card */}
        <div className={`bg-white rounded-2xl shadow-xl p-8 mb-8 card-hover neon-glow ${
          isVisible ? 'slide-in-up' : 'opacity-0'
        }`} style={{ animationDelay: '0.8s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Target className="w-6 h-6 text-green-500 icon-spin" />
              <span>Live Journey Tracking</span>
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span>{isTracking ? 'Tracking' : 'Ready'}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <Route className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                <span>Tracking mode</span>
              </label>
              <select
                value={trackingMode}
                onChange={(e) => setTrackingMode(e.target.value as TravelMode)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white group-hover:border-green-400 transition-colors duration-300"
              >
                <option value="TRANSIT">Public Transit</option>
                <option value="DRIVING">Car / Carpool</option>
                <option value="BICYCLING">Cycling</option>
                <option value="WALKING">Walking</option>
              </select>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-blue-50 group cursor-pointer">
              <div className="text-sm text-gray-600 mb-1 flex items-center justify-center space-x-1">
                <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                <span>Distance tracked</span>
              </div>
              <div className="text-2xl font-bold text-green-700 group-hover:text-green-600 transition-colors duration-300">
                {trackedDistanceKm.toFixed(2)} km
              </div>
            </div>
            <div className="flex gap-2">
              {!isTracking ? (
                <button 
                  onClick={startLiveTracking} 
                  className="btn-primary w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 flex items-center justify-center space-x-2 focus-ring"
                >
                  <Target className="w-5 h-5 icon-spin" />
                  <span>Start Tracking</span>
                </button>
              ) : (
                <>
                  <button 
                    onClick={stopAndSaveLiveTracking} 
                    className="btn-primary w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 flex items-center justify-center space-x-2 focus-ring"
                  >
                    <Zap className="w-5 h-5 icon-spin" />
                    <span>Stop & Save</span>
                  </button>
                  <button 
                    onClick={() => { 
                      if (geoWatchIdRef.current !== null) { 
                        navigator.geolocation.clearWatch(geoWatchIdRef.current); 
                        geoWatchIdRef.current = null; 
                      } 
                      setIsTracking(false); 
                      setTrackedDistanceKm(0); 
                      lastPointRef.current = null; 
                      if (polylineRef.current) { 
                        const path = polylineRef.current.getPath && polylineRef.current.getPath(); 
                        if (path && path.clear) path.clear(); 
                      } 
                    }} 
                    className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 flex items-center justify-center space-x-2 transition-all duration-300"
                  >
                    <span>Cancel</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Maps;
