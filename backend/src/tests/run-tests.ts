import { runAuthTests } from "./auth.test";
import { runChatSafetyTests } from "./chatSafety.test";

const run = (name: string, testFn: () => void) => {
  testFn();
  console.log(`PASS ${name}`);
};

run("auth", runAuthTests);
run("chatSafety", runChatSafetyTests);
