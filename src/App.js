import React from 'react';
import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import Form1 from './Components/form-materialui'
import Face from './Components/face'
import FaceMatch from './Components/face match'

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

  <Route exact path="/face-match">
    <FaceMatch/>
  </Route>
  </Switch>

</Router>
  );
}

export default App;
