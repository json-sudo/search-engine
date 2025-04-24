# Search Engine

A React-based search engine implementation with comprehensive test coverage using Jest, Playwright, and Stryker.

## Tech Stack

- React 18
- TypeScript
- Webpack (bundler)
- TailwindCSS (styling)
- Jest (unit testing)
- Playwright (E2E testing)
- Stryker (mutation testing)

## Prerequisites

- Node.js (v16 or higher)
- Yarn package manager

## Setup

1. Clone the repository:
```bash
git clone https://github.com/json-sudo/search-engine.git
cd search-engine
```

2. Install dependencies:
```bash
yarn install
```

## Available Scripts

- `yarn start` - Starts the development server on port 1234
- `yarn build` - Creates a production build
- `yarn test` - Runs Playwright E2E tests
- `yarn test:report` - Shows the Playwright test report
- `yarn test:coverage` - Runs Jest unit tests with coverage report
- `yarn test:mutation` - Runs mutation tests using Stryker

## Development

The project uses Webpack for bundling. The development server will start at `http://localhost:1234`.

### Project Structure

```
search-engine/
├── src/
│   ├── components/     # React components
│   ├── App.tsx        # Main App component
│   └── index.tsx      # Entry point
├── tests/
│   ├── playwright/    # E2E tests
│   └── jest/          # Unit tests
├── webpack.config.js  # Webpack configuration
├── jest.config.js     # Jest configuration
├── playwright.config.ts # Playwright configuration
└── package.json
```

### Testing

The project includes three types of tests:

1. **Unit Tests** (Jest)
   - Located alongside components with `.test.tsx` extension
   - Run with `yarn test:coverage`
   - Coverage reports in `coverage/` directory

2. **E2E Tests** (Playwright)
   - Located in `tests/playwright/`
   - Run with `yarn test`
   - View reports with `yarn test:report`

3. **Mutation Tests** (Stryker)
   - Tests the quality of your test suite
   - Run with `yarn test:mutation`
   - Reports in `reports/mutation/`

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details. 