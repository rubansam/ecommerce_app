import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import productSaga from './sagas/productSaga';
import authSaga from './sagas/authSaga';

const sagaMiddleware = createSagaMiddleware();

function* rootSaga() {
  yield all([
    productSaga(),
    authSaga(),
  ]);
}

const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export default store; 