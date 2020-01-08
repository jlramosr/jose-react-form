import React, { useState } from "react";
import Form, { reset, submit } from "./Form/Form";

const useForm = ({ id, ...rest }) => {
  const [pristine, setPristine] = useState(true);

  const onModify = state => {
    if (pristine !== state.pristine) {
      console.log("limpio cambiado de", pristine, "a", state.pristine);
      setPristine(state.pristine);
    }
  };

  return {
    formRender: () => <Form id={id} onModify={onModify} {...rest} />,
    formPristine: pristine,
    formSubmit: () => submit(id),
    formReset: () => reset(id)
  };
};

export default useForm;
