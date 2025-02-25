import React from 'react';
import { 
  Container, 
  AppBar, 
  Toolbar, 
  Typography 
} from '@material-ui/core';
import MapVisualization from './components/MapVisualization';

const App: React.FC = () => {
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            GeoCELL DaaS Platform
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" style={{ marginTop: '20px' }}>
        <MapVisualization />
      </Container>
    </div>
  );
};

export default App;
