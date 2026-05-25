import { computed, signal, untracked } from '@angular/core';

// signal with stored previous value
export function computedPrevious<T>() {
  let current = signal<T>(null as T);
  let previous = untracked(() => current()); // initial value is the current value

  return {
    current,
    previous: computed(() => {
      const result = previous;
      previous = current();
      return result;
    }),
  };
}
