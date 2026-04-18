/**
 * main.tsx — Application entry point.
 *
 * Mounts the Solid app to #root. The global CSS (tokens, reset, layout)
 * is imported here as a side effect — vanilla-extract's Vite plugin picks
 * it up and emits it to the CSS bundle.
 */
import { render } from 'solid-js/web';
import App from './app/App';

// Trigger vanilla-extract CSS emission for all .css.ts files in the import graph.
// These imports are side-effect only — no JS runs from them at runtime.
import './design/global.css.ts';
import './design/typography.css.ts';

const root = document.getElementById('root');

if (!root) {
  throw new Error('[ink] #root element not found — check index.html');
}

render(() => <App />, root);
