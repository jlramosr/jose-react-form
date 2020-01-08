import React from "react";
import ReactDOM from "react-dom";
import { GET_STARSHIPS } from "./Queries/Starships";
import { FORM_FORMAT } from "./Form/utils";
import Button from "@material-ui/core/Button";
import useForm from "./useForm";

function App() {
  const { formRender, formPristine, formSubmit, formReset } = useForm({
    elements: {
      firstName: {
        help: "Tu nombre",
        hidden: false,
        initialValue: "Jos",
        grid: { xs: 4 },
        label: "First Name",
        onChange: (value, previous) => {
          // siempre value y previous con el formato del campo dentro del control del formulario
          if (value === "Joser" && previous === "Jos") {
            return "Florentino";
          }
        },
        placeholder: "Indica tu nombre",
        readOnly: false,
        type: "text", // required
        validations: {
          required: true,
          requiredText: "este campo es obligatorio"
        }
      },
      lastName: {
        dependencies: {
          props: [
            // dependency 1
            {
              if: [
                { when: "value", of: "firstName", is: "Sergio" }, // dependencyCondition 1
                { when: "value", of: "age", is: "1" } // dependencyCondition 2
              ],
              then: { readOnly: true }
            },
            // dependency 2
            {
              if: [{ when: "value", of: "age", is: "0" }],
              then: { hidden: true }
            }
            // dependency 3
            /* {
                if: [{ when: "value", of: "age", is: "ocultar2" }],
                then: { hidden: true }
              } */
          ],
          value: [
            {
              if: [{ when: "firstName", is: "David" }],
              then: "Bisbal"
            },
            {
              if: [{ when: "firstName", is: "Florentino" }],
              then: "Pérez"
            }
          ]
        },
        finalValue: {
          noSubmit: true
        },
        help: "Tu apellido",
        hidden: false,
        initialValue: "Ramos",
        grid: { xs: 4 },
        label: "Last Name",
        placeholder: "Indica tu apellido",
        readOnly: false,
        type: "text", // required
        validations: {
          required: true,
          requiredText: "este campo es obligatorio"
        }
      },
      age: {
        dependencies: {
          value: [
            {
              if: [
                { when: "firstName", is: "Jose" },
                { when: "lastName", is: "Ramos" }
              ],
              then: 34
            }
          ]
        },
        help: "Tu Edad",
        hidden: false,
        initialValue: "",
        grid: { xs: 2 },
        label: "Edad",
        placeholder: "Indica tu edad",
        readOnly: false,
        type: "text", // required
        validations: { number: true, required: false, max: 40 }
      },
      height: {
        initialValue: "73.5",
        grid: { xs: 2 },
        label: "Peso",
        type: "text", // required
        validations: { float: 3, required: false, max: 150 }
      },
      description: {
        help: "Description",
        hidden: false,
        initialValue: "Mi Descripcion",
        grid: { xs: 12 },
        label: "Description",
        multiline: { rows: 3, maxRows: 8 },
        placeholder: "Indica una descripción",
        readOnly: false,
        type: "text", // required
        validations: { required: false }
      },
      man: {
        dependencies: {
          value: [
            {
              if: [{ when: "woman", is: true }],
              then: false
            }
          ]
        },
        help: "Is a man?",
        hidden: false,
        initialValue: true,
        grid: { xs: 3 },
        label: "Man",
        onChange: (value, previous) => {
          if (previous === true && value === false) {
            return true;
          }
        },
        readOnly: false,
        type: "check" // required
      },
      woman: {
        dependencies: {
          value: [
            {
              if: [{ when: "man", is: true }],
              then: false
            }
          ]
        },
        help: "Is a woman?",
        hidden: false,
        initialValue: false,
        grid: { xs: 3 },
        label: "Woman",
        onChange: (value, previous) => {
          if (previous === true && value === false) {
            return true;
          }
        },
        readOnly: false,
        type: "check" // required
      },
      retired: {
        help: "Is retired?",
        hidden: false,
        initialValue: true,
        grid: { xs: 3 },
        label: "Retired",
        readOnly: false,
        type: "switch" // required
      },
      date: {
        help: "Date de 2020",
        hidden: false,
        initialValue: {
          value: "25-12-2019T11:00:33.3213",
          format: "DD-MM-YYYYTHH:mm:ss.SSS" // required if the format of the date changes somewhere in the App and it is not equal than the Api format
        },
        grid: { xs: 6 },
        label: "Date",
        placeholder: "Es tu fecha de nacimiento",
        readOnly: false,
        type: "date", // required
        validations: {
          required: false,
          requiredText: "Fecha obligatoria!!",
          noPast: true,
          noPastText: "La fecha no puede ser inferior a hoy",
          noFuture: false,
          min: "2020-01-01",
          minText: "La fecha no puede ser inferior al 2020-01-01",
          max: "2020-12-31",
          maxText: "La fecha no puede ser superior al 2020-12-31"
        }
      },
      date2: {
        finalValue: {
          format: "YYYY-MM-DD"
        },
        help: "Date del futuro",
        hidden: false,
        grid: { xs: 6 },
        label: "Date",
        placeholder: "Indica una fecha de futuro",
        readOnly: false,
        type: "date", // required
        validations: {
          required: false,
          requiredText: "Fecha obligatoria!!",
          noPast: true,
          noPastText: "La fecha no puede ser inferior a hoy"
        }
      },
      email: {
        help: "Email",
        hidden: false,
        initialValue: "",
        grid: { xs: 6 },
        label: "Email",
        placeholder: "Indica un email",
        readOnly: false,
        type: "text", // required
        validations: { email: true, required: false }
      },
      company: {
        finalValue: {
          path: "company.id" // required if the key of the field is different in the submit process to the API
        },
        help: "Es tu empresa actual",
        hidden: false,
        initialValue: "568499asd",
        grid: { xs: 6 },
        label: "Empresa",
        multiple: false,
        onChange: (value, previous, options) => {
          if (value && value[FORM_FORMAT.SELECT.idPath] === "568494asd") {
            return options.find(({ id }) => id === "568499asd");
          }
        },
        options: [
          { id: "12rasf3r4", string: "Informa" },
          { id: "568499asd", string: "Cepsa" },
          { id: "568491asd", string: "Real Madrid" },
          { id: "568494asd", string: "Se volverá Cepsa" }
        ],
        placeholder: "Indica tu empresa",
        readOnly: false,
        type: "select", // required
        validations: { required: true }
      },
      companyAddress: {
        dependencies: {
          value: [
            {
              if: [{ when: "company", is: "" }],
              then: ""
            }
          ]
        },
        finalValue: {
          path: "company.address" // required if the key of the field is different in the submit process to the API
        },
        help: "La dirección de tu empresa",
        hidden: false,
        grid: { xs: 12 },
        label: "Dirección Empresa",
        placeholder: "Indica la dirección de tu empresa",
        readOnly: false,
        type: "text", // required
        validations: { required: false }
      },
      colors: {
        finalValue: {
          path: "colorIds" // required if the key of the field is different in the submit process to the API
        },
        help: "Colores preferidos",
        hidden: false,
        initialValue: ["12345", "12336"],
        grid: { xs: 12 },
        label: "Colores",
        multiple: true,
        onChange: (values, previous, options) => {
          if (
            values.find(option => option[FORM_FORMAT.SELECT.idPath] === "12345")
          ) {
            alert("INCLUYE EL AZULLLLL!!!!!");
          }
        },
        options: [
          { id: "12345", string: "Azul" },
          { id: "12346", string: "Blanco" },
          { id: "12347", string: "Gris" },
          { id: "12348", string: "Rojo" },
          { id: "12349", string: "Verde" },
          { id: "12316", string: "Amarillo" },
          { id: "12325", string: "Negro" },
          { id: "12336", string: "Naranja" }
        ],
        placeholder: "Indica tus colores preferidos",
        readOnly: false,
        type: "select", // required
        validations: { required: false, limit: 3 }
      },
      selfs: {
        createItem: true,
        closeOnSelect: true,
        finalValue: {
          path: "selfIds" // required if the key of the field is different in the submit process to the API
        },
        help: "Autónomos asociados",
        hidden: false,
        initialValue: "c3RhcnNoaXBzOjEw",
        grid: { xs: 12 },
        label: "Autónomos asociados",
        multiple: true,
        openOnFocus: true,
        onChange: (values, previous) => {
          if (
            values.find(option =>
              option[FORM_FORMAT.SELECT.stringPath].startsWith("CR90")
            )
          ) {
            alert("INCLUYE uno que empieza por CR90");
          }
        },
        placeholder: "Indica los autónomos con los que estás asociado",
        readOnly: false,
        request: {
          inputVariablePath: "searchText",
          operationName: "Search",
          query: GET_STARSHIPS,
          restVariables: { matching: "crazy" }
          // final variables = { ...restVariables, searchText: lo que haya en el input }
        },
        response: {
          /* estructura response obligatoria: {
            data: {
              [resultsPath]: {
                pageInfo: {
                  endCursor
                  hasNextPage
                }
                totalCount (opcional)
                edges: {
                  cursor
                  node {
                    [optionIdPath]: ...
                    ...rest // para generar optionString y optionRender si se quiere
                  }
                }
              }
            }
          } */
          resultsPath: "allStarships", // required
          optionIdPath: "id", // required: path para identificar una opcion despues de edges->node->
          optionSetString: ({ name }) => name, // required: texto de la opcion seleccionada en el input del select, y si no existe la opcion optionRender, el texto de la opcion del desplegable tambien
          optionRender: (
            { cargoCapacity, id, name },
            inputValue,
            setOptionHighlight
          ) => (
            <div>
              {setOptionHighlight(name, inputValue)} - {id} - {cargoCapacity}
            </div>
          ) //optional: renderizado de las opciones del desplegable
        },
        type: "query", // required
        validations: { required: false, limit: 5 }
      }
    },
    id: "exampleForm",
    onSubmit: (values, state) => {
      console.log("VALUES", JSON.stringify(values, 0, 1), "STATE", state);
    },
    submitOnlyModified: true
  });

  return (
    <>
      <Button onClick={formSubmit} type="submit">
        Save
      </Button>
      <Button disabled={formPristine} onClick={formReset} type="reset">
        Reset
      </Button>
      {formRender()}
    </>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
