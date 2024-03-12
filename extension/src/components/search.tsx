import Accordion from 'react-bootstrap/Accordion'
import { ChangeEvent, KeyboardEvent, useState } from "react";

export default function Search() {
    const [query, setQuery] = useState("");

    function search() {}

    function onInput(e: ChangeEvent<HTMLInputElement>) {
        setQuery(e.target.value);
        search();
    };

    // Sometimes browsers dont emit input events when 
    // pressing enter in an empty field. We want to 
    // trigger a search even on empty query.
    function onKeydown(e: KeyboardEvent<HTMLInputElement>) {
        if (query === "" && e.code === "Enter") {
            setQuery("");
            search();
        }
    };
    
    return (
        <Accordion.Item eventKey='search'>
            <Accordion.Header>
                <input 
                    type="text" 
                    value={query} 
                    className="form-control"
                    placeholder="Search"
                    onChange={onInput}
                    onKeyDown={onKeydown} 
                />
            </Accordion.Header>
            <Accordion.Body>

            </Accordion.Body>
        </Accordion.Item>
    );
};
