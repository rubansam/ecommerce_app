import { call, put, takeEvery } from 'redux-saga/effects';
import { register, login } from '../../api/auth';
import { registerSuccess, registerFailure, loginSuccess, loginFailure } from '../slices/authSlice';
import { AUTH_ACTION_TYPES } from '../actionTypes/authActionTypes';
;

function* registerUserSaga(action) {
  try {
    const user = yield call(register, action.payload);
    yield put(registerSuccess(user));
  } catch (error) {
    yield put(registerFailure(error.message));
  }
}

function* loginUserSaga(action) {
  try {
    const user = yield call(login, action.payload);
    yield put(loginSuccess(user));
  } catch (error) {
    yield put(loginFailure(error.message));
  }
}

function* authSaga() {
  yield takeEvery(AUTH_ACTION_TYPES.REGISTER_REQUEST, registerUserSaga);
  yield takeEvery(AUTH_ACTION_TYPES.LOGIN_REQUEST, loginUserSaga);
}

export default authSaga; 