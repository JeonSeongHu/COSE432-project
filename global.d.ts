declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.avif' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
} 