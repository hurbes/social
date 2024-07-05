import React, { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  UpdateCommentRequest,
  updateCommentRequestSchema,
} from "shared-schema"; // Adjust the import path as necessary
import { zodResolver } from "@hookform/resolvers/zod";
import { InputField } from "./input"; // Adjust the import path as necessary
import { useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function getRandomAvatarUri(style = "micah") {
  const seed = Math.random().toString();
  return `https://api.dicebear.com/6.x/${style}/svg?seed=${seed}`;
}

interface CommentCompProps {
  id: string;
  title: string;
  description: string;
}

export const CommentComp: React.FC<CommentCompProps> = ({
  id,
  title,
  description,
}) => {
  const searchParams = useSearchParams();
  const post_id = searchParams.get("id");

  const queryClient = useQueryClient();

  const { mutate: deleteComment, isPending: isDeleting } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await fetch(
        `http://localhost:3001/api/v1/post/comment/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
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

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: UpdateCommentRequest) => {
      const response = await fetch(
        `http://localhost:3001/api/v1/post/comment/${id}`,
        {
          method: "PATCH",
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

  const { handleSubmit, control } = useForm<UpdateCommentRequest>({
    resolver: zodResolver(updateCommentRequestSchema),
  });

  const avatarUri = useMemo(() => getRandomAvatarUri(), []);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = (data: UpdateCommentRequest) => {
    // Save the edited description (e.g., send to backend)
    setIsEditing(false);
    mutate(data);
  };

  const handleDeleteClick = () => {
    // Delete the comment (e.g., send to backend)
    deleteComment({ id });
  };

  return (
    <div className='relative mt-8 flex items-center gap-x-4'>
      <img
        src={avatarUri}
        alt=''
        className='h-10 w-10 rounded-full bg-gray-50'
      />
      <div className='text-sm leading-6 flex-grow'>
        <p className='font-semibold text-gray-900'>{title}</p>
        {isEditing ? (
          <form onSubmit={handleSubmit(handleSaveClick)}>
            <Controller
              name='content'
              control={control}
              defaultValue={editedDescription}
              render={({ field }) => (
                <InputField
                  label=''
                  id='description'
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    setEditedDescription(e.target.value);
                  }}
                />
              )}
            />
          </form>
        ) : (
          <p className='text-gray-600'>{editedDescription}</p>
        )}
      </div>
      <button
        onClick={isEditing ? handleSubmit(handleSaveClick) : handleEditClick}
        className='text-blue-500 hover:underline'>
        {isEditing ? (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='black'
            className='w-5 h-5'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z'
            />
          </svg>
        ) : (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='black'
            className='w-5 h-5'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125'
            />
          </svg>
        )}
      </button>

      <button onClick={handleDeleteClick}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='black'
          className='w-5 h-5'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0'
          />
        </svg>
      </button>
    </div>
  );
};

export default CommentComp;
