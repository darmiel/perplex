/**
 * getUserAvatar returns the avatar for a given user ID
 * Currently, this is a "placeholder" avatar based on the user ID
 * @param userID the user ID
 * @returns the avatar URL
 */
export function getUserAvatarURL(userID: string) {
  return `https://api.dicebear.com/6.x/shapes/svg?seed=${userID}`
}
