import "dotenv/config";
import express from "express";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";
import cors from "cors";

const app = express();


app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}
));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5001;



app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Authentication API is running"
    });
});



app.use("/api", authRoutes);


app.use(errorHandler);



const startServer = async () => {

    try {

        await connectDB();

        app.listen(PORT, () => {

            console.log(
                `Server running on Port ${PORT}`
            );

        });

    } catch (error) {

        console.error(
            "Server startup failed:",
            error.message
        );

        process.exit(1);

    }

};


startServer();