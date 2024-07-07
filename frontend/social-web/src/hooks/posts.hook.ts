import { createAPIMethods } from "@/libs/api";
import { POST_QUERY_LIMIT } from "@/libs/util";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useInView } from "react-intersection-observer";
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

const fetchPosts = ({
  start,
  end,
  signal,
}: {
  start: number;
  end: number;
  signal?: AbortSignal;
}) =>
  createAPIMethods<any, PostResponse[]>({
    url: `http://localhost:3001/api/v1/posts?start=${start}&end=${end}&limit=${POST_QUERY_LIMIT}`,
    method: "GET",
    signal,
  });

const useFetchPosts = () => {
  const { ref, inView } = useInView();
  const {
    isPending,
    error,
    data,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam, signal }) => {
      return fetchPosts({
        signal,
        start: pageParam.start,
        end: pageParam.end,
      });
    },
    staleTime: 10000,
    initialPageParam: {
      start: 0,
      end: Math.floor(new Date().getTime() / 1000),
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.length || !lastPage[lastPage.length - 1]) return null;

      const lastPost = lastPage[lastPage.length - 1];
      const lastPostDate = new Date(lastPost.createdAt);
      return {
        start: Math.floor(lastPostDate.getTime() / 1000),
        end: Math.floor(new Date().getTime() / 1000),
      };
    },
  });

  useEffect(() => {
    if (inView) fetchNextPage();
  }, [inView, fetchNextPage]);

  return {
    ref,
    error,
    hasNextPage,
    posts: data?.pages.flatMap((page) => page) || [],
    isFetchingNextPage,
    isLoading: isPending,
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
