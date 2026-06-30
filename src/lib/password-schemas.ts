import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 4;
export const PASSWORD_MAX_LENGTH = 255;

const passwordOptionsFieldsSchema = z.object({
  length: z.number().int().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
  uppercase: z.boolean(),
  lowercase: z.boolean(),
  numbers: z.boolean(),
  symbols: z.boolean(),
});

const hasAtLeastOneCharacterSet = (value: {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}) => value.uppercase || value.lowercase || value.numbers || value.symbols;

export const passwordOptionsSchema = passwordOptionsFieldsSchema.refine(hasAtLeastOneCharacterSet, {
  message: 'At least one option should be selected',
});

const savePasswordFieldsSchema = passwordOptionsFieldsSchema.extend({
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
});

export const savePasswordSchema = savePasswordFieldsSchema
  .refine(hasAtLeastOneCharacterSet, {
    message: 'At least one option should be selected',
  })
  .refine((value) => value.password.length === value.length, {
    message: 'Password length metadata must match password length',
    path: ['length'],
  });

export type PasswordOptionsInput = z.infer<typeof passwordOptionsSchema>;
export type SavePasswordInput = z.infer<typeof savePasswordSchema>;
