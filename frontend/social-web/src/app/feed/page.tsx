"use client";
import React, { useEffect, useRef, useState } from "react";
import { AppButton } from "@/components/button";
import CommentPanel from "@/components/comment-panel";
import { InputField } from "@/components/input";
import { PostItem } from "@/components/post-item";

import { Controller } from "react-hook-form";
import { useCreatePost, useFetchPosts } from "@/hooks/posts.hook";
import { Loader } from "@/components/loader";
import { InView, useInView } from "react-intersection-observer";
import { useInfiniteQuery } from "@tanstack/react-query";
import { start } from "repl";
const PostForm: React.FC = () => {
  const { handleSubmit, control, isPending } = useCreatePost();

  return (
    <form className='flex flex-col gap-5 mt-5' onSubmit={handleSubmit}>
      <Controller
        name='title'
        control={control}
        render={({ field }) => (
          <InputField label='Title' id='title' {...field} />
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

const getPosts = async ({
  limit = 10,
  start,
  end,
}: {
  limit: number;
  start: number;
  end: number;
}) => {
  console.log("pageParam", { limit, start, end });
  return Promise.resolve(
    [1, 2, 3, 4, 5].map((i) => ({
      id: i,
      title: `Post ${i}`,
      content: `Content ${i}`,
      author: `Author ${i}`,
      createdAt: new Date(),
    }))
  );
};

export default function Feed() {
  const { posts, isLoading, hasNextPage, ref } = useFetchPosts();

  return (
    <div className='bg-white min-h-screen flex flex-col items-center justify-center'>
      <div className='grid grid-cols-12 py-10'>
        <div className='col-start-10 col-end-13 flex justify-end gap-4'>
          <a href='/chat'>
            <AppButton title='Messenger' />
          </a>
          <AppButton title='Log Out' />
        </div>
      </div>
      <div className='flex-grow w-1/2 '>
        <div className='max-w-7xl px-6'>
          <div className='max-w-2xl'>
            <h2 className='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
              From the blog 🚀
            </h2>
            <p className='mt-2 text-lg leading-8 text-gray-600'>
              Learn how to grow your business with our expert advice.
            </p>
          </div>
          <PostForm />

          {!isLoading ? (
            <div className='border-t border-gray-200 sm:mt-5 sm:pt-5'>
              {posts?.map((post) => {
                return <PostItem post={post} key={post?._id?.toString()} />;
              })}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center h-28'>
              <Loader />
            </div>
          )}
        </div>
      </div>
      {hasNextPage && <div ref={ref} className='h-4 w-full bg-blue-200'></div>}
      <CommentPanel />
    </div>
  );
}
