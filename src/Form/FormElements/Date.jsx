import React, { useState } from "react";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from "@material-ui/pickers";
import { Field } from "react-final-form";
import { get } from "lodash";
import { INVALID_DEFAULT_TEXT } from "../utils";

const DateField = ({
  help,
  label,
  name,
  onChange,
  placeholder,
  readOnly,
  validations
}) => {
  // The only thing a custom input needs to do to be compatible with React
  // Final Form is to accept a value prop and somehow call the onChange
  // callback to change the value.
  const [helperText, setHelperText] = useState(help);
  const [error, setError] = useState(false);

  return (
    <Field name={name}>
      {/* todos los movimientos del campo por parte del usuario.
          meta.error es lo que viene del validate del Form para evitar hacer un submit con errores.
          Hay muchas comprobaciones aqui que no son necesarias si se utiliza DatePicker. Si se utiliza
          KeyboardDatePicker si que son necesarias para la visualizacion de errores */}
      {({ input, meta }) => {
        const onChangeFeature = date => {
          let newValue = date;
          if (onChange) {
            let returnedValue = onChange(newValue, input.value);
            if (returnedValue) {
              newValue = returnedValue;
            }
          }
          input.onChange(newValue);
        };

        return (
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              id={`form-date-${name}`}
              onError={(errorText, currentDate) => {
                // manejamos el error y el helperText aqui
                if (!errorText) {
                  setError(false);
                  //setHelperText(help);
                  return;
                }
                if (!meta.modified) {
                  setError(false);
                  setHelperText(help);
                } else if (!currentDate) {
                  if (get(validations, "required", false)) {
                    setError(true);
                    setHelperText(get(validations, "requiredText", ""));
                  } else {
                    setError(false);
                    setHelperText(help);
                  }
                } else {
                  setError(true);
                  setHelperText(help);
                }
              }}
              invalidDateMessage={
                input.value ? INVALID_DEFAULT_TEXT.DATE_FORMAT : helperText
              }
              maxDateMessage={get(
                validations,
                "maxText",
                get(
                  validations,
                  "noFutureText",
                  "Date should not be after max date"
                )
              )}
              minDateMessage={get(
                validations,
                "minText",
                get(
                  validations,
                  "noPastText",
                  "Date should not be before minimal date"
                )
              )}
              size="small"
              inputVariant="outlined"
              {...(!error ? { helperText } : {})}
              error={error}
              disableFuture={get(validations, "noFuture", false)}
              disablePast={get(validations, "noPast", false)}
              maxDate={new Date(get(validations, "max", "2100-01-01"))}
              minDate={new Date(get(validations, "min", "1900-01-01"))}
              required={get(validations, "required", false)}
              name={name}
              label={label}
              placeholder={placeholder}
              value={input.value}
              onChange={onChangeFeature}
              disabled={readOnly}
              styles={{ width: "100%" }} //TODO fullWIdth!!
              autoOk
              format="dd/MM/yyyy"
              margin="normal"
              InputLabelProps={{
                shrink: Boolean(input.value)
              }}
            />
          </MuiPickersUtilsProvider>
        );
      }}
    </Field>
  );
};

export default DateField;
