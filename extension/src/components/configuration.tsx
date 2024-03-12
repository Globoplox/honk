import Api from '../api'
import Accordion from 'react-bootstrap/Accordion'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import { ChangeEvent, useEffect, useState } from 'react'


/**
 * An `Accordion.Item` wrapped form that allows to set and update the 
 *   api connection settings.
 * TODO:
 * - Add option to disable saving password in local storage
 * - Automatically open settings in case of bad/empty settings
 * - Consider using onInput on fields
 */
export default function Configuration({api} : {api: Api}) {
    const [username, setUsername] = useState(localStorage.getItem("username") || "");
    const [password, setPassword] = useState(localStorage.getItem("password") || "");
    const [authError, setAuthError] = useState(null);
    const [authStatus, setAuthStatus] = useState(false);
    const [hostname, setHostname] = useState(localStorage.getItem("hostname") || "");
    const [hostnameError, setHostnameError]  = useState(null);
    const [serverStatus, setServerStatus]  = useState(null);

    // Initial attempt in case we read settings from local storage.
    // Must be done only once at first render, hende the userEffect(.., [])
    if (hostname !== null && username !== null && password !== null)
        useEffect(() => onAuthChange(username, password, hostname), [])    
    
    function onAuthChange(username: string, password: string, hostname: string) {
        if (hostname === '') {
            setHostnameError(null)
            setServerStatus(null)
            return
        }

        api.selfTest(hostname, username, password).then(results => {
            if (typeof results.status === "string") {
                setServerStatus(results.status)
                setHostnameError(null)    
            } else {
                setServerStatus(null)
                setHostnameError(results.status.details)
            }
            
            if (username === '' || password === '' || results.user === null) {
                setAuthError(null)
                setAuthStatus(false)
            } else if ("error" in results.user) {
                setAuthError(results.user.details || "Authentication failed")
                setAuthStatus(false)
            } else {
                setAuthError(null)
                setAuthStatus(true)  
            }
        })
    };

    function onUsernameChange(e: ChangeEvent<HTMLInputElement>) {
        setUsername(e.target.value)
        onAuthChange(e.target.value, password, hostname)
        localStorage.setItem("username", e.target.value)
    }
    
    function onPasswordChange(e: ChangeEvent<HTMLInputElement>) {
        setPassword(e.target.value)
        onAuthChange(username, e.target.value, hostname)
        localStorage.setItem("password", e.target.value)
    }
   
    function onHostnameChange(e: ChangeEvent<HTMLInputElement>) {
        setHostname(e.target.value)
        onAuthChange(username, password, e.target.value)
        localStorage.setItem("hostname", e.target.value)
    }

    return (
        <Accordion.Item eventKey='configuration'>
            <Accordion.Header>
                Configuration
            </Accordion.Header>
            <Accordion.Body>

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

            </Accordion.Body>
        </Accordion.Item>
    );
};
