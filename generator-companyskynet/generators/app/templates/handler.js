import AWS from 'aws-sdk';

import {
  fetchHandler as fHandler,
  directTransitionHandler as dTHandler,
  bulkTransitionHandler as bTHandler,
  setupDatabase as sDb,
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
      safeThrottleLimit: process.env.safeThrottleLimit, //  CR: Mickey: are we going to make some guidelines for how high/low to set safeThreshold.
      //    Also in skynet-core these are notated as `int` but I feel like safeThrottleLimit and reserveCapForDirect are used as fractional proportions
      //    (see skynet-generator getAvaiableCallsThisSec)
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

// CR: Mickey: I'm thinking about the recent issue with email activation fraud
//    and the cases we saw where activations could occur via script even
//    if the email product wasn't purchased.  Should we add something either
//    here (a helper that must be included for every vendor service 'userHasProduct')
//    or in skynet-core to validate that a user's true account state should
//    permit the requested event to execute?
//    The logic might be different from vendor to vendor esp. when you think
//    about vendors with different tiers.  e.g. 'getReputationData' event
//    should really only be able to execute if user has Pro/Pro Plus rate plan
//    on their account.  right now are really trusting the front-end to not
//    request any thing to happen that shouldn't

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

// CR: Mickey: Why not follow recommended style here and allow implicit immediate return?
export const bulkTransitionHandler = async event => bTHandler(
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

// eslint-disable-next-line arrow-body-style
export const setupDatabase = async event => {
  return sDb(AWS, event, process.env.service);
};
