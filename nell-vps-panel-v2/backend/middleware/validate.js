/**
 * Joi validation middleware factory.
 * Usage: router.post('/x', validate(schema), handler)
 */
const { fail } = require('../utils/response');
module.exports = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
  if (error) return fail(res, 400, 'Validation failed', error.details.map(d => d.message));
  req[source] = value;
  next();
};
