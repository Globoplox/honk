import Api, {Password} from '../api'
import './search_result_item.scss'
import Accordion from 'react-bootstrap/Accordion'
import { useState } from "react";
import { Stack } from 'react-bootstrap';
import PasswordForm from './password_form';

export default function SearchResultItem(
    {api, password, onDelete}: 
    {api: Api, password: Password, onDelete: () => void}
) {    
    const [name, setName] = useState(password.name)
    const [tags, setTags] = useState(password.tags.join(' '))
    
    return (
        <Accordion.Item eventKey={password.id}>
            <Accordion.Header className='no-focus-border'>
                <Stack>
                    <h4>{name}</h4>
                    <span className='text-secondary'>{tags}</span>
                </Stack>
            </Accordion.Header>
            <Accordion.Body>
                <PasswordForm api={api} password={password} onDelete={onDelete} onNameUpdate={setName} onTagsUpdate={setTags}/>
            </Accordion.Body>
        </Accordion.Item>
    );
};