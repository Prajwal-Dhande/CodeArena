const mongoose = require('mongoose')
const Problem = require('../models/Problem')
require('dotenv').config()

const PROBLEMS = [
  // ── ARRAYS ──
  {
    slug: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays',
    companies: ['Google', 'Amazon', 'Facebook'],
    acceptance: 49,
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explain: 'nums[0] + nums[1] = 9' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explain: 'nums[1] + nums[2] = 6' },
    ],
    constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', 'Only one valid answer exists'],
    testCases: [
      { input: { nums: [2,7,11,15], target: 9 }, expected: [0,1], functionCall: 'twoSum([2,7,11,15], 9)' },
      { input: { nums: [3,2,4], target: 6 }, expected: [1,2], functionCall: 'twoSum([3,2,4], 6)' },
      { input: { nums: [3,3], target: 6 }, expected: [0,1], functionCall: 'twoSum([3,3], 6)' },
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {\n  // Your solution here\n\n};`,
      python: `def twoSum(nums, target):\n    # Your solution here\n    pass`,
      cpp: `vector<int> twoSum(vector<int>& nums, int target) {\n    // Your solution here\n}`,
      java: `public int[] twoSum(int[] nums, int target) {\n    // Your solution here\n    return new int[]{};\n}`,
    },
    hints: ['Try using a hash map', 'For each number, check if target - number exists'],
  },
  {
    slug: 'best-time-to-buy-stock',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    category: 'Arrays',
    companies: ['Amazon', 'Facebook', 'Microsoft'],
    acceptance: 54,
    description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve. If you cannot achieve any profit, return 0.',
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explain: 'Buy on day 2 (price=1), sell on day 5 (price=6), profit=5' },
      { input: 'prices = [7,6,4,3,1]', output: '0', explain: 'No profit possible' },
    ],
    constraints: ['1 ≤ prices.length ≤ 10⁵', '0 ≤ prices[i] ≤ 10⁴'],
    testCases: [
      { input: { prices: [7,1,5,3,6,4] }, expected: 5, functionCall: 'maxProfit([7,1,5,3,6,4])' },
      { input: { prices: [7,6,4,3,1] }, expected: 0, functionCall: 'maxProfit([7,6,4,3,1])' },
      { input: { prices: [1,2] }, expected: 1, functionCall: 'maxProfit([1,2])' },
    ],
    starterCode: {
      javascript: `function maxProfit(prices) {\n  // Your solution here\n\n};`,
      python: `def maxProfit(prices):\n    # Your solution here\n    pass`,
      cpp: `int maxProfit(vector<int>& prices) {\n    // Your solution here\n    return 0;\n}`,
      java: `public int maxProfit(int[] prices) {\n    // Your solution here\n    return 0;\n}`,
    },
    hints: ['Track minimum price seen so far', 'Calculate profit at each step'],
  },
  {
    slug: 'contains-duplicate',
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    category: 'Arrays',
    companies: ['Google', 'Apple'],
    acceptance: 61,
    description: 'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
    examples: [
      { input: 'nums = [1,2,3,1]', output: 'true', explain: '1 appears twice' },
      { input: 'nums = [1,2,3,4]', output: 'false', explain: 'All distinct' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁵', '-10⁹ ≤ nums[i] ≤ 10⁹'],
    testCases: [
      { input: { nums: [1,2,3,1] }, expected: true, functionCall: 'containsDuplicate([1,2,3,1])' },
      { input: { nums: [1,2,3,4] }, expected: false, functionCall: 'containsDuplicate([1,2,3,4])' },
      { input: { nums: [1,1,1,3,3,4,3,2,4,2] }, expected: true, functionCall: 'containsDuplicate([1,1,1,3,3,4,3,2,4,2])' },
    ],
    starterCode: {
      javascript: `function containsDuplicate(nums) {\n  // Your solution here\n\n};`,
      python: `def containsDuplicate(nums):\n    # Your solution here\n    pass`,
      cpp: `bool containsDuplicate(vector<int>& nums) {\n    // Your solution here\n    return false;\n}`,
      java: `public boolean containsDuplicate(int[] nums) {\n    // Your solution here\n    return false;\n}`,
    },
    hints: ['Use a Set to track seen numbers'],
  },
  {
    slug: 'product-of-array-except-self',
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    category: 'Arrays',
    companies: ['Facebook', 'Amazon', 'Microsoft'],
    acceptance: 65,
    description: 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. You must write an algorithm that runs in O(n) time and without using the division operation.',
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]', explain: 'Each element is product of all others' },
      { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]', explain: 'Zero makes most products 0' },
    ],
    constraints: ['2 ≤ nums.length ≤ 10⁵', '-30 ≤ nums[i] ≤ 30'],
    testCases: [
      { input: { nums: [1,2,3,4] }, expected: [24,12,8,6], functionCall: 'productExceptSelf([1,2,3,4])' },
      { input: { nums: [-1,1,0,-3,3] }, expected: [0,0,9,0,0], functionCall: 'productExceptSelf([-1,1,0,-3,3])' },
    ],
    starterCode: {
      javascript: `function productExceptSelf(nums) {\n  // Your solution here\n\n};`,
      python: `def productExceptSelf(nums):\n    # Your solution here\n    pass`,
      cpp: `vector<int> productExceptSelf(vector<int>& nums) {\n    // Your solution here\n}`,
      java: `public int[] productExceptSelf(int[] nums) {\n    // Your solution here\n    return new int[]{};\n}`,
    },
    hints: ['Use prefix and suffix products', 'Two passes: left products then right products'],
  },
  {
    slug: 'maximum-subarray',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    category: 'Arrays',
    companies: ['Amazon', 'Microsoft', 'Google'],
    acceptance: 50,
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explain: 'Subarray [4,-1,2,1] has sum 6' },
      { input: 'nums = [1]', output: '1', explain: 'Single element' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁵', '-10⁴ ≤ nums[i] ≤ 10⁴'],
    testCases: [
      { input: { nums: [-2,1,-3,4,-1,2,1,-5,4] }, expected: 6, functionCall: 'maxSubArray([-2,1,-3,4,-1,2,1,-5,4])' },
      { input: { nums: [1] }, expected: 1, functionCall: 'maxSubArray([1])' },
      { input: { nums: [5,4,-1,7,8] }, expected: 23, functionCall: 'maxSubArray([5,4,-1,7,8])' },
    ],
    starterCode: {
      javascript: `function maxSubArray(nums) {\n  // Your solution here\n\n};`,
      python: `def maxSubArray(nums):\n    # Your solution here\n    pass`,
      cpp: `int maxSubArray(vector<int>& nums) {\n    // Your solution here\n    return 0;\n}`,
      java: `public int maxSubArray(int[] nums) {\n    // Your solution here\n    return 0;\n}`,
    },
    hints: ["Kadane's algorithm", 'Track current sum and max sum'],
  },

  // ── STRINGS ──
  {
    slug: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Strings',
    companies: ['Google', 'Facebook', 'Amazon'],
    acceptance: 40,
    description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
    examples: [
      { input: 's = "()"', output: 'true', explain: 'Simple matching pair' },
      { input: 's = "()[]{}"', output: 'true', explain: 'All brackets match' },
      { input: 's = "(]"', output: 'false', explain: 'Wrong type' },
    ],
    constraints: ['1 ≤ s.length ≤ 10⁴', 's consists of parentheses only'],
    testCases: [
      { input: { s: '()' }, expected: true, functionCall: 'isValid("()")' },
      { input: { s: '()[]{}' }, expected: true, functionCall: 'isValid("()[]{}")' },
      { input: { s: '(]' }, expected: false, functionCall: 'isValid("(]")' },
      { input: { s: '([)]' }, expected: false, functionCall: 'isValid("([)]")' },
    ],
    starterCode: {
      javascript: `function isValid(s) {\n  // Your solution here\n\n};`,
      python: `def isValid(s):\n    # Your solution here\n    pass`,
      cpp: `bool isValid(string s) {\n    // Your solution here\n    return false;\n}`,
      java: `public boolean isValid(String s) {\n    // Your solution here\n    return false;\n}`,
    },
    hints: ['Use a stack', 'Push opening brackets, pop and verify closing brackets'],
  },
  {
    slug: 'longest-substring-without-repeating',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'Strings',
    companies: ['Amazon', 'Bloomberg', 'Facebook'],
    acceptance: 34,
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explain: '"abc" has length 3' },
      { input: 's = "bbbbb"', output: '1', explain: '"b" has length 1' },
      { input: 's = "pwwkew"', output: '3', explain: '"wke" has length 3' },
    ],
    constraints: ['0 ≤ s.length ≤ 5 * 10⁴', 's consists of English letters, digits, symbols'],
    testCases: [
      { input: { s: 'abcabcbb' }, expected: 3, functionCall: 'lengthOfLongestSubstring("abcabcbb")' },
      { input: { s: 'bbbbb' }, expected: 1, functionCall: 'lengthOfLongestSubstring("bbbbb")' },
      { input: { s: 'pwwkew' }, expected: 3, functionCall: 'lengthOfLongestSubstring("pwwkew")' },
    ],
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {\n  // Your solution here\n\n};`,
      python: `def lengthOfLongestSubstring(s):\n    # Your solution here\n    pass`,
      cpp: `int lengthOfLongestSubstring(string s) {\n    // Your solution here\n    return 0;\n}`,
      java: `public int lengthOfLongestSubstring(String s) {\n    // Your solution here\n    return 0;\n}`,
    },
    hints: ['Sliding window approach', 'Use a Set or Map to track characters'],
  },
  {
    slug: 'valid-anagram',
    title: 'Valid Anagram',
    difficulty: 'Easy',
    category: 'Strings',
    companies: ['Amazon', 'Facebook'],
    acceptance: 63,
    description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.',
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true', explain: 'Same characters, different order' },
      { input: 's = "rat", t = "car"', output: 'false', explain: 'Different characters' },
    ],
    constraints: ['1 ≤ s.length, t.length ≤ 5 * 10⁴', 's and t consist of lowercase letters'],
    testCases: [
      { input: { s: 'anagram', t: 'nagaram' }, expected: true, functionCall: 'isAnagram("anagram", "nagaram")' },
      { input: { s: 'rat', t: 'car' }, expected: false, functionCall: 'isAnagram("rat", "car")' },
      { input: { s: 'listen', t: 'silent' }, expected: true, functionCall: 'isAnagram("listen", "silent")' },
    ],
    starterCode: {
      javascript: `function isAnagram(s, t) {\n  // Your solution here\n\n};`,
      python: `def isAnagram(s, t):\n    # Your solution here\n    pass`,
      cpp: `bool isAnagram(string s, string t) {\n    // Your solution here\n    return false;\n}`,
      java: `public boolean isAnagram(String s, String t) {\n    // Your solution here\n    return false;\n}`,
    },
    hints: ['Count character frequencies', 'Sort both strings and compare'],
  },

  // ── LINKED LIST ──
  {
    slug: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    category: 'Linked List',
    companies: ['Amazon', 'Facebook', 'Microsoft'],
    acceptance: 73,
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explain: 'List reversed' },
      { input: 'head = [1,2]', output: '[2,1]', explain: 'Two elements swapped' },
    ],
    constraints: ['The number of nodes is in [0, 5000]', '-5000 ≤ Node.val ≤ 5000'],
    testCases: [
      { input: { head: [1,2,3,4,5] }, expected: [5,4,3,2,1], functionCall: 'reverseList([1,2,3,4,5])' },
      { input: { head: [1,2] }, expected: [2,1], functionCall: 'reverseList([1,2])' },
      { input: { head: [] }, expected: [], functionCall: 'reverseList([])' },
    ],
    starterCode: {
      javascript: `function reverseList(head) {\n  // Your solution here\n\n};`,
      python: `def reverseList(head):\n    # Your solution here\n    pass`,
      cpp: `ListNode* reverseList(ListNode* head) {\n    // Your solution here\n    return head;\n}`,
      java: `public ListNode reverseList(ListNode head) {\n    // Your solution here\n    return head;\n}`,
    },
    hints: ['Iterative: use three pointers', 'Recursive approach also works'],
  },
  {
    slug: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    category: 'Linked List',
    companies: ['Amazon', 'Microsoft', 'Apple'],
    acceptance: 62,
    description: 'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list. Return the head of the merged linked list.',
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]', explain: 'Merged and sorted' },
      { input: 'list1 = [], list2 = []', output: '[]', explain: 'Both empty' },
    ],
    constraints: ['0 ≤ nodes ≤ 50', '-100 ≤ Node.val ≤ 100'],
    testCases: [
      { input: { l1: [1,2,4], l2: [1,3,4] }, expected: [1,1,2,3,4,4], functionCall: 'mergeTwoLists([1,2,4], [1,3,4])' },
      { input: { l1: [], l2: [] }, expected: [], functionCall: 'mergeTwoLists([], [])' },
      { input: { l1: [], l2: [0] }, expected: [0], functionCall: 'mergeTwoLists([], [0])' },
    ],
    starterCode: {
      javascript: `function mergeTwoLists(list1, list2) {\n  // Your solution here\n\n};`,
      python: `def mergeTwoLists(list1, list2):\n    # Your solution here\n    pass`,
      cpp: `ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n    // Your solution here\n    return list1;\n}`,
      java: `public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n    // Your solution here\n    return list1;\n}`,
    },
    hints: ['Use a dummy head node', 'Compare values and advance the smaller pointer'],
  },

  // ── TREES ──
  {
    slug: 'maximum-depth-binary-tree',
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'Easy',
    category: 'Trees',
    companies: ['LinkedIn', 'Google', 'Amazon'],
    acceptance: 73,
    description: 'Given the root of a binary tree, return its maximum depth. A binary tree\'s maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '3', explain: 'Three levels deep' },
      { input: 'root = [1,null,2]', output: '2', explain: 'Two levels' },
    ],
    constraints: ['0 ≤ nodes ≤ 10⁴', '-100 ≤ Node.val ≤ 100'],
    testCases: [
      { input: { root: [3,9,20,null,null,15,7] }, expected: 3, functionCall: 'maxDepth([3,9,20,null,null,15,7])' },
      { input: { root: [1,null,2] }, expected: 2, functionCall: 'maxDepth([1,null,2])' },
      { input: { root: [] }, expected: 0, functionCall: 'maxDepth([])' },
    ],
    starterCode: {
      javascript: `function maxDepth(root) {\n  // Your solution here\n\n};`,
      python: `def maxDepth(root):\n    # Your solution here\n    pass`,
      cpp: `int maxDepth(TreeNode* root) {\n    // Your solution here\n    return 0;\n}`,
      java: `public int maxDepth(TreeNode root) {\n    // Your solution here\n    return 0;\n}`,
    },
    hints: ['Recursion: max(left depth, right depth) + 1', 'BFS level-by-level also works'],
  },
  {
    slug: 'invert-binary-tree',
    title: 'Invert Binary Tree',
    difficulty: 'Easy',
    category: 'Trees',
    companies: ['Google', 'Facebook', 'Uber'],
    acceptance: 76,
    description: 'Given the root of a binary tree, invert the tree, and return its root.',
    examples: [
      { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]', explain: 'Left and right subtrees swapped' },
      { input: 'root = [2,1,3]', output: '[2,3,1]', explain: 'Children swapped' },
    ],
    constraints: ['0 ≤ nodes ≤ 100', '-100 ≤ Node.val ≤ 100'],
    testCases: [
      { input: { root: [4,2,7,1,3,6,9] }, expected: [4,7,2,9,6,3,1], functionCall: 'invertTree([4,2,7,1,3,6,9])' },
      { input: { root: [2,1,3] }, expected: [2,3,1], functionCall: 'invertTree([2,1,3])' },
    ],
    starterCode: {
      javascript: `function invertTree(root) {\n  // Your solution here\n\n};`,
      python: `def invertTree(root):\n    # Your solution here\n    pass`,
      cpp: `TreeNode* invertTree(TreeNode* root) {\n    // Your solution here\n    return root;\n}`,
      java: `public TreeNode invertTree(TreeNode root) {\n    // Your solution here\n    return root;\n}`,
    },
    hints: ['Swap left and right children recursively'],
  },

  // ── DP ──
  {
    slug: 'climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    category: 'Dynamic Programming',
    companies: ['Amazon', 'Adobe', 'Apple'],
    acceptance: 52,
    description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    examples: [
      { input: 'n = 2', output: '2', explain: '1+1 or 2' },
      { input: 'n = 3', output: '3', explain: '1+1+1, 1+2, or 2+1' },
    ],
    constraints: ['1 ≤ n ≤ 45'],
    testCases: [
      { input: { n: 2 }, expected: 2, functionCall: 'climbStairs(2)' },
      { input: { n: 3 }, expected: 3, functionCall: 'climbStairs(3)' },
      { input: { n: 5 }, expected: 8, functionCall: 'climbStairs(5)' },
    ],
    starterCode: {
      javascript: `function climbStairs(n) {\n  // Your solution here\n\n};`,
      python: `def climbStairs(n):\n    # Your solution here\n    pass`,
      cpp: `int climbStairs(int n) {\n    // Your solution here\n    return 0;\n}`,
      java: `public int climbStairs(int n) {\n    // Your solution here\n    return 0;\n}`,
    },
    hints: ['This is a Fibonacci sequence', 'dp[i] = dp[i-1] + dp[i-2]'],
  },
  {
    slug: 'coin-change',
    title: 'Coin Change',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    companies: ['Amazon', 'Microsoft', 'Goldman Sachs'],
    acceptance: 42,
    description: 'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins needed to make up that amount. If that amount of money cannot be made up, return -1.',
    examples: [
      { input: 'coins = [1,5,11], amount = 11', output: '1', explain: 'One coin of 11' },
      { input: 'coins = [2], amount = 3', output: '-1', explain: 'Cannot make 3 with only 2s' },
    ],
    constraints: ['1 ≤ coins.length ≤ 12', '1 ≤ coins[i] ≤ 2^31 - 1', '0 ≤ amount ≤ 10⁴'],
    testCases: [
      { input: { coins: [1,5,11], amount: 11 }, expected: 1, functionCall: 'coinChange([1,5,11], 11)' },
      { input: { coins: [2], amount: 3 }, expected: -1, functionCall: 'coinChange([2], 3)' },
      { input: { coins: [1,2,5], amount: 11 }, expected: 3, functionCall: 'coinChange([1,2,5], 11)' },
    ],
    starterCode: {
      javascript: `function coinChange(coins, amount) {\n  // Your solution here\n\n};`,
      python: `def coinChange(coins, amount):\n    # Your solution here\n    pass`,
      cpp: `int coinChange(vector<int>& coins, int amount) {\n    // Your solution here\n    return -1;\n}`,
      java: `public int coinChange(int[] coins, int amount) {\n    // Your solution here\n    return -1;\n}`,
    },
    hints: ['Bottom-up DP', 'dp[i] = min coins to make amount i'],
  },
  {
    slug: 'house-robber',
    title: 'House Robber',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    companies: ['Airbnb', 'LinkedIn', 'Amazon'],
    acceptance: 50,
    description: 'You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Adjacent houses cannot be robbed on the same night. Given an integer array nums, return the maximum amount of money you can rob tonight without alerting the police.',
    examples: [
      { input: 'nums = [1,2,3,1]', output: '4', explain: 'Rob house 1 and 3' },
      { input: 'nums = [2,7,9,3,1]', output: '12', explain: 'Rob houses 1, 3, 5' },
    ],
    constraints: ['1 ≤ nums.length ≤ 100', '0 ≤ nums[i] ≤ 400'],
    testCases: [
      { input: { nums: [1,2,3,1] }, expected: 4, functionCall: 'rob([1,2,3,1])' },
      { input: { nums: [2,7,9,3,1] }, expected: 12, functionCall: 'rob([2,7,9,3,1])' },
      { input: { nums: [2,1,1,2] }, expected: 4, functionCall: 'rob([2,1,1,2])' },
    ],
    starterCode: {
      javascript: `function rob(nums) {\n  // Your solution here\n\n};`,
      python: `def rob(nums):\n    # Your solution here\n    pass`,
      cpp: `int rob(vector<int>& nums) {\n    // Your solution here\n    return 0;\n}`,
      java: `public int rob(int[] nums) {\n    // Your solution here\n    return 0;\n}`,
    },
    hints: ['dp[i] = max(dp[i-1], dp[i-2] + nums[i])'],
  },

  // ── GRAPHS ──
  {
    slug: 'number-of-islands',
    title: 'Number of Islands',
    difficulty: 'Medium',
    category: 'Graphs',
    companies: ['Amazon', 'Bloomberg', 'Facebook'],
    acceptance: 57,
    description: 'Given an m x n 2D binary grid grid which represents a map of "1"s (land) and "0"s (water), return the number of islands.',
    examples: [
      { input: 'grid = [["1","1","1"],["0","1","0"],["1","1","1"]]', output: '1', explain: 'One connected island' },
      { input: 'grid = [["1","1","0"],["1","1","0"],["0","0","1"]]', output: '2', explain: 'Two separate islands' },
    ],
    constraints: ['m, n >= 1', 'grid[i][j] is "0" or "1"'],
    testCases: [
      { input: { grid: [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]] }, expected: 1, functionCall: 'numIslands([["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]])' },
      { input: { grid: [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]] }, expected: 3, functionCall: 'numIslands([["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]])' },
    ],
    starterCode: {
      javascript: `function numIslands(grid) {\n  // Your solution here\n\n};`,
      python: `def numIslands(grid):\n    # Your solution here\n    pass`,
      cpp: `int numIslands(vector<vector<char>>& grid) {\n    // Your solution here\n    return 0;\n}`,
      java: `public int numIslands(char[][] grid) {\n    // Your solution here\n    return 0;\n}`,
    },
    hints: ['DFS/BFS from each unvisited land cell', 'Mark visited cells to avoid revisiting'],
  },
  {
    slug: 'merge-intervals',
    title: 'Merge Intervals',
    difficulty: 'Medium',
    category: 'Arrays',
    companies: ['Facebook', 'Microsoft', 'Google'],
    acceptance: 46,
    description: 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals.',
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explain: '[1,3] and [2,6] overlap' },
      { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]', explain: 'Adjacent intervals' },
    ],
    constraints: ['1 ≤ intervals.length ≤ 10⁴'],
    testCases: [
      { input: { intervals: [[1,3],[2,6],[8,10],[15,18]] }, expected: [[1,6],[8,10],[15,18]], functionCall: 'merge([[1,3],[2,6],[8,10],[15,18]])' },
      { input: { intervals: [[1,4],[4,5]] }, expected: [[1,5]], functionCall: 'merge([[1,4],[4,5]])' },
    ],
    starterCode: {
      javascript: `function merge(intervals) {\n  // Your solution here\n\n};`,
      python: `def merge(intervals):\n    # Your solution here\n    pass`,
      cpp: `vector<vector<int>> merge(vector<vector<int>>& intervals) {\n    // Your solution here\n}`,
      java: `public int[][] merge(int[][] intervals) {\n    // Your solution here\n    return intervals;\n}`,
    },
    hints: ['Sort by start time', 'Compare end of last merged with start of current'],
  },

  // ── BINARY SEARCH ──
  {
    slug: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Easy',
    category: 'Binary Search',
    companies: ['Facebook', 'Amazon'],
    acceptance: 55,
    description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, return its index. Otherwise, return -1.',
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explain: '9 is at index 4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explain: '2 not found' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁴', 'All nums are unique', 'nums is sorted ascending'],
    testCases: [
      { input: { nums: [-1,0,3,5,9,12], target: 9 }, expected: 4, functionCall: 'search([-1,0,3,5,9,12], 9)' },
      { input: { nums: [-1,0,3,5,9,12], target: 2 }, expected: -1, functionCall: 'search([-1,0,3,5,9,12], 2)' },
      { input: { nums: [5], target: 5 }, expected: 0, functionCall: 'search([5], 5)' },
    ],
    starterCode: {
      javascript: `function search(nums, target) {\n  // Your solution here\n\n};`,
      python: `def search(nums, target):\n    # Your solution here\n    pass`,
      cpp: `int search(vector<int>& nums, int target) {\n    // Your solution here\n    return -1;\n}`,
      java: `public int search(int[] nums, int target) {\n    // Your solution here\n    return -1;\n}`,
    },
    hints: ['left = 0, right = n-1', 'mid = (left + right) / 2'],
  },
  {
    slug: 'find-minimum-in-rotated-array',
    title: 'Find Minimum in Rotated Sorted Array',
    difficulty: 'Medium',
    category: 'Binary Search',
    companies: ['Microsoft', 'Amazon', 'Facebook'],
    acceptance: 49,
    description: 'Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Given the sorted rotated array nums of unique elements, return the minimum element.',
    examples: [
      { input: 'nums = [3,4,5,1,2]', output: '1', explain: 'Array rotated 3 times' },
      { input: 'nums = [4,5,6,7,0,1,2]', output: '0', explain: 'Array rotated 4 times' },
    ],
    constraints: ['n == nums.length', '1 ≤ n ≤ 5000', 'All integers are unique'],
    testCases: [
      { input: { nums: [3,4,5,1,2] }, expected: 1, functionCall: 'findMin([3,4,5,1,2])' },
      { input: { nums: [4,5,6,7,0,1,2] }, expected: 0, functionCall: 'findMin([4,5,6,7,0,1,2])' },
      { input: { nums: [11,13,15,17] }, expected: 11, functionCall: 'findMin([11,13,15,17])' },
    ],
    starterCode: {
      javascript: `function findMin(nums) {\n  // Your solution here\n\n};`,
      python: `def findMin(nums):\n    # Your solution here\n    pass`,
      cpp: `int findMin(vector<int>& nums) {\n    // Your solution here\n    return 0;\n}`,
      java: `public int findMin(int[] nums) {\n    // Your solution here\n    return 0;\n}`,
    },
    hints: ['Modified binary search', 'Compare mid with right to determine which half has minimum'],
  },

  // ── STACK/QUEUE ──
  {
    slug: 'min-stack',
    title: 'Min Stack',
    difficulty: 'Medium',
    category: 'Stack',
    companies: ['Amazon', 'Bloomberg', 'Google'],
    acceptance: 53,
    description: 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.',
    examples: [
      { input: 'MinStack(), push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()', output: '-3, 0, -2', explain: 'Track min alongside stack' },
    ],
    constraints: ['-2^31 ≤ val ≤ 2^31 - 1', 'pop/top/getMin called on non-empty stack'],
    testCases: [
      { input: { ops: ['push', 'push', 'push', 'getMin', 'pop', 'top', 'getMin'], vals: [-2, 0, -3, null, null, null, null] }, expected: [-3, 0, -2], functionCall: 'minStackOps([-2,0,-3])' },
    ],
    starterCode: {
      javascript: `class MinStack {\n  constructor() {\n    // Initialize\n  }\n  push(val) {\n    // Push\n  }\n  pop() {\n    // Pop\n  }\n  top() {\n    // Return top\n  }\n  getMin() {\n    // Return min\n  }\n}`,
      python: `class MinStack:\n    def __init__(self):\n        pass\n    def push(self, val):\n        pass\n    def pop(self):\n        pass\n    def top(self):\n        pass\n    def getMin(self):\n        pass`,
      cpp: `class MinStack {\npublic:\n    MinStack() {}\n    void push(int val) {}\n    void pop() {}\n    int top() { return 0; }\n    int getMin() { return 0; }\n};`,
      java: `class MinStack {\n    public MinStack() {}\n    public void push(int val) {}\n    public void pop() {}\n    public int top() { return 0; }\n    public int getMin() { return 0; }\n}`,
    },
    hints: ['Use two stacks: one for values, one for minimums', 'Push to min stack only when new min found'],
  },
]

async function seedProblems() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB Connected')

    await Problem.deleteMany({})
    console.log('🗑️  Old problems cleared')

    await Problem.insertMany(PROBLEMS)
    console.log(`✅ ${PROBLEMS.length} problems seeded successfully!`)

    mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed error:', error)
    process.exit(1)
  }
}

seedProblems()