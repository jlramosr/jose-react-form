import React from "react";
import { Field } from "react-final-form";
//import Select from "react-select";
// import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Autocomplete from "@material-ui/lab/Autocomplete";
import useStyles from "./Select.styles";
import get from "lodash/get";
import isEqual from "lodash/isEqual";
import { FORM_FORMAT, commonErrorText } from "../utils";

const Select = ({
  help,
  label,
  multiple,
  name,
  onChange,
  options,
  placeholder,
  readOnly,
  validations
}) => {
  const classes = useStyles();
  const { idPath, stringPath } = FORM_FORMAT.SELECT;

  // The only thing a custom input needs to do to be compatible with React
  // Final Form is to accept a value prop and somehow call the onChange
  // callback to change the value.
  return (
    <Field
      name={name}
      isEqual={(a, b) =>
        multiple ? isEqual(a, b) : get(a, idPath) === get(b, idPath)
      }
    >
      {/* todos los movimientos del campo por parte del usuario.
          meta.error es lo que viene del validate del Form para evitar hacer un submit con errores.
          Otra cosa es el manejo de errores del propio TextField para ver el campo marcado en rojo */}
      {({ input, meta }) => {
        const errorText = commonErrorText(meta);
        const helperText = errorText || help;
        // hacer que las opciones coincidan con el formato (id-string) indicado en utils
        const formattedOptions = options.map(({ id, string }) => ({
          [idPath]: id,
          [stringPath]: string
        }));
        let value = input.value;
        if (!value && multiple) {
          value = [];
        }

        const onChangeFeature = newValue => {
          let _newValue = newValue;
          if (onChange) {
            let returnedValue = onChange(
              _newValue,
              input.value,
              formattedOptions
            );
            if (returnedValue) {
              _newValue = returnedValue;
            }
          }
          input.onChange(_newValue);
        };

        return (
          <Autocomplete
            getOptionSelected={(option, optionSelected) =>
              get(option, idPath, 1) === get(optionSelected, idPath, 2)
            }
            filterSelectedOptions={multiple}
            id={`form-select-${name}`}
            disableCloseOnSelect={multiple}
            multiple={multiple}
            options={formattedOptions}
            disabled={readOnly}
            getOptionLabel={option => get(option, "string", "")}
            value={value}
            onChange={(event, newValue) => {
              // https://reactjs.org/docs/events.html#event-pooling
              onChangeFeature(newValue);
            }}
            renderInput={params => (
              <TextField
                {...params}
                helperText={helperText}
                size="small"
                required={get(validations, "required")}
                placeholder={placeholder}
                label={label}
                variant="outlined"
                fullWidth
                error={Boolean(errorText)}
              />
            )}
            renderOption={option => <Typography>{option.string}</Typography>}
          />
        );
      }}
    </Field>
  );
};

export default Select;
