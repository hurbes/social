import { cn } from "@/libs/util";
import React from "react";

interface InputFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  error,
  className,
  ...props
}) => {
  return (
    <div className={cn(className, { "mb-2": error })}>
      <label
        htmlFor={id}
        className='block text-sm font-medium text-gray-900 mb-2'>
        {label}
      </label>
      <textarea
        id={id}
        {...props}
        className={cn(
          "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
          {
            "border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500":
              error,
            "border-gray-300": !error,
          }
        )}
      />
      {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
    </div>
  );
};
