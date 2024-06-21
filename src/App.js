import React, {useState} from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Sidebar from './Sidebar';
import Chat from './Chat.js';
import Login from './Login.js';
import { useStateValue } from "./StateProvider";
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import db from './firebase';

function App() {
  const [{ user }, dispatch] = useStateValue();
  const user2 = JSON.parse(sessionStorage.getItem('user'))

  console.log("logging out", user,user2)
  if(!user && user2){
    getDocs(collection(db,'activeUsers')).then((docs)=> {
      docs.forEach(active => {
        if(active.data().username === user2.username){
          deleteDoc(doc(db,'activeUsers',active.id)).then(()=> {
            sessionStorage.removeItem('user')
          })
        }
      });
    })
  }
  return (
    <div className="app">
      {!user ? (
        <Login/>
      ) : (
        <div className='app_body'>
            <Sidebar />
              <Routes>
                <Route path="/:userId/rooms/:roomId" element={<Chat/>}>
                </Route>
                <Route path="/:userId" element={<Chat/>}>
                </Route>
                <Route path="/" element={<Chat/>}>
                </Route>
              </Routes>
        </div>
      )}
    </div>
  );
}

export default App;
