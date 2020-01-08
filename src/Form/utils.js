// Formatos por defecto de los tipos de campo que vienen de la App y van al Form como initValue (pueden ser modificados con la propiedad 'format')
export const INITIAL_DEFAULT_FORMAT = {
  DATE: "DD-MM-YYYYTHH:mm:ss.SSS"
};

// Nuestro formulario, dependiendo de qué componentes utilicemos para
// implementar los distintos tipos de campos o simplemente de cómo los
// hayamos implementado nosotros, sabemos cómo guardan sus
// valores cuando se modifican por el usario. Estos son los DEFAULT formats
// que conocemos para determinados tipos de campos.
export const FORM_FORMAT = {
  DATE: "YYYY-MM-DDTHH:mm:ss.SSS",
  SELECT: { idPath: "id", stringPath: "string" }, // claves para el id (valor) y el string de las opciones
  QUERY: { idPath: "id", stringPath: "string" } // claves para el id (valor) y el string de las opciones
};

export const FINAL_DEFAULT_FORMAT = {
  DATE: "YYYY-MM-DDTHH:mm:ss.SSS"
};

export const INVALID_DEFAULT_TEXT = {
  email: () => "Invalid Email Format",
  max: value => `The value must be less than or equal to ${value}`,
  min: value => `The value must be greater than or equal to ${value}`,
  noFuture: () => `The value must be less than or equal to today's date`,
  noPast: () => `The value must be greater than or equal to today's date`,
  number: () => "The value must be a number",
  limit: value => `There must be no more than ${value} options selected`,
  required: () => "This field is required",
  type: type => `Invalid ${type} Format`
};

export const commonErrorText = meta => {
  if (meta.modified || meta.touched) {
    return meta.error || meta.submitError;
  }
  return null;
};
