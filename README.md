# Ivory 💅

AI-powered nail design platform connecting clients with professional nail technicians.

![Ivory](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-green)

## Features

### For Clients
- 📸 **Capture & Design** - Take photos of your hands and design custom nail art
- 🤖 **AI Generation** - Generate unique nail designs from text prompts
- 🎨 **Color Palettes** - Choose from curated color collections
- 👩‍🎨 **Find Nail Techs** - Connect with professional nail technicians
- 📤 **Share Designs** - Share your creations with friends
- 💬 **Request Service** - Send designs directly to nail techs

### For Nail Technicians
- 📬 **Receive Requests** - Get design requests from clients
- ✅ **Approve/Modify** - Review and respond to client requests
- 💼 **Portfolio** - Showcase your work in a professional gallery
- ⭐ **Reviews & Ratings** - Build your reputation
- 💰 **Offer Services** - List your services and pricing

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Storage**: Vercel Blob / Cloudflare R2 / Backblaze B2
- **AI**: OpenAI DALL-E
- **Email**: Resend
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+ and Yarn
- A Neon PostgreSQL database (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ivory.git
cd ivory
```

2. **Install dependencies**
```bash
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your database URL:
```env
DATABASE_URL=your-neon-connection-string
```

4. **Push database schema**
```bash
yarn db:push
```

5. **Run the development server**
```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Configuration

### Required Setup

Only the database is required to run the app:

- **Database**: Neon PostgreSQL - [Get started](https://neon.tech)

### Optional Services

Install optional services based on your needs:

```bash
yarn setup:services
```

Or install manually:

- **Storage**: For image uploads
  ```bash
  yarn add @vercel/blob  # Vercel Blob
  # OR
  yarn add @aws-sdk/client-s3  # R2/B2
  ```

- **AI Generation**: For creating nail designs
  ```bash
  yarn add openai
  ```

- **Email**: For notifications
  ```bash
  yarn add resend
  ```

See [docs/SERVICES.md](docs/SERVICES.md) for detailed setup instructions.

## Documentation

- 📖 [Setup Guide](SETUP.md) - Complete setup instructions
- 🔧 [Environment Variables](docs/ENVIRONMENT.md) - All configuration options
- 🛠️ [Services Integration](docs/SERVICES.md) - Third-party services setup
- 🗄️ [Database Schema](db/README.md) - Database structure and API
- 📚 [Utilities](lib/README.md) - Helper functions and utilities

## Project Structure

```
ivory/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (pages)/           # App pages
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── db/                    # Database
│   ├── schema.ts         # Drizzle schema
│   └── index.ts          # Database client
├── lib/                   # Utilities
│   ├── env.ts            # Environment config
│   ├── constants.ts      # App constants
│   ├── api-utils.ts      # API helpers
│   ├── storage.ts        # File upload
│   ├── ai.ts             # AI generation
│   └── email.ts          # Email sending
├── docs/                  # Documentation
├── public/               # Static assets
└── scripts/              # Utility scripts
```

## Database Management

```bash
# Open visual database browser
yarn db:studio

# Push schema changes (development)
yarn db:push

# Generate migrations (production)
yarn db:generate
yarn db:migrate
```

## API Routes

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Sign in

### Users
- `GET /api/users` - Get users
- `PATCH /api/users/update-type` - Update user type

### Looks (Nail Designs)
- `GET /api/looks` - Get designs
- `POST /api/looks` - Create design
- `GET /api/looks/[id]` - Get specific design
- `DELETE /api/looks/[id]` - Delete design

### Design Requests
- `GET /api/design-requests` - Get requests
- `POST /api/design-requests` - Create request
- `PATCH /api/design-requests` - Update request

### Tech Profiles
- `GET /api/tech-profiles` - Get nail techs
- `POST /api/tech-profiles` - Create profile
- `PATCH /api/tech-profiles` - Update profile

## Development

### Code Style

This project uses:
- TypeScript strict mode
- ESLint for linting
- Prettier for formatting (via editor)

### Adding Features

1. Create database schema in `db/schema.ts`
2. Push changes with `yarn db:push`
3. Create API routes in `app/api/`
4. Build UI components in `app/`
5. Add utilities in `lib/` if needed

### Environment Variables

All environment variables are type-safe and validated on startup. See [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) for details.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

Vercel will automatically:
- Build your Next.js app
- Connect to your Neon database
- Set up CDN and edge functions

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Railway
- Render
- AWS Amplify
- Self-hosted with Docker

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Security

- Never commit `.env.local` or API keys
- Use environment variables for all secrets
- Validate all user inputs
- Sanitize file uploads
- Rate limit API endpoints

For security issues, please email security@ivory.app

## License

MIT License - see [LICENSE](LICENSE) for details

## Support

- 📧 Email: support@ivory.app
- 💬 Discord: [Join our community](https://discord.gg/ivory)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/ivory/issues)

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Database by [Neon](https://neon.tech)
- Deployed on [Vercel](https://vercel.com)

---

Made with 💅 by the Ivory team
