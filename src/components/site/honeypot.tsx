import type { UseFormRegisterReturn } from "react-hook-form";

/**
 * Spam trap: hidden from people (and screen readers) but visible to bots that
 * auto-fill every field. If it comes back filled in, the server ignores the message.
 */
export function Honeypot({ registration }: { registration: UseFormRegisterReturn }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
      <label>
        Leave this field empty
        <input type="text" tabIndex={-1} autoComplete="off" {...registration} />
      </label>
    </div>
  );
}
