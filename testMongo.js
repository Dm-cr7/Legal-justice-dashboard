// testMongo.js
import mongoose from 'mongoose';

const uri = 'mongodb+srv://legaladmin:yourStrongPassword123@cluster0.1iwbrkr.mongodb.net/legal_dashboard?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ Connected to MongoDB Atlas successfully!");
  process.exit(0);
})
.catch((err) => {
  console.error("❌ MongoDB connection failed:", err.message);
  process.exit(1);
});
