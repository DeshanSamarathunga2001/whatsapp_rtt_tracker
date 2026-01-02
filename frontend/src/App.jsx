/**
 * App Component
 * 
 * PURPOSE: Root component of the React application
 * 
 * WHY MINIMAL:
 * - Dashboard handles everything
 * - Easy to add routing later if needed
 * - Clean separation of concerns
 */

import React from 'react';
import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}

export default App;