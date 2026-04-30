const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@taskmanager.com';
  const password = 'adminpassword123';
  const name = 'System Admin';

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash: hashedPassword,
        role: 'ADMIN',
      },
      create: {
        email,
        name,
        passwordHash: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('Admin account created/updated successfully:');
    console.log('Email:', user.email);
    console.log('Password:', password);
  } catch (error) {
    console.error('Error creating admin account:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
