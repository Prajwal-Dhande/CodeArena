const mongoose = require('mongoose');
const Problem = require('./src/models/Problem'); 
require('dotenv').config();

// MEGA BATCH 13: The Grand Finale (Final 6 Problems)
const missingProblems = [
  {
    title: "Word Ladder II",
    slug: "word-ladder-ii",
    difficulty: "Hard",
    category: "Graphs",
    description: "A transformation sequence from word `beginWord` to word `endWord` using a dictionary `wordList` is a sequence of words `beginWord -> s1 -> s2 -> ... -> sk` such that:\n- Every adjacent pair of words differs by a single letter.\n- Every `si` for `1 <= i <= k` is in `wordList`. Note that `beginWord` does not need to be in `wordList`.\n- `sk == endWord`\n\nGiven two words, `beginWord` and `endWord`, and a dictionary `wordList`, return all the shortest transformation sequences from `beginWord` to `endWord`, or an empty list if no such sequence exists.",
    examples: [
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '[["hit","hot","dot","dog","cog"],["hit","hot","lot","log","cog"]]' }
    ],
    constraints: ["1 <= beginWord.length <= 5", "endWord.length == beginWord.length", "1 <= wordList.length <= 500"],
    testCases: [
      { input: '"hit", "cog", ["hot","dot","dog","lot","log","cog"]', expected: [["hit","hot","dot","dog","cog"],["hit","hot","lot","log","cog"]], functionCall: 'solution("hit", "cog", ["hot","dot","dog","lot","log","cog"])' },
      { input: '"hit", "cog", ["hot","dot","dog","lot","log"]', expected: [], functionCall: 'solution("hit", "cog", ["hot","dot","dog","lot","log"])' }
    ]
  },
  {
    title: "LRU Cache",
    slug: "lru-cache",
    difficulty: "Medium",
    category: "Design",
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the `LRUCache` class:\n- `LRUCache(int capacity)` Initialize the LRU cache with positive size capacity.\n- `int get(int key)` Return the value of the key if the key exists, otherwise return -1.\n- `void put(int key, int value)` Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity from this operation, evict the least recently used key.",
    examples: [
      { input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]', output: '[null, null, null, 1, null, -1, null, -1, 3, 4]' }
    ],
    constraints: ["1 <= capacity <= 3000", "0 <= key <= 10^4", "0 <= value <= 10^5"],
    testCases: [
      { input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"], [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]', expected: [null, null, null, 1, null, -1, null, -1, 3, 4], functionCall: 'solution(["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"], [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]])' }
    ]
  },
  {
    title: "Clone Graph",
    slug: "clone-graph",
    difficulty: "Medium",
    category: "Graphs",
    description: "Given a reference of a node in a connected undirected graph.\n\nReturn a deep copy (clone) of the graph.\n\nEach node in the graph contains a value (`int`) and a list (`List[Node]`) of its neighbors.",
    examples: [
      { input: "adjList = [[2,4],[1,3],[2,4],[1,3]]", output: "[[2,4],[1,3],[2,4],[1,3]]" }
    ],
    constraints: ["The number of nodes in the graph is in the range [0, 100].", "1 <= Node.val <= 100"],
    testCases: [
      { input: "[[2,4],[1,3],[2,4],[1,3]]", expected: [[2,4],[1,3],[2,4],[1,3]], functionCall: "solution([[2,4],[1,3],[2,4],[1,3]])" }
    ]
  },
  {
    title: "Implement Trie (Prefix Tree)",
    slug: "implement-trie-prefix-tree",
    difficulty: "Medium",
    category: "Design",
    description: "A trie (pronounced as 'try') or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. There are various applications of this data structure, such as autocomplete and spellchecker.\n\nImplement the `Trie` class:\n- `Trie()` Initializes the trie object.\n- `void insert(String word)` Inserts the string `word` into the trie.\n- `boolean search(String word)` Returns `true` if the string `word` is in the trie, and `false` otherwise.\n- `boolean startsWith(String prefix)` Returns `true` if there is a previously inserted string `word` that has the prefix `prefix`.",
    examples: [
      { input: '["Trie", "insert", "search", "search", "startsWith", "insert", "search"]\n[[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]]', output: '[null, null, true, false, true, null, true]' }
    ],
    constraints: ["1 <= word.length, prefix.length <= 2000", "word and prefix consist only of lowercase English letters."],
    testCases: [
      { input: '["Trie", "insert", "search", "search", "startsWith", "insert", "search"], [[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]]', expected: [null, null, true, false, true, null, true], functionCall: 'solution(["Trie", "insert", "search", "search", "startsWith", "insert", "search"], [[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]])' }
    ]
  },
  {
    title: "Serialize and Deserialize Binary Tree",
    slug: "serialize-and-deserialize-binary-tree",
    difficulty: "Hard",
    category: "Design",
    description: "Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work. You just need to ensure that a binary tree can be serialized to a string and this string can be deserialized to the original tree structure.",
    examples: [
      { input: "root = [1,2,3,null,null,4,5]", output: "[1,2,3,null,null,4,5]" }
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 10^4].", "-1000 <= Node.val <= 1000"],
    testCases: [
      { input: "[1,2,3,null,null,4,5]", expected: [1,2,3,null,null,4,5], functionCall: "solution([1,2,3,null,null,4,5])" }
    ]
  },
  {
    title: "Find Median from Data Stream",
    slug: "find-median-from-data-stream",
    difficulty: "Hard",
    category: "Design",
    description: "The median is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values.\n\nImplement the `MedianFinder` class:\n- `MedianFinder()` initializes the object.\n- `void addNum(int num)` adds the integer `num` from the data stream to the data structure.\n- `double findMedian()` returns the median of all elements so far.",
    examples: [
      { input: '["MedianFinder", "addNum", "addNum", "findMedian", "addNum", "findMedian"]\n[[], [1], [2], [], [3], []]', output: '[null, null, null, 1.5, null, 2.0]' }
    ],
    constraints: ["-10^5 <= num <= 10^5", "There will be at least one element in the data structure before calling findMedian."],
    testCases: [
      { input: '["MedianFinder", "addNum", "addNum", "findMedian", "addNum", "findMedian"], [[], [1], [2], [], [3], []]', expected: [null, null, null, 1.5, null, 2.0], functionCall: 'solution(["MedianFinder", "addNum", "addNum", "findMedian", "addNum", "findMedian"], [[], [1], [2], [], [3], []])' }
    ]
  }
];

const seedMissingAndTests = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB... Injecting The Grand Finale (Batch 13)...");

    for (const prob of missingProblems) {
      await Problem.findOneAndUpdate(
        { slug: prob.slug }, 
        { $set: prob },
        { upsert: true, returnDocument: 'after' } 
      );
      console.log(`✅ Fully seeded: ${prob.slug}`);
    }

    console.log("🏆 100% COMPLETE! ALL 56 PROBLEMS ARE NOW IN THE DB WITH TEST CASES! 🏆");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

seedMissingAndTests();