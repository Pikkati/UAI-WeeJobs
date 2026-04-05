declare var global: {
  __TEST_SUPABASE__: {
    from: (table: string) => any;
    auth: {
      signInWithPassword?: (...args: any[]) => any;
      signUp?: (...args: any[]) => any;
    };
  };
};

export {};