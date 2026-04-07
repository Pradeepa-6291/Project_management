const errorMiddleware = (err, _req, res, _next) => {
  console.error(err);
  let status = err.statusCode || err.status || 500;
  let message = err.message || "Internal server error";
  if (err.name === "MulterError" || err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: err.message || "File upload error" });
  }
  if (err.name === "CastError" || err.name === "ValidationError") {
    status = 400;
    message = err.message;
  }
  res.status(status).json({ message });
};

module.exports = errorMiddleware;
