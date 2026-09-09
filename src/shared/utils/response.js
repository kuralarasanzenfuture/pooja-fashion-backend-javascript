export const sendResponse = (
  res,
  statusCode = 200,
  { success = true, message, data, meta } = {}
) => {
  const responsePayload = {
    success,
    message,
    ...(data !== undefined ? { data } : {}),
    ...(meta !== undefined ? { meta } : {}),
  };
  return res.status(statusCode).json(responsePayload);
};

export const sendSuccess = (res, data, message = 'Success', statusCode = 200, meta) => {
  return sendResponse(res, statusCode, { success: true, message, data, meta });
};

export const sendCreated = (res, data, message = 'Resource created successfully') => {
  return sendResponse(res, 201, { success: true, message, data });
};

export const sendNoContent = (res) => {
  return res.status(204).send();
};

export default {
  sendResponse,
  sendSuccess,
  sendCreated,
  sendNoContent,
};
