import AWS from 'aws-sdk';

import {
  fetchHandler as fHandler,
  directTransitionHandler as dTHandler,
  bulkTransitionHandler as bTHandler,
  setupDatabase as sDb,
  httpReqHandler,
} from '@companydotcom/company-skynet-core';
import fMsgHandler from './workers/fetchWorker';
import tMsgHndlr from './workers/transitionWorker';

AWS.config.update({ region: process.env.region });

// eslint-disable-next-line arrow-body-style
export const fetchHandler = async event => {
  return fHandler(
    AWS,
    {
      throttleLmts: process.env.throttleLmts,
      safeThrottleLimit: process.env.safeThrottleLimit,
      reserveCapForDirect: process.env.reserveCapForDirect,
      retryCntForCapacity: process.env.retryCntForCapacity,
    },
    process.env.region,
    process.env.service,
    process.env.accountId,
    event,
    fMsgHandler,
  );
};

// eslint-disable-next-line arrow-body-style
export const directTransitionHandler = async event => {
  return dTHandler(
    AWS,
    {
      throttleLmts: process.env.throttleLmts,
      safeThrottleLimit: process.env.safeThrottleLimit,
      reserveCapForDirect: process.env.reserveCapForDirect,
      retryCntForCapacity: process.env.retryCntForCapacity,
    },
    process.env.region,
    process.env.service,
    process.env.accountId,
    event,
    tMsgHndlr,
  );
};

// eslint-disable-next-line arrow-body-style
export const bulkTransitionHandler = async event => {
  return bTHandler(
    AWS,
    {
      throttleLmts: process.env.throttleLmts,
      safeThrottleLimit: process.env.safeThrottleLimit,
      reserveCapForDirect: process.env.reserveCapForDirect,
      retryCntForCapacity: process.env.retryCntForCapacity,
    },
    process.env.region,
    process.env.service,
    process.env.accountId,
    event,
    tMsgHndlr,
  );
};

// eslint-disable-next-line arrow-body-style
export const setupDatabase = async event => {
  return sDb(AWS, event, process.env.service);
};

// eslint-disable-next-line arrow-body-style
export const getHttpHandler = async event => {
  return httpReqHandler(
    AWS,
    process.env.region,
    process.env.service,
    process.env.accountId,
    process.env.productId,
    event,
  );
};

// eslint-disable-next-line arrow-body-style
export const postHttpHandler = async event => {
  return httpReqHandler(
    AWS,
    process.env.region,
    process.env.service,
    process.env.accountId,
    process.env.productId,
    event,
  );
};
