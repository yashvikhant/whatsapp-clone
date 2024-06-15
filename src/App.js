import React, {useState} from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Sidebar from './Sidebar';
import Chat from './Chat.js';
import Login from './Login.js';
import { useStateValue } from "./StateProvider";

function App() {
  const [{ user }, dispatch] = useStateValue();

  return (
    <div className="app">
      {!user ? (
        <Login/>
      ) : (
        <div className='app_body'>
          <Router>
            <Sidebar />
              <Routes>
                <Route path="/rooms/:roomId" element={<Chat/>}>
                </Route>
                <Route path="/" element={<Chat/>}>
                </Route>
              </Routes>
            </Router>
        </div>
      )}
    </div>
  );
}

export default App;
