/**
 * Constants related to room types and classification
 */

/**
 * List of standard room types that can be identified by Claude
 */
export const ROOM_TYPES = [
  'Kitchen',
  'Living Room',
  'Foyer',
  'Bedroom',
  'Bathroom',
  'Hallway'
] as const;

/**
 * Type for room types
 */
export type RoomType = typeof ROOM_TYPES[number];

/**
 * Default room name if classification fails
 */
export const DEFAULT_ROOM_NAME = 'Room';

/**
 * Check if a string is a valid room type
 */
export function isValidRoomType(type: string): type is RoomType {
  return ROOM_TYPES.includes(type as RoomType);
}

/**
 * Get a fallback room name with a unique identifier
 */
export function getFallbackRoomName(index: number): string {
  return `${DEFAULT_ROOM_NAME} ${index + 1}`;
}
