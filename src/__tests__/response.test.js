const { sendSuccess, sendError } = require('../utils/response');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Response Utility', () => {
  describe('sendSuccess', () => {
    it('should return 200 with default values', () => {
      const res = mockRes();
      sendSuccess(res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        statusCode: 200,
        message: 'Success',
        data: {},
      });
    });

    it('should return the provided statusCode, message and data', () => {
      const res = mockRes();
      sendSuccess(res, { id: 1 }, 201, 'Created');

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        statusCode: 201,
        message: 'Created',
        data: { id: 1 },
      });
    });
  });

  describe('sendError', () => {
    it('should return 500 with default values', () => {
      const res = mockRes();
      sendError(res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        statusCode: 500,
        message: 'An error occurred',
        data: {},
      });
    });

    it('should return the provided statusCode and message', () => {
      const res = mockRes();
      sendError(res, 'Not found', 404);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        statusCode: 404,
        message: 'Not found',
        data: {},
      });
    });
  });
});
