import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Game from './components/Game';

function App() {
  return (
    <Router>
      <div className="p-16 rounded-xl h-full bg-gray-900 text-indigo-300">
        <Switch>
          <Route exact path="/" component={Game} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;