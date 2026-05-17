import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.sessionCompletion.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.regulateLog.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.topicProgress.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();
  await prisma.trust.deleteMany();
  console.log("Database wiped — all schools and users removed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
