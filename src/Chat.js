import React, {useEffect, useState} from 'react'
import './Chat.css';
import {useParams} from 'react-router-dom'
import { collection, onSnapshot, doc, orderBy, getDocs, query, addDoc, updateDoc, where, getDoc } from 'firebase/firestore';
import db from "./firebase";
import {Avatar, IconButton} from '@material-ui/core'
import {SearchOutlined, AttachFile, MoreVert, InsertEmoticon, Mic, Done, DoneAll, AvTimer} from '@material-ui/icons'
import userEvent from '@testing-library/user-event';
import { serverTimestamp } from 'firebase/firestore';
import { useStateValue } from './StateProvider';

function Chat() {
    const [input, setInput] = useState("");
    const [seed, setSeed] = useState("");
    const { userId, roomId } = useParams();
    const [roomName, setRoomName] = useState("");
    const [messages, setMessages] = useState([]);
    const [{user}, dispatch] = useStateValue();

    useEffect(() => {
        if(roomId) {
            onSnapshot(doc(db,'users',userId, 'rooms', roomId), (snapshot)=> {
                setRoomName(snapshot.data().name);
            })
            const messagesRef = collection(db, 'users', userId,'rooms', roomId, 'messages');
            const q = query(messagesRef, orderBy('timestamp'));

            onSnapshot(q, (querySnapshot) => {
                const msgs = querySnapshot.docs.map(doc => doc.data());
                setMessages(msgs);
                markAsRead(msgs)
                console.log(msgs);
            })
        }
    }, [roomId])

    const markAsRead = async (msgs) => {
        for (const msg of msgs) {
            console.log(msg,user)
            if (msg.name !== user.username && !msg.read) { // Check if the message is sent to the current user and is not read
                const senderUserId = await findUserIdByUsername(msg.name); // Function to find sender's user ID by username
                console.log(msg, senderUserId)
                if (senderUserId) {
                    const receiverRoomId = await findRoomIdByUserIds(senderUserId, user.username); // Function to find the room ID in the sender's data
                    console.log(receiverRoomId)
                    if (receiverRoomId) {
                        const senderMessagesRef = collection(db, 'users', senderUserId, 'rooms', receiverRoomId, 'messages');
                        console.log(senderMessagesRef)
                        getDocs(senderMessagesRef).then((docs)=>{
                            console.log(docs)
                            docs.forEach((k)=>{
                                console.log(k)
                                if(k.data().name === msg.name && k.data().read === false) {
                                    const messageRef = doc(collection(db, 'users', senderUserId, 'rooms', receiverRoomId, 'messages'), k.id);
                                    console.log(messageRef)
                                    updateDoc(messageRef,{ read: true}).then(()=>{
                                        console.log("done")
                                    })
                                }
                            })
                        })
                        // const q = query(senderMessagesRef, where('name', '==', msg.name), where('read', '==', false));
                        // console.log(q)
                        // await getDocs(q).then(async (docs)=> {
                        //     console.log(docs)
                        //     for (const messageDoc of docs) {
                        //         const messageRef = doc(db, 'users', senderUserId, 'rooms', receiverRoomId, 'messages', messageDoc.id);
                        //         console.log(messageRef);
                        //         try {
                        //             await updateDoc(messageRef, { read: true });
                        //         } catch (error) {
                        //             console.error("Error updating document: ", messageDoc.id, error);
                        //         }
                        //     }
                        // });
                        // Update all messages to mark them as read
                        
                    }
                }
            }
        }
    };

    const findUserIdByUsername = async (name) => {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('name', '==', name));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].id; // Assuming usernames are unique, return the first match
        }
        return null;
    };

    const findRoomIdByUserIds = async (userId1, userName2) => {
        const roomsRef = collection(db, 'users', userId1, 'rooms');
        const q = query(roomsRef, where('name', '==', userName2));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].id; // Assuming there is a unique room for the user pair, return the first match
        }
        return null;
    };

    useEffect(() => {
        setSeed(Math.floor(Math.random() * 5000));
      }, [roomId]);
    
    const markAsDelivered = (messageId) => {
        const message = doc(collection(db,'users', user.userId, 'rooms', roomId, 'messages'),messageId)
        console.log(message)
        updateDoc(message, {
            name: user.username,
            message: input,
            sent: true,
            delivered: true,
            read: false,
            timestamp: serverTimestamp()
        })
    };
    
    const deliverMessage = (messageId) => {
        getDocs(collection(db, 'users')).then((docs)=> {
            docs.forEach((doc)=> {
                if(doc.data().name === roomName) {
                    getDocs(collection(db,'users',doc.id,'rooms')).then((rooms)=> {
                        rooms.forEach((room)=> {
                            if(room.data().name === user.username){
                                const messagesRef = collection(db,'users', doc.id, 'rooms', room.id, 'messages')
                                addDoc(messagesRef, {
                                    name: user.username,
                                    message: input,
                                    sent: true,
                                    delivered: true,
                                    read: false,
                                    timestamp: serverTimestamp()
                                }).then(()=> {
                                    markAsDelivered(messageId, user.userId)
                                    console.log("Message delivered")
                                })
                            }
                        })
                    })
                    
                }
            })
        })
    }

    const sendMessage = (e) => {
        e.preventDefault();
        const messagesRef = collection(db,'users', userId, 'rooms', roomId, 'messages')
        addDoc(messagesRef, {
            name: user.username,
            message: input,
            sent: true,
            delivered: false,
            read: false,
            timestamp: serverTimestamp()
        }).then((result) => {
            setInput("");
            deliverMessage(result.id);
        })
    };
    const renderTicks = (message) => {
        if(message.sent && message.delivered && message.read) {
            console.log("read message")
            return(
                <DoneAll fontSize='small' style={{ color: '#00a5ff'}}/>
            );
        } else if(message.sent && message.delivered) {
            console.log("del message", message)
            return(
                <DoneAll fontSize='small'/>
            );
        } else if(message.sent){
            console.log("sent message")
            return(
                <Done fontSize='small'/>
            );
        } else {
            return(
                <AvTimer/>
            );
        }
    }

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
                <p className={`chat__message ${message.name === user.username && "chat__receiver"
                }`}>
                    {message.message}
                    <span className="chat__timestamp">
                    {new Date(message.timestamp?.toDate()).toUTCString()}
                    {message.name === user.username && renderTicks(message)}
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