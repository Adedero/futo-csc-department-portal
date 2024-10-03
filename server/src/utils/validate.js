const mongoose = require("mongoose");

function validateInput(res, params, paramName) {
  if (typeof params === "string" || typeof params === "number") {
    if (!params) {
      return res.status(400).json({
        success: false,
        info: "Bad request",
        message: `No ${paramName ? paramName : "value"} provided`,
      });
    }
  }

  if (Array.isArray(params)) {
    let missingParams = params.filter((param) => !param);

    if (missingParams.length > 0) {
      return res.status(400).json({
        success: false,
        info: "Bad request",
        message: `No ${missingParams.join(" or ")} provided`,
      });
    }
  }

  return null;
}

const validateObjectId = (res, id, name) => {
  if (!Array.isArray(id)) {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        info: "Bad request",
        message: name
          ? `The ${name} ID supplied is invalid`
          : "The ID supplied is invalid.",
      });
    }
  }

  if (Array.isArray(id)) {
    const stringIds = id.map((i) => i.toString());
    const isAllValid = stringIds.every((id) =>
      mongoose.Types.ObjectId.isValid(id),
    );
    if (!isAllValid) {
      return res.status(400).json({
        success: false,
        info: "Bad request",
        message: "One or more of the IDs supplied are invalid.",
      });
    }
  }

  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      info: "Bad request",
      message: "The ID supplied is invalid",
    });
  }

  return null;
};

module.exports = { validateInput, validateObjectId };
