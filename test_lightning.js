try {
  const native = require('lightningcss-darwin-x64');
  console.log('Successfully loaded lightningcss-darwin-x64');
  console.log('Methods:', Object.keys(native));
} catch (err) {
  console.error('Failed to load lightningcss-darwin-x64:', err.message);
  console.error('Stack:', err.stack);
}
