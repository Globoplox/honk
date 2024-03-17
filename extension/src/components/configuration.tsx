import Api from '../api'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import { ChangeEvent, MutableRefObject, useEffect, useRef, useState } from 'react'
import { Container } from 'react-bootstrap'

/**
 * TODO:
 * - Add option to disable saving password in local storage
 * - Automatically open settings in case of bad/empty settings
 */
export default function Configuration({api, onInvalidConfiguration} : {api: Api, onInvalidConfiguration: () => void}) {
    const [username, setUsername] = useState(localStorage.getItem("username") || "");
    const [password, setPassword] = useState(localStorage.getItem("password") || "");
    const [authError, setAuthError] = useState(null);
    const [authStatus, setAuthStatus] = useState(false);
    const [hostname, setHostname] = useState(localStorage.getItem("hostname") || "");
    const [hostnameError, setHostnameError] = useState(null);
    const [serverStatus, setServerStatus] = useState(null);
    const inputDelay : MutableRefObject<ReturnType<typeof setTimeout>> = useRef(null)
    const isFirstCheck = useRef(true)

    useEffect(() => {
        let delay = 350;
        if (isFirstCheck) {
            delay = 0;
            isFirstCheck.current = false;
        }
        scheduleAuthChange(username, password, hostname, delay)
    }, [username, password, hostname])

    // Handle the common input delay
    function scheduleAuthChange(username: string, password: string, hostname: string, delay: number = 350) {
        if (inputDelay.current !== null)
            clearTimeout(inputDelay.current)
        inputDelay.current = setTimeout(
            () => { onAuthChange(username, password, hostname) }, 
            delay
        )
    }

    // Test the connecton and set state accordingly to results
    function onAuthChange(username: string, password: string, hostname: string) {
        if (hostname === '') {
            setHostnameError(null)
            setServerStatus(null)
            onInvalidConfiguration()
            return
        }

        api.selfTest(hostname, username, password).then(({status, user}) => {
            if (typeof status === "string") {
                setServerStatus(status)
                setHostnameError(null)    
            } else {
                console.log(status)
                setServerStatus(null)
                setHostnameError(status.details)
                onInvalidConfiguration()
            }
            
            if (username === '' || password === '' || user === null) {
                setAuthError(null)
                setAuthStatus(false)
                onInvalidConfiguration()
            } else if ("error" in user) {
                setAuthError(user.details || "Authentication failed")
                setAuthStatus(false)
                onInvalidConfiguration()
            } else {
                setAuthError(null)
                setAuthStatus(true)  
            }
        })
    };

    function onUsernameChange(e: ChangeEvent<HTMLInputElement>) {
        setUsername(e.target.value)
        localStorage.setItem("username", e.target.value)
    }
    
    function onPasswordChange(e: ChangeEvent<HTMLInputElement>) {
        setPassword(e.target.value)
        localStorage.setItem("password", e.target.value)
    }
   
    function onHostnameChange(e: ChangeEvent<HTMLInputElement>) {
        setHostname(e.target.value)
        localStorage.setItem("hostname", e.target.value)
    }

    return (
        <Container>
            <h2>Configuration</h2>
            <Form.Group>
                <Form.Label>Host</Form.Label>
                <InputGroup hasValidation>
                    <InputGroup.Text>https://</InputGroup.Text>
                    <Form.Control 
                        type="text" 
                        value={hostname} 
                        placeholder="honk.lan"
                        onChange={onHostnameChange}
                        isInvalid={hostnameError !== null}
                        isValid={serverStatus !== null}
                    />

                    <Form.Control.Feedback type="valid">
                        Successfully connected. Version: {serverStatus}
                    </Form.Control.Feedback>

                    <Form.Control.Feedback type="invalid">
                        {hostnameError}
                    </Form.Control.Feedback>

                </InputGroup>
                <Form.Text>
                    The host name of the server to use.
                </Form.Text>
            </Form.Group>

            <Form.Group>
                <Form.Label>Username</Form.Label>
                <Form.Control 
                    type="text" 
                    value={username}
                    onChange={onUsernameChange}
                />
                <Form.Control.Feedback></Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
                <Form.Label>Password</Form.Label>
                <Form.Control 
                    type="password" 
                    value={password}
                    onChange={onPasswordChange}
                    isInvalid={authError !== null}
                    isValid={authStatus}
                />
                <Form.Control.Feedback></Form.Control.Feedback>
                <Form.Text>
                    The password to access your account and cipher your data. It is never shared with the server.  
                </Form.Text>
            
                <Form.Control.Feedback type="valid">
                    Successfully logged in.
                </Form.Control.Feedback>

                <Form.Control.Feedback type="invalid">
                    {authError}
                </Form.Control.Feedback>

            </Form.Group>        
        </Container>
    );
};
