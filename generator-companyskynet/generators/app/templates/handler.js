import AWS from 'aws-sdk';

AWS.config.update({ region: process.env.region });

import {
  fetchHandler as fHandler,
  directTransitionHandler as dTHandler,
  bulkTransitionHandler as bTHandler,
  setupDatabase as sDb,
} from '@companydotcom/company-skynet-core';
import fMsgHandler from './workers/fetchWorker';
import tMsgHndlr from './workers/transitionWorker';

export const fetchHandler = async event => {
  return fHandler(
    AWS,
    {
      throttleLmts: process.env.throttleLmts,
      safeThrottleLimit: process.env.safeThrottleLimit,
      reserveCapForDirect: process.env.reserveCapForDirect,
      retryCntForCapacity: process.env.retryCntForCapacity
    },
    process.env.region,
    process.env.service,
    process.env.accountId,
    event,
    fMsgHandler
  );
};

export const directTransitionHandler = async event => {
  return dTHandler(
    AWS,
    {
      throttleLmts: process.env.throttleLmts,
      safeThrottleLimit: process.env.safeThrottleLimit,
      reserveCapForDirect: process.env.reserveCapForDirect,
      retryCntForCapacity: process.env.retryCntForCapacity
    },
    process.env.region,
    process.env.service,
    process.env.accountId,
    event,
    tMsgHndlr
  );
};

export const bulkTransitionHandler = async event => {
  return bTHandler(
    AWS,
    {
      throttleLmts: process.env.throttleLmts,
      safeThrottleLimit: process.env.safeThrottleLimit,
      reserveCapForDirect: process.env.reserveCapForDirect,
      retryCntForCapacity: process.env.retryCntForCapacity
    },
    process.env.region,
    process.env.service,
    process.env.accountId,
    event,
    tMsgHndlr
  );
};

export const setupDatabase = async event => {
  return sDb(AWS, event, process.env.service);
}