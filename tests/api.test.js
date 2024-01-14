const request = require("supertest");
const app = require("../index");

describe("POST /v1/batidas", () => {
    it("Morning clock-in", async () => {
        const response = await request(app).post("/v1/batidas").send({ momento: "2024-01-13T11:00:00.000Z" });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("dia");
        expect(response.body).toHaveProperty("pontos");
    });

    it("Clock-in (Wrong format)", async () => {
        const response = await request(app).post("/v1/batidas").send({ momento: "13/01/2024 08:00:00" });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("mensagem");
    });

    it("Clock-in (Existing datetime)", async () => {
        const response = await request(app).post("/v1/batidas").send({ momento: "2024-01-13T11:00:00.000Z" });

        expect(response.statusCode).toBe(409);
        expect(response.body).toHaveProperty("mensagem");
    });

    it("Lunch clock-out", async () => {
        const response = await request(app).post("/v1/batidas").send({ momento: "2024-01-13T16:00:00.000Z" });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("dia");
        expect(response.body).toHaveProperty("pontos");
    });

    it("After-lunch clock-in (Not enaugh lunch time)", async () => {
        const response = await request(app).post("/v1/batidas").send({ momento: "2024-01-13T16:30:00.000Z" });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("mensagem");
    });

    it("After-lunch clock-in", async () => {
        const response = await request(app).post("/v1/batidas").send({ momento: "2024-01-13T17:00:00.000Z" });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("dia");
        expect(response.body).toHaveProperty("pontos");
    });

    it("End-of-day clock-out", async () => {
        const response = await request(app).post("/v1/batidas").send({ momento: "2024-01-13T21:00:00.000Z" });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("dia");
        expect(response.body).toHaveProperty("pontos");
    });
});

describe("GET /v1/folhas-de-ponto/:anoMes", () => {
    it("Get a report for a year and month", async () => {
        const response = await request(app).get("/v1/folhas-de-ponto/2024-01");

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("anoMes");
        expect(response.body).toHaveProperty("horasTrabalhadas");
        expect(response.body).toHaveProperty("expedientes");
        expect(response.body.horasTrabalhadas).toEqual("PT9H");
        expect(response.body.horasExcedentes).toEqual("PT1H");
        expect(response.body.horasDevidas).toEqual("PT0S");
    });

    it("Attempt to get a report for a non-reported year and month", async () => {
        const response = await request(app).get("/v1/folhas-de-ponto/2024-02");

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("mensagem");
    });
});
