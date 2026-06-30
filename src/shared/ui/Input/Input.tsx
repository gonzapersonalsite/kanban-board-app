import { forwardRef, type InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const classes = [styles.input, className].filter(Boolean).join(' ')

    return <input ref={ref} className={classes} {...props} />
  },
)

Input.displayName = 'Input'
