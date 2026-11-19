/**
 * Seed script – run with `npm run db:seed` (also runs after `prisma migrate reset`).
 *
 * Safe to run more than once: it creates the admin user and the singleton rows
 * if they are missing, and only adds sample content to tables that are empty.
 * Personal details are deliberately left as [placeholders] for the doctor to fill in.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const P = "/placeholders";

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  if (!email || password.length < 8) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 characters) in .env before seeding.");
  }
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`✓ Admin ${email} already exists (password unchanged – use "npm run admin:reset-password" to change it)`);
    return;
  }
  await prisma.adminUser.create({
    data: { email, name: process.env.ADMIN_NAME || "Admin", passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log(`✓ Created admin ${email}`);
}

async function seedSingletons() {
  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteName: "Dr. Deepmala Mourya",
      tagline: "Ayurveda · Professor",
      heroEyebrow: "Ayurvedic Physician & Professor · Bhopal",
      heroTitle: "Rediscover balance with the timeless wisdom of Ayurveda",
      heroSubtitle:
        "Personalised Ayurvedic consultation, diet and lifestyle guidance, and education rooted in classical texts – for a healthier, calmer you.",
      heroImageUrl: `${P}/doctor-portrait.svg`,
      introTitle: "Healing that begins with understanding you",
      introText:
        "Ayurveda looks at the whole person – body, mind and daily habits. Every consultation starts with listening, followed by gentle, practical guidance you can follow at home. [Edit this introduction from Admin → Site Settings.]",
      ctaTitle: "Begin your journey towards balanced health",
      ctaText: "Have a question or want to schedule a consultation? Send an inquiry and we will get back to you.",
      phone: "+91 00000 00000",
      email: "contact@example.com",
      whatsappNumber: "",
      address: "[Clinic / College address]\nBhopal, Madhya Pradesh, India",
      timings: "Mon – Sat: 10:00 AM – 1:00 PM\n[Update timings from admin]",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117223.77!2d77.33!3d23.25!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c428f8fd68fbd%3A0x2155716d572d4f8!2sBhopal%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000",
      mapLink: "https://maps.google.com/?q=Bhopal,+Madhya+Pradesh",
      footerText: "Ayurvedic consultation, education and wellness guidance from Bhopal, Madhya Pradesh.",
      metaTitle: "Dr. Deepmala Mourya – Ayurvedic Physician & Professor, Bhopal",
      metaDescription:
        "Ayurvedic consultations, Panchakarma guidance, diet & lifestyle counselling and Ayurveda health articles by Dr. Deepmala Mourya, Professor of Ayurveda in Bhopal.",
      metaKeywords: "Ayurveda, Ayurvedic doctor Bhopal, Panchakarma, diet and lifestyle, women's health",
    },
  });

  await prisma.profile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      fullName: "Dr. Deepmala Mourya",
      title: "Ayurvedic Physician",
      degrees: "[BAMS / MD (Ayurveda) – please update]",
      designation: "Professor",
      institution: "[Government Ayurveda College name], Bhopal, Madhya Pradesh",
      shortBio:
        "Ayurvedic physician and Professor of Ayurveda, dedicated to patient care, teaching and spreading authentic Ayurvedic knowledge. [Edit this short bio from Admin → Profile.]",
      bioHtml:
        "<p>[Write your biography here from <strong>Admin → Profile &amp; About</strong>.]</p><p>This section can describe your journey into Ayurveda, your approach to patient care, your areas of special interest and what patients can expect during a consultation.</p><p>Ayurveda is not only a system of medicine but a way of living. The aim is to help every person understand their own constitution (<em>Prakriti</em>) and make simple, sustainable changes to diet, routine and lifestyle.</p>",
      academicHtml:
        "<p>Serving as <strong>Professor</strong> at <strong>[Government Ayurveda College name], Bhopal</strong>. [Describe your department, subjects taught, and academic responsibilities here.]</p><ul><li>Undergraduate (BAMS) and postgraduate teaching</li><li>Guiding research scholars</li><li>Organising seminars, workshops and health camps</li></ul>",
      photoUrl: `${P}/doctor-portrait.svg`,
      aboutImageUrl: `${P}/about.svg`,
    },
  });
  console.log("✓ Settings and profile");
}

async function seedIfEmpty(name: string, count: () => Promise<number>, run: () => Promise<unknown>) {
  if ((await count()) > 0) return console.log(`• ${name}: already has data, skipped`);
  await run();
  console.log(`✓ ${name}`);
}

async function seedContent() {
  await seedIfEmpty("Stats", () => prisma.stat.count(), () =>
    prisma.stat.createMany({
      data: [
        { label: "Years of experience", value: 10, suffix: "+", icon: "award", order: 0 },
        { label: "Students taught", value: 1000, suffix: "+", icon: "graduation", order: 1 },
        { label: "Patients guided", value: 5000, suffix: "+", icon: "heart", order: 2 },
        { label: "Publications", value: 10, suffix: "+", icon: "book", order: 3 },
      ],
    }),
  );

  await seedIfEmpty("Qualifications", () => prisma.qualification.count(), () =>
    prisma.qualification.createMany({
      data: [
        { degree: "[MD (Ayurveda) – Specialisation]", institution: "[University / College]", year: "[Year]", order: 0 },
        { degree: "[BAMS – Bachelor of Ayurvedic Medicine & Surgery]", institution: "[University / College]", year: "[Year]", order: 1 },
      ],
    }),
  );

  await seedIfEmpty("Timeline", () => prisma.timelineItem.count(), () =>
    prisma.timelineItem.createMany({
      data: [
        { period: "[Year] – Present", title: "Professor", organization: "[Government Ayurveda College name], Bhopal", description: "Teaching, research guidance and clinical work. [Edit from admin]", order: 0 },
        { period: "[Year] – [Year]", title: "[Previous role]", organization: "[Institution]", description: "[Short description of responsibilities]", order: 1 },
        { period: "[Year]", title: "Started clinical practice", organization: "[Place]", description: "[Short description]", order: 2 },
      ],
    }),
  );

  await seedIfEmpty("Achievements", () => prisma.achievement.count(), () =>
    prisma.achievement.createMany({
      data: [
        { kind: "AWARD", title: "[Award name]", issuer: "[Awarding body]", year: "[Year]", description: "[Short description]", order: 0 },
        { kind: "CERTIFICATE", title: "[Certificate / Training]", issuer: "[Institution]", year: "[Year]", imageUrl: `${P}/certificate.svg`, order: 1 },
        { kind: "MEMBERSHIP", title: "[Professional body membership]", issuer: "[Organisation]", year: "", order: 2 },
      ],
    }),
  );

  await seedIfEmpty("Publications", () => prisma.publication.count(), () =>
    prisma.publication.createMany({
      data: [
        { title: "[Research paper title]", authors: "Deepmala Mourya, et al.", journal: "[Journal name]", year: "[Year]", url: "", order: 0 },
        { title: "[Another publication title]", authors: "Deepmala Mourya", journal: "[Journal / Conference]", year: "[Year]", url: "", order: 1 },
      ],
    }),
  );

  await seedIfEmpty("Services", () => prisma.service.count(), async () => {
    const services = [
      {
        title: "Panchakarma Therapy",
        slug: "panchakarma-therapy",
        icon: "droplets",
        imageUrl: `${P}/service-panchakarma.svg`,
        shortDescription: "Classical Ayurvedic detoxification and rejuvenation, planned to suit your constitution and condition.",
        contentHtml:
          "<p>Panchakarma is Ayurveda's classical set of five purification procedures. It aims to remove accumulated <em>doshas</em> and restore the body's natural balance.</p><h2>What it involves</h2><ul><li>Initial consultation and assessment of Prakriti and current health</li><li>Preparatory therapies (<em>Purvakarma</em>) such as Snehana and Swedana</li><li>The main procedure selected for your needs</li><li>Post-therapy diet and routine guidance (<em>Paschat karma</em>)</li></ul><p>The suitability, duration and type of Panchakarma is decided only after a personal consultation.</p>",
        order: 0,
      },
      {
        title: "Diet & Lifestyle Counselling",
        slug: "diet-and-lifestyle-counselling",
        icon: "salad",
        imageUrl: `${P}/service-diet.svg`,
        shortDescription: "Practical guidance on Ahara (diet), Dinacharya (daily routine) and Ritucharya (seasonal routine).",
        contentHtml:
          "<p>Small, steady changes in what, when and how we eat can make a big difference. This counselling helps you build a routine that suits your body type and lifestyle.</p><h2>Areas covered</h2><ul><li>Understanding your Prakriti (body constitution)</li><li>Meal timing, food combinations and portion guidance</li><li>Daily routine – sleep, exercise, self-care</li><li>Seasonal adjustments to diet and habits</li></ul>",
        order: 1,
      },
      {
        title: "Women's Health",
        slug: "womens-health",
        icon: "flower",
        imageUrl: `${P}/service-women.svg`,
        shortDescription: "Ayurvedic support for menstrual health, wellbeing at every life stage, and holistic self-care.",
        contentHtml:
          "<p>Ayurveda offers gentle, holistic support for women's health across different stages of life.</p><h2>Consultation may include</h2><ul><li>Menstrual health and cycle-related concerns</li><li>Diet and lifestyle guidance for each life stage</li><li>Stress management and sleep</li></ul><p>Please continue any ongoing treatment advised by your doctor; Ayurvedic guidance is planned alongside it after consultation.</p>",
        order: 2,
      },
    ];
    for (const s of services) await prisma.service.create({ data: s });
  });

  await seedIfEmpty("Blog", () => prisma.blogPost.count(), async () => {
    const tips = await prisma.category.upsert({
      where: { type_slug: { type: "BLOG", slug: "health-tips" } },
      update: {},
      create: { name: "Health Tips", slug: "health-tips", type: "BLOG", order: 0 },
    });
    const seasonal = await prisma.category.upsert({
      where: { type_slug: { type: "BLOG", slug: "seasonal-care" } },
      update: {},
      create: { name: "Seasonal Care", slug: "seasonal-care", type: "BLOG", order: 1 },
    });
    await prisma.blogPost.create({
      data: {
        title: "Dinacharya: A Simple Ayurvedic Daily Routine",
        slug: "dinacharya-simple-ayurvedic-daily-routine",
        excerpt: "A gentle daily routine is the foundation of good health in Ayurveda. Here are simple habits you can start this week.",
        coverImageUrl: `${P}/blog-1.svg`,
        categoryId: tips.id,
        tags: "dinacharya, daily routine, lifestyle",
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        contentHtml:
          "<p>In Ayurveda, <strong>Dinacharya</strong> (daily routine) helps keep the body's natural rhythms in balance. You don't need to change everything at once – start with one or two habits.</p><h2>1. Wake up early</h2><p>Rising before sunrise (<em>Brahma muhurta</em>) is traditionally recommended for a fresh mind.</p><h2>2. Oral care</h2><p>Brushing and gentle tongue cleaning are simple daily hygiene steps.</p><h2>3. Warm water</h2><p>Many people find a glass of lukewarm water in the morning comforting.</p><h2>4. Regular meal times</h2><p>Eating at roughly the same times each day, with lunch as the main meal, supports digestion (<em>Agni</em>).</p><blockquote><p>Consistency matters more than perfection.</p></blockquote><p><em>Please consult a qualified practitioner before making significant changes, especially if you have a medical condition.</em></p>",
      },
    });
    await prisma.blogPost.create({
      data: {
        title: "Ritucharya: Adjusting Your Routine With the Seasons",
        slug: "ritucharya-adjusting-routine-with-seasons",
        excerpt: "Ayurveda recommends adapting diet and habits to each season. Learn the basic idea behind Ritucharya.",
        coverImageUrl: `${P}/blog-2.svg`,
        categoryId: seasonal.id,
        tags: "ritucharya, seasons, diet",
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        contentHtml:
          "<p><strong>Ritucharya</strong> means seasonal routine. As the weather changes, so do the needs of our body.</p><h2>The basic idea</h2><p>Ayurveda describes six seasons (<em>ritus</em>). Each season tends to influence the doshas differently, so diet and activity are adjusted accordingly.</p><h2>General examples</h2><ul><li><strong>Summer:</strong> lighter, cooling foods and adequate fluids.</li><li><strong>Monsoon:</strong> easily digestible, freshly cooked meals.</li><li><strong>Winter:</strong> nourishing, warm meals and regular exercise.</li></ul><p><em>These are general educational notes, not personal medical advice.</em></p>",
      },
    });
  });

  await seedIfEmpty("Gallery", () => prisma.galleryAlbum.count(), async () => {
    const albums = [
      { title: "Lectures & Seminars", slug: "lectures-seminars", description: "Teaching sessions, guest lectures and academic seminars.", images: [1, 2, 4] },
      { title: "Health Camps & Events", slug: "health-camps-events", description: "Community health camps, awareness drives and events.", images: [3, 5, 6] },
    ];
    for (const [i, a] of albums.entries()) {
      await prisma.galleryAlbum.create({
        data: {
          title: a.title,
          slug: a.slug,
          description: a.description,
          coverImageUrl: `${P}/gallery-${a.images[0]}.svg`,
          order: i,
          images: {
            create: a.images.map((n, j) => ({
              url: `${P}/gallery-${n}.svg`,
              caption: `Sample photo ${j + 1} – replace from admin`,
              alt: `${a.title} sample photo ${j + 1}`,
              order: j,
            })),
          },
        },
      });
    }
  });

  await seedIfEmpty("Videos", () => prisma.video.count(), async () => {
    const cat = await prisma.category.upsert({
      where: { type_slug: { type: "VIDEO", slug: "health-talks" } },
      update: {},
      create: { name: "Health Talks", slug: "health-talks", type: "VIDEO", order: 0 },
    });
    await prisma.video.createMany({
      data: [
        {
          title: "Sample video – replace with your YouTube link",
          description: "Go to Admin → Videos to paste a real YouTube or Vimeo link, or upload an MP4 file.",
          source: "YOUTUBE",
          url: "https://www.youtube.com/watch?v=SAMPLE00001",
          thumbnailUrl: `${P}/video-1.svg`,
          categoryId: cat.id,
          isFeatured: true,
          order: 0,
        },
        {
          title: "Sample lecture video",
          description: "Placeholder entry. Edit or delete it from the admin panel.",
          source: "YOUTUBE",
          url: "https://www.youtube.com/watch?v=SAMPLE00002",
          thumbnailUrl: `${P}/video-2.svg`,
          categoryId: cat.id,
          order: 1,
        },
      ],
    });
  });

  await seedIfEmpty("Feedback", () => prisma.feedback.count(), () =>
    prisma.feedback.createMany({
      data: [
        { name: "Sample Visitor", city: "Bhopal", rating: 5, message: "This is a sample testimonial so you can see how the section looks. Approve real feedback from the admin panel and delete this one.", status: "APPROVED", isFeatured: true },
        { name: "Sample Student", city: "Indore", rating: 5, message: "Another sample testimonial. Real feedback submitted on the website appears in Admin → Feedback for approval.", status: "APPROVED" },
        { name: "Sample Pending", city: "Jabalpur", rating: 4, message: "A sample feedback waiting for approval – it is not shown on the website until approved.", status: "PENDING" },
      ],
    }),
  );

  await seedIfEmpty("Inquiries", () => prisma.inquiry.count(), () =>
    prisma.inquiry.create({
      data: { name: "Sample Inquiry", phone: "+91 00000 00000", email: "sample@example.com", subject: "Consultation", preferredTime: "Morning", message: "This is a sample inquiry so you can try the Inquiries screen. You can delete it." },
    }),
  );

  if ((await prisma.activityLog.count()) === 0) {
    await prisma.activityLog.create({ data: { action: "seed", entity: "site", summary: "Website created with sample content" } });
  }
}

async function main() {
  await seedAdmin();
  await seedSingletons();
  await seedContent();
  console.log("\nSeeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
