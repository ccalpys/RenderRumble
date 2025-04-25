// Script to automatically apply schema changes
import { execSync } from 'child_process';

try {
  console.log('Applying database schema changes...');
  // Use the --force flag to automatically apply all changes without asking
  const result = execSync('npx drizzle-kit push --force --config=./drizzle.config.ts', {
    stdio: 'inherit'
  });
  console.log('Schema changes applied successfully!');
} catch (error) {
  console.error('Error applying schema changes:', error.message);
  process.exit(1);
}