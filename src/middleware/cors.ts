import cors from "cors";

const allowedOrigins = [
    "http://localhost:3000",
    "https://portiqai.vercel.app"
];

export const corsOptions: cors.CorsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS not allowed"));
        }
    },
    credentials: true
};

export const corsMiddleware = cors(corsOptions);