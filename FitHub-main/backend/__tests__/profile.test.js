jest.mock("../db", () => ({
    pool: { query: jest.fn() }
}));

const request = require("supertest");

const { pool } = require("../db");
const app = require("../server");

describe("GET /api/profile/:userId", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("returns the user's profile data", async () => {
        pool.query.mockResolvedValueOnce([[{
            UserID: 1,
            Username: "demo",
            Email: "demo@test.com",
            Age: 27,
            WeightKg: 70,
            HeightCm: 175,
            Goal: "maintain",
            DailyCalorieIntake: 2000,
            DailyCalorieBurn: 600,
            Onboarded: 1,
            ActivityCount: 0
        }]]);

        const res = await request(app).get("/api/profile/1");

        expect(res.status).toBe(200);
        expect(res.body.Username).toBe("demo");
        expect(res.body.Onboarded).toBe(1);
    });

    test("returns 404 when the user doesn't exist", async () => {
        pool.query.mockResolvedValueOnce([[]]);

        const res = await request(app).get("/api/profile/999");

        expect(res.status).toBe(404);
    });

    test("returns 400 for a non-numeric user id", async () => {
        const res = await request(app).get("/api/profile/abc");

        expect(res.status).toBe(400);
        expect(pool.query).not.toHaveBeenCalled();
    });
});


describe("PUT /api/profile/:userId", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("updates the profile and returns 200", async () => {
        pool.query.mockResolvedValueOnce([{}]);

        const res = await request(app)
            .put("/api/profile/1")
            .send({ age: 28, weight: 71, height: 175, goal: "gain" });

        expect(res.status).toBe(200);
        expect(pool.query).toHaveBeenCalledWith(
            expect.any(String),
            [28, 71, 175, "gain", 1]
        );
    });

    test("rejects a request missing age, weight or height", async () => {
        const res = await request(app)
            .put("/api/profile/1")
            .send({ age: 28 });

        expect(res.status).toBe(400);
        expect(pool.query).not.toHaveBeenCalled();
    });
});
