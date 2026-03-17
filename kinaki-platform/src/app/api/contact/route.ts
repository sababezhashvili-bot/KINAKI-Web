import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import nodemailer from 'nodemailer'

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(5000),
  _honey: z.string().max(0), // must be empty
})

// Simple in-memory rate limiter (per IP, max 5 per 10 min)
const rateLimitMap = new Map<string, { count: number; reset: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)
  if (!limit || now > limit.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + 10 * 60 * 1000 })
    return true
  }
  if (limit.count >= 5) return false
  limit.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { name, email, subject, message } = parsed.data

  // Only send email if SMTP is configured
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    try {
      await transporter.sendMail({
        from: `"KINAKI Contact Form" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_FORM_TO || process.env.SMTP_USER,
        replyTo: email,
        subject: `[KINAKI] ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="font-weight: 300; color: #1c1917;">New Message from ${name}</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 20px 0;" />
            <p style="color: #57534e; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
          </div>
        `,
      })
    } catch (err) {
      console.error('Email send error:', err)
      // Don't fail the request; log the error
    }
  }

  return NextResponse.json({ success: true })
}
