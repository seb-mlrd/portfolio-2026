import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Données fictives pour le développement.
// ⚠️ Vide puis remplit les tables Project, Experience, Education et Skill.
const prisma = new PrismaClient();

const projects = [
  {
    title: "Atelier Lumen",
    slug: "atelier-lumen",
    description: "Site vitrine et boutique en ligne pour un atelier de céramique artisanale.",
    content:
      "Refonte complète du site d'un atelier de céramique : catalogue produits, paiement Stripe, prise de rendez-vous pour les cours et back-office pour gérer les stocks.\n\nL'accent a été mis sur la performance (Lighthouse > 95) et sur des animations discrètes au scroll.",
    coverImage: "https://picsum.photos/seed/lumen/1200/800",
    tags: ["Next.js", "Stripe", "Prisma", "Tailwind"],
    githubUrl: "https://github.com/exemple/atelier-lumen",
    liveUrl: "https://atelier-lumen.example.com",
    featured: true,
    published: true,
    order: 0,
  },
  {
    title: "Trackr",
    slug: "trackr",
    description: "Application de suivi d'habitudes avec statistiques et rappels.",
    content:
      "PWA permettant de créer des habitudes, de cocher sa progression au quotidien et de visualiser ses séries sous forme de heatmap.\n\nNotifications push, mode hors-ligne et synchronisation multi-appareils.",
    coverImage: "https://picsum.photos/seed/trackr/1200/800",
    tags: ["React", "TypeScript", "PWA", "Supabase"],
    githubUrl: "https://github.com/exemple/trackr",
    liveUrl: "https://trackr.example.com",
    featured: true,
    published: true,
    order: 1,
  },
  {
    title: "Generative Waves",
    slug: "generative-waves",
    description: "Série d'expérimentations en art génératif avec p5.js.",
    content:
      "Collection de sketches interactifs explorant le bruit de Perlin, les champs de vecteurs et les systèmes de particules. Chaque pièce peut être exportée en haute résolution.",
    coverImage: "https://picsum.photos/seed/waves/1200/800",
    tags: ["p5.js", "Creative coding", "Canvas"],
    githubUrl: "https://github.com/exemple/generative-waves",
    liveUrl: null,
    featured: true,
    published: true,
    order: 2,
  },
  {
    title: "API Covoit'",
    slug: "api-covoit",
    description: "API REST de covoiturage entre étudiants d'un même campus.",
    content:
      "Back-end Node.js : authentification JWT, recherche de trajets géolocalisée avec PostGIS, système de réservation et de notation.\n\nTests d'intégration et CI GitHub Actions.",
    coverImage: "https://picsum.photos/seed/covoit/1200/800",
    tags: ["Node.js", "Express", "PostgreSQL", "PostGIS", "Docker"],
    githubUrl: "https://github.com/exemple/api-covoit",
    liveUrl: null,
    featured: false,
    published: true,
    order: 3,
  },
  {
    title: "Dashboard Météo",
    slug: "dashboard-meteo",
    description: "Tableau de bord météo avec prévisions sur 7 jours et graphiques.",
    content: "Petit projet consommant l'API Open-Meteo, avec graphiques de température et de précipitations.",
    coverImage: "https://picsum.photos/seed/meteo/1200/800",
    tags: ["Vue.js", "Chart.js", "API"],
    githubUrl: "https://github.com/exemple/dashboard-meteo",
    liveUrl: "https://meteo.example.com",
    featured: false,
    published: true,
    order: 4,
  },
  {
    title: "Projet en cours",
    slug: "projet-en-cours",
    description: "Brouillon non publié, pour tester l'affichage dans l'admin.",
    content: null,
    coverImage: null,
    tags: ["WIP"],
    githubUrl: null,
    liveUrl: null,
    featured: false,
    published: false,
    order: 5,
  },
];

