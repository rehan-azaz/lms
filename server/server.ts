require("dotenv").config();
import { app } from "./app";
import { connectDB } from "./config/db";

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
    connectDB();
});
