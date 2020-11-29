import { useRef, useState } from 'react';

import './App.css';

import firebase  from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore'

firebase.initializeApp({
    apiKey: "AIzaSyCMKmtCPMDelxBX2yo4cFWtWIlU_egZMcI",
    authDomain: "awsome-chatbase.firebaseapp.com",
    databaseURL: "https://awsome-chatbase.firebaseio.com",
    projectId: "awsome-chatbase",
    storageBucket: "awsome-chatbase.appspot.com",
    messagingSenderId: "424751183448",
    appId: "1:424751183448:web:de36d26e56d6ec0815fc2d",
    measurementId: "G-4GYYPYPN5Y"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header"> 
        <h1>⚛️</h1>
        <SignOut />
      </header>
      <section>
          { user ? <ChatRoom /> : <SignIn /> }
        </section>
    </div>
  );
}


const SignIn = () => {

  const signInWithGoogle = () => {
    //for popup window login
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
  }

  return (
      <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

const SignOut = () => {
  return auth.currentUser && (
    <button onClick={ () => auth.signOut() }>Sign Out</button>
  )
}

const ChatRoom = () => {

  const dummyScroll = useRef();

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt');

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();


    const  { uid, photoURL } = auth.currentUser;

    // create new document in firestore

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');

    dummyScroll.current.scrollIntoView({ behavior: 'smooth' });

    console.log(dummyScroll)

  }

  return (
    <>
      <main>
        { messages && messages.map(message => <ChatMessage key={message.id} message={message} />)}

        <div ref={dummyScroll}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
        <button type="submit">Submit</button>
      </form>
    </>
  )
}


const ChatMessage = (props) => {

  const { text, uid, photoURL} = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  )
}


export default App;
