# Contributing to TravelStay

Thank you for your interest in contributing! 🎉

## Code of Conduct

Be respectful, inclusive, and professional. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/travelstay-clone.git`
3. Create a branch: `git checkout -b feature/your-feature`
4. Setup: `npm install && npm run setup`

## Development Workflow

### Before Starting

- Check existing issues and PRs
- Create an issue for your feature
- Discuss approach with maintainers

### Making Changes

1. Write clean, readable code
2. Follow existing code style
3. Add comments for complex logic
4. Keep functions small and focused

### Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Add tests for new features
# Aim for 80%+ coverage
```

### Commit Messages

Format: `type: description`

Types:
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `docs:` Documentation
- `test:` Tests
- `chore:` Maintenance

Example:
```
feat: Add real-time messaging system
fix: Resolve form validation issue
docs: Update API documentation
```

### Pushing Changes

```bash
git push origin feature/your-feature
```

### Creating Pull Request

1. Go to GitHub
2. Click "New Pull Request"
3. Fill in description
4. Link related issues
5. Request review

## PR Requirements

- [ ] Tests pass (`npm test`)
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] No console errors
- [ ] Commit messages clear
- [ ] No breaking changes

## Code Style

- Use 2-space indentation
- Use const/let, not var
- Use arrow functions
- Use async/await
- Add JSDoc comments
- Keep lines under 100 chars

## Documentation

- Update README for new features
- Add API docs for endpoints
- Update CONTRIBUTING.md if needed
- Add inline comments for complex code

## Reporting Issues

Include:
- Clear description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment info
- Screenshots if applicable

## Feature Requests

Include:
- Use case
- Proposed solution
- Alternative solutions
- Additional context

## Review Process

1. Maintainer reviews code
2. Feedback provided
3. Make requested changes
4. Re-request review
5. Merge when approved

## Merge Criteria

- All tests pass
- Code review approved
- No conflicts
- Documentation complete
- Follows guidelines

## After Merge

- Feature branch deleted
- Mentioned in changelog
- Released in next version

## Questions?

- Open an issue
- Check documentation
- Ask in discussions
- Email maintainers

## License

By contributing, you agree your code is licensed under MIT.

Thank you for contributing! 🚀
