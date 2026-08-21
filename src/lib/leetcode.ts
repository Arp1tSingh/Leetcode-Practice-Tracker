export async function getProblemByFrontendId(frontendId: number) {
  try {
    // 1. Fetch all problems to map frontend ID to title slug
    const res = await fetch('https://leetcode.com/api/problems/algorithms/', {
      // Need a cache mechanism or fetch it fresh, it's about 1MB
      next: { revalidate: 86400 } // cache for 1 day
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch problems from LeetCode');
    }
    
    const data = await res.json();
    const problem = data.stat_status_pairs.find(
      (p: any) => p.stat.frontend_question_id === frontendId
    );
    
    if (!problem) {
      throw new Error(`Problem with number ${frontendId} not found`);
    }
    
    const titleSlug = problem.stat.question__title_slug;
    
    // 2. GraphQL query to get tags and details
    const query = `
      query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionId
          questionFrontendId
          title
          titleSlug
          difficulty
          topicTags {
            name
          }
        }
      }
    `;
    
    const detailsRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { titleSlug },
      }),
      cache: 'no-store'
    });
    
    if (!detailsRes.ok) {
      throw new Error('Failed to fetch problem details');
    }
    
    const detailsData = await detailsRes.json();
    
    if (!detailsData.data || !detailsData.data.question) {
      throw new Error('Problem details not found in GraphQL response');
    }
    
    return detailsData.data.question;
  } catch (error) {
    console.error('Error fetching LeetCode problem:', error);
    throw error;
  }
}

export async function getProblemByTitleSlug(titleSlug: string) {
  try {
    const query = `
      query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionId
          questionFrontendId
          title
          titleSlug
          difficulty
          topicTags {
            name
          }
        }
      }
    `;
    
    const detailsRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { titleSlug },
      }),
      cache: 'no-store'
    });
    
    if (!detailsRes.ok) {
      throw new Error('Failed to fetch problem details');
    }
    
    const detailsData = await detailsRes.json();
    
    if (!detailsData.data || !detailsData.data.question) {
      throw new Error('Problem details not found in GraphQL response');
    }
    
    return detailsData.data.question;
  } catch (error) {
    console.error('Error fetching LeetCode problem by slug:', error);
    throw error;
  }
}

export async function getRecentSubmissions(username: string, limit: number = 20) {
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
      variables: { username, limit },
    }),
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch recent submissions');
  }

  const data = await res.json();
  return data?.data?.recentAcSubmissionList || [];
}
