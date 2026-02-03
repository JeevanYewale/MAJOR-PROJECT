# Testing Guide

## Setup

Install test dependencies:
```bash
npm install --save-dev mocha chai
```

## Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Test Structure

```
test/
├── setup.js              # Test configuration and hooks
├── forms.test.js         # Form model tests
├── validation.test.js    # Validation schema tests
└── analytics.test.js     # Analytics service tests
```

## Test Coverage

- **Forms**: Model creation, validation, status updates, deletion
- **Validation**: Email validation, required fields, message length
- **Analytics**: Statistics calculation, top subjects, daily submissions

## Writing Tests

Example test:
```javascript
describe('Feature Name', () => {
  it('should do something', async () => {
    const result = await someFunction();
    assert.strictEqual(result, expectedValue);
  });
});
```

## Best Practices

1. Use descriptive test names
2. Test one thing per test
3. Clean up data after each test
4. Use async/await for async operations
5. Test both success and failure cases

## CI/CD Integration

Add to your CI/CD pipeline:
```yaml
- name: Run Tests
  run: npm test
```

## Coverage Goals

- Aim for 80%+ code coverage
- Test critical paths
- Test error handling
- Test edge cases
