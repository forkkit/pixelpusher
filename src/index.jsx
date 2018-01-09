import React from 'react';
import ReactDOM from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import {Provider} from 'react-redux';

import configureStore from './store/configureStore';
import autoSave from './store/autoSave';
import hyperSync from './store/hyperSync';

const devMode = true;
const store = configureStore(devMode);

autoSave(store)
hyperSync(store)

const render = () => {
  const App = require('./components/App').default;

  ReactDOM.render(
    <Provider store={store}>
      <AppContainer>
        <App dispatch={store.dispatch} />
      </AppContainer>
    </Provider>,
    document.getElementById('app')
  );
}

render();

if (module.hot) {
  module.hot.accept(render);
}
