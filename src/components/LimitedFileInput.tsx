'use client';

import { useRef, useState, type ReactNode } from 'react';

/**
 * File input that refuses oversized files in the browser.
 *
 * Next.js caps Server Action bodies (see `serverActions.bodySizeLimit`). Without
 * a client-side guard an oversized upload is rejected by the framework before
 * the action runs, which replaces the whole page with an error screen instead of
 * showing the admin what went wrong. Checking here keeps the failure local,
 * cheap, and readable.
 */
export default function LimitedFileInput({
  name,
  accept,
  maxBytes,
  maxLabel,
  fieldClassName,
  inputClassName,
  errorClassName,
  children,
}: {
  name: string;
  accept: string;
  maxBytes: number;
  maxLabel: string;
  fieldClassName: string;
  inputClassName: string;
  errorClassName: string;
  children: ReactNode;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <label className={fieldClassName}>
      {children}
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept={accept}
        className={inputClassName}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file && file.size > maxBytes) {
            setError(
              `Berkas ${(file.size / 1024 / 1024).toFixed(1)} MB melebihi batas ${maxLabel}.`,
            );
            if (inputRef.current) inputRef.current.value = '';
            return;
          }
          setError(null);
        }}
      />
      {error ? (
        <span role="alert" className={errorClassName}>
          {error}
        </span>
      ) : null}
    </label>
  );
}
