import React, { createContext, Children, forwardRef, useContext } from "react";
import { Field } from "react-final-form";
//import Select from "react-select";
// import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import Autocomplete from "@material-ui/lab/Autocomplete";
import useStyles from "./Query.styles";
import get from "lodash/get";
import isEqual from "lodash/isEqual";
import { FixedSizeList } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import { FORM_FORMAT, commonErrorText } from "../utils";
import useQueryRequest from "../useQueryRequest";

const LISTBOX_PADDING = 8;

const setOptionHighlight = (optionString, inputValue) => {
  const matches = match(optionString, inputValue);
  const parts = parse(optionString, matches);
  return parts.map((part, index) => (
    <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
      {part.text}
    </span>
  ));
};

const OuterElementContext = createContext({});

const OuterElementType = forwardRef((props, ref) => {
  const outerProps = useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

const renderListItem = ({ data, index, style }) => {
  const listItemNode = data[index];
  const listItemStyle = {
    ...style,
    top: style.top + LISTBOX_PADDING
  };
  return <div style={listItemStyle}>{listItemNode}</div>;
};

const Query = ({
  closeOnSelect,
  createItem,
  help,
  label,
  multiple,
  name,
  onChange,
  openOnFocus,
  placeholder,
  readOnly,
  request: requestConfig,
  response: responseConfig,
  validations
}) => {
  const classes = useStyles();

  const {
    items,
    total,
    error,
    loading,
    loadMore,
    hasNextPage
  } = useQueryRequest({
    request: requestConfig,
    response: responseConfig
  });

  const itemsCount =
    // we know the exact number of results
    total ||
    // temporal count for infinite loader
    hasNextPage
      ? items.length + 1
      : items.length;
  const isOptionLoaded = index => !hasNextPage || index < items.length;

  const ListboxComponent = forwardRef((props, refListbox) => {
    const { children, ...other } = props;
    const itemData = Children.toArray(children);
    return (
      <div ref={refListbox}>
        <OuterElementContext.Provider value={other}>
          <InfiniteLoader
            isItemLoaded={isOptionLoaded}
            itemCount={itemsCount}
            loadMoreItems={loadMore}
          >
            {({ onItemsRendered, ref: refList }) => (
              <FixedSizeList
                ref={refList}
                itemData={itemData}
                onItemsRendered={onItemsRendered}
                height={200}
                width="100%"
                outerElementType={OuterElementType}
                itemCount={itemsCount}
                itemSize={35}
              >
                {renderListItem}
              </FixedSizeList>
            )}
          </InfiniteLoader>
        </OuterElementContext.Provider>
      </div>
    );
  });

  const { idPath, stringPath } = FORM_FORMAT.QUERY;
  // hacer que las opciones coincidan con el formato (id-string) indicado en utils
  const formattedOptions = items.map(item => {
    const { optionIdPath, optionSetString } = responseConfig;
    return {
      [idPath]: item[optionIdPath],
      [stringPath]: optionSetString(item)
    };
  });

  return (
    <Field
      name={name}
      isEqual={(a, b) =>
        multiple ? isEqual(a, b) : get(a, idPath) === get(b, idPath)
      }
    >
      {({ input, meta }) => {
        const errorText = commonErrorText(meta);
        const helperText = errorText || help;
        let value = input.value;
        if (!value && multiple) {
          value = [];
        }

        // devuelve el valor que cogerá onChange dependiendo de si está activa la opción de crear un nuevo item
        const createItemFeature = newValue => {
          console.log(
            "VALUE ONCHANGE",
            newValue,
            newValue.length ? newValue[newValue.length - 1] : null
          );
          if (createItem && !multiple && typeof newValue === "string") {
            // new custom value added (no multiple fields)
            return {
              [idPath]: null,
              [stringPath]: newValue
            };
          }
          if (
            createItem &&
            multiple &&
            newValue.length &&
            typeof newValue[newValue.length - 1] === "string"
          ) {
            // new custom value added (multiple fields)
            const optionAdded = newValue[newValue.length - 1];
            if (newValue.find(option => option[stringPath] === optionAdded)) {
              return input.value;
            }
            return [
              ...input.value,
              {
                [idPath]: null,
                [stringPath]: newValue[newValue.length - 1]
              }
            ];
          }
          // selectable option (added or removed)
          return newValue;
        };

        const onChangeFeature = newValue => {
          let _newValue = newValue;
          if (onChange) {
            let returnedValue = onChange(_newValue, input.value);
            if (returnedValue) {
              _newValue = returnedValue;
            }
          }
          input.onChange(_newValue);
        };

        //console.log("PARAMS", name, options, items, value);
        return (
          <Autocomplete
            freeSolo={createItem}
            getOptionSelected={(option, optionSelected) =>
              get(option, idPath, 1) === get(optionSelected, idPath, 2)
            }
            getOptionLabel={option =>
              // texto de la opcion seleccionada en el input
              get(option, stringPath, "")
            }
            filterSelectedOptions={multiple}
            disableCloseOnSelect={!closeOnSelect}
            disableOpenOnFocus={!openOnFocus}
            multiple={multiple}
            options={formattedOptions}
            disabled={readOnly}
            value={value}
            loading={loading}
            onChange={(event, newValue) => {
              const _newValue = createItemFeature(newValue);
              onChangeFeature(_newValue);
            }}
            id={`form-query-${name}`}
            ListboxComponent={ListboxComponent}
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
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  )
                }}
              />
            )}
            renderOption={(option, { inputValue }) => {
              const { optionRender } = responseConfig;
              if (optionRender) {
                const item = items.find(({ id }) => id === option.id);
                return optionRender(item, inputValue, setOptionHighlight);
              }
              return setOptionHighlight(option[stringPath], inputValue);
            }}
          />
        );
      }}
    </Field>
  );
};

export default Query;
