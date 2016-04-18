import { takeEvery, takeLatest } from 'redux-saga';
import { call, put, take, fork, select } from 'redux-saga/effects';
// Actions
import { change } from 'redux-form/lib/actions';
import * as brandActions from 'app/common/actions/brands';
import * as campaignActions from 'app/common/actions/campaigns';
import * as routerActions from 'react-router-redux/lib/actions';
import * as authActions from 'app/auth/actions';
import * as triggerActions from 'app/common/actions/triggers';
import * as trainingResultActions from 'app/common/actions/trainingResults';
// API
import * as brandsApi from '../services/api/brands';
import * as sessionsApi from '../services/api/sessions';
import * as usersApi from '../services/api/users';
import * as campaignsApi from '../services/api/campaigns';
import * as triggersApi from '../services/api/triggers';
import * as trainingResultsApi from '../services/api/trainingResults';
// Selectors
import { getPathname } from '../selectors/routing';
//import { getParams } from 'react-router/lib/PatternUtils';
import _ from 'lodash';

function* brandsFetchAsync() {
  try {
    let brands = yield brandsApi.getBrands();
    yield put(brandActions.brandsFetchSuccess(brands));
  } catch(err) {
    yield put(brandActions.brandsFetchFailure(err));
  }
};

function* authLoginAsync(action) {
  try {
    let user = yield sessionsApi.createSession(action.payload);
    yield put(authActions.authLoginSuccess(user));
    yield put(routerActions.push('/'));
  } catch(err) {
    yield put(authActions.authLoginFailure(err));
  }
};

function* authForgottenPasswordAsync(action) {
  try {
    let result = yield usersApi.forgottenPassword(action.payload);
    yield put(authActions.authForgottenPasswordSuccess(result));
    yield put(routerActions.push('/reset-password'));
  } catch(err) {
    yield put(authActions.authForgottenPasswordFailure(err));
  }
};

function* authResetPasswordAsync(action) {
  try {
    let result = yield usersApi.resetPassword(action.payload);
    yield put(authActions.authResetPasswordSuccess(result));
  } catch(err) {
    yield put(authActions.authResetPasswordFailure(err));
    return;
  }

  yield put(routerActions.push('/signin'));
};

function* campaignCreateAsync(action) {
  var campaignResult,
    triggerResult,
    trainingResultsResult;

  try {
    campaignResult = yield campaignsApi.create(action.payload.values);
    yield put(campaignActions.createCampaignSuccess(campaignResult));

    // Setting the id field to that of the campaign
    // this will allow us to know if the data is new or old
    // as well as be able to retrieve data on step changes
    const changeAction = change('campaignId', campaignResult.result);
    changeAction.form = action.payload.form;
    yield put(changeAction);
    action.payload.resolve(campaignResult);
  } catch(err) {
    yield put(campaignActions.createCampaignFailure(err));
    action.payload.reject(err);
    return;
  }
  // Now fetch the triggers for the campaign.
  try {
    triggerResult = yield triggersApi.getByCampaign(campaignResult.result);
    yield put(triggerActions.fetchTriggersSuccess(triggerResult));

    const changeAction = change('triggerId', triggerResult.result[0]);
    changeAction.form = action.payload.form;
    yield put(changeAction);
  } catch(err) {
    yield put(triggerActions.fetchTriggersFailure(err));
    return;
  }
  // Now we need the training results
  try {
    const trigger = triggerResult.entities.triggers[triggerResult.result[0]];
    trainingResultsResult = yield trainingResultsApi.getByRaw(trigger.trainingResult, trigger.triggerId);
    yield put(trainingResultActions.fetchTrainingResultsSuccess(trainingResultsResult));

    // Sync all of the pages
    _.times(
      trainingResultsResult.result.length,
      n => action.payload.pagesAddField({})
    );

    // Now go to the correct screen.
    action.payload.updateUI({
      pageView: 'ALL',
      step: 1,
      page: 0
    });
  } catch(err) {
    yield put(trainingResultActions.fetchTrainingResultsFailure(err));
    return;
  }
};

function* campaignFetchAsync(action) {
  try {
    let result = yield campaignsApi.get(action.payload);
    yield put(campaignActions.fetchCampaignsSuccess(result));
  } catch(err) {
    yield put(campaignActions.fetchCampaignsFailure(err));
  }
};

