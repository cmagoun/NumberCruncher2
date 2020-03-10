import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Provider from './ecs/Provider';
import NumberCruncher from './game/NumberCruncher';
import Main from './ui/Main';

const nc = new NumberCruncher();
nc.start();


ReactDOM.render(
    <Provider ctx={nc}>
        <Main/>
    </Provider>, 
    document.getElementById('root'));