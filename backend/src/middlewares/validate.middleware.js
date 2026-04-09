const validate = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error.details.map((item) => item.message),
    });
  }

  // 🔥 FIX HERE
  if (property === 'query') {
    Object.assign(req.query, value);
  } else if (property === 'params') {
    Object.assign(req.params, value);
  } else {
    req[property] = value;
  }

  next();
};

export default validate;