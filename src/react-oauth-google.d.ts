declare module '@react-oauth/google' {
    export const GoogleOAuthProvider: React.FC<{ clientId: string; children: React.ReactNode }>;
    export function useGoogleLogin(options: any): () => void;
  }