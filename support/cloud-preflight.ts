export default function cloudPreflight(): void {
  const missing = ['LT_USERNAME', 'LT_ACCESS_KEY'].filter(key => !process.env[key]?.trim());
  if (missing.length) {
    throw new Error(`Cloud run requires ${missing.join(' and ')}. Copy .env.example to .env and fill them in. Run npm test for local testing.`);
  }
}
