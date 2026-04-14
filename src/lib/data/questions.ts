export type Difficulty = "easy" | "medium" | "hard";

export type Category =
  | "数据结构与算法"
  | "计算机网络"
  | "操作系统"
  | "数据库"
  | "系统设计"
  | "编程语言"
  | "前端开发"
  | "后端开发";

export interface Question {
  id: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  tags: string[];
  content: string;
  answer: string;
  hints: string[];
  frequency: number; // 1-5
}

export const categories: Category[] = [
  "数据结构与算法",
  "计算机网络",
  "操作系统",
  "数据库",
  "系统设计",
  "编程语言",
  "前端开发",
  "后端开发",
];

export const categoryIcons: Record<Category, string> = {
  "数据结构与算法": "BinaryTree",
  "计算机网络": "Globe",
  "操作系统": "Monitor",
  "数据库": "Database",
  "系统设计": "LayoutGrid",
  "编程语言": "Code",
  "前端开发": "MonitorSmartphone",
  "后端开发": "Server",
};

export const difficultyLabels: Record<Difficulty, string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

export const questions: Question[] = [
  // ==================== 数据结构与算法 ====================
  {
    id: "dsa-001",
    title: "反转链表",
    category: "数据结构与算法",
    difficulty: "easy",
    tags: ["链表", "递归", "迭代"],
    content:
      "给定一个单链表的头节点 head，请反转该链表并返回反转后的链表。\n\n示例：\n输入：1 -> 2 -> 3 -> 4 -> 5 -> null\n输出：5 -> 4 -> 3 -> 2 -> 1 -> null",
    answer: `**迭代法：**\n\n使用三个指针 prev、curr、next 依次遍历链表，将每个节点的 next 指向 prev。\n\n\`\`\`python\ndef reverseList(head):\n    prev = None\n    curr = head\n    while curr:\n        next_node = curr.next\n        curr.next = prev\n        prev = curr\n        curr = next_node\n    return prev\n\`\`\`\n\n**递归法：**\n\n递归到链表末尾，然后在回溯过程中反转指针。\n\n\`\`\`python\ndef reverseList(head):\n    if not head or not head.next:\n        return head\n    new_head = reverseList(head.next)\n    head.next.next = head\n    head.next = None\n    return new_head\n\`\`\`\n\n时间复杂度：O(n)，空间复杂度：迭代 O(1)，递归 O(n)。`,
    hints: [
      "考虑使用多个指针来追踪当前节点和前一个节点",
      "可以先用递归的思路想，再转化为迭代",
      "注意处理头节点为空的情况",
    ],
    frequency: 5,
  },
  {
    id: "dsa-002",
    title: "二叉树的层序遍历",
    category: "数据结构与算法",
    difficulty: "medium",
    tags: ["树", "BFS", "队列"],
    content:
      "给定一个二叉树的根节点 root，返回其节点值的层序遍历（即逐层地，从左到右访问所有节点）。\n\n示例：\n输入：root = [3,9,20,null,null,15,7]\n输出：[[3],[9,20],[15,7]]",
    answer: `使用 BFS（广度优先搜索）配合队列实现：\n\n\`\`\`python\nfrom collections import deque\n\ndef levelOrder(root):\n    if not root:\n        return []\n    result = []\n    queue = deque([root])\n    while queue:\n        level_size = len(queue)\n        current_level = []\n        for _ in range(level_size):\n            node = queue.popleft()\n            current_level.append(node.val)\n            if node.left:\n                queue.append(node.left)\n            if node.right:\n                queue.append(node.right)\n        result.append(current_level)\n    return result\n\`\`\`\n\n时间复杂度：O(n)，空间复杂度：O(n)。`,
    hints: [
      "使用队列来逐层处理节点",
      "需要在每一层开始时记录当前层的节点数量",
      "注意区分不同层的结果",
    ],
    frequency: 5,
  },
  {
    id: "dsa-003",
    title: "最长递增子序列",
    category: "数据结构与算法",
    difficulty: "medium",
    tags: ["动态规划", "二分查找"],
    content:
      "给定一个整数数组 nums，找到其中最长严格递增子序列的长度。\n\n示例：\n输入：nums = [10,9,2,5,3,7,101,18]\n输出：4（最长递增子序列是 [2,3,7,101]）",
    answer: `**动态规划法：**\n\n\`\`\`python\ndef lengthOfLIS(nums):\n    n = len(nums)\n    dp = [1] * n\n    for i in range(1, n):\n        for j in range(i):\n            if nums[i] > nums[j]:\n                dp[i] = max(dp[i], dp[j] + 1)\n    return max(dp)\n\`\`\`\n\n**二分查找优化法（O(n log n)）：**\n\n维护一个 tails 数组，tails[i] 表示长度为 i+1 的递增子序列的最小末尾元素。\n\n\`\`\`python\nimport bisect\n\ndef lengthOfLIS(nums):\n    tails = []\n    for num in nums:\n        idx = bisect.bisect_left(tails, num)\n        if idx == len(tails):\n            tails.append(num)\n        else:\n            tails[idx] = num\n    return len(tails)\n\`\`\`\n\n时间复杂度：DP O(n²)，二分查找 O(n log n)。`,
    hints: [
      "考虑动态规划，dp[i] 表示以 nums[i] 结尾的最长递增子序列长度",
      "可以尝试用二分查找优化到 O(n log n)",
      "维护一个辅助数组记录最小末尾元素",
    ],
    frequency: 4,
  },
  {
    id: "dsa-004",
    title: "快速排序算法",
    category: "数据结构与算法",
    difficulty: "medium",
    tags: ["排序", "分治", "递归"],
    content:
      "请实现快速排序算法，并分析其时间复杂度和空间复杂度。\n\n要求：\n1. 实现基本的快速排序\n2. 讨论基准元素（pivot）的选择策略\n3. 分析最坏情况和平均情况的时间复杂度",
    answer: `\`\`\`python\ndef quick_sort(arr, low=0, high=None):\n    if high is None:\n        high = len(arr) - 1\n    if low < high:\n        pivot_idx = partition(arr, low, high)\n        quick_sort(arr, low, pivot_idx - 1)\n        quick_sort(arr, pivot_idx + 1, high)\n    return arr\n\ndef partition(arr, low, high):\n    pivot = arr[high]  # 选择最后一个元素作为基准\n    i = low - 1\n    for j in range(low, high):\n        if arr[j] <= pivot:\n            i += 1\n            arr[i], arr[j] = arr[j], arr[i]\n    arr[i + 1], arr[high] = arr[high], arr[i + 1]\n    return i + 1\n\`\`\`\n\n**基准选择策略：**\n1. 固定选择最后一个元素（简单但可能退化）\n2. 随机选择（避免最坏情况）\n3. 三数取中法（选择首、中、末的中位数）\n\n**复杂度分析：**\n- 平均时间复杂度：O(n log n)\n- 最坏时间复杂度：O(n²)（数组已有序时）\n- 平均空间复杂度：O(log n)（递归栈）`,
    hints: [
      "核心是 partition 操作，将数组分为两部分",
      "考虑如何选择 pivot 可以避免最坏情况",
      "可以画图辅助理解 partition 过程",
    ],
    frequency: 4,
  },
  {
    id: "dsa-005",
    title: "LRU 缓存机制",
    category: "数据结构与算法",
    difficulty: "hard",
    tags: ["哈希表", "链表", "设计"],
    content:
      "设计并实现一个满足 LRU（最近最少使用）缓存约束的数据结构。\n\n实现 LRUCache 类：\n- LRUCache(int capacity) 以正整数作为容量初始化 LRU 缓存\n- get(int key) 获取关键字 key 对应的值，O(1) 时间复杂度\n- put(int key, int value) 插入关键字，O(1) 时间复杂度\n\n当缓存达到容量上限时，应在写入新数据之前删除最久未使用的数据。",
    answer: `使用哈希表 + 双向链表实现：\n\n\`\`\`python\nclass Node:\n    def __init__(self, key=0, val=0):\n        self.key = key\n        self.val = val\n        self.prev = None\n        self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity):\n        self.capacity = capacity\n        self.cache = {}\n        self.head = Node()\n        self.tail = Node()\n        self.head.next = self.tail\n        self.tail.prev = self.head\n\n    def _remove(self, node):\n        node.prev.next = node.next\n        node.next.prev = node.prev\n\n    def _add_to_front(self, node):\n        node.next = self.head.next\n        node.prev = self.head\n        self.head.next.prev = node\n        self.head.next = node\n\n    def get(self, key):\n        if key in self.cache:\n            node = self.cache[key]\n            self._remove(node)\n            self._add_to_front(node)\n            return node.val\n        return -1\n\n    def put(self, key, value):\n        if key in self.cache:\n            node = self.cache[key]\n            node.val = value\n            self._remove(node)\n            self._add_to_front(node)\n        else:\n            if len(self.cache) >= self.capacity:\n                lru = self.tail.prev\n                self._remove(lru)\n                del self.cache[lru.key]\n            node = Node(key, value)\n            self.cache[key] = node\n            self._add_to_front(node)\n\`\`\`\n\n时间复杂度：get 和 put 均为 O(1)。空间复杂度：O(capacity)。`,
    hints: [
      "哈希表用于 O(1) 查找，双向链表用于维护访问顺序",
      "每次访问（get/put）都需要将节点移到链表头部",
      "使用虚拟头尾节点简化边界处理",
    ],
    frequency: 5,
  },
  {
    id: "dsa-006",
    title: "合并 K 个升序链表",
    category: "数据结构与算法",
    difficulty: "hard",
    tags: ["链表", "堆", "分治"],
    content:
      "给你一个链表数组，每个链表都已经按升序排列。请将所有链表合并到一个升序链表中，返回合并后的链表。\n\n示例：\n输入：lists = [[1,4,5],[1,3,4],[2,6]]\n输出：[1,1,2,3,4,4,5,6]",
    answer: `**优先队列（最小堆）法：**\n\n\`\`\`python\nimport heapq\n\ndef mergeKLists(lists):\n    min_heap = []\n    for i, node in enumerate(lists):\n        if node:\n            heapq.heappush(min_heap, (node.val, i, node))\n    \n    dummy = ListNode(0)\n    curr = dummy\n    while min_heap:\n        val, i, node = heapq.heappop(min_heap)\n        curr.next = node\n        curr = curr.next\n        if node.next:\n            heapq.heappush(min_heap, (node.next.val, i, node.next))\n    return dummy.next\n\`\`\`\n\n**分治法：**\n\n两两合并链表，类似归并排序的思路。\n\n时间复杂度：O(N log k)，其中 N 是所有链表的总节点数，k 是链表数量。空间复杂度：O(k)。`,
    hints: [
      "考虑使用最小堆来高效获取当前最小节点",
      "也可以用分治法，两两合并",
      "注意 Python 堆中比较元组的处理",
    ],
    frequency: 4,
  },
  {
    id: "dsa-007",
    title: "两数之和",
    category: "数据结构与算法",
    difficulty: "easy",
    tags: ["哈希表", "数组"],
    content:
      "给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。\n\n示例：\n输入：nums = [2,7,11,15], target = 9\n输出：[0,1]（因为 nums[0] + nums[1] == 9）",
    answer: `**哈希表法：**\n\n\`\`\`python\ndef twoSum(nums, target):\n    hash_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in hash_map:\n            return [hash_map[complement], i]\n        hash_map[num] = i\n    return []\n\`\`\`\n\n时间复杂度：O(n)，空间复杂度：O(n)。\n\n**暴力法：** 双重循环 O(n²)，不推荐。`,
    hints: [
      "考虑使用哈希表来存储已经遍历过的数字",
      "对于每个数字，检查 target - num 是否已经在哈希表中",
      "注意同一个元素不能使用两次",
    ],
    frequency: 5,
  },
  {
    id: "dsa-008",
    title: "岛屿数量",
    category: "数据结构与算法",
    difficulty: "medium",
    tags: ["DFS", "BFS", "矩阵"],
    content:
      "给定一个由 '1'（陆地）和 '0'（水）组成的二维网格，计算岛屿的数量。一个岛被水包围，并且通过水平或垂直连接相邻的陆地而形成。\n\n示例：\n输入：grid = [\n  [\"1\",\"1\",\"0\",\"0\",\"0\"],\n  [\"1\",\"1\",\"0\",\"0\",\"0\"],\n  [\"0\",\"0\",\"1\",\"0\",\"0\"],\n  [\"0\",\"0\",\"0\",\"1\",\"1\"]\n]\n输出：3",
    answer: `**DFS 法：**\n\n\`\`\`python\ndef numIslands(grid):\n    if not grid:\n        return 0\n    rows, cols = len(grid), len(grid[0])\n    count = 0\n    \n    def dfs(r, c):\n        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':\n            return\n        grid[r][c] = '0'  # 标记为已访问\n        dfs(r+1, c)\n        dfs(r-1, c)\n        dfs(r, c+1)\n        dfs(r, c-1)\n    \n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == '1':\n                count += 1\n                dfs(r, c)\n    return count\n\`\`\`\n\n时间复杂度：O(m x n)，空间复杂度：O(m x n)（最坏情况递归栈深度）。`,
    hints: [
      "遍历网格，遇到 '1' 时开始 DFS/BFS",
      "将访问过的陆地标记为 '0' 避免重复访问",
      "注意四个方向的搜索：上下左右",
    ],
    frequency: 4,
  },

  // ==================== 计算机网络 ====================
  {
    id: "net-001",
    title: "TCP 三次握手与四次挥手",
    category: "计算机网络",
    difficulty: "medium",
    tags: ["TCP", "连接管理"],
    content:
      "请详细描述 TCP 三次握手和四次挥手的过程，并解释为什么建立连接需要三次而断开连接需要四次。",
    answer: `**三次握手：**\n\n1. 客户端发送 SYN 报文（seq=x）给服务器，进入 SYN_SENT 状态\n2. 服务器收到后，回复 SYN+ACK 报文（seq=y, ack=x+1），进入 SYN_RCVD 状态\n3. 客户端收到后，发送 ACK 报文（ack=y+1），进入 ESTABLISHED 状态\n\n**为什么需要三次？**\n- 确认双方的发送和接收能力都正常\n- 防止已失效的连接请求报文突然传到服务器，产生错误\n\n**四次挥手：**\n\n1. 客户端发送 FIN 报文，进入 FIN_WAIT_1 状态\n2. 服务器回复 ACK 报文，进入 CLOSE_WAIT 状态（半关闭）\n3. 服务器发送 FIN 报文，进入 LAST_ACK 状态\n4. 客户端回复 ACK 报文，进入 TIME_WAIT 状态，等待 2MSL 后关闭\n\n**为什么需要四次？**\n- TCP 是全双工通信，每个方向都需要单独关闭\n- 服务器收到 FIN 后可能还有数据要发送，所以先回复 ACK，等数据发送完再发 FIN`,
    hints: [
      "画图辅助理解握手和挥手的报文交互过程",
      "思考全双工通信的特点",
      "注意 TIME_WAIT 状态的作用",
    ],
    frequency: 5,
  },
  {
    id: "net-002",
    title: "HTTP 和 HTTPS 的区别",
    category: "计算机网络",
    difficulty: "easy",
    tags: ["HTTP", "HTTPS", "安全"],
    content:
      "请详细说明 HTTP 和 HTTPS 的区别，包括安全性、端口、性能等方面，并描述 HTTPS 的握手过程。",
    answer: `**主要区别：**\n\n| 特性 | HTTP | HTTPS |\n|------|------|-------|\n| 安全性 | 明文传输 | SSL/TLS 加密传输 |\n| 端口 | 80 | 443 |\n| 证书 | 不需要 | 需要 CA 证书 |\n| 性能 | 较快 | 略慢（握手开销） |\n| SEO | 较低 | 搜索引擎优先 |\n\n**HTTPS 握手过程：**\n\n1. 客户端发送 Client Hello（支持的 TLS 版本、加密套件列表、随机数）\n2. 服务器回复 Server Hello（选择的加密套件、随机数）+ 证书\n3. 客户端验证证书有效性\n4. 客户端生成预主密钥（Pre-Master Secret），用服务器公钥加密发送\n5. 双方基于预主密钥和两个随机数生成会话密钥\n6. 客户端发送 Finished 报文（加密）\n7. 服务器发送 Finished 报文（加密）\n\n之后通信使用对称加密（如 AES）进行数据传输。`,
    hints: [
      "HTTPS = HTTP + SSL/TLS",
      "思考对称加密和非对称加密各自的作用",
      "注意混合加密体制的设计原因",
    ],
    frequency: 5,
  },
  {
    id: "net-003",
    title: "DNS 解析过程",
    category: "计算机网络",
    difficulty: "medium",
    tags: ["DNS", "域名系统"],
    content:
      "请描述在浏览器中输入 URL 后，DNS 的完整解析过程，包括递归查询和迭代查询的区别。",
    answer: `**DNS 解析过程：**\n\n1. **浏览器缓存**：首先检查浏览器自身的 DNS 缓存\n2. **操作系统缓存**：检查本机的 hosts 文件和 DNS 缓存\n3. **本地 DNS 服务器**：向配置的本地 DNS 服务器发起查询\n4. **根域名服务器**：本地 DNS 服务器向根域名服务器查询\n5. **顶级域名服务器**：根服务器返回 TLD 服务器地址\n6. **权威域名服务器**：TLD 服务器返回权威 DNS 服务器地址\n7. **获取最终结果**：权威 DNS 服务器返回 IP 地址\n\n**递归查询 vs 迭代查询：**\n- 递归查询：客户端向 DNS 服务器查询，服务器必须给出最终答案\n- 迭代查询：DNS 服务器返回下一步应该查询的服务器地址\n\n通常，客户端到本地 DNS 服务器之间是递归查询，本地 DNS 服务器到其他 DNS 服务器之间是迭代查询。`,
    hints: [
      "从缓存开始思考，逐层向外查询",
      "区分递归查询和迭代查询的概念",
      "考虑 DNS 负载均衡和 CDN 的关系",
    ],
    frequency: 4,
  },
  {
    id: "net-004",
    title: "TCP 拥塞控制",
    category: "计算机网络",
    difficulty: "hard",
    tags: ["TCP", "拥塞控制", "流量控制"],
    content:
      "请详细描述 TCP 的拥塞控制机制，包括慢启动、拥塞避免、快重传和快恢复算法。",
    answer: `**TCP 拥塞控制的四个算法：**\n\n**1. 慢启动（Slow Start）：**\n- 连接建立后，cwnd = 1（1 个 MSS）\n- 每收到一个 ACK，cwnd 加 1（实际上每个 RTT cwnd 翻倍）\n- 指数增长直到达到慢启动阈值 ssthresh\n\n**2. 拥塞避免（Congestion Avoidance）：**\n- 当 cwnd >= ssthresh 时，进入拥塞避免阶段\n- 每个 RTT cwnd 只增加 1（线性增长）\n\n**3. 快重传（Fast Retransmit）：**\n- 收到 3 个重复 ACK 时，立即重传丢失的报文段\n- 不必等待超时计时器到期\n\n**4. 快恢复（Fast Recovery）：**\n- 收到 3 个重复 ACK 后，ssthresh = cwnd / 2，cwnd = ssthresh + 3\n- 之后进入拥塞避免阶段（而非慢启动）\n\n**超时 vs 重复 ACK：**\n- 超时：网络可能严重拥塞，ssthresh = cwnd / 2，cwnd = 1，重新慢启动\n- 3 个重复 ACK：网络轻度拥塞，使用快恢复`,
    hints: [
      "区分流量控制（接收端控制）和拥塞控制（发送端控制）",
      "画图理解 cwnd 随时间的变化曲线",
      "注意超时和重复 ACK 的不同处理方式",
    ],
    frequency: 3,
  },
  {
    id: "net-005",
    title: "HTTP/2 和 HTTP/1.1 的区别",
    category: "计算机网络",
    difficulty: "medium",
    tags: ["HTTP", "性能优化"],
    content:
      "请比较 HTTP/2 和 HTTP/1.1 的主要区别，并说明 HTTP/2 的核心改进。",
    answer: `**HTTP/2 的核心改进：**\n\n**1. 多路复用（Multiplexing）：**\n- HTTP/1.1：每个域名有 6 个 TCP 连接限制，队头阻塞\n- HTTP/2：在单个 TCP 连接上可以同时发送多个请求和响应\n\n**2. 二进制分帧（Binary Framing）：**\n- HTTP/1.1：文本协议，解析不够高效\n- HTTP/2：使用二进制格式，帧是最小通信单位\n\n**3. 头部压缩（HPACK）：**\n- HTTP/1.1：每次请求都发送完整的头部\n- HTTP/2：使用 HPACK 算法压缩头部，支持静态表和动态表\n\n**4. 服务器推送（Server Push）：**\n- 服务器可以主动推送资源给客户端\n\n**5. 流优先级（Stream Priority）：**\n- 客户端可以设置流的优先级和依赖关系\n\n**注意：** HTTP/2 虽然解决了 HTTP 层的队头阻塞，但 TCP 层的队头阻塞仍然存在（HTTP/3 使用 QUIC 协议解决此问题）。`,
    hints: [
      "从性能瓶颈角度思考 HTTP/1.1 的问题",
      "理解队头阻塞在不同层面的含义",
      "HTTP/3 使用 QUIC 协议进一步改进",
    ],
    frequency: 3,
  },
  {
    id: "net-006",
    title: "从输入 URL 到页面展示的完整过程",
    category: "计算机网络",
    difficulty: "hard",
    tags: ["HTTP", "浏览器", "网络"],
    content:
      "请详细描述在浏览器地址栏输入 URL 到页面完整展示的整个过程。",
    answer: `**完整过程：**\n\n1. **URL 解析**：解析协议、域名、端口、路径等\n2. **DNS 解析**：域名 -> IP 地址（缓存 -> 本地 DNS -> 根/TLD/权威 DNS）\n3. **TCP 连接**：三次握手建立连接\n4. **TLS 握手**（HTTPS）：证书验证、密钥协商\n5. **发送 HTTP 请求**：构建请求报文（方法、URL、Headers、Cookie 等）\n6. **服务器处理请求**：路由匹配、中间件处理、业务逻辑、数据库查询\n7. **服务器返回响应**：状态码、响应头、响应体\n8. **浏览器解析 HTML**：\n   - 构建 DOM 树\n   - 遇到 CSS 构建 CSSOM 树\n   - 合并为渲染树（Render Tree）\n   - 布局（Layout/Reflow）：计算几何信息\n   - 绘制（Paint）：像素化渲染\n9. **执行 JavaScript**：DOM 操作、事件绑定、异步请求\n10. **页面渲染完成**：触发 load 事件`,
    hints: [
      "按照时间顺序逐步描述",
      "注意区分网络层面和浏览器渲染层面",
      "考虑缓存机制对过程的影响",
    ],
    frequency: 5,
  },

  // ==================== 操作系统 ====================
  {
    id: "os-001",
    title: "进程和线程的区别",
    category: "操作系统",
    difficulty: "easy",
    tags: ["进程", "线程", "并发"],
    content:
      "请详细说明进程和线程的区别，以及它们之间的关系。",
    answer: `**进程 vs 线程：**\n\n| 特性 | 进程 | 线程 |\n|------|------|------|\n| 定义 | 资源分配的基本单位 | CPU 调度的基本单位 |\n| 内存 | 拥有独立的地址空间 | 共享进程的地址空间 |\n| 创建开销 | 大 | 小 |\n| 切换开销 | 大（需切换页表等） | 小 |\n| 通信 | 需要IPC机制 | 直接共享内存 |\n| 健壮性 | 一个进程崩溃不影响其他 | 一个线程崩溃导致整个进程崩溃 |\n\n**关系：**\n- 一个进程至少包含一个线程（主线程）\n- 线程是进程内的执行单元\n- 进程是线程的容器\n\n**线程共享的资源：**\n- 代码段、数据段、堆\n- 打开的文件描述符\n- 信号处理器\n\n**线程私有的资源：**\n- 栈、寄存器\n- 线程 ID\n- 错误码（errno）`,
    hints: [
      "从资源分配和调度的角度思考",
      "考虑它们各自的开销和通信方式",
      "思考为什么需要同时存在进程和线程",
    ],
    frequency: 5,
  },
  {
    id: "os-002",
    title: "死锁的产生条件和预防",
    category: "操作系统",
    difficulty: "medium",
    tags: ["死锁", "并发", "资源管理"],
    content:
      "请描述死锁产生的四个必要条件，以及预防、避免和检测死锁的方法。",
    answer: `**死锁的四个必要条件（Coffman 条件）：**\n\n1. **互斥条件**：资源一次只能被一个进程使用\n2. **持有并等待**：进程持有资源同时等待其他资源\n3. **不可抢占**：资源不能被强制剥夺\n4. **循环等待**：进程之间形成循环等待资源的关系\n\n**预防死锁（破坏必要条件）：**\n- 破坏互斥：使资源可共享（不现实）\n- 破坏持有并等待：进程在开始前获取所有资源\n- 破坏不可抢占：允许资源被抢占\n- 破坏循环等待：对资源排序，按序申请\n\n**避免死锁：**\n- 银行家算法：在分配前检查是否会导致不安全状态\n\n**检测死锁：**\n- 资源分配图\n- 使用深度优先搜索检测环\n\n**解除死锁：**\n1. 终止进程（终止所有或逐个终止）\n2. 资源抢占（回滚到安全状态）`,
    hints: [
      "记住四个必要条件：互斥、持有并等待、不可抢占、循环等待",
      "预防是事前策略，避免是运行时策略，检测是事后策略",
      "银行家算法的核心是寻找安全序列",
    ],
    frequency: 4,
  },
  {
    id: "os-003",
    title: "虚拟内存和页面置换算法",
    category: "操作系统",
    difficulty: "medium",
    tags: ["内存管理", "虚拟内存", "页面置换"],
    content:
      "请解释虚拟内存的概念和工作原理，并描述常见的页面置换算法。",
    answer: `**虚拟内存概念：**\n\n虚拟内存是一种内存管理技术，它使程序认为自己拥有连续的可用内存空间，而实际上物理内存是被分散的，部分数据存储在磁盘上。\n\n**工作原理：**\n- 将虚拟地址空间划分为固定大小的页（Page），物理内存划分为页框（Frame）\n- 通过页表（Page Table）将虚拟地址映射到物理地址\n- CPU 中的 MMU（内存管理单元）负责地址转换\n- TLB（Translation Lookaside Buffer）缓存页表项，加速地址转换\n\n**页面置换算法：**\n\n1. **OPT（最优置换）**：置换最长时间不使用的页面（理论最优，不可实现）\n2. **FIFO（先进先出）**：置换最早进入内存的页面，可能产生 Belady 异常\n3. **LRU（最近最少使用）**：置换最近最久未使用的页面，性能接近 OPT\n4. **LFU（最不经常使用）**：置换使用频率最低的页面\n5. **Clock 算法**：使用访问位近似 LRU，实现简单\n\n**缺页中断处理：**\n1. 检查内部表确定页面在磁盘上的位置\n2. 如果有空闲帧，直接使用\n3. 否则使用页面置换算法选择一个牺牲页面\n4. 将所需页面从磁盘读入，更新页表`,
    hints: [
      "虚拟内存的核心是按需加载和地址映射",
      "比较各页面置换算法的优缺点",
      "注意 Belady 异常只在 FIFO 算法中出现",
    ],
    frequency: 4,
  },
  {
    id: "os-004",
    title: "进程间通信方式（IPC）",
    category: "操作系统",
    difficulty: "medium",
    tags: ["IPC", "进程通信", "管道"],
    content:
      "请列举并说明常见的进程间通信方式，以及它们各自的适用场景。",
    answer: `**常见 IPC 方式：**\n\n**1. 管道（Pipe）：**\n- 匿名管道：半双工，只用于有亲缘关系的进程间通信\n- 命名管道（FIFO）：半双工，可用于无亲缘关系的进程间通信\n\n**2. 消息队列（Message Queue）：**\n- 消息链表，存放在内核中\n- 有格式化消息，按消息类型读取\n- 克服了管道只能传输无格式字节的缺点\n\n**3. 共享内存（Shared Memory）：**\n- 最快的 IPC 方式，两个进程共享同一块内存\n- 需要配合信号量或互斥锁进行同步\n\n**4. 信号量（Semaphore）：**\n- 计数器，用于控制多个进程对共享资源的访问\n- 常作为同步机制而非数据传输\n\n**5. 信号（Signal）：**\n- 异步通信机制，用于通知接收进程某个事件已发生\n- 只能传递信号编号，不能传递数据\n\n**6. Socket（套接字）：**\n- 可用于不同主机间的进程通信\n- 支持 TCP 和 UDP\n\n**选择建议：**\n- 父子进程：管道\n- 大量数据传输：共享内存\n- 跨网络通信：Socket`,
    hints: [
      "从数据传输方向（单向/双向）和通信范围（本机/跨机）分类",
      "共享内存是最快的，但需要同步机制",
      "Socket 是唯一支持跨网络通信的方式",
    ],
    frequency: 4,
  },
  {
    id: "os-005",
    title: "Linux 文件系统和 inode",
    category: "操作系统",
    difficulty: "medium",
    tags: ["文件系统", "Linux", "inode"],
    content:
      "请解释 Linux 文件系统的基本结构，以及 inode 的作用和工作原理。",
    answer: `**Linux 文件系统结构：**\n\n- **超级块（Superblock）**：存储文件系统的整体信息（块大小、inode 数量等）\n- **inode 表**：存储所有文件的 inode\n- **数据块（Data Block）**：存储文件的实际数据\n\n**inode（索引节点）：**\n\ninode 是文件系统中最基本的概念，每个文件对应一个 inode。\n\n**inode 存储的信息：**\n- 文件类型（普通文件、目录、链接等）\n- 权限（读/写/执行）\n- 所有者（UID/GID）\n- 文件大小\n- 时间戳（atime/mtime/ctime）\n- 数据块指针（直接指针 + 间接指针）\n- 链接计数（硬链接数）\n\n**注意：inode 中不存储文件名！**\n文件名存储在目录文件的数据块中，目录将文件名映射到 inode 号。\n\n**软链接 vs 硬链接：**\n- 硬链接：指向同一个 inode，链接计数 +1\n- 软链接：独立的 inode，存储目标路径的字符串\n\n**查看 inode：**\n\`\`\`bash\nls -i file.txt  # 查看 inode 号\nstat file.txt   # 查看详细 inode 信息\n\`\`\``,
    hints: [
      "inode 是文件的元数据，不包含文件名",
      "理解目录也是一种文件",
      "思考为什么删除文件后有时还能恢复",
    ],
    frequency: 3,
  },
  {
    id: "os-006",
    title: "用户态和内核态切换",
    category: "操作系统",
    difficulty: "hard",
    tags: ["内核", "系统调用", "中断"],
    content:
      "请解释用户态和内核态的区别，以及什么情况下会发生用户态到内核态的切换。",
    answer: `**用户态 vs 内核态：**\n\n- **用户态**：应用程序运行的状态，权限受限，不能直接访问硬件\n- **内核态**：操作系统内核运行的状态，拥有最高权限，可以访问所有硬件资源\n\n**区别：**\n- 权限级别不同（通过 CPU 的特权级实现，如 x86 的 Ring 0 和 Ring 3）\n- 用户态程序不能执行特权指令\n- 用户态有自己的栈空间，内核态有独立的内核栈\n\n**用户态 -> 内核态的切换场景：**\n\n**1. 系统调用（System Call）：**\n- 应用程序主动请求操作系统服务\n- 如 read、write、fork、exec 等\n- 通过软中断（int 0x80）或 syscall 指令触发\n\n**2. 异常（Exception）：**\n- 程序运行时的错误\n- 如除零错误、缺页中断、非法内存访问\n\n**3. 中断（Interrupt）：**\n- 外部硬件设备的通知\n- 如时钟中断、I/O 中断、网卡中断\n\n**切换过程：**\n1. 保存当前上下文（寄存器、程序计数器、栈指针等）\n2. 切换到内核栈\n3. 根据中断向量表找到处理程序\n4. 执行内核代码\n5. 恢复上下文，返回用户态\n\n**切换开销：** 上下文保存/恢复、权限检查、TLB 刷新等，约几百纳秒到几微秒。`,
    hints: [
      "从权限和安全的角度思考为什么需要区分两种状态",
      "系统调用是最常见的切换方式",
      "注意切换的开销对性能的影响",
    ],
    frequency: 3,
  },

  // ==================== 数据库 ====================
  {
    id: "db-001",
    title: "MySQL 索引原理与优化",
    category: "数据库",
    difficulty: "medium",
    tags: ["MySQL", "索引", "B+树"],
    content:
      "请解释 MySQL 中 B+ 树索引的原理，以及索引优化的常见策略。",
    answer: `**B+ 树索引原理：**\n\nB+ 树是一种自平衡的多路搜索树，MySQL InnoDB 引擎使用 B+ 树作为索引的数据结构。\n\n**B+ 树特点：**\n- 非叶子节点只存储键值，不存储数据（索引值）\n- 所有数据都存储在叶子节点\n- 叶子节点通过链表连接（支持范围查询）\n- 树的高度通常为 3-4 层，查找效率 O(log n)\n\n**聚簇索引 vs 非聚簇索引：**\n- 聚簇索引：叶子节点存储完整的行数据（InnoDB 主键索引）\n- 非聚簇索引（二级索引）：叶子节点存储主键值，需要回表查询\n\n**索引优化策略：**\n\n1. **最左前缀原则**：联合索引按最左列开始匹配\n2. **覆盖索引**：查询的字段都在索引中，避免回表\n3. **索引下推**：MySQL 5.6+ 在索引遍历过程中执行过滤\n4. **避免索引失效**：\n   - 不在索引列上使用函数\n   - 不使用 != 或 NOT IN（会导致全表扫描）\n   - LIKE 以通配符开头会失效\n   - 注意隐式类型转换\n5. **合理使用索引类型**：\n   - 主键索引、唯一索引、普通索引、全文索引`,
    hints: [
      "B+ 树相比 B 树更适合数据库场景，因为叶子节点形成链表",
      "理解聚簇索引和非聚簇索引的区别是关键",
      "最左前缀原则是联合索引的核心",
    ],
    frequency: 5,
  },
  {
    id: "db-002",
    title: "数据库事务和隔离级别",
    category: "数据库",
    difficulty: "medium",
    tags: ["事务", "ACID", "隔离级别"],
    content:
      "请解释数据库事务的 ACID 特性，以及四种隔离级别分别解决什么问题。",
    answer: `**ACID 特性：**\n\n- **原子性（Atomicity）**：事务中的操作要么全部成功，要么全部失败回滚\n- **一致性（Consistency）**：事务执行前后，数据库从一个一致状态变为另一个一致状态\n- **隔离性（Isolation）**：并发事务之间互不影响\n- **持久性（Durability）**：事务提交后，修改永久保存\n\n**四种隔离级别：**\n\n| 隔离级别 | 脏读 | 不可重复读 | 幻读 |\n|---------|------|-----------|------|\n| 读未提交（Read Uncommitted） | 可能 | 可能 | 可能 |\n| 读已提交（Read Committed） | 不可能 | 可能 | 可能 |\n| 可重复读（Repeatable Read） | 不可能 | 不可能 | 可能 |\n| 串行化（Serializable） | 不可能 | 不可能 | 不可能 |\n\n**MySQL InnoDB 默认隔离级别：可重复读（RR）**\n\n**MVCC（多版本并发控制）：**\n- InnoDB 通过 MVCC 实现读不加锁\n- 每行数据有隐藏的版本号（trx_id）和回滚指针\n- Read View 决定事务能看到哪些版本\n\n**注意：** InnoDB 在 RR 级别通过 Next-Key Lock 在一定程度上解决了幻读问题。`,
    hints: [
      "从并发问题出发理解隔离级别的设计",
      "脏读、不可重复读、幻读的区别是什么？",
      "理解 MVCC 的基本原理",
    ],
    frequency: 5,
  },
  {
    id: "db-003",
    title: "Redis 常见数据类型和应用场景",
    category: "数据库",
    difficulty: "medium",
    tags: ["Redis", "NoSQL", "缓存"],
    content:
      "请列举 Redis 的常见数据类型及其底层实现，并说明各自的应用场景。",
    answer: `**Redis 五种基本数据类型：**\n\n**1. String（字符串）：**\n- 底层：SDS（Simple Dynamic String）\n- 场景：缓存、计数器（INCR）、分布式锁（SETNX）、Session\n\n**2. Hash（哈希）：**\n- 底层：ziplist 或 hashtable\n- 场景：存储对象（如用户信息）、购物车\n\n**3. List（列表）：**\n- 底层：quicklist（双向链表 + ziplist）\n- 场景：消息队列（LPUSH/BRPOP）、最新消息列表、朋友圈时间线\n\n**4. Set（集合）：**\n- 底层：intset 或 hashtable\n- 场景：标签、共同好友（SINTER）、随机抽奖（SRANDMEMBER）\n\n**5. Sorted Set（有序集合）：**\n- 底层：ziplist 或 skiplist + hashtable\n- 场景：排行榜（ZREVRANGE）、延迟队列、滑动窗口限流\n\n**高级数据类型：**\n- **HyperLogLog**：基数统计（UV 统计）\n- **Bitmap**：位运算（签到、在线状态）\n- **Geo**：地理位置\n- **Stream**：消息流（5.0+）`,
    hints: [
      "从实际使用场景出发思考每种数据类型的优势",
      "注意不同数据量的底层实现会自动切换",
      "考虑 Redis 作为缓存和作为数据库的不同用法",
    ],
    frequency: 5,
  },
  {
    id: "db-004",
    title: "SQL 优化技巧",
    category: "数据库",
    difficulty: "medium",
    tags: ["SQL", "优化", "MySQL"],
    content:
      "请列举常见的 SQL 优化技巧和排查慢查询的方法。",
    answer: `**SQL 优化技巧：**\n\n**1. 索引优化：**\n- 使用 EXPLAIN 分析执行计划\n- 确保查询使用了正确的索引\n- 避免全表扫描\n\n**2. 查询优化：**\n- 避免 SELECT *，只查询需要的字段\n- 避免 WHERE 子句中对字段进行函数操作\n- 使用 LIMIT 限制返回行数\n- 小表驱动大表\n\n**3. JOIN 优化：**\n- 减少 JOIN 的表数量\n- 确保 JOIN 字段有索引\n- 优先使用 INNER JOIN\n\n**4. 子查询优化：**\n- 将相关子查询改为 JOIN\n- 使用 EXISTS 替代 IN（大数据集时）\n\n**5. 分页优化：**\n- 深分页问题：LIMIT offset, size 在 offset 大时性能差\n- 优化方案：基于游标的分页、延迟关联\n\n**排查慢查询：**\n1. 开启慢查询日志：slow_query_log = ON\n2. 设置阈值：long_query_time = 1\n3. 使用 EXPLAIN 分析执行计划\n4. 关注 type（访问类型）、rows（扫描行数）、Extra（额外信息）\n5. 使用 SHOW PROFILE 查看详细执行时间\n6. 使用 Performance Schema 进行更深入的分析`,
    hints: [
      "EXPLAIN 是 SQL 优化的第一步",
      "关注执行计划中的 type 列",
      "深分页是常见的性能问题",
    ],
    frequency: 4,
  },
  {
    id: "db-005",
    title: "Redis 缓存穿透、击穿和雪崩",
    category: "数据库",
    difficulty: "hard",
    tags: ["Redis", "缓存", "高并发"],
    content:
      "请解释 Redis 缓存穿透、缓存击穿和缓存雪崩的区别，以及各自的解决方案。",
    answer: `**缓存穿透（Cache Penetration）：**\n\n**问题：** 查询一个不存在的数据，缓存中没有，数据库中也没有，每次请求都会打到数据库。\n\n**解决方案：**\n1. 缓存空值（设置较短的过期时间）\n2. 布隆过滤器（Bloom Filter）：在缓存前加一层过滤\n3. 参数校验：拦截不合理的请求\n\n**缓存击穿（Cache Breakdown）：**\n\n**问题：** 某一个热点 key 过期的瞬间，大量请求同时打到数据库。\n\n**解决方案：**\n1. 互斥锁（SETNX）：只允许一个线程重建缓存\n2. 逻辑过期：不设置 TTL，在 value 中存储逻辑过期时间\n3. 热点数据永不过期 + 异步更新\n\n**缓存雪崩（Cache Avalanche）：**\n\n**问题：** 大量 key 同时过期，或者 Redis 服务宕机，大量请求打到数据库。\n\n**解决方案：**\n1. 过期时间加随机值，避免同时过期\n2. 多级缓存（本地缓存 + Redis）\n3. Redis 高可用（哨兵、集群）\n4. 限流降级（Hystrix、Sentinel）\n5. 缓存预热：系统启动时加载热点数据`,
    hints: [
      "穿透是查不到，击穿是热点过期，雪崩是大面积过期",
      "布隆过滤器是解决穿透的经典方案",
      "互斥锁是解决击穿的经典方案",
    ],
    frequency: 5,
  },
  {
    id: "db-006",
    title: "分库分表策略",
    category: "数据库",
    difficulty: "hard",
    tags: ["分布式", "分库分表", "MySQL"],
    content:
      "请解释什么情况下需要分库分表，以及常见的分库分表策略和中间件。",
    answer: `**何时需要分库分表：**\n\n- 单表数据量超过 500 万-1000 万行\n- 单库 QPS 超过 2000\n- 数据库存储空间不足\n- 查询性能下降明显\n\n**分库 vs 分表：**\n- 分库：解决并发连接数问题\n- 分表：解决单表数据量过大问题\n\n**分表策略：**\n\n**垂直分表：**\n- 将大表拆分为多个小表，按列拆分\n- 将不常用的字段拆分到扩展表\n- 将大字段（TEXT、BLOB）拆分到单独的表\n\n**水平分表：**\n- 按行拆分，每个表结构相同\n- 分片键（Sharding Key）的选择至关重要\n\n**常见分片策略：**\n1. 哈希分片：hash(key) % N，数据分布均匀\n2. 范围分片：按时间、ID 范围，便于范围查询\n3. 一致性哈希：减少扩容时的数据迁移\n\n**分库分表带来的问题：**\n- 分布式事务\n- 跨库 JOIN\n- 全局 ID 生成（Snowflake）\n- 数据迁移\n- 跨库分页\n\n**常见中间件：**\n- ShardingSphere（Apache）\n- MyCAT\n- Vitess`,
    hints: [
      "分片键的选择是分库分表的核心",
      "考虑分库分表后带来的新问题",
      "了解分布式事务的解决方案（2PC、TCC、Saga）",
    ],
    frequency: 4,
  },

  // ==================== 系统设计 ====================
  {
    id: "sd-001",
    title: "设计一个短链接系统",
    category: "系统设计",
    difficulty: "medium",
    tags: ["系统设计", "哈希", "分布式"],
    content:
      "请设计一个类似 bit.ly 的短链接系统，要求支持高并发访问，能够快速生成短链接和进行重定向。",
    answer: `**核心功能：**\n1. 长链接 -> 短链接的转换\n2. 短链接 -> 长链接的重定向\n3. 点击统计和分析\n\n**短链接生成方案：**\n\n**方案一：自增 ID + Base62 编码**\n- 数据库自增 ID\n- 将 ID 转换为 Base62（0-9, a-z, A-Z）\n- 7 位 Base62 可表示 62^7 = 3.5 万亿个短链接\n\n**方案二：哈希 + 冲突处理**\n- MD5/SHA256 取前 7 位\n- 冲突时使用线性探测或加盐重试\n\n**方案三：分布式 ID 生成**\n- Snowflake 算法\n- 号段模式\n\n**系统架构：**\n\n1. **API 网关**：限流、认证、负载均衡\n2. **写入服务**：生成短链接，写入数据库\n3. **缓存层**：Redis 缓存热点短链接映射\n4. **数据库**：存储映射关系（可分库分表）\n5. **重定向服务**：查询缓存 -> 查询数据库 -> 301/302 重定向\n\n**优化：**\n- 使用 301（永久重定向）vs 302（临时重定向）\n- Bloom Filter 判断短链接是否存在\n- CDN 缓存重定向响应\n- 异步记录点击日志（Kafka）`,
    hints: [
      "短链接的本质是长链接到短编码的映射",
      "考虑高并发下的 ID 生成方案",
      "缓存是提升重定向性能的关键",
    ],
    frequency: 4,
  },
  {
    id: "sd-002",
    title: "设计一个秒杀系统",
    category: "系统设计",
    difficulty: "hard",
    tags: ["系统设计", "高并发", "分布式"],
    content:
      "请设计一个电商秒杀系统，要求能承受瞬时高并发请求，保证公平性和数据一致性。",
    answer: `**核心挑战：**\n- 瞬时流量巨大（平时 10 倍以上）\n- 防止超卖\n- 保证公平性\n\n**系统架构：**\n\n**1. 前端层：**\n- 按钮防重复点击\n- CDN 静态化商品页面\n- 倒计时在客户端完成\n\n**2. 网关层：**\n- 限流（令牌桶/漏桶算法）\n- IP 黑名单\n- 风控验证\n\n**3. 服务层：**\n- 活动预热：提前将库存加载到 Redis\n- Redis 预扣减库存（DECR）\n- 消息队列异步下单（Kafka/RabbitMQ）\n- 订单服务异步处理\n\n**4. 数据层：**\n- Redis：库存缓存、分布式锁\n- MySQL：订单数据（最终一致性）\n\n**防超卖方案：**\n1. Redis DECR 原子操作\n2. Lua 脚本保证原子性\n3. 数据库乐观锁（版本号）\n\n**限流策略：**\n- Nginx 限流\n- 网关限流\n- 服务限流\n- 令牌桶算法\n\n**一致性保证：**\n- Redis 预扣减 + MQ 异步落库\n- 定时任务对账\n- 补偿机制`,
    hints: [
      "核心思路是「削峰填谷」，用消息队列缓冲请求",
      "Redis 原子操作是防超卖的关键",
      "前端限流 + 网关限流 + 服务限流，层层过滤",
    ],
    frequency: 5,
  },
  {
    id: "sd-003",
    title: "分布式锁的实现方式",
    category: "系统设计",
    difficulty: "medium",
    tags: ["分布式", "锁", "Redis"],
    content:
      "请描述分布式锁的常见实现方式，并比较它们的优缺点。",
    answer: `**1. Redis 分布式锁：**\n\n使用 SETNX + 过期时间：\n\`\`\`\nSET key value NX PX 30000\n\`\`\`\n\n**Redisson 实现（推荐）：**\n- 使用 Lua 脚本保证原子性\n- 看门狗机制自动续期\n- 可重入锁\n- 红锁（RedLock）：多节点保证高可用\n\n**2. ZooKeeper 分布式锁：**\n- 创建临时顺序节点\n- 监听前一个节点的删除事件\n- 优点：CP 模型，可靠性高\n- 缺点：性能不如 Redis\n\n**3. MySQL 分布式锁：**\n- 基于唯一索引：INSERT ... ON DUPLICATE\n- 基于排他锁：SELECT ... FOR UPDATE\n- 优点：简单可靠\n- 缺点：性能差，不适合高并发\n\n**对比：**\n\n| 特性 | Redis | ZooKeeper | MySQL |\n|------|-------|-----------|-------|\n| 性能 | 高 | 中 | 低 |\n| 可靠性 | 中（AP） | 高（CP） | 高（CP） |\n| 实现复杂度 | 中 | 高 | 低 |\n| 适用场景 | 高并发 | 强一致性 | 低并发 |`,
    hints: [
      "分布式锁需要满足互斥性、防死锁、容错性",
      "Redis 锁要注意锁续期和原子性",
      "根据业务场景选择合适的实现方式",
    ],
    frequency: 4,
  },
  {
    id: "sd-004",
    title: "消息队列的应用场景和选型",
    category: "系统设计",
    difficulty: "medium",
    tags: ["消息队列", "Kafka", "RabbitMQ"],
    content:
      "请描述消息队列的常见应用场景，并比较 Kafka、RabbitMQ 和 RocketMQ 的区别。",
    answer: `**常见应用场景：**\n\n1. **异步处理**：用户注册后发送邮件、短信\n2. **流量削峰**：秒杀系统将请求放入队列\n3. **系统解耦**：订单系统与库存系统解耦\n4. **日志处理**：收集分布式系统日志\n5. **数据同步**：跨系统的数据最终一致性\n\n**消息队列对比：**\n\n| 特性 | Kafka | RabbitMQ | RocketMQ |\n|------|-------|----------|----------|\n| 吞吐量 | 百万级 | 万级 | 十万级 |\n| 延迟 | ms 级 | us 级 | ms 级 |\n| 持久化 | 磁盘 | 内存/磁盘 | 磁盘 |\n| 消费模型 | 拉取 | 推送 | 拉取 |\n| 事务消息 | 不支持 | 不支持 | 支持 |\n| 延迟队列 | 不支持 | 支持 | 支持 |\n| 消息回溯 | 支持 | 不支持 | 支持 |\n\n**选型建议：**\n- **Kafka**：大数据场景、日志收集、高吞吐\n- **RabbitMQ**：低延迟、复杂路由、中小规模\n- **RocketMQ**：电商/金融场景、事务消息、延迟消息`,
    hints: [
      "从解耦、异步、削峰三个核心价值出发",
      "根据吞吐量、延迟、可靠性等需求选择",
      "注意消息丢失和重复消费的问题",
    ],
    frequency: 4,
  },
  {
    id: "sd-005",
    title: "设计一个限流系统",
    category: "系统设计",
    difficulty: "hard",
    tags: ["系统设计", "限流", "算法"],
    content:
      "请设计一个分布式限流系统，支持多种限流算法，并能动态配置限流规则。",
    answer: `**常见限流算法：**\n\n**1. 固定窗口计数器：**\n- 在固定时间窗口内计数\n- 问题：窗口边界可能产生两倍流量\n\n**2. 滑动窗口计数器：**\n- 将窗口细分为小格子\n- 平滑窗口边界问题\n\n**3. 漏桶算法（Leaky Bucket）：**\n- 请求进入桶中，以固定速率流出\n- 匀速处理，无法应对突发流量\n\n**4. 令牌桶算法（Token Bucket）：**\n- 以固定速率向桶中放入令牌\n- 请求需要获取令牌才能通过\n- 允许一定程度的突发流量\n\n**分布式限流实现：**\n\n1. **Redis + Lua 脚本**\n   - 使用 INCR + EXPIRE 实现计数器\n   - 使用 ZSET 实现滑动窗口\n   - Lua 脚本保证原子性\n\n2. **Sentinel（阿里开源）**\n   - 基于滑动窗口\n   - 支持多种限流规则\n\n3. **网关层限流**\n   - Nginx limit_req\n   - Spring Cloud Gateway\n\n**限流维度：**\n- IP 限流\n- 用户 ID 限流\n- 接口限流\n- 全局限流`,
    hints: [
      "令牌桶是最常用的限流算法",
      "分布式环境下需要考虑原子性问题",
      "限流后的降级策略同样重要",
    ],
    frequency: 3,
  },

  // ==================== 编程语言 ====================
  {
    id: "pl-001",
    title: "Java HashMap 原理",
    category: "编程语言",
    difficulty: "medium",
    tags: ["Java", "集合", "哈希表"],
    content:
      "请详细解释 Java HashMap 的实现原理，包括数据结构、put/get 流程、扩容机制以及 JDK 8 的优化。",
    answer: `**数据结构：**\n\nJDK 8 中 HashMap 采用「数组 + 链表 + 红黑树」的结构。\n\n**核心参数：**\n- 默认初始容量：16\n- 负载因子：0.75\n- 树化阈值：8（链表长度 >= 8 时转为红黑树）\n- 退化阈值：6（红黑树节点 <= 6 时退化为链表）\n\n**put 流程：**\n1. 计算 key 的 hash 值：h = key.hashCode() ^ (h >>> 16)\n2. 计算数组下标：index = (n - 1) & hash\n3. 如果桶为空，直接放入\n4. 如果桶不为空：\n   - key 相同则覆盖\n   - 是红黑树则调用红黑树插入\n   - 是链表则尾插法插入，长度 >= 8 则树化\n5. size > capacity * loadFactor 时扩容\n\n**扩容机制：**\n- 容量翻倍：newCapacity = oldCapacity << 1\n- 重新计算每个元素的位置\n- JDK 8 优化：元素位置要么不变，要么移动到原位置 + oldCapacity\n\n**JDK 8 vs JDK 7：**\n- JDK 7：头插法（多线程下可能死循环）\n- JDK 8：尾插法（解决了死循环问题）\n- JDK 8 引入红黑树优化极端情况下的查询效率`,
    hints: [
      "理解 hash 函数的设计（扰动函数）",
      "注意 JDK 7 和 JDK 8 的关键区别",
      "树化是为了解决链表过长导致的查询效率下降",
    ],
    frequency: 5,
  },
  {
    id: "pl-002",
    title: "Python GIL 和多线程",
    category: "编程语言",
    difficulty: "medium",
    tags: ["Python", "GIL", "并发"],
    content:
      "请解释 Python GIL（全局解释器锁）的概念、影响，以及 Python 中的并发方案。",
    answer: `**GIL（Global Interpreter Lock）：**\n\nGIL 是 CPython 中的一个互斥锁，确保同一时刻只有一个线程执行 Python 字节码。\n\n**为什么需要 GIL？**\n- CPython 的内存管理不是线程安全的\n- 引用计数机制需要 GIL 保护\n- 简化了 CPython 的实现\n\n**GIL 的影响：**\n- CPU 密集型任务：多线程无法利用多核，性能甚至不如单线程\n- I/O 密集型任务：GIL 会在 I/O 操作时释放，多线程有效\n\n**Python 并发方案：**\n\n**1. 多线程（threading）：**\n- 适合 I/O 密集型任务\n- 由于 GIL，不适合 CPU 密集型任务\n\n**2. 多进程（multiprocessing）：**\n- 每个 Python 进程有自己的 GIL\n- 可以利用多核 CPU\n- 进程间通信开销大\n\n**3. 协程（asyncio）：**\n- 单线程内实现并发\n- 适合大量 I/O 操作\n- 事件循环驱动\n\n**4. ThreadPoolExecutor + ProcessPoolExecutor：**\n- concurrent.futures 提供的高级接口\n\n**绕过 GIL 的方案：**\n- 使用 C 扩展释放 GIL\n- 使用 Cython\n- 使用 multiprocessing 替代 threading\n- 使用 Jython/PyPy（没有 GIL）`,
    hints: [
      "GIL 只存在于 CPython 中",
      "区分 I/O 密集型和 CPU 密集型任务",
      "协程是 Python 并发的主流方案",
    ],
    frequency: 4,
  },
  {
    id: "pl-003",
    title: "JavaScript 事件循环机制",
    category: "编程语言",
    difficulty: "medium",
    tags: ["JavaScript", "事件循环", "异步"],
    content:
      "请解释 JavaScript 的事件循环（Event Loop）机制，包括宏任务和微任务的区别。",
    answer: `**事件循环机制：**\n\nJavaScript 是单线程语言，通过事件循环实现异步非阻塞。\n\n**执行顺序：**\n1. 执行同步代码（调用栈）\n2. 调用栈清空后，检查微任务队列\n3. 执行所有微任务\n4. 取出一个宏任务执行\n5. 重复步骤 2-4\n\n**宏任务（Macrotask）：**\n- setTimeout / setInterval\n- I/O 操作\n- UI 渲染\n- requestAnimationFrame\n- setImmediate（Node.js）\n\n**微任务（Microtask）：**\n- Promise.then/catch/finally\n- MutationObserver\n- process.nextTick（Node.js，优先级最高）\n\n**示例：**\n\`\`\`javascript\nconsole.log('1');\nsetTimeout(() => console.log('2'), 0);\nPromise.resolve().then(() => console.log('3'));\nconsole.log('4');\n// 输出：1, 4, 3, 2\n\`\`\`\n\n**Node.js 事件循环阶段：**\n1. timers（setTimeout/setInterval）\n2. pending callbacks\n3. idle, prepare\n4. poll（I/O 事件）\n5. check（setImmediate）\n6. close callbacks`,
    hints: [
      "微任务优先级高于宏任务",
      "每次宏任务执行完后都会清空微任务队列",
      "注意 Node.js 和浏览器事件循环的差异",
    ],
    frequency: 5,
  },
  {
    id: "pl-004",
    title: "Go 协程（Goroutine）和调度器",
    category: "编程语言",
    difficulty: "medium",
    tags: ["Go", "协程", "并发"],
    content:
      "请解释 Go 语言中 Goroutine 的原理，以及 GMP 调度模型。",
    answer: `**Goroutine：**\n\nGoroutine 是 Go 语言中的轻量级线程，由 Go 运行时管理。\n\n**特点：**\n- 初始栈大小仅 2KB（可动态增长）\n- 创建和切换开销极小\n- 一个程序可以创建数百万个 Goroutine\n\n**GMP 调度模型：**\n\n- **G（Goroutine）**：用户态的协程\n- **M（Machine）**：操作系统线程\n- **P（Processor）**：逻辑处理器，包含本地运行队列\n\n**调度流程：**\n1. 每个 M 绑定一个 P\n2. P 维护一个本地 Goroutine 队列\n3. M 从 P 的队列中获取 G 执行\n4. 本地队列为空时，从全局队列或其他 P 偷取\n\n**工作窃取（Work Stealing）：**\n- 当 P 的本地队列为空时，从其他 P 的队列中偷取一半的 G\n\n**Hand Off 机制：**\n- 当 M 因系统调用阻塞时，P 会与 M 解绑\n- 将 P 绑定到其他空闲的 M 上继续执行\n- 系统调用完成后，M 尝试获取空闲的 P，否则将 G 放入全局队列\n\n**与线程对比：**\n| 特性 | Goroutine | OS Thread |\n|------|-----------|----------|\n| 创建开销 | ~2KB | ~1MB |\n| 切换开销 | 极小 | 大 |\n| 调度 | 用户态 | 内核态 |`,
    hints: [
      "GMP 模型的核心是 M:N 调度",
      "工作窃取是提高 CPU 利用率的关键",
      "Hand Off 机制解决了系统调用阻塞的问题",
    ],
    frequency: 3,
  },
  {
    id: "pl-005",
    title: "Java 垃圾回收机制",
    category: "编程语言",
    difficulty: "hard",
    tags: ["Java", "GC", "JVM"],
    content:
      "请解释 Java 的垃圾回收机制，包括如何判断对象可回收、常见的垃圾回收算法和垃圾回收器。",
    answer: `**判断对象可回收：**\n\n**1. 引用计数法（已淘汰）：**\n- 无法解决循环引用问题\n\n**2. 可达性分析（当前使用）：**\n- 从 GC Roots 开始向下搜索\n- 不可达的对象即为可回收对象\n- GC Roots 包括：栈帧中的局部变量、静态变量、常量、JNI 引用等\n\n**四种引用类型：**\n- 强引用：Object obj = new Object()（不会被回收）\n- 软引用：SoftReference（内存不足时回收）\n- 弱引用：WeakReference（下次 GC 时回收）\n- 虚引用：PhantomReference（不影响回收，用于跟踪）\n\n**垃圾回收算法：**\n\n1. **标记-清除**：产生内存碎片\n2. **标记-整理**：解决碎片问题，但效率低\n3. **复制算法**：新生代常用，空间换时间\n4. **分代收集**：新生代（复制算法）+ 老年代（标记-整理）\n\n**常见垃圾回收器：**\n\n| 回收器 | 分代 | 算法 | 特点 |\n|--------|------|------|------|\n| Serial | 新生代 | 复制 | 单线程，STW |\n| Parallel Scavenge | 新生代 | 复制 | 多线程，吞吐量优先 |\n| CMS | 老年代 | 标记-清除 | 低延迟 |\n| G1 | 全堆 | 分区 | 可预测停顿 |\n| ZGC | 全堆 | 染色指针 | 超低延迟（<1ms） |`,
    hints: [
      "可达性分析是判断对象可回收的核心方法",
      "分代假说：大部分对象朝生夕灭",
      "G1 是目前最常用的垃圾回收器",
    ],
    frequency: 4,
  },

  // ==================== 前端开发 ====================
  {
    id: "fe-001",
    title: "React Hooks 原理和使用注意事项",
    category: "前端开发",
    difficulty: "medium",
    tags: ["React", "Hooks", "状态管理"],
    content:
      "请解释 React Hooks 的实现原理，常见 Hooks 的使用方式，以及使用时需要注意的事项。",
    answer: `**Hooks 实现原理：**\n\nReact Hooks 基于单向链表存储在 Fiber 节点上。每次渲染时，按调用顺序依次取出对应的 Hook。\n\n**这就是为什么 Hooks 不能在条件语句中使用！**\n\n**常见 Hooks：**\n\n**1. useState：**\n- 返回 [state, setState]\n- setState 是异步的（React 18 自动批处理）\n- 函数式更新：setState(prev => prev + 1)\n\n**2. useEffect：**\n- 副作用处理\n- 依赖数组为空时只在挂载时执行\n- 清理函数在卸载时或依赖变化前执行\n\n**3. useCallback / useMemo：**\n- 性能优化，避免不必要的重渲染\n- useCallback 缓存函数，useMemo 缓存计算结果\n\n**4. useRef：**\n- 获取 DOM 引用\n- 存储不触发重渲染的可变值\n\n**5. useContext：**\n- 跨组件传递数据，避免 prop drilling\n\n**使用注意事项：**\n1. 只在函数组件顶层调用 Hooks\n2. 不能在循环、条件判断或嵌套函数中调用\n3. useEffect 的依赖数组要完整\n4. 自定义 Hook 以 use 开头\n5. 注意闭包陷阱（stale closure）`,
    hints: [
      "理解 Fiber 架构有助于理解 Hooks 的实现",
      "useState 的函数式更新可以解决闭包陷阱",
      "useEffect 的依赖数组是性能和正确性的关键",
    ],
    frequency: 5,
  },
  {
    id: "fe-002",
    title: "浏览器渲染原理与性能优化",
    category: "前端开发",
    difficulty: "hard",
    tags: ["浏览器", "渲染", "性能优化"],
    content:
      "请描述浏览器的渲染流程，以及常见的前端性能优化手段。",
    answer: `**浏览器渲染流程：**\n\n1. **解析 HTML** -> 构建 DOM 树\n2. **解析 CSS** -> 构建 CSSOM 树\n3. **合并** -> 渲染树（Render Tree）\n4. **布局（Layout/Reflow）**：计算每个节点的几何信息\n5. **绘制（Paint）**：将节点绘制到屏幕\n6. **合成（Composite）**：GPU 合成各层\n\n**关键渲染路径优化：**\n\n1. **减少重排（Reflow）：**\n   - 批量修改 DOM\n   - 使用 transform 代替 top/left\n   - 使用 DocumentFragment\n\n2. **减少重绘（Repaint）：**\n   - 避免频繁修改样式\n   - 使用 CSS will-change\n\n3. **合成层优化：**\n   - 使用 transform 和 opacity 触发合成\n   - 避免过多合成层\n\n**其他性能优化：**\n\n- **加载优化**：代码分割、Tree Shaking、懒加载\n- **缓存**：强缓存、协商缓存、Service Worker\n- **网络**：HTTP/2、CDN、预加载（preload/prefetch）\n- **图片**：WebP、懒加载、响应式图片\n- **CSS**：GPU 加速、contain 属性\n- **JavaScript**：防抖节流、Web Worker、requestAnimationFrame\n- **指标**：FCP、LCP、FID、CLS（Core Web Vitals）`,
    hints: [
      "理解渲染流程是性能优化的基础",
      "重排的开销远大于重绘",
      "合成层的操作性能最好",
    ],
    frequency: 4,
  },
  {
    id: "fe-003",
    title: "Virtual DOM 和 Diff 算法",
    category: "前端开发",
    difficulty: "medium",
    tags: ["React", "Vue", "Virtual DOM"],
    content:
      "请解释 Virtual DOM 的工作原理和 Diff 算法的核心思想。",
    answer: `**Virtual DOM：**\n\nVirtual DOM 是真实 DOM 的 JavaScript 对象表示。当状态变化时，先在 Virtual DOM 上进行计算，找出最小变更，然后批量更新真实 DOM。\n\n**Virtual DOM 的优势：**\n1. 跨平台（React Native、SSR）\n2. 批量更新，减少 DOM 操作\n3. 提供声明式编程模型\n\n**Diff 算法核心思想：**\n\n**React Diff 策略（O(n) 复杂度）：**\n\n1. **同层比较**：只比较同一层级的节点，不跨层级\n2. **不同类型节点直接替换**：div -> p，直接替换整个子树\n3. **Key 属性**：通过 key 识别节点，进行移动而非重建\n\n**列表 Diff：**\n- 没有 key：按顺序比较，效率低\n- 有 key：通过 key 匹配旧节点，最小化移动操作\n\n**Vue 3 Diff 优化：**\n- 最长递增子序列算法\n- 静态提升（Static Hoisting）\n- Patch Flag 标记动态节点\n- Block Tree 只追踪动态子节点\n\n**注意：**\n- 列表渲染时必须使用稳定的 key（不要用 index）\n- Virtual DOM 不是比直接操作 DOM 快，而是在大多数场景下提供了更好的开发体验和可维护性`,
    hints: [
      "Diff 算法的三个策略是降低复杂度的关键",
      "key 的作用是帮助 Diff 算法识别节点",
      "Vue 3 的编译时优化进一步提升了性能",
    ],
    frequency: 4,
  },
  {
    id: "fe-004",
    title: "CSS 布局方案对比",
    category: "前端开发",
    difficulty: "easy",
    tags: ["CSS", "布局", "Flexbox", "Grid"],
    content:
      "请比较常见的 CSS 布局方案，包括 Flexbox、Grid 和传统布局方式，并说明各自的适用场景。",
    answer: `**传统布局：**\n\n**1. 正常流（Normal Flow）：**\n- 块级元素垂直排列\n- 行内元素水平排列\n\n**2. 浮动（Float）：**\n- 最初用于图文环绕\n- 曾用于布局（clearfix 清除浮动）\n- 已不推荐用于布局\n\n**3. 定位（Position）：**\n- relative、absolute、fixed、sticky\n- 适合特殊定位需求\n\n**Flexbox（一维布局）：**\n\n适合单行或单列的布局。\n\n\`\`\`css\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 16px;\n}\n\`\`\`\n\n**Grid（二维布局）：**\n\n适合行列同时控制的复杂布局。\n\n\`\`\`css\n.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-template-rows: auto;\n  gap: 16px;\n}\n\`\`\`\n\n**选择建议：**\n- 一维布局（导航栏、卡片列表）：Flexbox\n- 二维布局（仪表盘、图片墙）：Grid\n- 居中对齐：Flexbox（justify-content + align-items）\n- 响应式布局：Grid + auto-fit/auto-fill`,
    hints: [
      "Flexbox 擅长一维，Grid 擅长二维",
      "两者可以嵌套使用",
      "现代布局推荐 Flexbox + Grid 组合",
    ],
    frequency: 3,
  },
  {
    id: "fe-005",
    title: "前端安全防护",
    category: "前端开发",
    difficulty: "medium",
    tags: ["安全", "XSS", "CSRF"],
    content:
      "请描述常见的前端安全攻击方式（XSS、CSRF）及其防御措施。",
    answer: `**XSS（跨站脚本攻击）：**\n\n攻击者向页面注入恶意脚本。\n\n**类型：**\n1. **存储型 XSS**：恶意脚本存储在数据库中，所有用户访问时都会执行\n2. **反射型 XSS**：恶意脚本通过 URL 参数传递\n3. **DOM 型 XSS**：前端 JavaScript 修改 DOM 时注入\n\n**防御措施：**\n- 输入过滤和转义\n- Content Security Policy（CSP）\n- HttpOnly Cookie\n- 使用 textContent 代替 innerHTML\n- DOMPurify 库净化 HTML\n\n**CSRF（跨站请求伪造）：**\n\n攻击者诱导用户在已认证的网站上执行非预期操作。\n\n**防御措施：**\n1. **CSRF Token**：每次请求携带随机 Token\n2. **SameSite Cookie**：\n   - Strict：完全禁止跨站携带\n   - Lax：允许 GET 跨站携带\n   - None：允许跨站携带（需 Secure）\n3. **验证 Referer/Origin**\n4. **双重 Cookie 验证**\n\n**其他安全措施：**\n- HTTPS\n- 输入验证\n- 输出编码\n- 定期安全审计`,
    hints: [
      "XSS 是注入恶意脚本，CSRF 是伪造用户请求",
      "CSP 是防御 XSS 的有效手段",
      "SameSite Cookie 是防御 CSRF 的现代方案",
    ],
    frequency: 4,
  },

  // ==================== 后端开发 ====================
  {
    id: "be-001",
    title: "Spring Boot 自动配置原理",
    category: "后端开发",
    difficulty: "medium",
    tags: ["Spring Boot", "Java", "自动配置"],
    content:
      "请解释 Spring Boot 自动配置（Auto Configuration）的原理和实现方式。",
    answer: `**自动配置原理：**\n\nSpring Boot 自动配置基于 @EnableAutoConfiguration 注解，通过 SPI 机制加载自动配置类。\n\n**核心注解：**\n\n@SpringBootApplication =\n- @SpringBootConfiguration\n- @EnableAutoConfiguration\n- @ComponentScan\n\n**自动配置流程：**\n\n1. @EnableAutoConfiguration 通过 @Import(AutoConfigurationImportSelector.class) 导入\n2. AutoConfigurationImportSelector 使用 SpringFactoriesLoader 加载 META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports（Spring Boot 3.x）或 META-INF/spring.factories（Spring Boot 2.x）\n3. 根据 @Conditional 系列注解决定是否生效\n\n**条件注解：**\n- @ConditionalOnClass：类路径中存在某个类\n- @ConditionalOnMissingBean：容器中不存在某个 Bean\n- @ConditionalOnProperty：配置文件中存在某个属性\n- @ConditionalOnWebApplication：是 Web 应用\n\n**自定义 Starter：**\n1. 创建配置属性类（@ConfigurationProperties）\n2. 创建自动配置类（@AutoConfiguration）\n3. 注册自动配置（META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports）\n4. 创建 starter 模块引入自动配置模块`,
    hints: [
      "SPI（Service Provider Interface）是自动配置的基础",
      "@Conditional 系列注解是条件化配置的关键",
      "自定义 Starter 是理解自动配置的最佳实践",
    ],
    frequency: 4,
  },
  {
    id: "be-002",
    title: "RESTful API 设计规范",
    category: "后端开发",
    difficulty: "easy",
    tags: ["API设计", "REST", "HTTP"],
    content:
      "请描述 RESTful API 的设计规范和最佳实践。",
    answer: `**REST 核心原则：**\n\n1. **资源（Resource）**：使用名词表示资源\n2. **统一接口**：使用 HTTP 方法表示操作\n3. **无状态**：每次请求包含所有必要信息\n4. **分层系统**：客户端不需要知道直接连接的是终端服务器\n\n**HTTP 方法语义：**\n\n| 方法 | 操作 | 幂等 | 安全 |\n|------|------|------|------|\n| GET | 查询 | 是 | 是 |\n| POST | 创建 | 否 | 否 |\n| PUT | 全量更新 | 是 | 否 |\n| PATCH | 部分更新 | 否 | 否 |\n| DELETE | 删除 | 是 | 否 |\n\n**URL 设计规范：**\n\n\`\`\`\nGET    /api/users          # 获取用户列表\nGET    /api/users/123      # 获取单个用户\nPOST   /api/users          # 创建用户\nPUT    /api/users/123      # 全量更新用户\nPATCH  /api/users/123      # 部分更新用户\nDELETE /api/users/123      # 删除用户\n\`\`\`\n\n**最佳实践：**\n- 使用名词复数（/users 而非 /user）\n- 使用 kebab-case（/user-profiles）\n- 版本控制（/api/v1/users）\n- 分页：?page=1&size=20\n- 过滤：?status=active\n- 排序：?sort=created_at:desc\n- 使用合适的 HTTP 状态码\n- 统一错误响应格式`,
    hints: [
      "REST 的核心是资源 + HTTP 方法",
      "URL 中使用名词，操作通过 HTTP 方法表达",
      "幂等性是 API 设计的重要概念",
    ],
    frequency: 4,
  },
  {
    id: "be-003",
    title: "微服务架构设计",
    category: "后端开发",
    difficulty: "hard",
    tags: ["微服务", "架构", "分布式"],
    content:
      "请描述微服务架构的核心概念、优缺点，以及常见的微服务组件。",
    answer: `**微服务核心概念：**\n\n将单体应用拆分为多个小型、独立部署的服务，每个服务围绕一个业务能力构建。\n\n**微服务 vs 单体架构：**\n\n| 特性 | 单体 | 微服务 |\n|------|------|--------|\n| 开发 | 简单 | 复杂 |\n| 部署 | 整体部署 | 独立部署 |\n| 扩展 | 整体扩展 | 按需扩展 |\n| 技术栈 | 统一 | 可异构 |\n| 团队 | 大团队 | 小团队 |\n\n**常见微服务组件：**\n\n1. **服务注册与发现**：Nacos、Consul、Eureka\n2. **配置中心**：Nacos Config、Apollo、Spring Cloud Config\n3. **API 网关**：Spring Cloud Gateway、Kong、Nginx\n4. **负载均衡**：Ribbon、LoadBalancer\n5. **服务间通信**：OpenFeign、gRPC、Dubbo\n6. **熔断降级**：Sentinel、Hystrix、Resilience4j\n7. **分布式链路追踪**：SkyWalking、Zipkin、Jaeger\n8. **分布式事务**：Seata（AT/TCC/Saga）\n9. **消息队列**：Kafka、RabbitMQ、RocketMQ\n\n**微服务拆分原则：**\n- 单一职责\n- 高内聚低耦合\n- 业务边界清晰（DDD 领域驱动设计）\n- 数据库独立\n\n**挑战：**\n- 分布式事务\n- 服务间调用延迟\n- 运维复杂度\n- 数据一致性`,
    hints: [
      "微服务不是银弹，需要根据团队和业务规模选择",
      "服务拆分的粒度是关键问题",
      "CAP 定理和 BASE 理论是分布式系统的基础",
    ],
    frequency: 4,
  },
  {
    id: "be-004",
    title: "JWT 认证机制",
    category: "后端开发",
    difficulty: "medium",
    tags: ["认证", "JWT", "安全"],
    content:
      "请解释 JWT（JSON Web Token）的认证机制，包括其结构、工作流程和安全性考虑。",
    answer: `**JWT 结构：**\n\nJWT 由三部分组成，用 . 分隔：\n\n**Header（头部）：**\n\`\`\`json\n{\n  "alg": "HS256",\n  "typ": "JWT"\n}\n\`\`\`\n\n**Payload（载荷）：**\n\`\`\`json\n{\n  "sub": "1234567890",\n  "name": "张三",\n  "role": "admin",\n  "iat": 1516239022,\n  "exp": 1516242622\n}\n\`\`\`\n\n**Signature（签名）：**\n\`\`\`\nHMACSHA256(\n  base64UrlEncode(header) + "." + base64UrlEncode(payload),\n  secret\n)\n\`\`\`\n\n**认证流程：**\n\n1. 用户提交用户名和密码\n2. 服务器验证成功后生成 JWT\n3. 客户端存储 JWT（localStorage/Cookie）\n4. 后续请求在 Authorization 头中携带 JWT\n5. 服务器验证 JWT 签名和有效期\n\n**JWT vs Session：**\n\n| 特性 | JWT | Session |\n|------|-----|---------|\n| 存储位置 | 客户端 | 服务器 |\n| 扩展性 | 无状态，易扩展 | 有状态，需共享 Session |\n| 安全性 | 无法主动失效 | 可以主动失效 |\n| 适用场景 | 分布式系统 | 单体应用 |\n\n**安全注意事项：**\n- 不要在 Payload 中存储敏感信息（Base64 可解码）\n- 使用 HTTPS\n- 设置合理的过期时间\n- 使用强密钥\n- 考虑使用 Refresh Token 机制`,
    hints: [
      "JWT 的核心优势是无状态",
      "JWT 无法主动失效是其主要缺点",
      "Access Token + Refresh Token 是常见的解决方案",
    ],
    frequency: 4,
  },
  {
    id: "be-005",
    title: "数据库连接池原理和配置",
    category: "后端开发",
    difficulty: "medium",
    tags: ["数据库", "连接池", "性能"],
    content:
      "请解释数据库连接池的原理、常见实现，以及连接池参数的配置建议。",
    answer: `**连接池原理：**\n\n数据库连接的创建和销毁开销很大（TCP 连接、认证等）。连接池预先创建一组连接，应用程序从池中获取连接使用，用完后归还而非关闭。\n\n**核心参数：**\n\n- **initialSize**：初始连接数\n- **minIdle**：最小空闲连接数\n- **maxActive**：最大活跃连接数\n- **maxIdle**：最大空闲连接数\n- **maxWait**：获取连接最大等待时间\n- **validationQuery**：连接有效性检测 SQL\n- **testOnBorrow**：获取时检测\n- **testWhileIdle**：空闲时检测\n- **timeBetweenEvictionRunsMillis**：检测间隔\n- **minEvictableIdleTimeMillis**：连接最小空闲时间\n\n**常见连接池：**\n\n| 连接池 | 特点 |\n|--------|------|\n| HikariCP | 性能最佳，Spring Boot 默认 |\n| Druid | 功能丰富，监控完善 |\n| C3P0 | 老牌，已不推荐 |\n| Tomcat JDBC | Tomcat 内置 |\n\n**HikariCP 配置建议：**\n\`\`\`properties\nspring.datasource.hikari.maximum-pool-size=20\nspring.datasource.hikari.minimum-idle=5\nspring.datasource.hikari.idle-timeout=600000\nspring.datasource.hikari.max-lifetime=1800000\nspring.datasource.hikari.connection-timeout=30000\n\`\`\`\n\n**连接池大小公式（经验）：**\nconnections = ((core_count * 2) + effective_spindle_count)`,
    hints: [
      "连接池的核心是复用连接，减少创建/销毁开销",
      "连接数不是越大越好，过多的连接会增加数据库压力",
      "HikariCP 是目前性能最好的连接池",
    ],
    frequency: 3,
  },
];
