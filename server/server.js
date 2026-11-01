require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:3000"
}));

app.use(express.json());

// Welcome route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to The Chai Adda API!"
    });
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "The Chai Adda backend is running!"
    });
});

// Start server after database connection
const startServer = async () => {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(
            `The Chai Adda server running on port ${PORT}`
        );
    });
};

startServer();
