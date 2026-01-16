export const natsWrapper = {
  // connection:
  jsManager: {},
  jsClient: {
    publish: vitest
      .fn()
      .mockImplementation((subject: string, payload: string) => {}),
  },
};
