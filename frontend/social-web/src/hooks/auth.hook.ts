"use client";
import { useForm } from "react-hook-form";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateUserRequest,
  createUserSchema,
  ExistingUserRequest,
  existingUserRequest,
  UserResponse,
} from "shared-schema"; // Adjust the import path as necessary
import { createAPIMethods } from "@/libs/api";
import { useMutation, useQuery } from "@tanstack/react-query";

const fetchLogin = (body: ExistingUserRequest) =>
  createAPIMethods<ExistingUserRequest, ExistingUserRequest>({
    url: "http://localhost:3001/api/v1/auth/login/",
    method: "POST",
    body,
  });

const fetchRegister = (body: CreateUserRequest) =>
  createAPIMethods<CreateUserRequest, ExistingUserRequest>({
    url: "http://localhost:3001/api/v1/auth/register/",
    method: "POST",
    body,
  });

const useUser = () => {
  const { data, isLoading } = useQuery<UserResponse>({
    queryKey: ["login"],
    networkMode: "offlineFirst",
  });

  return { user: data, isLoading };
};

const useLoginForm = () => {
  const router = useRouter();

  const { handleSubmit, control } = useForm<ExistingUserRequest>({
    resolver: zodResolver(existingUserRequest),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: fetchLogin,
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

  return {
    handleSubmit: handleSubmit(onSubmit),
    control,
    isLoading: isPending,
  };
};

const useRegistrationForm = () => {
  const router = useRouter();

  const { handleSubmit, control } = useForm<CreateUserRequest>({
    resolver: zodResolver(createUserSchema),
  });

  const mutation = useMutation({
    mutationFn: fetchRegister,
    mutationKey: ["register"],
    onError: (error) => {
      console.error("Registration failed: ", error);
    },
    onSuccess: () => {
      console.log("Registration successful");
      router.push("/auth/login");
    },
  });

  const onSubmit = (data: CreateUserRequest) => {
    mutation.mutate(data);
  };

  return {
    handleSubmit: handleSubmit(onSubmit),
    control,
    isLoading: mutation.isError,
  };
};

const useLogOut = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      return createAPIMethods({
        url: "http://localhost:3001/api/v1/auth/logout/",
        method: "GET",
      });
    },
    mutationKey: ["logout"],
    onError: (error) => {
      console.error("Logout failed: ", error);
    },
    onSuccess: () => {
      console.log("Logout successful");
      router.push("/auth/login");
    },
  });

  const logOut = () => {
    mutate();
  };

  return { logOut, isLoading: isPending };
};

export { useUser, useLogOut, useLoginForm, useRegistrationForm };
