import * as xmldom from 'xmldom';
import * as xpath from 'xpath';

export interface PolygonCoordinate {
  latitude: number;
  longitude: number;
}

export function parseKMLCoordinates(kmlContent: string): PolygonCoordinate[] {
  const parser = new xmldom.DOMParser();
  const xmlDoc = parser.parseFromString(kmlContent, 'text/xml');
  
  // Extensive XPath search for coordinates
  const coordinatesNodes = xpath.select(
    "//coordinates|//LinearRing/coordinates|//Polygon/outerBoundaryIs/LinearRing/coordinates", 
    xmlDoc
  ) as Element[];
  
  if (coordinatesNodes.length === 0) {
    console.error('No coordinates nodes found', xmlDoc.documentElement.outerHTML);
    throw new Error('No coordinates found in KML');
  }

  // Get the first coordinates node's text content
  const coordinatesText = coordinatesNodes[0].textContent || '';
  
  // More robust coordinate parsing
  const coordinates = coordinatesText
    .trim()
    .split(/[\s,]+/)
    .reduce((acc: PolygonCoordinate[], val, index, arr) => {
      // Ensure we have complete coordinate sets (longitude, latitude, optional altitude)
      if (index % 3 === 0 && index + 2 < arr.length) {
        const longitude = parseFloat(arr[index]);
        const latitude = parseFloat(arr[index + 1]);
        if (!isNaN(longitude) && !isNaN(latitude)) {
          acc.push({ latitude, longitude });
        }
      }
      return acc;
    }, []);

  // Remove duplicate first/last point if they're the same
  if (coordinates.length > 1 && 
      coordinates[0].latitude === coordinates[coordinates.length - 1].latitude &&
      coordinates[0].longitude === coordinates[coordinates.length - 1].longitude) {
    coordinates.pop();
  }

  if (coordinates.length === 0) {
    console.error('Unable to parse coordinates', coordinatesText);
    throw new Error('Unable to parse coordinates from KML');
  }

  return coordinates;
}

export function normalizeCoordinates(
  coordinates: PolygonCoordinate[], 
  viewportWidth: number = 300, 
  viewportHeight: number = 300
): { x: number, y: number }[] {
  if (coordinates.length === 0) return [];

  // Find min and max of latitude and longitude
  const lats = coordinates.map(c => c.latitude);
  const lons = coordinates.map(c => c.longitude);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  // Calculate scaling factors
  const latRange = maxLat - minLat;
  const lonRange = maxLon - minLon;

  return coordinates.map(coord => ({
    x: ((coord.longitude - minLon) / lonRange) * viewportWidth,
    y: viewportHeight - ((coord.latitude - minLat) / latRange) * viewportHeight
  }));
}
