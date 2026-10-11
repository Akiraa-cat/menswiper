<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const mountElement = ref<HTMLDivElement | null>(null);
let reactRoot: Root | undefined;

onMounted(async () => {
  if (!mountElement.value) return;

  if (import.meta.dev) {
    const { injectIntoGlobalHook } = await import('react-refresh/runtime');
    const refreshWindow = window as unknown as Window & {
      $RefreshReg$: (...args: unknown[]) => void;
      $RefreshSig$: <T>(type: T) => T;
    };
    injectIntoGlobalHook(refreshWindow);
    refreshWindow.$RefreshReg$ = () => {};
    refreshWindow.$RefreshSig$ = (type) => type;
  }

  const { default: App } = await import('../../src/App');
  reactRoot = createRoot(mountElement.value);
  reactRoot.render(createElement(App));
});

onBeforeUnmount(() => reactRoot?.unmount());
</script>

<template>
  <div ref="mountElement" />
</template>