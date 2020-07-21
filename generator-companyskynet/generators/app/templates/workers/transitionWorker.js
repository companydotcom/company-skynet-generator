export default async ({
  message, attributes, serviceConfigData, serviceAccountData, serviceUserData,
}) => {
  // Look out for user data, account data, product data in message.context
  // Service specific config data that was stored during initial setup will be
  // available in serviceConfigData. Any service specific user account data that
  // was stored earlier will be available in serviceAccountData. Similar is the
  // case with serviceUserData
  console.log('transitionWorker: INFO: Received a call to work.');
  console.log(`message => ${JSON.stringify(message, null, 2)})`);
  console.log(`attributes => ${JSON.stringify(attributes, null, 2)},`);
  console.log(`serviceConfigData => ${JSON.stringify(serviceConfigData, null, 4)}`);
  console.log(`serviceAccountData => ${JSON.stringify(serviceAccountData, null, 4)}`);
  console.log(`serviceUserData => ${JSON.stringify(serviceUserData, null, 4)}`);

  // Write all logic to perform the required work. Create other files for other
  // helpers as necessary, import and use them while keeping this file clean.
  // Do not worry about catching errors unless necessary for the business logic.

  // Check if the type of fetch event is defined. Else, throw an error
  if (typeof message.metadata === 'undefined'
    || typeof message.metadata.eventType === 'undefined') {
    throw new Error('Message did not have the required paameter metadata or parameter eventType within metadata');
  }

  // Check what type of transition event has been requested and perform business
  // logic based on the same.
  // If you would like to save any service specific user data to database and
  // fetch it later, send a parameter 'serviceAccountData' with the data to be saved
  // as a key in the return value object. Same is the case for 'serviceUserData'
  switch (message.metadata.eventType) {
    case '':
      return {
        res: 'Here is where you send the response data. This can also be an object',
        serviceAccountData: {},
        serviceUserData: {},
        // extraStatus: '', // custom status to send out in addition to the default pass/ fail for custom responders to catch. Add the key only if required
      };
    default:
      throw new Error(`transitionWorker: ERROR: metadata.eventType not recognized: ${message.metadata.eventType}`);
  }
};
