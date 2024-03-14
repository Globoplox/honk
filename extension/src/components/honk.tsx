import Api from '../api'
import './honk.scss'
import Accordion from 'react-bootstrap/Accordion'
import Search from './search'
import Configuration from './configuration'
import { useRef } from 'react'
import { Nav, Navbar, Row, Tab, Tabs } from 'react-bootstrap'

export default function Honk() {
    const api = useRef(new Api())

    // Get the defaults settings here (as api parameters)
    // If all params are found in local storage
    /// Start a self test (only the first render !)
    //// If it fail, focus the config window.
    // If not all params are found
    /// Focus config window.

    return (
        <Tabs variant='underline' justify defaultActiveKey="configuration">
            <Tab eventKey="search" title={<h2><i className='bi bi-search'/></h2>}>
                <Search api={api.current} />
            </Tab>
            <Tab eventKey="configuration" title={<h2><i className='bi bi-gear'/></h2>}>
                <Configuration api={api.current} />
            </Tab>
        </Tabs>
    );
}