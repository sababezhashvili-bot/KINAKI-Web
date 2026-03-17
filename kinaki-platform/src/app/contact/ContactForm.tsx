'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
  _honey: string // honeypot
}

const INITIAL: FormData = { name: '', email: '', subject: '', message: '', _honey: '' }

export default function ContactForm() {
  const [form, setForm] = useState<FormData>(INITIAL)
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  function validate(): boolean {
    const e: typeof errors = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.subject.trim()) e.subject = 'Subject is required'
    if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    if (form._honey) return // Bot

    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setForm(INITIAL)
    } catch {
      setStatus('error')
    }
  }

  const InputField = ({
    id,
    label,
    type = 'text',
    textarea = false,
  }: {
    id: keyof FormData
    label: string
    type?: string
    textarea?: boolean
  }) => (
    <div>
      <label className="block text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-2">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          value={form[id]}
          onChange={e => setForm(p => ({ ...p, [id]: e.target.value }))}
          rows={5}
          className="w-full border border-stone-200 focus:border-stone-900 outline-none px-4 py-3 text-[13px] text-stone-900 bg-white transition-colors resize-none"
        />
      ) : (
        <input
          type={type}
          id={id}
          value={form[id]}
          onChange={e => setForm(p => ({ ...p, [id]: e.target.value }))}
          className="w-full border border-stone-200 focus:border-stone-900 outline-none px-4 py-3 text-[13px] text-stone-900 bg-white transition-colors"
        />
      )}
      {errors[id] && (
        <p className="text-[11px] text-red-500 mt-1">{errors[id]}</p>
      )}
    </div>
  )

  return (
    <div>
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-12"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-2">Thank you</p>
            <p className="text-xl font-light text-stone-900">
              Your message has been sent. We'll be in touch soon.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Honeypot (hidden) */}
            <input
              id="_honey"
              type="text"
              value={form._honey}
              onChange={e => setForm(p => ({ ...p, _honey: e.target.value }))}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            <InputField id="name" label="Name" />
            <InputField id="email" label="Email" type="email" />
            <InputField id="subject" label="Subject" />
            <InputField id="message" label="Message" textarea />

            {status === 'error' && (
              <p className="text-[12px] text-red-500">
                Something went wrong. Please try again or email us directly.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white text-[11px] uppercase tracking-[0.25em] px-8 py-3.5 transition-colors"
            >
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
