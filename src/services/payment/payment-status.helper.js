const mapStatus = (status, fraudStatus) => {
    switch (status) {

        case "capture":
            return fraudStatus === "accept"
                ? "SETTLEMENT"
                : "PENDING";

        case "settlement":
            return "SETTLEMENT";

        case "pending":
            return "PENDING";

        case "expire":
            return "EXPIRE";

        case "deny":
        case "cancel":
        case "refund":
        case "partial_refund":
        case "chargeback":
            return "CANCEL";

        default:
            return "PENDING";

    }
};

module.exports = mapStatus;
