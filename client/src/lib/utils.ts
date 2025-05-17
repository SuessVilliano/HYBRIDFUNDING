import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function scrollToElement(elementId: string): void {
  const element = document.getElementById(elementId);
  if (element) {
    window.scrollTo({
      top: element.offsetTop - 80, // Offset for fixed header
      behavior: 'smooth'
    });
  }
}

export function getCheckoutUrl(tier: string): string {
  return `https://client.hybridfunding.club/checkout/${tier.toLowerCase()}`;
}

export function getSupportEmail(): string {
  return 'support@hybridfunding.club';
}

export function getAffiliateEmail(): string {
  return 'affiliate@tradehybrid.club';
}

export function animateValue(start: number, end: number, duration: number, elementId: string): void {
  let startTimestamp: number | null = null;
  const element = document.getElementById(elementId);
  if (!element) return;

  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const currentValue = Math.floor(progress * (end - start) + start);
    element.textContent = `${currentValue}`;
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = `${end}`;
    }
  };

  window.requestAnimationFrame(step);
}
