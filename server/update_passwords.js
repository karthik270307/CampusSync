const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
mongoose.connect('mongodb://127.0.0.1:27017/campussync').then(async () => {
  const db = mongoose.connection.db;
  const hash = await bcrypt.hash('CampusSync@123', 10);
  await db.collection('users').updateMany({}, { $set: { password: hash } });
  console.log('Updated to', hash);
  process.exit(0);
});
