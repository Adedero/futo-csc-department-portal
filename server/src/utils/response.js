const response = {
  send(res, details = {}) {
    return res.status(details.status).json(details.payload);
  },
  send200(res, payload = {}) {
    return res.status(200).json({
      success: true,
      info: payload.info ? payload.info : "Successful",
      message: payload.message ? payload.message : "",
      ...payload.data,
    });
  },
  //Errors
  send400(res, responseMessage = "") {
    return res.status(400).json({
      success: false,
      info: "Bad request",
      message: responseMessage,
    });
  },

  send401(res, responseMessage = "") {
    return res.status(401).json({
      success: false,
      info: "Unauthorized",
      message: responseMessage,
    });
  },

  send403(res, responseMessage = "") {
    return res.status(403).json({
      success: false,
      info: "Forbidden",
      message: responseMessage,
    });
  },

  send404(res, responseMessage = "") {
    return res.status(404).json({
      success: false,
      info: "Not found",
      message: responseMessage,
    });
  },
};

module.exports = response;
