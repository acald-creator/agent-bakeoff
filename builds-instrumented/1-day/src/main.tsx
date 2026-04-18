import { render } from 'solid-js/web';
import { App } from './app/App';

const root = document.getElementById('root');
if (!root) throw new Error('[ink] #root element not found');

render(() => <App />, root);
