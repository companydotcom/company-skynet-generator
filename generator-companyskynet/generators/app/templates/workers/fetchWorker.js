export default async ({
  message,
  attributes,
  serviceConfigData,
  serviceAccountData,
  serviceUserData,
  sharedMicroApplicationUserData,
  sharedMicroApplicationAccountData,
}) => {
  // Look out for user data, account data, product data in message.context
  // Service specific config data that was stored during initial setup will be
  // available in serviceConfigData. Any service specific user account data that
  // was stored earlier will be available in serviceAccountData. Similar is the
  // case with serviceUserData
  console.log('fetchWorker: INFO: Received a call to work.');
  console.log(`message => ${JSON.stringify(message, null, 2)})`);
  console.log(`attributes => ${JSON.stringify(attributes, null, 2)},`);
  console.log(`serviceConfigData => ${JSON.stringify(serviceConfigData, null, 4)}`);
  console.log(`serviceAccountData => ${JSON.stringify(serviceAccountData, null, 4)}`);
  console.log(`serviceUserData => ${JSON.stringify(serviceUserData, null, 4)}`);
  // Write all logic to perform the required work. Create other files for other
  // helpers as necessary, import and use them while keeping this file clean.
  // Do not worry about catching errors unless necessary for the business logic.

  // Check if the type of fetch event is defined. Else, throw an error
  if (typeof message.metadata === 'undefined' || typeof message.metadata.eventType === 'undefined') {
    throw new Error('Message did not have the required parameter metadata or parameter eventType within metadata');
  }

  // Check what type of fetch event has been requested and perform business
  // logic based on the same.
  // If you would like to save any service specific or shared user data to database and
  // fetch it later, send a parameter `sharedMicroApplicationUserData` with scope, and serviceData
  // defined. Same usage for `sharedMicroApplicationAccountData`
  // Or for non shared data use serviceAccountData or serviceUserData
  switch (message.metadata.eventType) {
    case '':
      return {
        res: 'Here is where you send the response data. This can also be an object',
        serviceAccountData: {},
        serviceUserData: {},
        sharedMicroApplicationUserData: {
          microApplicationsToShareWith: [
            /**
             * @param string the name of the specific vendor service to share with OR '*' for public OR empty for private
             */
          ],
          serviceData: {
            /**
             * @param any any data that is pertinent to your service
             */
          },
        },
        sharedMicroApplicationAccountData: {
          microApplicationsToShareWith: [],
          serviceData: {},
        },
        // extraStatus: '', // custom status to send out in addition to the default pass/ fail for custom responders to catch. Add the key only if required
        // crmData: {}, // crm data is used to pass custom data directly to Salesforce.  Add key only if required.
      };
    default:
      throw new Error(`fetchWorker: ERROR: metadata.eventType not recognized: ${message.metadata.eventType}`);
  }
};
