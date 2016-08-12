import { createAction } from 'redux-actions';

// Alert Messages
export const S_ALERT_MESSAGE_READ = 'S_ALERT_MESSAGE_READ';

export const alertMessageRead = createAction(S_ALERT_MESSAGE_READ);

// Brands
export const S_BRAND_ADD_FORM_SUBMIT = 'S_BRAND_ADD_FORM_SUBMIT';
export const S_BRAND_EDIT_FORM_SUBMIT = 'S_BRAND_EDIT_FORM_SUBMIT';

export const brandAddFormSubmit = createAction(S_BRAND_ADD_FORM_SUBMIT);
export const brandEditFormSubmit = createAction(S_BRAND_EDIT_FORM_SUBMIT);

// Coupons
export const S_COUPON_CREATE_FORM_SUBMIT = 'S_COUPON_CREATE_FORM_SUBMIT';
export const S_COUPON_EDIT_FORM_SUBMIT = 'S_COUPON_EDIT_FORM_SUBMIT';

export const couponCreateFormSubmit = createAction(S_COUPON_CREATE_FORM_SUBMIT);
export const couponEditFormSubmit = createAction(S_COUPON_EDIT_FORM_SUBMIT);

// Verify Authentication
export const S_VERIFY_AUTHENTICATION = 'S_VERIFY_AUTHENTICATION';

export const verifyAuthentication = createAction(S_VERIFY_AUTHENTICATION);

// Session
export const S_SESSION_LOGOUT = 'S_SESSION_LOGOUT';

export const sessionLogout = createAction(S_SESSION_LOGOUT);