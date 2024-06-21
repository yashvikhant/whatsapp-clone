import React, { useEffect, useState } from 'react'
import { useStateValue } from "./StateProvider";
import './SidebarChat.css'
import {Link} from 'react-router-dom'
import { Avatar } from '@material-ui/core'
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import db from "./firebase";

function SidebarChat({addNewChat, name, id, online}) {

    const [seed, setSeed] = useState('');
    const [messages, setMessages] = useState('');
    const [{user}, dispatch] = useStateValue();
    const user2 = JSON.parse(sessionStorage.getItem('user'))
    
    useEffect(() => {
        if(id) {
            const messagesRef = collection(db, 'users',user.userId, 'rooms', id, 'messages');
            const q = query(messagesRef ,orderBy('timestamp','desc'));
            onSnapshot(q, (querySnapshot) => {
                const messages = querySnapshot.docs.map(doc => doc.data());
                setMessages(messages);
            })
        }
    },[])

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
    console.log(online)

  return (
    <Link to={`${user.userId}/rooms/${id}`}>
        <div className='sidebarChat'>
            <Avatar src={`https://api.multiavatar.com/${seed}.png`}/>
            <div className='sidebarChat_info'>
                <h2>{name}</h2>
                <p>{messages[0]?.message}</p>
            </div>
            {online?<span style={{ display: 'flex-end', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'green',marginRight: '5px'}}/>:null}
        </div>
    </Link>
  )
}

export default SidebarChat