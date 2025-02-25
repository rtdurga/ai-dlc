import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar
} from '@material-ui/core';
import { surveyService } from '../services/apiService';
import { SurveyEntry } from '../services/inMemoryDatabase';

const SurveyDashboard: React.FC = () => {
  const [surveys, setSurveys] = useState<SurveyEntry[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newSurvey, setNewSurvey] = useState({
    towerId: '',
    location: '',
    latitude1: '',
    longitude1: '',
    latitude2: '',
    longitude2: '',
    latitude3: '',
    longitude3: '',
    latitude4: '',
    longitude4: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const data = await surveyService.getSurveyData();
      setSurveys(data);
    } catch (err) {
      setError('Failed to fetch surveys');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSurvey(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateSurvey = async () => {
    // Validate input
    if (!newSurvey.towerId || !newSurvey.location) {
      setError('Tower ID and Location are required');
      return;
    }

    try {
      const surveyData = {
        towerId: newSurvey.towerId,
        location: newSurvey.location,
        polygonPoints: [
          { 
            latitude: parseFloat(newSurvey.latitude1), 
            longitude: parseFloat(newSurvey.longitude1) 
          },
          { 
            latitude: parseFloat(newSurvey.latitude2), 
            longitude: parseFloat(newSurvey.longitude2) 
          },
          { 
            latitude: parseFloat(newSurvey.latitude3), 
            longitude: parseFloat(newSurvey.longitude3) 
          },
          { 
            latitude: parseFloat(newSurvey.latitude4), 
            longitude: parseFloat(newSurvey.longitude4) 
          }
        ]
      };

      await surveyService.createSurvey(surveyData);
      fetchSurveys();
      setOpenDialog(false);
      setNewSurvey({
        towerId: '',
        location: '',
        latitude1: '',
        longitude1: '',
        latitude2: '',
        longitude2: '',
        latitude3: '',
        longitude3: '',
        latitude4: '',
        longitude4: ''
      });
    } catch (err) {
      setError('Failed to create survey');
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Survey Dashboard
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => setOpenDialog(true)}
        style={{ marginBottom: '20px' }}
      >
        Create New Survey
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tower ID</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Polygon Points</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {surveys.map((survey) => (
              <TableRow key={survey.id}>
                <TableCell>{survey.towerId}</TableCell>
                <TableCell>{survey.location}</TableCell>
                <TableCell>
                  {survey.polygonPoints.map((point, index) => 
                    `(${point.latitude}, ${point.longitude})${index < survey.polygonPoints.length - 1 ? ', ' : ''}`
                  )}
                </TableCell>
                <TableCell>{new Date(survey.timestamp).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Survey</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Tower ID"
                name="towerId"
                value={newSurvey.towerId}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={newSurvey.location}
                onChange={handleInputChange}
                required
              />
            </Grid>
            {[1, 2, 3, 4].map((num) => (
              <React.Fragment key={num}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={`Latitude ${num}`}
                    name={`latitude${num}`}
                    type="number"
                    value={newSurvey[`latitude${num}` as keyof typeof newSurvey]}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={`Longitude ${num}`}
                    name={`longitude${num}`}
                    type="number"
                    value={newSurvey[`longitude${num}` as keyof typeof newSurvey]}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreateSurvey} color="primary">
            Create Survey
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
        ContentProps={{
          style: {
            backgroundColor: '#d32f2f',
            color: 'white'
          }
        }}
      />
    </Container>
  );
};

export default SurveyDashboard;
