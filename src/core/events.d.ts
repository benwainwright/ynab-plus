declare global {
  interface Events {
    SocketOpened: undefined;
    ApplicationError: {
      stack: {
        file: string;
        calee: string;
      }[];
      message: string;
    };
  }
}

export {};
