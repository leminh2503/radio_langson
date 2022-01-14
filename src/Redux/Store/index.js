import {createStore} from 'redux';

import storage                        from 'redux-persist/lib/storage';
import {persistReducer, persistStore} from 'redux-persist';
import reducers                       from '../Reducers';

const persistConfig = {
    key: 'root',
    storage: storage
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = createStore(persistedReducer);

const persistor = persistStore(store);

export {
    store,
    persistor
};
