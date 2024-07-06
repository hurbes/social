import { useForm } from "react-hook-form";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateUserRequest,
  createUserSchema,
  ExistingUserRequest,
  existingUserRequest,
} from "shared-schema"; // Adjust the import path as necessary
import { createAPIMethods } from "@/libs/api";
import { useMutation } from "@tanstack/react-query";

const fetchLogin = (body: ExistingUserRequest) =>
  createAPIMethods<ExistingUserRequest, void>({
    url: "http://localhost:3001/api/v1/auth/login/",
    method: "POST",
    body,
  });

const fetchRegister = (body: CreateUserRequest) =>
  createAPIMethods<CreateUserRequest, void>({
    url: "http://localhost:3001/api/v1/auth/register/",
    method: "POST",
    body,
  });

const useLoginForm = () => {
  const router = useRouter();

  const { handleSubmit, control } = useForm<ExistingUserRequest>({
    resolver: zodResolver(existingUserRequest),
  });

  const mutation = useMutation({
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
    mutation.mutate(data);
  };

  return {
    handleSubmit: handleSubmit(onSubmit),
    control,
    isLoading: mutation.isPending,
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

export { useLoginForm, useRegistrationForm };
