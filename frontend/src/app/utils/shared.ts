// modulo function because javascript % is a remainder fn
export function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function getPageHeight() {
  const htmlElement = document.documentElement;
  const bodyElement = document.body;

  const height = Math.max(
    htmlElement.clientHeight,
    htmlElement.scrollHeight,
    htmlElement.offsetHeight,
    bodyElement.scrollHeight,
    bodyElement.offsetHeight,
  );

  return height;
}

// gets difference between two objects of the same type
export function getObjectDiff<T extends object>(previous: T, current: T) {
  const changes: Partial<T> = {};

  // Check current object's properties
  for (const [key, value] of Object.entries(current) as [keyof T, T[keyof T]][]) {
    if (!(key in previous)) {
      changes[key] = value;
      continue;
    }

    const originalValue = previous[key];
    const currentValue = value;

    // Handle different types of comparisons
    if (
      originalValue !== currentValue &&
      JSON.stringify(originalValue) !== JSON.stringify(currentValue)
    ) {
      changes[key] = currentValue;
    }
  }

  // Check for removed properties
  for (const key of Object.keys(previous) as (keyof T)[]) {
    if (!(key in current)) {
      changes[key] = undefined;
    }
  }

  return Object.keys(changes).length === 0 ? null : changes;
}
