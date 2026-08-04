import { PrismaClient, Role, Language, Difficulty } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@studiya.com" },
    update: {},
    create: {
      name: "Studiya Admin",
      email: "admin@studiya.com",
      password: adminPassword,
      role: Role.SUPER_ADMIN,
      emailVerified: new Date(),
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Boards
  const ncert = await prisma.board.upsert({
    where: { slug: "ncert" },
    update: {},
    create: { name: "NCERT", slug: "ncert", description: "National Council of Educational Research and Training", sortOrder: 1 },
  });
  const cbse = await prisma.board.upsert({
    where: { slug: "cbse" },
    update: {},
    create: { name: "CBSE", slug: "cbse", description: "Central Board of Secondary Education", sortOrder: 2 },
  });
  console.log("✅ Boards seeded");

  // Classes
  const classes = [];
  for (let i = 6; i <= 12; i++) {
    const cls = await prisma.class.upsert({
      where: { slug: `class-${i}` },
      update: {},
      create: { name: `Class ${i}`, numeral: i, slug: `class-${i}`, sortOrder: i - 5 },
    });
    classes.push(cls);
  }
  console.log("✅ Classes seeded (6–12)");

  // Subjects
  const subjectsData = [
    { name: "Science", slug: "science", color: "#10b981", icon: "🔬", sortOrder: 1 },
    { name: "Mathematics", slug: "mathematics", color: "#3b82f6", icon: "📐", sortOrder: 2 },
    { name: "Social Science", slug: "social-science", color: "#f59e0b", icon: "🌍", sortOrder: 3 },
    { name: "English", slug: "english", color: "#8b5cf6", icon: "📚", sortOrder: 4 },
    { name: "Hindi", slug: "hindi", color: "#ef4444", icon: "📖", sortOrder: 5 },
    { name: "Sanskrit", slug: "sanskrit", color: "#06b6d4", icon: "🕉️", sortOrder: 6 },
    { name: "Physics", slug: "physics", color: "#f97316", icon: "⚡", sortOrder: 7 },
    { name: "Chemistry", slug: "chemistry", color: "#84cc16", icon: "🧪", sortOrder: 8 },
    { name: "Biology", slug: "biology", color: "#14b8a6", icon: "🧬", sortOrder: 9 },
    { name: "History", slug: "history", color: "#a855f7", icon: "🏛️", sortOrder: 10 },
    { name: "Geography", slug: "geography", color: "#0ea5e9", icon: "🗺️", sortOrder: 11 },
    { name: "Economics", slug: "economics", color: "#f43f5e", icon: "📊", sortOrder: 12 },
    { name: "Computer Science", slug: "computer-science", color: "#6366f1", icon: "💻", sortOrder: 13 },
    { name: "Accountancy", slug: "accountancy", color: "#d97706", icon: "📑", sortOrder: 14 },
    { name: "Business Studies", slug: "business-studies", color: "#dc2626", icon: "🏢", sortOrder: 15 },
  ];

  const subjects: Record<string, { id: string }> = {};
  for (const subjectData of subjectsData) {
    const subject = await prisma.subject.upsert({
      where: { slug: subjectData.slug },
      update: {},
      create: subjectData,
    });
    subjects[subjectData.slug] = subject;
  }
  console.log("✅ Subjects seeded");

  // Class-Subject links
  const class6 = classes[0]; // Class 6
  await prisma.classSubject.upsert({
    where: { classId_subjectId: { classId: class6.id, subjectId: subjects["science"].id } },
    update: {},
    create: { classId: class6.id, subjectId: subjects["science"].id },
  });
  console.log("✅ Class-Subject links seeded");

  // Book: NCERT Science Class 6
  const book = await prisma.book.upsert({
    where: { slug: "ncert-science-class-6" },
    update: {},
    create: {
      title: "Science – Textbook for Class VI",
      slug: "ncert-science-class-6",
      subjectId: subjects["science"].id,
      publisher: "NCERT",
      edition: "2024",
    },
  });
  console.log("✅ Book seeded");

  // Chapters
  const chaptersData = [
    { number: 1, title: "Food: Where Does It Come From?", slug: "food-where-does-it-come-from" },
    { number: 2, title: "Components of Food", slug: "components-of-food" },
    { number: 3, title: "Fibre to Fabric", slug: "fibre-to-fabric" },
    { number: 4, title: "Sorting Materials into Groups", slug: "sorting-materials-into-groups" },
    { number: 5, title: "Separation of Substances", slug: "separation-of-substances" },
    { number: 6, title: "Changes Around Us", slug: "changes-around-us" },
    { number: 7, title: "Getting to Know Plants", slug: "getting-to-know-plants" },
    { number: 8, title: "Body Movements", slug: "body-movements" },
    { number: 9, title: "The Living Organisms and Their Surroundings", slug: "the-living-organisms-and-their-surroundings" },
    { number: 10, title: "Motion and Measurement of Distances", slug: "motion-and-measurement-of-distances" },
    { number: 11, title: "Light, Shadows and Reflections", slug: "light-shadows-and-reflections" },
    { number: 12, title: "Electricity and Circuits", slug: "electricity-and-circuits" },
    { number: 13, title: "Fun with Magnets", slug: "fun-with-magnets" },
    { number: 14, title: "Water", slug: "water" },
    { number: 15, title: "Air Around Us", slug: "air-around-us" },
    { number: 16, title: "Garbage In, Garbage Out", slug: "garbage-in-garbage-out" },
  ];

  const chapters: { id: string; slug: string; title: string; number: number }[] = [];
  for (const chapterData of chaptersData) {
    const chapter = await prisma.chapter.upsert({
      where: { bookId_number: { bookId: book.id, number: chapterData.number } },
      update: {},
      create: { ...chapterData, bookId: book.id },
    });
    chapters.push(chapter);
  }
  console.log("✅ Chapters seeded");

  // Notes for each chapter
  for (const chapter of chapters) {
    const slug = `ncert-class-6-science-chapter-${chapter.number}-${chapter.slug}`;
    await prisma.note.upsert({
      where: { slug },
      update: {},
      create: {
        title: `NCERT Class 6 Science Chapter ${chapter.number}: ${chapter.title} Notes`,
        slug,
        description: `Comprehensive notes for NCERT Class 6 Science Chapter ${chapter.number} – ${chapter.title}. Includes all key concepts, definitions, diagrams, and NCERT solutions to help students score 100/100 in exams.`,
        shortDescription: `Complete Chapter ${chapter.number} notes for Class 6 Science.`,
        classId: class6.id,
        subjectId: subjects["science"].id,
        bookId: book.id,
        chapterId: chapter.id,
        boardId: ncert.id,
        language: Language.ENGLISH,
        price: chapter.number <= 3 ? 0 : 49,
        originalPrice: chapter.number <= 3 ? 0 : 99,
        isFree: chapter.number <= 3,
        isPremium: chapter.number > 3,
        difficulty: Difficulty.EASY,
        totalPages: 12 + chapter.number,
        previewPages: 4,
        isPublished: true,
        isFeatured: chapter.number <= 5,
        isTrending: chapter.number <= 3,
        isNew: true,
        tags: ["class 6", "science", "ncert", chapter.title.toLowerCase(), "notes", "ncert solutions"],
        keywords: ["NCERT Class 6 Science", chapter.title, "Class 6 Science Notes", "NCERT Notes"],
        metaTitle: `NCERT Class 6 Science Chapter ${chapter.number} Notes – ${chapter.title} | Studiya`,
        metaDescription: `Download NCERT Class 6 Science Chapter ${chapter.number} – ${chapter.title} notes. Well-structured, exam-ready notes with key points and diagrams.`,
        publishedAt: new Date(),
      },
    });
  }
  console.log("✅ Notes seeded (all 16 chapters)");

  // Settings
  const settingsData = [
    { key: "site_name", value: "Studiya", type: "string", group: "general", label: "Site Name" },
    { key: "site_tagline", value: "Premium NCERT Notes Platform", type: "string", group: "general", label: "Site Tagline" },
    { key: "site_email", value: "hello@studiya.com", type: "string", group: "general", label: "Site Email" },
    { key: "site_phone", value: "+91 98765 43210", type: "string", group: "general", label: "Site Phone" },
    { key: "razorpay_key_id", value: "", type: "string", group: "payment", label: "Razorpay Key ID" },
    { key: "gst_rate", value: "18", type: "number", group: "payment", label: "GST Rate (%)" },
    { key: "free_preview_pages", value: "4", type: "number", group: "notes", label: "Free Preview Pages" },
    { key: "allow_download", value: "true", type: "boolean", group: "notes", label: "Allow PDF Download" },
    { key: "maintenance_mode", value: "false", type: "boolean", group: "general", label: "Maintenance Mode" },
    { key: "ga4_id", value: "", type: "string", group: "analytics", label: "Google Analytics 4 ID" },
    { key: "clarity_id", value: "", type: "string", group: "analytics", label: "Microsoft Clarity ID" },
  ];

  for (const setting of settingsData) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("✅ Settings seeded");

  // Blog categories
  const blogCats = [
    { name: "Study Tips", slug: "study-tips", color: "#3b82f6" },
    { name: "NCERT", slug: "ncert", color: "#10b981" },
    { name: "Exam Prep", slug: "exam-prep", color: "#f59e0b" },
    { name: "Science", slug: "science", color: "#8b5cf6" },
    { name: "General Knowledge", slug: "general-knowledge", color: "#ef4444" },
  ];
  for (const cat of blogCats) {
    await prisma.blogCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Blog categories seeded");

  console.log("\n🎉 Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
