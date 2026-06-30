import { type TextareaHTMLAttributes } from 'react'
import styles from './Textarea.module.css'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, rows = 3, ...props }: TextareaProps) {
  const classes = [styles.textarea, className].filter(Boolean).join(' ')

  return <textarea className={classes} rows={rows} {...props} />
}
