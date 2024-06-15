import React, { useEffect, useState } from 'react'
import './SidebarChat.css'
import {Link} from 'react-router-dom'
import { Avatar } from '@material-ui/core'
import { collection, addDoc } from 'firebase/firestore';
import db from "./firebase";

function SidebarChat({addNewChat, name, id}) {

    const [seed, setSeed] = useState('');
    useEffect(() => {
        setSeed(Math.floor(Math.random()*5000));
    }, [])
    
    const createChat = () => {
        const roomName = prompt("Please enter name for chat");
        if (roomName) {
            addDoc(collection(db,'rooms'),{
                name: roomName,
            });
        }
    }

  return !addNewChat ? (
    <Link to={`/rooms/${id}`}>
        <div className='sidebarChat'>
            <Avatar src={`https://api.multiavatar.com/${seed}.png`}/>
            <div className='sidebarChat_info'>
                <h2>{name}</h2>
                <p>last</p>
            </div>
        </div>
    </Link>
  ) : (
    <div onClick={createChat} className='sidebarChat'>
        <h2> Add new Chat</h2>
    </div>
  )
}

export default SidebarChat