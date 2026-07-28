const mapStatus = (status) => {
  switch (status) {
    case "settlement":
      return "SETTLEMENT";

    case "pending":
      return "PENDING";

    case "expire":
      return "EXPIRE";

    case "cancel":
      return "CANCEL";

    default:
      return "PENDING";
  }
};

module.exports = mapStatus;