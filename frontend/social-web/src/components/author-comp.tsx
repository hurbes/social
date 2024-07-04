import { useMemo } from "react";
import { Author } from "shared-schema";

function getRandomAvatarUri(style = "micah") {
  const seed = Math.random().toString();
  return `https://api.dicebear.com/6.x/${style}/svg?seed=${seed}`;
}

interface CommentCompProps {
  title: string;
  description: string;
}

export const CommentComp: React.FC<CommentCompProps> = ({
  title,
  description,
}) => {
  const avatarUri = useMemo(() => getRandomAvatarUri(), []);
  return (
    <div className='relative mt-8 flex items-center gap-x-4'>
      <img
        src={avatarUri}
        alt=''
        className='h-10 w-10 rounded-full bg-gray-50'
      />
      <div className='text-sm leading-6'>
        <p className='font-semibold text-gray-900'>
          {/* <a href={post.author.href}> */}
          <span className='absolute inset-0' />
          {title}
          {/* </a> */}
        </p>
        <p className='text-gray-600'>{description}</p>
      </div>
    </div>
  );
};
