const mongoose = require('mongoose');

before(async function() {
  this.timeout(10000);
  await mongoose.connect(process.env.MONGO_TEST_URL || 'mongodb://127.0.0.1:27017/wanderlust-test');
});

after(async function() {
  await mongoose.connection.close();
});

afterEach(async function() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
