export default async ({
  message, attributes, serviceConfigData, serviceUserData,
}) => {
  // Look out for user data, account data, product data in message.context
  // Service specific config data that was stored during initial setup will be
  // available in serviceConfigData. Any service specific user data that was
  // stored earlier will be available in serviceUserData
  console.log('fetchWorker: INFO: Received a call to work.'); // CR: Mickey: breaking these up will make logs easier to read
  console.log(`message => ${JSON.stringify(message, null, 2)})`);
  console.log(`attributes => ${JSON.stringify(attributes, null, 2)},`);
  console.log(`serviceConfigData => ${JSON.stringify(serviceConfigData, null, 4)}`);
  console.log(`serviceUserData => ${JSON.stringify(serviceUserData, null, 4)}`);
  // Write all logic to perform the required work. Create other files for other
  // helpers as necessary, import and use them while keeping this file clean.
  // Do not worry about catching unless necessary for the business logic.

  // Check if the type of fetch event is defined. Else, throw an error
  if (typeof message.metadata === 'undefined'
    || typeof message.metadata.eventType === 'undefined') {
    throw new Error('Message did not have the required parameter metadata or parameter eventType within metadata');
  }

  // Check what type if fetch event has been requested and perform business
  // logic based on the same.
  // If you would like to save any service specific user data to database and
  // fetch it later, send a parameter 'serviceUserData' with the data to be saved
  // as a key in the return value object.
  switch (message.metadata.eventType) {
    case '':
      // CR: Mickey: see notes in /transitionWorker about return val.
      return {
        res: 'Here is where you send the response data. This can also be an object',
        serviceUserData: {},
      };
    default:
      throw new Error(`fetchWorker: ERROR: metadata.eventType not recognized: ${message.metadata.eventType}`);
  }
};
