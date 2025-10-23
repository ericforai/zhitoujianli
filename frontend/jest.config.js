module.exports = {
  preset: 'react-scripts',
  transformIgnorePatterns: [
    'node_modules/(?!(axios|react-router|react-router-dom|@remix-run)/)',
  ],
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
  },
  testEnvironment: 'jsdom',
};

