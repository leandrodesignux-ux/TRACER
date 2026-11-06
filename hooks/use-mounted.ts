import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * true solo en el cliente, después de hidratar.
 * Úsalo para leer lo que depende del tema o de localStorage sin errores de hidratación.
 */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
