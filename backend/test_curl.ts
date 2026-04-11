const executeTest = async () => {
    try {
        const loginRes = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            body: JSON.stringify({ schoolId: 'ADMIN', password: 'ADMIN' }),
            headers: { 'Content-Type': 'application/json' }
        });
        const loginData = await loginRes.json();
        console.log("Login Response:", loginData.error || "Success (Token Hidden)");

        if(!loginData.token) return;

        const userObj = {
            name: 'Test Test',
            role: 'student',
            password: '123',
            schoolId: 'STU-' + Math.random(),
            createdAt: new Date().toISOString(),
            status: 'active',
            email: '',
            phone: '',
            address: '',
            profilePic: '',
            subjects: [],
            studentId: ''
        };

        const postRes = await fetch('http://localhost:3001/users', {
            method: 'POST',
            body: JSON.stringify(userObj),
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
            }
        });
        
        const postData = await postRes.text();
        console.log("POST User Response:", postRes.status, postData);
    } catch(err) {
        console.error("Script err", err);
    }
}
executeTest();
