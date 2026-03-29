const VALID_ID = /^[a-zA-Z0-9_-]{1,128}$/;

/**
 * Validates a string is safe to use as a Firestore document ID.
 * Throws a generic error if invalid — never leaks internal details.
 */
export function validateId(id: string, name: string): string {
  if (!VALID_ID.test(id)) {
    throw new Error(`Invalid ${name}.`);
  }
  return id;
}
