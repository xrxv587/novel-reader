export {}

declare module "vue" {
  type Hooks = App.AppInstance & Page.PageInstance;
  interface ComponentCustomOptions extends Hooks {}
}

declare global {
  interface PlusIo {
    chooseFile(options: {
      filter?: string[];
      success?: (res: any) => void;
      fail?: (error: any) => void;
    }): void;
  }

  interface PlusIoFileReader {
    readAsArrayBuffer(file: any, encoding?: string): void;
  }
}