const mongoose = require('mongoose');
const Problem = require('./src/models/Problem'); 
require('dotenv').config();

const missingProblems = [
  {
    title: "Find the Index of the First Occurrence in a String",
    slug: "find-the-index-of-the-first-occurrence-in-a-string",
    difficulty: "Easy",
    category: "Strings",
    description: "Given two strings `needle` and `haystack`, return the index of the first occurrence of `needle` in `haystack`, or `-1` if `needle` is not part of `haystack`.",
    examples: [
      { input: 'haystack = "sadbutsad", needle = "sad"', output: "0", explain: "\"sad\" occurs at index 0 and 6. The first occurrence is at index 0." },
      { input: 'haystack = "leetcode", needle = "leeto"', output: "-1", explain: "\"leeto\" did not occur in \"leetcode\", so we return -1." }
    ],
    constraints: ["1 <= haystack.length, needle.length <= 10^4", "haystack and needle consist of only lowercase English characters."],
    testCases: [
      { input: "'sadbutsad', 'sad'", expected: 0, functionCall: "solution('sadbutsad', 'sad')" },
      { input: "'leetcode', 'leeto'", expected: -1, functionCall: "solution('leetcode', 'leeto')" },
      { input: "'hello', 'll'", expected: 2, functionCall: "solution('hello', 'll')" }
    ]
  },
  {
    title: "Search in Rotated Sorted Array",
    slug: "search-in-rotated-sorted-array",
    difficulty: "Medium",
    category: "Binary Search",
    description: "There is an integer array `nums` sorted in ascending order (with distinct values).\n\nPrior to being passed to your function, `nums` is possibly rotated at an unknown pivot index `k` `(1 <= k < nums.length)` such that the resulting array is `[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]` (0-indexed).\n\nGiven the array `nums` after the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not in `nums`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.",
    examples: [
      { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4" },
      { input: "nums = [4,5,6,7,0,1,2], target = 3", output: "-1" }
    ],
    constraints: ["1 <= nums.length <= 5000", "-10^4 <= nums[i] <= 10^4", "All values of nums are unique.", "-10^4 <= target <= 10^4"],
    testCases: [
      { input: "[4,5,6,7,0,1,2], 0", expected: 4, functionCall: "solution([4,5,6,7,0,1,2], 0)" },
      { input: "[4,5,6,7,0,1,2], 3", expected: -1, functionCall: "solution([4,5,6,7,0,1,2], 3)" },
      { input: "[1], 0", expected: -1, functionCall: "solution([1], 0)" }
    ]
  },
  {
    title: "Evaluate Reverse Polish Notation",
    slug: "evaluate-reverse-polish-notation",
    difficulty: "Medium",
    category: "Stack",
    description: "You are given an array of strings `tokens` that represents an arithmetic expression in a Reverse Polish Notation.\n\nEvaluate the expression. Return an integer that represents the value of the expression.\n\nNote:\n- The valid operators are `'+'`, `'-'`, `'*'`, and `'/'`.\n- Each operand may be an integer or another expression.\n- The division between two integers always truncates toward zero.",
    examples: [
      { input: 'tokens = ["2","1","+","3","*"]', output: "9", explain: "((2 + 1) * 3) = 9" },
      { input: 'tokens = ["4","13","5","/","+"]', output: "6", explain: "(4 + (13 / 5)) = 6" }
    ],
    constraints: ["1 <= tokens.length <= 10^4", "tokens[i] is either an operator or an integer in the range [-200, 200]."],
    testCases: [
      { input: "['2','1','+','3','*']", expected: 9, functionCall: "solution(['2','1','+','3','*'])" },
      { input: "['4','13','5','/','+']", expected: 6, functionCall: "solution(['4','13','5','/','+'])" },
      { input: "['10','6','9','3','+','-11','*','/','*','17','+','5','+']", expected: 22, functionCall: "solution(['10','6','9','3','+','-11','*','/','*','17','+','5','+'])" }
    ]
  },
  {
    title: "Daily Temperatures",
    slug: "daily-temperatures",
    difficulty: "Medium",
    category: "Stack",
    description: "Given an array of integers `temperatures` represents the daily temperatures, return an array `answer` such that `answer[i]` is the number of days you have to wait after the `ith` day to get a warmer temperature. If there is no future day for which this is possible, keep `answer[i] == 0` instead.",
    examples: [
      { input: "temperatures = [73,74,75,71,69,72,76,73]", output: "[1,1,4,2,1,1,0,0]" },
      { input: "temperatures = [30,40,50,60]", output: "[1,1,1,0]" }
    ],
    constraints: ["1 <= temperatures.length <= 10^5", "30 <= temperatures[i] <= 100"],
    testCases: [
      { input: "[73,74,75,71,69,72,76,73]", expected: [1,1,4,2,1,1,0,0], functionCall: "solution([73,74,75,71,69,72,76,73])" },
      { input: "[30,40,50,60]", expected: [1,1,1,0], functionCall: "solution([30,40,50,60])" },
      { input: "[30,60,90]", expected: [1,1,0], functionCall: "solution([30,60,90])" }
    ]
  },
  {
    title: "Min Cost Climbing Stairs",
    slug: "min-cost-climbing-stairs",
    difficulty: "Easy",
    category: "Dynamic Programming",
    description: "You are given an integer array `cost` where `cost[i]` is the cost of `ith` step on a staircase. Once you pay the cost, you can either climb one or two steps.\n\nYou can either start from the step with index `0`, or the step with index `1`.\n\nReturn the minimum cost to reach the top of the floor.",
    examples: [
      { input: "cost = [10,15,20]", output: "15", explain: "You will start at index 1. Pay 15 and climb two steps to reach the top. The total cost is 15." },
      { input: "cost = [1,100,1,1,1,100,1,1,100,1]", output: "6" }
    ],
    constraints: ["2 <= cost.length <= 1000", "0 <= cost[i] <= 999"],
    testCases: [
      { input: "[10,15,20]", expected: 15, functionCall: "solution([10,15,20])" },
      { input: "[1,100,1,1,1,100,1,1,100,1]", expected: 6, functionCall: "solution([1,100,1,1,1,100,1,1,100,1])" }
    ]
  },
  {
    title: "Unique Paths",
    slug: "unique-paths",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description: "There is a robot on an `m x n` grid. The robot is initially located at the top-left corner (i.e., `grid[0][0]`). The robot tries to move to the bottom-right corner (i.e., `grid[m - 1][n - 1]`). The robot can only move either down or right at any point in time.\n\nGiven the two integers `m` and `n`, return the number of possible unique paths that the robot can take to reach the bottom-right corner.",
    examples: [
      { input: "m = 3, n = 7", output: "28" },
      { input: "m = 3, n = 2", output: "3" }
    ],
    constraints: ["1 <= m, n <= 100"],
    testCases: [
      { input: "3, 7", expected: 28, functionCall: "solution(3, 7)" },
      { input: "3, 2", expected: 3, functionCall: "solution(3, 2)" },
      { input: "7, 3", expected: 28, functionCall: "solution(7, 3)" },
      { input: "3, 3", expected: 6, functionCall: "solution(3, 3)" }
    ]
  },
  {
    title: "Decode Ways",
    slug: "decode-ways",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description: "A message containing letters from `A-Z` can be encoded into numbers using the following mapping:\n\n`'A' -> \"1\"`\n`'B' -> \"2\"`\n...\n`'Z' -> \"26\"`\n\nGiven a string `s` containing only digits, return the number of ways to decode it.",
    examples: [
      { input: 's = "12"', output: "2", explain: "\"12\" could be decoded as \"AB\" (1 2) or \"L\" (12)." },
      { input: 's = "226"', output: "3", explain: "\"226\" could be decoded as \"BZ\" (2 26), \"VF\" (22 6), or \"BBF\" (2 2 6)." },
      { input: 's = "06"', output: "0", explain: "\"06\" cannot be mapped to \"F\" because of the leading zero." }
    ],
    constraints: ["1 <= s.length <= 100", "s contains only digits and may contain leading zero(s)."],
    testCases: [
      { input: "'12'", expected: 2, functionCall: "solution('12')" },
      { input: "'226'", expected: 3, functionCall: "solution('226')" },
      { input: "'06'", expected: 0, functionCall: "solution('06')" }
    ]
  },
  {
    title: "Word Break",
    slug: "word-break",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description: "Given a string `s` and a dictionary of strings `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of one or more dictionary words.\n\nNote that the same word in the dictionary may be reused multiple times in the segmentation.",
    examples: [
      { input: 's = "leetcode", wordDict = ["leet","code"]', output: "true" },
      { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: "true" },
      { input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', output: "false" }
    ],
    constraints: ["1 <= s.length <= 300", "1 <= wordDict.length <= 1000", "1 <= wordDict[i].length <= 20", "s and wordDict[i] consist of only lowercase English letters."],
    testCases: [
      { input: "'leetcode', ['leet','code']", expected: true, functionCall: "solution('leetcode', ['leet','code'])" },
      { input: "'applepenapple', ['apple','pen']", expected: true, functionCall: "solution('applepenapple', ['apple','pen'])" },
      { input: "'catsandog', ['cats','dog','sand','and','cat']", expected: false, functionCall: "solution('catsandog', ['cats','dog','sand','and','cat'])" }
    ]
  },
  {
    title: "Longest Increasing Subsequence",
    slug: "longest-increasing-subsequence",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description: "Given an integer array `nums`, return the length of the longest strictly increasing subsequence.",
    examples: [
      { input: "nums = [10,9,2,5,3,7,101,18]", output: "4", explain: "The longest increasing subsequence is [2,3,7,101], therefore the length is 4." },
      { input: "nums = [0,1,0,3,2,3]", output: "4" },
      { input: "nums = [7,7,7,7,7,7,7]", output: "1" }
    ],
    constraints: ["1 <= nums.length <= 2500", "-10^4 <= nums[i] <= 10^4"],
    testCases: [
      { input: "[10,9,2,5,3,7,101,18]", expected: 4, functionCall: "solution([10,9,2,5,3,7,101,18])" },
      { input: "[0,1,0,3,2,3]", expected: 4, functionCall: "solution([0,1,0,3,2,3])" },
      { input: "[7,7,7,7,7,7,7]", expected: 1, functionCall: "solution([7,7,7,7,7,7,7])" }
    ]
  },
  {
    title: "Edit Distance",
    slug: "edit-distance",
    difficulty: "Hard",
    category: "Dynamic Programming",
    description: "Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` to `word2`.\n\nYou have the following three operations permitted on a word:\n- Insert a character\n- Delete a character\n- Replace a character",
    examples: [
      { input: 'word1 = "horse", word2 = "ros"', output: "3", explain: "horse -> rorse (replace 'h' with 'r')\nrorse -> rose (remove 'r')\nrose -> ros (remove 'e')" },
      { input: 'word1 = "intention", word2 = "execution"', output: "5" }
    ],
    constraints: ["0 <= word1.length, word2.length <= 500", "word1 and word2 consist of lowercase English letters."],
    testCases: [
      { input: "'horse', 'ros'", expected: 3, functionCall: "solution('horse', 'ros')" },
      { input: "'intention', 'execution'", expected: 5, functionCall: "solution('intention', 'execution')" },
      { input: "'', 'a'", expected: 1, functionCall: "solution('', 'a')" }
    ]
  }
];

const seedMissingAndTests = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");

    for (const prob of missingProblems) {
      await Problem.findOneAndUpdate(
        { slug: prob.slug }, 
        { $set: prob },
        { upsert: true, returnDocument: 'after' } 
      );
      console.log(`✅ Fully seeded Problem + Tests for: ${prob.slug}`);
    }

    console.log("🎉 Mega Batch 7 (Stack & DP) is locked, loaded, and testable!");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

seedMissingAndTests();