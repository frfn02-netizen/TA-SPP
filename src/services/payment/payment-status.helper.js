const mapStatus = (status) => {
    switch (status) {

        case "capture":
            return "SETTLEMENT";

        case "settlement":
            return "SETTLEMENT";

        case "pending":
            return "PENDING";

        case "deny":
            return "DENY";

        case "cancel":
            return "CANCEL";

        case "expire":
            return "EXPIRE";

        case "refund":
            return "REFUND";

        case "partial_refund":
            return "REFUND";

        case "chargeback":
            return "CHARGEBACK";

        default:
            return "PENDING";

    }
};

module.exports = mapStatus;