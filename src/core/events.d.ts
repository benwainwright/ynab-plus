declare global {
  interface Events {
    SocketOpened: undefined;
    LogoutSuccess: undefined;
    LoginSuccess: undefined;
    RegisterSuccess: undefined;
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
