/**
 * tests/login.test.js
 *
 * Notes:
 * - All jest.mock(...) calls must come BEFORE requiring the controller/module under test.
 * - Any mocks referenced inside a jest.mock factory (like mockUser) must be declared first.
 */

///// ------------------------
///// Declare mocks first
///// ------------------------
const mockUser = {
  findOne: jest.fn(),
  updateOne: jest.fn(),
};

///// ------------------------
///// Mock modules that controller imports
///// ------------------------
jest.mock("../services/sendEmail", () => ({
  sendEmail: jest.fn(),
}));

jest.mock("../middleware/generateOTP", () => jest.fn());

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
}));

// mock the db module and return our mockUser object
jest.mock("../db", () => ({
  UserModel: mockUser,
}));

///// ------------------------
///// Now require the modules under test (after mocks)
///// ------------------------
const { login } = require("../controllers/login.Controller");
const { sendEmail } = require("../services/sendEmail");
const generateOTP = require("../middleware/generateOTP");
const bcrypt = require("bcryptjs");

///// ------------------------
///// Helper: req/res factory
///// ------------------------
function mockReqRes(body = {}) {
  const req = { body };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  return { req, res };
}

///// ------------------------
///// Tests
///// ------------------------
describe("Login function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reject missing credentials", async () => {
    const { req, res } = mockReqRes({ email: "", password: "" });

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email and password are required.",
    });
  });

  it("should reject invalid email", async () => {
    const { req, res } = mockReqRes({
      email: "INVALID",
      password: "1234",
    });

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Valid email is required.",
    });
  });

  
});
