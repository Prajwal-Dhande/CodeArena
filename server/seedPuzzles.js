const mongoose = require('mongoose');
const Puzzle = require('./src/models/Puzzle');

require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;

const puzzles = [

  // ═══════════════════════════════════════════════════════
  //  CATEGORY 1: CODE OUTPUT PREDICTION (8 puzzles)
  // ═══════════════════════════════════════════════════════

  {
    title: "Event Loop Ordering",
    category: "Code Output",
    difficulty: "Medium",
    xp: 25,
    question: "What will be the exact console output of this JavaScript code?",
    code: `console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');`,
    options: [
      { id: 'A', text: "A, B, C, D" },
      { id: 'B', text: "A, D, C, B" },
      { id: 'C', text: "A, D, B, C" },
      { id: 'D', text: "A, C, D, B" }
    ],
    correctId: 'B',
    explanation: "Synchronous code runs first (A, D). Then microtasks (Promises) execute before macrotasks (setTimeout). So C prints before B. Final order: A, D, C, B."
  },
  {
    title: "Closure Trap",
    category: "Code Output",
    difficulty: "Medium",
    xp: 25,
    question: "What will this code print to the console?",
    code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}`,
    options: [
      { id: 'A', text: "0, 1, 2" },
      { id: 'B', text: "3, 3, 3" },
      { id: 'C', text: "undefined, undefined, undefined" },
      { id: 'D', text: "0, 0, 0" }
    ],
    correctId: 'B',
    explanation: "'var' has function scope, not block scope. By the time setTimeout callbacks execute, the loop has finished and i = 3. All three callbacks reference the same 'i'. Use 'let' instead of 'var' to get 0, 1, 2."
  },
  {
    title: "typeof Madness",
    category: "Code Output",
    difficulty: "Easy",
    xp: 10,
    question: "What does typeof null return in JavaScript?",
    code: `console.log(typeof null);`,
    options: [
      { id: 'A', text: '"null"' },
      { id: 'B', text: '"undefined"' },
      { id: 'C', text: '"object"' },
      { id: 'D', text: '"boolean"' }
    ],
    correctId: 'C',
    explanation: "This is a famous JavaScript bug from the very first implementation. typeof null returns 'object' due to how values were stored internally (null's type tag was 0, same as objects). It was never fixed to maintain backward compatibility."
  },
  {
    title: "Array Destructuring",
    category: "Code Output",
    difficulty: "Easy",
    xp: 10,
    question: "What are the values of a and b after this code runs?",
    code: `let a = 5, b = 10;
[a, b] = [b, a];
console.log(a, b);`,
    options: [
      { id: 'A', text: "5, 10" },
      { id: 'B', text: "10, 5" },
      { id: 'C', text: "undefined, undefined" },
      { id: 'D', text: "Error: invalid assignment" }
    ],
    correctId: 'B',
    explanation: "Array destructuring allows elegant variable swapping without a temp variable. [a, b] = [b, a] creates a temporary array [10, 5] and destructures it back. This is a common JavaScript pattern."
  },
  {
    title: "Hoisting Puzzle",
    category: "Code Output",
    difficulty: "Medium",
    xp: 25,
    question: "What will this code output?",
    code: `console.log(x);
var x = 5;
console.log(x);`,
    options: [
      { id: 'A', text: "ReferenceError, then 5" },
      { id: 'B', text: "undefined, then 5" },
      { id: 'C', text: "5, then 5" },
      { id: 'D', text: "null, then 5" }
    ],
    correctId: 'B',
    explanation: "Variable declarations with 'var' are hoisted to the top of their scope, but assignments are NOT hoisted. So 'var x' is hoisted (x exists but is undefined), then x = 5 assigns the value. The first log sees undefined, the second sees 5."
  },
  {
    title: "Spread vs Reference",
    category: "Code Output",
    difficulty: "Hard",
    xp: 40,
    question: "What will console.log(arr1) print?",
    code: `const arr1 = [1, 2, [3, 4]];
const arr2 = [...arr1];
arr2[2].push(5);
console.log(arr1);`,
    options: [
      { id: 'A', text: "[1, 2, [3, 4]]" },
      { id: 'B', text: "[1, 2, [3, 4, 5]]" },
      { id: 'C', text: "[1, 2, [3, 4], 5]" },
      { id: 'D', text: "Error: cannot push to spread copy" }
    ],
    correctId: 'B',
    explanation: "Spread operator (...) creates a SHALLOW copy. Primitives (1, 2) are copied by value, but nested arrays/objects are copied by reference. arr2[2] and arr1[2] point to the SAME array [3, 4]. Pushing 5 to arr2[2] also mutates arr1[2]. Use structuredClone() for deep copies."
  },
  {
    title: "Async/Await Order",
    category: "Code Output",
    difficulty: "Hard",
    xp: 40,
    question: "What is the output of this async code?",
    code: `async function foo() {
  console.log(1);
  const x = await 2;
  console.log(x);
}
console.log(3);
foo();
console.log(4);`,
    options: [
      { id: 'A', text: "3, 1, 4, 2" },
      { id: 'B', text: "3, 1, 2, 4" },
      { id: 'C', text: "1, 2, 3, 4" },
      { id: 'D', text: "3, 4, 1, 2" }
    ],
    correctId: 'A',
    explanation: "3 prints first (sync). foo() is called — 1 prints (sync part before await). 'await' pauses foo and returns control to the caller. 4 prints (sync). Then the microtask from await resolves, and 2 prints. Order: 3, 1, 4, 2."
  },
  {
    title: "Tricky Equality",
    category: "Code Output",
    difficulty: "Medium",
    xp: 25,
    question: "What does the following expression evaluate to?",
    code: `console.log([] == ![]);
console.log([] === []);`,
    options: [
      { id: 'A', text: "true, true" },
      { id: 'B', text: "true, false" },
      { id: 'C', text: "false, false" },
      { id: 'D', text: "false, true" }
    ],
    correctId: 'B',
    explanation: "[] == ![] → ![] is false (truthy → false), then [] == false → both coerce to 0, so true. [] === [] → two different array objects in memory, strict equality checks reference, so false. This is why === is preferred over ==."
  },

  // ═══════════════════════════════════════════════════════
  //  CATEGORY 2: TIME & SPACE COMPLEXITY (6 puzzles)
  // ═══════════════════════════════════════════════════════

  {
    title: "Nested Loop Complexity",
    category: "Complexity Analysis",
    difficulty: "Easy",
    xp: 10,
    question: "What is the time complexity of this function?",
    code: `function func(n) {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      console.log(i + j);
    }
  }
}`,
    options: [
      { id: 'A', text: "O(n)" },
      { id: 'B', text: "O(n log n)" },
      { id: 'C', text: "O(n²)" },
      { id: 'D', text: "O(2ⁿ)" }
    ],
    correctId: 'C',
    explanation: "Two nested loops each running n times means the inner operation executes n × n = n² times. This is quadratic time complexity O(n²). Common in brute-force solutions."
  },
  {
    title: "Recursive Fibonacci",
    category: "Complexity Analysis",
    difficulty: "Medium",
    xp: 25,
    question: "What is the time complexity of naive recursive Fibonacci?",
    code: `function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}`,
    options: [
      { id: 'A', text: "O(n)" },
      { id: 'B', text: "O(n²)" },
      { id: 'C', text: "O(2ⁿ)" },
      { id: 'D', text: "O(n log n)" }
    ],
    correctId: 'C',
    explanation: "Each call branches into 2 recursive calls, creating a binary tree of calls. The tree has depth n, so total calls ≈ 2ⁿ. This is exponential O(2ⁿ). Use memoization or bottom-up DP to reduce to O(n)."
  },
  {
    title: "Binary Search Complexity",
    category: "Complexity Analysis",
    difficulty: "Easy",
    xp: 10,
    question: "What is the time complexity of binary search on a sorted array of n elements?",
    code: `function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
    options: [
      { id: 'A', text: "O(n)" },
      { id: 'B', text: "O(log n)" },
      { id: 'C', text: "O(n log n)" },
      { id: 'D', text: "O(1)" }
    ],
    correctId: 'B',
    explanation: "Binary search halves the search space each iteration. Starting with n elements: n → n/2 → n/4 → ... → 1. This takes log₂(n) steps. That's O(log n) — one of the most efficient search algorithms."
  },
  {
    title: "HashMap Worst Case",
    category: "Complexity Analysis",
    difficulty: "Medium",
    xp: 25,
    question: "What is the WORST-CASE time complexity of lookup in a hash map when all keys hash to the same bucket?",
    code: `const map = new Map();
// All keys collide to same bucket
for (let i = 0; i < n; i++) {
  map.set(hashCollision(i), i);
}
map.get(key); // Worst case?`,
    options: [
      { id: 'A', text: "O(1)" },
      { id: 'B', text: "O(log n)" },
      { id: 'C', text: "O(n)" },
      { id: 'D', text: "O(n²)" }
    ],
    correctId: 'C',
    explanation: "Hash maps have O(1) AVERAGE case. But when all keys collide into the same bucket, they form a linked list (or tree). Searching through that list is O(n) in the worst case. Good hash functions minimize this."
  },
  {
    title: "Merge Sort Space",
    category: "Complexity Analysis",
    difficulty: "Medium",
    xp: 25,
    question: "What is the SPACE complexity of Merge Sort?",
    code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}`,
    options: [
      { id: 'A', text: "O(1)" },
      { id: 'B', text: "O(log n)" },
      { id: 'C', text: "O(n)" },
      { id: 'D', text: "O(n log n)" }
    ],
    correctId: 'C',
    explanation: "Merge Sort needs O(n) extra space for the temporary arrays during merging. While there are log(n) recursion levels, the space from each level is reused, so total auxiliary space is O(n). This is the trade-off for guaranteed O(n log n) time."
  },
  {
    title: "Mystery Loop",
    category: "Complexity Analysis",
    difficulty: "Hard",
    xp: 40,
    question: "What is the time complexity of this function?",
    code: `function mystery(n) {
  let i = 1;
  while (i < n) {
    i = i * 2;
  }
}`,
    options: [
      { id: 'A', text: "O(n)" },
      { id: 'B', text: "O(n²)" },
      { id: 'C', text: "O(log n)" },
      { id: 'D', text: "O(√n)" }
    ],
    correctId: 'C',
    explanation: "i doubles each iteration: 1, 2, 4, 8, 16, ... until i ≥ n. After k steps, i = 2^k. We stop when 2^k ≥ n, so k = log₂(n). The loop runs O(log n) times. This is the same principle behind binary search."
  },

  // ═══════════════════════════════════════════════════════
  //  CATEGORY 3: BUG HUNT (6 puzzles)
  // ═══════════════════════════════════════════════════════

  {
    title: "Off-By-One Error",
    category: "Bug Hunt",
    difficulty: "Easy",
    xp: 15,
    question: "This function should reverse a string, but it has a bug. What's wrong?",
    code: `function reverse(str) {
  let result = '';
  for (let i = str.length; i >= 0; i--) {
    result += str[i];
  }
  return result;
}
// reverse("hello") returns "undefinedolleh"`,
    options: [
      { id: 'A', text: "Loop should start at str.length - 1" },
      { id: 'B', text: "Should use str.charAt(i)" },
      { id: 'C', text: "Loop should go i > 0" },
      { id: 'D', text: "result should be an array" }
    ],
    correctId: 'A',
    explanation: "String indices go from 0 to length-1. Starting at str.length accesses an index that doesn't exist (undefined). Starting at str.length - 1 fixes it. This is the classic off-by-one error — one of the most common bugs in programming."
  },
  {
    title: "Infinite Loop Trap",
    category: "Bug Hunt",
    difficulty: "Medium",
    xp: 25,
    question: "This binary search has a subtle bug that causes an infinite loop in some cases. Which line is the issue?",
    code: `function search(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {            // Line 1
    let mid = (low + high) / 2;    // Line 2
    if (arr[mid] === target)        // Line 3
      return mid;
    else if (arr[mid] < target)
      low = mid;                   // Line 4
    else high = mid - 1;
  }
  return -1;
}`,
    options: [
      { id: 'A', text: "Line 1: should be low < high" },
      { id: 'B', text: "Line 2: mid should use Math.floor()" },
      { id: 'C', text: "Line 3: should use strict equality" },
      { id: 'D', text: "Line 4: low should be mid + 1" }
    ],
    correctId: 'D',
    explanation: "When low = mid (e.g., low=3, high=4, mid=3), setting low = mid doesn't advance the search — creating an infinite loop. The fix is low = mid + 1 to always make progress. Note: Line 2 also has a bug (should use Math.floor), but Line 4 causes the infinite loop."
  },
  {
    title: "React State Bug",
    category: "Bug Hunt",
    difficulty: "Medium",
    xp: 25,
    question: "This React counter increments by 1 when clicked, but calling increment() 3 times in a row only adds 1. Why?",
    code: `function Counter() {
  const [count, setCount] = useState(0);
  
  const incrementThrice = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  };
  // count goes from 0 to 1, not 3
}`,
    options: [
      { id: 'A', text: "useState only allows one update per render" },
      { id: 'B', text: "count is stale — should use setCount(prev => prev + 1)" },
      { id: 'C', text: "setCount is asynchronous and needs await" },
      { id: 'D', text: "Need to use useReducer instead" }
    ],
    correctId: 'B',
    explanation: "React batches state updates. All 3 calls use the same stale 'count' value (0), so all three compute 0+1=1. Using the functional form setCount(prev => prev + 1) ensures each call uses the latest value: 0→1→2→3."
  },
  {
    title: "Sorting Surprise",
    category: "Bug Hunt",
    difficulty: "Easy",
    xp: 15,
    question: "Why does [10, 9, 8, 1, 2, 3].sort() not produce [1, 2, 3, 8, 9, 10]?",
    code: `const arr = [10, 9, 8, 1, 2, 3];
console.log(arr.sort());
// Output: [1, 10, 2, 3, 8, 9]`,
    options: [
      { id: 'A', text: "sort() converts elements to strings and sorts lexicographically" },
      { id: 'B', text: "sort() only works on arrays with <= 5 elements" },
      { id: 'C', text: "sort() sorts in descending order by default" },
      { id: 'D', text: "sort() is not stable in JavaScript" }
    ],
    correctId: 'A',
    explanation: "JavaScript's default sort() converts elements to strings and sorts lexicographically (dictionary order). '10' comes before '2' because '1' < '2'. Fix: arr.sort((a, b) => a - b) for numeric sorting."
  },
  {
    title: "Memory Leak Detector",
    category: "Bug Hunt",
    difficulty: "Hard",
    xp: 40,
    question: "This React component has a memory leak. What's the fix?",
    code: `useEffect(() => {
  const interval = setInterval(() => {
    setData(fetchLatest());
  }, 1000);
  // Component may unmount while interval runs
}, []);`,
    options: [
      { id: 'A', text: "Use setTimeout instead of setInterval" },
      { id: 'B', text: "Return a cleanup function: return () => clearInterval(interval)" },
      { id: 'C', text: "Add data to the dependency array" },
      { id: 'D', text: "Wrap setInterval in a try-catch" }
    ],
    correctId: 'B',
    explanation: "When a component unmounts, intervals keep running and try to update state on an unmounted component. useEffect's cleanup function runs on unmount. Returning () => clearInterval(interval) stops the interval when the component unmounts, preventing the memory leak."
  },
  {
    title: "Python Mutable Default",
    category: "Bug Hunt",
    difficulty: "Hard",
    xp: 40,
    question: "This Python function has a notorious bug. What happens when called twice with no arguments?",
    code: `def add_item(item, items=[]):
    items.append(item)
    return items

print(add_item('a'))  # ['a']
print(add_item('b'))  # What prints?`,
    options: [
      { id: 'A', text: "['b']" },
      { id: 'B', text: "['a', 'b']" },
      { id: 'C', text: "Error: list index out of range" },
      { id: 'D', text: "['b', 'a']" }
    ],
    correctId: 'B',
    explanation: "In Python, default mutable arguments (like lists) are created ONCE when the function is defined, not on each call. Both calls share the same list object. The fix: use items=None and set items = [] inside the function body."
  },

  // ═══════════════════════════════════════════════════════
  //  CATEGORY 4: DATA STRUCTURE DRY-RUN (6 puzzles)
  // ═══════════════════════════════════════════════════════

  {
    title: "Stack Sequence",
    category: "Data Structure",
    difficulty: "Easy",
    xp: 15,
    question: "After these operations, what is on top of the stack?",
    code: `stack = []
stack.push(1)   // [1]
stack.push(2)   // [1, 2]
stack.push(3)   // [1, 2, 3]
stack.pop()     // removes 3
stack.push(4)   // [1, 2, 4]
stack.pop()     // removes 4
// What is stack.peek()?`,
    options: [
      { id: 'A', text: "1" },
      { id: 'B', text: "2" },
      { id: 'C', text: "3" },
      { id: 'D', text: "4" }
    ],
    correctId: 'B',
    explanation: "Stack is LIFO (Last In, First Out). After push(1,2,3): [1,2,3]. Pop removes 3: [1,2]. Push 4: [1,2,4]. Pop removes 4: [1,2]. Top of stack = 2."
  },
  {
    title: "Queue Operations",
    category: "Data Structure",
    difficulty: "Easy",
    xp: 15,
    question: "After these operations on a queue, what element is at the front?",
    code: `queue = []
queue.enqueue(10)  // [10]
queue.enqueue(20)  // [10, 20]
queue.enqueue(30)  // [10, 20, 30]
queue.dequeue()    // removes 10
queue.enqueue(40)  // [20, 30, 40]
queue.dequeue()    // removes 20
// What is queue.front()?`,
    options: [
      { id: 'A', text: "10" },
      { id: 'B', text: "20" },
      { id: 'C', text: "30" },
      { id: 'D', text: "40" }
    ],
    correctId: 'C',
    explanation: "Queue is FIFO (First In, First Out). Enqueue adds to back, dequeue removes from front. After all operations: [30, 40]. Front = 30."
  },
  {
    title: "BST Insert Order",
    category: "Data Structure",
    difficulty: "Medium",
    xp: 25,
    question: "You insert [5, 3, 7, 1, 4] into an empty BST. What is the in-order traversal?",
    code: `// BST insertion: left < root < right
//        5
//       / \\
//      3   7
//     / \\
//    1   4
// In-order traversal = ?`,
    options: [
      { id: 'A', text: "5, 3, 7, 1, 4" },
      { id: 'B', text: "1, 3, 4, 5, 7" },
      { id: 'C', text: "1, 4, 3, 7, 5" },
      { id: 'D', text: "5, 3, 1, 4, 7" }
    ],
    correctId: 'B',
    explanation: "In-order traversal visits: Left → Root → Right. This always produces elements in sorted (ascending) order for a BST. That's actually the key property of BSTs: in-order traversal = sorted array."
  },
  {
    title: "Min-Heap Extract",
    category: "Data Structure",
    difficulty: "Hard",
    xp: 40,
    question: "A min-heap contains [1, 3, 2, 7, 6, 4, 5]. After extracting the minimum element twice, what is the new root?",
    code: `// Min-Heap: parent <= children
// Initial:        1
//               /   \\
//              3     2
//             / \\   / \\
//            7   6 4   5
// Extract min (1), then extract min again (2)
// New root = ?`,
    options: [
      { id: 'A', text: "3" },
      { id: 'B', text: "4" },
      { id: 'C', text: "5" },
      { id: 'D', text: "2" }
    ],
    correctId: 'A',
    explanation: "Extract min removes root (1), replaces with last element, then heapifies down → new root is 2. Extract again removes 2, heapifies → new root is 3. In a min-heap, extracting k times gives you the k-th smallest element."
  },
  {
    title: "Linked List Reversal",
    category: "Data Structure",
    difficulty: "Medium",
    xp: 25,
    question: "After reversing this singly linked list, what is the new head?",
    code: `// Original: 1 -> 2 -> 3 -> 4 -> 5 -> null
// After reversal: ? -> ? -> ? -> ? -> ? -> null

function reverse(head) {
  let prev = null, curr = head;
  while (curr) {
    let next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev; // new head
}`,
    options: [
      { id: 'A', text: "1" },
      { id: 'B', text: "3" },
      { id: 'C', text: "5" },
      { id: 'D', text: "null" }
    ],
    correctId: 'C',
    explanation: "The iterative reversal algorithm uses 3 pointers: prev, curr, next. It reverses each link one by one. The last node (5) becomes the new head. Result: 5 -> 4 -> 3 -> 2 -> 1 -> null. prev ends up pointing to 5."
  },
  {
    title: "Graph BFS Level Order",
    category: "Data Structure",
    difficulty: "Hard",
    xp: 40,
    question: "Given this undirected graph, what is the BFS traversal starting from node A?",
    code: `// Graph adjacency list:
// A -> [B, C]
// B -> [A, D, E]
// C -> [A, F]
// D -> [B]
// E -> [B, F]
// F -> [C, E]
// BFS from A = ?`,
    options: [
      { id: 'A', text: "A, B, C, D, E, F" },
      { id: 'B', text: "A, C, B, F, D, E" },
      { id: 'C', text: "A, B, D, E, C, F" },
      { id: 'D', text: "A, D, E, F, B, C" }
    ],
    correctId: 'A',
    explanation: "BFS uses a queue and visits level by level. Level 0: A. Level 1: B, C (A's neighbors). Level 2: D, E (B's unvisited neighbors), F (C's unvisited neighbor). Result: A, B, C, D, E, F."
  },

  // ═══════════════════════════════════════════════════════
  //  CATEGORY 5: ALGORITHM IDENTIFICATION (6 puzzles)
  // ═══════════════════════════════════════════════════════

  {
    title: "Shortest Path Choice",
    category: "Algorithm ID",
    difficulty: "Medium",
    xp: 25,
    question: "You need to find the shortest path in a weighted graph with no negative edges. Which algorithm is the best choice?",
    code: `// Graph with positive edge weights
// Find shortest path from source to all nodes
// Which algorithm?`,
    options: [
      { id: 'A', text: "DFS (Depth-First Search)" },
      { id: 'B', text: "Bellman-Ford" },
      { id: 'C', text: "Dijkstra's Algorithm" },
      { id: 'D', text: "Floyd-Warshall" }
    ],
    correctId: 'C',
    explanation: "Dijkstra's is optimal for single-source shortest path with non-negative weights: O(V + E log V) with a min-heap. Bellman-Ford handles negative edges but is slower O(VE). Floyd-Warshall finds ALL-pairs shortest paths. DFS doesn't find shortest paths in weighted graphs."
  },
  {
    title: "Greedy vs DP",
    category: "Algorithm ID",
    difficulty: "Hard",
    xp: 40,
    question: "Which of these problems CANNOT be solved correctly using a greedy approach and requires Dynamic Programming?",
    options: [
      { id: 'A', text: "Activity Selection (maximize non-overlapping activities)" },
      { id: 'B', text: "0/1 Knapsack (maximize value with weight limit)" },
      { id: 'C', text: "Huffman Encoding (optimal prefix codes)" },
      { id: 'D', text: "Coin Change with denominations [1, 5, 10, 25]" }
    ],
    correctId: 'B',
    explanation: "0/1 Knapsack requires DP because you can't take fractions of items — greedy fails. Activity Selection and Huffman are classic greedy successes. Coin Change with standard denominations works with greedy, but with arbitrary denominations it needs DP."
  },
  {
    title: "Stable Sort Needed",
    category: "Algorithm ID",
    difficulty: "Medium",
    xp: 25,
    question: "You need a sorting algorithm that is stable, works in O(n log n) worst case, but you can afford O(n) extra space. Which algorithm fits?",
    options: [
      { id: 'A', text: "Quick Sort" },
      { id: 'B', text: "Heap Sort" },
      { id: 'C', text: "Merge Sort" },
      { id: 'D', text: "Selection Sort" }
    ],
    correctId: 'C',
    explanation: "Merge Sort is stable (preserves relative order of equal elements), guaranteed O(n log n), but uses O(n) space. Quick Sort is unstable with O(n²) worst case. Heap Sort is O(n log n) but unstable. Selection Sort is O(n²)."
  },
  {
    title: "Cycle Detection Method",
    category: "Algorithm ID",
    difficulty: "Medium",
    xp: 25,
    question: "To detect a cycle in a linked list using O(1) space, which technique should you use?",
    code: `// Linked List: 1 -> 2 -> 3 -> 4 -> 2 (cycle!)
// Detect cycle in O(1) extra space`,
    options: [
      { id: 'A', text: "HashSet to store visited nodes" },
      { id: 'B', text: "Floyd's Tortoise and Hare (slow/fast pointers)" },
      { id: 'C', text: "Reverse the linked list" },
      { id: 'D', text: "Use recursion with a counter" }
    ],
    correctId: 'B',
    explanation: "Floyd's algorithm uses two pointers: slow (1 step) and fast (2 steps). If there's a cycle, they'll meet. O(n) time, O(1) space. A HashSet works but uses O(n) space. This is one of the most elegant algorithms in CS."
  },
  {
    title: "String Matching",
    category: "Algorithm ID",
    difficulty: "Hard",
    xp: 40,
    question: "You need to search for a pattern of length M in a text of length N efficiently. Which algorithm achieves O(N + M) average time?",
    options: [
      { id: 'A', text: "Brute Force (Naive)" },
      { id: 'B', text: "KMP (Knuth-Morris-Pratt)" },
      { id: 'C', text: "Bubble Sort then Binary Search" },
      { id: 'D', text: "Depth-First Search" }
    ],
    correctId: 'B',
    explanation: "KMP preprocesses the pattern to build a failure function in O(M), then searches in O(N). Total: O(N + M). Naive approach is O(N × M) worst case. KMP avoids re-comparing characters by using information from previous partial matches."
  },
  {
    title: "Topological Sort Use Case",
    category: "Algorithm ID",
    difficulty: "Medium",
    xp: 25,
    question: "Which real-world problem is best solved using Topological Sorting?",
    options: [
      { id: 'A', text: "Finding shortest path in a weighted graph" },
      { id: 'B', text: "Scheduling tasks with dependencies (build order)" },
      { id: 'C', text: "Finding the median of a data stream" },
      { id: 'D', text: "Balancing a binary search tree" }
    ],
    correctId: 'B',
    explanation: "Topological Sort orders vertices in a DAG (Directed Acyclic Graph) such that for every edge u→v, u comes before v. Perfect for: build systems (Makefile), course prerequisites, package dependencies (npm install), task scheduling."
  },

  // ═══════════════════════════════════════════════════════
  //  CATEGORY 6: LOGIC & MATH PUZZLES (5 puzzles)
  // ═══════════════════════════════════════════════════════

  {
    title: "The 100 Prisoners",
    category: "Logic Puzzle",
    difficulty: "Hard",
    xp: 50,
    question: "100 prisoners each must find their number in 100 boxes (each may open 50). Using the cycle-following strategy, approximately what is their collective survival probability?",
    code: `// Random chance: (1/2)^100 ≈ 0%
// Cycle strategy: probability = ?
// Key insight: they fail only if
// a permutation cycle > 50 exists`,
    options: [
      { id: 'A', text: "~1%" },
      { id: 'B', text: "~31%" },
      { id: 'C', text: "~50%" },
      { id: 'D', text: "~99%" }
    ],
    correctId: 'B',
    explanation: "The cycle-following strategy: each prisoner starts at the box with their number, then follows the chain. They fail only if a cycle longer than 50 exists. P(no cycle > 50) ≈ 1 - ln(2) ≈ 31.18%. A stunning result from probability theory!"
  },
  {
    title: "The Poisoned Wine",
    category: "Logic Puzzle",
    difficulty: "Hard",
    xp: 50,
    question: "You have 1000 bottles, exactly 1 is poisoned. Poison kills in exactly 24 hours. With only 24 hours to test, what is the MINIMUM number of test subjects needed?",
    code: `// Hint: Think in binary.
// Each tester = 1 bit of information
// 2^n >= 1000
// n = ?`,
    options: [
      { id: 'A', text: "10" },
      { id: 'B', text: "100" },
      { id: 'C', text: "500" },
      { id: 'D', text: "999" }
    ],
    correctId: 'A',
    explanation: "Each tester either dies (1) or survives (0) — that's 1 bit. With 10 testers, you get 2^10 = 1024 possible outcomes, enough to identify which of 1000 bottles is poisoned. Assign each bottle a 10-bit binary number and have each tester drink from bottles where their bit is 1."
  },
  {
    title: "Bridge Crossing",
    category: "Logic Puzzle",
    difficulty: "Medium",
    xp: 30,
    question: "4 people cross a bridge at night with 1 flashlight. Speeds: 1min, 2min, 5min, 10min. Max 2 cross at once (at slower speed), flashlight must return. Minimum total crossing time?",
    code: `// Strategy matters!
// Obvious: fastest always escorts = 19 min
// Optimal: pair the two slowest together
// 1+2 cross (2), 1 returns (1)
// 5+10 cross (10), 2 returns (2)
// 1+2 cross (2) = ???`,
    options: [
      { id: 'A', text: "19 minutes" },
      { id: 'B', text: "17 minutes" },
      { id: 'C', text: "21 minutes" },
      { id: 'D', text: "15 minutes" }
    ],
    correctId: 'B',
    explanation: "The trick: pair the two SLOWEST together. Step 1: 1+2 cross (2min). Step 2: 1 returns (1min). Step 3: 5+10 cross (10min). Step 4: 2 returns (2min). Step 5: 1+2 cross (2min). Total = 2+1+10+2+2 = 17 min."
  },
  {
    title: "Monty Hall Problem",
    category: "Logic Puzzle",
    difficulty: "Medium",
    xp: 30,
    question: "You pick Door 1. The host (who knows what's behind the doors) opens Door 3, revealing a goat. Should you switch to Door 2?",
    code: `// 3 doors: 1 car, 2 goats
// You pick Door 1
// Host reveals a goat behind Door 3
// Switch to Door 2?
// P(win if switch) = ?`,
    options: [
      { id: 'A', text: "No — switching makes no difference (50/50)" },
      { id: 'B', text: "Doesn't matter — it's always 1/3" },
      { id: 'C', text: "Yes — switching gives 2/3 chance of winning" },
      { id: 'D', text: "Yes — switching gives 3/4 chance of winning" }
    ],
    correctId: 'C',
    explanation: "Initially you have 1/3 chance. The other two doors combined have 2/3. When the host reveals a goat, that 2/3 probability concentrates on the remaining door. Switching wins 2/3 of the time. This is perhaps the most counterintuitive result in probability."
  },
  {
    title: "Egg Drop Problem",
    category: "Logic Puzzle",
    difficulty: "Hard",
    xp: 50,
    question: "You have 2 identical eggs and a 100-story building. You need to find the highest safe floor. What is the MINIMUM number of drops needed in the worst case?",
    code: `// With 1 egg: must go floor by floor = 100
// With 2 eggs: use first egg to narrow range
// Optimal strategy uses decreasing intervals
// x + (x-1) + (x-2) + ... + 1 >= 100
// x(x+1)/2 >= 100`,
    options: [
      { id: 'A', text: "10" },
      { id: 'B', text: "14" },
      { id: 'C', text: "50" },
      { id: 'D', text: "7" }
    ],
    correctId: 'B',
    explanation: "Drop from floor x, then x+(x-1), then x+(x-1)+(x-2), etc. If first egg breaks, go floor-by-floor with the second. To cover 100 floors: x(x+1)/2 ≥ 100 → x = 14. Drop from floors 14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99, 100. Worst case = 14 drops."
  },

  // ═══════════════════════════════════════════════════════
  //  CATEGORY 7: PATTERN RECOGNITION (5 puzzles)
  // ═══════════════════════════════════════════════════════

  {
    title: "Mystery Sequence",
    category: "Pattern Recognition",
    difficulty: "Easy",
    xp: 10,
    question: "What comes next in this sequence? 1, 1, 2, 3, 5, 8, 13, ?",
    code: `// Look at the pattern:
// 1, 1, 2, 3, 5, 8, 13, ?
// Each number = sum of previous two`,
    options: [
      { id: 'A', text: "15" },
      { id: 'B', text: "18" },
      { id: 'C', text: "21" },
      { id: 'D', text: "20" }
    ],
    correctId: 'C',
    explanation: "This is the Fibonacci sequence. Each number = sum of the two before it. 8 + 13 = 21. Fibonacci appears everywhere: nature (sunflower spirals), art (golden ratio), and algorithms (dynamic programming)."
  },
  {
    title: "Powers of Two Pattern",
    category: "Pattern Recognition",
    difficulty: "Easy",
    xp: 10,
    question: "What is the value of 2^10?",
    code: `// 2^1 = 2
// 2^2 = 4
// 2^3 = 8
// ...
// 2^10 = ?
// (Every programmer should know this!)`,
    options: [
      { id: 'A', text: "512" },
      { id: 'B', text: "1000" },
      { id: 'C', text: "1024" },
      { id: 'D', text: "2048" }
    ],
    correctId: 'C',
    explanation: "2^10 = 1024. This is fundamental in CS because computers use binary. 1 KB = 1024 bytes. Knowing powers of 2 (2, 4, 8, 16, 32, 64, 128, 256, 512, 1024) is essential for every programmer."
  },
  {
    title: "Recursion Trace",
    category: "Pattern Recognition",
    difficulty: "Medium",
    xp: 25,
    question: "How many times does this recursive function call itself for n = 5?",
    code: `function mystery(n) {
  if (n <= 0) return 0;
  return mystery(n - 1) + mystery(n - 1);
}
// mystery(5) makes how many total calls?`,
    options: [
      { id: 'A', text: "10" },
      { id: 'B', text: "31" },
      { id: 'C', text: "32" },
      { id: 'D', text: "63" }
    ],
    correctId: 'D',
    explanation: "Each call makes 2 recursive calls, forming a binary tree. Total nodes in a binary tree of depth 5 = 2^6 - 1 = 63 (excluding the root call) or 2^(n+1) - 1 = 63 total calls. This is why naive recursion without memoization is so expensive."
  },
  {
    title: "Bit Pattern",
    category: "Pattern Recognition",
    difficulty: "Medium",
    xp: 25,
    question: "How many 1-bits are in the binary representation of the number 255?",
    code: `// 255 in binary = ?
// Count the number of 1s
// Hint: 255 = 2^8 - 1`,
    options: [
      { id: 'A', text: "6" },
      { id: 'B', text: "7" },
      { id: 'C', text: "8" },
      { id: 'D', text: "9" }
    ],
    correctId: 'C',
    explanation: "255 = 2^8 - 1 = 11111111 in binary (eight 1s). Any number of the form 2^n - 1 has all n bits set to 1. This pattern is used in bitmasks, IP addresses (255.255.255.0), and color values (0xFF)."
  },
  {
    title: "XOR Trick",
    category: "Pattern Recognition",
    difficulty: "Medium",
    xp: 25,
    question: "In an array where every element appears twice except one, which approach finds the unique element in O(n) time and O(1) space?",
    code: `// arr = [4, 1, 2, 1, 2]
// Unique element = 4
// How to find it without extra space?`,
    options: [
      { id: 'A', text: "Sort the array and check adjacent pairs" },
      { id: 'B', text: "Use a HashMap to count occurrences" },
      { id: 'C', text: "XOR all elements together" },
      { id: 'D', text: "Use two nested loops to compare all pairs" }
    ],
    correctId: 'C',
    explanation: "XOR has magic properties: x ^ x = 0 and x ^ 0 = x. XORing all elements: 4^1^2^1^2 = 4^(1^1)^(2^2) = 4^0^0 = 4. Pairs cancel out, leaving the unique element. O(n) time, O(1) space. A classic bit manipulation trick."
  }
];

console.log(`\n🧩 CodeArena Puzzle Seeder`);
console.log(`═══════════════════════════════════════`);
console.log(`Total puzzles to seed: ${puzzles.length}`);
console.log(`Categories: ${[...new Set(puzzles.map(p => p.category))].join(', ')}`);
console.log(`Difficulty spread: Easy(${puzzles.filter(p=>p.difficulty==='Easy').length}) Medium(${puzzles.filter(p=>p.difficulty==='Medium').length}) Hard(${puzzles.filter(p=>p.difficulty==='Hard').length})`);
console.log(`═══════════════════════════════════════\n`);

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");
    
    await Puzzle.deleteMany();
    console.log("🗑️  Cleared old puzzles");
    
    const inserted = await Puzzle.insertMany(puzzles);
    console.log(`\n🎯 Successfully seeded ${inserted.length} puzzles with explanations!\n`);
    
    const categories = {};
    inserted.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });
    console.log("📊 Breakdown by category:");
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} puzzles`);
    });
    
    console.log("\n✅ Done! All puzzles now have explanations. 🚀\n");
    process.exit();
  })
  .catch(err => {
    console.log("❌ DB Connection Error:", err.message);
    process.exit(1);
  });