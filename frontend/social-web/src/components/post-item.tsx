"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { PostResponse } from "shared-schema";
import { CommentComp } from "./comment-comp";
import { CommentIcon, LikeIcon } from "./icons";

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

interface PostItemProps {
  post: PostResponse;
}
export const PostItem: React.FC<PostItemProps> = ({ post }) => {
  const router = useRouter();

  const open = (id: string) => router.push(`/feed?id=${id}`);

  return (
    <article
      key={post._id.toString()}
      className='flex flex-col items-start justify-between mb-5 bg-gray-100 p-5 rounded-2xl'>
      <div className='flex items-center gap-x-4 text-xs'>
        <time dateTime={formatDate(post.createdAt)} className='text-gray-500'>
          {formatDate(post.createdAt)}
        </time>
      </div>
      <div className='group relative'>
        <h3 className='mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600'>
          {/* <a href={post.href}> */}
          <span className='absolute inset-0' />
          {post.title}
          {/* </a> */}
        </h3>
        <p className='mt-5 line-clamp-3 text-sm leading-6 text-gray-600'>
          {post.content}
        </p>
      </div>
      <div className='flex gap-4 mt-4'>
        <button
          className='flex gap-2'
          onClick={() => open(post._id.toString())}>
          <CommentIcon />
          <span className='text-black'>{post.comment_count}</span>
        </button>
        <div className='flex gap-2'>
          <LikeIcon />
          <span className='text-black'>{post.like_count}</span>
        </div>
      </div>
      <CommentComp
        editable={false}
        id={post.author._id?.toString()}
        title={post.author.name}
        description={post.author._id.toString()}
      />
    </article>
  );
};
