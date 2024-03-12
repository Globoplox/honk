import Api from '../api'
import Accordion from 'react-bootstrap/Accordion'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import { ChangeEvent, KeyboardEvent, useState } from 'react'

/**
 * TODO:
 * - Define a repository
 * - Find a way to provide the repository to parent/sibling
 */
export default function Configuration() {
    const api = new Api();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [authError, setAuthError] = useState(null);
    const [authStatus, setAuthStatus] = useState(false);
    const [hostname, setHostname] = useState("");
    const [hostnameError, setHostnameError]  = useState(null);
    const [serverStatus, setServerStatus]  = useState(null);

    function onAuthChange(username: string, password: string, serverStatus: String) {
        if (hostname === '') {
            setHostnameError(null)
            setServerStatus(null)
            return
        }

        if (username === '' || password === '') {
            setAuthError(null)
            setAuthStatus(false)
            return
        }

        api.selfTest(hostname, username, password).then(status => {
            setServerStatus(status)
            setHostnameError(null)
            setAuthError(null)
            setAuthStatus(true)
        }).catch(error => {
            switch (error.kind) {
                case Api.ErrorCategory.Network:
                    setServerStatus(null)
                    setHostnameError(error.details)
                    setAuthError(null)
                    setAuthStatus(false)
                    break;
                case Api.ErrorCategory.Authentication:
                    setAuthError(error.details)
                    setAuthStatus(false)
            }
        })


    };

    function onUsernameChange(e: ChangeEvent<HTMLInputElement>) {
        setUsername(e.target.value)
        onAuthChange(e.target.value, password, serverStatus)
    }
    
    function onPasswordChange(e: ChangeEvent<HTMLInputElement>) {
        setPassword(e.target.value)
        onAuthChange(username, e.target.value, serverStatus)
    }
   
    function onHostnameChange(e: ChangeEvent<HTMLInputElement>) {
        setHostname(e.target.value)
        onAuthChange(username, password, e.target.value)
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
