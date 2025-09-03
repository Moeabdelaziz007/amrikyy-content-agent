import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
};

export default function LoginButton({ label = 'Sign-In With Ethereum', ...props }: Props) {
  return (
    <button
      {...props}
      className="inline-flex items-center px-3 py-2 rounded bg-black text-white hover:opacity-90 disabled:opacity-50"
    >
      {label}
    </button>
  );
}
