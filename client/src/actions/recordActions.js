import { LOAD_RECORDS, RECORDS_ERROR } from './types';
import api from '../utils/api';

// Load user records
export const loadRecords = () => async dispatch => {
  try {
    const res = await api.get('/users/me/records');
    dispatch({
      type: LOAD_RECORDS,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: RECORDS_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};
