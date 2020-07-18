import Fiber, { Component } from "./../../fiber";

import "./../css/Counter.css";

class Counter extends Component {
    constructor(props) {
        super(props);

        this.props = props;
        this.state = {
            count: 0
        };

    }

    render() {
        return (
            <div id="counter">
                <div>
                    <span className="title">Counter App Example</span>
                </div>
                <div>
                    <button className="decrement" onClick={ _ => this.setState({count: (this.state.count - 1)}) }>-</button>
                </div>
                <div>
                    <span class="count">{ this.state.count }</span>
                </div>
                <div>
                    <button className="increment" onClick={ _ => this.setState({count: (this.state.count + 1)}) }>+</button>
                </div>
            </div>
        )
    }
}

export default Counter;