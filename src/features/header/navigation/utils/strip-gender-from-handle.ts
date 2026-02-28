export const GENDER_SLUGS = [
  'zhenskaya',
  'zhenskie',
  'zhinocha',
  'zhinoche',
  'zhinochi',
  'cholovichi',
  'cholovicha',
  'muzhskaya',
  'muzhskie',
];
export function stripGenderFromHandle(handle: string): string {
  return handle
    .split('-')
    .filter((part) => !GENDER_SLUGS.includes(part))
    .join('-');
}
