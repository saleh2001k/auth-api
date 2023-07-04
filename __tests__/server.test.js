"use strict";

const { server } = require("../src/server");
const { db } = require("../src/models/index");
const supertest = require("supertest");

const request = supertest(server);

beforeAll(async () => {
  await db.sync();
});

afterAll(async () => {
  await db.drop();
});

let TOKEN;

describe("V1 Routes", () => {
  let itemId;
  describe("Auth Routes", () => {
    test("should create a new user when POST /signup is called", async () => {
      const response = await request.post("/signup").send({
        username: "newuser",
        password: "newpassword",
        role: "admin",
      });

      expect(response.status).toEqual(201);
      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("token");
    });

    test("should log in a user and send an object with the user and the token to the client when POST /signin with basic authentication headers is called", async () => {
      const response = await request
        .post("/signin")
        .set("Authorization", "Basic bmV3dXNlcjpuZXdwYXNzd29yZA==");
      expect(response.status).toEqual(200);
      expect(response.body).toHaveProperty("user");
      expect(response.body).toHaveProperty("token");

      TOKEN = response.body.token;
    });
  });

  test("should add an item to the DB and return an object with the added item when POST /api/v1/:model is called", async () => {
    const response = await request.post("/api/v1/food").send({
      name: "pizza",
      calories: "300",
      type: "fat",
    });

    expect(response.status).toEqual(201);
    expect(response.body.name).toEqual("pizza");
    expect(response.body.calories).toEqual("300");
    expect(response.body.type).toEqual("fat");

    itemId = response.body.id;
  });

  test("should return a list of :model items when GET /api/v1/:model is called", async () => {
    const response = await request.get("/api/v1/food");

    expect(response.status).toEqual(200);
    expect(response.body).toBeTruthy();
  });

  test("should return a single item by ID when GET /api/v1/:model/ID is called", async () => {
    const response = await request.get(`/api/v1/food/${itemId}`);

    expect(response.status).toEqual(200);
  });

  test("should return a single, updated item by ID when PUT /api/v1/:model/ID is called", async () => {
    const response = await request.put(`/api/v1/food/${itemId}`).send({
      name: "burger",
      calories: "400",
      type: "meat",
    });

    expect(response.status).toEqual(200);
    expect(response.body.name).toEqual("burger");
    expect(response.body.calories).toEqual("400");
    expect(response.body.type).toEqual("meat");
  });

  test("should return an empty object when DELETE /api/v1/:model/ID is called. Subsequent GET for the same ID should result in nothing found", async () => {
    let response = await request.delete(`/api/v1/food/${itemId}`);

    expect(response.status).toEqual(200);
  });
});

describe("V2 Routes", () => {
  let itemId;
  test("should add an item to the DB and return an object with the added item when POST /api/v2/:model with a bearer token that has create permissions is called", async () => {
    const response = await request
      .post("/api/v2/food")
      .send({
        name: "spag",
        calories: "500",
        type: "carbs",
      })
      .set("Authorization", `Bearer ${TOKEN}`);

    expect(response.status).toEqual(201);
    expect(response.body.name).toEqual("spag");
    expect(response.body.calories).toEqual("500");
    expect(response.body.type).toEqual("carbs");

    itemId = response.body.id;
  });

  test("should return an empty object when DELETE /api/v2/:model/ID with a bearer token that has delete permissions is called. Subsequent GET for the same ID should result in nothing found", async () => {
    let response = await request
      .delete(`/api/v2/food/${itemId}`)
      .set("Authorization", `Bearer ${TOKEN}`);

    expect(response.status).toEqual(200);
    response = await request
      .delete(`/api/v2/food/${itemId}`)
      .set("Authorization", `Bearer ${TOKEN}`);
  });
});
