// listCollections.js
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error('MONGO_URI not set in environment variables (.env)');
const dbName = 'thehumantechblog';

async function main() {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(dbName);

    const [tags, categories, users] = await Promise.all([
      db
        .collection('tags')
        .find({}, { projection: { _id: 1, translations: 1 } })
        .toArray(),
      db
        .collection('categories')
        .find({}, { projection: { _id: 1, translations: 1 } })
        .toArray(),
      db
        .collection('users')
        .find({}, { projection: { _id: 1, name: 1, email: 1 } })
        .toArray(),
    ]);

    console.log('\n--- Tags ---');
    tags.forEach((tag) => {
      // Safe access
      const name = tag.translations?.en?.name || '(no name)';
      console.log(`${tag._id} | ${name}`);
    });

    console.log('\n--- Categories ---');
    categories.forEach((cat) => {
      const name = cat.translations?.en?.name || '(no name)';
      console.log(`${cat._id} | ${name}`);
    });

    console.log('\n--- Users ---');
    users.forEach((user) => console.log(`${user._id} | ${user.name} | ${user.email}`));
  } catch (err) {
    console.error('Erro:', err);
  } finally {
    await client.close();
  }
}

main();
