/**
 * Type declarations for html-to-image library
 */

declare module 'html-to-image' {
  export interface Options {
    width?: number;
    height?: number;
    quality?: number;
    pixelRatio?: number;
    cacheBust?: boolean;
    backgroundColor?: string;
    filter?: (node: Node) => boolean;
    style?: Partial<CSSStyleDeclaration>;
  }

  export function toPng(
    node: HTMLElement,
    options?: Options
  ): Promise<string>;

  export function toJpeg(
    node: HTMLElement,
    options?: Options
  ): Promise<string>;

  export function toBlob(
    node: HTMLElement,
    options?: Options
  ): Promise<Blob>;

  export function toPixelData(
    node: HTMLElement,
    options?: Options
  ): Promise<Uint8ClampedArray>;

  export function toSvg(
    node: HTMLElement,
    options?: Options
  ): Promise<string>;
}
