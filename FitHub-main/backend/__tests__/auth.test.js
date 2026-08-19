jest.mock("../db", () => ({
    pool: { query: jest.fn() }
}));

const request = require("supertest");
const bcrypt = require("bcryptjs");

const { pool } = require("../db");
const app = require("../server");

describe("POST /api/auth/signup", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("creates a new account and returns 201", async () => {
        pool.query
            .mockResolvedValueOnce([[]])                 // duplicate email/username check -> none found
            .mockResolvedValueOnce([{ insertId: 42 }])    // INSERT INTO Users
            .mockResolvedValueOnce([{}]);                 // INSERT INTO Profiles

        const res = await request(app)
            .post("/api/auth/signup")
            .send({ username: "demo", email: "demo@test.com", password: "password1" });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
            userId: 42,
            username: "demo",
            email: "demo@test.com",
            onboarded: false
        });
    });

    test("rejects a request missing required fields", async () => {
        const res = await request(app)
            .post("/api/auth/signup")
            .send({ username: "demo" });

        expect(res.status).toBe(400);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test("rejects passwords shorter than 6 characters", async () => {
        const res = await request(app)
            .post("/api/auth/signup")
            .send({ username: "demo", email: "demo@test.com", password: "123" });

        expect(res.status).toBe(400);
    });

    test("rejects a duplicate email or username with 409", async () => {
        pool.query.mockResolvedValueOnce([[{ UserID: 1 }]]);

        const res = await request(app)
            .post("/api/auth/signup")
            .send({ username: "demo", email: "demo@test.com", password: "password1" });

        expect(res.status).toBe(409);
    });
});


describe("POST /api/auth/login", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("logs in successfully with correct credentials", async () => {
        const passwordHash = await bcrypt.hash("password1", 10);

        pool.query.mockResolvedValueOnce([[{
            UserID: 1,
            Username: "demo",
            Email: "demo@test.com",
            PasswordHash: passwordHash,
            Onboarded: 1
        }]]);

        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "demo@test.com", password: "password1" });

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            userId: 1,
            username: "demo",
            onboarded: true
        });
    });

    test("rejects an incorrect password with 401", async () => {
        const passwordHash = await bcrypt.hash("password1", 10);

        pool.query.mockResolvedValueOnce([[{
            UserID: 1,
            Username: "demo",
            Email: "demo@test.com",
            PasswordHash: passwordHash,
            Onboarded: 1
        }]]);

        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "demo@test.com", password: "wrong-password" });

        expect(res.status).toBe(401);
    });

    test("rejects an email that doesn't exist with 401", async () => {
        pool.query.mockResolvedValueOnce([[]]);

        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "nobody@test.com", password: "password1" });

        expect(res.status).toBe(401);
    });

    test("rejects a request missing email or password", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "demo@test.com" });

        expect(res.status).toBe(400);
    });
});
