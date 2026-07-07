/**
 * Seeds the fixed RBAC roles and a bootstrap MANAGER account.
 *
 * Since registration always creates TEAM_MEMBER (no role selection at signup),
 * the very first manager must be seeded here. Credentials come from env with
 * safe local defaults — change them for any real deployment.
 *
 * Idempotent: safe to re-run.
 */
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

const ROLES: { name: Role['name']; description: string }[] = [
  { name: 'MANAGER', description: 'Can view and analyze all team reports and manage projects.' },
  { name: 'TEAM_MEMBER', description: 'Can create and manage their own weekly reports.' },
];

async function main(): Promise<void> {
  // 1. Roles
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }

  const managerRole = await prisma.role.findUniqueOrThrow({ where: { name: 'MANAGER' } });

  // 2. Bootstrap manager
  const email = process.env.SEED_MANAGER_EMAIL ?? 'manager@sisenco.local';
  const password = process.env.SEED_MANAGER_PASSWORD ?? 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      firstName: 'Team',
      lastName: 'Manager',
      roleId: managerRole.id,
    },
  });

  console.log(`Seed complete. Roles: ${ROLES.map((r) => r.name).join(', ')}.`);
  console.log(`Bootstrap manager: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
