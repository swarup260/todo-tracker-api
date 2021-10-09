module.exports = {
    PORT : 3000 || process.env.PORT,
    // MONGODB_URI: "mongodb://localhost:27017/TodoAppV2?retryWrites=true",
    MONGODB_URI: "mongodb://mongo:27017/TodoAppV2?retryWrites=true", // Docker URI
    MONGODB_PORT : "27017",
    JWT_SECRET: "JWT_SECRET",
    JWT_EXPIRES : 60*60,
    SALT_ROUNDS : 10
}