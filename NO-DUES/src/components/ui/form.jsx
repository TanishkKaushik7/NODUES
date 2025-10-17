import * as React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
} from "react-hook-form";
import { cn } from "../../lib/utils";
import { Label } from "../../components/ui/label";

const Form = FormProvider;

const FormFieldContext = React.createContext({});
const FormItemContext = React.createContext({});

const FormField = (props) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error("useFormField should be used within FormFieldContext");
  }

  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

const FormItem = React.forwardRef(function FormItem({ className, ...props }, ref) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef(function FormLabel({ className, ...props }, ref) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

// Replacement for Slot component
const FormControl = React.forwardRef(function FormControl({ asChild = false, children, ...props }, ref) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  
  const ariaDescribedBy = !error
    ? `${formDescriptionId}`
    : `${formDescriptionId} ${formMessageId}`;

  if (asChild) {
    return React.cloneElement(React.Children.only(children), {
      ref,
      id: formItemId,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': !!error,
      ...props
    });
  }

  return (
    <div
      ref={ref}
      id={formItemId}
      aria-describedby={ariaDescribedBy}
      aria-invalid={!!error}
      {...props}
    >
      {children}
    </div>
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef(function FormDescription({ className, ...props }, ref) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef(function FormMessage({ className, children, ...props }, ref) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};