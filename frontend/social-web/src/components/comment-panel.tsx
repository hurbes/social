"use client";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from "@headlessui/react";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { InputField } from "./input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CommentResponse,
  CreateCommentRequest,
  createCommentRequestSchema,
  PostResponse,
} from "shared-schema";
import { PostItem } from "./post-item";
import { CommentComp } from "./author-comp";
import { AppButton } from "./button";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const PostCommentForm: React.FC = () => {
  const searchParams = useSearchParams();
  const post_id = searchParams.get("id");

  const queryClient = useQueryClient();

  const { handleSubmit, control } = useForm<CreateCommentRequest>({
    resolver: zodResolver(createCommentRequestSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: CreateCommentRequest) => {
      const response = await fetch(
        `http://localhost:3001/api/v1/post/${post_id}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );
      return response.json();
    },
    mutationKey: [`/${post_id}/comments`],
    onError: (error) => {
      console.error("Comment creation failed: ", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/${post_id}/comments`] });
    },
  });

  const onSubmit = (data: CreateCommentRequest) => {
    mutate(data);
  };

  return (
    <form
      className='flex items-start gap-4 mt-10'
      onSubmit={handleSubmit(onSubmit)}>
      <div className='flex-grow'>
        <Controller
          name='content'
          control={control}
          render={({ field }) => (
            <InputField
              autoComplete='off'
              label='Comment'
              placeholder='Add a comment'
              id='comment'
              required
              {...field}
            />
          )}
        />
      </div>
      <div className='mt-7'>
        <AppButton title='Comment' type='submit' isLoading={isPending} />
      </div>
    </form>
  );
};

const PostComponent = () => {
  const searchParams = useSearchParams();

  const { data: post, isLoading } = useQuery<PostResponse>({
    queryKey: ["post"],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3001/api/v1/post/${searchParams.get("id")}`,
        {
          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",
        }
      );
      const data = await response.json();
      return data;
    },
  });
  return (
    <div className='grid grid-cols-1 gap-4'>
      {isLoading ? (
        <div>Loading...</div>
      ) : post ? (
        <PostItem post={post} />
      ) : (
        <div>No posts found</div>
      )}
    </div>
  );
};

export default function CommentPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const post_id = searchParams.get("id");

  const isOpen = useMemo(() => searchParams.has("id"), [searchParams]);
  const closePanel = () => router.push("/feed");

  const { data: comments, isLoading } = useQuery<CommentResponse[]>({
    queryKey: [`/${post_id}/comments`],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3001/api/v1/post/${post_id}/comments`,
        {
          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",
        }
      );
      const data = await response.json();
      return data;
    },
  });

  return (
    <Dialog className='relative z-10' open={isOpen} onClose={closePanel}>
      <DialogBackdrop
        transition
        className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-500 ease-in-out data-[closed]:opacity-0'
      />

      <div className='fixed inset-0 overflow-hidden'>
        <div className='absolute inset-0 overflow-hidden'>
          <div className='pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10'>
            <DialogPanel
              transition
              className='pointer-events-auto relative w-screen max-w-screen-xl transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700'>
              <TransitionChild>
                <div className='absolute left-0 top-0 -ml-8 flex pr-2 pt-4 duration-500 ease-in-out data-[closed]:opacity-0 sm:-ml-10 sm:pr-4'>
                  <button
                    type='button'
                    className='relative rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white'
                    onClick={closePanel}>
                    <span className='absolute -inset-2.5' />
                    <span className='sr-only'>Close panel</span>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={1.5}
                      stroke='currentColor'
                      className='size-6'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M6 18 18 6M6 6l12 12'
                      />
                    </svg>
                  </button>
                </div>
              </TransitionChild>
              <div className='flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl'>
                <div className='px-4 sm:px-6'>
                  <DialogTitle className='text-base font-semibold leading-6 text-gray-900'>
                    Comments
                  </DialogTitle>
                </div>
                <div className='relative flex-1 sm:px-6'>
                  <div className='border-b border-gray-200 mt-10 mb-5'>
                    <PostComponent />
                  </div>
                  {isLoading ? (
                    <div>Loading...</div>
                  ) : comments?.length ? (
                    comments.map((comment) => (
                      <CommentComp
                        id={comment._id.toString()}
                        key={comment._id.toString()}
                        title={comment.author.name}
                        description={comment.content}
                      />
                    ))
                  ) : (
                    <div>No comments found</div>
                  )}

                  <PostCommentForm />
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
