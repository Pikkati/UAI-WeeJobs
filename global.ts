// Declare a module for the global variable
export const global = {
  __TEST_SUPABASE__: {
    from: (table: string) => ({}),
    auth: {
      signInWithPassword: (...args: any[]) => ({}),
      signUp: (...args: any[]) => ({}),
    },
  },
};