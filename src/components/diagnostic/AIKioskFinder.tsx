'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Cpu, Clock, Phone, ExternalLink, Loader2, AlertCircle, Settings } from 'lucide-react';

interface AIKiosk {
  id: string;
  name: string;
  address: string;
  city: string;
  distance: string;
  operatingHours: string;
  phone?: string;
  features: string[];
  rating?: number;
  testsAvailable: string[];
  waitTime?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// City name normalization for matching
const normalizeCity = (city: string): string => {
  return city.toLowerCase().replace(/[^a-z]/g, '');
};

// Map of city aliases to canonical names
const CITY_ALIASES: Record<string, string> = {
  'bengaluru': 'bangalore',
  'mumbai': 'mumbai',
  'bombay': 'mumbai',
  'delhi': 'delhi',
  'newdelhi': 'delhi',
  'chennai': 'chennai',
  'madras': 'chennai',
  'kolkata': 'kolkata',
  'calcutta': 'kolkata',
  'hyderabad': 'hyderabad',
  'pune': 'pune',
  'ahmedabad': 'ahmedabad',
  'jaipur': 'jaipur',
  'lucknow': 'lucknow',
  'chandigarh': 'chandigarh',
  'kochi': 'kochi',
  'cochin': 'kochi',
  'gurgaon': 'gurgaon',
  'gurugram': 'gurgaon',
  'noida': 'noida',
  'surat': 'surat',
  'nagpur': 'nagpur',
  'indore': 'indore',
  'bhopal': 'bhopal',
  'coimbatore': 'coimbatore',
  'visakhapatnam': 'visakhapatnam',
  'vizag': 'visakhapatnam',
  'patna': 'patna',
  'vadodara': 'vadodara',
  'baroda': 'vadodara',
  'thiruvananthapuram': 'thiruvananthapuram',
  'trivandrum': 'thiruvananthapuram',
};

// All available AI kiosks by city
const ALL_KIOSKS: AIKiosk[] = [
  // Bangalore
  {
    id: 'blr-1',
    name: 'HealthATM - Phoenix Mall',
    address: 'Phoenix Marketcity, Whitefield',
    city: 'bangalore',
    distance: '1.2 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543210',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2', 'ECG', 'Cholesterol'],
    rating: 4.5,
    testsAvailable: ['Basic Health Check', 'Cardiac Screening', 'Diabetes Panel'],
    waitTime: '5 mins',
    coordinates: { lat: 12.9698, lng: 77.7499 },
  },
  {
    id: 'blr-2',
    name: 'MedCheck AI Kiosk - Majestic Station',
    address: 'Kempegowda Bus Station, Majestic',
    city: 'bangalore',
    distance: '3.5 km',
    operatingHours: '6 AM - 11 PM',
    features: ['Blood Pressure', 'Temperature', 'Weight', 'Height', 'Vision Test'],
    rating: 4.2,
    testsAvailable: ['Basic Vitals', 'Vision Screening'],
    waitTime: '2 mins',
    coordinates: { lat: 12.9779, lng: 77.5665 },
  },
  {
    id: 'blr-3',
    name: 'Dr. Lal PathLabs Kiosk',
    address: 'Indiranagar 100 Ft Road',
    city: 'bangalore',
    distance: '4.8 km',
    operatingHours: '7 AM - 9 PM',
    phone: '+91-1800-102-5522',
    features: ['Sample Collection', 'Report Printing', 'Health Assessment', 'AI Symptom Checker'],
    rating: 4.7,
    testsAvailable: ['Full Body Checkup', 'Thyroid Panel', 'Liver Function'],
    waitTime: '10 mins',
    coordinates: { lat: 12.9784, lng: 77.6408 },
  },
  // Mumbai
  {
    id: 'mum-1',
    name: 'HealthATM - Phoenix Palladium',
    address: 'High Street Phoenix, Lower Parel',
    city: 'mumbai',
    distance: '2.1 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543211',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2', 'ECG'],
    rating: 4.6,
    testsAvailable: ['Basic Health Check', 'Cardiac Screening'],
    waitTime: '8 mins',
    coordinates: { lat: 18.9947, lng: 72.8258 },
  },
  {
    id: 'mum-2',
    name: 'Thyrocare Health Kiosk',
    address: 'Andheri West Metro Station',
    city: 'mumbai',
    distance: '5.3 km',
    operatingHours: '7 AM - 10 PM',
    phone: '+91-1800-599-9999',
    features: ['Blood Pressure', 'BMI', 'Sample Collection', 'Report Printing'],
    rating: 4.4,
    testsAvailable: ['Thyroid Panel', 'Diabetes Panel', 'Full Body Checkup'],
    waitTime: '5 mins',
    coordinates: { lat: 19.1360, lng: 72.8296 },
  },
  // Delhi
  {
    id: 'del-1',
    name: 'HealthATM - Select Citywalk',
    address: 'Select Citywalk Mall, Saket',
    city: 'delhi',
    distance: '1.8 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543212',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2', 'ECG', 'Cholesterol'],
    rating: 4.7,
    testsAvailable: ['Basic Health Check', 'Cardiac Screening', 'Diabetes Panel'],
    waitTime: '6 mins',
    coordinates: { lat: 28.5289, lng: 77.2180 },
  },
  {
    id: 'del-2',
    name: 'Dr. Lal PathLabs Kiosk - Rajiv Chowk',
    address: 'Rajiv Chowk Metro Station',
    city: 'delhi',
    distance: '4.2 km',
    operatingHours: '6 AM - 11 PM',
    phone: '+91-1800-102-5522',
    features: ['Sample Collection', 'Report Printing', 'Health Assessment'],
    rating: 4.5,
    testsAvailable: ['Full Body Checkup', 'Thyroid Panel', 'Liver Function'],
    waitTime: '12 mins',
    coordinates: { lat: 28.6328, lng: 77.2197 },
  },
  // Chennai
  {
    id: 'chn-1',
    name: 'HealthATM - Express Avenue',
    address: 'Express Avenue Mall, Royapettah',
    city: 'chennai',
    distance: '2.5 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543213',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2', 'ECG'],
    rating: 4.4,
    testsAvailable: ['Basic Health Check', 'Cardiac Screening'],
    waitTime: '7 mins',
    coordinates: { lat: 13.0605, lng: 80.2605 },
  },
  {
    id: 'chn-2',
    name: 'Vijaya Diagnostic Kiosk',
    address: 'Chennai Central Railway Station',
    city: 'chennai',
    distance: '3.8 km',
    operatingHours: '6 AM - 10 PM',
    features: ['Blood Pressure', 'Temperature', 'Weight', 'Sample Collection'],
    rating: 4.3,
    testsAvailable: ['Basic Vitals', 'Diabetes Panel'],
    waitTime: '5 mins',
    coordinates: { lat: 13.0827, lng: 80.2707 },
  },
  // Hyderabad
  {
    id: 'hyd-1',
    name: 'HealthATM - Inorbit Mall',
    address: 'Inorbit Mall, Hitec City',
    city: 'hyderabad',
    distance: '1.5 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543214',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2', 'ECG', 'Cholesterol'],
    rating: 4.6,
    testsAvailable: ['Basic Health Check', 'Cardiac Screening', 'Diabetes Panel'],
    waitTime: '4 mins',
    coordinates: { lat: 17.4355, lng: 78.3835 },
  },
  {
    id: 'hyd-2',
    name: 'Vijaya Diagnostic Kiosk - Ameerpet',
    address: 'Ameerpet Metro Station',
    city: 'hyderabad',
    distance: '4.0 km',
    operatingHours: '7 AM - 10 PM',
    phone: '+91-040-4567890',
    features: ['Sample Collection', 'Report Printing', 'Blood Pressure', 'BMI'],
    rating: 4.5,
    testsAvailable: ['Full Body Checkup', 'Thyroid Panel', 'Liver Function', 'Kidney Function'],
    waitTime: '8 mins',
    coordinates: { lat: 17.4375, lng: 78.4483 },
  },
  // Pune
  {
    id: 'pun-1',
    name: 'HealthATM - Phoenix Marketcity',
    address: 'Phoenix Marketcity, Viman Nagar',
    city: 'pune',
    distance: '2.0 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543215',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2', 'ECG'],
    rating: 4.5,
    testsAvailable: ['Basic Health Check', 'Cardiac Screening'],
    waitTime: '6 mins',
    coordinates: { lat: 18.5623, lng: 73.9156 },
  },
  // Kolkata
  {
    id: 'kol-1',
    name: 'HealthATM - South City Mall',
    address: 'South City Mall, Prince Anwar Shah Road',
    city: 'kolkata',
    distance: '1.9 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543216',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2', 'ECG'],
    rating: 4.4,
    testsAvailable: ['Basic Health Check', 'Cardiac Screening', 'Diabetes Panel'],
    waitTime: '7 mins',
    coordinates: { lat: 22.5008, lng: 88.3631 },
  },
  // Ahmedabad
  {
    id: 'ahm-1',
    name: 'HealthATM - Ahmedabad One Mall',
    address: 'Ahmedabad One Mall, Vastrapur',
    city: 'ahmedabad',
    distance: '2.3 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543217',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2', 'ECG'],
    rating: 4.3,
    testsAvailable: ['Basic Health Check', 'Cardiac Screening'],
    waitTime: '5 mins',
    coordinates: { lat: 23.0361, lng: 72.5295 },
  },
  // Jaipur
  {
    id: 'jai-1',
    name: 'HealthATM - World Trade Park',
    address: 'World Trade Park, Malviya Nagar',
    city: 'jaipur',
    distance: '1.7 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543218',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2'],
    rating: 4.2,
    testsAvailable: ['Basic Health Check', 'Diabetes Panel'],
    waitTime: '4 mins',
    coordinates: { lat: 26.8528, lng: 75.8031 },
  },
  // Gurgaon
  {
    id: 'gur-1',
    name: 'HealthATM - Ambience Mall',
    address: 'Ambience Mall, DLF Phase 3',
    city: 'gurgaon',
    distance: '1.4 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543219',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2', 'ECG', 'Cholesterol'],
    rating: 4.6,
    testsAvailable: ['Basic Health Check', 'Cardiac Screening', 'Diabetes Panel'],
    waitTime: '5 mins',
    coordinates: { lat: 28.5043, lng: 77.0964 },
  },
  // Noida
  {
    id: 'noi-1',
    name: 'HealthATM - DLF Mall of India',
    address: 'DLF Mall of India, Sector 18',
    city: 'noida',
    distance: '1.6 km',
    operatingHours: '10 AM - 10 PM',
    phone: '+91-9876543220',
    features: ['Blood Pressure', 'BMI', 'Blood Glucose', 'SpO2', 'ECG'],
    rating: 4.5,
    testsAvailable: ['Basic Health Check', 'Cardiac Screening'],
    waitTime: '6 mins',
    coordinates: { lat: 28.5672, lng: 77.3266 },
  },
];

// Get user's city from cookie
const getUserCity = (): string | null => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'aihealz-geo') {
      const parts = value.split(':');
      // Format: country:city:area
      return parts[1] || null;
    }
  }
  return null;
};

