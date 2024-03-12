import './main.scss'
import { createRoot } from 'react-dom/client';
import Honk from './components/honk'

const root = createRoot(document.getElementById('root'));
root.render(<Honk/>);
