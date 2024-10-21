import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const username = process.env.DB_USERNAME || '';
const password = process.env.DB_PASSWORD || '';
const clusterName = process.env.DB_CLUSTER || '';
const dbName = process.env.DB_NAME || '';


const CloudUrl = `mongodb+srv://${username}:${password}@${clusterName}/${dbName}?retryWrites=true&w=majority&appName=Cluster0`
const connectToDb = async () => {
    try {
        await mongoose.connect(CloudUrl,
            {

            });
        console.log("db Connecter successfully");
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}
export default connectToDb;