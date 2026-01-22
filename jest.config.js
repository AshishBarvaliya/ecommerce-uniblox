/** @type {import('jest').Config} */
const baseConfig = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: [
    'app/api/**/*.{ts,tsx}',
    'app/**/page.tsx',
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/ui/**',
  ],
};

module.exports = {
  projects: [
    {
      ...baseConfig,
      displayName: 'api',
      testMatch: ['**/__tests__/api/**/*.test.ts'],
      testEnvironment: 'node',
    },
    {
      ...baseConfig,
      displayName: 'frontend',
      testMatch: ['**/__tests__/**/*.test.tsx', '**/__tests__/hooks/**/*.test.tsx'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
  ],
};
