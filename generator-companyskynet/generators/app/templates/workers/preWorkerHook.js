/**
 * This method should only be used in very select cases to execute side effects or perform custom throttling on bulk operations.  A
 * Any messages that you remove from the array will not be executed in this run.
 * Non-bulk messages will be permanently ignored and will not be re-emitted as "handled".
 * Bulk messages will remain in the queue.  Do not use this hook to permanently ignore any messages.
 * @param {String} eventType fetch or transition
 * @param {Boolean} isBulk
 * @param {Array<Message>} messages Array of parsed SNS messages ready to be processed
 * @returns {Array<Message>} Messages to be passed to worker
 */
export const preWorkerHook = (eventType, isBulk, messages = []) => messages;
