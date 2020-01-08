import React from "react";
import { Field } from "react-final-form";
import TextField from "@material-ui/core/TextField";
import get from "lodash/get";
import { commonErrorText } from "../utils";

const Text = ({
  help,
  label,
  multiline,
  name,
  onChange,
  placeholder,
  readOnly,
  validations
}) => {
  let step = 1;
  const numDecimals = get(validations, "float", 0);
  if (numDecimals) {
    step = Math.pow(0.1, numDecimals);
  }

  const getType = () => {
    if (get(validations, "number") || numDecimals) {
      return "number";
    }
    if (get(validations, "email")) {
      return "email";
    }
    if (get(validations, "website")) {
      return "url";
    }
    return "text";
  };

  // The only thing a custom input needs to do to be compatible with React
  // Final Form is to accept a value prop and somehow call the onChange
  // callback to change the value.
  return (
    <Field name={name}>
      {/* todos los movimientos del campo por parte del usuario.
          meta.error es lo que viene del validate del Form para evitar hacer un submit con errores.
          Otra cosa es el manejo de errores del propio TextField para ver el campo marcado en rojo */}
      {({ input, meta }) => {
        const errorText = commonErrorText(meta);
        const helperText = errorText || help;

        const onChangeFeature = inputText => {
          let newValue = inputText;
          if (onChange) {
            let returnedValue = onChange(newValue, input.value);
            if (returnedValue) {
              newValue = returnedValue;
            }
          }
          input.onChange(newValue);
        };

        return (
          <TextField
            id={`form-text-${name}`}
            size="small"
            variant="outlined"
            name={name}
            label={label}
            placeholder={placeholder}
            // si no hay onChange como propiedad, mantenemos el comportamiento original
            value={input.value}
            onChange={event => {
              onChangeFeature(event.target.value);
            }}
            required={get(validations, "required", false)}
            error={Boolean(errorText)}
            helperText={helperText}
            disabled={readOnly}
            type={getType()}
            inputProps={{ step: numDecimals ? step : null }}
            fullWidth
            multiline={Boolean(multiline)}
            rows={get(multiline, "rows", 1)}
            rowsMax={get(multiline, "maxRows", get(multiline, "rows", 1))}
          />
        );
      }}
    </Field>
  );
};

export default Text;
