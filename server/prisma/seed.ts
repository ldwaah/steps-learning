import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.school.count();
  console.log(
    count === 0
      ? "Database ready. Schools register at /register."
      : `Database has ${count} school(s). No seed data applied.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
