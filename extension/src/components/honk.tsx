import Api from '../api'
import './honk.scss'
import Accordion from 'react-bootstrap/Accordion'
import Search from './search'
import Configuration from './configuration'

export default function Honk() {
    const api = new Api()
    return (
        <Accordion>
            <Search api={api} />
            <Configuration api={api} />
        </Accordion>
    );
}