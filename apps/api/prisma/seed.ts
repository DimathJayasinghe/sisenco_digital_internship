import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seeds the database with initial RBAC role definitions.
 * Roles are fixed and should not be created by users.
 */
async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  // Upsert roles to make seed idempotent
  const managerRole = await prisma.role.upsert({
    where: { name: 'MANAGER' },
    update: {},
    create: {
      name: 'MANAGER',
      description: 'Can view and analyze reports across all team members.',
    },
  });

  const teamMemberRole = await prisma.role.upsert({
    where: { name: 'TEAM_MEMBER' },
    update: {},
    create: {
      name: 'TEAM_MEMBER',
      description: 'Can create and manage their own weekly reports.',
    },
  });

  console.log('✅ Roles seeded:', { managerRole, teamMemberRole });
}

main()
  .catch((error: unknown) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
