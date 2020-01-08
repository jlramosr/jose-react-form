/* eslint-disable */
import React, { useState } from "react";
import PropTypes from "prop-types";
import { Form, FormSpy, Field } from "react-final-form";
import { OnChange } from "react-final-form-listeners";
import Grid from "@material-ui/core/Grid";
import moment from "moment";
import get from "lodash/get";
import set from "lodash/set";
import FormElement from "./FormElement";
import {
  INVALID_DEFAULT_TEXT,
  INITIAL_DEFAULT_FORMAT,
  FORM_FORMAT,
  FINAL_DEFAULT_FORMAT
} from "./utils";

import { ApolloProvider } from "@apollo/react-hooks";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";

const cache = new InMemoryCache();
const link = new HttpLink({
  uri: "https://swapi-graphql.netlify.com/.netlify/functions/index"
});

const client = new ApolloClient({
  cache,
  link
});

export const submit = id => {
  // { cancelable: true } required for Firefox
  // https://github.com/facebook/react/issues/12639#issuecomment-382519193
  document
    .getElementById(id)
    .dispatchEvent(new Event("submit", { cancelable: true }));
};

export const reset = id => {
  console.log(document.getElementById(id));
  document.getElementById(id).reset();
};

const validationSatisfy = ({
  validationName,
  elemType,
  elemValue,
  comparisonValue
}) => {
  if (validationName === "required") {
    return Boolean(elemValue);
  }
  if (!elemValue) {
    return true;
  }
  switch (validationName) {
    case "email":
      if (elemType === "text") {
        return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          String(elemValue).toLowerCase()
        );
      }
      return true;
    case "limit":
      if (Array.isArray(elemValue) && elemValue.length > comparisonValue) {
        return false;
      }
      return true;
    case "max":
      if (elemType === "date") {
        return true; // TODO
      }
      return elemValue <= comparisonValue;
    case "min":
      if (elemType === "date") {
        return true; // TODO
      }
      return elemValue >= comparisonValue;
    case "noFuture":
      if (elemType === "date") {
        return true; // TODO
      }
      return true;
    case "noPast":
      if (elemType === "date") {
        return true; // TODO
      }
      return true;
    case "number":
    case "float":
      if (elemType === "text") {
        return !isNaN(elemValue);
      }
      return true;
    default:
      return true;
  }
};

const ElementListener = ({ when, is, set, to }) => (
  // No subscription. We only use Field to get to the change function
  <Field name={set} subscription={{}}>
    {({ input: { onChange } }) => (
      <FormSpy subscription={{}}>
        {({ form }) => (
          <OnChange name={when}>
            {value => {
              if (value === is) {
                onChange(to);
              }
            }}
          </OnChange>
        )}
      </FormSpy>
    )}
  </Field>
);

const DependencyConditions = props => {
  // requirements = [ { when, of, is } ]
  const {
    requirements,
    requirementIndex = 0,
    renderWhenTrue,
    renderWhenFalse
  } = props;
  const { when, of: _of, is } = requirements[requirementIndex];
  // console.log("REQUIREMENTS", requirements, requirementIndex);
  // console.log("when", when, "of", _of, "is", is);
  return (
    <Field name={_of} subscription={{ [when]: true }}>
      {({ input: { value } }) => {
        const shouldContinue = value === is;
        const nextRequirementIndex = requirementIndex + 1;
        // console.log(shouldContinue, value);
        if (requirements.length === nextRequirementIndex) {
          return shouldContinue ? renderWhenTrue : renderWhenFalse;
        }
        // console.log("continue", nextRequirementIndex);
        if (shouldContinue) {
          return (
            <DependencyConditions
              {...props}
              requirementIndex={nextRequirementIndex}
            />
          );
        }
        return renderWhenFalse;
      }}
    </Field>
  );
};

const ElementWithPropsDependencies = ({
  dependencies,
  index = 0,
  elementProps = {}
}) => {
  const { if: _if, then } = dependencies[index];
  const isLastCondition = index === dependencies.length - 1;
  const { when, of: _of, is } = _if[0];
  let accElementProps = { ...elementProps };
  return (
    <Field subscription={{ [when]: true }} name={_of}>
      {({ input: { value } }) => {
        if (value === is) {
          accElementProps = { ...elementProps, ...then };
        }
        if (isLastCondition) {
          return <FormElement {...accElementProps} />;
        }
        return (
          <ElementWithPropsDependencies
            dependencies={dependencies}
            index={index + 1}
            elementProps={accElementProps}
          />
        );
      }}
    </Field>
  );
};

