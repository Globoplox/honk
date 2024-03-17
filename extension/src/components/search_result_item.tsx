import Api, {Password} from '../api'
import './search_result_item.scss'
import Accordion from 'react-bootstrap/Accordion'
import { useState, useRef } from "react";
import { Stack } from 'react-bootstrap';
import PasswordForm from './password_form';
import { CSSTransition } from 'react-transition-group';

export default function SearchResultItem(
    {api, password, onDelete}: 
    {api: Api, password: Password, onDelete: () => void}
) {    
    const [name, setName] = useState(password.name)
    const [tags, setTags] = useState(password.tags.join(' '))
    const [isIn, setIsIn] = useState(true)
    const animationRef = useRef(null)

    function onDeleteProxy() {
        setIsIn(false)
    }

    function onDeletedDone() {
        onDelete()
    }

    return (
        <CSSTransition 
            nodeRef={animationRef} 
            in={isIn} 
            timeout={200}
            onExited={onDeletedDone}
            classNames='search-result-item-transition'
        >
            <Accordion.Item eventKey={password.id} ref={animationRef}>
                <Accordion.Header className='no-focus-border'>
                    <Stack>
                        <h4>{name}</h4>
                        <span className='text-secondary'>{tags}</span>
                    </Stack>
                </Accordion.Header>
                <Accordion.Body>
                    <PasswordForm api={api} password={password} onDelete={onDeleteProxy} onNameUpdate={setName} onTagsUpdate={setTags}/>
                </Accordion.Body>
            </Accordion.Item>
        </CSSTransition>
    );
};