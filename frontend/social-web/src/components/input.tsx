import React from "react";

interface InputFieldProps {
  label: string;
  type: string;
  id: string;
  name: string;
  autoComplete: string;
  required: boolean;
  placeholder?: string;
  className?: string;
  suffix?: () => JSX.Element;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  id,
  name,
  autoComplete,
  placeholder,
  className,
  required,
}: InputFieldProps) => {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className='block text-sm font-medium leading-6 text-gray-900'>
        {label}
      </label>
      <div className='mt-2'>
        <input
          placeholder={placeholder}
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required
          className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
        />
      </div>
    </div>
  );
};
