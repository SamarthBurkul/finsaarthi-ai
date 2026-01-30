import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Phone, Search, Filter } from 'lucide-react';
import { bankLocations, searchBanksNearby } from '../data/bankData';
import { BankLocation } from '../types';

declare global {
  interface Window {
    initMap: () => void;
    google: any;
  }
}

const BankLocator: React.FC = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'bank' | 'atm'>('all');
  const [results, setResults] = useState<BankLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const handleSearch = () => {
    if (!searchLocation.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let searchResults = searchBanksNearby(searchLocation);
      
      if (filterType !== 'all') {
        searchResults = searchResults.filter(location => location.type === filterType);
      }
      
      setResults(searchResults);
      setIsSearching(false);
    }, 1000);
  };

  const openGoogleMaps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const url = `https://www.google.com/maps/search/banks+atm/@${lat},${lng},15z`;
        window.open(url, '_blank');
      }, () => {
        // Fallback if location access denied
        window.open('https://www.google.com/maps/search/banks+atm', '_blank');
      });
    } else {
      window.open('https://www.google.com/maps/search/banks+atm', '_blank');
    }
  };

  const getDirections = (location: BankLocation) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${location.coordinates.lat},${location.coordinates.lng}`;
      window.open(url, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(location.address)}`, '_blank');
    }
  };

  return (
    <section className="py-16 relative overflow-hidden bg-[#0C2B4E]">
  <div className="
    absolute inset-0
    bg-gradient-to-br from-black/40 to-slate-900/60
    backdrop-blur-xl
  "></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-ubuntu font-bold text-soft-white mb-4">
            Find Nearest <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">Banks & ATMs</span>
          </h2>
          <p className="text-lg text-white max-w-2xl mx-auto font-ubuntu">
            Locate banks and ATMs near you with distance, directions, and contact information. Perfect for rural areas and emergency situations.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Search Section */}
          <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20 mb-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center text-soft-white font-ubuntu">
              <Search className="w-5 h-5 mr-2 text-emerald-400" />
              Search Location
            </h3>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Enter your area, city, or pincode..."
                  className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-4 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none font-ubuntu text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'bank' | 'atm')}
                  className="bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-4 text-soft-white focus:border-emerald-400 focus:outline-none font-ubuntu"
                >
                  <option value="all">All</option>
                  <option value="bank">Banks Only</option>
                  <option value="atm">ATMs Only</option>
                </select>
                
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !searchLocation.trim()}
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center text-soft-white font-ubuntu">
                <MapPin className="w-5 h-5 mr-2 text-emerald-400" />
                Found {results.length} locations near "{searchLocation}"
              </h3>
              
              {results.map((location) => (
                <div key={location.id} className="bg-charcoal-gray rounded-2xl p-6 border border-slate-gray/20 hover:scale-[1.02] transition-transform duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${
                          location.type === 'bank' ? 'bg-blue-400' : 'bg-emerald-400'
                        }`}></div>
                        <h4 className="text-lg font-semibold text-soft-white font-ubuntu">{location.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          location.type === 'bank' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {location.type.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-white mb-2 flex items-center font-ubuntu">
                        <MapPin className="w-4 h-4 mr-1" />
                        {location.address}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-white">
                        <span className="flex items-center">
                          <Navigation className="w-4 h-4 mr-1" />
                          {location.distance} km away
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Open 24/7
                        </span>
                        {location.type === 'bank' && (
                          <span className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            Contact Available
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:ml-6">
                      <button
                        onClick={() => getDirections(location)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>Get Directions</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Open Google Maps */}
          <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20 mb-8 text-center">
            <h3 className="text-xl font-semibold mb-4 flex items-center justify-center font-ubuntu text-soft-white">
              <MapPin className="w-5 h-5 mr-2 text-emerald-400" />
              Find Banks & ATMs on Map
            </h3>
            <p className="text-white mb-6 font-ubuntu">
              Open Google Maps to see all nearby banks and ATMs with real-time directions
            </p>
            <button
              onClick={openGoogleMaps}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 text-lg flex items-center space-x-2 mx-auto"
            >
              <MapPin className="w-5 h-5" />
              <span>🗺️ Open Google Maps</span>
            </button>
          </div>

          {/* No Results */}
          {results.length === 0 && searchLocation && !isSearching && (
            <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20 text-center">
              <MapPin className="w-16 h-16 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-soft-white font-ubuntu">No locations found</h3>
              <p className="text-white mb-4 font-ubuntu">
                Try searching with a different location or check your spelling.
              </p>
              <button
                onClick={() => {
                  setSearchLocation('');
                  setResults([]);
                }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-12 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl p-8 border border-emerald-500/20">
            <h3 className="text-xl font-semibold mb-4 flex items-center text-soft-white font-ubuntu">
              <Filter className="w-5 h-5 mr-2 text-emerald-400" />
              How to Use Bank Locator
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-soft-white font-ubuntu">🔍 Search Tips:</h4>
                <ul className="text-sm text-white space-y-1 font-ubuntu">
                  <li>• Enter your area name, city, or pincode</li>
                  <li>• Use landmarks like "Near Metro Station"</li>
                  <li>• Try different spellings if no results</li>
                  <li>• Filter by Banks or ATMs for specific needs</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-soft-white font-ubuntu">📍 What You Get:</h4>
                <ul className="text-sm text-white space-y-1 font-ubuntu">
                  <li>• Exact distance from your location</li>
                  <li>• Complete address and directions</li>
                  <li>• Operating hours and contact info</li>
                  <li>• Bank vs ATM identification</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-sm text-white font-ubuntu">
                <strong>💡 Pro Tip:</strong> Save frequently visited bank locations in your phone's notes for quick access during emergencies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BankLocator;