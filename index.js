const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://localhost:27017/WanderLust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => { 
  try {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
      ...obj,
      owner: "6838476bf6ef9dc1338ad557",
    }));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
  } catch (e) {
    console.error("Validation Error:", e.message);
  }
};

initDB();