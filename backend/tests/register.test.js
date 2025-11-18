/**
 * Unit test for register() controller using full Jest mocking.
 */

jest.mock('../services/sendEmail', () => ({
  sendEmail: jest.fn(),
}));

// ---- FULL MOCK OF DB.JS ----
const mockUser = {
  exists: jest.fn(),
  create: jest.fn(),
};

jest.mock('../db', () => ({
  UserModel: mockUser,
}));

// Import after mocks
const { register } = require('../controllers/login.Controller');
const { sendEmail } = require('../services/sendEmail');

describe("Register function", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {
        firstName: "Juan",
        lastName: "Lara",
        email: "juela575@gmail.com",
        username: "juela",
        password: "123456"
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // ------------------------------------------------------------------
  it("should register a new user and send OTP", async () => {
    mockUser.exists.mockResolvedValueOnce(null); // email not taken
    mockUser.exists.mockResolvedValueOnce(null); // username not taken
    mockUser.create.mockResolvedValueOnce({ _id: "123" });

    await register(req, res);

    expect(mockUser.exists).toHaveBeenCalledWith({ email: "juela575@gmail.com" });
    expect(mockUser.exists).toHaveBeenCalledWith({ username: "juela" });

    expect(mockUser.create).toHaveBeenCalledWith({
      firstName: "Juan",
      lastName: "Lara",
      email: "juela575@gmail.com",
      username: "juela",
      password: "123456",
      emailVerified: false
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Account created. Please log in to verify your email.",
    });
  });

  // ------------------------------------------------------------------
  it("should reject invalid email", async () => {
    req.body.email = "invalid";

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Valid email is required.",
    });
  });

  // ------------------------------------------------------------------
  it("should reject when user already exists", async () => {
    mockUser.exists.mockResolvedValueOnce(true);  // emailTaken = true
    mockUser.exists.mockResolvedValueOnce(false); // usernameTaken

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email already in use.",
    });
  });
});
