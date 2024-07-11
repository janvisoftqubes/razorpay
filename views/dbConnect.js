const mongoose = require("mongoose");
const dbConnect = async () => {
  try {
    mongoose.set("strictQuery", false);
    const connected = await mongoose.connect("mongodb+srv://d7511162:gFF8YmaQJMYSCw11@cluster0.t2kiw8c.mongodb.net/?retryWrites=true&w=majority");
    console.log(`Mongodb connected ${connected.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = dbConnect;
