import React from 'react';
import './Login.css';
// Mui
import { Button } from '@material-ui/core';
// firebase
import { auth, provider } from '../firebase/firebase';

function Login() {
    const signIn = () => {
        // Do google Login powered by firebase
        auth.signInWithPopup(provider)
            .catch((error) => alert(error.message))
    }
    return (
        <div className="login">
            <div className="login__logo">
                <img src="https://www.logo.wine/a/logo/Discord_(software)/Discord_(software)-Logo.wine.svg" alt="" />
            </div>
            <Button onClick={signIn}>Sign In</Button>
        </div>
    )
}

export default Login
