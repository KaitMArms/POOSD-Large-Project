const { UserModel, connectionsReady } = require('./db.js');

const testUserGames = [
    {
        id: 266733,
        name: "Final Fantasy VII Rebirth: Digital Deluxe Edition",
        status: 'completed',
        isLiked: true
    },
    {
        id: 2407,
        name: "Crisis Core: Final Fantasy VII",
        status: 'completed',
        isLiked: true
    },
    {
        id: 266734,
        name: "Final Fantasy VII Rebirth: Deluxe Edition",
        status: 'completed',
        isLiked: true
    },
    {
        id: 119374,
        name: "Final Fantasy VIII Remastered",
        status: 'completed',
        isLiked: true
    },
    {
        id: 207026,
        name: "Final Fantasy VII",
        status: 'completed',
        isLiked: true
    },
    {
        id: 115282,
        name: "Final Fantasy VIII Remastered",
        status: 'completed',
        isLiked: true
    },
    {
        id: 119374,
        name: "Tetris 99",
        status: 'completed',
        isLiked: true
    },
    {
        id: 2155,
        name: "Dark Souls",
        status: 'completed',
        isLiked: true
    },
    {
        id: 17000,
        name: "Stardew Valley",
        status: 'completed',
        isLiked: true
    },
    {
        id: 1879,
        name: "Terraria",
        status: 'completed',
        isLiked: true
    }
];

async function addUserWithGames(firstName, lastName, email, username, password, gamesToAdd) {
    try {
        const existingUser = await UserModel.findOne({ email: email });
        if (existingUser) {
            console.log(`User with email ${email} already exists. Skipping.`);
            return;
        }

        const newUser = new UserModel({
            firstName: firstName,
            lastName: lastName,
            email: email,
            username: username,
            password: password,
            userGames: gamesToAdd
        });

        await newUser.save();
        console.log(`User '${email}' created successfully with ${gamesToAdd.length} games.`);

    } catch (err) {
        console.error(`Error creating user '${email}':`, err.message);
    }
}

async function createTestUsers() {
    try {
        // 2. Wait for the connections from db.js to be ready
        await connectionsReady;

        console.log("--- Starting to create test users ---");

        await addUserWithGames('Gage', 'Lappin', 'GageLappin119@gmail.com','asdfads', 'password', testUserGames);

        await addUserWithGames('Hatunse', 'Aedo', 'HatunseAedo@gmail.com', 'JohnAedo', [
            { id: 3008, name: "Baldur's Gate 3", status: 'in-progress', isLiked: true }
        ]);

        await addUserWithGames('John', 'Miku Aedo', 'JognHatunseAedo@gmail.com', 'MikuAedo', []);

    } catch (error) {
        console.error("A critical error occurred during the user creation process:", error);
    } finally {
        // 3. Close the connections that db.js opened
        const { userConnection, gameConnection } = require('./db.js');
        await Promise.all([
            userConnection.close(),
            gameConnection.close()
        ]);
        console.log("\n--- Finished creating test users. All connections closed. ---");
    }
}
createTestUsers();