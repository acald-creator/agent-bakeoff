/**
 * main.tsx — app entry point
 *
 * Imports the global vanilla-extract styles (side-effect import),
 * then mounts the Solid app to #root.
 */
// Side-effect: registers all global CSS via vanilla-extract
import './design/global.css';

import { render } from 'solid-js/web';
import { App }    from './app/App';

const root = document.getElementById('root');

if (!root) {
  throw new Error('[ink] #root element not found. Check index.html.');
}

render(() => <App />, root);
