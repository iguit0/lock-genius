# Lock Genius 🔐🛡️

A secure and modern password manager built with Next.js.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 📌 Table of Contents

- [Lock Genius 🔐🛡️](#lock-genius-️)
  - [📌 Table of Contents](#-table-of-contents)
  - [🗣 Introduction](#-introduction)
  - [✨ Features](#-features)
  - [🛠 Tech Stack](#-tech-stack)
  - [🖥 Installation](#-installation)
  - [🚨 License](#-license)

## 🗣 Introduction

**Lock Genius** is a simple yet powerful password manager you need. Built with modern web technologies and security best practices.

## ✨ Features

- [x] Social Login with GitHub
- [x] Secure Password Generation
  - Cryptographically secure random generation
  - Customizable password options (length, character sets)
  - Copy to clipboard functionality
- [x] Health Check API
- [x] PostgreSQL Database Integration
- [x] Modern UI with Dark/Light Mode
- [ ] Password Vault Management
- [x] Unit Testing
- [x] Type Safety with TypeScript
- [x] API Documentation

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI**: Tailwind CSS, Radix UI
- **Testing**: Jest, React Testing Library
- **Type Safety**: TypeScript
- **Code Quality**: ESLint, Prettier
- **API**: Built-in Next.js API Routes

## 🖥 Installation

### Prerequisites

1. Install nvm (Node Version Manager):

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

2. Install and use the correct Node.js version:

   ```bash
   nvm install
   nvm use
   ```

3. Install pnpm:
   ```bash
   npm install -g pnpm
   ```

### Project Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/iguit0/lock-genius.git
   cd lock-genius
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Fill in the required environment variables:

   - `NEXT_PUBLIC_SITE_URL`: Your site URL
   - `NEXT_PUBLIC_GITHUB_ID`: GitHub OAuth App ID
   - `NEXT_PUBLIC_GITHUB_SECRET`: GitHub OAuth App Secret
   - `POSTGRES_PRISMA_URL`: PostgreSQL connection URL

4. Run database migrations:

   ```bash
   pnpm prisma migrate dev
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

Visit `http://localhost:3000` to see the application running.

## 🚨 License

This project is licensed under the [MIT License](https://opensource.org/license/mit/). Refer to the [LICENSE](./LICENSE) file for more information.
