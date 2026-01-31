
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding speaker workshop...');

    // 1. Ensure Speaker exists
    const email = 'speaker@wms.com';
    let speaker = await prisma.user.findUnique({ where: { email } });

    if (!speaker) {
        console.log('Creating speaker...');
        const hashedPassword = await bcrypt.hash('speaker123', 10);
        speaker = await prisma.user.create({
            data: {
                name: 'Speaker One',
                email,
                passwordHash: hashedPassword,
                role: 'SPEAKER',
                phone: '1234567890',
                bio: 'Test Speaker Bio',
            },
        });
    }
    console.log(`Speaker ID: ${speaker.id}`);

    // 2. Ensure Category exists
    let category = await prisma.category.findFirst();
    if (!category) {
        category = await prisma.category.create({
            data: {
                name: 'Tech',
                slug: 'tech',
                description: 'Technology workshops',
            },
        });
    }

    // 3. Create Workshop
    console.log('Creating workshop...');
    const workshop = await prisma.workshop.create({
        data: {
            title: 'Advanced React Patterns',
            description: 'Master React with advanced patterns and performance optimization.',
            categoryId: category.id,
            speakerId: speaker.id,
            price: 100,
            startDate: new Date('2026-03-01'),
            endDate: new Date('2026-03-02'),
            status: 'PUBLISHED',
            maxSeats: 50,
            tags: 'react,frontend,advanced',
        },
    });
    console.log(`Workshop created: ${workshop.title} (${workshop.id})`);

    // 4. Create Session
    console.log('Creating session...');
    const session = await prisma.session.create({
        data: {
            workshopId: workshop.id,
            title: 'Morning Session: Performance',
            description: 'Deep dive into rendering optimization',
            sessionDate: new Date('2026-03-01'),
            startTime: '09:00',
            endTime: '12:00',
        },
    });
    console.log(`Session created: ${session.title} (${session.id})`);

    // 5. Create Student & Registration
    const studentEmail = 'student_attendee@test.com';
    let student = await prisma.user.findUnique({ where: { email: studentEmail } });
    if (!student) {
        const hashedPassword = await bcrypt.hash('student123', 10);
        student = await prisma.user.create({
            data: {
                name: 'Attendee Student',
                email: studentEmail,
                passwordHash: hashedPassword,
                role: 'STUDENT',
            },
        });
    }

    const registration = await prisma.registration.create({
        data: {
            userId: student.id,
            workshopId: workshop.id,
            status: 'CONFIRMED',
        },
    });

    // Create Payment
    await prisma.payment.create({
        data: {
            userId: student.id,
            workshopId: workshop.id,
            amount: 100,
            currency: 'USD',
            status: 'COMPLETED',
            paymentMethod: 'TEST',
            gatewayTransactionId: 'tx_seed_123',
        },
    });
    console.log(`Student ${student.email} registered for workshop.`);

    console.log('✅ Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
