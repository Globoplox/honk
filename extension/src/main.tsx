import './main.scss'
import { createRoot } from 'react-dom/client';
import Honk from './components/honk'

if (window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.setAttribute('data-bs-theme', 'dark')

const root = createRoot(document.getElementById('root'));
root.render(<Honk/>);
