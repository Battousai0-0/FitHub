const sql = require("mssql/msnodesqlv8");

const config = {
    server: "BATTOUSAI\\MSSQLSERVER02",
    database: "FitHub",
    driver: "ODBC Driver 18 for SQL Server",

    options: {
        trustedConnection: true,
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log("Connected to SQL Server");
        return pool;
    })
    .catch(error => {
        console.error("Database connection failed:", error);
        throw error;
    });

module.exports = {
    sql,
    poolPromise
};