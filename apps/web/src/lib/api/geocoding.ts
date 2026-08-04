export interface GeocodingResult {
    displayName: string;
    latitude: number;
    longitude: number;
}

export async function searchAddress(query: string): Promise<GeocodingResult[]> {
    const params = new URLSearchParams({ q: query, format: 'json', limit: '5' });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);

    if (!response.ok) {
        throw new Error('Address search failed');
    }

    const data: { display_name: string; lat: string; lon: string }[] = await response.json();

    return data.map((result) => ({
        displayName: result.display_name,
        latitude: Number(result.lat),
        longitude: Number(result.lon),
    }));
}