function* campaignDeleteAsync(action) {
  try {
    let result = yield campaignsApi.del(action.payload);
    yield put(campaignActions.deleteCampaignSuccess(result));
  } catch(err) {
    yield put(campaignActions.deleteCampaignFailure(err));
  }
};

function* triggerUpdateAsync(action) {
  try {
    const trigger = action.payload.values;
    let result = yield triggersApi.update(trigger.id, trigger);
    yield put(triggerActions.updateTriggerSuccess(result));
  } catch(err) {
    yield put(triggerActions.updateTriggerFailure(err));
  }
}

function* checkForbiddenNavigation(pathname) {
  const whiteList = [
    '/signin',
    '/forgotten-password',
    '/reset-password'
  ];

  if(_.includes(whiteList, pathname) === false) {
    let isLoggedIn = yield select((state) => {
      return state.auth.get('isLoggedIn');
    });

    if(isLoggedIn !== true) {
      yield put(routerActions.push('/signin'));
    }
  }
};


function* startup() {
};

//-----------------------------------------------------------
//----------------------- Watchers --------------------------
//-----------------------------------------------------------

function* watchForbiddenNavigation() {
  yield fork(function* () {
    while(true) {
      yield take('APP_STARTUP');
      const pathname = yield select(getPathname);
      yield checkForbiddenNavigation(pathname);
    }
  });
  yield fork(function* () {
    while(true) {
      const { payload } = yield take('@@route/LOCATION_CHANGE');
      yield checkForbiddenNavigation(payload.pathname);
    }
  });
};

function* watchAuthLoginRequest() {
  yield takeLatest('AUTH_LOGIN_REQUEST', authLoginAsync);
};

function* watchAuthForgottenPasswordRequest() {
  yield takeLatest('AUTH_FORGOTTEN_PASSWORD_REQUEST', authForgottenPasswordAsync);
};

function* watchAuthResetPasswordRequest() {
  yield takeLatest('AUTH_RESET_PASSWORD_REQUEST', authResetPasswordAsync);
}

function* watchBrandsFetchRequest() {
  yield takeLatest('BRANDS_FETCH_REQUEST', brandsFetchAsync);
};

function* watchLoadCampaignPrintCreate() {
  while(true) {
    yield take('CAMPAIGN_CREATE_LOAD');
    yield fork(function* () {
      yield put(brandActions.brandsFetchRequest());
    });
  }
};

function* watchCampaignCreateBrandSelect() {
  yield takeEvery('CAMPAIGN_CREATE_BRAND_SELECT', function* (action) {
    yield put(routerActions.push(`/campaign/create/${action.payload || ''}`));
  });
};

function* watchCampaignCreateCampaignTypeSelect() {
  yield takeEvery('CAMPAIGN_CREATE_CAMPAIGN_TYPE_SELECT', function* (action) {
    const selectedBrandId = yield select((state) => {
      return state.campaigns.getIn(['create', 'selectedBrandId']);
    });

    let url;
    if(selectedBrandId == null) {
      url = '/campaign/create';
    } else if(action.payload == null) {
      url = `/campaign/create/${selectedBrandId}`;
    } else {
      url = `/campaign/create/${selectedBrandId}/${action.payload}`;
    }
    yield put(routerActions.push(url));
  });
};

function* watchCampaignCreate() {
  yield takeLatest('CAMPAIGN_CREATE_REQUEST', campaignCreateAsync);
};

function* watchCampaignFetch() {
  yield takeLatest('CAMPAIGN_FETCH_REQUEST', campaignFetchAsync);
};

function* watchCampaignDelete() {
  yield takeLatest('CAMPAIGN_DELETE_REQUEST', campaignDeleteAsync);
};

function* watchTriggerUpdate() {
  yield takeLatest('TRIGGER_UPDATE_REQUEST', triggerUpdateAsync);
};

export default function* root() {
  yield fork(startup);

  yield fork(watchForbiddenNavigation);

  yield fork(watchAuthLoginRequest);
  yield fork(watchAuthForgottenPasswordRequest);
  yield fork(watchAuthResetPasswordRequest);

  yield fork(watchLoadCampaignPrintCreate);
  yield fork(watchBrandsFetchRequest);

  yield fork(watchCampaignCreateBrandSelect);
  yield fork(watchCampaignCreateCampaignTypeSelect);
  yield fork(watchCampaignCreate);
  yield fork(watchCampaignFetch);
  yield fork(watchCampaignDelete);

  yield fork(watchTriggerUpdate);
};