import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Dashboard } from 'container';

const Routes: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route exact path='/' component={Dashboard} />
        {/* <Route exact path='/xx/:xxId' component={XX} /> */}
      </Switch>
    </Router>
  );
};

export default Routes;
