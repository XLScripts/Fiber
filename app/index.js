import Fiber, { render } from "./fiber";
import "./css/global.css";

import Counter from "./src/components/Counter.jsx";

const App = () => (
    <div id="main">
        <Counter />
    </div>
)

render(<App />, document.getElementById('root'));