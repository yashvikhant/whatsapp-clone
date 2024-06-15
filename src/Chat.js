import React, {useEffect, useState} from 'react'
import './Chat.css';
import {useParams} from 'react-router-dom'
import { collection, onSnapshot, doc, orderBy } from 'firebase/firestore';
import db from "./firebase";
import {Avatar, IconButton} from '@material-ui/core'
import {SearchOutlined, AttachFile, MoreVert, InsertEmoticon, Mic} from '@material-ui/icons'

function Chat() {
    const [input, setInput] = useState("");
    const [seed, setSeed] = useState("");
    const { roomId } = useParams();
    const [roomName, setRoomName] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if(roomId) {
            onSnapshot(doc(db, 'rooms', roomId), (snapshot)=> {
                setRoomName(snapshot.data().name);
            })

            const roomRef = doc(db, 'rooms', roomId);
            console.log(roomRef)
            const messagesRef = collection(roomRef, 'messages');
            console.log(messagesRef)

            // Query messages collection ordered by timestamp in ascending order
            const query = orderBy(messagesRef, 'timestamp', 'asc');
            console.log(query)
            // Subscribe to real-time updates on the query
            query && onSnapshot(query, (snapshot) => {
                // Extract and set messages data from snapshot
                setMessages(snapshot.docs.map((doc) => doc.data()));
            });

            // onSnapshot(orderBy(collection(doc(db,'rooms',roomId), 'messages'),'timestamp','asc'),(snapshot) => {
            //     setMessages(snapshot.docs.map(doc=> doc.data()));
            // })
        }
    }, [roomId])

    useEffect(() => {
        setSeed(Math.floor(Math.random() * 5000));
      }, [roomId]);
    const sendMessage = (e) => {
        setInput("");
    };

  return (
    <div className='chat'>
        <div className='chat__header'>
            <Avatar src={`https://api.multiavatar.com/${seed}.png`}/>
            <div className='chat__headerInfo'>
                <h3>{roomName}</h3>
                <p> Last seen at ...</p>
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
                <p className={`chat__message ${true && "chat__receiver"
                }`}>
                    {message.message}
                    <span className="chat__timestamp">
                        {new Date(messages[messages.length - 1]?.timestamp?.toDate()).toUTCString()}
                    </span>
                </p>
            ))}
        </div>
        <div className='chat__footer'>
            <InsertEmoticon />
            <form>
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message"
                type="text"
            />
            <button onClick={sendMessage} type="submit">
                Send a message
            </button>
            </form>
            <Mic />
        </div>
    </div>
  )
}

export default Chat