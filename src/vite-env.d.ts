/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // deno-lint-ignore no-explicit-any,ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
