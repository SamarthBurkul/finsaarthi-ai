import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Phone, Search, Filter, Loader } from 'lucide-react';
import { BankLocation } from './Types';

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
  const [searchedLocation, setSearchedLocation] = useState<{lat: number, lng: number, name: string} | null>(null);

  // Get user's current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or unavailable');
        }
      );
    }
  }, []);

  // Geocode the search location to get coordinates
  const geocodeLocation = async (locationName: string): Promise<{lat: number, lng: number} | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Search for banks near the specified coordinates
  const searchBanksNearLocation = async (lat: number, lng: number): Promise<BankLocation[]> => {
    try {
      // Using Overpass API to find banks and ATMs
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="bank"](around:5000,${lat},${lng});
          node["amenity"="atm"](around:5000,${lat},${lng});
          way["amenity"="bank"](around:5000,${lat},${lng});
          way["amenity"="atm"](around:5000,${lat},${lng});
        );
        out body;
        >;
        out skel qt;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });

      const data = await response.json();
      
      const locations: BankLocation[] = data.elements
        .filter((element: any) => element.tags && (element.tags.amenity === 'bank' || element.tags.amenity === 'atm'))
        .map((element: any, index: number) => {
          const elementLat = element.lat || element.center?.lat;
          const elementLng = element.lon || element.center?.lon;
          
          if (!elementLat || !elementLng) return null;

          const distance = calculateDistance(lat, lng, elementLat, elementLng);
          
          return {
            id: `${element.id}-${index}`,
            name: element.tags.name || `${element.tags.amenity === 'bank' ? 'Bank' : 'ATM'} ${index + 1}`,
            type: element.tags.amenity as 'bank' | 'atm',
            address: formatAddress(element.tags),
            coordinates: {
              lat: elementLat,
              lng: elementLng
            },
            distance: parseFloat(distance.toFixed(2)),
            phone: element.tags.phone || element.tags['contact:phone'] || undefined,
            hours: element.tags.opening_hours || '24/7'
          };
        })
        .filter((location: BankLocation | null) => location !== null)
        .sort((a: BankLocation, b: BankLocation) => a.distance - b.distance)
        .slice(0, 20); // Limit to 20 results

      return locations;
    } catch (error) {
      console.error('Error searching banks:', error);
      return [];
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Format address from OpenStreetMap tags
  const formatAddress = (tags: any): string => {
    const parts = [];
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
    
    return parts.length > 0 ? parts.join(', ') : 'Location details available on map';
  };

  const handleSearch = async () => {
    if (!searchLocation.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Geocode the search location
      const coordinates = await geocodeLocation(searchLocation);
      
      if (!coordinates) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setSearchedLocation({
        lat: coordinates.lat,
        lng: coordinates.lng,
        name: searchLocation
      });

      // Search for banks near the geocoded location
      let searchResults = await searchBanksNearLocation(coordinates.lat, coordinates.lng);
      
      // Apply filter
      if (filterType !== 'all') {
        searchResults = searchResults.filter(location => location.type === filterType);
      }
      
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const openGoogleMaps = () => {
    if (searchedLocation) {
      // Open map centered on searched location
      const url = `https://www.google.com/maps/search/banks+atm/@${searchedLocation.lat},${searchedLocation.lng},14z`;
      window.open(url, '_blank');
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const url = `https://www.google.com/maps/search/banks+atm/@${lat},${lng},15z`;
        window.open(url, '_blank');
      }, () => {
        window.open('https://www.google.com/maps/search/banks+atm', '_blank');
      });
    } else {
      window.open('https://www.google.com/maps/search/banks+atm', '_blank');
    }
  };

  const getDirections = (location: BankLocation) => {
    const destinationCoords = `${location.coordinates.lat},${location.coordinates.lng}`;
    
    if (userLocation) {
      // Use user's current location as starting point
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${destinationCoords}`;
      window.open(url, '_blank');
    } else if (searchedLocation) {
      // Use searched location as starting point
      const url = `https://www.google.com/maps/dir/${searchedLocation.lat},${searchedLocation.lng}/${destinationCoords}`;
      window.open(url, '_blank');
    } else {
      // Just open the destination
      window.open(`https://www.google.com/maps/search/?api=1&query=${destinationCoords}`, '_blank');
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Reverse geocode to get location name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            const data = await response.json();
            const locationName = data.address?.city || data.address?.town || data.address?.village || 'Current Location';
            setSearchLocation(locationName);
            setSearchedLocation({ lat, lng, name: locationName });
            
            // Search for banks
            let searchResults = await searchBanksNearLocation(lat, lng);
            if (filterType !== 'all') {
              searchResults = searchResults.filter(location => location.type === filterType);
            }
            setResults(searchResults);
          } catch (error) {
            console.error('Reverse geocoding error:', error);
          } finally {
            setIsSearching(false);
          }
        },
        (error) => {
          console.error('Location error:', error);
          setIsSearching(false);
          alert('Unable to get your current location. Please enter a location manually.');
        }
      );
    }
  };

  return (
    <section className="py-16 relative overflow-hidden bg-[#0C2B4E]">
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-slate-900/60 backdrop-blur-xl"></div>
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
            Search for banks and ATMs in any city across India. Get real-time locations with distance and directions.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Search Section */}
          <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20 mb-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center text-soft-white font-ubuntu">
              <Search className="w-5 h-5 mr-2 text-emerald-400" />
              Search Any Location in India
            </h3>
            
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Enter city, area, or pincode (e.g., Pune, Connaught Place, 400001)..."
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
                      <Loader className="w-4 h-4 animate-spin" />
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

            {/* Use Current Location Button */}
            <button
              onClick={useCurrentLocation}
              disabled={isSearching}
              className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Navigation className="w-4 h-4" />
              <span>Use My Current Location</span>
            </button>
          </div>

          {/* Results Section */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center text-soft-white font-ubuntu">
                <MapPin className="w-5 h-5 mr-2 text-emerald-400" />
                Found {results.length} locations near {searchedLocation?.name || searchLocation}
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
                          {location.hours}
                        </span>
                        {location.phone && (
                          <span className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {location.phone}
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
          <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20 my-8 text-center">
            <h3 className="text-xl font-semibold mb-4 flex items-center justify-center font-ubuntu text-soft-white">
              <MapPin className="w-5 h-5 mr-2 text-emerald-400" />
              View on Google Maps
            </h3>
            <p className="text-white mb-6 font-ubuntu">
              {searchedLocation 
                ? `See all banks and ATMs near ${searchedLocation.name} on Google Maps`
                : 'Open Google Maps to see nearby banks and ATMs with real-time directions'}
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
                We couldn't find any banks or ATMs near "{searchLocation}". Try a different city or area name.
              </p>
              <button
                onClick={() => {
                  setSearchLocation('');
                  setResults([]);
                  setSearchedLocation(null);
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
                  <li>• Search ANY city in India (Mumbai, Pune, Delhi, etc.)</li>
                  <li>• Enter area names like "Connaught Place Delhi"</li>
                  <li>• Use pincodes for precise results (e.g., 400001)</li>
                  <li>• Click "Use My Current Location" for nearby results</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-soft-white font-ubuntu">📍 What You Get:</h4>
                <ul className="text-sm text-white space-y-1 font-ubuntu">
                  <li>• Real-time data from OpenStreetMap</li>
                  <li>• Distance from searched location</li>
                  <li>• Complete address and contact info</li>
                  <li>• Direct Google Maps navigation</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-sm text-white font-ubuntu">
                <strong>💡 Pro Tip:</strong> You can search for banks in Pune while sitting in Mumbai, or any other city combination across India!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BankLocator;