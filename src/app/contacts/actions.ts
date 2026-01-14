/**
 * Server Actions for Contact Form
 * 
 * Next.js Server Actions provide a secure way to handle form submissions
 * directly on the server without needing API routes.
 * 
 * Benefits:
 * - Better security (server-side execution)
 * - Automatic CSRF protection
 * - Progressive enhancement (works without JavaScript)
 * - Built-in loading states
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Contact form submission server action
export async function submitContactForm(formData: FormData) {
  'use server';

  // Extract form data
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;
  const subject = formData.get('subject') as string;

  // Basic validation
  if (!name || !email || !message) {
    throw new Error('Всі обов\'язкові поля мають бути заповнені');
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Некоректна email адреса');
  }

  try {
    // Send to your contact API or email service
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    const response = await fetch(`${API_URL}/api/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        message,
        subject,
        submitted_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Помилка при відправці повідомлення');
    }

    // Revalidate the contacts page
    revalidatePath('/contacts');
    
    // Redirect to success page or show success message
    redirect('/contacts?success=true');

  } catch (error) {
    console.error('Contact form submission error:', error);
    throw new Error('Не вдалося відправити повідомлення. Спробуйте пізніше.');
  }
}

// Newsletter subscription server action
export async function subscribeNewsletter(formData: FormData) {
  'use server';

  const email = formData.get('email') as string;

  if (!email) {
    throw new Error('Email обов\'язковий для підписки');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Некоректна email адреса');
  }

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        subscribed_at: new Date().toISOString(),
        source: 'website',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Помилка при підписці');
    }

    return { success: true, message: 'Успішно підписано на розсилку!' };

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    throw new Error('Не вдалося підписатись на розсилку. Спробуйте пізніше.');
  }
}