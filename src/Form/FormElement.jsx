import React from "react";
import { Check, Date, Query, Select, Switch, Text } from "./FormElements";

const FormElement = ({
  hidden,
  type,
  ...elementWithoutGridAndInitialValueAndChangesAndConditionsAndType
}) => {
  if (hidden) {
    return null;
  }
  if (type === "text") {
    return (
      <Text
        {...elementWithoutGridAndInitialValueAndChangesAndConditionsAndType}
      />
    );
  }
  if (type === "switch") {
    return (
      <Switch
        {...elementWithoutGridAndInitialValueAndChangesAndConditionsAndType}
      />
    );
  }
  if (type === "check") {
    return (
      <Check
        {...elementWithoutGridAndInitialValueAndChangesAndConditionsAndType}
      />
    );
  }
  if (type === "date") {
    return (
      <Date
        {...elementWithoutGridAndInitialValueAndChangesAndConditionsAndType}
      />
    );
  }
  if (type === "select") {
    return (
      <Select
        {...elementWithoutGridAndInitialValueAndChangesAndConditionsAndType}
      />
    );
  }
  if (type === "query") {
    return (
      <Query
        {...elementWithoutGridAndInitialValueAndChangesAndConditionsAndType}
      />
    );
  }
  return <div>no</div>;
};

export default FormElement;
