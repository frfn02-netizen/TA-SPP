const jwt=require("jsonwebtoken");

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET wajib diatur");
}

const generateToken=(payload)=>{

    return jwt.sign(

        payload,

        process.env.JWT_SECRET,

        {
            expiresIn:"7d"
        }

    );

};
module.exports = {
    generateToken
}
