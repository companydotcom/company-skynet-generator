import AWS from 'aws-sdk';

import {
  setupDatabase as sDb,
  httpReqHandler,
  useSkynet,
} from '@companydotcom/company-skynet-core';
import fMsgHandler from './workers/fetchWorker';
import tMsgHandler from './workers/transitionWorker';
import webhookWorker from './workers/webhookWorker';
import { microApplicationMiddleware } from './middleware';

AWS.config.update({ region: process.env.region });

const {
  region, service, accountId, throttleLmts, safeThrottleLimit, reserveCapForDirect, retryCntForCapacity,
} = process.env;

const sharedSkynetConfig = {
  region,
  service,
  account: accountId,
  useThrottling: false,
  throttleOptions: {
    throttleLmts,
    safeThrottleLimit,
    reserveCapForDirect,
    retryCntForCapacity,
  },
  maxMessagesPerInstance: 20,
};

const determineMiddleware = (allMiddleware, eventType, isBulk) => {
  allMiddleware.reduce((midToUse, { middleware, settings }) => {
    if (settings.isBulk && !settings.isBulk.includes(isBulk)) {
      return midToUse;
    }
    if (settings.eventType && !settings.eventType.includes(eventType)) {
      return midToUse;
    }
    return midToUse.concat([middleware]);
  }, []);
};

export const fetchHandler = async event => useSkynet(
  AWS,
  { ...sharedSkynetConfig, isBulk: false, eventType: 'fetch' },
  fMsgHandler,
  determineMiddleware(microApplicationMiddleware, 'fetch', false),
)(event);

export const directTransitionHandler = async event => useSkynet(
  AWS,
  { ...sharedSkynetConfig, isBulk: false, eventType: 'transition' },
  tMsgHandler,
  determineMiddleware(microApplicationMiddleware, 'transition', false),
)(event);

export const bulkFetchHandler = async event => useSkynet(
  AWS,
  { ...sharedSkynetConfig, isBulk: true, eventType: 'fetch' },
  tMsgHandler,
  determineMiddleware(microApplicationMiddleware, 'fetch', true),
)(event);

export const bulkTransitionHandler = async event => useSkynet(
  AWS,
  { ...sharedSkynetConfig, isBulk: true, eventType: 'transition' },
  tMsgHandler,
  determineMiddleware(microApplicationMiddleware, 'transition', true),
)(event);

export const webhookHandler = event => useSkynet(
  AWS,
  { ...sharedSkynetConfig, isBulk: false, eventType: 'webhook' },
  webhookWorker,
  determineMiddleware(microApplicationMiddleware, 'webhook', false),
)(event);


// eslint-disable-next-line arrow-body-style
export const setupDatabase = async (event) => {
  return sDb(AWS, event, process.env.service);
};


// eslint-disable-next-line arrow-body-style
export const getHttpHandler = async (event) => {
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
export const postHttpHandler = async (event) => {
  return httpReqHandler(
    AWS,
    process.env.region,
    process.env.service,
    process.env.accountId,
    process.env.productId,
    event,
  );
};
