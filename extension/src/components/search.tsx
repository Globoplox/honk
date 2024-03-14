import Api from '../api'
import './search.scss'
import Form from 'react-bootstrap/Form'
import Accordion from 'react-bootstrap/Accordion'
import { ChangeEvent, KeyboardEvent, useState } from "react";
import SearchResultItem from './search_result_item';

export default function Search({api} : {api: Api}) {
    const [enabled, setEnabled] = useState(api.isReady)
    const [query, setQuery] = useState("")
    const [entries, setEntries] = useState([])

    api.on('ready', () => setEnabled(true))

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
            <Form.Control
                type="text" 
                value={query} 
                className="form-control"
                placeholder="Search"
                onChange={onChange}
                onKeyDown={onKeydown}
                disabled={!enabled}
            />
            <Accordion>
                {entries.map(entry => <SearchResultItem key={entry.id} entry={entry}/>)}
            </Accordion>
        </>
    );
};
