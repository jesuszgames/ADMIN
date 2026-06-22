
declare global {
  interface Window {
    bootstrap?: {
      Collapse: {
        new (element: Element | string, options?: unknown): {
          show(): void;
          hide(): void;
          toggle(): void;
          dispose(): void;
        };
        getInstance(element: Element): { hide(): void; show(): void } | null;
        getOrCreateInstance(
          element: Element,
          config?: unknown,
        ): { hide(): void; show(): void };
      };
      Modal: new (element: Element | string, options?: unknown) => {
        show(): void;
        hide(): void;
        toggle(): void;
        dispose(): void;
      };
      Dropdown: new (element: Element | string, options?: unknown) => unknown;
    };
  }
}

export {};
