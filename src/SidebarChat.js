import React, { useEffect, useState } from 'react'
import './SidebarChat.css'
import {Link} from 'react-router-dom'
import { Avatar } from '@material-ui/core'
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import db from "./firebase";

function SidebarChat({addNewChat, name, id}) {

    const [seed, setSeed] = useState('');
    const [messages, setMessages] = useState('');

    useEffect(() => {
        if(id) {
            const messagesRef = collection(db, 'rooms', id, 'messages');
            const q = query(messagesRef ,orderBy('timestamp','desc'));
            onSnapshot(q, (querySnapshot) => {
                const messages = querySnapshot.docs.map(doc => doc.data());
                setMessages(messages);
            })
        }
    },[id])

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
                <p>{messages[0]?.message}</p>
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