
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const seedUsers = async () => {
    try {
        console.log('Creating Student...');
        try {
            await axios.post(`${API_URL}/student/register`, {
                name: 'Test Student',
                email: 'student@test.com',
                password: 'Password123!',
                phone: '1234567890'
            });
            console.log('✅ Student created: student@test.com / Password123!');
        } catch (e: any) {
            if (e.response?.status === 409) {
                console.log('⚠️ Student already exists');
            } else {
                console.error('❌ Failed to create student:', e.message);
                if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
            }
        }

        console.log('Creating Speaker...');
        try {
            await axios.post(`${API_URL}/speaker/register`, {
                name: 'Test Speaker',
                email: 'speaker@test.com',
                password: 'Password123!',
                phone: '0987654321',
                bio: 'Expert speaker',
                expertise: ['React', 'Node.js']
            });
            console.log('✅ Speaker created: speaker@test.com / Password123!');
        } catch (e: any) {
            if (e.response?.status === 409) {
                console.log('⚠️ Speaker already exists');
            } else {
                console.error('❌ Failed to create speaker:', e.message);
                if (e.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
            }
        }

    } catch (error) {
        console.error('Seeding failed:', error);
    }
};

seedUsers();
