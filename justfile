# Install dependencies
install:
    pnpm install

# Start Storybook development server
dev:
    pnpm storybook

# Run unit/integration tests with coverage
test:
    pnpm vitest run --coverage

# Run E2E tests (requires Storybook running or webServer auto-start)
e2e:
    pnpm playwright test

# Lint all code
lint:
    pnpm eslint . && pnpm prettier --check .

# Type check
typecheck:
    pnpm tsc --noEmit

# Full CI suite — must pass before work is complete
check: lint typecheck test e2e

# Build the library output
build:
    pnpm build

# Storybook build (CI)
storybook-build:
    pnpm build-storybook

# Create a new changeset
changeset:
    pnpm changeset

# Apply pending changesets (bump versions + update changelogs)
version:
    pnpm changeset version

# Publish to npm (normally handled by CI)
publish:
    pnpm changeset publish
