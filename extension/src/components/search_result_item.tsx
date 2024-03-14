import {Password} from '../api'
import './search_result_item.scss'
import Form from 'react-bootstrap/Form'
import Accordion from 'react-bootstrap/Accordion'
import { ChangeEvent, KeyboardEvent, useState } from "react";

export default function SearchResultItem({entry}: {entry: Password}) {    
    const [name, setName] = useState(entry.name)
    const [tags, setTags] = useState(entry.tags.join(' '))
    const [data, setData] = useState(null)

    if (data === null)
        entry.deciphered.then(setData)
    
    function onNameChange() {}
    function onTagsChange() {}
    function onDataChange() {}

    return (
        <Accordion.Item eventKey={entry.id}>
            <Accordion.Header>
                {name}
                {tags}
            </Accordion.Header>
            <Accordion.Body>

            <Form.Control
                type="text" 
                value={name} 
                onChange={onNameChange}
                className="form-control"
            />

            <Form.Control
                type="text" 
                value={tags} 
                onChange={onTagsChange}
                className="form-control"
            />

            <Form.Control 
                type="text" 
                value={data || "Deciphering..."} 
                onChange={onDataChange}
                className="form-control"
                placeholder="Search"
            />
            </Accordion.Body>
        </Accordion.Item>
    );
};