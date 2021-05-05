import React from 'react'
import Routes from 'router/Routes'
import { addFontAwesomeIcon } from 'asset/fontAwesomeIcon/fontAwesomeIcon';
import './App.css';

addFontAwesomeIcon()

function App() {
  return (
    <div className="App">
      <Routes />
    </div>
  );
}

export default App;
