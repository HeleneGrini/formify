import React, { ChangeEvent } from "react";
import { useForm } from "./useFrom";

interface Values {
  name: string;
  phoneNumber: string;
}
const Basic = () => {
  const form = useForm<Values>({
    initialValues: {
      name: "",
      phoneNumber: "",
    },
    validations: {
      /** Require field */
      name: (values) => !!values.name,
      /** Require phone number format */
      phoneNumber: (values) =>
        /(^(\+?-? *[0-9]+)([,0-9 ]*)([0-9])*$)/.test(values.phoneNumber),
    },
  });

  return (
    <form>
      <div>
        <label>First name</label>
        <input
          type="text"
          onChange={(e) => form.setValue("name", e.target.value)}
        />
        {!form.isFieldValid("name") ? (
          <div> Error: name must be provided </div>
        ) : null}
      </div>
      <div>
        <label>Phone number</label>
        <input
          type="text"
          onChange={(e) => form.setValue("phoneNumber", e.target.value)}
        />
        {!form.isFieldValid("name") ? (
          <div> Error: number is wrong format </div>
        ) : null}
      </div>
      <button disabled={form.hasFormFieldError}>Submit</button>
    </form>
  );
};
