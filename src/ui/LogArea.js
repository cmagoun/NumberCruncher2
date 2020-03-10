import React, {PureComponent, Component } from 'react';
import withContext from '../ecs/withContext';

class LogArea extends Component {
    render() {
        return <div>
            {this.props.log.map(logitem => <div key={logitem.id}>{logitem.msg}</div>)}
        </div>
    }
}

export default withContext(LogArea);