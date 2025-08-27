import { query } from "./_generated/server";

export const sayHello = query({
  args: {},
  handler: async () => {
    return "Hello from Convex!";
  },
});