export interface MathfieldElement extends HTMLElement {
  value: string;
  mode: "math" | "text";
  smartMode: boolean;
  insert: (latex: string) => void;
  focus: () => void;
}

declare module "mathlive" {
  export type { MathfieldElement };
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "math-field": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        value?: string;
        virtualKeyboardMode?: "manual" | "onfocus" | "off" | "on";
      };
    }
  }
}
