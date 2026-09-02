import "dotenv/config";
import express from "express";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";

const app = express();

const PORT = process.env.PORT || 5001;

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));


app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Authentication API is running"
    });
});


app.get("/login", (req, res) => {
    res.render("login");
});


app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/dashboard", (req, res) => {
    res.render("dashboard");
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