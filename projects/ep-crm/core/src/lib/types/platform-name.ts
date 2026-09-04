export const PlatformName = {
  BPMSoft: 'BPMSoft',
  Terrasoft: 'Terrasoft',
} as const;

export type PlatformName = (typeof PlatformName)[keyof typeof PlatformName];

export const PLATFORM_NAMES: readonly PlatformName[] = Object.values(PlatformName);

export function isPlatformName(value: unknown): value is PlatformName {
  return PLATFORM_NAMES.includes(value as PlatformName);
}
