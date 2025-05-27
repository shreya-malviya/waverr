// import { Buffer } from 'buffer'; 
// window.Buffer = Buffer;
// window.global = window;

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from 'react-redux';
import store from './store';
import './index.css';
import { SocketContextProvider } from './socket/socket';
import { CallProvider } from './socket/Callcontext'; 
import { BrowserRouter as Router } from 'react-router-dom';
import { StreamContext } from './socket/streamContext';
import { NotificationProvider } from './socket/Notification';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <SocketContextProvider>
        <CallProvider>
          <StreamContext>
            <NotificationProvider>
              <Router>
                <App />
              </Router>
            </NotificationProvider>
          </StreamContext>
        </CallProvider>
      </SocketContextProvider>
    </Provider>
  </React.StrictMode>
);
