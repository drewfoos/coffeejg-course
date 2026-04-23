/**
 * Shared taxonomy for the Resource Hub. Keep these in sync with the
 * filter UI — the admin asset form and user suggestion flow both rely
 * on them to produce values the filters can match.
 */

export const RESOURCE_TAGS = [
  "2D",
  "3D",
  "Overlays & Alerts",
  "Emotes/Stickers/Badges",
  "Character Assets",
  "Clothing/Accessories",
  "Live2D/3D/PNGtuber Models",
  "VRoid",
  "VRM",
  "VRChat",
  "Backgrounds",
  "Background Music",
  "Schedules",
  "Panels",
  "Thumbnails",
  "Objects",
  "Hands",
  "Outfits",
  "Badges",
  "Emotes",
  "Guides",
] as const;

export const RESOURCE_SOURCES = [
  "Ko-fi",
  "Booth",
  "VGen",
  "Gumroad",
  "Twitter/X",
  "itch.io",
] as const;
