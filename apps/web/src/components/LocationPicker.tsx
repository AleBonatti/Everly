import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { searchAddress, type GeocodingResult } from '../lib/api/geocoding';

import 'leaflet/dist/leaflet.css';

// @ts-expect-error - _getIconUrl is a private Leaflet API; this is the standard workaround for the Vite/webpack bundler icon-path bug
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface LocationPickerProps {
    latitude?: number;
    longitude?: number;
    onChange: (lat: number, lng: number) => void;
}

const DEFAULT_CENTER: [number, number] = [20, 0];
const DEFAULT_ZOOM = 2;
const SELECTED_ZOOM = 13;

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function RecenterOnChange({ latitude, longitude }: { latitude?: number; longitude?: number }) {
    const map = useMap();
    useEffect(() => {
        if (latitude !== undefined && longitude !== undefined) {
            map.setView([latitude, longitude], SELECTED_ZOOM);
        }
    }, [latitude, longitude, map]);
    return null;
}

export function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
    const [geoError, setGeoError] = useState('');
    const hasPosition = latitude !== undefined && longitude !== undefined;

    const [addressQuery, setAddressQuery] = useState('');
    const debouncedQuery = useDebouncedValue(addressQuery);
    const [results, setResults] = useState<GeocodingResult[]>([]);
    const [searchError, setSearchError] = useState('');

    function handleUseCurrentLocation() {
        if (!navigator.geolocation) {
            setGeoError('Geolocation is not supported by this browser');
            return;
        }
        setGeoError('');
        navigator.geolocation.getCurrentPosition(
            (position) => onChange(position.coords.latitude, position.coords.longitude),
            () => setGeoError('Could not get your location — check your browser permissions'),
        );
    }

    useEffect(() => {
        if (debouncedQuery.trim().length < 3) {
            return;
        }

        let cancelled = false;
        searchAddress(debouncedQuery)
            .then((found) => {
                if (!cancelled) {
                    setResults(found);
                    setSearchError('');
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setSearchError('Address search failed');
                }
            });

        return () => {
            cancelled = true;
        };
    }, [debouncedQuery]);

    const visibleResults = debouncedQuery.trim().length < 3 ? [] : results;

    function handleSelectResult(result: GeocodingResult) {
        onChange(result.latitude, result.longitude);
        setAddressQuery('');
        setResults([]);
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <label htmlFor="map-button" className="text-xs font-semibold text-muted-foreground">
                    Location (optional)
                </label>
                <button id="map-button" type="button" onClick={handleUseCurrentLocation} className="text-xs text-accent cursor-pointer">
                    Use my current location
                </button>
            </div>

            <div className="relative">
                <input
                    value={addressQuery}
                    onChange={(e) => setAddressQuery(e.target.value)}
                    placeholder="Search for an address..."
                    className="w-full bg-surface-inset border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none"
                />
                {visibleResults.length > 0 && (
                    <div className="absolute left-0 top-[calc(100%+4px)] w-full bg-surface border border-border rounded-lg shadow-2xl overflow-hidden z-2000 max-h-45 overflow-y-auto">
                        {visibleResults.map((result, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleSelectResult(result)}
                                className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-surface-inset border-b border-border-subtle last:border-b-0"
                            >
                                {result.displayName}
                            </button>
                        ))}
                    </div>
                )}
                {searchError && <span className="text-xs text-destructive">{searchError}</span>}
            </div>

            <div className="h-50 rounded-lg overflow-hidden border border-border">
                <MapContainer center={hasPosition ? [latitude, longitude] : DEFAULT_CENTER} zoom={hasPosition ? SELECTED_ZOOM : DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }}>
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {hasPosition && (
                        <Marker
                            position={[latitude, longitude]}
                            draggable
                            eventHandlers={{
                                dragend: (e) => {
                                    const { lat, lng } = e.target.getLatLng();
                                    onChange(lat, lng);
                                },
                            }}
                        />
                    )}

                    <ClickHandler onChange={onChange} />
                    <RecenterOnChange latitude={latitude} longitude={longitude} />
                </MapContainer>
            </div>
            {geoError && <span className="text-xs text-destructive">{geoError}</span>}
        </div>
    );
}
