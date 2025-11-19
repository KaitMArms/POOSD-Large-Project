const request = require("supertest");

// mock the correct Users model
jest.mock("../models/Users", () => require("./mocks/Users.mock"));

// mock auth middleware
jest.mock("../middleware/requireAuth", () => require("./mocks/requireAuth.mock"));

jest.mock("../db", () => {
  function makeFakeModel() {
    return {
      // existing
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),

      // REQUIRED for addUserGame:
      exists: jest.fn(),
      findOneAndUpdate: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          userGames: [] // safe default
        })
      })
    };
  }

  const fakeModel = makeFakeModel();

  function makeFakeConnection() {
    return {
      models: {},
      model: jest.fn(() => fakeModel),
      asPromise: () => Promise.resolve()
    };
  }

  const fakeUserConnection = makeFakeConnection();
  const fakeGameConnection = makeFakeConnection();

  return {
    userConnection: fakeUserConnection,
    gameConnection: fakeGameConnection,
    connectionsReady: Promise.resolve(),

    // These are what globalGames.controller.js imports:
    UserModel: fakeModel,
    GameModel: fakeModel,

    // The rest you added:
    CounterModel: fakeModel,
    PlatformModel: fakeModel,
    GenreModel: fakeModel,
    FranchiseModel: fakeModel,
    CoverModel: fakeModel,
    AgeRatingModel: fakeModel,
    GameModeModel: fakeModel,
    GameTypeModel: fakeModel,
    LanguageModel: fakeModel,
    PerspectiveModel: fakeModel,
    ThemeModel: fakeModel,
    KeywordModel: fakeModel,
    ICompaniesModel: fakeModel,
    GameEngineModel: fakeModel,
    CollectionsModel: fakeModel,
  };
});




const app = require("../app");

const { __mockUser } = require("./mocks/Users.mock");



describe("POST /api/globalgames/add", () => {
  beforeEach(() => {
    // Reset mock user's array before every test
    __mockUser.userGames = [];
  });

  it("should add a new game (201)", async () => {
    const res = await request(app)
      .post("/api/globalgames/add")
      .send({ id: 10694, name: "Halo 2" });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Added game to user list.");
    expect(res.body.game).toMatchObject({
      id: 10694,
      name: "Halo 2",
      status: "to-play",
      isLiked: false
    });

    // Confirm the game was added in mock user
    expect(res.body.game).toMatchObject({
      id: 10694,
      name: "Halo 2"
    });

  });

  it("should return 409 if game already exists", async () => {
    // Pre-add game
    __mockUser.userGames.push({ id: 10694, name: "Halo 2" });

    const res = await request(app)
      .post("/api/globalgames/add")
      .send({ id: 10694, name: "Halo 2" });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Game already in user list.");
  });

  it("should return 400 if missing fields", async () => {
    const res = await request(app)
      .post("/api/globalgames/add")
      .send({ id: 10694 });

    expect(res.status).toBe(400);
  });

  it("should return 500 if the database fails", async () => {
    const { User } = require("./mocks/Users.mock");

    User.findById.mockRejectedValueOnce(new Error("DB fail"));

    const res = await request(app)
      .post("/api/globalgames/add")
      .send({ id: 123, name: "Test" });

    expect(res.status).toBe(500);
  });
});
