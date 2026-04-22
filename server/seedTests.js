const mongoose = require('mongoose');
const Problem = require('./src/models/Problem'); 
require('dotenv').config();

const missingProblems = [
  {
    title: "Reverse Linked List II",
    slug: "reverse-linked-list-ii",
    difficulty: "Medium",
    category: "Linked List",
    description: "Given the `head` of a singly linked list and two integers `left` and `right` where `left <= right`, reverse the nodes of the list from position `left` to position `right`, and return the reversed list.",
    examples: [
      { input: "head = [1,2,3,4,5], left = 2, right = 4", output: "[1,4,3,2,5]" },
      { input: "head = [5], left = 1, right = 1", output: "[5]" }
    ],
    constraints: ["The number of nodes in the list is n.", "1 <= n <= 500", "-500 <= Node.val <= 500", "1 <= left <= right <= n"],
    testCases: [
      { input: "[1,2,3,4,5], 2, 4", expected: [1,4,3,2,5], functionCall: "solution([1,2,3,4,5], 2, 4)" },
      { input: "[5], 1, 1", expected: [5], functionCall: "solution([5], 1, 1)" }
    ]
  },
  {
    title: "Validate Binary Search Tree",
    slug: "validate-binary-search-tree",
    difficulty: "Medium",
    category: "Trees",
    description: "Given the `root` of a binary tree, determine if it is a valid binary search tree (BST).\n\nA valid BST is defined as follows:\n- The left subtree of a node contains only nodes with keys less than the node's key.\n- The right subtree of a node contains only nodes with keys greater than the node's key.\n- Both the left and right subtrees must also be binary search trees.",
    examples: [
      { input: "root = [2,1,3]", output: "true" },
      { input: "root = [5,1,4,null,null,3,6]", output: "false", explain: "The root node's value is 5 but its right child's value is 4." }
    ],
    constraints: ["The number of nodes in the tree is in the range [1, 10^4].", "-2^31 <= Node.val <= 2^31 - 1"],
    testCases: [
      { input: "[2,1,3]", expected: true, functionCall: "solution([2,1,3])" },
      { input: "[5,1,4,null,null,3,6]", expected: false, functionCall: "solution([5,1,4,null,null,3,6])" }
    ]
  },
  {
    title: "Kth Smallest Element in a BST",
    slug: "kth-smallest-element-in-bst",
    difficulty: "Medium",
    category: "Trees",
    description: "Given the `root` of a binary search tree, and an integer `k`, return the `kth` smallest value (1-indexed) of all the values of the nodes in the tree.",
    examples: [
      { input: "root = [3,1,4,null,2], k = 1", output: "1" },
      { input: "root = [5,3,6,2,4,null,null,1], k = 3", output: "3" }
    ],
    constraints: ["The number of nodes in the tree is n.", "1 <= k <= n <= 10^4", "0 <= Node.val <= 10^4"],
    testCases: [
      { input: "[3,1,4,null,2], 1", expected: 1, functionCall: "solution([3,1,4,null,2], 1)" },
      { input: "[5,3,6,2,4,null,null,1], 3", expected: 3, functionCall: "solution([5,3,6,2,4,null,null,1], 3)" }
    ]
  },
  {
    title: "Merge k Sorted Lists",
    slug: "merge-k-sorted-lists",
    difficulty: "Hard",
    category: "Linked List",
    description: "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.",
    examples: [
      { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" },
      { input: "lists = []", output: "[]" }
    ],
    constraints: ["k == lists.length", "0 <= k <= 10^4", "0 <= lists[i].length <= 500", "-10^4 <= lists[i][j] <= 10^4"],
    testCases: [
      { input: "[[1,4,5],[1,3,4],[2,6]]", expected: [1,1,2,3,4,4,5,6], functionCall: "solution([[1,4,5],[1,3,4],[2,6]])" },
      { input: "[]", expected: [], functionCall: "solution([])" }
    ]
  },
  {
    title: "Symmetric Tree",
    slug: "symmetric-tree",
    difficulty: "Easy",
    category: "Trees",
    description: "Given the `root` of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).",
    examples: [
      { input: "root = [1,2,2,3,4,4,3]", output: "true" },
      { input: "root = [1,2,2,null,3,null,3]", output: "false" }
    ],
    constraints: ["The number of nodes in the tree is in the range [1, 1000].", "-100 <= Node.val <= 100"],
    testCases: [
      { input: "[1,2,2,3,4,4,3]", expected: true, functionCall: "solution([1,2,2,3,4,4,3])" },
      { input: "[1,2,2,null,3,null,3]", expected: false, functionCall: "solution([1,2,2,null,3,null,3])" }
    ]
  },
  {
    title: "Palindrome Linked List",
    slug: "palindrome-linked-list",
    difficulty: "Easy",
    category: "Linked List",
    description: "Given the `head` of a singly linked list, return `true` if it is a palindrome or `false` otherwise.",
    examples: [
      { input: "head = [1,2,2,1]", output: "true" },
      { input: "head = [1,2]", output: "false" }
    ],
    constraints: ["The number of nodes in the list is in the range [1, 10^5].", "0 <= Node.val <= 9"],
    testCases: [
      { input: "[1,2,2,1]", expected: true, functionCall: "solution([1,2,2,1])" },
      { input: "[1,2]", expected: false, functionCall: "solution([1,2])" }
    ]
  },
  {
    title: "Lowest Common Ancestor of a Binary Tree",
    slug: "lowest-common-ancestor-of-a-binary-tree",
    difficulty: "Medium",
    category: "Trees",
    description: "Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.\n\nThe LCA is defined between two nodes `p` and `q` as the lowest node in `T` that has both `p` and `q` as descendants.",
    examples: [
      { input: "root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1", output: "3" },
      { input: "root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4", output: "5" }
    ],
    constraints: ["The number of nodes in the tree is in the range [2, 10^5].", "-10^9 <= Node.val <= 10^9", "p != q", "p and q will exist in the tree."],
    testCases: [
      { input: "[3,5,1,6,2,0,8,null,null,7,4], 5, 1", expected: 3, functionCall: "solution([3,5,1,6,2,0,8,null,null,7,4], 5, 1)" },
      { input: "[3,5,1,6,2,0,8,null,null,7,4], 5, 4", expected: 5, functionCall: "solution([3,5,1,6,2,0,8,null,null,7,4], 5, 4)" }
    ]
  },
  {
    title: "Maximum Depth of Binary Tree",
    slug: "maximum-depth-of-binary-tree",
    difficulty: "Easy",
    category: "Trees",
    description: "Given the `root` of a binary tree, return its maximum depth.\n\nA binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "3" },
      { input: "root = [1,null,2]", output: "2" }
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 10^4].", "-100 <= Node.val <= 100"],
    testCases: [
      { input: "[3,9,20,null,null,15,7]", expected: 3, functionCall: "solution([3,9,20,null,null,15,7])" },
      { input: "[1,null,2]", expected: 2, functionCall: "solution([1,null,2])" },
      { input: "[]", expected: 0, functionCall: "solution([])" }
    ]
  },
  {
    title: "Binary Tree Level Order Traversal",
    slug: "binary-tree-level-order-traversal",
    difficulty: "Medium",
    category: "Trees",
    description: "Given the `root` of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]" },
      { input: "root = [1]", output: "[[1]]" }
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 2000].", "-1000 <= Node.val <= 1000"],
    testCases: [
      { input: "[3,9,20,null,null,15,7]", expected: [[3],[9,20],[15,7]], functionCall: "solution([3,9,20,null,null,15,7])" },
      { input: "[1]", expected: [[1]], functionCall: "solution([1])" },
      { input: "[]", expected: [], functionCall: "solution([])" }
    ]
  },
  {
    title: "Reorder List",
    slug: "reorder-list",
    difficulty: "Medium",
    category: "Linked List",
    description: "You are given the head of a singly linked-list. The list can be represented as:\n\n`L0 → L1 → … → Ln - 1 → Ln`\n\nReorder the list to be on the following form:\n\n`L0 → Ln → L1 → Ln - 1 → L2 → Ln - 2 → …`\n\nYou may not modify the values in the list's nodes. Only nodes themselves may be changed.",
    examples: [
      { input: "head = [1,2,3,4]", output: "[1,4,2,3]" },
      { input: "head = [1,2,3,4,5]", output: "[1,5,2,4,3]" }
    ],
    constraints: ["The number of nodes in the list is in the range [1, 5 * 10^4].", "1 <= Node.val <= 1000"],
    testCases: [
      { input: "[1,2,3,4]", expected: [1,4,2,3], functionCall: "solution([1,2,3,4])" },
      { input: "[1,2,3,4,5]", expected: [1,5,2,4,3], functionCall: "solution([1,2,3,4,5])" }
    ]
  }
];

const seedMissingAndTests = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB... Seeding Batch 10...");

    for (const prob of missingProblems) {
      await Problem.findOneAndUpdate(
        { slug: prob.slug }, 
        { $set: prob },
        { upsert: true, returnDocument: 'after' } 
      );
      console.log(`✅ Fully seeded: ${prob.slug}`);
    }

    console.log("🎉 Mega Batch 10 injected! Ab sirf 23 problems bachi hain!");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

seedMissingAndTests();