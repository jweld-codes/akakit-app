const { spawn } = require("child_process");

console.log("Iniciando servidor Expo...");

const expo = spawn("npx", ["expo", "start", "--tunnel"], {
  cwd: "C:\\Users\\jenni\\Documents\\Proyects\\MERN\\AkaKit_App\\akakit",
  shell: true,
  detached: false,
});

expo.stdout.on("data", (data) => {
  console.log(`[expo]: ${data}`);
});

expo.stderr.on("data", (data) => {
  console.error(`[expo error]: ${data}`);
});

expo.on("close", (code) => {
  console.log(`El servidor Expo se cerró con código ${code}`);
});
