import Fiber from "./../fiber";
import './css/App.css';

export default ({ name = 'Mudassar' }) => {
    const count = 0;

    return (
        <div id="main">
            <button>-</button>
            <p>The count is: { count }</p>
            <button>+</button>
        </div>
    )
}