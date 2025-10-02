import Joi from 'joi';

// Esquemas de validación para autenticación
export const loginSchema = Joi.object({
  username: Joi.string().min(3).max(100).required().messages({
    'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
    'string.max': 'El nombre de usuario no puede tener más de 100 caracteres',
    'any.required': 'El nombre de usuario es requerido'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'La contraseña debe tener al menos 6 caracteres',
    'any.required': 'La contraseña es requerida'
  }),

});

// 🗑️ ELIMINADO: registerSchema - Ya no se permite registro público
// Los usuarios solo pueden ser creados por administradores desde el panel admin

export const passwordRecoverySchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'El email debe tener un formato válido',
    'any.required': 'El email es requerido'
  })
});

// Esquemas de validación para gastos
export const createGastoSchema = Joi.object({
  fecha: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    'string.pattern.base': 'La fecha debe tener formato YYYY-MM-DD',
    'any.required': 'La fecha es requerida'
  }),
  categoria: Joi.string().min(1).max(50).required().messages({
    'string.min': 'La categoría es requerida',
    'string.max': 'La categoría no puede tener más de 50 caracteres',
    'any.required': 'La categoría es requerida'
  }),
  subcategoria: Joi.string().max(50).optional().allow('').messages({
    'string.max': 'La subcategoría no puede tener más de 50 caracteres'
  }),
  monto: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'El monto debe ser mayor a 0',
    'any.required': 'El monto es requerido'
  }),
  descripcion: Joi.string().max(255).required().messages({
    'string.max': 'La descripción no puede tener más de 255 caracteres',
    'any.required': 'La descripción es requerida'
  })
});

export const updateGastoSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.positive': 'El ID debe ser un número positivo',
    'any.required': 'El ID es requerido'
  }),
  fecha: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  categoria: Joi.string().min(1).max(50).required(),
  subcategoria: Joi.string().max(50).optional().allow(''),
  monto: Joi.number().positive().precision(2).required(),
  descripcion: Joi.string().max(255).required()
});

// Esquemas de validación para transacciones de quiniela
export const createTransaccionQuinielaSchema = Joi.object({
  fecha: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    'string.pattern.base': 'La fecha debe tener formato YYYY-MM-DD',
    'any.required': 'La fecha es requerida'
  }),
  juego: Joi.string().min(1).max(50).required().messages({
    'string.min': 'El juego es requerido',
    'string.max': 'El juego no puede tener más de 50 caracteres',
    'any.required': 'El juego es requerido'
  }),
  monto: Joi.number().precision(2).required().messages({
    'number.base': 'El monto debe ser un número válido',
    'any.required': 'El monto es requerido'
  }),
  tipo: Joi.string().valid('ingreso', 'egreso').required().messages({
    'any.only': 'El tipo debe ser "ingreso" o "egreso"',
    'any.required': 'El tipo es requerido'
  }),
  descripcion: Joi.string().max(255).optional().allow('').messages({
    'string.max': 'La descripción no puede tener más de 255 caracteres'
  })
});

export const updateTransaccionQuinielaSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  fecha: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  juego: Joi.string().min(1).max(50).required(),
  monto: Joi.number().precision(2).required(),
  tipo: Joi.string().valid('ingreso', 'egreso').required(),
  descripcion: Joi.string().max(255).optional().allow('')
});

// Esquemas de validación para parámetros de URL
export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.positive': 'El ID debe ser un número positivo',
    'any.required': 'El ID es requerido'
  })
});

export const fechaParamSchema = Joi.object({
  fecha: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    'string.pattern.base': 'La fecha debe tener formato YYYY-MM-DD',
    'any.required': 'La fecha es requerida'
  })
});

// Función helper para validar datos
export const validateData = (schema: Joi.ObjectSchema, data: any) => {
  const { error, value } = schema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    throw { 
      name: 'ValidationError', 
      message: 'Datos de entrada inválidos',
      errors 
    };
  }
  
  return value;
};