const _Form = ({
  elements,
  id,
  onModify,
  onReset,
  onSubmit,
  submitOnlyModified
}) => {
  const keys = Object.keys(elements);

  // data from App to Form using "initialValue" property from each element (or default value that Form will use)
  const [initialValues] = useState(
    keys.reduce((acc, elemName) => {
      const { initialValue, multiple, options, type } = elements[elemName];
      if (initialValue) {
        let formValue =
          typeof initialValue === "object" && !Array.isArray(initialValue)
            ? get(initialValue, "value")
            : initialValue;
        const format = get(initialValue, "format");
        if (type === "date") {
          formValue = moment(
            formValue,
            format || INITIAL_DEFAULT_FORMAT.DATE
          ).format(
            FORM_FORMAT.DATE // debe coincidir con el formato puesto en Date.jsx
          );
        }
        if (type === "select") {
          if (multiple) {
            if (Array.isArray(initialValue)) {
              const initialOptions = options.filter(({ id }) =>
                initialValue.includes(id)
              );
              formValue = initialOptions.map(({ id, string }) => ({
                [FORM_FORMAT.SELECT.idPath]: id,
                [FORM_FORMAT.SELECT.stringPath]: string
              }));
            } else {
              formValue = [];
            }
          } else {
            const initialOption = options.find(({ id }) => id === initialValue);
            const initialOptionId = get(initialOption, "id");
            const initialOptionString = get(initialOption, "string");
            formValue = initialOptionId
              ? {
                  [FORM_FORMAT.SELECT.idPath]: initialOptionId,
                  [FORM_FORMAT.SELECT.stringPath]: initialOptionString
                }
              : null;
          }
        }
        if (type === "query") {
          if (multiple) {
            if (Array.isArray(initialValue)) {
              //TODO lo mismo de abajo pero con array
              formValue = [];
            } else {
              formValue = [];
            }
          } else {
            formValue = {
              [FORM_FORMAT.QUERY.idPath]: initialValue,
              [FORM_FORMAT.QUERY.stringPath]: "" //TODO obtener de la query obtenida unitaria con formValue = id
            };
          }
        }
        return { ...acc, [elemName]: formValue };
      }
      return acc;
    }, {})
  );

  // data from Form to API using "finalValue" property of each element or the own Form value if "finalValue" doesn't exist
  const _onSubmit = (values, formData) => {
    const setEmptyValue = type => {
      if (type === "switch" || type === "check") {
        return false;
      }
      return null;
    };

    const setValue = ({
      createItem,
      format,
      multiple,
      type,
      validations,
      value
    }) => {
      if (value) {
        if (type === "text" && get(validations, "number")) {
          return Number(value);
        }
        const numDecimals = get(validations, "float", 0);
        if (type === "text" && numDecimals) {
          const pow = Math.pow(10, numDecimals);
          return Math.round(parseFloat(value) * pow) / pow;
        }
        if (type === "date") {
          return moment(value, FORM_FORMAT.DATE).format(
            format || FINAL_DEFAULT_FORMAT.DATE
          );
        }
        if (type === "select") {
          if (multiple) {
            if (!value.length) return undefined;
            return value.map(option => option[FORM_FORMAT.SELECT.idPath]);
          } else {
            return value[FORM_FORMAT.SELECT.idPath];
          }
        }
        if (type === "query") {
          if (multiple) {
            if (!value.length) return undefined;
            return value.map(option => {
              const optionId = option[FORM_FORMAT.QUERY.idPath];
              return createItem && !optionId
                ? { create: option[FORM_FORMAT.QUERY.stringPath] }
                : option[FORM_FORMAT.QUERY.idPath];
            });
          } else {
            const optionId = value[FORM_FORMAT.QUERY.idPath];
            return createItem && !optionId
              ? { create: value[FORM_FORMAT.QUERY.stringPath] }
              : value[FORM_FORMAT.QUERY.idPath];
          }
        }
        return value;
      }
      return undefined;
    };

    const formState = formData.getState();
    const modifiedFields = formState.dirtyFields;

    const finalValues = keys.reduce((acc, elemName) => {
      const {
        createItem,
        finalValue: finalValueConfig,
        multiple,
        type,
        validations
      } = elements[elemName];
      if (get(finalValueConfig, "noSubmit")) {
        return acc;
      }
      if (submitOnlyModified && !get(modifiedFields, elemName)) {
        return acc;
      }
      const value =
        setValue({
          createItem,
          format: get(finalValueConfig, "format"),
          multiple,
          type,
          validations,
          value: values[elemName]
        }) || setEmptyValue(type);
      if (value === null && !submitOnlyModified) {
        // devuelvo los valores nulos si se supone que el formulario hace referencia a la creacion
        // de un item y no a un update (!submitOnlyModified). Si es un update, debo incluir los valores nulos
        return acc;
      }
      const path = get(finalValueConfig, "path");
      if (path) {
        return set(acc, path, value);
      }
      return { ...acc, [elemName]: value };
    }, {});

    onSubmit(finalValues, formState);
  };

  // validations from Form to API
  const validate = values =>
    keys.reduce((errors, elemName) => {
      const value = values[elemName];
      const element = elements[elemName];
      const { type } = element;

      // general validations of the 'type' property
      if (type === "date" && value && !moment(value).isValid()) {
        return {
          ...errors,
          [elemName]: INVALID_DEFAULT_TEXT.type("Date")
        };
      }

      // validations inside the property 'validations'
      const validations = get(element, "validations", {});

      const firstInvalidationName = Object.keys(validations).find(
        validationName =>
          !validationName.endsWith("Text") &&
          validations[validationName] &&
          !validationSatisfy({
            validationName,
            elemType: type,
            elemValue: value,
            comparisonValue: validations[validationName]
          })
      );

      if (firstInvalidationName) {
        return {
          ...errors,
          [elemName]:
            validations[`${firstInvalidationName}Text`] ||
            INVALID_DEFAULT_TEXT[firstInvalidationName](
              validations[firstInvalidationName]
            ) ||
            "Invalid value"
        };
      }
      return errors;
    }, {});

  /* form elements */
  const renderElements = () =>
    keys.map(elemName => {
      const {
        dependencies,
        grid,
        initialValue,
        finalValue,
        ...elementWithoutDependenciesAndInitialValueAndFinalValueAndGrid
      } = elements[elemName];
      const valueDependencies = get(dependencies, "value", []);
      const propsDependencies = get(dependencies, "props", []);
      return (
        <Grid key={`form-element-${elemName}`} item {...grid}>
          {/* listeners */}
          {valueDependencies.map(({ if: _if, then }) =>
            _if.map(({ when, is }, index) => (
              <ElementListener
                key={`listener-${elemName}-${index}`}
                when={when}
                is={is}
                set={elemName}
                to={then}
              />
            ))
          )}
          {/* element */}
          {propsDependencies && propsDependencies.length ? (
            <ElementWithPropsDependencies
              dependencies={propsDependencies}
              elementProps={{
                ...elementWithoutDependenciesAndInitialValueAndFinalValueAndGrid,
                name: elemName
              }}
            />
          ) : (
            <FormElement
              name={elemName}
              {...elementWithoutDependenciesAndInitialValueAndFinalValueAndGrid}
            />
          )}
        </Grid>
      );
    });

  return (
    <ApolloProvider client={client}>
      <Form
        debug={onModify ? onModify : null}
        initialValues={initialValues}
        onSubmit={_onSubmit}
        render={({ handleSubmit, form, values }) => {
          return (
            <form
              id={id}
              noValidate
              onReset={() => {
                form.reset();
                if (onReset) {
                  onReset();
                }
              }}
              onSubmit={handleSubmit}
            >
              <Grid container spacing={2}>
                {renderElements()}
              </Grid>
              <pre>{JSON.stringify(values, 0, 2)}</pre>
            </form>
          );
        }}
        validate={validate}
      />
    </ApolloProvider>
  );
};

_Form.defaultProps = {
  elements: [],
  onModify: null,
  onReset: null,
  submitOnlyModified: false
};

_Form.propTypes = {
  elements: PropTypes.object, // TODO
  id: PropTypes.string.isRequired,
  onModify: PropTypes.func,
  onReset: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  submitOnlyModified: PropTypes.bool
};

export default _Form;
