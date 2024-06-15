import React, {useEffect, useState} from 'react'
import './Chat.css';
import {useParams} from 'react-router-dom'
import { collection, onSnapshot, doc, orderBy, getDocs, query, addDoc } from 'firebase/firestore';
import db from "./firebase";
import {Avatar, IconButton} from '@material-ui/core'
import {SearchOutlined, AttachFile, MoreVert, InsertEmoticon, Mic} from '@material-ui/icons'
import userEvent from '@testing-library/user-event';
import { serverTimestamp } from 'firebase/firestore';
import { useStateValue } from './StateProvider';

function Chat() {
    const [input, setInput] = useState("");
    const [seed, setSeed] = useState("");
    const { roomId } = useParams();
    const [roomName, setRoomName] = useState("");
    const [messages, setMessages] = useState([]);
    const [{user}, dispatch] = useStateValue();

    useEffect(() => {
        if(roomId) {
            onSnapshot(doc(db, 'rooms', roomId), (snapshot)=> {
                setRoomName(snapshot.data().name);
            })
            const messagesRef = collection(db, 'rooms', roomId, 'messages');
            const q = query(messagesRef, orderBy('timestamp'));

            onSnapshot(q, (querySnapshot) => {
                const messages = querySnapshot.docs.map(doc => doc.data());
                setMessages(messages);
            })

            // onSnapshot(orderBy(collection(doc(db,'rooms',roomId), 'messages'),'timestamp','asc'),(snapshot) => {
            //     setMessages(snapshot.docs.map(doc=> doc.data()));
            // })
        }
    }, [roomId])

    useEffect(() => {
        setSeed(Math.floor(Math.random() * 5000));
      }, [roomId]);
    const sendMessage = (e) => {
        e.preventDefault();
        const messagesRef = collection(db,'rooms', roomId, 'messages')
        addDoc(messagesRef, {
            name: user.displayName,
            message: input,
            delivered: false,
            received: false,
            read: false,
            timestamp: serverTimestamp()
        }).then(() => {
            setInput("");
        })

    };

  return (
    <div className='chat'>
        <div className='chat__header'>
            <Avatar src={`https://api.multiavatar.com/${seed}.png`}/>
            <div className='chat__headerInfo'>
                <h3>{roomName}</h3>
                <p> last seen{" "}
                    {new Date(
                    messages[messages.length - 1]?.timestamp?.toDate()
                    ).toUTCString()}
                </p>
            </div>
            <div className='chat__headerRight'>
                <IconButton>
                    <SearchOutlined/>
                </IconButton>
                <IconButton>
                    <AttachFile/>
                </IconButton>
                <IconButton>
                    <MoreVert/>
                </IconButton>
            </div>
        </div>
        <div className='chat__body'>
            {messages.map((message) => (
                <p className={`chat__message ${message.name === user.displayName && "chat__receiver"
                }`}>
                    {message.message}
                    <span className="chat__timestamp">
                    {new Date(message.timestamp?.toDate()).toUTCString()}
                    </span>
                </p>
            ))}
        </div>
        <div className='chat__footer'>
            <InsertEmoticon />
            <form onSubmit={sendMessage}>
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message"
                type="text"
            />
            {/* <button type="submit">
                Send a message
            </button> */}
            </form>
            <Mic />
        </div>
    </div>
  )
}

export default Chat