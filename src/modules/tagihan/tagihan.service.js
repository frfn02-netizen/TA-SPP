const tagihanQuery = require("./tagihan.query");
const AppError = require("../../utils/app-error");

const getAll = (user) => user.role === "ADMIN"
  ? tagihanQuery.getAll()
  : tagihanQuery.getByUserId(user.id);

const create = async (data) => {
  if (!(await tagihanQuery.siswaExists(data.siswaId))) throw new AppError("Siswa tidak ditemukan", 404);
  if (!(await tagihanQuery.tahunAjaranExists(data.tahunAjaranId))) throw new AppError("Tahun ajaran tidak ditemukan", 404);
  const id = await tagihanQuery.createTagihan(data);
  return { id, ...data, status: "BELUM_BAYAR" };
};

module.exports = { getAll, create };
