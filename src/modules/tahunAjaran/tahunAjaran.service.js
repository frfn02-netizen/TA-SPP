const tahunAjaranQuery = require("./tahunAjaran.query");

const getAll = async () => {
    return await tahunAjaranQuery.getAll();
};

const create = async (data) => {

    if (data.aktif) {
        await tahunAjaranQuery.deactivateAll();
    }

    const id = await tahunAjaranQuery.create(data);

    return {
        id,
        ...data
    };

};

const activate = async (id) => {

    await tahunAjaranQuery.deactivateAll();

    await tahunAjaranQuery.activate(id);

};

module.exports = {
    getAll,
    create,
    activate
};