const experiences = [
  {
    role: "Développeur full stack",
    company: "Studio Pixel Nord",
    location: "Nice",
    contractType: "Alternance",
    startDate: new Date("2024-09-01T00:00:00.000Z"),
    endDate: null,
    description:
      "Développement de sites et d'applications web pour des clients de l'agence. Mise en place d'un starter Next.js interne, intégration de maquettes Figma et création d'API.",
    stack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Tailwind"],
    order: 0,
  },
  {
    role: "Développeur front-end",
    company: "Azur Logistique",
    location: "Sophia Antipolis",
    contractType: "Stage",
    startDate: new Date("2024-03-01T00:00:00.000Z"),
    endDate: new Date("2024-06-30T00:00:00.000Z"),
    description:
      "Refonte de l'interface de suivi des livraisons utilisée par les équipes terrain. Création d'une bibliothèque de composants et amélioration de l'accessibilité.",
    stack: ["React", "TypeScript", "Storybook", "Jest"],
    order: 1,
  },
  {
    role: "Développeur web",
    company: "Freelance",
    location: "À distance",
    contractType: "Freelance",
    startDate: new Date("2023-01-01T00:00:00.000Z"),
    endDate: new Date("2024-02-28T00:00:00.000Z"),
    description:
      "Réalisation de sites vitrines pour des artisans et associations locales : conception, développement, hébergement et maintenance.",
    stack: ["WordPress", "PHP", "JavaScript", "SCSS"],
    order: 2,
  },
];

const educations = [
  {
    degree: "Mastère Expert en développement web",
    school: "École Supérieure du Numérique",
    location: "Nice",
    startYear: 2024,
    endYear: 2026,
    description: "Formation en alternance : architecture logicielle, DevOps, sécurité et gestion de projet agile.",
    order: 0,
  },
  {
    degree: "BUT Informatique — parcours développement",
    school: "IUT Nice Côte d'Azur",
    location: "Nice",
    startYear: 2021,
    endYear: 2024,
    description: "Algorithmique, bases de données, développement web et mobile, projets tutorés en équipe.",
    order: 1,
  },
  {
    degree: "Baccalauréat général — spécialités NSI et Mathématiques",
    school: "Lycée Masséna",
    location: "Nice",
    startYear: 2018,
    endYear: 2021,
    description: null,
    order: 2,
  },
];

const skills = [
  {
    title: "Concevoir des applications web complètes",
    description:
      "De la modélisation des données jusqu'au déploiement, je construis des applications robustes en choisissant une architecture adaptée au besoin plutôt qu'à la mode.",
    keywords: ["Architecture", "API", "Base de données", "Déploiement"],
    order: 0,
  },
  {
    title: "Créer des interfaces soignées",
    description:
      "J'intègre des maquettes au pixel près, avec une attention particulière à l'accessibilité, au responsive et aux micro-interactions qui rendent une interface agréable.",
    keywords: ["UI", "Accessibilité", "Responsive", "Animations"],
    order: 1,
  },
  {
    title: "Optimiser la performance",
    description:
      "Mesurer avant d'optimiser : Core Web Vitals, rendu serveur, mise en cache et réduction du JavaScript envoyé au client.",
    keywords: ["Core Web Vitals", "SSR", "Cache", "SEO"],
    order: 2,
  },
  {
    title: "Travailler en équipe",
    description:
      "Habitué aux méthodes agiles, aux revues de code et à la documentation, je cherche à écrire du code que les autres auront plaisir à reprendre.",
    keywords: ["Agile", "Git", "Code review", "Documentation"],
    order: 3,
  },
];

async function main() {
  await prisma.$transaction([
    prisma.project.deleteMany(),
    prisma.experience.deleteMany(),
    prisma.education.deleteMany(),
    prisma.skill.deleteMany(),
    prisma.project.createMany({ data: projects }),
    prisma.experience.createMany({ data: experiences }),
    prisma.education.createMany({ data: educations }),
    prisma.skill.createMany({ data: skills }),
  ]);

  console.log(
    `Mock data: ${projects.length} projets, ${experiences.length} expériences, ${educations.length} formations, ${skills.length} compétences`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
