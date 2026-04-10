import { openDatabase, resetDatabase } from './schema.js';

console.log('Resetting database...');
const db = openDatabase();
resetDatabase(db);
console.log('Database reset complete.');
db.close();
