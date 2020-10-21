import React, { useEffect } from 'react';
import './App.css';
// Redux
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from './features/userSlice';
import { logIn, logOut } from './features/userSlice'
// Components
import Sidebar from './Components/Sidebar';
import Chat from './Components/Chat';
import Login from './Components/Login';
// firebase
import { auth } from './firebase/firebase';
import db from './firebase/firebase';
// Utility Functions
import { getUserDataFromLS } from './features/utility';

function App() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch()

  useEffect(() => {
    // if (getUserDataFromLS() != null) {
    //   dispatch(logIn((getUserDataFromLS())))
    // } else {
    auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // User is Logged IN
        dispatch(logIn({
          uid: authUser.uid,
          photo: authUser.photoURL,
          email: authUser.email,
          dispalayName: authUser.displayName
        }))
        // Adding user to firestore on successful signin
        db.collection('users').where("uid", '==', authUser.uid).get()
          .then(function (querySnapshot) {
            if (querySnapshot.empty) {
              db.collection('users').doc(authUser.email).set({
                uid: authUser.uid,
                photo: authUser.photoURL,
                email: authUser.email,
                dispalayName: authUser.displayName
              })
            }
          })
          .catch(function (error) {
            dispatch(logOut())
          });

      } else {
        // User Logged Out
        dispatch(logOut())
      }
    })
    // }
  }, [dispatch])

  return (
    <div className="app">
      {user ? (
        <>
          <Sidebar />
          <Chat />
        </>
      ) : (
          <Login />
        )}
    </div>
  );
}

export default App;
