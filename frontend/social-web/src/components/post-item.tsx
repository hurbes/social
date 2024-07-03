"use client";
import React from "react";
import { useRouter } from "next/navigation";
export interface Author {
  name: string;
  imageUrl: string;
  href: string;
  role: string;
}

export interface Category {
  title: string;
  href: string;
}

export interface Post {
  id: number;
  title: string;
  href: string;
  description: string;
  date: string;
  datetime: string;
  category: Category;
  author: Author;
}

export interface PostItemProps {
  post: Post;
}

export const PostItem: React.FC<PostItemProps> = ({ post }) => {
  const router = useRouter();

  const open = (id: number) => router.push(`/feed?id=${id}`);

  return (
    <article
      key={post.id}
      className='flex flex-col items-start justify-between mb-10'>
      <div className='flex items-center gap-x-4 text-xs'>
        <time dateTime={post.datetime} className='text-gray-500'>
          {post.date}
        </time>
      </div>
      <div className='group relative'>
        <h3 className='mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600'>
          <a href={post.href}>
            <span className='absolute inset-0' />
            {post.title}
          </a>
        </h3>
        <p className='mt-5 line-clamp-3 text-sm leading-6 text-gray-600'>
          {post.description}
        </p>
      </div>

      <div className='flex gap-4 mt-4'>
        <button className='flex gap-2' onClick={() => open(post.id)}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='black'
            className='size-6'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z'
            />
          </svg>
          <span className='text-black'>6</span>
        </button>
        <div className='flex gap-2'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='black'
            className='size-6'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z'
            />
          </svg>
          <span className='text-black'>6</span>
        </div>
      </div>

      <div className='relative mt-8 flex items-center gap-x-4'>
        <img
          src={post.author.imageUrl}
          alt=''
          className='h-10 w-10 rounded-full bg-gray-50'
        />
        <div className='text-sm leading-6'>
          <p className='font-semibold text-gray-900'>
            <a href={post.author.href}>
              <span className='absolute inset-0' />
              {post.author.name}
            </a>
          </p>
          <p className='text-gray-600'>{post.author.role}</p>
        </div>
      </div>
    </article>
  );
};
