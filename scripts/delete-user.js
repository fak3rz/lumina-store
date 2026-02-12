const { connectDB, mongoose } = require('../server/db/connection');
const UserModel = require('../server/db/schemas/User');

const email = process.argv[2];

if (!email) {
    console.error('Please provide an email address.');
    console.log('Usage: node scripts/delete-user.js <email>');
    process.exit(1);
}

async function deleteUser() {
    try {
        await connectDB();
        console.log(`Searching for user with email: ${email}...`);

        // Case-insensitive search to match repository logic
        const result = await UserModel.deleteOne({ email: email.toLowerCase() });

        if (result.deletedCount > 0) {
            console.log(`✅ User ${email} deleted successfully.`);
        } else {
            console.log(`⚠️ User ${email} not found.`);
        }
    } catch (error) {
        console.error('❌ Error deleting user:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Database disconnected.');
        process.exit(0);
    }
}

deleteUser();
