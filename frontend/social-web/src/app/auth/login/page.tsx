"use client";
import React from "react";
import { InputField } from "@/components/input";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExistingUserRequest, existingUserRequest } from "shared-schema";
import { useMutation } from "@tanstack/react-query";
import { AppButton } from "@/components/button";
import { useRouter } from "next/navigation";

const login = async (data: ExistingUserRequest) => {
  const result = await fetch("http://localhost:3001/api/v1/auth/login/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!result || !result.ok) {
    throw new Error("Login failed");
  }

  return result;
};

export default function Login() {
  const router = useRouter();
  const { handleSubmit, control } = useForm<ExistingUserRequest>({
    resolver: zodResolver(existingUserRequest),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    mutationKey: ["login"],
    onError: (error) => {
      console.error("Login failed: ", error);
    },
    onSuccess: () => {
      console.log("Login successful");
      router.push("/");
    },
  });

  const onSubmit = (data: ExistingUserRequest) => {
    mutate(data);
  };

  return (
    <div className='flex min-h-full bg-white h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
          Sign in to your account
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className='mt-8 space-y-6'>
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

          <AppButton title={"Sign In"} type={"submit"} />
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
