import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Create Postgres connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Create Prisma adapter
const adapter = new PrismaPg(pool)

// Create Prisma Client instance
const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
})

// Test database connection
export async function connectDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

// Gracefully disconnect when app shuts down
export async function disconnectDatabase() {
  await prisma.$disconnect()
  console.log('Database disconnected')
}

export default prisma