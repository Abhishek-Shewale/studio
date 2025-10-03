import Image from 'next/image';
import type { FC } from 'react';

export const Logo: FC = () => {
  return (
    <div className="flex justify-center items-center p-4">
      <Image
        src="/deployh-logo.png"
        alt="Voice Mock Interview Logo"
        width={128}
        height={128}
        className="object-contain rounded-md"
      />
    </div>
  );
};
