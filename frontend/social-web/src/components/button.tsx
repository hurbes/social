import { title } from "process";
import React from "react";

interface ButtonProps {
  onClick?: () => void;
  className?: string;
  isLoading?: boolean;
  title: string;
  type?: "button" | "submit" | "reset";
}

const AppButton: React.FC<ButtonProps> = ({
  onClick,
  className,
  isLoading = false,
  type = "button",
  title,
}) => {
  return (
    <button
      type={type}
      className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
      disabled={isLoading}>
      {isLoading ? (
        <svg
          className='animate-spin h-5 w-5 text-white'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'>
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'></circle>
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291l1.473-1.473A6.978 6.978 0 014 12H0c0 3.042 1.135 5.824 2.991 7.91l1.09-1.09z'></path>
        </svg>
      ) : (
        <span>{title}</span>
      )}
    </button>
  );
};

export { AppButton };
