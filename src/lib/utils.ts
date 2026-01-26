import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export function takeFirstOr<T extends Array<unknown>, TValue>(
  values: T,
  defaultValue: TValue,
): T[number] | TValue {
  if (values.length > 0) {
    return values[0] as T[number]
  }
  return defaultValue
}

export const takeFirstOrThrow = <T extends Array<unknown>>(
  values: T,
  error: string | Error,
) => {
  const first = takeFirstOr(values, null)
  if (first !== null) {
    return first
  }
  throw typeof error === 'string' ? new Error(error) : error
}

export const takeFirstOrNull = <T extends Array<unknown>>(values: T) => {
  return takeFirstOr(values, null)
}
