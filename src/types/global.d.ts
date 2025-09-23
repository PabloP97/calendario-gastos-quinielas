/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="vite/client" />

// Declaraciones para archivos estáticos
declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

// Declaración para Sonner con versión específica
declare module 'sonner@2.0.3' {
  export * from 'sonner';
  export { Toaster, toast } from 'sonner';
}

export {};