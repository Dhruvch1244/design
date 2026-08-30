# Forms: React Hook Form + Zod

## Why this pairing is the default

**React Hook Form (RHF)** manages form state via uncontrolled inputs +
refs instead of re-rendering on every keystroke — the right performance
model for anything beyond a two-field form. **Zod** defines the validation
schema once, as data, and both the client-side check and (if the schema is
shared with a server action/API route) the server-side check derive from
the same source — eliminating the classic bug where client and server
validation drift apart.

```tsx
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
type FormValues = z.infer<typeof schema>;

const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { email: "", password: "" },
});
```

`zodResolver` (from `@hookform/resolvers/zod`) is the glue — without it RHF
and Zod don't talk to each other automatically.

## Accessible error patterns (the part most AI-generated forms get wrong)

- Every input needs its error programmatically associated, not just
  visually nearby: `aria-invalid={!!errors.email}` and
  `aria-describedby="email-error"` on the input, matched to
  `id="email-error"` on the error text. A red `<p>` under the input with no
  `aria-describedby` link is invisible to a screen reader user navigating
  by input.
- **Focus the first invalid field on submit failure**, don't just show
  error text — sighted keyboard users and screen reader users both lose
  their place otherwise. RHF's `handleSubmit` runs your `onValid` callback
  only when the schema passes; on failure, use `errors` plus a `useEffect`
  that calls `.focus()` on the first error's ref (RHF's `setFocus` API
  does this in one call: `form.setFocus(firstErrorKey)`).
- **Don't validate on every keystroke by default** (`mode: "onChange"`)
  for anything beyond a live-availability check (username taken?) — it
  reads as aggressive/broken to a user still mid-typing their first
  character. `mode: "onBlur"` or `onTouched` (validate on blur, then
  re-validate on change once an error exists) matches how people actually
  expect forms to behave.
- Disable the submit button *and* show a pending state
  (`form.formState.isSubmitting`) during async submission — an unguarded
  double-click on a payment/signup form is a real, common bug class.

## Server Actions / API route integration (Next.js)

Parse the same Zod schema server-side before trusting any submitted value,
even though RHF already validated client-side — client validation is a UX
convenience, never a security boundary. `schema.safeParse(formData)` on the
server, and return field-level errors back to the client in the same shape
RHF expects (`{ field: message }`) so they can be set via `form.setError`.

## Stale training data warning

Zod v4 changed some error-customization APIs (`.refine`'s message shape,
some error-map internals) relative to v3 examples common in older
tutorials/training data — if a `.refine()` or custom error message isn't
behaving as expected, check the installed Zod major version before
assuming a v3-era API surface.
