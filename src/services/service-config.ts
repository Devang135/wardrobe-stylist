/**
 * Controls whether services route through the local mock adapter or the Spring Boot REST API.
 * Defaults to mock mode when VITE_USE_MOCK_API is not explicitly set to "false".
 */
export const USE_MOCK_API =
  (import.meta.env.VITE_USE_MOCK_API as string | undefined) !== 'false';
