/**
 * Only messages returned from the work will be processed.
 * Direct messages that are not returned will be permanently ignored
 * Bulk messages that are not returned will remain in the queue and reattempted the next execution
 * DO NOT use this hook to filter types of events permanently
 * DO use this hook to affect behavior based on current vendor status.  e.g. health check or custom throttling,
 * or prioritize some messages over others
 * @param {string} eventType one of "fetch" or "transition"
 * @param {boolean} isBulk
 * @param {number} availableCapacity previously computed allowed amount of throughput
 * @param {Array.<Message>} messages candidate messages
 */

export default (eventType, isBulk, availableCapacity, messages) => messages;
