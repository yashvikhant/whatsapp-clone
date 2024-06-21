import React, {useState} from 'react'
import './Login.css'
import { Button, Input, TextField, Typography } from "@material-ui/core";
import { auth, provider } from "./firebase";
import {signInWithPopup} from 'firebase/auth';
import { useStateValue } from "./StateProvider";
import { actionTypes } from "./reducer";
import db from './firebase';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function Login() {
    const [{}, dispatch] = useStateValue();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const signIn = () => {
        getDocs(collection(db,'users')).then((docs)=>{
            docs.forEach((doc)=> {
                if(doc.data().username === username && doc.data().password === password) {
                    sessionStorage.setItem('user', JSON.stringify({
                        userId: doc.id,
                        username: doc.data().name,
                    }))
                    console.log(JSON.parse(sessionStorage.getItem('user')).username)
                    dispatch({
                        type: actionTypes.SET_USER,
                        user: JSON.parse(sessionStorage.getItem('user'))
                    })
                }
            })
        })
        const activeUsersRef = collection(db,'activeUsers')
        addDoc(activeUsersRef,{
            username: username
        })
        // signInWithPopup(auth,provider).then((result) => {
        //     dispatch({
        //         type: actionTypes.SET_USER,
        //         user: result.user,
        //     })
        // }).catch((err) => alert(err.message));
    }

  return (
    <div className='login'>
        <div className='login__container'>
            <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt=""
            />
            <div className="login__text">
                <h1>Sign in to WhatsApp</h1>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                <div style={{ padding: '5px', marginTop: '10px'}}>
                    <TextField
                        label="Username"
                        variant="outlined"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div style={{ padding: '5px'}}>
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
            </div>
            <Link to={"/"}>
                <Button type="submit" onClick={signIn}>
                    Sign in
                </Button>
            </Link>
        </div>
    </div>
  )
}

export default Login