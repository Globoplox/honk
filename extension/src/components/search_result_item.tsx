import Api, {Password} from '../api'
import { encrypt, decrypt } from '../utils/crypto'
import Form from 'react-bootstrap/Form'
import Accordion from 'react-bootstrap/Accordion'
import { ChangeEvent, KeyboardEvent, useState } from "react";

export default function SearchResultItem({entry}: {entry: Password}) {    
    const [data, setData] = useState("Deciphering...")
    entry.deciphered.then(setData)
    
    return (
        <Accordion.Item eventKey={entry.id}>
            <Accordion.Header>
                {entry.name}
                {entry.tags.join(' ')}
            </Accordion.Header>
            <Accordion.Body>

            <Form.Control
                type="text" 
                value={entry.name} 
                className="form-control"
            />

            <Form.Control
                type="text" 
                value={entry.tags} 
                className="form-control"
            />

            <Form.Control 
                type="text" 
                value={data} 
                className="form-control"
                placeholder="Search"
            />
            </Accordion.Body>
        </Accordion.Item>
    );
};