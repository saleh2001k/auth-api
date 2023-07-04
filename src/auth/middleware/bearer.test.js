"use strict";

process.env.SECRET = "TEST_SECRET";

const bearer = require("./bearer");
const { db, users } = require("../../models/index");
const jwt = require("jsonwebtoken");

let userInfo = {
  admin: { userName: "admin", password: "password" },
};

beforeAll(async () => {
  await db.sync();
  await users.create(userInfo.admin);
});
afterAll(async () => {
  await db.drop();
});

describe("Auth Middleware", () => {
  const req = {};
  const res = {
    status: jest.fn(() => res),
    send: jest.fn(() => res),
    json: jest.fn(() => res),
  };
  const next = jest.fn();

  describe("user authentication", () => {
    it("fails a login for a user (admin) with an incorrect token", () => {
      req.headers = {
        authorization: "Bearer thisisabadtoken",
      };

      return bearer(req, res, next).then(() => {
        expect(next).not.toHaveBeenCalledWith();
      });
    });

    it("logs in a user with a proper token", () => {
      const user = { userName: "admin" };
      const token = jwt.sign(user, process.env.SECRET);

      req.headers = {
        authorization: `Bearer ${token}`,
      };

      return bearer(req, res, next).then(() => {
        expect(next).not.toHaveBeenCalledWith();
      });
    });
  });
});
