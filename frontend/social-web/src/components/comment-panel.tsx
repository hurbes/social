"use client";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from "@headlessui/react";

import { InputField } from "./input";
import { PostItem } from "./post-item";
import { CommentComp } from "./comment-comp";
import { AppButton } from "./button";
import { Controller } from "react-hook-form";
import { useFetchPostById } from "@/hooks/posts.hook";
import { useCreateComment, useFetchComments } from "@/hooks/comments.hook";
import { CloseIcon } from "./icons";
import { Loader } from "./loader";

const PostCommentForm: React.FC = () => {
  const { handleSubmit, control, isPending } = useCreateComment();

  return (
    <form className='flex items-start gap-4 mt-10' onSubmit={handleSubmit}>
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
  const { post, isLoading } = useFetchPostById();
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
  const { comments, isLoading, isOpen, closePanel } = useFetchComments();

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
                    <CloseIcon />
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
                    <div className='flex flex-col items-center justify-center'>
                      <Loader />
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <CommentComp
                        className='mt-5 bg-slate-50 p-2 rounded-lg'
                        editable={true}
                        id={comment._id.toString()}
                        key={comment._id.toString()}
                        title={comment.author.name}
                        description={comment.content}
                      />
                    ))
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
