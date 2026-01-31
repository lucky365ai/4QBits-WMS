
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function main() {
    try {
        // 1. Login
        console.log('Logging in as speaker...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'speaker@wms.com',
            password: 'speaker123'
        });
        const token = loginRes.data.data.token;
        console.log('Login successful. Token obtained.');
        const headers = { Authorization: `Bearer ${token}` };

        // 2. Get Speaker Workshops
        console.log('Fetching speaker workshops...');
        const workshopsRes = await axios.get(`${API_URL}/workshops/speaker`, { headers });
        console.log(`Found ${workshopsRes.data.data.workshops.length} workshops.`);

        const workshop = workshopsRes.data.data.workshops.find((w: any) => w.title === 'Advanced React Patterns');
        if (!workshop) throw new Error('Workshop "Advanced React Patterns" not found!');
        console.log('Found workshop:', workshop.title, 'ID:', workshop.id);

        // 3. Get Sessions
        console.log(`Fetching sessions for workshop ${workshop.id}...`);

        // Fetch workshop details which includes sessions
        // Actually, getting sessions for a workshop might be public: /api/workshops/:id includes sessions.
        // Or we can use the speaker specific route if it exists?
        // Let's rely on the public endpoint or the workshop details which includes sessions.

        const workshopDetailsRes = await axios.get(`${API_URL}/workshops/${workshop.id}`, { headers });
        const sessions = workshopDetailsRes.data.data.workshop.sessions;
        const session = sessions.find((s: any) => s.title === 'Morning Session: Performance');

        if (!session) throw new Error('Session "Morning Session: Performance" not found!');
        console.log('Found session:', session.title, 'ID:', session.id);

        // 4. Get Attendance
        console.log(`Fetching attendance for session ${session.id}...`);
        // Route: router.get('/sessions/:id/attendance', ... sessionController.getSessionAttendance)
        const attendanceRes = await axios.get(`${API_URL}/workshops/sessions/${session.id}/attendance`, { headers });
        console.log('Attendance data received');
        const registrations = attendanceRes.data.data.registrations;
        const studentReg = registrations.find((r: any) => r.user.email === 'student_attendee@test.com');

        if (!studentReg) {
            console.log('Registrations:', JSON.stringify(registrations, null, 2));
            throw new Error('Student not found in registrations list');
        }
        const studentId = studentReg.user.id;
        console.log('Student ID found:', studentId);

        // Mark
        const markRes = await axios.post(`${API_URL}/workshops/sessions/${session.id}/attendance`, {
            userId: studentId,
            status: true // or whatever the body expects
        }, { headers });

        console.log('Mark attendance response:', markRes.status);
        console.log('✅ API Verification Successful');

    } catch (e: any) {
        console.error('❌ Verification Failed:', e);
        if (e.response) {
            console.error('Response Status:', e.response.status);
            console.error('Response Data:', JSON.stringify(e.response.data, null, 2));
        }
        process.exit(1);
    }
}

main();
