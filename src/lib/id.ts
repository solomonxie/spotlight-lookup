let counter = 0;

/** Short, sortable, collision-safe enough for local rows and Spotlight identifiers. */
export function createId(prefix = 'e'): string {
  counter = (counter + 1) % 0xffff;
  const time = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 0xffffff).toString(36);
  return `${prefix}_${time}${counter.toString(36)}${rand}`;
}
