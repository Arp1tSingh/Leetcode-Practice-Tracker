"use client";

import { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link2 } from "lucide-react";

export default function BookmarkletCard() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch("/api/generate-sync-token");
        if (res.ok) {
          const data = await res.json();
          setToken(data.token);
        }
      } catch (e) {
        console.error("Failed to fetch sync token", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchToken();
  }, []);

  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!token || !linkRef.current) return;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? window.location.origin : "");
    const rawCode = `
      (async function() {
        const API_URL = '${API_URL}/api/bulk-import';
        const TOKEN = '${token}';
        
        function showToast(msg) {
          let t = document.getElementById('lc-sync-toast');
          if (!t) {
            t = document.createElement('div');
            t.id = 'lc-sync-toast';
            Object.assign(t.style, {
              position: 'fixed', bottom: '20px', right: '20px', padding: '15px 25px',
              background: '#333', color: '#fff', borderRadius: '8px', zIndex: '999999',
              fontFamily: 'sans-serif', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'opacity 0.3s'
            });
            document.body.appendChild(t);
          }
          t.innerText = msg;
          t.style.opacity = '1';
          return t;
        }

        const toast = showToast('Initializing Sync...');
        
        const getCsrf = () => {
          const match = document.cookie.match(/csrftoken=([^;]+)/);
          return match ? match[1] : '';
        };

        const csrf = getCsrf();
        if (!csrf) {
          showToast('Error: CSRF token not found. Are you logged in?');
          return;
        }

        let skip = 0;
        const limit = 100;
        let allQuestions = [];
        let total = 1;

        showToast('Extracting solved problems...');

        while (skip < total) {
          try {
            const res = await fetch('https://leetcode.com/graphql/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-csrftoken': csrf
              },
              body: JSON.stringify({
                query: \`query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) { problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) { total: totalNum questions: data { questionFrontendId title titleSlug } } }\`,
                variables: { categorySlug: "", skip: skip, limit: limit, filters: { status: "AC" } }
              })
            });
            
            const data = await res.json();
            if (data.errors) {
              showToast('Error from LeetCode API');
              return;
            }
            
            const qList = data.data.problemsetQuestionList;
            total = qList.total;
            
            qList.questions.forEach(q => {
              allQuestions.push({
                questionId: q.questionFrontendId,
                title: q.title,
                titleSlug: q.titleSlug
              });
            });
            
            skip += limit;
            showToast(\`Extracted \${allQuestions.length} / \${total}...\`);
          } catch (e) {
            showToast('Error during extraction');
            return;
          }
        }

        showToast(\`Found \${allQuestions.length} solved problems. Syncing...\`);

        try {
          const syncRes = await fetch(API_URL, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + TOKEN
            },
            body: JSON.stringify({ problems: allQuestions })
          });
          
          if (syncRes.ok) {
            const resData = await syncRes.json();
            showToast('Sync Complete! Imported ' + (resData.count || 0) + ' problems.');
            setTimeout(() => { toast.style.opacity = '0'; }, 3000);
          } else {
            showToast('Sync Failed: Server error');
          }
        } catch(e) {
          showToast('Sync Failed: Could not reach backend');
        }
      })();
    `;

    const minifiedCode = rawCode
      .replace(/\s*\n\s*/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    linkRef.current.href = 'javascript:' + encodeURIComponent(minifiedCode);
  }, [token]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 rounded-2xl border border-border/50 text-center flex flex-col items-center h-full bg-background/30 hover:bg-background/50 transition-colors">
        <Skeleton className="h-12 w-12 rounded-full mb-4" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-12 w-full mt-auto" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="p-4 sm:p-6 rounded-2xl border border-border/50 text-center text-red-400 flex flex-col justify-center h-full bg-background/30 hover:bg-background/50 transition-colors">
        <p>Could not generate sync token. Please try refreshing.</p>
      </div>
    );
  }


  return (
    <div className="p-4 sm:p-6 rounded-2xl border border-border/50 text-center flex flex-col items-center h-full bg-background/30 hover:bg-background/50 transition-colors">
      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
        <Link2 className="w-6 h-6 text-blue-500" />
      </div>
      <h3 className="text-xl font-bold mb-2 text-foreground">Bookmarklet Sync</h3>
      <p className="text-[11px] sm:text-xs text-muted-foreground mb-6 max-w-sm mx-auto leading-relaxed flex-grow">
        Drag this button to your bookmarks bar. Then, go to LeetCode and click the bookmark to silently sync all your solved problems!
      </p>
      
      <a
        ref={linkRef}
        onClick={(e) => e.preventDefault()}
        className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm cursor-grab active:cursor-grabbing w-full mt-auto"
      >
        Drag to Bookmarks
      </a>
    </div>
  );
}