// Get kiosks for a specific city
const getKiosksForCity = (citySlug: string | null): AIKiosk[] => {
  if (!citySlug) return [];
  const normalized = normalizeCity(citySlug);
  const canonicalCity = CITY_ALIASES[normalized] || normalized;
  return ALL_KIOSKS.filter(k => k.city === canonicalCity);
};

// Format city name for display
const formatCityName = (city: string): string => {
  return city.charAt(0).toUpperCase() + city.slice(1).replace(/-/g, ' ');
};

export default function AIKioskFinder() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kiosks, setKiosks] = useState<AIKiosk[]>([]);
  const [selectedKiosk, setSelectedKiosk] = useState<AIKiosk | null>(null);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // On mount, read the user's city from cookie
  useEffect(() => {
    const cityFromCookie = getUserCity();
    if (cityFromCookie) {
      setDetectedCity(cityFromCookie);
    }
  }, []);

  const getLocation = () => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    // First, try to use the city from cookie
    const cityFromCookie = getUserCity();
    if (cityFromCookie) {
      setDetectedCity(cityFromCookie);
      const cityKiosks = getKiosksForCity(cityFromCookie);
      if (cityKiosks.length > 0) {
        setKiosks(cityKiosks);
        setIsLoading(false);
        return;
      }
    }

    // If no city in cookie or no kiosks found, try browser geolocation
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      // Show default message
      setKiosks([]);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        // For now, still use cookie city as we don't have reverse geocoding
        const cityKiosks = getKiosksForCity(cityFromCookie);
        setKiosks(cityKiosks);
        setIsLoading(false);
      },
      (err) => {
        // Geolocation failed, use cookie city
        const cityKiosks = getKiosksForCity(cityFromCookie);
        if (cityKiosks.length === 0 && !cityFromCookie) {
          setError('Unable to detect your location. Please select your city from the location settings.');
        }
        setKiosks(cityKiosks);
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const openDirections = (kiosk: AIKiosk) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${kiosk.coordinates.lat},${kiosk.coordinates.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border border-white/10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Cpu size={28} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">AI Health Kiosks Near You</h2>
          <p className="text-slate-400">
            Find self-service diagnostic kiosks for quick health checks
          </p>
        </div>
      </div>

      {/* Location Display */}
      {detectedCity && !hasSearched && (
        <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-slate-800/50 border border-white/5">
          <div className="flex items-center gap-2 text-slate-400">
            <MapPin size={16} className="text-cyan-400" />
            <span>Your location: <span className="text-white font-medium">{formatCityName(detectedCity)}</span></span>
          </div>
          <a
            href="/settings"
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <Settings size={12} />
            Change
          </a>
        </div>
      )}

      {/* Location Button */}
      {!hasSearched && !isLoading && (
        <button
          onClick={getLocation}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          <MapPin size={20} />
          Find Kiosks {detectedCity ? `in ${formatCityName(detectedCity)}` : 'Near Me'}
        </button>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center gap-3 py-8 text-slate-400">
          <Loader2 size={24} className="animate-spin" />
          <span>Finding nearby health kiosks...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Kiosk List */}
      {hasSearched && kiosks.length > 0 && (
        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {kiosks.length} Kiosk{kiosks.length > 1 ? 's' : ''} Found
              {detectedCity && (
                <span className="text-slate-400 font-normal text-base ml-2">
                  in {formatCityName(detectedCity)}
                </span>
              )}
            </h3>
            <button
              onClick={() => { setHasSearched(false); setKiosks([]); }}
              className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <Navigation size={14} />
              Search Again
            </button>
          </div>

          <div className="grid gap-4">
            {kiosks.map((kiosk) => (
              <div
                key={kiosk.id}
                className={`bg-white/5 backdrop-blur border rounded-2xl p-5 transition-all cursor-pointer hover:bg-white/10 ${
                  selectedKiosk?.id === kiosk.id
                    ? 'border-cyan-500/50 ring-2 ring-cyan-500/20'
                    : 'border-white/10'
                }`}
                onClick={() => setSelectedKiosk(kiosk)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-white">{kiosk.name}</h4>
                      {kiosk.rating && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {kiosk.rating}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-400 mb-3">{kiosk.address}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-cyan-400">
                        <MapPin size={12} />
                        {kiosk.distance}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock size={12} />
                        {kiosk.operatingHours}
                      </span>
                      {kiosk.waitTime && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                          Wait: {kiosk.waitTime}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDirections(kiosk);
                    }}
                    className="flex-shrink-0 p-3 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                  >
                    <Navigation size={20} />
                  </button>
                </div>

                {/* Expanded Details */}
                {selectedKiosk?.id === kiosk.id && (
                  <div className="mt-4 pt-4 border-t border-white/10 animate-in slide-in-from-top-2">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                          Available Features
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {kiosk.features.map((feature) => (
                            <span
                              key={feature}
                              className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                          Tests Available
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {kiosk.testsAvailable.map((test) => (
                            <span
                              key={test}
                              className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs"
                            >
                              {test}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      {kiosk.phone && (
                        <a
                          href={`tel:${kiosk.phone}`}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone size={16} />
                          Call
                        </a>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDirections(kiosk);
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-white text-sm hover:bg-cyan-600 transition-colors"
                      >
                        <ExternalLink size={16} />
                        Get Directions
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Kiosks Found */}
      {hasSearched && !isLoading && kiosks.length === 0 && (
        <div className="mt-6 p-8 rounded-2xl bg-slate-800/50 border border-white/5 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyan-500/10 flex items-center justify-center">
            <Cpu size={32} className="text-cyan-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No AI Kiosks {detectedCity ? `in ${formatCityName(detectedCity)}` : 'Found'}
          </h3>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            {detectedCity
              ? `We're expanding our AI Health Kiosk network to ${formatCityName(detectedCity)} soon. Check back later or explore traditional diagnostic labs.`
              : 'We couldn\'t detect your location. Please enable location services or select your city.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/diagnostic-labs"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
            >
              Find Diagnostic Labs
            </a>
            <button
              onClick={() => { setHasSearched(false); setKiosks([]); }}
              className="px-5 py-2.5 rounded-xl bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors"
            >
              Search Again
            </button>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
        <h4 className="font-semibold text-white mb-2">What are AI Health Kiosks?</h4>
        <p className="text-sm text-slate-400 leading-relaxed">
          AI-powered self-service health kiosks allow you to perform basic health screenings
          without visiting a clinic. Get instant readings for blood pressure, BMI, glucose levels,
          and more. Some kiosks also offer AI symptom assessment and test booking services.
        </p>
      </div>
    </div>
  );
}
