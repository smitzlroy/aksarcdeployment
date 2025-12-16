# Contributing to AKS Arc Deployment Tool

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/smitzlroy/aksarcdeployment/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Python version, etc.)
   - Screenshots if applicable

### Suggesting Enhancements

1. Check existing issues and discussions
2. Create a new issue with:
   - Clear description of the enhancement
   - Use cases and benefits
   - Possible implementation approach

### Pull Requests

1. **Fork the repository** and create a feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** following our coding standards:
   - Write clear, self-documenting code
   - Add tests for new functionality
   - Update documentation as needed
   - Follow PEP 8 for Python code
   - Use type hints where appropriate

3. **Test your changes**:
   ```bash
   # Run tests
   pytest tests/
   
   # Run linter
   flake8 src/
   
   # Run formatter
   black src/
   ```

4. **Commit with conventional commits**:
   ```bash
   git commit -m "feat: add rack-aware node placement"
   git commit -m "fix: correct SKU validation logic"
   git commit -m "docs: update README with new examples"
   ```

   Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

5. **Push and create a PR**:
   ```bash
   git push origin feat/your-feature-name
   ```
   - Fill out the PR template
   - Link related issues
   - Request review from maintainers

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/aksarcdeployment.git
cd aksarcdeployment

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Run tests
pytest

# Run the wizard locally
python src/wizard/main.py
```

## Coding Standards

- **Python**: PEP 8, type hints, docstrings for public APIs
- **Documentation**: Keep README, DECISIONS.md, and inline comments up to date
- **Tests**: Maintain >80% code coverage
- **Security**: Never commit secrets, API keys, or credentials

## Feature Flags

For new or experimental features:
- Use feature flags to avoid breaking existing functionality
- Document the flag in DECISIONS.md
- Provide clear on/off mechanism

## Branch Protection

- `main` branch is protected
- All changes must go through PR review
- CI must pass before merging
- Squash and merge preferred

## Release Process

Maintainers will:
1. Update CHANGELOG.md with release notes
2. Bump version following semver
3. Create a GitHub release
4. Deploy to production environments

## Questions?

Open a [Discussion](https://github.com/smitzlroy/aksarcdeployment/discussions) or reach out to maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
