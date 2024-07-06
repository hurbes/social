"use client";
import React from "react";
import { InputField } from "@/components/input";
import { Controller } from "react-hook-form";

import { AppButton } from "@/components/button";
import { useLoginForm } from "@/hooks/auth.hook";

export default function Login() {
  const { handleSubmit, control, isLoading } = useLoginForm();

  return (
    <div className='flex min-h-full bg-white h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
          Sign in to your account
        </h2>

        <form onSubmit={handleSubmit} className='mt-8 space-y-6'>
          <Controller
            name='email'
            control={control}
            defaultValue=''
            render={({ field, fieldState }) => (
              <InputField
                label='Email address'
                type='email'
                id='email'
                {...field}
                autoComplete='email'
                required
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name='password'
            control={control}
            defaultValue=''
            render={({ field, fieldState }) => (
              <InputField
                label='Password'
                type='password'
                id='password'
                {...field}
                autoComplete='current-password'
                required
                error={fieldState.error?.message}
              />
            )}
          />

          <AppButton title={"Sign In"} type={"submit"} isLoading={isLoading} />
        </form>

        <p className='mt-3 text-center text-sm text-gray-600'>
          Not a member?{" "}
          <a
            href='/auth/register'
            className='font-medium text-indigo-600 hover:text-indigo-500'>
            Register now
          </a>
        </p>
      </div>
    </div>
  );
}
