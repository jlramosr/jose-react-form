import React from "react";
import { Field } from "react-final-form";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import Checkbox from "@material-ui/core/Checkbox";
import { commonErrorText } from "../utils";

const Check = ({ help, label, name, onChange, readOnly }) => {
  // The only thing a custom input needs to do to be compatible with React
  // Final Form is to accept a value prop and somehow call the onChange
  // callback to change the value.
  return (
    <Field name={name} type="bool">
      {/* todos los movimientos del campo por parte del usuario.
          meta.error es lo que viene del validate del Form para evitar hacer un submit con errores.
          Otra cosa es el manejo de errores del propio TextField para ver el campo marcado en rojo */}
      {({ input, meta }) => {
        const errorText = commonErrorText(meta);
        const helperText = errorText || help;

        const onChangeFeature = checked => {
          let newValue = checked;
          if (onChange) {
            let returnedValue = onChange(newValue, Boolean(input.value));
            if (typeof returnedValue === "boolean") {
              newValue = returnedValue;
            }
          }
          input.onChange(newValue);
        };

        return (
          <FormControl
            component="fieldset"
            fullWidth
            error={Boolean(errorText)}
          >
            <FormControlLabel
              control={
                <Checkbox
                  id={`form-checkbox-${name}`}
                  checked={Boolean(input.value)}
                  onChange={event => {
                    onChangeFeature(event.target.checked);
                  }}
                  value={name}
                  color="primary"
                />
              }
              disabled={readOnly}
              label={label}
              name={name}
            />
            <FormHelperText>{helperText}</FormHelperText>
          </FormControl>
        );
      }}
    </Field>
  );
};

export default Check;
