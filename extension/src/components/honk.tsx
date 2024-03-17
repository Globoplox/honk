import Api from '../api'
import Search from './search'
import Configuration from './configuration'
import { useRef, useState } from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import PasswordForm from './password_form'

export default function Honk() {
    const api = useRef(new Api())
    const [activeTab, setActiveTab] = useState("search")

    return (
        <Tabs justify variant='underline' activeKey={activeTab} onSelect={tab => setActiveTab(tab)}>
            <Tab eventKey="search" title='Search'>
                <Search api={api.current} />
            </Tab>
            <Tab eventKey="create" title='Create'>
                <PasswordForm api={api.current}/>
            </Tab>
            <Tab eventKey="configuration" title='Config'>
                <Configuration api={api.current} onInvalidConfiguration={() => setActiveTab("configuration")} />
            </Tab>
        </Tabs>
    );
}