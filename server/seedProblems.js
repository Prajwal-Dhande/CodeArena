const mongoose = require('mongoose');
const Problem = require('./src/models/Problem'); 
require('dotenv').config();

const BATCH_10_PROBLEMS = [
  // --- EASY ---
  {
    title: "Roman to Integer",
    slug: "roman-to-integer",
    difficulty: "Easy",
    category: "Math",
    description: "Roman numerals are represented by seven different symbols: `I`, `V`, `X`, `L`, `C`, `D` and `M`.\n\nFor example, `2` is written as `II` in Roman numeral, just two ones added together. `12` is written as `XII`, which is simply `X + II`. The number `27` is written as `XXVII`, which is `XX + V + II`.\n\nRoman numerals are usually written largest to smallest from left to right. However, the numeral for four is not `IIII`. Instead, the number four is written as `IV`. Because the one is before the five we subtract it making four. The same principle applies to the number nine, which is written as `IX`.\n\nGiven a roman numeral, convert it to an integer.",
    examples: [
      { 
        input: 's = "III"', 
        output: "3", 
        explain: "3 is represented as 3 ones." 
      },
      { 
        input: 's = "LVIII"', 
        output: "58", 
        explain: "L = 50, V= 5, III = 3." 
      },
      { 
        input: 's = "MCMXCIV"', 
        output: "1994", 
        explain: "M = 1000, CM = 900, XC = 90 and IV = 4." 
      }
    ],
    constraints: [
      "1 <= s.length <= 15",
      "s contains only the characters ('I', 'V', 'X', 'L', 'C', 'D', 'M').",
      "It is guaranteed that s is a valid roman numeral in the range [1, 3999]."
    ],
    acceptance: 60.1,
    companies: ["Amazon", "Apple", "Google"]
  },
  {
    title: "Plus One",
    slug: "plus-one",
    difficulty: "Easy",
    category: "Math",
    description: "You are given a **large integer** represented as an integer array `digits`, where each `digits[i]` is the `ith` digit of the integer. The digits are ordered from most significant to least significant in left-to-right order. The large integer does not contain any leading `0`'s.\n\nIncrement the large integer by one and return the resulting array of digits.",
    examples: [
      { 
        input: "digits = [1,2,3]", 
        output: "[1,2,4]", 
        explain: "The array represents the integer 123. Incrementing by one gives 123 + 1 = 124. Thus, the result should be [1,2,4]." 
      },
      { 
        input: "digits = [9]", 
        output: "[1,0]", 
        explain: "The array represents the integer 9. Incrementing by one gives 9 + 1 = 10. Thus, the result should be [1,0]." 
      }
    ],
    constraints: [
      "1 <= digits.length <= 100",
      "0 <= digits[i] <= 9",
      "digits does not contain any leading 0's."
    ],
    acceptance: 44.8,
    companies: ["Google", "Microsoft"]
  },
  {
    title: "Happy Number",
    slug: "happy-number",
    difficulty: "Easy",
    category: "Math",
    description: "Write an algorithm to determine if a number `n` is happy.\n\nA **happy number** is a number defined by the following process:\n- Starting with any positive integer, replace the number by the sum of the squares of its digits.\n- Repeat the process until the number equals 1 (where it will stay), or it **loops endlessly in a cycle** which does not include 1.\n- Those numbers for which this process ends in 1 are happy.\n\nReturn `true` if `n` is a happy number, and `false` if not.",
    examples: [
      { 
        input: "n = 19", 
        output: "true", 
        explain: "1^2 + 9^2 = 82\n8^2 + 2^2 = 68\n6^2 + 8^2 = 100\n1^2 + 0^2 + 0^2 = 1" 
      },
      { 
        input: "n = 2", 
        output: "false", 
        explain: "The sequence will eventually get stuck in a cycle (4 -> 16 -> 37 -> 58 -> 89 -> 145 -> 42 -> 20 -> 4)." 
      }
    ],
    constraints: [
      "1 <= n <= 2^31 - 1"
    ],
    acceptance: 55.6,
    companies: ["Amazon", "Google", "Twitter"]
  },

  // --- MEDIUM ---
  {
    title: "Pow(x, n)",
    slug: "powx-n",
    difficulty: "Medium",
    category: "Math",
    description: "Implement `pow(x, n)`, which calculates `x` raised to the power `n` (i.e., `x^n`).",
    examples: [
      { 
        input: "x = 2.00000, n = 10", 
        output: "1024.00000", 
        explain: "2 to the power of 10 is 1024." 
      },
      { 
        input: "x = 2.00000, n = -2", 
        output: "0.25000", 
        explain: "2 to the power of -2 is 1/(2^2) = 1/4 = 0.25." 
      }
    ],
    constraints: [
      "-100.0 < x < 100.0",
      "-2^31 <= n <= 2^31 - 1",
      "n is an integer.",
      "Either x is not zero or n > 0.",
      "-10^4 <= x^n <= 10^4"
    ],
    acceptance: 34.2,
    companies: ["LinkedIn", "Google", "Facebook"]
  },
  {
    title: "Jump Game II",
    slug: "jump-game-ii",
    difficulty: "Medium",
    category: "Greedy",
    description: "You are given a **0-indexed** array of integers `nums` of length `n`. You are initially positioned at `nums[0]`.\n\nEach element `nums[i]` represents the maximum length of a forward jump from index `i`. In other words, if you are at `nums[i]`, you can jump to any `nums[i + j]` where:\n- `0 <= j <= nums[i]` and\n- `i + j < n`\n\nReturn the minimum number of jumps to reach `nums[n - 1]`. The test cases are generated such that you can reach `nums[n - 1]`.",
    examples: [
      { 
        input: "nums = [2,3,1,1,4]", 
        output: "2", 
        explain: "The minimum number of jumps to reach the last index is 2. Jump 1 step from index 0 to 1, then 3 steps to the last index." 
      }
    ],
    constraints: [
      "1 <= nums.length <= 10^4",
      "0 <= nums[i] <= 1000",
      "It's guaranteed that you can reach nums[n - 1]."
    ],
    acceptance: 40.1,
    companies: ["Amazon", "Apple", "Microsoft"]
  },
  {
    title: "Partition Labels",
    slug: "partition-labels",
    difficulty: "Medium",
    category: "Greedy",
    description: "You are given a string `s`. We want to partition the string into as many parts as possible so that each letter appears in at most one part.\n\nNote that the partition is done so that after concatenating all the parts in order, the resultant string should be `s`.\n\nReturn a list of integers representing the size of these parts.",
    examples: [
      { 
        input: 's = "ababcbacadefegdehijhklij"', 
        output: "[9,7,8]", 
        explain: "The partition is 'ababcbaca', 'defegde', 'hijhklij'.\nThis is a partition so that each letter appears in at most one part.\nA partition like 'ababcbacadefegde', 'hijhklij' is incorrect, because it splits s into less parts." 
      }
    ],
    constraints: [
      "1 <= s.length <= 500",
      "s consists of lowercase English letters."
    ],
    acceptance: 79.8,
    companies: ["Amazon", "Meta"]
  },
  {
    title: "Sort Colors",
    slug: "sort-colors",
    difficulty: "Medium",
    category: "Arrays",
    description: "Given an array `nums` with `n` objects colored red, white, or blue, sort them **in-place** so that objects of the same color are adjacent, with the colors in the order red, white, and blue.\n\nWe will use the integers `0`, `1`, and `2` to represent the color red, white, and blue, respectively.\n\nYou must solve this problem without using the library's sort function.",
    examples: [
      { 
        input: "nums = [2,0,2,1,1,0]", 
        output: "[0,0,1,1,2,2]", 
        explain: "We group all 0s, then 1s, then 2s together in place." 
      },
      { 
        input: "nums = [2,0,1]", 
        output: "[0,1,2]", 
        explain: "Sorted in ascending order." 
      }
    ],
    constraints: [
      "n == nums.length",
      "1 <= n <= 300",
      "nums[i] is either 0, 1, or 2."
    ],
    acceptance: 60.1,
    companies: ["Microsoft", "Amazon", "Apple"]
  },
  {
    title: "Kth Largest Element in an Array",
    slug: "kth-largest-element-in-an-array",
    difficulty: "Medium",
    category: "Heaps",
    description: "Given an integer array `nums` and an integer `k`, return the `kth` largest element in the array.\n\nNote that it is the `kth` largest element in the sorted order, not the `kth` distinct element.\n\nCan you solve it without sorting?",
    examples: [
      { 
        input: "nums = [3,2,1,5,6,4], k = 2", 
        output: "5", 
        explain: "The sorted array is [1,2,3,4,5,6]. The 2nd largest element is 5." 
      },
      { 
        input: "nums = [3,2,3,1,2,4,5,5,6], k = 4", 
        output: "4", 
        explain: "The sorted array is [1,2,2,3,3,4,5,5,6]. The 4th largest element is 4." 
      }
    ],
    constraints: [
      "1 <= k <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4"
    ],
    acceptance: 66.8,
    companies: ["Amazon", "Meta", "Google"]
  },

  // --- HARD ---
  {
    title: "N-Queens II",
    slug: "n-queens-ii",
    difficulty: "Hard",
    category: "Backtracking",
    description: "The n-queens puzzle is the problem of placing `n` queens on an `n x n` chessboard such that no two queens attack each other.\n\nGiven an integer `n`, return the **number** of distinct solutions to the n-queens puzzle.",
    examples: [
      { 
        input: "n = 4", 
        output: "2", 
        explain: "There are two distinct solutions to the 4-queens puzzle. We just return the count '2' instead of the board layouts." 
      },
      { 
        input: "n = 1", 
        output: "1", 
        explain: "Only one valid placement exists for a 1x1 board." 
      }
    ],
    constraints: [
      "1 <= n <= 9"
    ],
    acceptance: 73.1,
    companies: ["Microsoft", "Zillow"]
  },
  {
    title: "Basic Calculator",
    slug: "basic-calculator",
    difficulty: "Hard",
    category: "Stack",
    description: "Given a string `s` representing a valid expression, implement a basic calculator to evaluate it, and return the result of the evaluation.\n\n**Note:** You are **not** allowed to use any built-in function which evaluates strings as mathematical expressions, such as `eval()`.",
    examples: [
      { 
        input: 's = "1 + 1"', 
        output: "2", 
        explain: "1 + 1 evaluates to 2." 
      },
      { 
        input: 's = " 2-1 + 2 "', 
        output: "3", 
        explain: "2 - 1 + 2 evaluates to 3." 
      },
      { 
        input: 's = "(1+(4+5+2)-3)+(6+8)"', 
        output: "23", 
        explain: "Evaluate the inner parentheses first: (4+5+2) = 11.\nThen (1+11-3) = 9.\nThen (6+8) = 14.\nFinally 9 + 14 = 23." 
      }
    ],
    constraints: [
      "1 <= s.length <= 3 * 10^5",
      "s consists of digits, '+', '-', '(', ')', and ' '.",
      "s represents a valid expression.",
      "Every number and running calculation will fit in a signed 32-bit integer."
    ],
    acceptance: 42.8,
    companies: ["Meta", "Google", "Amazon"]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");

    let addedCount = 0;
    for (const prob of BATCH_10_PROBLEMS) {
      await Problem.findOneAndUpdate(
        { slug: prob.slug }, 
        prob, 
        { upsert: true, returnDocument: 'after' } 
      );
      addedCount++;
    }

    console.log(`✅ Batch 10 Complete! We have officially hit the 70 Problem mark.`);
    process.exit();
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
};

seedDB();