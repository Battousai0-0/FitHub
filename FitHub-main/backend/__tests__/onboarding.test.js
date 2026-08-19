jest.mock("../db", () => ({
    pool: { query: jest.fn() }
}));

const request = require("supertest");

const { pool } = require("../db");
const app = require("../server");

describe("PUT /api/onboarding/:userId", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("saves onboarding data and marks the user onboarded", async () => {
        pool.query.mockResolvedValueOnce([{}]);

        const res = await request(app)
            .put("/api/onboarding/1")
            .send({
                age: 27,
                weight: 70,
                height: 175,
                goal: "maintain"
            });

        expect(res.status).toBe(200);

        // Confirm the query set Onboarded = 1 and used the calorie defaults
        // since none were supplied in the request body.
        expect(pool.query).toHaveBeenCalledWith(
            expect.stringContaining("Onboarded = 1"),
            [27, 70, 175, "maintain", 2000, 600, 1]
        );
    });

    test("accepts a missing height (it's optional)", async () => {
        pool.query.mockResolvedValueOnce([{}]);

        const res = await request(app)
            .put("/api/onboarding/1")
            .send({ age: 27, weight: 70, goal: "lose" });

        expect(res.status).toBe(200);
        expect(pool.query).toHaveBeenCalledWith(
            expect.any(String),
            [27, 70, null, "lose", 2000, 600, 1]
        );
    });

    test("rejects a request missing age, weight or goal", async () => {
        const res = await request(app)
            .put("/api/onboarding/1")
            .send({ age: 27 });

        expect(res.status).toBe(400);
        expect(pool.query).not.toHaveBeenCalled();
    });

    test("rejects a non-numeric user id", async () => {
        const res = await request(app)
            .put("/api/onboarding/not-a-number")
            .send({ age: 27, weight: 70, goal: "maintain" });

        expect(res.status).toBe(400);
    });
});
