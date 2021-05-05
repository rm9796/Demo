import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

test('should', () => {
  render(
    <Router>
      <Switch>
        <Route exact path='/' component={Dashboard} />
      </Switch>
    </Router>,
  );
  expect(screen.queryByText('')).toBeInTheDocument();
});
