import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@portfolio.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin",
        password: hashed,
        role: Role.ADMIN,
      },
    });
    console.log(`Admin user created: ${adminEmail}`);
  } else {
    console.log("Admin user already exists");
  }

  // Contenu d'exemple, créé uniquement si les tables sont vides
  if ((await prisma.experience.count()) === 0) {
    await prisma.experience.create({
      data: {
        role: "Développeur full stack",
        company: "Entreprise exemple",
        location: "Nice",
        contractType: "Alternance",
        startDate: new Date("2024-09-01T00:00:00.000Z"),
        description: "Développement de nouvelles fonctionnalités front et back, à remplacer depuis l'admin.",
        stack: ["Next.js", "TypeScript", "PostgreSQL"],
      },
    });
    console.log("Sample experience created");
  }

  if ((await prisma.education.count()) === 0) {
    await prisma.education.create({
      data: {
        degree: "Diplôme exemple",
        school: "École exemple",
        location: "Paris",
        startYear: 2023,
        endYear: 2025,
        description: "À remplacer depuis l'admin.",
      },
    });
    console.log("Sample education created");
  }

  if ((await prisma.skill.count()) === 0) {
    await prisma.skill.create({
      data: {
        title: "Concevoir des applications web complètes",
        description: "De la modélisation des données jusqu'au déploiement. À remplacer depuis l'admin.",
        keywords: ["Architecture", "API", "Déploiement"],
      },
    });
    console.log("Sample skill created");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
