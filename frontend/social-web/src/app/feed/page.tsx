"use client";
import React from "react";
import { AppButton } from "@/components/button";
import CommentPanel from "@/components/comment-panel";
import { InputField } from "@/components/input";
import { PostItem } from "@/components/post-item";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreatePostRequest,
  createPostRequestSchema,
  PostResponse,
} from "shared-schema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const PostForm: React.FC = () => {
  const queryClient = useQueryClient();
  const { handleSubmit, control } = useForm<CreatePostRequest>({
    resolver: zodResolver(createPostRequestSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: CreatePostRequest) => {
      const response = await fetch("http://localhost:3001/api/v1/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      return response.json();
    },

    mutationKey: ["posts"],
    onError: (error) => {
      console.error("Post creation failed: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const onSubmit = (data: CreatePostRequest) => {
    mutate(data);
  };

  return (
    <form
      className='flex flex-col gap-5 mt-5'
      onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name='title'
        control={control}
        render={({ field }) => (
          <InputField label='Title' id='title' rows={1} {...field} />
        )}
      />
      <Controller
        name='content'
        control={control}
        render={({ field }) => (
          <InputField
            label='Create your post'
            id='content'
            multiline
            rows={5}
            {...field}
          />
        )}
      />
      <AppButton title='Post' isLoading={isPending} type='submit' />
    </form>
  );
};
export default function Feed() {
  const { data: posts, isLoading } = useQuery<PostResponse[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await fetch("http://localhost:3001/api/v1/posts", {
        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",
      });
      const data = await response.json();
      return data;
    },
  });

  return (
    <div className='bg-white min-h-screen flex flex-col'>
      <div className='flex-grow py-24 sm:py-32'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl lg:mx-0'>
            <h2 className='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
              From the blog
            </h2>
            <p className='mt-2 text-lg leading-8 text-gray-600'>
              Learn how to grow your business with our expert advice.
            </p>
          </div>
          <PostForm />
          {!isLoading && posts?.length ? (
            <div className='mx-auto mt-10 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16'>
              {posts?.map((post) => (
                <PostItem post={post} key={post._id.toString()} />
              ))}
            </div>
          ) : (
            <div>Loading...</div>
          )}
        </div>
      </div>
      <CommentPanel />
    </div>
  );
}
