declare module '@recogito/annotorious' {
  // Define the types for the module here
  export interface Annotation {
    id: string;
    target: string;
    // Add more properties as needed
  }

  export class Annotorious {
    constructor(config: any);

    // Define methods and properties as needed
    on(event: string, callback: Function): void;
    // Add more methods and properties as needed
  }

  // You can add more declarations as needed based on the library's API
}
