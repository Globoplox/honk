import Api from '../api'
import './honk.scss'
import Search from './search'
import Configuration from './configuration'
import CreateItem from './create_item'
import { useRef, useState } from 'react'
import { Nav, Navbar, Row, Tab, Tabs } from 'react-bootstrap'

export default function Honk() {
    const api = useRef(new Api())
    const [activeTab, setActiveTab] = useState("search")

    return (
        <Tabs variant='underline' activeKey={activeTab} onSelect={tab => setActiveTab(tab)}>
            <Tab eventKey="search" title={<h2><i className='bi bi-search'/></h2>}>
                <Search api={api.current} />
            </Tab>
            <Tab eventKey="configuration" title={<h2><i className='bi bi-gear'/></h2>}>
                <Configuration api={api.current} onInvalidConfiguration={() => setActiveTab("configuration")} />
            </Tab>
            <Tab eventKey="create" title={<h2><i className='bi bi-plus'/></h2>}>
                <CreateItem api={api.current} />
            </Tab>
        </Tabs>
    );
}