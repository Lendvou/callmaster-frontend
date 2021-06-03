import { combineReducers } from 'redux';

import core from 'store/core';
import user from 'store/user';

export default combineReducers({
  core,
  user,
});
