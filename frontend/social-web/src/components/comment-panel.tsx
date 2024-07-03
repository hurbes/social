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
import { PostItem } from "./post-item";
import { posts } from "@/app/feed/page";
import { InputField } from "./input";

export default function CommentPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isOpen = useMemo(() => searchParams.has("id"), [searchParams]);
  const closePanel = () => router.push("/feed");

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
                    <PostItem post={posts[0]} />
                  </div>
                  <div className='grid grid-rows-2 grid-flow-col gap-4'>
                    <InputField
                      autoComplete='off'
                      label='Comment'
                      placeholder='Add a comment'
                      type='text'
                      name='comment'
                      id='comment'
                      required
                      className='row-start-1 row-span-3 col-span-7'
                    />
                    <button
                      type='submit'
                      className='row-start-2 row-end-4 px-4 py-1 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700'>
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
