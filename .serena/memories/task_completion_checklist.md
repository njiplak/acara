# Task Completion Checklist

When completing a coding task, ensure the following checks pass:

## PHP Changes
1. Run `composer lint` (Pint) to fix code style
2. Run `composer test:lint` to verify style passes
3. Run `php artisan test` if tests exist for the changed area

## TypeScript/React Changes
1. Run `bun run types` to check for type errors
2. Run `bun run lint` to fix ESLint issues
3. Run `bun run format` to format with Prettier

## Database Changes
1. Create proper migrations for schema changes
2. Update seeders if necessary
3. Run `php artisan migrate` to verify migration works

## Both
- Verify the app runs without errors (`composer dev`)
- If touching routes, ensure Wayfinder types are regenerated
