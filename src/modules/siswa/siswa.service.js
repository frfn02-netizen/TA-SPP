const siswaQuery = require("./siswa.query");

const getAll = async () => {
    return await siswaQuery.getAll();
}
const getById = async (id) => {
    const siswa = await siswaQuery.getById(id);

    if (!siswa) {
        throw new Error("Siswa not found");
    }
    return siswa;
}
module.exports = {
    getAll,
    getById
};