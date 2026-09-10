export const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      if (!schema) {
        return next();
      }

      const parsed = await schema.parseAsync(req[source]);
      if (source === 'query') {
        Object.defineProperty(req, 'query', {
          value: parsed,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      } else {
        req[source] = parsed;
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export default {
  validate,
};
