import React, { useEffect, useState} from 'react';
import { useStateValue } from "./StateProvider";
import './Sidebar.css';
import SidebarChat from './SidebarChat';
import { Avatar, IconButton } from '@material-ui/core';
import DonutLargeIcon from '@material-ui/icons/DonutLarge'
import ChatIcon from '@material-ui/icons/Chat'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import { SearchOutlined } from '@material-ui/icons'
import { collection, onSnapshot,getDocs, where, query,doc, updateDoc } from 'firebase/firestore';
import db from "./firebase";

function Sidebar() {
    const [rooms, setRooms] = useState([]);
    const [activeUsers,setActiveUsers] = useState([]);
    const [{user}, dispatch] = useStateValue();
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'users', user.userId, 'rooms'), (snapshot) => {
            setRooms(
              snapshot.docs.map((doc) => ({
                id: doc.id,
                data: doc.data(),
              }))
            );
            snapshot.docs.forEach((room)=>{
                const messagesRef = collection(db, 'users', user.userId,'rooms', room.id, 'messages');

                onSnapshot(messagesRef, (querySnapshot) => {
                    const msgs = querySnapshot.docs.map(doc => doc.data());
                    markAsDelivered(msgs)
                    console.log(msgs);
                })
              })
          });
          return () => unsubscribe();
      }, []);

      useEffect(() => {
        const activeUsersRef = collection(db, 'activeUsers');
        onSnapshot(activeUsersRef, (snapshot) => {
          const onlineUsers = snapshot.docs.map((doc) => doc.data().username);
          setActiveUsers(onlineUsers);
        });
      }, []);
    
      const markAsDelivered = async (msgs) => {
        for (const msg of msgs) {
            console.log(msg,user)
            if (!msg.delivered) { // Check if the message is sent to the current user and is not read
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
                                if(k.data().name === msg.name && k.data().delivered === false) {
                                    const messageRef = doc(collection(db, 'users', senderUserId, 'rooms', receiverRoomId, 'messages'), k.id);
                                    console.log(messageRef)
                                    updateDoc(messageRef,{ delivered: true}).then(()=>{
                                        console.log("done")
                                    })
                                }
                            })
                        })
                        
                    }
                }
            }
        }
    };

    const findUserIdByUsername = async (name) => {
        if (!name) {
            return null;
        }
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('name', '==', name));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].id; // Assuming usernames are unique, return the first match
        }
        return null;
    };

    const findRoomIdByUserIds = async (userId1, userName2) => {
        if (!userName2) {
            return null;
        }
        const roomsRef = collection(db, 'users', userId1, 'rooms');
        const q = query(roomsRef, where('name', '==', userName2));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].id; // Assuming there is a unique room for the user pair, return the first match
        }
        return null;
    };

  return (
    <div className='sidebar'>
        <div className='sidebar_header'>
            <Avatar src={user?.photoURL}/>
            <div className='sidebar_headerRight'>
                <IconButton>
                    <DonutLargeIcon/>
                </IconButton>
                <IconButton>
                    <ChatIcon/>
                </IconButton>
                <IconButton>
                    <MoreVertIcon/>
                </IconButton>
            </div>
        </div>
        <div className='sidebar_search'>
            <div className='sidebar_searchContainer'>
                <SearchOutlined/>
                <input placeholder='Search or start new chat' type='text'/>
            </div>
        </div>
        <div className='sidebar_chats'>
           {rooms.map((room) => {
                // let online=false
                // getDocs(collection(db,'activeUsers')).then((docs)=> {
                //     docs.forEach((doc)=> {
                //         if(doc.data().username === room.data.name){
                //             online = true
                //         }
                //     })
                // })
                return <SidebarChat key={room.id} id={room.id} name={room.data.name} online={activeUsers.includes(room.data.name)}/>
            })}
        </div>
    </div>
  )
}

export default Sidebar