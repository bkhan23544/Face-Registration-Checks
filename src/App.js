import React from 'react';
import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import Form1 from './Components/form-materialui'
import Face from './Components/face'

function App() {
  return (
<Router>

  <Switch>

  <Route exact path="/face">
    <Face/>
  </Route>

  <Route exact path="/">
    <Form1/>
  </Route>
  </Switch>

</Router>
  );
}

export default App;
