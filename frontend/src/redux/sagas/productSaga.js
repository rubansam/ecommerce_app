import { call, put, takeEvery } from 'redux-saga/effects';
import { fetchProducts } from '../../api/products';
import { fetchProductsSuccess, fetchProductsFailure } from '../slices/productSlice';
import { PRODUCT_ACTION_TYPES } from '../actionTypes/productActionTypes';

function* fetchProductsSaga() {
  try {
    const products = yield call(fetchProducts);
    yield put(fetchProductsSuccess(products));
  } catch (error) {
    yield put(fetchProductsFailure(error.message));
  }
}

function* productSaga() {
  yield takeEvery(PRODUCT_ACTION_TYPES.FETCH_PRODUCTS_REQUEST, fetchProductsSaga);
}

export default productSaga; 