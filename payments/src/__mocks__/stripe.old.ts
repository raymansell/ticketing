export const stripe = {
  charges: {
    create: vitest.fn().mockResolvedValue({}),
  },
};
