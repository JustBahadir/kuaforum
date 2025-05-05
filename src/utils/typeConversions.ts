
/**
 * Utility functions to handle type conversions for IDs and other common values
 */

/**
 * Safely converts a string ID to a number if needed
 * This function can be used when an API expects a number ID but our data has string IDs
 */
export const toNumberId = (id: string | number): number => {
  if (typeof id === 'number') return id;
  return parseInt(id, 10);
};

/**
 * Ensures an ID is a string (for Supabase UUIDs)
 */
export const toStringId = (id: string | number): string => {
  if (typeof id === 'string') return id;
  return id.toString();
};

/**
 * Makes sure an array of IDs are all strings
 */
export const ensureStringIds = <T extends { id: string | number }>(items: T[]): T[] => {
  return items.map(item => ({
    ...item,
    id: toStringId(item.id)
  }));
};
