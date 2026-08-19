let sql;
let poolPromise = Promise.resolve(null);

try {
    sql = require("mssql/msnodesqlv8");

    const config = {
        server: "BATTOUSAI\\MSSQLSERVER02",
        database: "FitHub",
        driver: "ODBC Driver 18 for SQL Server",
        options: {
            trustedConnection: true,
            trustServerCertificate: true,
            connectTimeout: 2000
        }
    };

    const connectionPromise = new sql.ConnectionPool(config).connect();
    
    // Timeout connection attempt after 2.5 seconds so backend starts instantly
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2500));

    poolPromise = Promise.race([connectionPromise, timeoutPromise])
        .then(pool => {
            if (pool) {
                console.log("Connected to SQL Server");
                return pool;
            } else {
                console.log("Running FitHub API with in-memory / local storage mode");
                return null;
            }
        })
        .catch(error => {
            console.warn("SQL Server connection unavailable, using local mode:", error.message);
            return null;
        });

} catch (err) {
    console.warn("mssql native driver not initialized, running in-memory mode:", err.message);
    poolPromise = Promise.resolve(null);
}

module.exports = {
    sql,
    poolPromise
};