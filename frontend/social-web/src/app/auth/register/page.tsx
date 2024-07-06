import { AppButton } from "@/components/button";
import { InputField } from "@/components/input";
import { useRegistrationForm } from "@/hooks/auth.hook";
import React from "react";
import { Controller } from "react-hook-form";

export default function Registration() {
  const { handleSubmit, control, isLoading } = useRegistrationForm();

  return (
    <div className='flex flex-1 flex-col h-screen bg-white justify-center px-6 py-12 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-sm'>
        <h2 className='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900'>
          Sign in to your account
        </h2>
      </div>

      <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
        <form className='space-y-6' onSubmit={handleSubmit}>
          <Controller
            name='name'
            control={control}
            defaultValue=''
            render={({ field, fieldState }) => (
              <InputField
                label='Name'
                type='text'
                id='name'
                {...field}
                autoComplete='name'
                required
                error={fieldState.error?.message}
              />
            )}
          />
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
          <Controller
            name='confirmPassword'
            control={control}
            defaultValue=''
            render={({ field, fieldState }) => (
              <InputField
                label='Confirm Password'
                type='password'
                id='confirmPassword'
                {...field}
                autoComplete='current-password'
                required
                error={fieldState.error?.message}
              />
            )}
          />

          <AppButton title={"Sign Up"} type={"submit"} isLoading={isLoading} />
        </form>

        <p className='mt-10 text-center text-sm text-gray-500'>
          Already a member?{" "}
          <a
            href='/auth/login'
            className='font-semibold leading-6 text-indigo-600 hover:text-indigo-500'>
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
