import { useState, useEffect } from "react";
import { set, get, cloneDeep } from "lodash";

export type Form<T> = {
  /**
   * Object of validation errors by field.
   */
  errors: {
    [key in keyof T]: boolean;
  };
  /**
   * The current form values
   */
  values: T;

  /**
   * Set the value of any field. Supports deep properties
   */
  setValue: (key: keyof T, value: any) => void;

  /**
   * Check the validity of any field
   */
  isFieldValid: (key: keyof T) => boolean;

  /**
   * Check if a field is touched
   */
  isFieldTouched: (key: keyof T) => boolean;

  /**
   * Wheter the form has any erroneous fields
   */
  hasFormFieldError: boolean;

  /**
   * For use with mulitple step forms.
   * Returns the current active step.
   * 0 indexed
   */
  currentStep: number;
  /**
   * Function to move forward in a multi step form
   */
  nextStep: () => void;
  /**
   * Function to move to a certain step in a multi step form
   */
  setStep: (step: number) => void;
};

function generateFalsy<T>(obj: T) {
  const keys = Object.keys(obj) as Array<keyof T>;
  type Shape = {
    [key in keyof T]: boolean;
  };
  let temp: Shape = {} as Shape;
  keys.forEach((key) => (temp[key] = false));
  return temp;
}

export function useForm<
  T extends {
    [key: string]: any;
  }
>(options: {
  initialValues: T;
  validations?: Partial<
    {
      [key in keyof T]: (values: T) => boolean;
    }
  >;
  initialStep?: number;
}): Form<T> {
  const [step, setStep] = useState(options.initialStep ?? 0);
  const [values, setValues] = useState(options.initialValues);

  /**
   * Error and touch are only set for top level keys, not keys in nested objects.
   * TODO: handle error and touched on nested objects
   */
  const [touched, setTouched] = useState(generateFalsy(options.initialValues));
  const [errors, setErrors] = useState(generateFalsy(options.initialValues));

  /**
   * Revalidate values, and set errors, any time values change
   */
  useEffect(() => {
    const tempErrors = cloneDeep(errors);
    Object.keys(values).forEach((key) => {
      if (options.validations?.[key]) {
        const validation = get(options.validations, key);
        const hasError = !validation?.(values);
        set(tempErrors, key, hasError);
      }
    });
    setErrors(tempErrors);
  }, [values]); // eslint-disable-line

  /**
   * Update touched state whenever a input receives focus
   */
  useEffect(() => {
    const handleFocus = (e) => {
      const key = (e.target as HTMLElement).getAttribute("name");
      if (key) {
        const clone = cloneDeep(touched);
        setTouched(set(clone, key, true));
      }
    };
    /**
     * should concider using a ref, rather than the window
     */
    window.addEventListener("focusout", handleFocus);
    return () => {
      window.removeEventListener("focusout", handleFocus);
    };
  }, [touched]);

  /**
   * Update value based on name of input
   * Currently handles Readio Buttons
   */
  useEffect(() => {
    const handleInputChange = (e) => {
      const key = (e.target as HTMLElement).getAttribute("name");
      const value = e.target.value;
      const hasChanged = key ? value !== get(values, key) : undefined;
      if (
        key &&
        hasChanged &&
        ((e.type === "click" && e.target.localName === "input") ||
          e.type === "input")
      ) {
        setValue(key, value);
      }
    };

    window.addEventListener("click", handleInputChange);
    window.addEventListener("change", handleInputChange);

    return () => {
      window.removeEventListener("click", handleInputChange);
      window.removeEventListener("change", handleInputChange);
    };
  }, [values]); // eslint-disable-line

  const setValue = (key: keyof typeof options.initialValues, value: any) => {
    const clone = cloneDeep(values);
    setValues(set(clone, key, value));
  };
  const nextStep = () => setStep(step + 1);
  const isFieldValid = (key: keyof typeof options.initialValues) =>
    !errors[key];
  const isFieldTouched = (key: keyof typeof options.initialValues) =>
    touched[key];

  const hasFormFieldError = Object.entries(errors).reduce<boolean>(
    (hasError, current) => (hasError ? hasError : current[1]),
    false
  );

  return {
    currentStep: step,
    nextStep,
    setStep,
    errors,
    values,
    setValue,
    isFieldValid,
    isFieldTouched,
    hasFormFieldError,
  };
}
