const Jimp = require('jimp');

async function main() {
    console.log("Loading original BLS logo...");
    const logo = await Jimp.read("E:\\blsschool-main - Copy\\public\\assets\\logo.png");

    console.log("Compositing onto New Home Hero...");
    const homeLab = await Jimp.read("C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\8986c6a0-d6b7-48c6-8671-cee861e2b0e6\\new_home_hero_1773656428865.png");
    homeLab.composite(logo.clone().resize(150, 150), 437, 850); // bottom middle/left wall overlay
    await homeLab.writeAsync("E:\\blsschool-main - Copy\\public\\assets\\home_lab_hero_v2.png");

    console.log("Compositing onto New Campus Exterior...");
    const campus = await Jimp.read("C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\8986c6a0-d6b7-48c6-8671-cee861e2b0e6\\new_campus_exterior_1773656453443.png");
    campus.composite(logo.clone().resize(300, 300), 50, 50); // top left wide building placement
    await campus.writeAsync("E:\\blsschool-main - Copy\\public\\assets\\campus_exterior_v2.png");

    console.log("Compositing onto New Classroom Lecture...");
    const classroom = await Jimp.read("C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\8986c6a0-d6b7-48c6-8671-cee861e2b0e6\\new_classroom_1773656475013.png");
    classroom.composite(logo.clone().resize(200, 200), 750, 150); // top right of smart board
    await classroom.writeAsync("E:\\blsschool-main - Copy\\public\\assets\\classroom_lecture_v2.png");

    console.log("Compositing onto New Front Desk Reception...");
    const contact = await Jimp.read("C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\8986c6a0-d6b7-48c6-8671-cee861e2b0e6\\new_reception_1773656499033.png");
    contact.composite(logo.clone().resize(250, 250), 387, 80); // top middle wall above desk
    await contact.writeAsync("E:\\blsschool-main - Copy\\public\\assets\\contact_center_v2.png");

    console.log("All new logos successfully composited!");
}

main().catch(console.error);
