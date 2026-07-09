const authQuery = require("./auth.query");
const { hashPassword, comparePassword } = require("../../utils/hash");
const {generateToken} = require("../../utils/jwt");

const register = async ({username, password, role}) => {
    const user = await authQuery.findByUsername(username);

    if (user) {
        throw new Error("Username already exists");
    }

    const hashedPassword = await hashPassword(password);

    const userId = await authQuery.createUser({
        username,
        password: hashedPassword,
        role,
    });

    return {
        id: userId,
        username,
        role,
    };
}

const login = async ({username, password}) => {
    const user = await authQuery.findByUsername(username);

    if (!user) {
        throw new Error("Invalid username or password");
    }
    const match = await comparePassword(password, user.password);

    if (!match) {
        throw new Error("Invalid username or password");
    }

    const token = generateToken({ id: user.id, username: user.username, role: user.role });

    return { token, 
        user: {
            id: user.id,
            username: user.username,
            role: user.role
        }
     };
}
module.exports = {
    register,
    login,
};