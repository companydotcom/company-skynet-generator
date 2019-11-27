export default async ({ message, attributes, serviceConfigData }) => {
  console.log(`transitionWorker: INFO: Received a call to work with message as ${JSON.stringify(message, null, 2)}, attributes as ${JSON.stringify(attributes, null, 2)} and service config data as ${JSON.stringify(serviceConfigData, null, 4)}`);
  // Write all logic to perform the required work. Create other files for other
  // helpers as necessary, import and use them while keeping this file clean.
  // Do not worry about catching unless necessary for the business logic.

  // Check if the type of fetch event is defined. Else, throw an error
  if (typeof message.metadata === 'undefined' || typeof message.metadata.eventType === 'undefined') {
    throw new Error('Message did not have the required paameter metadata or parameter eventType within metadata');
  }

  // Check what type if fetch event has been requested and perform business
  // logic based on the same
  switch (message.metadata.eventType) {
    case '':
      return 'Here is where you send the response';
    default:
      throw new Error(`fetchWorker: ERROR: metadata.eventType not recognized: ${message.metadata.eventType}`);
  }
};
