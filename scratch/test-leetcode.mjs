import { LeetCode } from 'leetcode-query';

async function main() {
  try {
    const lc = new LeetCode();
    const submissions = await lc.recent_submissions('arp1t_singh', 20);
    console.log("Submissions:");
    console.log(submissions);
  } catch (error) {
    console.error("Error:");
    console.error(error);
  }
}

main();
