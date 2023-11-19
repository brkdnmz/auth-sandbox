import { useAuthStore } from "~/store/auth-store";

export function useAccessToken() {
  return useAuthStore((state) => state.accessToken);
}
