
async function testLogin() {
    try {
        console.log("Testing login with admin/1234...");
        const response = await fetch("http://localhost:3000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "admin", password: "1234" })
        });

        const data = await response.json();
        console.log("Status Code:", response.status);
        console.log("Response Body:", data);

        if (response.ok && data.success) {
            console.log("✅ LOGIN SUCCESSFUL via Script");
        } else {
            console.log("❌ LOGIN FAILED via Script");
        }

    } catch (error) {
        console.error("❌ Network/Server Error:", error.message);
    }
}

testLogin();
