import React, { useState, useRef } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@material-ui/core';
import { parseKMLCoordinates, normalizeCoordinates, PolygonCoordinate } from '../utils/kmlParser';

interface TowerPolygon {
  towerId: string;
  polygonCoordinates: PolygonCoordinate[];
}

// Mock data for demonstration
const MOCK_TOWER_POLYGONS: { [key: string]: TowerPolygon } = {
  'TOWER001': {
    towerId: 'TOWER001',
    polygonCoordinates: [
      { latitude: 12.9716, longitude: 77.5946 },
      { latitude: 12.9820, longitude: 77.5980 },
      { latitude: 12.9750, longitude: 77.6030 },
      { latitude: 12.9700, longitude: 77.5900 }
    ]
  },
  'TOWER002': {
    towerId: 'TOWER002',
    polygonCoordinates: [
      { latitude: 13.0827, longitude: 80.2707 },
      { latitude: 13.0900, longitude: 80.2750 },
      { latitude: 13.0850, longitude: 80.2800 },
      { latitude: 13.0800, longitude: 80.2750 }
    ]
  }
};

const MapVisualization: React.FC = () => {
  const [towerId, setTowerId] = useState<string>('');
  const [selectedPolygon, setSelectedPolygon] = useState<TowerPolygon | null>(null);
  const [uploadedPolygon, setUploadedPolygon] = useState<PolygonCoordinate[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    const polygon = MOCK_TOWER_POLYGONS[towerId];
    setSelectedPolygon(polygon || null);
    setUploadedPolygon(null);
  };

  const generateSampleKML = () => {
    if (!selectedPolygon) return;

    const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Placemark>
    <name>${selectedPolygon.towerId} Polygon</name>
    <Polygon>
      <outerBoundaryIs>
        <LinearRing>
          <coordinates>
            ${selectedPolygon.polygonCoordinates.map(coord => 
              `${coord.longitude},${coord.latitude},0`
            ).join('\n            ')}
            ${`${selectedPolygon.polygonCoordinates[0].longitude},${selectedPolygon.polygonCoordinates[0].latitude},0`}
          </coordinates>
        </LinearRing>
      </outerBoundaryIs>
    </Polygon>
  </Placemark>
</kml>`;

    const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPolygon.towerId}_polygon.kml`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const coordinates = parseKMLCoordinates(text);
          setUploadedPolygon(coordinates);
          setSelectedPolygon(null);
          
          // Reset file input to allow re-uploading the same file
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          alert('Error parsing KML file: ' + (error instanceof Error ? error.message : String(error)));
        }
      };
      reader.readAsText(file);
    }
  };

  const renderPolygonDetails = () => {
    const polygonToRender = selectedPolygon?.polygonCoordinates || uploadedPolygon;
    if (!polygonToRender) return null;

    const normalizedCoords = normalizeCoordinates(polygonToRender);

    return (
      <Paper style={{ marginTop: '20px', padding: '20px' }}>
        <Typography variant="h6">
          {selectedPolygon ? `Polygon Details for ${selectedPolygon.towerId}` : 'Uploaded Polygon'}
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Coordinate</TableCell>
                    <TableCell>Latitude</TableCell>
                    <TableCell>Longitude</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {polygonToRender.map((coord, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{coord.latitude}</TableCell>
                      <TableCell>{coord.longitude}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Polygon Visualization</Typography>
            <div style={{ 
              width: '100%', 
              height: '300px', 
              border: '1px solid #ccc', 
              position: 'relative',
              overflow: 'hidden'
            }}>
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 300 300" 
                preserveAspectRatio="xMidYMid meet"
              >
                {normalizedCoords.map((coord, index) => {
                  const nextCoord = normalizedCoords[(index + 1) % normalizedCoords.length];

                  return (
                    <React.Fragment key={index}>
                      <line 
                        x1={coord.x}
                        y1={coord.y}
                        x2={nextCoord.x}
                        y2={nextCoord.y}
                        stroke="blue"
                        strokeWidth="2"
                      />
                      <circle 
                        cx={coord.x}
                        cy={coord.y}
                        r="3"
                        fill="red"
                      />
                    </React.Fragment>
                  );
                })}
              </svg>
            </div>
          </Grid>
        </Grid>
        
        <Grid container spacing={2} style={{ marginTop: '20px' }}>
          {selectedPolygon && (
            <Grid item>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={generateSampleKML}
              >
                Generate Sample KML
              </Button>
            </Grid>
          )}
          <Grid item>
            <input 
              type="file" 
              accept=".kml"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <Button 
              variant="contained" 
              color="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload KML
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="default"
              onClick={() => {
                const firstCoord = selectedPolygon?.polygonCoordinates[0] || uploadedPolygon?.[0];
                if (firstCoord) {
                  window.open(`https://www.google.com/maps?q=${firstCoord.latitude},${firstCoord.longitude}`, '_blank');
                }
              }}
            >
              View on Google Maps
            </Button>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Tower Polygon Lookup
      </Typography>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={8}>
          <TextField
            fullWidth
            label="Enter Tower ID"
            variant="outlined"
            value={towerId}
            onChange={(e) => setTowerId(e.target.value)}
            placeholder="e.g., TOWER001"
          />
        </Grid>
        <Grid item xs={4}>
          <Button 
            fullWidth 
            variant="contained" 
            color="primary" 
            onClick={handleSearch}
          >
            Search Polygon
          </Button>
        </Grid>
      </Grid>

      {(selectedPolygon || uploadedPolygon) ? renderPolygonDetails() : (
        <Typography variant="body1" style={{ marginTop: '20px' }}>
          Enter a Tower ID or upload a KML file to view polygon details. 
          Available Tower IDs: TOWER001, TOWER002
        </Typography>
      )}
    </Container>
  );
};

export default MapVisualization;
