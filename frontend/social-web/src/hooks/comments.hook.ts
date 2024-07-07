import { createAPIMethods } from "@/libs/api";
import { COMMENT_QUERY_LIMIT } from "@/libs/util";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useInView } from "react-intersection-observer";
import {
  CommentResponse,
  CreateCommentRequest,
  createCommentRequestSchema,
  UpdateCommentRequest,
  updateCommentRequestSchema,
} from "shared-schema";

const fetchComments = ({
  post_id,
  start,
  end,
  signal,
}: {
  post_id: string;
  start?: number;
  end?: number;
  signal?: AbortSignal;
}) =>
  createAPIMethods<any, CommentResponse[]>({
    url: `http://localhost:3001/api/v1/post/${post_id}/comments?start=${start}&end=${end}&limit=${COMMENT_QUERY_LIMIT}`,
    method: "GET",
    signal,
  });

const createComment = ({
  body,
  post_id,
}: {
  body: CreateCommentRequest;
  post_id: string | null | undefined;
}) => {
  if (!post_id) return Promise.resolve(undefined);
  return createAPIMethods<any, CommentResponse>({
    url: `http://localhost:3001/api/v1/post/${post_id}/comment`,
    method: "POST",
    body,
  });
};

const deleteComment = (comment_id: string) =>
  createAPIMethods<any, void>({
    url: `http://localhost:3001/api/v1/post/comment/${comment_id}`,
    method: "DELETE",
  });

const updateComment = ({
  comment_id,
  data,
}: {
  comment_id: string;
  data: UpdateCommentRequest;
}) =>
  createAPIMethods<UpdateCommentRequest, void>({
    url: `http://localhost:3001/api/v1/post/comment/${comment_id}`,
    method: "PATCH",
    body: data,
  });

const useFetchComments = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const post_id = searchParams.get("id");

  const isOpen = useMemo(() => searchParams.has("id"), [searchParams]);
  const closePanel = () => router.push("/feed");

  const { ref, inView } = useInView();
  const {
    isPending,
    error,
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam, signal }) => {
      return fetchComments({
        post_id: post_id!,
        signal,
        start: pageParam.start,
        end: pageParam.end,
      });
    },
    enabled: isOpen,
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
    isOpen,
    closePanel,
    hasNextPage,
    isLoading: isPending,
    isFetchingNextPage,
    comments: data?.pages.flatMap((page) => page) || [],
  };
};

const useCreateComment = () => {
  const searchParams = useSearchParams();
  const post_id = searchParams.get("id");

  const queryClient = useQueryClient();

  const { handleSubmit, control } = useForm<CreateCommentRequest>({
    resolver: zodResolver(createCommentRequestSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createComment,
    mutationKey: [`/${post_id}/comments`],
    onError: (error) => {
      console.error("Comment creation failed: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/${post_id}/comments`] });
    },
  });

  const onSubmit: SubmitHandler<CreateCommentRequest> = (data) => {
    mutate({ body: data, post_id });
  };

  return {
    handleSubmit: handleSubmit(onSubmit),
    control,
    isPending,
  };
};

const useUpdateComment = ({
  comment_content,
  comment_id,
}: {
  comment_content: string;
  comment_id: string;
}) => {
  const searchParams = useSearchParams();
  const post_id = searchParams.get("id");
  const queryClient = useQueryClient();

  const { handleSubmit, control } = useForm<UpdateCommentRequest>({
    resolver: zodResolver(updateCommentRequestSchema),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(comment_content);

  const { mutate, isPending } = useMutation({
    mutationFn: updateComment,
    mutationKey: [`/${post_id}/comments`],
    onError: (error) => {
      console.error("Comment creation failed: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/${post_id}/comments`] });
    },
  });

  const enableEditing = () => {
    setIsEditing(true);
  };

  const handleSaveClick = (data: UpdateCommentRequest) => {
    console.log("data", data);
    setIsEditing(false);
    mutate({ comment_id, data });
  };

  return {
    isPending,
    isEditing,
    editedDescription,
    control,
    enableEditing,
    handleSaveClick,
    setEditedDescription,
    updateComment: mutate,
    handleSubmit: handleSubmit(handleSaveClick),
  };
};

const useDeleteComment = (comment_id: string) => {
  const searchParams = useSearchParams();
  const post_id = searchParams.get("id");
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: deleteComment,
    mutationKey: [`/${post_id}/comments`],
    onError: (error) => {
      console.error("Comment creation failed: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/${post_id}/comments`] });
    },
  });

  const handleDeleteClick = () => {
    mutate(comment_id);
  };

  return {
    handleDeleteClick,
  };
};

export {
  useFetchComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
};
function fetchPosts(arg0: {
  signal: AbortSignal;
  start: number;
  end: number;
}): any {
  throw new Error("Function not implemented.");
}
