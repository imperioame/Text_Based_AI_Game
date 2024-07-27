import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Game from './components/Game';

function App() {
  return (
    <Router>
      <div className="bg-gray-900 min-h-screen text-green-400 font-mono">
        <Switch>
          <Route exact path="/" component={Game} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;