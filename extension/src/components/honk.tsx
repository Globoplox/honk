import './honk.scss'
import Accordion from 'react-bootstrap/Accordion'
import Search from './search'
import Configuration from './configuration'

export default function Honk() {
    return (
        <Accordion flush>
            <Search />
            <Configuration />
        </Accordion>
    );
}