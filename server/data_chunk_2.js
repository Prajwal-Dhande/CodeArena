const data = [
  {
    slug: 'search-in-rotated-sorted-array-faang',
    description: 'There is an integer array `nums` sorted in ascending order (with **distinct** values).\n\nPrior to being passed to your function, `nums` is **possibly rotated** at an unknown pivot index `k` (`1 <= k < nums.length`) such that the resulting array is `[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]` (**0-indexed**).\n\nGiven the array `nums` **after** the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not in `nums`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.',
    examples: [
      { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4', explain: '' },
      { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1', explain: '' }
    ],
    constraints: ['1 <= nums.length <= 5000', '-10^4 <= nums[i] <= 10^4', 'All values of nums are unique.', 'nums is an ascending array that is possibly rotated.', '-10^4 <= target <= 10^4'],
    starterCode: {
      javascript: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number}\n */\nfunction search(nums, target) {\n    \n}',
      python: 'class Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        ',
      java: 'class Solution {\n    public int search(int[] nums, int target) {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        \n    }\n};'
    }
  },
  {
    slug: 'longest-substring-without-repeating-characters-faang',
    description: 'Given a string `s`, find the length of the **longest substring** without repeating characters.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explain: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explain: 'The answer is "b", with the length of 1.' },
      { input: 's = "pwwkew"', output: '3', explain: 'The answer is "wke", with the length of 3.' }
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    starterCode: {
      javascript: '/**\n * @param {string} s\n * @return {number}\n */\nfunction lengthOfLongestSubstring(s) {\n    \n}',
      python: 'class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        ',
      java: 'class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        \n    }\n};'
    }
  },
  {
    slug: 'word-search-faang',
    description: 'Given an `m x n` grid of characters `board` and a string `word`, return `true` if `word` exists in the grid.\n\nThe word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.',
    examples: [
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: 'true', explain: '' },
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"', output: 'false', explain: '' }
    ],
    constraints: ['m == board.length', 'n = board[i].length', '1 <= m, n <= 6', '1 <= word.length <= 15', 'board and word consists of only lowercase and uppercase English letters.'],
    starterCode: {
      javascript: '/**\n * @param {character[][]} board\n * @param {string} word\n * @return {boolean}\n */\nfunction exist(board, word) {\n    \n}',
      python: 'class Solution:\n    def exist(self, board: List[List[str]], word: str) -> bool:\n        ',
      java: 'class Solution {\n    public boolean exist(char[][] board, String word) {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    bool exist(vector<vector<char>>& board, string word) {\n        \n    }\n};'
    }
  },
  {
    slug: 'validate-binary-search-tree-faang',
    description: 'Given the `root` of a binary tree, determine if it is a valid binary search tree (BST).\n\nA **valid BST** is defined as follows:\n- The left subtree of a node contains only nodes with keys **less than** the node\'s key.\n- The right subtree of a node contains only nodes with keys **greater than** the node\'s key.\n- Both the left and right subtrees must also be binary search trees.',
    examples: [
      { input: 'root = [2,1,3]', output: 'true', explain: '' },
      { input: 'root = [5,1,4,null,null,3,6]', output: 'false', explain: 'The root node\'s value is 5 but its right child\'s value is 4.' }
    ],
    constraints: ['The number of nodes in the tree is in the range [1, 10^4].', '-2^31 <= Node.val <= 2^31 - 1'],
    starterCode: {
      javascript: '/**\n * @param {TreeNode} root\n * @return {boolean}\n */\nfunction isValidBST(root) {\n    \n}',
      python: 'class Solution:\n    def isValidBST(self, root: Optional[TreeNode]) -> bool:\n        ',
      java: 'class Solution {\n    public boolean isValidBST(TreeNode root) {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    bool isValidBST(TreeNode* root) {\n        \n    }\n};'
    }
  },
  {
    slug: 'lowest-common-ancestor-of-a-binary-tree-faang',
    description: 'Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.\n\nAccording to the definition of LCA on Wikipedia: "The lowest common ancestor is defined between two nodes `p` and `q` as the lowest node in `T` that has both `p` and `q` as descendants (where we allow **a node to be a descendant of itself**)."',
    examples: [
      { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1', output: '3', explain: 'The LCA of nodes 5 and 1 is 3.' }
    ],
    constraints: ['The number of nodes in the tree is in the range [2, 10^5].', '-10^9 <= Node.val <= 10^9', 'All Node.val are unique.', 'p != q', 'p and q will exist in the tree.'],
    starterCode: {
      javascript: '/**\n * @param {TreeNode} root\n * @param {TreeNode} p\n * @param {TreeNode} q\n * @return {TreeNode}\n */\nfunction lowestCommonAncestor(root, p, q) {\n    \n}',
      python: 'class Solution:\n    def lowestCommonAncestor(self, root: \'TreeNode\', p: \'TreeNode\', q: \'TreeNode\') -> \'TreeNode\':\n        ',
      java: 'class Solution {\n    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {\n        \n    }\n};'
    }
  },
  {
    slug: 'course-schedule-faang',
    description: 'There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [ai, bi]` indicates that you **must** take course `bi` first if you want to take course `ai`.\n\nReturn `true` if you can finish all courses. Otherwise, return `false`.',
    examples: [
      { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true', explain: 'To take course 1 you should have finished course 0. So it is possible.' },
      { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false', explain: 'To take course 1 you should have finished course 0, and to take course 0 you should also have finished course 1. So it is impossible.' }
    ],
    constraints: ['1 <= numCourses <= 2000', '0 <= prerequisites.length <= 5000', 'prerequisites[i].length == 2', '0 <= ai, bi < numCourses', 'All the pairs prerequisites[i] are unique.'],
    starterCode: {
      javascript: '/**\n * @param {number} numCourses\n * @param {number[][]} prerequisites\n * @return {boolean}\n */\nfunction canFinish(numCourses, prerequisites) {\n    \n}',
      python: 'class Solution:\n    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:\n        ',
      java: 'class Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n        \n    }\n};'
    }
  },
  {
    slug: 'product-of-array-except-self-faang',
    description: 'Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.\n\nThe product of any prefix or suffix of `nums` is **guaranteed** to fit in a **32-bit** integer.\n\nYou must write an algorithm that runs in `O(n)` time and without using the division operation.',
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]', explain: '' },
      { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]', explain: '' }
    ],
    constraints: ['2 <= nums.length <= 10^5', '-30 <= nums[i] <= 30', 'The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.'],
    starterCode: {
      javascript: '/**\n * @param {number[]} nums\n * @return {number[]}\n */\nfunction productExceptSelf(nums) {\n    \n}',
      python: 'class Solution:\n    def productExceptSelf(self, nums: List[int]) -> List[int]:\n        ',
      java: 'class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        \n    }\n};'
    }
  },
  {
    slug: 'kth-largest-element-in-an-array-faang',
    description: 'Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array.\n\nNote that it is the `k`th largest element in the sorted order, not the `k`th distinct element.\n\nCan you solve it without sorting?',
    examples: [
      { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5', explain: '' },
      { input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4', output: '4', explain: '' }
    ],
    constraints: ['1 <= k <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    starterCode: {
      javascript: '/**\n * @param {number[]} nums\n * @param {number} k\n * @return {number}\n */\nfunction findKthLargest(nums, k) {\n    \n}',
      python: 'class Solution:\n    def findKthLargest(self, nums: List[int], k: int) -> int:\n        ',
      java: 'class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n        \n    }\n};'
    }
  },
  {
    slug: 'binary-tree-level-order-traversal-faang',
    description: 'Given the `root` of a binary tree, return the level order traversal of its nodes\' values. (i.e., from left to right, level by level).',
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]', explain: '' },
      { input: 'root = [1]', output: '[[1]]', explain: '' }
    ],
    constraints: ['The number of nodes in the tree is in the range [0, 2000].', '-1000 <= Node.val <= 1000'],
    starterCode: {
      javascript: '/**\n * @param {TreeNode} root\n * @return {number[][]}\n */\nfunction levelOrder(root) {\n    \n}',
      python: 'class Solution:\n    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:\n        ',
      java: 'class Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        \n    }\n};'
    }
  },
  {
    slug: 'serialize-and-deserialize-binary-tree-faang',
    description: 'Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer, or transmitted across a network connection link to be reconstructed later in the same or another computer environment.\n\nDesign an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work. You just need to ensure that a binary tree can be serialized to a string and this string can be deserialized to the original tree structure.',
    examples: [
      { input: 'root = [1,2,3,null,null,4,5]', output: '[1,2,3,null,null,4,5]', explain: '' }
    ],
    constraints: ['The number of nodes in the tree is in the range [0, 10^4].', '-1000 <= Node.val <= 1000'],
    starterCode: {
      javascript: '/**\n * Encodes a tree to a single string.\n * @param {TreeNode} root\n * @return {string}\n */\nvar serialize = function(root) {\n    \n};\n\n/**\n * Decodes your encoded data to tree.\n * @param {string} data\n * @return {TreeNode}\n */\nvar deserialize = function(data) {\n    \n};',
      python: 'class Codec:\n    def serialize(self, root):\n        \n    def deserialize(self, data):\n        ',
      java: 'public class Codec {\n    public String serialize(TreeNode root) {\n        \n    }\n    public TreeNode deserialize(String data) {\n        \n    }\n}',
      cpp: 'class Codec {\npublic:\n    string serialize(TreeNode* root) {\n        \n    }\n    TreeNode* deserialize(string data) {\n        \n    }\n};'
    }
  },
  {
    slug: 'trapping-rain-water-faang',
    description: 'Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.',
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explain: 'The above elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are being trapped.' },
      { input: 'height = [4,2,0,3,2,5]', output: '9', explain: '' }
    ],
    constraints: ['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
    starterCode: {
      javascript: '/**\n * @param {number[]} height\n * @return {number}\n */\nfunction trap(height) {\n    \n}',
      python: 'class Solution:\n    def trap(self, height: List[int]) -> int:\n        ',
      java: 'class Solution {\n    public int trap(int[] height) {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    int trap(vector<int>& height) {\n        \n    }\n};'
    }
  },
  {
    slug: 'merge-k-sorted-lists-faang',
    description: 'You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.',
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]', explain: 'The linked-lists are:\n[\n  1->4->5,\n  1->3->4,\n  2->6\n]\nmerging them into one sorted list:\n1->1->2->3->4->4->5->6' },
      { input: 'lists = []', output: '[]', explain: '' }
    ],
    constraints: ['k == lists.length', '0 <= k <= 10^4', '0 <= lists[i].length <= 500', '-10^4 <= lists[i][j] <= 10^4', 'lists[i] is sorted in ascending order.', 'The sum of lists[i].length will not exceed 10^4.'],
    starterCode: {
      javascript: '/**\n * @param {ListNode[]} lists\n * @return {ListNode}\n */\nfunction mergeKLists(lists) {\n    \n}',
      python: 'class Solution:\n    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:\n        ',
      java: 'class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n        \n    }\n};'
    }
  },
  {
    slug: 'median-of-two-sorted-arrays-faang',
    description: 'Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return **the median** of the two sorted arrays.\n\nThe overall run time complexity should be `O(log (m+n))`.',
    examples: [
      { input: 'nums1 = [1,3], nums2 = [2]', output: '2.00000', explain: 'merged array = [1,2,3] and median is 2.' },
      { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.50000', explain: 'merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.' }
    ],
    constraints: ['nums1.length == m', 'nums2.length == n', '0 <= m <= 1000', '0 <= n <= 1000', '1 <= m + n <= 2000', '-10^6 <= nums1[i], nums2[i] <= 10^6'],
    starterCode: {
      javascript: '/**\n * @param {number[]} nums1\n * @param {number[]} nums2\n * @return {number}\n */\nfunction findMedianSortedArrays(nums1, nums2) {\n    \n}',
      python: 'class Solution:\n    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:\n        ',
      java: 'class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        \n    }\n};'
    }
  },
  {
    slug: 'word-ladder-faang',
    description: 'A **transformation sequence** from word `beginWord` to word `endWord` using a dictionary `wordList` is a sequence of words `beginWord -> s1 -> s2 -> ... -> sk` such that:\n- Every adjacent pair of words differs by a single letter.\n- Every `si` for `1 <= i <= k` is in `wordList`. Note that `beginWord` does not need to be in `wordList`.\n- `sk == endWord`\n\nGiven two words, `beginWord` and `endWord`, and a dictionary `wordList`, return the **number of words** in the shortest transformation sequence from `beginWord` to `endWord`, or `0` if no such sequence exists.',
    examples: [
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '5', explain: 'One shortest transformation sequence is "hit" -> "hot" -> "dot" -> "dog" -> "cog", which is 5 words long.' },
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: '0', explain: 'The endWord "cog" is not in wordList, therefore there is no valid transformation sequence.' }
    ],
    constraints: ['1 <= beginWord.length <= 10', 'endWord.length == beginWord.length', '1 <= wordList.length <= 5000', 'wordList[i].length == beginWord.length', 'beginWord, endWord, and wordList[i] consist of lowercase English letters.', 'beginWord != endWord', 'All the words in wordList are unique.'],
    starterCode: {
      javascript: '/**\n * @param {string} beginWord\n * @param {string} endWord\n * @param {string[]} wordList\n * @return {number}\n */\nfunction ladderLength(beginWord, endWord, wordList) {\n    \n}',
      python: 'class Solution:\n    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:\n        ',
      java: 'class Solution {\n    public int ladderLength(String beginWord, String endWord, List<String> wordList) {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {\n        \n    }\n};'
    }
  },
  {
    slug: 'regular-expression-matching-faang',
    description: 'Given an input string `s` and a pattern `p`, implement regular expression matching with support for `\'.\'` and `\'*\'` where:\n- `\'.\'` Matches any single character.​​​​\n- `\'*\'` Matches zero or more of the preceding element.\n\nThe matching should cover the **entire** input string (not partial).',
    examples: [
      { input: 's = "aa", p = "a"', output: 'false', explain: '"a" does not match the entire string "aa".' },
      { input: 's = "aa", p = "a*"', output: 'true', explain: '"*" means zero or more of the preceding element, \'a\'. Therefore, by repeating \'a\' once, it becomes "aa".' },
      { input: 's = "ab", p = ".*"', output: 'true', explain: '".*" means "zero or more (*) of any character (.)".' }
    ],
    constraints: ['1 <= s.length <= 20', '1 <= p.length <= 20', 's contains only lowercase English letters.', 'p contains only lowercase English letters, \'.\', and \'*\'.', 'It is guaranteed for each appearance of the character \'*\' that there will be a previous valid character to match.'],
    starterCode: {
      javascript: '/**\n * @param {string} s\n * @param {string} p\n * @return {boolean}\n */\nfunction isMatch(s, p) {\n    \n}',
      python: 'class Solution:\n    def isMatch(self, s: str, p: str) -> bool:\n        ',
      java: 'class Solution {\n    public boolean isMatch(String s, String p) {\n        \n    }\n}',
      cpp: 'class Solution {\npublic:\n    bool isMatch(string s, string p) {\n        \n    }\n};'
    }
  }
];
module.exports = data;
