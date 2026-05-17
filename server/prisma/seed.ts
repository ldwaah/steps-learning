import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditEvent.deleteMany();
  await prisma.sessionCompletion.deleteMany();
  await prisma.topicProgress.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.regulateLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();
  await prisma.trust.deleteMany();

  const trust = await prisma.trust.create({
    data: {
      name: "Riverside Academy Trust",
      slug: "riverside",
    },
  });

  const schoolA = await prisma.school.create({
    data: {
      trustId: trust.id,
      name: "Riverside AP School",
      slug: "riverside-ap",
    },
  });

  const schoolB = await prisma.school.create({
    data: {
      trustId: trust.id,
      name: "Oakfield SEMH Hub",
      slug: "oakfield",
    },
  });

  const pinHash = await bcrypt.hash("4821", 10);
  const pinHash2 = await bcrypt.hash("7392", 10);
  const staffPin = await bcrypt.hash("0000", 10);

  await prisma.user.createMany({
    data: [
      {
        schoolId: schoolA.id,
        trustId: trust.id,
        role: UserRole.STUDENT,
        username: "alex",
        pinHash,
        firstName: "Alex",
        yearGroup: 9,
        points: 0,
        level: "Getting started",
      },
      {
        schoolId: schoolA.id,
        trustId: trust.id,
        role: UserRole.STUDENT,
        username: "jordan",
        pinHash: pinHash2,
        firstName: "Jordan",
        yearGroup: 11,
        points: 0,
        level: "Getting started",
      },
      {
        schoolId: schoolB.id,
        trustId: trust.id,
        role: UserRole.STUDENT,
        username: "sam",
        pinHash,
        firstName: "Sam",
        yearGroup: 10,
        points: 0,
        level: "Getting started",
      },
      {
        trustId: trust.id,
        role: UserRole.TRUST_ADMIN,
        username: "trust.admin",
        pinHash: staffPin,
        firstName: "Trust",
        yearGroup: null,
        points: 0,
        level: "Getting started",
      },
      {
        schoolId: schoolA.id,
        trustId: trust.id,
        role: UserRole.SCHOOL_ADMIN,
        username: "lead.ap",
        pinHash: staffPin,
        firstName: "AP Lead",
        yearGroup: null,
        points: 0,
        level: "Getting started",
      },
    ],
  });

  console.log("Seeded trust:", trust.name);
  console.log("Schools:", schoolA.slug, schoolB.slug);
  console.log("Students: alex/4821, jordan/7392 @ riverside-ap | sam/4821 @ oakfield");
  console.log("Staff: trust.admin/0000, lead.ap/0000");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
