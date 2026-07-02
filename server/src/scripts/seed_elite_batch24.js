const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Problem = require('../models/Problem');

const problems = [
  {
    slug: 'intersection-of-two-linked-lists',
    title: 'Intersection of Two Linked Lists',
    difficulty: 'Easy',
    category: 'Linked List',
    description: `Given the heads of two singly linked-lists \`headA\` and \`headB\`, return the node at which the two lists intersect. If the two linked lists have no intersection at all, return \`null\`.

The test cases are generated such that there are no cycles anywhere in the entire linked structure.

**Note** that the linked lists must **retain their original structure** after the function returns.`,
    examples: [
      { input: 'intersectVal = 8, listA = [4,1,8,4,5], listB = [5,6,1,8,4,5], skipA = 2, skipB = 3', output: 'Intersected at \'8\'', explain: '' },
      { input: 'intersectVal = 0, listA = [2,6,4], listB = [1,5], skipA = 3, skipB = 2', output: 'No intersection', explain: '' }
    ],
    constraints: [
      'The number of nodes of listA is in the m.',
      'The number of nodes of listB is in the n.',
      '1 <= m, n <= 3 * 10^4',
      '1 <= Node.val <= 10^5',
      '0 <= skipA < m',
      '0 <= skipB < n',
      'intersectVal is 0 if listA and listB do not intersect.',
      'intersectVal == listA[skipA] == listB[skipB] if listA and listB intersect.'
    ],
    testCases: [
      { input: { listA: [4,1,8,4,5], listB: [5,6,1,8,4,5] }, expected: 8, functionCall: 'getIntersectionNode(createLinkedList([4,1,8,4,5]), createLinkedList([5,6,1,8,4,5]))' }
    ],
    starterCode: {
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} headA
 * @param {ListNode} headB
 * @return {ListNode}
 */
function getIntersectionNode(headA, headB) {
    
}`,
      python: `def getIntersectionNode(headA, headB):
    pass`,
      cpp: `ListNode *getIntersectionNode(ListNode *headA, ListNode *headB) {
    
}`,
      java: `public ListNode getIntersectionNode(ListNode headA, ListNode headB) {
    
}`
    },
    hints: ['If the two linked lists have no intersection at all, then return null.', 'You can use two pointers, pA and pB. When pA reaches the end of a list, then redirect it to the head of B. When pB reaches the end of a list, redirect it the head of A.', 'If at any point pA == pB, then pA/pB is the intersection node.'],
    companies: ['Amazon', 'Meta', 'Microsoft'],
    acceptance: 55,
    isPremium: true,
    tier: 'premium',
    faangFrequency: 93,
    isFaang: true,
    topCompany: 'Amazon',
    order: 116
  },
  {
    slug: 'linked-list-cycle-ii',
    title: 'Linked List Cycle II',
    difficulty: 'Medium',
    category: 'Linked List',
    description: `Given the \`head\` of a linked list, return the node where the cycle begins. If there is no cycle, return \`null\`.

There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the \`next\` pointer. Internally, \`pos\` is used to denote the index of the node that tail's \`next\` pointer is connected to (**0-indexed**). It is \`-1\` if there is no cycle. **Note that \`pos\` is not passed as a parameter.**

**Do not modify** the linked list.`,
    examples: [
      { input: 'head = [3,2,0,-4], pos = 1', output: 'tail connects to node index 1', explain: 'There is a cycle in the linked list, where tail connects to the second node.' },
      { input: 'head = [1,2], pos = 0', output: 'tail connects to node index 0', explain: 'There is a cycle in the linked list, where tail connects to the first node.' },
      { input: 'head = [1], pos = -1', output: 'no cycle', explain: 'There is no cycle in the linked list.' }
    ],
    constraints: [
      'The number of the nodes in the list is in the range [0, 10^4].',
      '-10^5 <= Node.val <= 10^5',
      'pos is -1 or a valid index in the linked-list.'
    ],
    testCases: [
      { input: { head: [3,2,0,-4], pos: 1 }, expected: 1, functionCall: 'detectCycle(createLinkedListCycle([3,2,0,-4], 1))' },
      { input: { head: [1,2], pos: 0 }, expected: 0, functionCall: 'detectCycle(createLinkedListCycle([1,2], 0))' }
    ],
    starterCode: {
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} head
 * @return {ListNode}
 */
function detectCycle(head) {
    
}`,
      python: `def detectCycle(head):
    pass`,
      cpp: `ListNode *detectCycle(ListNode *head) {
    
}`,
      java: `public ListNode detectCycle(ListNode head) {
    
}`
    },
    hints: ['Can you use Floyd\'s Cycle-Finding Algorithm? (Fast and Slow pointers).', 'Once the fast and slow pointers meet, set one of the pointers to the head. Move both pointers one step at a time. The node where they meet is the start of the cycle.'],
    companies: ['Amazon', 'Microsoft', 'Meta'],
    acceptance: 49,
    isPremium: true,
    tier: 'premium',
    faangFrequency: 86,
    isFaang: true,
    topCompany: 'Amazon',
    order: 117
  },
  {
    slug: 'partition-list',
    title: 'Partition List',
    difficulty: 'Medium',
    category: 'Linked List',
    description: `Given the \`head\` of a linked list and a value \`x\`, partition it such that all nodes **less than** \`x\` come before nodes **greater than or equal** to \`x\`.

You should **preserve** the original relative order of the nodes in each of the two partitions.`,
    examples: [
      { input: 'head = [1,4,3,2,5,2], x = 3', output: '[1,2,2,4,3,5]', explain: '' },
      { input: 'head = [2,1], x = 2', output: '[1,2]', explain: '' }
    ],
    constraints: [
      'The number of nodes in the list is in the range [0, 200].',
      '-100 <= Node.val <= 100',
      '-200 <= x <= 200'
    ],
    testCases: [
      { input: { head: [1,4,3,2,5,2], x: 3 }, expected: [1,2,2,4,3,5], functionCall: 'partition(createLinkedList([1,4,3,2,5,2]), 3)' },
      { input: { head: [2,1], x: 2 }, expected: [1,2], functionCall: 'partition(createLinkedList([2,1]), 2)' }
    ],
    starterCode: {
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @param {number} x
 * @return {ListNode}
 */
function partition(head, x) {
    
}`,
      python: `def partition(head, x):
    pass`,
      cpp: `ListNode* partition(ListNode* head, int x) {
    
}`,
      java: `public ListNode partition(ListNode head, int x) {
    
}`
    },
    hints: ['Create two dummy nodes to form two separate lists: one for nodes < x and another for nodes >= x.', 'Traverse the original list, appending each node to the appropriate list. Finally, connect the two lists and set the end of the second list to null.'],
    companies: ['Amazon', 'Microsoft', 'Apple'],
    acceptance: 54,
    isPremium: true,
    tier: 'premium',
    faangFrequency: 75,
    isFaang: true,
    topCompany: 'Amazon',
    order: 118
  },
  {
    slug: 'insertion-sort-list',
    title: 'Insertion Sort List',
    difficulty: 'Medium',
    category: 'Linked List',
    description: `Given the \`head\` of a singly linked list, sort the list using **insertion sort**, and return the sorted list's head.

The steps of the **insertion sort** algorithm:
1. Insertion sort iterates, consuming one input element each repetition and growing a sorted output list.
2. At each iteration, insertion sort removes one element from the input data, finds the location it belongs within the sorted list and inserts it there.
3. It repeats until no input elements remain.`,
    examples: [
      { input: 'head = [4,2,1,3]', output: '[1,2,3,4]', explain: '' },
      { input: 'head = [-1,5,3,4,0]', output: '[-1,0,3,4,5]', explain: '' }
    ],
    constraints: [
      'The number of nodes in the list is in the range [1, 5000].',
      '-5000 <= Node.val <= 5000'
    ],
    testCases: [
      { input: { head: [4,2,1,3] }, expected: [1,2,3,4], functionCall: 'insertionSortList(createLinkedList([4,2,1,3]))' },
      { input: { head: [-1,5,3,4,0] }, expected: [-1,0,3,4,5], functionCall: 'insertionSortList(createLinkedList([-1,5,3,4,0]))' }
    ],
    starterCode: {
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
function insertionSortList(head) {
    
}`,
      python: `def insertionSortList(head):
    pass`,
      cpp: `ListNode* insertionSortList(ListNode* head) {
    
}`,
      java: `public ListNode insertionSortList(ListNode head) {
    
}`
    },
    hints: ['Create a dummy node to act as the head of the sorted list.', 'Iterate through the original list. For each node, iterate through the sorted list to find its correct position and insert it.'],
    companies: ['Amazon', 'Microsoft', 'Bloomberg'],
    acceptance: 53,
    isPremium: true,
    tier: 'premium',
    faangFrequency: 65,
    isFaang: true,
    topCompany: 'Amazon',
    order: 119
  },
  {
    slug: 'balanced-binary-tree',
    title: 'Balanced Binary Tree',
    difficulty: 'Easy',
    category: 'Tree',
    description: `Given a binary tree, determine if it is **height-balanced**.

A **height-balanced** binary tree is defined as:
> a binary tree in which the left and right subtrees of *every* node differ in height by no more than 1.`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: 'true', explain: '' },
      { input: 'root = [1,2,2,3,3,null,null,4,4]', output: 'false', explain: '' },
      { input: 'root = []', output: 'true', explain: '' }
    ],
    constraints: [
      'The number of nodes in the tree is in the range [0, 5000].',
      '-10^4 <= Node.val <= 10^4'
    ],
    testCases: [
      { input: { root: [3,9,20,null,null,15,7] }, expected: true, functionCall: 'isBalanced([3,9,20,null,null,15,7])' },
      { input: { root: [1,2,2,3,3,null,null,4,4] }, expected: false, functionCall: 'isBalanced([1,2,2,3,3,null,null,4,4])' },
      { input: { root: [] }, expected: true, functionCall: 'isBalanced([])' }
    ],
    starterCode: {
      javascript: `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {boolean}
 */
function isBalanced(root) {
    
}`,
      python: `def isBalanced(root):
    pass`,
      cpp: `bool isBalanced(TreeNode* root) {
    
}`,
      java: `public boolean isBalanced(TreeNode root) {
    
}`
    },
    hints: ['A bottom-up approach is more optimal. Use a helper function that returns the height of a tree, or -1 if the tree is unbalanced.', 'For any node, its height is 1 + max(left_height, right_height). If the difference is > 1, return -1.'],
    companies: ['Amazon', 'Google', 'Meta'],
    acceptance: 50,
    isPremium: true,
    tier: 'premium',
    faangFrequency: 89,
    isFaang: true,
    topCompany: 'Amazon',
    order: 120
  }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/codearena').then(async () => {
  console.log('MongoDB Connected');
  let added = 0;
  for (const p of problems) {
    const existing = await Problem.findOne({ slug: p.slug });
    if (existing) {
      console.log(`Problem ${p.slug} already exists. Updating...`);
      await Problem.updateOne({ slug: p.slug }, p);
    } else {
      await Problem.create(p);
      console.log(`Added ${p.slug}`);
    }
    added++;
  }
  console.log(`Successfully injected ${added} Elite Archive problems.`);
  mongoose.disconnect();
}).catch(err => {
  console.error('DB Connection Error:', err);
  process.exit(1);
});
