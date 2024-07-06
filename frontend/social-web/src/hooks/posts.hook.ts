import { createAPIMethods } from "@/libs/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  CreatePostRequest,
  createPostRequestSchema,
  PostResponse,
} from "shared-schema";

const fetchPostById = (id: string) =>
  createAPIMethods<any, PostResponse>({
    url: `http://localhost:3001/api/v1/post/${id}`,
    method: "GET",
  });

const fetchPosts = () =>
  createAPIMethods<any, PostResponse[]>({
    url: "http://localhost:3001/api/v1/posts",
    method: "GET",
  });

const useFetchPosts = () => {
  const { data: posts, isLoading } = useQuery<PostResponse[]>({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  return {
    posts: posts || [],
    isLoading,
  };
};

const createPost = (body: CreatePostRequest) => {
  return createAPIMethods<any, PostResponse>({
    url: "http://localhost:3001/api/v1/post",
    method: "POST",
    body,
  });
};

const useFetchPostById = () => {
  const searchParams = useSearchParams();
  const post_id = searchParams.get("id");

  const { data: post, isLoading } = useQuery<PostResponse>({
    queryKey: [`post/${post_id}`],
    queryFn: () => fetchPostById(post_id!),
    enabled: !!post_id,
  });

  return {
    post,
    isLoading,
  };
};

const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { handleSubmit, control } = useForm<CreatePostRequest>({
    resolver: zodResolver(createPostRequestSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["posts"],
    mutationFn: async (data: CreatePostRequest) => createPost(data),
    onError: (error: any) => {
      console.error("Post creation failed: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const onSubmit: SubmitHandler<CreatePostRequest> = (data) => {
    mutate(data);
  };

  return {
    handleSubmit: handleSubmit(onSubmit),
    control,
    isPending,
  };
};

export { useFetchPosts, useFetchPostById, useCreatePost };
