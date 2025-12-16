# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it privately:

1. **DO NOT** open a public issue
2. Email security details to the maintainers (see repository contact info)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

## Security Best Practices

This project follows these security practices:

- No secrets, API keys, or credentials committed to the repository
- Dependencies scanned with Dependabot and CodeQL
- Input validation on all user-provided data
- Principle of least privilege for Azure permissions
- Regular updates to address CVEs in dependencies

## Telemetry

By default, telemetry is **disabled**. If enabled by the user, only anonymized usage data is collected. No sensitive information (credentials, resource names, or personal data) is transmitted.

## Data Handling

- User inputs (workload specs, configurations) are processed locally
- Generated artifacts (Bicep, ARM, Terraform) contain only user-provided values
- No data is sent to external services without explicit user consent

## Responsible Disclosure

We appreciate responsible disclosure and will acknowledge your contribution in our security advisories (with your permission).
