export function cleanUpFileName(name: string) {
  return name
    .replaceAll(' ', '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase();
}
