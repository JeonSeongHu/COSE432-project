declare module '*.module.css' {
    const content: { [key: string]: string };
    export = content;
  }

declare module '*.css' {
  const content: { [key: string]: string };
  export = content;
}