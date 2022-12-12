export function parsePosition(rawPosition: string) {
  return rawPosition
    .split(' ')
    .slice(0, 3)
    .map((x) => {
      const parts = x.split(':');
      return Number(parts[parts.length - 1]);
    });
}
