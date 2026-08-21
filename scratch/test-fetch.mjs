async function main() {
  const query = `
    query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        id
        title
        titleSlug
        timestamp
        statusDisplay
      }
    }
  `;
  
  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { username: "arp1t_singh", limit: 20 },
    }),
    cache: 'no-store'
  });

  const data = await res.json();
  console.log(data?.data?.recentAcSubmissionList);
}

main();
