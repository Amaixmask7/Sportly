import { useState, useEffect, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Search, X } from 'lucide-react';

interface MapPickerProps {
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
  initialLocation?: { address: string; lat: number; lng: number };
  className?: string;
}

interface MapComponentProps {
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
  initialLocation?: { address: string; lat: number; lng: number };
}

const MapComponent = ({ onLocationSelect, initialLocation }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = new google.maps.Map(mapRef.current, {
      center: initialLocation 
        ? { lat: initialLocation.lat, lng: initialLocation.lng }
        : { lat: -6.2088, lng: 106.8456 }, // Jakarta default
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapInstanceRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();

    // Add initial marker if location provided
    if (initialLocation) {
      const marker = new google.maps.Marker({
        position: { lat: initialLocation.lat, lng: initialLocation.lng },
        map: map,
        draggable: true,
      });
      markerRef.current = marker;
    }

    // Add click listener to map
    map.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        // Remove existing marker
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }

        // Add new marker
        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: map,
          draggable: true,
        });
        markerRef.current = marker;

        // Geocode to get address
        geocoderRef.current?.geocode(
          { location: { lat, lng } },
          (results, status) => {
            if (status === 'OK' && results && results[0]) {
              onLocationSelect({
                address: results[0].formatted_address,
                lat,
                lng,
              });
            }
          }
        );
      }
    });

    // Add marker drag listener
    if (markerRef.current) {
      markerRef.current.addListener('dragend', () => {
        const position = markerRef.current?.getPosition();
        if (position) {
          const lat = position.lat();
          const lng = position.lng();
          
          geocoderRef.current?.geocode(
            { location: { lat, lng } },
            (results, status) => {
              if (status === 'OK' && results && results[0]) {
                onLocationSelect({
                  address: results[0].formatted_address,
                  lat,
                  lng,
                });
              }
            }
          );
        }
      });
    }
  }, [onLocationSelect, initialLocation]);

  return <div ref={mapRef} className="w-full h-64 rounded-lg" />;
};

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Memuat peta...</p>
          </div>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Gagal memuat peta</p>
          </div>
        </div>
      );
    case Status.SUCCESS:
      return null;
  }
};

export const MapPicker = ({ onLocationSelect, initialLocation, className }: MapPickerProps) => {
  const [searchQuery, setSearchQuery] = useState(initialLocation?.address || '');
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);

  const handleLocationSelect = (location: { address: string; lat: number; lng: number }) => {
    setSelectedLocation(location);
    setSearchQuery(location.address);
    onLocationSelect(location);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { address: searchQuery },
      (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          
          handleLocationSelect({
            address: results[0].formatted_address,
            lat,
            lng,
          });
        }
      }
    );
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Pilih Lokasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              Google Maps API key tidak dikonfigurasi.
            </p>
            <p className="text-xs text-muted-foreground">
              Tambahkan VITE_GOOGLE_MAPS_API_KEY ke file .env
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Pilih Lokasi Venue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari alamat atau nama tempat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="bg-muted/50 p-3 rounded-md">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">Lokasi Terpilih:</p>
                <p className="text-sm text-muted-foreground">{selectedLocation.address}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Koordinat: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedLocation(undefined);
                  setSearchQuery('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Map Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMapVisible(!isMapVisible)}
          >
            {isMapVisible ? 'Sembunyikan Peta' : 'Tampilkan Peta'}
          </Button>
          <p className="text-xs text-muted-foreground">
            Klik pada peta untuk memilih lokasi
          </p>
        </div>

        {/* Map */}
        {isMapVisible && (
          <Wrapper apiKey={apiKey} render={render}>
            <MapComponent
              onLocationSelect={handleLocationSelect}
              initialLocation={selectedLocation}
            />
          </Wrapper>
        )}
      </CardContent>
    </Card>
  );
};
