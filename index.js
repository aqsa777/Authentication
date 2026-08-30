import "dotenv/config";
import express from "express";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";


const app = express();


const PORT =
    process.env.PORT || 5001;


app.use(express.json());

app.use(errorHandler)


app.get("/", (req, res) => {

    res.status(200).json({

        success: true,

        message:
            "Authentication API is running"

    });

});


app.use(
    "/api",
    authRoutes
);


const startServer = async () => {

    try {

        await connectDB();


        app.listen(
            PORT,
            () => {

                console.log(
                    `Server running on Port ${PORT}`
                );

            }
        );

    } catch (error) {

        console.error(
            "Server startup Failed:",
            error.message
        );

        process.exit(1);
    }
};


startServer();