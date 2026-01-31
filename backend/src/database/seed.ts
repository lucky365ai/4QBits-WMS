import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@wms.com' },
    update: {},
    create: {
      email: 'admin@wms.com',
      passwordHash: adminPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      isVerified: true,
      isApproved: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create categories
  const categories = [
    {
      name: 'Technology',
      slug: 'technology',
      description: 'Programming, AI, Web Development, and Tech Skills',
    },
    {
      name: 'Business',
      slug: 'business',
      description: 'Entrepreneurship, Marketing, Finance, and Business Skills',
    },
    {
      name: 'Design',
      slug: 'design',
      description: 'UI/UX, Graphic Design, Product Design, and Creative Skills',
    },
    {
      name: 'Personal Development',
      slug: 'personal-development',
      description: 'Leadership, Communication, and Personal Growth',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('✅ Categories created');

  // Create a sample speaker
  const speakerPassword = await bcrypt.hash('speaker123', 12);
  const speaker = await prisma.user.upsert({
    where: { email: 'speaker@wms.com' },
    update: {},
    create: {
      email: 'speaker@wms.com',
      passwordHash: speakerPassword,
      name: 'John Doe',
      role: 'SPEAKER',
      bio: 'Experienced software developer with 10+ years in web development',
      expertise: 'JavaScript,React,Node.js,TypeScript',
      isVerified: true,
      isApproved: true,
    },
  });

  console.log('✅ Sample speaker created:', speaker.email);

  // Create a sample student
  const studentPassword = await bcrypt.hash('student123', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@wms.com' },
    update: {},
    create: {
      email: 'student@wms.com',
      passwordHash: studentPassword,
      name: 'Jane Smith',
      role: 'STUDENT',
      isVerified: true,
      isApproved: true,
    },
  });

  console.log('✅ Sample student created:', student.email);

  // Get categories for workshops
  const techCategory = await prisma.category.findUnique({ where: { slug: 'technology' } });
  const businessCategory = await prisma.category.findUnique({ where: { slug: 'business' } });
  const designCategory = await prisma.category.findUnique({ where: { slug: 'design' } });

  // Create sample workshops
  const workshops = [
    {
      title: 'Introduction to React Development',
      description: 'Learn the fundamentals of React, including components, hooks, and state management. Perfect for beginners.',
      categoryId: techCategory!.id,
      speakerId: speaker.id,
      price: 0,
      maxSeats: 50,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
      tags: 'React,JavaScript,Frontend,Web Development',
      requirements: 'Basic knowledge of HTML, CSS, and JavaScript',
      learningOutcomes: 'Build React applications,Understand component architecture,Master React hooks',
      status: 'PUBLISHED' as const,
    },
    {
      title: 'Digital Marketing Fundamentals',
      description: 'Master the essentials of digital marketing including SEO, social media, and content marketing strategies.',
      categoryId: businessCategory!.id,
      speakerId: speaker.id,
      price: 99,
      maxSeats: 30,
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 16 days from now
      tags: 'Marketing,SEO,Social Media,Business',
      requirements: 'No prior experience required',
      learningOutcomes: 'Create marketing campaigns,Understand SEO basics,Master social media marketing',
      status: 'PUBLISHED' as const,
    },
    {
      title: 'UI/UX Design Principles',
      description: 'Learn the core principles of user interface and user experience design. Create beautiful and functional designs.',
      categoryId: designCategory!.id,
      speakerId: speaker.id,
      price: 149,
      maxSeats: 25,
      startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
      endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000), // 23 days from now
      tags: 'Design,UI,UX,Creative',
      requirements: 'Basic design sense, familiarity with design tools helpful',
      learningOutcomes: 'Design user interfaces,Understand UX principles,Create design systems',
      status: 'PUBLISHED' as const,
    },
  ];

  for (const workshopData of workshops) {
    const workshop = await prisma.workshop.create({
      data: workshopData,
    });

    // Create sessions for each workshop
    const sessionDates = [
      new Date(workshopData.startDate),
      new Date(new Date(workshopData.startDate).getTime() + 24 * 60 * 60 * 1000),
    ];

    for (let i = 0; i < sessionDates.length; i++) {
      await prisma.session.create({
        data: {
          workshopId: workshop.id,
          title: `Session ${i + 1}`,
          description: `Day ${i + 1} of ${workshopData.title}`,
          sessionDate: sessionDates[i],
          startTime: '10:00',
          endTime: '12:00',
        },
      });
    }

    console.log(`✅ Workshop created: ${workshop.title}`);
  }

  console.log('🎉 Database seeding completed!');
  console.log('\n📋 Test Accounts:');
  console.log('Admin: admin@wms.com / admin123');
  console.log('Speaker: speaker@wms.com / speaker123');
  console.log('Student: student@wms.com / student123');
  console.log('\n📚 Test Workshops Created:');
  console.log('- Introduction to React Development (Free)');
  console.log('- Digital Marketing Fundamentals ($99)');
  console.log('- UI/UX Design Principles ($149)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });