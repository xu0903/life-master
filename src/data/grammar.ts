import type { RawQuestion } from './reading'

/** 文法單元：重點講解 + 例句 + 5 題小測驗。tag 對應閱讀弱點分析的考點，用來推薦單元。 */
export interface GrammarUnit {
  id: string
  title: string
  tag: 'pos' | 'verb' | 'prep' | 'conj' | 'pron' | 'vocab'
  /** 一句話說明這個單元在考什麼 */
  intro: string
  points: { rule: string; detail: string }[]
  examples: [string, string][]
  /** 考試小技巧 */
  tip: string
  quiz: RawQuestion[]
}

export const GRAMMAR_PROGRESS_KEY = 'lifemaster.grammarProgress'

// 原創教材，以多益 Part 5、6 常考文法為主。選項第一個是正確答案，出題時會打散。
export const GRAMMAR_UNITS: GrammarUnit[] = [
  {
    id: 'g01',
    title: '詞性判斷：名詞、形容詞、副詞放哪裡',
    tag: 'pos',
    intro: '空格前後的字決定該填哪種詞性，是 Part 5 出現最多的題型。',
    points: [
      { rule: '冠詞 / 所有格 / 形容詞後面 → 名詞', detail: 'the ___、their ___、a successful ___ 後面都要接名詞。' },
      { rule: 'be 動詞後、名詞前 → 形容詞', detail: 'is ___ 表示狀態；a ___ product 修飾名詞。' },
      { rule: '修飾動詞、形容詞、整個句子 → 副詞', detail: 'increased ___、___ accurate、___, the meeting was canceled.' },
      { rule: '看字尾判斷詞性', detail: '-tion / -ment / -ness / -ity 多為名詞；-ive / -ful / -able / -ous 多為形容詞；-ly 多為副詞。' },
    ],
    examples: [
      ['The manager made a quick decision.', '經理迅速做了決定。（形容詞 quick 修飾名詞 decision）'],
      ['Sales increased significantly last year.', '去年銷售大幅增加。（副詞修飾動詞 increased）'],
      ['Customer satisfaction is our priority.', '顧客滿意是我們的首要目標。（名詞當主詞）'],
    ],
    tip: '先看空格前後，不必讀懂整句；四個選項是同一個字的不同詞性時，幾秒就能作答。',
    quiz: [
      { q: 'The new policy will take effect ------- next Monday.', o: ['immediately', 'immediate', 'immediacy', 'more immediate'], ex: '修飾動詞片語 take effect 用副詞 immediately。' },
      { q: 'Ms. Lee gave a very ------- presentation at the conference.', o: ['informative', 'inform', 'information', 'informatively'], ex: 'very + 形容詞 + 名詞：informative presentation。' },
      { q: 'Please send your ------- to the HR department by Friday.', o: ['application', 'apply', 'applicable', 'applied'], ex: '所有格 your 後面接名詞 application。' },
      { q: 'The instructions were written ------- so that everyone could understand them.', o: ['clearly', 'clear', 'clarity', 'clearest'], ex: '修飾動詞 written 用副詞 clearly。' },
      { q: 'The company is known for its ------- customer service.', o: ['excellent', 'excel', 'excellence', 'excellently'], ex: '修飾名詞 customer service 用形容詞 excellent。' },
    ],
  },
  {
    id: 'g02',
    title: '比較級與最高級',
    tag: 'pos',
    intro: '看到 than 就用比較級，看到 the + 範圍（of all、in the company）就用最高級。',
    points: [
      { rule: '比較級：-er / more + 原級 + than', detail: 'faster than、more efficient than。' },
      { rule: '最高級：the -est / the most + 原級', detail: 'the largest of all、the most reliable in the market。' },
      { rule: '加強比較級用 much / far / even / still', detail: 'much cheaper，不能用 very cheaper。' },
      { rule: '同等比較：as + 原級 + as', detail: 'as quickly as possible。' },
    ],
    examples: [
      ['This laptop is much lighter than the old model.', '這台筆電比舊款輕很多。'],
      ['She is the most experienced member of the team.', '她是團隊中經驗最豐富的成員。'],
      ['Please reply as soon as possible.', '請盡快回覆。'],
    ],
    tip: '先找 than、as…as、the…of / in 這些記號，再決定用原級、比較級還是最高級。',
    quiz: [
      { q: 'The new printer is ------- than the one we bought last year.', o: ['faster', 'fast', 'fastest', 'more fastly'], ex: '有 than，用比較級 faster。' },
      { q: 'This is the ------- hotel in the city.', o: ['most expensive', 'more expensive', 'expensive', 'expensively'], ex: 'the + 最高級 + 範圍（in the city）。' },
      { q: 'Our sales this quarter were ------- higher than expected.', o: ['much', 'very', 'so', 'more'], ex: '加強比較級用 much，不能用 very。' },
      { q: 'Please complete the survey as ------- as you can.', o: ['quickly', 'quick', 'quicker', 'quickest'], ex: 'as + 原級 + as；修飾動詞 complete 用副詞 quickly。' },
      { q: 'Of all the candidates, Mr. Park is the ------- qualified.', o: ['most', 'more', 'much', 'very'], ex: 'Of all… 是最高級的範圍：the most qualified。' },
    ],
  },
  {
    id: 'g03',
    title: '現在簡單式與現在進行式',
    tag: 'verb',
    intro: '習慣、事實、時刻表用現在簡單式；正在進行、暫時的狀態用現在進行式。',
    points: [
      { rule: '現在簡單式：習慣、事實、時刻表', detail: 'The store opens at 9. / She usually takes the train.' },
      { rule: '第三人稱單數動詞加 -s', detail: 'The manager reviews…、Each employee receives…' },
      { rule: '現在進行式：now、currently、at the moment', detail: 'We are currently updating the system.' },
      { rule: '狀態動詞通常不用進行式', detail: 'know、belong、need、own 等。' },
    ],
    examples: [
      ['The train leaves at 7:30 every morning.', '火車每天早上 7:30 出發。'],
      ['Our team is currently working on a new design.', '我們團隊目前正在做新設計。'],
    ],
    tip: 'every、usually、always → 現在簡單式；currently、now、at the moment → 現在進行式。',
    quiz: [
      { q: 'The museum ------- at 10 A.M. every day.', o: ['opens', 'is opening', 'open', 'opened'], ex: '每天的固定時刻 → 現在簡單式，主詞單數加 -s。' },
      { q: 'We are ------- reviewing the applications.', o: ['currently', 'usually', 'yesterday', 'ago'], ex: '現在進行式搭配 currently。' },
      { q: 'Mr. Tan usually ------- his clients in the morning.', o: ['calls', 'is calling', 'call', 'calling'], ex: 'usually 表習慣，用現在簡單式。' },
      { q: 'Look! The technicians ------- the new equipment right now.', o: ['are installing', 'install', 'installs', 'installed'], ex: 'right now → 現在進行式。' },
      { q: 'This laptop ------- to the IT department.', o: ['belongs', 'is belonging', 'belong', 'belonging'], ex: 'belong 是狀態動詞，不用進行式。' },
    ],
  },
  {
    id: 'g04',
    title: '過去式與現在完成式',
    tag: 'verb',
    intro: '有明確過去時間用過去式；強調「到現在為止」或搭配 since / for 用現在完成式。',
    points: [
      { rule: '過去式：yesterday、last week、ago、in 2020', detail: 'The meeting ended an hour ago.' },
      { rule: '現在完成式：have / has + 過去分詞', detail: 'She has worked here since 2018.' },
      { rule: 'since + 時間點、for + 一段時間', detail: 'since March / for three years。' },
      { rule: 'already、yet、recently、so far 常配完成式', detail: 'We have already shipped your order.' },
    ],
    examples: [
      ['I sent the report last Friday.', '我上週五寄出了報告。'],
      ['We have received over 200 applications so far.', '到目前為止我們已收到超過 200 份申請。'],
    ],
    tip: '句子裡有過去時間點（ago、last、in + 過去年份）就不能用現在完成式。',
    quiz: [
      { q: 'Ms. Kim ------- the company three years ago.', o: ['joined', 'has joined', 'joins', 'has been joining'], ex: 'three years ago 是明確過去時間，用過去式。' },
      { q: 'Mr. Ruiz has worked here ------- 2015.', o: ['since', 'for', 'during', 'from'], ex: '現在完成式 + since + 時間點。' },
      { q: 'We ------- already finished the first phase of the project.', o: ['have', 'had been', 'are', 'did'], ex: 'already 搭配現在完成式 have finished。' },
      { q: 'The price of fuel ------- steadily over the past year.', o: ['has risen', 'rose yesterday', 'rises', 'is rising up'], ex: 'over the past year 表示持續到現在，用現在完成式。' },
      { q: 'The shipment ------- last Tuesday.', o: ['arrived', 'has arrived', 'arrives', 'has been arriving'], ex: 'last Tuesday 是過去時間點，用過去式。' },
    ],
  },
  {
    id: 'g05',
    title: '未來式、未來完成式與時間子句',
    tag: 'verb',
    intro: '時間 / 條件子句（when、if、as soon as）裡用現在式表示未來，是常考陷阱。',
    points: [
      { rule: '未來式：will / be going to', detail: 'The new branch will open next month.' },
      { rule: '時間、條件子句用現在式代替未來式', detail: 'When the client arrives, I will call you.（不用 will arrive）' },
      { rule: '未來完成式：by + 未來時間點', detail: 'By next June, she will have worked here for ten years.' },
      { rule: '已排定的計畫可用現在進行式', detail: 'We are meeting the client tomorrow.' },
    ],
    examples: [
      ['As soon as the order arrives, we will contact you.', '貨一到我們就會聯絡您。'],
      ['By the end of the year, we will have opened five stores.', '到年底我們將已開五家店。'],
    ],
    tip: 'when / if / before / after / as soon as 後面看到 will，八成是錯的選項。',
    quiz: [
      { q: 'Please call me as soon as the package -------.', o: ['arrives', 'will arrive', 'arrived', 'arriving'], ex: '時間子句用現在式表未來。' },
      { q: 'By the end of this month, we ------- all the interviews.', o: ['will have completed', 'complete', 'completed', 'have completed'], ex: 'By + 未來時間點 → 未來完成式。' },
      { q: 'If it ------- tomorrow, the outdoor event will be moved inside.', o: ['rains', 'will rain', 'rained', 'raining'], ex: '條件子句用現在式。' },
      { q: 'The new software ------- available to all staff next week.', o: ['will be', 'was', 'has been', 'being'], ex: 'next week → 未來式。' },
      { q: 'Before the meeting -------, please read the attached report.', o: ['begins', 'will begin', 'began', 'has begun'], ex: 'before 引導時間子句，用現在式。' },
    ],
  },
  {
    id: 'g06',
    title: '被動語態',
    tag: 'verb',
    intro: '主詞是「被」做動作的對象時，用 be + 過去分詞。',
    points: [
      { rule: '基本形：be + 過去分詞', detail: 'The report was submitted yesterday.' },
      { rule: '各種時態的被動', detail: 'is being repaired / has been approved / will be delivered。' },
      { rule: '後面沒有受詞是被動的線索', detail: 'The meeting was postponed.（postpone 後面沒受詞）' },
      { rule: '助動詞 + be + 過去分詞', detail: 'must be signed、should be returned。' },
    ],
    examples: [
      ['All orders are shipped within two days.', '所有訂單都在兩天內出貨。'],
      ['The conference room is being cleaned right now.', '會議室現在正在打掃。'],
    ],
    tip: '先問「主詞自己做這個動作嗎？」報告、產品、會議這類物品當主詞時，通常是被動。',
    quiz: [
      { q: 'The new policy ------- by the board last week.', o: ['was approved', 'approved', 'has approving', 'approves'], ex: '政策是被批准，過去被動 was approved。' },
      { q: 'All forms must ------- by Friday.', o: ['be submitted', 'submit', 'submitting', 'have submit'], ex: '助動詞 + be + 過去分詞。' },
      { q: 'The elevator is currently ------- repaired.', o: ['being', 'been', 'be', 'to be'], ex: '現在進行被動：is being + 過去分詞。' },
      { q: 'Your order has ------- and will arrive tomorrow.', o: ['been shipped', 'shipped', 'shipping', 'be shipped'], ex: '訂單被寄出：has been shipped。' },
      { q: 'The winners ------- at the end of the ceremony.', o: ['will be announced', 'will announce', 'announce', 'announcing'], ex: '得獎者是被宣布的，未來被動。' },
    ],
  },
  {
    id: 'g07',
    title: '分詞當形容詞：-ing 和 -ed',
    tag: 'verb',
    intro: '-ing 表主動、「令人…的」；-ed 表被動、「感到…的」。',
    points: [
      { rule: '-ing：主動、令人…的', detail: 'an exciting project（專案令人興奮）、the rising cost。' },
      { rule: '-ed：被動、感到…的', detail: 'excited employees（員工感到興奮）、a revised schedule。' },
      { rule: '分詞放在名詞後面修飾', detail: 'products made in Japan、customers waiting in line。' },
      { rule: '常考搭配', detail: 'attached file、enclosed form、qualified candidate、existing customers。' },
    ],
    examples: [
      ['Please review the attached document.', '請看附件。'],
      ['Customers waiting in line will receive a coupon.', '排隊的顧客會拿到折價券。'],
    ],
    tip: '修飾的名詞是「做動作的」用 -ing，「被做動作的」用 -ed。',
    quiz: [
      { q: 'Please fill out the ------- form and return it to us.', o: ['enclosed', 'enclosing', 'enclose', 'enclosure'], ex: '表格是被附上的：enclosed form。' },
      { q: 'The results of the survey were very -------.', o: ['encouraging', 'encouraged', 'encourage', 'encouragement'], ex: '結果「令人振奮」，用 -ing。' },
      { q: 'Orders ------- after 3 P.M. will be shipped the next day.', o: ['received', 'receiving', 'receive', 'receives'], ex: '訂單是被收到的，用過去分詞後位修飾。' },
      { q: 'We are looking for ------- candidates with sales experience.', o: ['qualified', 'qualifying', 'qualify', 'qualification'], ex: 'qualified candidates = 符合資格的應徵者。' },
      { q: 'The staff were ------- with the new office design.', o: ['impressed', 'impressing', 'impress', 'impressive'], ex: '人「感到」佩服用 -ed。' },
    ],
  },
  {
    id: 'g08',
    title: '不定詞與動名詞',
    tag: 'verb',
    intro: '有些動詞後面接 to V，有些接 V-ing；介系詞後面一律接 V-ing。',
    points: [
      { rule: '接 to V：want、plan、decide、hope、agree、expect、need', detail: 'We plan to expand overseas.' },
      { rule: '接 V-ing：enjoy、avoid、consider、finish、suggest、mind', detail: 'He suggested postponing the meeting.' },
      { rule: '介系詞後面接 V-ing', detail: 'interested in joining、responsible for managing。' },
      { rule: 'to 是介系詞的片語', detail: 'look forward to meeting、be committed to providing、be used to working。' },
    ],
    examples: [
      ['We look forward to working with you.', '我們期待與您合作。'],
      ['She decided to accept the offer.', '她決定接受這份工作。'],
    ],
    tip: 'look forward to、be committed to、be dedicated to 的 to 是介系詞，後面接 V-ing，常被拿來設陷阱。',
    quiz: [
      { q: 'We are considering ------- a new branch in Osaka.', o: ['opening', 'to open', 'open', 'opened'], ex: 'consider + V-ing。' },
      { q: 'The company plans ------- 50 new employees this year.', o: ['to hire', 'hiring', 'hire', 'hired'], ex: 'plan + to V。' },
      { q: 'I look forward to ------- from you soon.', o: ['hearing', 'hear', 'heard', 'be hearing'], ex: 'look forward to 的 to 是介系詞，接 V-ing。' },
      { q: 'Thank you for ------- the time to complete our survey.', o: ['taking', 'take', 'to take', 'took'], ex: '介系詞 for 後接動名詞。' },
      { q: 'Employees should avoid ------- personal calls during work hours.', o: ['making', 'to make', 'make', 'made'], ex: 'avoid + V-ing。' },
    ],
  },
  {
    id: 'g09',
    title: '假設語氣與倒裝的條件句',
    tag: 'verb',
    intro: '和現在 / 過去事實相反的假設，以及省略 if 的倒裝句（Should you…）是高分題常客。',
    points: [
      { rule: '與現在事實相反：If + 過去式, would + V', detail: 'If we had more staff, we would finish faster.' },
      { rule: '與過去事實相反：If + had p.p., would have p.p.', detail: 'If I had known, I would have called you.' },
      { rule: '省略 if 的倒裝', detail: 'Should you have any questions = If you should have any questions。' },
      { rule: 'Had / Were 開頭也可能是倒裝', detail: 'Had we left earlier, we would have caught the train.' },
    ],
    examples: [
      ['Should you need further assistance, please contact us.', '如需進一步協助，請與我們聯絡。'],
      ['If the weather had been better, the event would have been held outdoors.', '如果天氣好一點，活動就會在戶外舉行了。'],
    ],
    tip: '句首空格、後面是「主詞 + 原形動詞」，答案通常是 Should。',
    quiz: [
      { q: '------- you have any questions, please call our help desk.', o: ['Should', 'Would', 'Unless', 'Whether'], ex: 'Should you have… = If you should have…。' },
      { q: 'If we ------- more time, we would test the product again.', o: ['had', 'have', 'will have', 'having'], ex: '與現在事實相反，if 子句用過去式。' },
      { q: 'If the shipment had arrived on time, we ------- the order.', o: ['would have completed', 'will complete', 'completed', 'complete'], ex: '與過去事實相反：would have + p.p.。' },
      { q: '------- I known about the delay, I would have changed my flight.', o: ['Had', 'Have', 'Should', 'Did'], ex: 'Had I known = If I had known。' },
      { q: 'If I ------- you, I would accept the offer.', o: ['were', 'am', 'will be', 'be'], ex: '與現在事實相反的 be 動詞用 were。' },
    ],
  },
  {
    id: 'g10',
    title: '主詞與動詞一致',
    tag: 'verb',
    intro: '找到真正的主詞，再決定動詞要用單數還是複數。',
    points: [
      { rule: '介系詞片語不影響主詞', detail: 'The list of names is on the desk.（主詞是 list）' },
      { rule: 'Each / Every / Either / Neither + 單數動詞', detail: 'Each of the employees has a locker.' },
      { rule: 'The number of + 單數；A number of + 複數', detail: 'The number of visitors is rising. / A number of visitors are waiting.' },
      { rule: '關係子句的動詞跟著先行詞', detail: 'customers who live nearby / a client who lives nearby。' },
    ],
    examples: [
      ['The quality of our products is improving.', '我們產品的品質正在提升。'],
      ['A number of employees have asked for flexible hours.', '許多員工要求彈性工時。'],
    ],
    tip: '把主詞後面的介系詞片語、關係子句先遮起來，主詞就很明顯了。',
    quiz: [
      { q: 'The cost of the new machines ------- higher than expected.', o: ['was', 'were', 'are', 'have been'], ex: '主詞是 cost（單數），of… 只是修飾。' },
      { q: 'Each of the participants ------- a name tag.', o: ['receives', 'receive', 'are receiving', 'have received'], ex: 'Each of + 複數名詞，動詞用單數。' },
      { q: 'A number of customers ------- complained about the delay.', o: ['have', 'has', 'is', 'was'], ex: 'A number of + 複數名詞 + 複數動詞。' },
      { q: 'The number of applicants ------- increased this year.', o: ['has', 'have', 'are', 'were'], ex: 'The number of… 主詞是 number，用單數。' },
      { q: 'Employees who ------- near the office often walk to work.', o: ['live', 'lives', 'living', 'is living'], ex: '關係子句動詞跟著先行詞 employees（複數）。' },
    ],
  },
  {
    id: 'g11',
    title: '時間介系詞：at、on、in、by、until、for、since',
    tag: 'prep',
    intro: '時間介系詞幾乎每次都考，重點是分清楚時間點、期間與期限。',
    points: [
      { rule: 'at 時刻、on 日期 / 星期、in 月份 / 年 / 季節', detail: 'at 3 P.M.、on Monday、on May 5、in June、in 2027。' },
      { rule: 'by：在…之前（完成）', detail: 'Submit the report by Friday.' },
      { rule: 'until：持續到…為止', detail: 'The store is open until 9 P.M.' },
      { rule: 'for + 一段時間、since + 時間點、within + 期限內', detail: 'for two weeks、since 2019、within 24 hours。' },
    ],
    examples: [
      ['Please reply by the end of the week.', '請在本週結束前回覆。'],
      ['The road will be closed until Thursday.', '這條路會封到星期四。'],
    ],
    tip: 'by 用在「一次性完成」的動作（submit、finish），until 用在「持續」的動作或狀態（stay、remain open）。',
    quiz: [
      { q: 'The seminar will begin ------- 9:30 A.M.', o: ['at', 'on', 'in', 'by'], ex: '時刻用 at。' },
      { q: 'All expense reports must be submitted ------- the 25th of the month.', o: ['by', 'until', 'since', 'for'], ex: '一次性的期限用 by。' },
      { q: 'The pool will remain closed ------- next Monday.', o: ['until', 'by', 'at', 'since'], ex: '持續的狀態用 until。' },
      { q: 'We will respond to your inquiry ------- 48 hours.', o: ['within', 'since', 'at', 'on'], ex: 'within + 期限 = 在…之內。' },
      { q: 'The new branch opened ------- March.', o: ['in', 'on', 'at', 'for'], ex: '月份用 in。' },
    ],
  },
  {
    id: 'g12',
    title: '地點介系詞與常考介系詞片語',
    tag: 'prep',
    intro: '地點介系詞與固定搭配，要靠例句記，不靠翻譯猜。',
    points: [
      { rule: 'in 範圍內、on 表面 / 樓層、at 特定地點', detail: 'in the office、on the third floor、at the front desk。' },
      { rule: 'across from 對面、next to 旁邊、throughout 遍布', detail: 'across from the bank、throughout the building。' },
      { rule: '常考片語', detail: 'ahead of schedule、in charge of、on behalf of、in addition to、according to。' },
      { rule: 'due to / because of / owing to + 名詞', detail: 'due to bad weather。' },
    ],
    examples: [
      ['The cafeteria is on the second floor.', '員工餐廳在二樓。'],
      ['Ms. Diaz is in charge of the marketing team.', 'Diaz 女士負責行銷團隊。'],
    ],
    tip: '片語題直接背整組搭配，例如「代表某人」只會是 on behalf of。',
    quiz: [
      { q: 'The parking garage is located ------- from the hotel.', o: ['across', 'among', 'between', 'into'], ex: 'across from = 在…對面。' },
      { q: 'Mr. Chen is ------- charge of the new project.', o: ['in', 'on', 'at', 'for'], ex: 'in charge of = 負責。' },
      { q: 'The flight was canceled ------- the heavy snow.', o: ['due to', 'because', 'although', 'so that'], ex: '後面是名詞，用 due to。' },
      { q: 'I am writing ------- behalf of my manager.', o: ['on', 'in', 'at', 'by'], ex: 'on behalf of = 代表。' },
      { q: 'Recycling bins are placed ------- the building.', o: ['throughout', 'during', 'beside of', 'along with'], ex: 'throughout the building = 整棟大樓各處。' },
    ],
  },
  {
    id: 'g13',
    title: '對等連接詞與相關連接詞',
    tag: 'conj',
    intro: 'both…and、either…or、neither…nor、not only…but also 必須成對出現。',
    points: [
      { rule: 'and / but / or / so 連接對等的字或子句', detail: 'The room is small but comfortable.' },
      { rule: 'both A and B', detail: 'both online and in stores。' },
      { rule: 'either A or B、neither A nor B', detail: 'either by phone or by e-mail、neither cheap nor reliable。' },
      { rule: 'not only A but (also) B', detail: 'not only fast but also accurate。' },
    ],
    examples: [
      ['You can pay either by credit card or in cash.', '你可以刷卡或付現。'],
      ['The new model is not only lighter but also cheaper.', '新款不但更輕，也更便宜。'],
    ],
    tip: '先看句子裡有沒有 both、either、neither、not only，找到就能直接選出另一半。',
    quiz: [
      { q: 'Tickets can be purchased ------- online or at the box office.', o: ['either', 'neither', 'both', 'not only'], ex: 'either A or B。' },
      { q: 'The software is ------- easy to use and affordable.', o: ['both', 'either', 'neither', 'whether'], ex: 'both A and B。' },
      { q: 'Neither the manager ------- her assistant was available.', o: ['nor', 'or', 'and', 'but'], ex: 'neither A nor B。' },
      { q: 'The hotel offers not only free Wi-Fi ------- free breakfast.', o: ['but also', 'and also', 'or', 'as well'], ex: 'not only A but also B。' },
      { q: 'The office is small, ------- it is very well organized.', o: ['but', 'or', 'so', 'nor'], ex: '前後語意相反，用 but。' },
    ],
  },
  {
    id: 'g14',
    title: '連接詞還是介系詞？although / despite、because / because of',
    tag: 'conj',
    intro: '空格後面是子句（有主詞動詞）用連接詞，是名詞片語用介系詞。',
    points: [
      { rule: '讓步：although / though / even though + 子句；despite / in spite of + 名詞', detail: 'Although it rained… / Despite the rain…' },
      { rule: '原因：because / since + 子句；because of / due to + 名詞', detail: 'because the flight was late / because of the delay。' },
      { rule: '時間：while + 子句；during + 名詞', detail: 'while I was traveling / during the trip。' },
      { rule: '條件：unless = if not；once、as long as、provided that', detail: 'Unless you register, you cannot attend.' },
    ],
    examples: [
      ['Despite the high price, the product sold well.', '儘管價格高，產品賣得很好。'],
      ['While the CEO was abroad, Ms. Park managed the office.', '執行長出國期間，由 Park 女士管理辦公室。'],
    ],
    tip: '四個選項同時有連接詞和介系詞時，只要看空格後有沒有動詞就能刪掉一半。',
    quiz: [
      { q: '------- the bad weather, the concert started on time.', o: ['Despite', 'Although', 'Because', 'Unless'], ex: '後面是名詞片語，用介系詞 Despite。' },
      { q: '------- the store was crowded, the staff remained calm.', o: ['Although', 'Despite', 'In spite of', 'Because of'], ex: '後面是子句，用連接詞 Although。' },
      { q: 'The meeting was postponed ------- the director was ill.', o: ['because', 'because of', 'due to', 'despite'], ex: '後面是子句，用 because。' },
      { q: 'Please do not use your phone ------- the presentation.', o: ['during', 'while', 'when', 'as'], ex: '後面是名詞，用 during。' },
      { q: 'You cannot enter the building ------- you show your ID.', o: ['unless', 'despite', 'during', 'because of'], ex: 'unless = if not，後接子句。' },
    ],
  },
  {
    id: 'g15',
    title: '連接副詞：however、therefore、moreover',
    tag: 'conj',
    intro: '連接副詞不能直接連接兩個子句，常出現在分號或句號之後，Part 6 很愛考。',
    points: [
      { rule: '轉折：however、nevertheless', detail: 'The price is high; however, the quality is excellent.' },
      { rule: '因果：therefore、as a result、consequently', detail: 'Sales fell; therefore, we cut costs.' },
      { rule: '補充：moreover、in addition、furthermore', detail: 'In addition, all members get free parking.' },
      { rule: '舉例 / 替代：for example、instead、otherwise', detail: 'Please register early; otherwise, you may not get a seat.' },
    ],
    examples: [
      ['The project was over budget. However, it was completed on time.', '專案超出預算，不過準時完成了。'],
      ['Please arrive early; otherwise, you may miss the opening speech.', '請早點到，否則可能會錯過開幕演講。'],
    ],
    tip: '判斷前後兩句的關係（相反、因果、補充）就能選出答案，Part 6 的句子插入題也常用這招。',
    quiz: [
      { q: 'The product is expensive; -------, it is very popular.', o: ['however', 'therefore', 'moreover', 'for example'], ex: '前後語意相反。' },
      { q: 'The road is closed; -------, the bus will take a different route.', o: ['therefore', 'however', 'instead of', 'although'], ex: '前因後果。' },
      { q: 'The hotel has a pool. -------, it offers a free airport shuttle.', o: ['In addition', 'However', 'Otherwise', 'Instead'], ex: '補充另一個優點。' },
      { q: 'Please confirm your attendance by Friday; -------, your seat may be given to someone else.', o: ['otherwise', 'moreover', 'therefore', 'for instance'], ex: '否則：otherwise。' },
      { q: 'Sales dropped sharply last quarter. -------, the company reduced its advertising budget.', o: ['As a result', 'However', 'For example', 'In contrast'], ex: '前因後果：As a result。' },
    ],
  },
  {
    id: 'g16',
    title: '人稱代名詞與反身代名詞',
    tag: 'pron',
    intro: '依位置選主格、受格、所有格或反身代名詞。',
    points: [
      { rule: '主格當主詞、受格放動詞或介系詞後', detail: 'She called me. / Send it to him.' },
      { rule: '所有格 + 名詞；所有格代名詞單獨使用', detail: 'their report / The report is theirs.' },
      { rule: '反身代名詞：主詞與受詞同一人，或強調', detail: 'He introduced himself. / I checked it myself.' },
      { rule: 'by + 反身代名詞 = 獨自', detail: 'She finished the project by herself.' },
    ],
    examples: [
      ['Ms. Lopez presented her findings to the board.', 'Lopez 女士向董事會報告她的研究結果。'],
      ['The manager reviewed the contract himself.', '經理親自審閱了合約。'],
    ],
    tip: '空格後面接名詞 → 所有格；空格在句尾或介系詞後 → 受格或反身。',
    quiz: [
      { q: 'Please give ------- your feedback by Thursday.', o: ['us', 'we', 'our', 'ours'], ex: '動詞 give 後面接受格 us。' },
      { q: 'The employees submitted ------- reports on time.', o: ['their', 'them', 'theirs', 'themselves'], ex: '名詞 reports 前用所有格。' },
      { q: 'Mr. Kato designed the new logo by -------.', o: ['himself', 'him', 'his', 'he'], ex: 'by himself = 獨自。' },
      { q: 'This desk is mine, and that one is -------.', o: ['yours', 'your', 'you', 'yourself'], ex: '單獨使用的所有格代名詞 yours。' },
      { q: '------- will contact you after reviewing your application.', o: ['We', 'Us', 'Our', 'Ours'], ex: '主詞用主格 We。' },
    ],
  },
  {
    id: 'g17',
    title: '關係代名詞：who、which、that、whose',
    tag: 'pron',
    intro: '先看先行詞是人還是物，再看關係代名詞在子句中當主詞、受詞還是所有格。',
    points: [
      { rule: '人 → who（主格）/ whom（受格）', detail: 'the woman who called / the client whom we met。' },
      { rule: '物 → which / that', detail: 'the report that you requested。' },
      { rule: 'whose + 名詞（所有格）', detail: 'a company whose products are popular。' },
      { rule: '逗號後（非限定）不能用 that', detail: 'The report, which was released today, …' },
    ],
    examples: [
      ['Applicants who have sales experience are preferred.', '有業務經驗的應徵者優先。'],
      ['We chose a supplier whose prices were the lowest.', '我們選了價格最低的供應商。'],
    ],
    tip: '空格後面直接接名詞，而且是「誰的」關係，答案就是 whose。',
    quiz: [
      { q: 'The engineer ------- designed this system will give a demonstration.', o: ['who', 'which', 'whose', 'whom'], ex: '先行詞是人，在子句中當主詞。' },
      { q: 'The laptop ------- I ordered last week has not arrived.', o: ['that', 'who', 'whose', 'what'], ex: '先行詞是物，當受詞，用 that / which。' },
      { q: 'We hired a consultant ------- experience includes banking.', o: ['whose', 'who', 'which', 'whom'], ex: '後面接名詞 experience，表所有格。' },
      { q: 'Our new office, ------- opened in May, is near the station.', o: ['which', 'that', 'who', 'what'], ex: '逗號後的非限定子句不能用 that。' },
      { q: 'The client with ------- we met yesterday signed the contract.', o: ['whom', 'who', 'which', 'whose'], ex: '介系詞後的人用受格 whom。' },
    ],
  },
  {
    id: 'g18',
    title: '名詞子句與 what',
    tag: 'pron',
    intro: 'what = the thing(s) that，本身就包含先行詞；whether / if 表示「是否」。',
    points: [
      { rule: 'what 引導名詞子句', detail: 'What we need is more time.' },
      { rule: 'that 引導的名詞子句當受詞', detail: 'The manager said that the meeting was canceled.' },
      { rule: 'whether / if = 是否', detail: 'We are not sure whether the order has shipped.' },
      { rule: '疑問詞子句用直述句語序', detail: 'Do you know where the station is?（不是 where is the station）' },
    ],
    examples: [
      ['What customers want is fast delivery.', '顧客想要的是快速出貨。'],
      ['Please let me know whether you can attend.', '請告訴我你是否能出席。'],
    ],
    tip: '空格前面沒有先行詞、後面子句缺東西，答案通常是 what。',
    quiz: [
      { q: '------- the company needs is a clear marketing plan.', o: ['What', 'That', 'Which', 'Whether'], ex: 'what = the thing that，當主詞子句。' },
      { q: 'We have not decided ------- to hold the event indoors or outdoors.', o: ['whether', 'what', 'that', 'which'], ex: 'whether… or… = 是否。' },
      { q: 'Could you tell me where ------- ?', o: ['the conference room is', 'is the conference room', 'the conference room', 'is it the conference room'], ex: '間接問句用直述句語序。' },
      { q: 'The report shows ------- sales increased by 10 percent.', o: ['that', 'what', 'which', 'who'], ex: '子句完整，當動詞 shows 的受詞，用 that。' },
      { q: 'Please read carefully ------- is written in the contract.', o: ['what', 'that', 'which', 'whether'], ex: '前面沒有先行詞，子句缺主詞，用 what。' },
    ],
  },
  {
    id: 'g19',
    title: '常見的動詞與名詞搭配',
    tag: 'vocab',
    intro: '多益單字題很多是在考「固定搭配」，記整組比記單字有效。',
    points: [
      { rule: 'make 搭配', detail: 'make a decision、make a reservation、make progress、make an effort。' },
      { rule: 'take 搭配', detail: 'take effect、take place、take advantage of、take part in。' },
      { rule: 'meet / reach 搭配', detail: 'meet a deadline、meet requirements、reach an agreement。' },
      { rule: '其他常考', detail: 'place an order、submit a proposal、conduct a survey、raise funds。' },
    ],
    examples: [
      ['The new rules will take effect next month.', '新規定下個月生效。'],
      ['We need to meet the deadline at all costs.', '無論如何我們都得趕上期限。'],
    ],
    tip: '空格是動詞時，先看後面的名詞，想想「這個名詞平常跟哪個動詞一起出現」。',
    quiz: [
      { q: 'The team worked overtime to ------- the deadline.', o: ['meet', 'make', 'do', 'take'], ex: 'meet a deadline = 趕上期限。' },
      { q: 'The annual conference will ------- place in Singapore.', o: ['take', 'make', 'have', 'hold'], ex: 'take place = 舉行。' },
      { q: 'Customers can ------- an order online or by phone.', o: ['place', 'make up', 'do', 'set'], ex: 'place an order = 下訂單。' },
      { q: 'The two companies finally ------- an agreement.', o: ['reached', 'arrived', 'got to do', 'made up'], ex: 'reach an agreement = 達成協議。' },
      { q: 'We will ------- a survey to measure customer satisfaction.', o: ['conduct', 'lead to', 'perform on', 'carry'], ex: 'conduct a survey = 進行調查。' },
    ],
  },
  {
    id: 'g20',
    title: '倒裝與強調句型',
    tag: 'verb',
    intro: '否定副詞放句首時要倒裝，是 Part 5 的進階題。',
    points: [
      { rule: '否定副詞放句首要倒裝', detail: 'Never have we seen such high demand.' },
      { rule: 'Not only + 倒裝, but also …', detail: 'Not only did sales rise, but costs also fell.' },
      { rule: 'Only + 時間 / 條件放句首也倒裝', detail: 'Only after the review will the plan be approved.' },
      { rule: 'So / Neither 表示「也是」', detail: 'I like the design, and so does my manager.' },
    ],
    examples: [
      ['Rarely does the CEO attend these meetings.', '執行長很少出席這些會議。'],
      ['Not only did she finish early, but she also helped others.', '她不但提早完成，還幫助了別人。'],
    ],
    tip: '句首出現 Never、Rarely、Seldom、Not only、Only after，後面要接「助動詞 + 主詞」。',
    quiz: [
      { q: 'Never ------- such a successful product launch.', o: ['have we seen', 'we have seen', 'we saw', 'seen we have'], ex: '否定副詞放句首要倒裝。' },
      { q: 'Not only ------- the price, but the company also improved the design.', o: ['did the company lower', 'the company lowered', 'lowered the company', 'does lower'], ex: 'Not only 放句首要倒裝。' },
      { q: 'Rarely ------- the director work on weekends.', o: ['does', 'do', 'is', 'has'], ex: 'Rarely + does + 主詞 + 原形動詞。' },
      { q: 'Only after the contract is signed ------- the work begin.', o: ['will', 'it will', 'is', 'does it'], ex: 'Only after… 放句首，主要子句倒裝：will the work begin。' },
      { q: 'Mr. Lee enjoyed the seminar, and so ------- his colleagues.', o: ['did', 'were', 'have', 'enjoyed'], ex: 'so + 助動詞 + 主詞 = 也是；前句過去式用 did。' },
    ],
  },
]
