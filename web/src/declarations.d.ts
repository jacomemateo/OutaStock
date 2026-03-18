// src/vite-env.d.ts

declare module '*.png' {
    const value: string;
    return value;
}

declare module '*.jpg' {
    const value: string;
    return value;
}

declare module '*.svg' {
    const value: string;
    return value;
}

// declarations.d.ts
interface Window {
  env: {
    API_BASE_URL: string;
    [key: string]: string | undefined; // for other env vars you may add
  };
}