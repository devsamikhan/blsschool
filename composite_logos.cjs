const Jimp = require('jimp');

async function main() {
    console.log("Loading original BLS logo...");
    const logo = await Jimp.read("E:\\blsschool-main - Copy\\public\\assets\\logo.png");

    // 1. Contact Center - Fix the giant "AURORA" logos
    console.log("Compositing onto Contact Center image...");
    const contact = await Jimp.read("E:\\blsschool-main - Copy\\public\\assets\\contact_center.png");
    
    // Mask desk logo
    const deskColor = Jimp.rgbaToInt(32, 40, 38, 255);
    contact.scan(170, 560, 640-170, 750-560, function (x, y, idx) { this.setPixelColor(deskColor, x, y); });
    
    // Mask wall logo
    const wallColor = Jimp.rgbaToInt(22, 28, 30, 255);
    contact.scan(470, 160, 840-470, 340-160, function (x, y, idx) { this.setPixelColor(wallColor, x, y); });

    // Overlay BLS logos
    const logo1 = logo.clone().resize(150, 150);
    contact.composite(logo1, 320, 570);
    const logo2 = logo.clone().resize(150, 150);
    contact.composite(logo2, 570, 175);
    await contact.writeAsync("E:\\blsschool-main - Copy\\public\\assets\\contact_center.png");

    // 2. Home Lab Hero - Fix the text on the left server
    console.log("Compositing onto Home Lab Hero...");
    const homeLab = await Jimp.read("E:\\blsschool-main - Copy\\public\\assets\\home_lab_hero.png");
    const signColor = Jimp.rgbaToInt(15, 25, 23, 255);
    homeLab.scan(0, 90, 190, 220-90, function (x, y, idx) { this.setPixelColor(signColor, x, y); });
    const logo3 = logo.clone().resize(100, 100);
    homeLab.composite(logo3, 45, 105);
    await homeLab.writeAsync("E:\\blsschool-main - Copy\\public\\assets\\home_lab_hero.png");

    // 3. Campus Exterior - Add logo to a building facade
    console.log("Compositing onto Campus Exterior...");
    const campus = await Jimp.read("E:\\blsschool-main - Copy\\public\\assets\\campus_exterior.png");
    const logo4 = logo.clone().resize(200, 200);
    campus.composite(logo4, 150, 150);
    await campus.writeAsync("E:\\blsschool-main - Copy\\public\\assets\\campus_exterior.png");

    // 4. Classroom Lecture - Add logo to the smartboard
    console.log("Compositing onto Classroom Lecture...");
    const classroom = await Jimp.read("E:\\blsschool-main - Copy\\public\\assets\\classroom_lecture.png");
    const logo5 = logo.clone().resize(150, 150);
    classroom.composite(logo5, 800, 800);
    await classroom.writeAsync("E:\\blsschool-main - Copy\\public\\assets\\classroom_lecture.png");

    console.log("All logos successfully composited!");
}

main().catch(console.error);
