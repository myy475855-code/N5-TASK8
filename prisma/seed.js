const { PrismaClient, Role } = require("@prisma/client");
const prisma = new PrismaClient();

const cities = [
  "Lahore", "Islamabad", "Rawalpindi", "Karachi", "Faisalabad",
  "Peshawar", "Multan", "Gujranwala", "Sialkot", "Remote"
];
const categories = [
  "Software Development", "Web Development", "Data Science",
  "AI & Machine Learning", "Cybersecurity", "UI/UX Design",
  "Cloud & DevOps", "Mobile Development", "QA & Testing", "Business Analytics"
];
const titles = [
  "Software Engineering Intern", "Frontend Developer Intern",
  "Backend Developer Intern", "Full Stack Developer Intern",
  "Data Analyst Intern", "Machine Learning Intern",
  "Cybersecurity Intern", "UI/UX Design Intern",
  "DevOps Intern", "Mobile App Developer Intern",
  "QA Automation Intern", "Cloud Engineering Intern"
];
const modes = ["On-site", "Hybrid", "Remote"];

async function main() {
  await prisma.internship.deleteMany();
  await prisma.student.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  const companies = [];
  for (let i = 1; i <= 25; i++) {
    const user = await prisma.user.create({
      data: {
        email: `company${i}@example.com`,
        name: `Company User ${i}`,
        role: Role.COMPANY,
        company: {
          create: {
            name: [
              "TechNova", "PakSoft", "CloudPeak", "DataForge", "CodeCraft",
              "NextGen Labs", "ByteWorks", "InnoSystems", "DevSphere", "AI Frontier"
            ][(i - 1) % 10] + ` ${i}`,
            location: cities[(i - 1) % cities.length]
          }
        }
      },
      include: { company: true }
    });
    companies.push(user.company);
  }

  await prisma.user.create({
    data: {
      email: "student@example.com",
      name: "Demo Student",
      role: Role.STUDENT,
      student: { create: { university: "National University" } }
    }
  });

  const records = [];
  for (let i = 0; i < 240; i++) {
    const category = categories[i % categories.length];
    const city = cities[(i * 3) % cities.length];
    const title = titles[i % titles.length];
    const company = companies[i % companies.length];
    records.push({
      title,
      description: `A practical ${category.toLowerCase()} internship at ${company.name}. Work with a professional team on real projects, documentation, testing and deployment.`,
      category,
      location: city,
      workMode: modes[i % modes.length],
      stipend: i % 7 === 0 ? null : 15000 + (i % 8) * 5000,
      duration: 6 + (i % 13),
      companyId: company.id,
      createdAt: new Date(Date.now() - i * 86400000)
    });
  }

  await prisma.internship.createMany({ data: records });
  console.log(`Seeded ${records.length} internships and ${companies.length} companies.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
