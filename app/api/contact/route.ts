import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { name, email, message, website } = await request.json();

  // Honeypot — silently discard bot submissions
  if (website) {
    return NextResponse.json({ ok: true });
  }

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // TODO: wire up email delivery (e.g. Resend, Nodemailer)
  // Example with Resend:
  // await resend.emails.send({
  //   from: 'noreply@hertzmann.net',
  //   to: 'hertzmann@hertzmann.com',
  //   subject: `Contact form: ${name}`,
  //   text: `From: ${name} <${email}>\n\n${message}`,
  // });

  console.log('Contact form submission:', { name, email, message });

  return NextResponse.json({ ok: true });
}
