import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const packages = await prisma.photoshootPackage.findMany();
  console.log(packages);
}

main();
