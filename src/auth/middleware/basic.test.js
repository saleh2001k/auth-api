"use strict";

process.env.SECRET = "TEST_SECRET";

const base64 = require("base-64");
const middleware = require("./basic");
const { db, users } = require("../../models/index");

let userInfo = {
  admin: { userName: "admin-basic", password: "password" },
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
  };
  const next = jest.fn();

  describe("user authentication", () => {
    it("fails a login for a user (admin) with the incorrect basic credentials", () => {
      const basicAuthString = base64.encode("username:password");
      req.headers = {
        authorization: `Basic ${basicAuthString}`,
      };

      return middleware(req, res, next).then(() => {
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
      });
    });
    it("logs in an admin user with the right credentials", () => {
      let basicAuthString = base64.encode(
        `${userInfo.admin.userName}:${userInfo.admin.password}`
      );
      req.headers = {
        authorization: `Basic ${basicAuthString}`,
      };

      return middleware(req, res, next).then(() => {
        expect(next).not.toHaveBeenCalled();
      });
    });
  });
});
