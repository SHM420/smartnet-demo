import { ngMocks } from 'ng-mocks';
import 'jest-preset-angular/setup-jest.js';

ngMocks.autoSpy('jest');

global.console = {
  ...console,
  // uncomment to ignore a specific log level
  // log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // error: jest.fn(),
};

export const expectArrayEquivalence = <T>(actual: T[], expected: T[]) => {
  expect(actual).toEqual(expect.arrayContaining(expected));
  expect(expected).toEqual(expect.arrayContaining(actual));
};