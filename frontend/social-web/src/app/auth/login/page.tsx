import React from "react";
import { InputField } from "@/components/input";
export default function Login() {
  return (
    <html lang='en' className='h-full bg-white items-center '>
      <div className='flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8'>
        <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
          <h2 className='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900'>
            Sign in to your account
          </h2>
        </div>

        <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
          <form className='space-y-6' action='#' method='POST'>
            <InputField
              label='Email address'
              type='email'
              id='email'
              name='email'
              autoComplete='email'
              required
            />
            <InputField
              label='Password'
              type='password'
              id='password'
              name='password'
              autoComplete='current-password'
              required
            />

            <button
              type='submit'
              className='flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>
              Sign in
            </button>
          </form>

          <p className='mt-10 text-center text-sm text-gray-500'>
            Not a member?{" "}
            <a
              href='/auth/register'
              className='font-semibold leading-6 text-indigo-600 hover:text-indigo-500'>
              Register now
            </a>
          </p>
        </div>
      </div>
    </html>
  );
}
