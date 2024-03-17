import Api from '../api'
import './search.scss'
import Form from 'react-bootstrap/Form'
import Accordion from 'react-bootstrap/Accordion'
import { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import SearchResultItem from './search_result_item';
import { Container } from 'react-bootstrap';

// TODO: animate the deletion ?
export default function Search({api} : {api: Api}) {
    const [enabled, setEnabled] = useState(api.isReady)
    const [query, setQuery] = useState("")
    const [entries, setEntries] = useState([])

    useEffect(
        () => { api.on('ready', () => setEnabled(true)) },
        []
    )

    function onPasswordDeleted(id: string) {
        setEntries(entries.filter(password => password.id !== id))
    }
    
    function search(query: string) {
        api.search(query).then(setEntries)
    }

    function onChange(e: ChangeEvent<HTMLInputElement>) {
        setQuery(e.target.value);
        search(e.target.value);
    };

    // This is skipped by events emitter
    // but we want it to trigger no query search (returning all results)
    function onKeydown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.code === 'Enter' && e.currentTarget.value === '')
            search('')
    }

    return (
        <>
        <Container className='pt-2 mb-2'>
            <Form.Control
                type="text" 
                value={query} 
                placeholder="Search"
                onChange={onChange}
                onKeyDown={onKeydown}
                disabled={!enabled}
            />
        </Container>
        <Accordion flush>
            {entries.map(password => 
                <SearchResultItem api={api} key={password.id} password={password} onDelete={() => onPasswordDeleted(password.id)}/>
            )}
        </Accordion>
        </>
    );
};
